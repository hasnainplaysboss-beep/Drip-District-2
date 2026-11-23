

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

export async function POST(req: Request) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to review a product." },
        { status: 401 }
      );
    }

    const { productId, rating, title, body } = await req.json();

    if (
      !productId ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "Please select a rating between 1 and 5 stars." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "string" || body.trim().length < 10) {
      return NextResponse.json(
        { error: "Your review must be at least 10 characters long." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.active) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    // Only delivered orders qualify.
    const deliveredOrders = await prisma.order.findMany({
      where: {
        userId: session.id,
        status: "DELIVERED",
      },
      include: {
        items: true,
      },
    });

    const hasPurchased = deliveredOrders.some((order) =>
      order.items.some(
        (item) => item.productTitle === product.title
      )
    );

    if (!hasPurchased) {
      return NextResponse.json(
        {
          error:
            "You can only review products you have purchased and received.",
        },
        { status: 403 }
      );
    }

    const existing = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 409 }
      );
    }

    await prisma.review.create({
      data: {
        productId,
        userId: session.id,
        rating,
        title: typeof title === "string" ? title.trim() || null : null,
        body: body.trim(),
        verified: true,
        approved: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted! It will appear once approved.",
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 409 }
      );
    }

    console.error("Review submission error:", error);

    return NextResponse.json(
      { error: "Something went wrong submitting your review." },
      { status: 500 }
    );
  }
}
