
"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Variant = {
  id: number;
  size: string;
  colour: string;
  delivery: string;
  price: string;
  stock: string;
};

type ExistingProduct = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  images: string[];
  featured: boolean;
  active: boolean;
  variants: {
    size: string | null;
    colour: string | null;
    deliveryRegion: string;
    pricePence: number;
    stock: number;
  }[];
};

type SelectedImage = {
  file: File;
  preview: string;
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
  padding: "14px",
  border: "1px solid #777",
  background: "#fff",
  color: "#111",
  fontSize: "16px",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "grid",
  gap: "9px",
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

function makeVariant(id: number): Variant {
  return {
    id,
    size: "",
    colour: "",
    delivery: "UK",
    price: "35",
    stock: "0",
  };
}

export default function ProductForm({
  initialProduct,
}: {
  initialProduct?: ExistingProduct;
}) {
  const router = useRouter();
  const imageInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialProduct?.title || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [category, setCategory] = useState(
    initialProduct?.category || "Mens Clothing"
  );
  const [description, setDescription] = useState(
    initialProduct?.description || ""
  );

  const [existingImages, setExistingImages] = useState<string[]>(
    initialProduct?.images || []
  );

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const [variants, setVariants] = useState<Variant[]>(
    initialProduct?.variants?.length
      ? initialProduct.variants.map((variant, index) => ({
          id: index + 1,
          size: variant.size || "",
          colour: variant.colour || "",
          delivery: variant.deliveryRegion,
          price: (variant.pricePence / 100).toFixed(2),
          stock: String(variant.stock),
        }))
      : [makeVariant(1)]
  );

  const [featured, setFeatured] = useState(
    initialProduct?.featured || false
  );
  const [active, setActive] = useState(
    initialProduct ? initialProduct.active : true
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isEditing = Boolean(initialProduct);

  async function chooseImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const remainingSlots =
      8 - existingImages.length - selectedImages.length;

    if (files.length > remainingSlots) {
      setMessage("You can add a maximum of 8 images per product.");
      event.target.value = "";
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please choose image files only.");
        event.target.value = "";
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setMessage("Each image must be smaller than 10MB.");
        event.target.value = "";
        return;
      }
    }

    try {
      const newImages = await Promise.all(
        files.map(
          (file) =>
            new Promise<SelectedImage>((resolve, reject) => {
              const reader = new FileReader();

              reader.onload = () => {
                resolve({
                  file,
                  preview: String(reader.result),
                });
              };

              reader.onerror = () => reject(new Error("Could not preview image."));
              reader.readAsDataURL(file);
            })
        )
      );

      setSelectedImages((current) => [...current, ...newImages]);
      setMessage("");
    } catch {
      setMessage("Could not preview your selected photos. Please try again.");
    }

    event.target.value = "";
  }

  function removeExistingImage(index: number) {
    setExistingImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  function removeSelectedImage(index: number) {
    setSelectedImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
  }

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
      makeVariant(Math.max(0, ...current.map((item) => item.id)) + 1),
    ]);
  }

  function removeVariant(id: number) {
    setVariants((current) =>
      current.filter((variant) => variant.id !== id)
    );
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!title.trim() || !slug.trim() || !description.trim()) {
      setMessage("Please complete the product name, slug and description.");
      return;
    }

    if (existingImages.length + selectedImages.length > 8) {
      setMessage("A product can have a maximum of 8 images.");
      return;
    }

    if (variants.length === 0) {
      setMessage("Please add at least one product variant.");
      return;
    }

    for (const variant of variants) {
      if (
        !variant.price ||
        !variant.stock ||
        !Number.isFinite(Number(variant.price)) ||
        Number(variant.price) <= 0 ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0
      ) {
        setMessage("Please check every variant's price and stock quantity.");
        return;
      }
    }

    setSaving(true);

    try {
      const form = new FormData();

      if (initialProduct?.id) {
        form.append("id", initialProduct.id);
      }

      form.append("title", title.trim());
      form.append("slug", slug.trim());
      form.append("category", category);
      form.append("description", description.trim());
      form.append("featured", String(featured));
      form.append("active", String(active));

      existingImages.forEach((url) => {
        form.append("existingImages", url);
      });

      selectedImages.forEach((image) => {
        form.append("images", image.file);
      });

      variants.forEach((variant) => {
        form.append("variantSize", variant.size);
        form.append("variantColour", variant.colour);
        form.append("variantDelivery", variant.delivery);
        form.append("variantPrice", variant.price);
        form.append("variantStock", variant.stock);
      });

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: form,
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not save the product.");
        return;
      }

      router.push(
        isEditing
          ? "/admin/products?updated=1"
          : "/admin/products?created=1"
      );

      router.refresh();
    } catch (error) {
      console.error("PRODUCT FORM ERROR:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={saveProduct}
      style={{
        display: "grid",
        gap: "24px",
        maxWidth: "750px",
        marginTop: "30px",
      }}
    >
      <label style={labelStyle}>
        Product name
        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!isEditing) {
              setSlug(makeSlug(event.target.value));
            }
          }}
          style={fieldStyle}
          placeholder="e.g. District Oversized Hoodie"
          required
        />
      </label>

      <label style={labelStyle}>
        Product URL slug
        <input
          value={slug}
          onChange={(event) => setSlug(makeSlug(event.target.value))}
          style={fieldStyle}
          placeholder="district-oversized-hoodie"
          required
        />
      </label>

      <label style={labelStyle}>
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          style={fieldStyle}
          required
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Product description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          style={fieldStyle}
          rows={5}
          placeholder="Describe your product..."
          required
        />
      </label>

      <section style={{ display: "grid", gap: "14px" }}>
        <h2 style={{ margin: 0 }}>PRODUCT PHOTOS</h2>

        <p className="muted">
          Choose photos from your phone gallery or Files. You can select
          multiple photos.
        </p>

        <input
          ref={imageInput}
          type="file"
          accept="image/*"
          multiple
          onChange={chooseImages}
          style={fieldStyle}
        />

        <p className="muted">
          {existingImages.length + selectedImages.length} of 8 photos selected
        </p>

        {existingImages.length > 0 && (
          <>
            <strong>EXISTING PHOTOS</strong>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              {existingImages.map((url, index) => (
                <div key={url}>
                  <img
                    src={url}
                    alt={`Existing product photo ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                    }}
                  >
                    REMOVE PHOTO
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedImages.length > 0 && (
          <>
            <strong>NEW PHOTOS</strong>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              {selectedImages.map((image, index) => (
                <div key={`${image.file.name}-${index}`}>
                  <img
                    src={image.preview}
                    alt={`New product photo ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectedImage(index)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                    }}
                  >
                    REMOVE PHOTO
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section style={{ display: "grid", gap: "16px" }}>
        <h2 style={{ margin: 0 }}>PRODUCT VARIANTS</h2>

        <p className="muted">
          Add each size, colour and delivery combination with its own price
          and stock quantity.
        </p>

        {variants.map((variant, index) => (
          <div
            key={variant.id}
            style={{
              border: "1px solid #777",
              padding: "18px",
              display: "grid",
              gap: "14px",
            }}
          >
            <strong>VARIANT {index + 1}</strong>

            <label style={labelStyle}>
              Size
              <input
                value={variant.size}
                onChange={(event) =>
                  updateVariant(variant.id, "size", event.target.value)
                }
                style={fieldStyle}
                placeholder="Small, Medium, UK 9 or One Size"
              />
            </label>

            <label style={labelStyle}>
              Colour
              <input
                value={variant.colour}
                onChange={(event) =>
                  updateVariant(variant.id, "colour", event.target.value)
                }
                style={fieldStyle}
                placeholder="Black, White, Grey"
              />
            </label>

            <label style={labelStyle}>
              Delivery region
              <select
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
                type="number"
                min="0.01"
                step="0.01"
                value={variant.price}
                onChange={(event) =>
                  updateVariant(variant.id, "price", event.target.value)
                }
                style={fieldStyle}
                required
              />
            </label>

            <label style={labelStyle}>
              Stock quantity
              <input
                type="number"
                min="0"
                step="1"
                value={variant.stock}
                onChange={(event) =>
                  updateVariant(variant.id, "stock", event.target.value)
                }
                style={fieldStyle}
                required
              />
            </label>

            <button
              type="button"
              onClick={() => removeVariant(variant.id)}
              disabled={variants.length === 1}
              style={{ padding: "12px" }}
            >
              REMOVE VARIANT
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          style={{ padding: "15px" }}
        >
          + ADD ANOTHER VARIANT
        </button>
      </section>

      <label style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={featured}
          onChange={(event) => setFeatured(event.target.checked)}
        />
        Feature this product on the homepage
      </label>

      <label style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
        />
        Published / visible in the shop
      </label>

      {message && (
        <p role="alert" style={{ color: "#c62828", fontWeight: "bold" }}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          padding: "19px",
          background: "#111",
          color: "#fff",
          border: 0,
          fontWeight: "bold",
          letterSpacing: "1px",
          fontSize: "16px",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving
          ? "SAVING PRODUCT..."
          : isEditing
            ? "UPDATE PRODUCT"
            : "SAVE PRODUCT"}
      </button>
    </form>
  );
}
