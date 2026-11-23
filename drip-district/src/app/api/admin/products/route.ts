

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedCategories = [
  "Mens Clothing",
  "Womens Clothing",
  "Electronics",
  "Mens Accessories",
  "Womens Accessories",
];

type ProductVariantInput = {
  size: string | null;
  colour: string | null;
  deliveryRegion: "UK" | "CHINA";
  pricePence: number;
  stock: number;
};

async function uploadImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "drip-district/products",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result?.secure_url) {
            reject(new Error("Cloudinary did not return an image URL."));
            return;
          }

          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 401 }
      );
    }

    const form = await request.formData();

    const id = String(form.get("id") || "").trim();
    const title = String(form.get("title") || "").trim();
    const slug = slugify(String(form.get("slug") || title));
    const category = String(form.get("category") || "").trim();
    const description = String(form.get("description") || "").trim();

    if (
      !title ||
      !slug ||
      !allowedCategories.includes(category) ||
      !description
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete the product name, slug, category and description.",
        },
        { status: 400 }
      );
    }

    const existingProduct = id
      ? await prisma.product.findUnique({ where: { id } })
      : null;

    if (id && !existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const slugOwner = await prisma.product.findUnique({
      where: { slug },
    });

    if (slugOwner && slugOwner.id !== id) {
      return NextResponse.json(
        { error: "That product URL slug is already in use." },
        { status: 409 }
      );
    }

    const sizes = form.getAll("variantSize").map(String);
    const colours = form.getAll("variantColour").map(String);
    const deliveries = form.getAll("variantDelivery").map(String);
    const prices = form.getAll("variantPrice").map(String);
    const stocks = form.getAll("variantStock").map(String);

    const count = sizes.length;

    if (
      count === 0 ||
      colours.length !== count ||
      deliveries.length !== count ||
      prices.length !== count ||
      stocks.length !== count
    ) {
      return NextResponse.json(
        { error: "Please add at least one complete product variant." },
        { status: 400 }
      );
    }

    const variants: ProductVariantInput[] = [];

    for (let i = 0; i < count; i++) {
      const price = Number(prices[i]);
      const stock = Number(stocks[i]);
      const delivery = deliveries[i];

      if (
        !Number.isFinite(price) ||
        price <= 0 ||
        !Number.isInteger(stock) ||
        stock < 0 ||
        !["UK", "CHINA"].includes(delivery)
      ) {
        return NextResponse.json(
          {
            error:
              "Check your variant prices, stock and delivery regions.",
          },
          { status: 400 }
        );
      }

      variants.push({
        size: sizes[i].trim() || null,
        colour: colours[i].trim() || null,
        deliveryRegion: delivery as "UK" | "CHINA",
        pricePence: Math.round(price * 100),
        stock,
      });
    }

    const existingImages = form
      .getAll("existingImages")
      .map(String);

    const keptImages = existingProduct
      ? existingImages.filter((url) =>
          existingProduct.images.includes(url)
        )
      : [];

    const imageFiles = form
      .getAll("images")
      .filter(
        (item): item is File =>
          item instanceof File && item.size > 0
      );

    if (keptImages.length + imageFiles.length > 8) {
      return NextResponse.json(
        { error: "A product can have a maximum of 8 images." },
        { status: 400 }
      );
    }

    for (const file of imageFiles) {
      if (
        !file.type.startsWith("image/") ||
        file.size > 10 * 1024 * 1024
      ) {
        return NextResponse.json(
          {
            error:
              "Each image must be an image file smaller than 10MB.",
          },
          { status: 400 }
        );
      }
    }

    if (imageFiles.length > 0) {
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return NextResponse.json(
          {
            error:
              "Cloudinary settings are missing. Check your Vercel environment variables.",
          },
          { status: 500 }
        );
      }
    }

    const newImageUrls: string[] = [];

    for (const file of imageFiles) {
      const imageUrl = await uploadImage(file);
      newImageUrls.push(imageUrl);
    }

    const images = [...keptImages, ...newImageUrls];

    const uniqueSizes = [
      ...new Set(
        variants.map((variant) => variant.size).filter(Boolean)
      ),
    ] as string[];

    const uniqueColours = [
      ...new Set(
        variants.map((variant) => variant.colour).filter(Boolean)
      ),
    ] as string[];

    const productData = {
      title,
      slug,
      category,
      description,
      images,
      sizes: uniqueSizes,
      colours: uniqueColours,
      featured: form.get("featured") === "true",
      active: form.get("active") === "true",
    };

    const product = await prisma.$transaction(async (tx) => {
      let savedProduct;

      if (existingProduct) {
        savedProduct = await tx.product.update({
          where: { id },
          data: productData,
        });
      } else {
        savedProduct = await tx.product.create({
          data: productData,
        });
      }

      const savedVariants = await tx.productVariant.findMany({
        where: { productId: savedProduct.id },
      });

      for (const incoming of variants) {
        const matchingVariant = savedVariants.find(
          (old) =>
            old.size === incoming.size &&
            old.colour === incoming.colour &&
            old.deliveryRegion === incoming.deliveryRegion
        );

        if (matchingVariant) {
          await tx.productVariant.update({
            where: { id: matchingVariant.id },
            data: {
              pricePence: incoming.pricePence,
              stock: incoming.stock,
              active: true,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: savedProduct.id,
              ...incoming,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id: savedProduct.id },
        include: { variants: true },
      });
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("PRODUCT SAVE ERROR:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown server error.";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id = String(body.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PRODUCT DELETE ERROR:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown server error.";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
