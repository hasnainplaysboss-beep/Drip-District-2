
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import ProductForm from "./ProductForm";

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

      <ProductForm />
    </section>
  );
}
