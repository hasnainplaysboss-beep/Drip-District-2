
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

    const requestedEmail = String(body.email || "").trim().toLowerCase();
    const items = body.items;

    if (
      !requestedEmail.includes("@") ||
      !Array.isArray(items) ||
      !items.length ||
      items.length > 40
    ) {
      return NextResponse.json(
        { error: "Enter a valid email and add items to your basket." },
        { status: 400 }
      );
    }

    // Identify the logged-in customer securely.
    const customer = await getCustomerSession();

    // Use the account email for logged-in customers.
    // Guest customers can still use their checkout email.
    const email = customer ? customer.email : requestedEmail;

    const ids = items.map(
      (item: { variantId: string }) => String(item.variantId)
    );

    if (new Set(ids).size !== ids.length) {
      return NextResponse.json(
        { error: "Duplicate basket variants are not accepted." },
        { status: 400 }
      );
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: ids },
        active: true,
      },
      include: {
        product: true,
      },
    });

    if (
      variants.length !== items.length ||
      variants.some((variant) => !variant.product.active)
    ) {
      return NextResponse.json(
        { error: "One or more products are unavailable." },
        { status: 400 }
      );
    }

    const cleanItems = items.map(
      (item: { variantId: string; quantity: number }) => {
        const variant = variants.find(
          (entry) => entry.id === item.variantId
        );

        if (!variant) {
          throw new Error("Product variant not found.");
        }

        if (
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > variant.stock
        ) {
          throw new Error(
            `Insufficient stock for ${variant.product.title}.`
          );
        }

        return {
          variant,
          quantity: item.quantity,
        };
      }
    );

    const total = cleanItems.reduce(
      (sum, item) =>
        sum + item.variant.pricePence * item.quantity,
      0
    );

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const storeUrl =
      process.env.STORE_URL || new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,

      shipping_address_collection: {
        allowed_countries: ["GB"],
      },

      phone_number_collection: {
        enabled: true,
      },

      line_items: cleanItems.map((item) => ({
        price_data: {
          currency: "gbp",
          product_data: {
            name: `${item.variant.product.title} — ${item.variant.deliveryRegion} delivery`,
          },
          unit_amount: item.variant.pricePence,
        },
        quantity: item.quantity,
      })),

      success_url: `${storeUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${storeUrl}/cart`,

      metadata: {
        source: "drip-district",
        customerId: customer?.id || "",
      },
    });

    await prisma.order.create({
      data: {
        email,

        // This links logged-in customers to their orders.
        // Guest orders remain unlinked.
        userId: customer?.id || null,

        stripeSessionId: session.id,
        subtotalPence: total,
        deliveryPence: 0,
        totalPence: total,

        items: {
          create: cleanItems.map((item) => ({
            productTitle: item.variant.product.title,

            variantLabel: `${item.variant.deliveryRegion}${
              item.variant.size ? ` / ${item.variant.size}` : ""
            }${
              item.variant.colour ? ` / ${item.variant.colour}` : ""
            }`,

            quantity: item.quantity,
            unitPricePence: item.variant.pricePence,
          })),
        },
      },
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout session.",
      },
      { status: 400 }
    );
  }
}
