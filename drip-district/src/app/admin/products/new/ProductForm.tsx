
"use client";

import { useRef, useState } from "react";

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
  padding: "15px",
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

export default function ProductForm() {
  const imageInput = useRef<HTMLInputElement>(null);

  const [previews, setPreviews] = useState<string[]>([]);
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

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    const urls = files.map((file) => URL.createObjectURL(file));

    setPreviews((oldPreviews) => {
      oldPreviews.forEach((url) => URL.revokeObjectURL(url));
      return urls;
    });
  }

  function removeImage(index: number) {
    const input = imageInput.current;
    if (!input || !input.files) return;

    const transfer = new DataTransfer();

    Array.from(input.files).forEach((file, i) => {
      if (i !== index) transfer.items.add(file);
    });

    input.files = transfer.files;

    const urls = Array.from(transfer.files).map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews((oldPreviews) => {
      oldPreviews.forEach((url) => URL.revokeObjectURL(url));
      return urls;
    });
  }

  function updateVariant(
    id: number,
    field: keyof Omit<Variant, "id">,
    value: string
  ) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
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

  function updateSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  return (
    <form
      action="/api/admin/products"
      method="POST"
      encType="multipart/form-data"
      style={{
        display: "grid",
        gap: "26px",
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
            setSlug(updateSlug(event.target.value));
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
          required
        />
      </label>

      <label style={labelStyle}>
        Category
        <select
          name="category"
          required
          defaultValue="Mens Clothing"
          style={fieldStyle}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
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

      <div style={{ display: "grid", gap: "14px" }}>
        <strong>PRODUCT IMAGES</strong>

        <p className="muted">
          Select photos from your phone gallery.
        </p>

        <input
          ref={imageInput}
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          style={fieldStyle}
        />

        <p className="muted">
          {previews.length} images selected
        </p>

        {previews.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {previews.map((preview, index) => (
              <div key={preview}>
                <img
                  src={preview}
                  alt={`Product image ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                  }}
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#222",
                    color: "#fff",
                    border: 0,
                    marginTop: "5px",
                  }}
                >
                  REMOVE IMAGE
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: "18px" }}>
        <h2 style={{ fontSize: "25px", margin: 0 }}>
          PRODUCT VARIANTS
        </h2>

        <p className="muted">
          Each variant has its own size, colour, delivery, price and stock.
        </p>

        {variants.map((variant, index) => (
          <div
            key={variant.id}
            style={{
              border: "1px solid #ccc",
              padding: "18px",
              display: "grid",
              gap: "15px",
            }}
          >
            <strong>VARIANT {index + 1}</strong>

            <label style={labelStyle}>
              Size
              <input
                name="variantSize"
                value={variant.size}
                onChange={(e) =>
                  updateVariant(variant.id, "size", e.target.value)
                }
                style={fieldStyle}
                placeholder="Medium or One Size"
              />
            </label>

            <label style={labelStyle}>
              Colour
              <input
                name="variantColour"
                value={variant.colour}
                onChange={(e) =>
                  updateVariant(variant.id, "colour", e.target.value)
                }
                style={fieldStyle}
                placeholder="Black"
              />
            </label>

            <label style={labelStyle}>
              Delivery
              <select
                name="variantDelivery"
                value={variant.delivery}
                onChange={(e) =>
                  updateVariant(variant.id, "delivery", e.target.value)
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
                onChange={(e) =>
                  updateVariant(variant.id, "price", e.target.value)
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
                onChange={(e) =>
                  updateVariant(variant.id, "stock", e.target.value)
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
                background: "#eee",
                color: "#111",
                border: "1px solid #999",
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
            background: "#e8e8e8",
            color: "#111",
            border: 0,
            fontWeight: "bold",
          }}
        >
          + ADD ANOTHER VARIANT
        </button>
      </div>

      <label style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <input type="checkbox" name="featured" value="true" />
        Feature on homepage
      </label>

      <label style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <input
          type="checkbox"
          name="active"
          value="true"
          defaultChecked
        />
        Published / visible in shop
      </label>

      <button
        type="submit"
        style={{
          padding: "20px",
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
