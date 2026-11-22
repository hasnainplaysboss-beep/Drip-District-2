import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const paid = await prisma.order.aggregate({ where: { status: { in: ["PAID","PROCESSING","SHIPPED","DELIVERED"] } }, _sum: { totalPence: true }, _count: true });
  return NextResponse.json({ revenuePence: paid._sum.totalPence || 0, paidOrders: paid._count });
}
