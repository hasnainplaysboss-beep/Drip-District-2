
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function NewProductPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  return (
    <section className="section">
      <div className="eyebrow">DRIP DISTRICT / ADMIN</div>
      <h1 className="section-heading">ADD PRODUCT</h1>
      <p className="muted">
        Add a new product to your Drip District catalogue.
      </p>

      <form
        action="/api/admin/products"
        method="POST"
        style={{
          display: "grid",
          gap: "18px",
          maxWidth: "650px",
          marginTop: "35px",
        }}
      >
        <label>
          Product name
          <input name="title" required placeholder="e.g. District Oversized Hoodie" />
        </label>

        <label>
          Category
          <input name="category" required placeholder="e.g. Clothing" />
        </label>

        <label>
          Subcategory
          <input name="subcategory" placeholder="e.g. Hoodies" />
        </label>

        <label>
          Description
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Describe your product..."
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Image URLs
          <textarea
            name="images"
            rows={3}
            placeholder="Paste image URLs, separated by commas"
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Sizes
          <input name="sizes" placeholder="S, M, L, XL" />
        </label>

        <label>
          Colours
          <input name="colours" placeholder="Black, White, Grey" />
        </label>

        <label>
          Price (£)
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="39.99"
          />
        </label>

        <label>
          Starting stock quantity
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue="0"
            required
          />
        </label>

        <label style={{ display: "flex", gap: "10px" }}>
          <input type="checkbox" name="featured" value="true" />
          Feature this product on the shop
        </label>

        <button type="submit" style={{ padding: "16px", fontWeight: "bold" }}>
          SAVE PRODUCT
        </button>
      </form>
    </section>
  );
}
