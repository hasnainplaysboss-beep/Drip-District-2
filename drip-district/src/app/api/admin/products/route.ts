import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({ include: { variants: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ products });
}
export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    if (!b.title || !b.slug || !b.description || !b.category || !Array.isArray(b.variants) || !b.variants.length)
      return NextResponse.json({ error: "Title, slug, description, category and at least one delivery/stock variant are required." }, { status: 400 });
    const product = await prisma.product.create({ data: {
      title: String(b.title), slug: String(b.slug).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      description: String(b.description), category: String(b.category), subcategory: b.subcategory ? String(b.subcategory) : null,
      images: Array.isArray(b.images) ? b.images.map(String) : [], colours: Array.isArray(b.colours) ? b.colours.map(String) : [],
      sizes: Array.isArray(b.sizes) ? b.sizes.map(String) : [],
      variants: { create: b.variants.map((v: any) => ({
        deliveryRegion: v.deliveryRegion === "CHINA" ? "CHINA" : "UK",
        pricePence: Math.round(Number(v.price) * 100), stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
        size: v.size || null, colour: v.colour || null
      })) }
    }, include: { variants: true } });
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not create product." }, { status: 400 });
  }
}
