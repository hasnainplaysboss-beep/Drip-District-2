
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatGBP } from "@/lib/money";

export const dynamic = "force-dynamic";

const categories: Record<string, string> = {
  "mens-clothing": "Mens Clothing",
  "womens-clothing": "Womens Clothing",
  electronics: "Electronics",
  "mens-accessories": "Mens Accessories",
  "womens-accessories": "Womens Accessories",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category, subcategory } = await params;

  const categoryKey =
    category === "clothing"
      ? `${subcategory}-clothing`
      : category === "accessories"
        ? `${subcategory}-accessories`
        : category === "electronics"
          ? "electronics"
          : "";

  const selectedCategory = categories[categoryKey];

  if (!selectedCategory) notFound();

  const products = await prisma.product.findMany({
    where: {
      active: true,
      category: selectedCategory,
    },
    include: {
      variants: {
        where: { active: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <div className="page-intro">
        <div className="eyebrow">DRIP DISTRICT</div>
        <h1>{selectedCategory.toUpperCase()}</h1>
        <p>Discover the latest from Drip District.</p>
      </div>

      <section className="section">
        <div className="product-grid">
          {products.map((product) => (
            <Link
              className="product-card"
              href={`/product/${product.slug}`}
              key={product.id}
            >
              <div
                className="product-image"
                style={{
                  backgroundImage: product.images[0]
                    ? `url(${product.images[0]})`
                    : undefined,
                }}
              />

              <h3>{product.title}</h3>

              <p>
                {product.variants.length
                  ? formatGBP(
                      Math.min(
                        ...product.variants.map(
                          (variant) => variant.pricePence
                        )
                      )
                    )
                  : "Price unavailable"}
              </p>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <p className="muted">
            Products will appear here once added in the admin dashboard.
          </p>
        )}
      </section>
    </>
  );
}
