
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../new/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      description: true,
      images: true,
      featured: true,
      active: true,
      variants: {
        orderBy: {
          pricePence: "asc",
        },
        select: {
          size: true,
          colour: true,
          deliveryRegion: true,
          pricePence: true,
          stock: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <section className="section">
      <div className="eyebrow">DRIP DISTRICT / ADMIN</div>

      <h1 className="section-heading">EDIT PRODUCT</h1>

      <p className="muted">
        Update the product details, photos, prices, variants and stock.
      </p>

      <ProductForm initialProduct={product} />
    </section>
  );
}
