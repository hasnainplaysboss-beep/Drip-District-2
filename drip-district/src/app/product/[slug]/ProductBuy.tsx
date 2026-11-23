
"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

type Variant = {
  id: string;
  pricePence: number;
  region: string;
  stock: number;
  size: string | null;
  colour: string | null;
};

export default function ProductBuy({
  product,
}: {
  product: {
    id: string;
    title: string;
    variants: Variant[];
  };
}) {
  const availableVariants = product.variants.filter(
    (x) => x.stock > 0
  );

  const [variant, setVariant] = useState(
    availableVariants[0]?.id || ""
  );

  const { add } = useCart();

  const v = availableVariants.find((x) => x.id === variant);

  if (product.variants.length === 0) {
    return (
      <div className="simple-form">
        <p>This product is currently unavailable.</p>
        <button className="solid-button" disabled>
          OUT OF STOCK
        </button>
      </div>
    );
  }

  if (availableVariants.length === 0) {
    return (
      <div className="simple-form">
        <p>All options are currently out of stock.</p>
        <button className="solid-button" disabled>
          OUT OF STOCK
        </button>
      </div>
    );
  }

  return (
    <div className="simple-form">
      <label>
        Delivery / size / colour

        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
        >
          {availableVariants.map((x) => (
            <option key={x.id} value={x.id}>
              {x.region} delivery
              {x.size ? ` · ${x.size}` : ""}
              {x.colour ? ` · ${x.colour}` : ""}
              {" · "}
              £{(x.pricePence / 100).toFixed(2)}
              {" · IN STOCK"}
            </option>
          ))}
        </select>
      </label>

      <button
        className="solid-button"
        disabled={!v}
        onClick={() => {
          if (!v) return;

          add({
            id: v.id,
            title: product.title,
            price: v.pricePence,
            quantity: 1,
            delivery: v.region as "UK" | "CHINA",
          });
        }}
      >
        ADD TO BAG
      </button>
    </div>
  );
}
