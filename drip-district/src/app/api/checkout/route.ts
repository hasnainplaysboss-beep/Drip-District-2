import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Payments are not configured. Add STRIPE_SECRET_KEY in Vercel." }, { status: 503 });
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const items = body.items;
    if (!email.includes("@") || !Array.isArray(items) || !items.length || items.length > 40) return NextResponse.json({ error: "Enter a valid email and add items to your basket." }, { status: 400 });
    const ids = items.map((x: { variantId: string }) => String(x.variantId));
    if (new Set(ids).size !== ids.length) return NextResponse.json({ error: "Duplicate basket variants are not accepted." }, { status: 400 });
    const variants = await prisma.productVariant.findMany({ where: { id: { in: ids }, active: true }, include: { product: true } });
    if (variants.length !== items.length || variants.some(v => !v.product.active)) return NextResponse.json({ error: "One or more products are unavailable." }, { status: 400 });
    const cleanItems = items.map((item: { variantId: string; quantity: number }) => {
      const v = variants.find(x => x.id === item.variantId)!;
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > v.stock) throw new Error(`Insufficient stock for ${v.product.title}.`);
      return { variant: v, quantity: item.quantity };
    });
    const total = cleanItems.reduce((sum, x) => sum + x.variant.pricePence * x.quantity, 0);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const storeUrl = process.env.STORE_URL || new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment", customer_email: email,
      line_items: cleanItems.map(x => ({ price_data: { currency: "gbp", product_data: { name: `${x.variant.product.title} — ${x.variant.deliveryRegion} delivery` }, unit_amount: x.variant.pricePence }, quantity: x.quantity })),
      success_url: `${storeUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${storeUrl}/cart`,
      metadata: { source: "drip-district" }
    });
    await prisma.order.create({
      data: {
        email, stripeSessionId: session.id, subtotalPence: total, deliveryPence: 0, totalPence: total,
        items: { create: cleanItems.map(x => ({ productTitle: x.variant.product.title, variantLabel: `${x.variant.deliveryRegion}${x.variant.size ? ` / ${x.variant.size}` : ""}${x.variant.colour ? ` / ${x.variant.colour}` : ""}`, quantity: x.quantity, unitPricePence: x.variant.pricePence })) }
      }
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to create checkout session." }, { status: 400 });
  }
}
