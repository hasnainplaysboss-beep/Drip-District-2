

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payments are not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const customer = await getCustomerSession();
    const email = customer
      ? customer.email
      : String(body.email || "").trim().toLowerCase();

    const items = body.items;
    const deliveryOption = body.deliveryOption;

    if (!email.includes("@") || !Array.isArray(items) || !items.length || items.length > 40) {
      return NextResponse.json(
        { error: "Enter a valid email and add items to your basket." },
        { status: 400 }
      );
    }

    if (!["STANDARD", "NEXT_DAY", "CHINA"].includes(deliveryOption)) {
      return NextResponse.json(
        { error: "Please select a delivery option." },
        { status: 400 }
      );
    }

    const ids = items.map((x: { variantId: string }) => String(x.variantId));

    if (new Set(ids).size !== ids.length) {
      return NextResponse.json(
        { error: "Duplicate basket variants are not accepted." },
        { status: 400 }
      );
    }

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: ids }, active: true },
      include: { product: true },
    });

    if (variants.length !== items.length || variants.some((v) => !v.product.active)) {
      return NextResponse.json(
        { error: "One or more products are unavailable." },
        { status: 400 }
      );
    }

    const expectedRegion = deliveryOption === "CHINA" ? "CHINA" : "UK";

    if (variants.some((v) => v.deliveryRegion !== expectedRegion)) {
      return NextResponse.json(
        {
          error:
            deliveryOption === "CHINA"
              ? "Your basket contains UK-delivery products. Please select UK delivery."
              : "Your basket contains China-delivery products. Please select China Shipping.",
        },
        { status: 400 }
      );
    }

    const cleanItems = items.map(
      (item: { variantId: string; quantity: number }) => {
        const v = variants.find((x) => x.id === item.variantId);

        if (!v) throw new Error("Product variant not found.");

        if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > v.stock) {
          throw new Error(`Insufficient stock for ${v.product.title}.`);
        }

        return { variant: v, quantity: item.quantity };
      }
    );

    const subtotal = cleanItems.reduce(
      (sum, x) => sum + x.variant.pricePence * x.quantity,
      0
    );

    const deliveryPence =
      deliveryOption === "CHINA"
        ? 0
        : deliveryOption === "NEXT_DAY"
          ? 499
          : subtotal >= 7500
            ? 0
            : 399;

    const total = subtotal + deliveryPence;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const storeUrl = process.env.STORE_URL || new URL(req.url).origin;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cleanItems.map((x) => ({
        price_data: {
          currency: "gbp",
          product_data: {
            name: `${x.variant.product.title} — ${x.variant.deliveryRegion} delivery`,
          },
          unit_amount: x.variant.pricePence,
        },
        quantity: x.quantity,
      }));

    const deliveryName =
      deliveryOption === "CHINA"
        ? "China Shipping (FREE · 2–3 weeks)"
        : deliveryOption === "NEXT_DAY"
          ? "UK Next Day Delivery"
          : "UK Standard Delivery (2–5 working days)";

    lineItems.push({
      price_data: {
        currency: "gbp",
        product_data: { name: deliveryName },
        unit_amount: deliveryPence,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      shipping_address_collection: { allowed_countries: ["GB"] },
      phone_number_collection: { enabled: true },
      line_items: lineItems,
      success_url: `${storeUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${storeUrl}/cart`,
      metadata: {
        source: "drip-district",
        customerId: customer?.id || "",
        deliveryOption,
        deliveryPence: String(deliveryPence),
      },
    });

    await prisma.order.create({
      data: {
        userId: customer?.id || null,
        email,
        stripeSessionId: session.id,
        subtotalPence: subtotal,
        deliveryPence,
        totalPence: total,
        items: {
          create: cleanItems.map((x) => ({
            productTitle: x.variant.product.title,
            variantLabel: `${x.variant.deliveryRegion}${x.variant.size ? ` / ${x.variant.size}` : ""}${x.variant.colour ? ` / ${x.variant.colour}` : ""}`,
            quantity: x.quantity,
            unitPricePence: x.variant.pricePence,
          })),
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unable to create checkout session." },
      { status: 400 }
    );
  }
}
