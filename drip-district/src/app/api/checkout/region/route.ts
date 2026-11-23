import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ids = body.variantIds;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ region: null, error: "Empty basket" });
    }

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: ids }, active: true },
      select: {
        id: true,
        deliveryRegion: true,
        product: { select: { active: true } },
      },
    });

    if (
      variants.length !== ids.length ||
      variants.some((v) => !v.product.active)
    ) {
      return NextResponse.json(
        { region: null, error: "Some products are unavailable." },
        { status: 400 }
      );
    }

    const regions = Array.from(new Set(variants.map((v) => v.deliveryRegion)));

    if (regions.length !== 1) {
      return NextResponse.json({ region: "MIXED" });
    }

    return NextResponse.json({ region: regions[0] });
  } catch {
    return NextResponse.json(
      { error: "Unable to detect delivery region." },
      { status: 500 }
    );
  }
}
