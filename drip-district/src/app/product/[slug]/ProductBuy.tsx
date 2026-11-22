
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
  const [variant, setVariant] = useState(
    product.variants.find((x) => x.stock > 0)?.id || ""
  );

  const { add } = useCart();

  const v = product.variants.find((x) => x.id === variant);

  return (
    <div className="simple-form">
      <label>
        Delivery / size / colour

        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
        >
          {product.variants.map((x) => (
            <option key={x.id} value={x.id} disabled={x.stock < 1}>
              {x.region} delivery
              {x.size ? ` · ${x.size}` : ""}
              {x.colour ? ` · ${x.colour}` : ""}
              {" · "}
              £{(x.pricePence / 100).toFixed(2)}
              {" · "}
              {x.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
            </option>
          ))}
        </select>
      </label>

      <button
        className="solid-button"
        disabled={!v || v.stock < 1}
        onClick={() =>
          v &&
          add({
            id: v.id,
            title: product.title,
            price: v.pricePence,
            quantity: 1,
            delivery: v.region as "UK" | "CHINA",
          })
        }
      >
        ADD TO BAG
      </button>
    </div>
  );
}
