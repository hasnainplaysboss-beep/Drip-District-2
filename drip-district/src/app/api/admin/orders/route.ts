import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ orders });
}
export async function PATCH(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.id || !["PROCESSING","SHIPPED","DELIVERED","CANCELLED"].includes(b.status))
    return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
  try {
    const order = await prisma.order.update({ where: { id: String(b.id) }, data: {
      status: b.status, trackingNumber: b.trackingNumber ? String(b.trackingNumber) : undefined,
      trackingCarrier: b.trackingCarrier ? String(b.trackingCarrier) : undefined
    }});
    return NextResponse.json({ order });
  } catch { return NextResponse.json({ error: "Order not found." }, { status: 404 }); }
}
