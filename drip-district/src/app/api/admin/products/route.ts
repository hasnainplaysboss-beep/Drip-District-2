
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

function uploadImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "drip-district/products",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Image upload failed"));
            return;
          }

          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url),
        303
      );
    }

    const form = await request.formData();

    const title = String(form.get("title") || "").trim();
    const slugInput = String(form.get("slug") || "").trim();
    const category = String(form.get("category") || "").trim();
    const description = String(form.get("description") || "").trim();

    const allowedCategories = [
      "Mens Clothing",
      "Womens Clothing",
      "Electronics",
      "Mens Accessories",
      "Womens Accessories",
    ];

    if (
      !title ||
      !slugInput ||
      !allowedCategories.includes(category) ||
      !description
    ) {
      return NextResponse.redirect(
        new URL("/admin/products/new?error=invalid", request.url),
        303
      );
    }

    const slug = slugInput
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) {
      return NextResponse.redirect(
        new URL("/admin/products/new?error=invalid", request.url),
        303
      );
    }

    const existing = await prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.redirect(
        new URL("/admin/products/new?error=slug-exists", request.url),
        303
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
      return NextResponse.redirect(
        new URL("/admin/products/new?error=variants", request.url),
        303
      );
    }

    const variants = [];

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
        return NextResponse.redirect(
          new URL("/admin/products/new?error=variants", request.url),
          303
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

    const imageFiles = form
      .getAll("images")
      .filter(
        (item): item is File =>
          item instanceof File && item.size > 0
      );

    if (imageFiles.length > 8) {
      return NextResponse.redirect(
        new URL("/admin/products/new?error=too-many-images", request.url),
        303
      );
    }

    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      if (
        !file.type.startsWith("image/") ||
        file.size > 10 * 1024 * 1024
      ) {
        return NextResponse.redirect(
          new URL("/admin/products/new?error=invalid-image", request.url),
          303
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const imageUrl = await uploadImage(buffer);
      imageUrls.push(imageUrl);
    }

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

    await prisma.product.create({
      data: {
        title,
        slug,
        category,
        description,
        images: imageUrls,
        sizes: uniqueSizes,
        colours: uniqueColours,
        featured: form.get("featured") === "true",
        active: form.get("active") === "true",
        variants: {
          create: variants,
        },
      },
    });

    return NextResponse.redirect(
      new URL("/admin/products?created=1", request.url),
      303
    );
  } catch (error) {
    console.error("Product creation error:", error);

    return NextResponse.redirect(
      new URL("/admin/products/new?error=server", request.url),
      303
    );
  }
}
