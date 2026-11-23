import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const customer = await getCustomerSession();

    if (!customer) {
      return NextResponse.json(
        { error: "Please sign in to leave a review." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const productId = String(body.productId || "");
    const rating = Number(body.rating);
    const title = String(body.title || "").trim();
    const reviewBody = String(body.body || "").trim();

    if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Please select a product and a rating between 1 and 5 stars." },
        { status: 400 }
      );
    }

    if (!reviewBody || reviewBody.length < 10 || reviewBody.length > 2000) {
      return NextResponse.json(
        { error: "Your review must be between 10 and 2000 characters." },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "Your review title must be 100 characters or fewer." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, active: true },
    });

    if (!product || !product.active) {
      return NextResponse.json(
        { error: "This product is unavailable." },
        { status: 404 }
      );
    }

    // Only customers with an order for this product that has progressed
    // beyond pending payment may submit a verified purchase review.
    const orders = await prisma.order.findMany({
      where: {
        userId: customer.id,
        status: {
          in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      include: { items: true },
    });

    const purchased = orders.some((order) =>
      order.items.some((item) => item.productTitle === product.title)
    );

    if (!purchased) {
      return NextResponse.json(
        { error: "You must purchase this product before reviewing it." },
        { status: 403 }
      );
    }

    const existing = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: customer.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: customer.id,
        rating,
        title: title || null,
        body: reviewBody,
        verified: true,
        approved: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your review has been submitted for approval.",
        reviewId: review.id,
      },
      { status: 201 }
    );
  } catch (e) {
    if (
      e instanceof Error &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Unable to submit your review right now." },
      { status: 500 }
    );
  }
}
