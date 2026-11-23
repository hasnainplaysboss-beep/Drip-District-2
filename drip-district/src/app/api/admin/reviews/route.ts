
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { approved: false },
      include: {
        product: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Admin reviews error:", error);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reviewId, action } = await req.json();

    if (!reviewId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { approved: true },
      });
    } else {
      await prisma.review.delete({
        where: { id: reviewId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review moderation error:", error);
    return NextResponse.json(
      { error: "Failed to moderate review" },
      { status: 500 }
    );
  }
}
