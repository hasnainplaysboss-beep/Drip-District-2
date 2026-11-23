"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatGBP } from "@/lib/money";

type DeliveryOption = "STANDARD" | "NEXT_DAY" | "CHINA";

export default function Checkout() {
  const { items } = useCart();
  const [email, setEmail] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("STANDARD");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const freeStandardDelivery = subtotal >= 7500;

  const deliveryCost =
    deliveryOption === "CHINA"
      ? 0
      : deliveryOption === "NEXT_DAY"
        ? 499
        : freeStandardDelivery
          ? 0
          : 399;

  const total = subtotal + deliveryCost;

  async function pay() {
    setMessage("");

    if (!email.trim() || !email.includes("@")) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!items.length) {
      setMessage("Your basket is empty.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          deliveryOption,
          items: items.map((i) => ({
            variantId: i.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start checkout.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout link was not returned.");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="page-intro">
        <div className="eyebrow">DRIP DISTRICT</div>
        <h1>CHECKOUT</h1>
      </div>

      <div className="simple-card" style={{ maxWidth: 700, margin: "0 auto" }}>
        <label htmlFor="checkout-email">Email address</label>
        <input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{ width: "100%", margin: "12px 0 24px", padding: 12 }}
        />

        <h2>Delivery method</h2>

        <div style={{ display: "grid", gap: 12, margin: "20px 0" }}>
          <label
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              border: "1px solid #ccc",
              padding: 16,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="delivery"
              value="STANDARD"
              checked={deliveryOption === "STANDARD"}
              onChange={() => setDeliveryOption("STANDARD")}
            />
            <span>
              <strong>UK Standard Delivery</strong>
              <br />
              <small>2–5 working days</small>
              <br />
              <small>
                {freeStandardDelivery
                  ? "FREE on orders £75+"
                  : "£3.99 · Free on orders £75+"}
              </small>
            </span>
          </label>

          <label
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              border: "1px solid #ccc",
              padding: 16,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="delivery"
              value="NEXT_DAY"
              checked={deliveryOption === "NEXT_DAY"}
              onChange={() => setDeliveryOption("NEXT_DAY")}
            />
            <span>
              <strong>UK Next Day Delivery</strong>
              <br />
              <small>Next working day</small>
              <br />
              <small>£4.99</small>
            </span>
          </label>

          <label
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              border: "1px solid #ccc",
              padding: 16,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="delivery"
              value="CHINA"
              checked={deliveryOption === "CHINA"}
              onChange={() => setDeliveryOption("CHINA")}
            />
            <span>
              <strong>China Shipping</strong>
              <br />
              <small>Estimated delivery: 2–3 weeks</small>
              <br />
              <strong>FREE</strong>
            </span>
          </label>
        </div>

        <div style={{ borderTop: "1px solid #ccc", paddingTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span>Subtotal</span>
            <span>{formatGBP(subtotal)}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span>Delivery</span>
            <span>{deliveryCost === 0 ? "FREE" : formatGBP(deliveryCost)}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 20,
              fontWeight: "bold",
              borderTop: "1px solid #ccc",
              paddingTop: 16,
              marginTop: 16,
            }}
          >
            <span>Total</span>
            <span>{formatGBP(total)}</span>
          </div>
        </div>

        {message && (
          <p style={{ color: "red", marginTop: 16 }}>{message}</p>
        )}

        <button
          onClick={pay}
          disabled={busy || !items.length}
          style={{ width: "100%", marginTop: 24 }}
        >
          {busy ? "Redirecting..." : "Proceed to payment"}
        </button>
      </div>
    </section>
  );
}
