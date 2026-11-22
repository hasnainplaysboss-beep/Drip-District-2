
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const category = String(form.get("category") || "").trim();
    const subcategory = String(form.get("subcategory") || "").trim();
    const description = String(form.get("description") || "").trim();

    const price = Number(form.get("price"));
    const stock = Number(form.get("stock"));

    const sizes = String(form.get("sizes") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const colours = String(form.get("colours") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const images = String(form.get("images") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const featured = form.get("featured") === "true";

    if (
      !title ||
      !category ||
      !description ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.redirect(
        new URL("/admin/products/new?error=invalid", request.url),
        303
      );
    }

    let slug = title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const productSizes = sizes.length ? sizes : [null];
    const productColours = colours.length ? colours : [null];

    const variants = [];

    for (const size of productSizes) {
      for (const colour of productColours) {
        for (const region of ["UK", "CHINA"] as const) {
          variants.push({
            size,
            colour,
            deliveryRegion: region,
            pricePence: Math.round(price * 100),
            stock,
          });
        }
      }
    }

    await prisma.product.create({
      data: {
        title,
        slug,
        category,
        subcategory: subcategory || null,
        description,
        images,
        sizes,
        colours,
        featured,
        active: true,
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
