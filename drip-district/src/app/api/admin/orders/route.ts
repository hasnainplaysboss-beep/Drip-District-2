
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

export const runtime = "nodejs";

const allowedStatuses: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export async function PATCH(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "You are not authorised." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const orderId = String(body.orderId || "");
    const status = String(body.status || "");
    const trackingCarrier = String(body.trackingCarrier || "").trim();
    const trackingNumber = String(body.trackingNumber || "").trim();

    if (!orderId || !allowedStatuses.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: "Invalid order or status." },
        { status: 400 }
      );
    }

    if (trackingCarrier.length > 100 || trackingNumber.length > 200) {
      return NextResponse.json(
        { error: "Tracking details are too long." },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status as OrderStatus,
        trackingCarrier: trackingCarrier || null,
        trackingNumber: trackingNumber || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order update error:", error);

    return NextResponse.json(
      { error: "Unable to update this order." },
      { status: 500 }
    );
  }
}
