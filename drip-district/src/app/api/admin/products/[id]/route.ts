import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const b = await req.json();
  try {
    const product = await prisma.product.update({ where: { id }, data: {
      ...(b.title !== undefined ? { title: String(b.title) } : {}),
      ...(b.description !== undefined ? { description: String(b.description) } : {}),
      ...(b.category !== undefined ? { category: String(b.category) } : {}),
      ...(b.active !== undefined ? { active: Boolean(b.active) } : {}),
      ...(b.featured !== undefined ? { featured: Boolean(b.featured) } : {})
    }});
    return NextResponse.json({ product });
  } catch { return NextResponse.json({ error: "Product not found or update invalid." }, { status: 404 }); }
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try { await prisma.product.update({ where: { id }, data: { active: false } }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Product not found." }, { status: 404 }); }
}
