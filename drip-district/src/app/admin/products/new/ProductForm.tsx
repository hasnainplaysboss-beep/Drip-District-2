
"use client";

import { useState } from "react";

type Variant = {
  id: number;
  size: string;
  colour: string;
  delivery: string;
  price: string;
  stock: string;
};

const categories = [
  "Mens Clothing",
  "Womens Clothing",
  "Electronics",
  "Mens Accessories",
  "Womens Accessories",
];

const fieldStyle = {
  width: "100%",
  padding: "16px",
  border: "1px solid #ccc",
  background: "#fff",
  color: "#111",
  fontSize: "16px",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "grid",
  gap: "10px",
  fontWeight: 600,
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ProductForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
    {
      id: 1,
      size: "",
      colour: "",
      delivery: "UK",
      price: "",
      stock: "0",
    },
  ]);

  function updateVariant(
    id: number,
    field: keyof Omit<Variant, "id">,
    value: string
  ) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id
          ? { ...variant, [field]: value }
          : variant
      )
    );
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
        size: "",
        colour: "",
        delivery: "UK",
        price: "",
        stock: "0",
      },
    ]);
  }

  function removeVariant(id: number) {
    setVariants((current) =>
      current.filter((variant) => variant.id !== id)
    );
  }

  return (
    <form
      action="/api/admin/products"
      method="POST"
      style={{
        display: "grid",
        gap: "28px",
        maxWidth: "750px",
        marginTop: "35px",
      }}
    >
      <label style={labelStyle}>
        Product name
        <input
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setSlug(makeSlug(event.target.value));
          }}
          style={fieldStyle}
          placeholder="e.g. District Oversized Hoodie"
          required
        />
      </label>

      <label style={labelStyle}>
        URL slug
        <input
          name="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          style={fieldStyle}
          placeholder="district-oversized-hoodie"
          required
        />
      </label>

      <label style={labelStyle}>
        Category
        <select name="category" required defaultValue="Mens Clothing" style={fieldStyle}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Subcategory
        <input
          name="subcategory"
          style={fieldStyle}
          placeholder="e.g. Hoodies, Trainers, Watches"
        />
      </label>

      <label style={labelStyle}>
        Description
        <textarea
          name="description"
          required
          rows={5}
          style={fieldStyle}
          placeholder="Describe your product..."
        />
      </label>

      <label style={labelStyle}>
        Product images — paste image URLs
        <textarea
          name="images"
          rows={4}
          style={fieldStyle}
          placeholder={"One secure image URL per line"}
        />
      </label>

      <div style={{ display: "grid", gap: "18px" }}>
        <h2 style={{ fontSize: "25px", margin: 0 }}>
          Product variants
        </h2>

        <p className="muted">
          Add a size, colour, delivery region, price and stock
          quantity for each variant.
        </p>

        {variants.map((variant, index) => (
          <div
            key={variant.id}
            style={{
              border: "1px solid #ccc",
              padding: "18px",
              display: "grid",
              gap: "16px",
            }}
          >
            <strong>VARIANT {index + 1}</strong>

            <label style={labelStyle}>
              Size
              <input
                name="variantSize"
                value={variant.size}
                onChange={(event) =>
                  updateVariant(variant.id, "size", event.target.value)
                }
                style={fieldStyle}
                placeholder="e.g. Medium or One Size"
              />
            </label>

            <label style={labelStyle}>
              Colour
              <input
                name="variantColour"
                value={variant.colour}
                onChange={(event) =>
                  updateVariant(variant.id, "colour", event.target.value)
                }
                style={fieldStyle}
                placeholder="e.g. Black"
              />
            </label>

            <label style={labelStyle}>
              Delivery
              <select
                name="variantDelivery"
                value={variant.delivery}
                onChange={(event) =>
                  updateVariant(variant.id, "delivery", event.target.value)
                }
                style={fieldStyle}
              >
                <option value="UK">UK</option>
                <option value="CHINA">China</option>
              </select>
            </label>

            <label style={labelStyle}>
              Price (£)
              <input
                name="variantPrice"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={variant.price}
                onChange={(event) =>
                  updateVariant(variant.id, "price", event.target.value)
                }
                style={fieldStyle}
                placeholder="39.99"
              />
            </label>

            <label style={labelStyle}>
              Stock quantity
              <input
                name="variantStock"
                type="number"
                min="0"
                step="1"
                required
                value={variant.stock}
                onChange={(event) =>
                  updateVariant(variant.id, "stock", event.target.value)
                }
                style={fieldStyle}
              />
            </label>

            <button
              type="button"
              onClick={() => removeVariant(variant.id)}
              disabled={variants.length === 1}
              style={{
                padding: "13px",
                border: "1px solid #999",
                background: "#eee",
                color: "#111",
                opacity: variants.length === 1 ? 0.4 : 1,
              }}
            >
              REMOVE VARIANT
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          style={{
            padding: "18px",
            border: "0",
            background: "#e8e8e8",
            color: "#111",
            fontWeight: "bold",
          }}
        >
          + ADD ANOTHER VARIANT
        </button>
      </div>

      <label style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <input
          type="checkbox"
          name="featured"
          value="true"
          style={{ width: "22px", height: "22px" }}
        />
        Feature on homepage
      </label>

      <label style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <input
          type="checkbox"
          name="active"
          value="true"
          defaultChecked
          style={{ width: "22px", height: "22px" }}
        />
        Published / visible in shop
      </label>

      <button
        type="submit"
        style={{
          width: "100%",
          padding: "22px",
          background: "#111",
          color: "#fff",
          border: 0,
          fontWeight: "bold",
          letterSpacing: "2px",
          fontSize: "16px",
        }}
      >
        SAVE PRODUCT
      </button>
    </form>
  );
}
