
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Subcategory({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category, subcategory } = await params;

  if (
    !["clothing", "accessories"].includes(category) ||
    !["mens", "womens"].includes(subcategory)
  ) {
    return notFound();
  }

  const categoryName =
    `${subcategory === "mens" ? "Mens" : "Womens"} ${
      category === "mens" ? "" : category === "accessories" ? "Accessories" : "Clothing"
    }`.trim();

  const products = await prisma.product.findMany({
    where: {
      category: categoryName,
      active: true,
    },
    include: {
      variants: {
        where: {
          active: true,
        },
        orderBy: {
          pricePence: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <div className="page-intro">
        <div className="eyebrow">
          DRIP DISTRICT / {category.toUpperCase()}
        </div>

        <h1>
          {subcategory === "mens" ? "MEN'S" : "WOMEN'S"}{" "}
          {category.toUpperCase()}
        </h1>

        <p>Explore the latest collection from Drip District.</p>
      </div>

      <section className="section">
        {products.length === 0 ? (
          <p className="muted">
            No products are available in this collection yet.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "24px",
            }}
          >
            {products.map((product) => {
              const startingPrice = product.variants[0]?.pricePence;

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <div>
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        style={{
                          width: "100%",
                          aspectRatio: "3 / 4",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "3 / 4",
                          background: "#eee",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        NO IMAGE
                      </div>
                    )}

                    <h2 style={{ marginTop: "12px" }}>
                      {product.title}
                    </h2>

                    {startingPrice !== undefined && (
                      <p>
                        £{(startingPrice / 100).toFixed(2)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
