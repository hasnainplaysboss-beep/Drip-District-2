


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorised" },
        { status: 401 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        approved: false,
      },
      include: {
        product: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Admin reviews GET error:", error);

    return NextResponse.json(
      { error: "Unable to load reviews." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorised" },
        { status: 401 }
      );
    }

    const { reviewId, action } = await req.json();

    if (
      !reviewId ||
      !["approve", "reject"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Invalid review action." },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found." },
        { status: 404 }
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

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Review approved."
          : "Review rejected and deleted.",
    });
  } catch (error) {
    console.error("Admin reviews PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to moderate review." },
      { status: 500 }
    );
  }
}
