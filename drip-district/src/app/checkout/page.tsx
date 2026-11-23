
"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatGBP } from "@/lib/money";

type DeliveryOption = "STANDARD" | "NEXT_DAY";

export default function Checkout() {
  const { items } = useCart();
  const [email, setEmail] = useState("");
  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("STANDARD");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const subtotal = items.reduce(
    (n, i) => n + i.price * i.quantity,
    0
  );

  const freeStandardDelivery = subtotal >= 7500;

  const deliveryCost =
    deliveryOption === "NEXT_DAY"
      ? 499
      : freeStandardDelivery
        ? 0
        : 399;

  const total = subtotal + deliveryCost;

  async function pay() {
    setBusy(true);
    setMessage("");

    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          deliveryOption,
          items: items.map((i) => ({
            variantId: i.id,
            quantity: i.quantity,
          })),
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || "Checkout unavailable");
      }

      if (d.url) {
        window.location.href = d.url;
      } else {
        throw new Error("Payment session was not created.");
      }
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Unable to start checkout."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="eyebrow">SECURE CHECKOUT</div>
      <h1 className="section-heading">CHECKOUT</h1>

      <div className="simple-form">
        <label>
          Email for order updates
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>

        <h2>DELIVERY OPTIONS</h2>

        <label
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="delivery"
            checked={deliveryOption === "STANDARD"}
            onChange={() => setDeliveryOption("STANDARD")}
          />

          <span>
            <strong>Standard Delivery</strong>
            <br />
            <small>2–5 working days</small>
            <br />
            <strong>
              {freeStandardDelivery
                ? "FREE"
                : formatGBP(399)}
            </strong>
            {freeStandardDelivery && (
              <small>
                {" "} · Free delivery on orders £75+
              </small>
            )}
          </span>
        </label>

        <label
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="delivery"
            checked={deliveryOption === "NEXT_DAY"}
            onChange={() => setDeliveryOption("NEXT_DAY")}
          />

          <span>
            <strong>Next Day Delivery</strong>
            <br />
            <small>Next working day</small>
            <br />
            <strong>{formatGBP(499)}</strong>
          </span>
        </label>

        <div
          style={{
            borderTop: "1px solid #ddd",
            paddingTop: "16px",
            marginTop: "16px",
          }}
        >
          <p>
            <strong>Subtotal:</strong>{" "}
            {formatGBP(subtotal)}
          </p>

          <p>
            <strong>Delivery:</strong>{" "}
            {deliveryCost === 0
              ? "FREE"
              : formatGBP(deliveryCost)}
          </p>

          <h3>
            TOTAL: {formatGBP(total)}
          </h3>
        </div>

        <button
          className="solid-button"
          disabled={!items.length || !email.includes("@") || busy}
          onClick={() => void pay()}
        >
          {busy ? "PLEASE WAIT" : "CONTINUE TO SECURE PAYMENT"}
        </button>

        {message && <p role="alert">{message}</p>}

        <small className="muted">
          Secure payments powered by Stripe.
        </small>
      </div>
    </section>
  );
}
