


import Link from "next/link";
import { categories } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { formatGBP } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    where: {
      active: true,
      featured: true,
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
    take: 20,
  });

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">DRIP DISTRICT</div>
          <h1>
            THE DISTRICT
            <br />
            OF WHAT'S NEXT.
          </h1>
          <p>Designer clothing. Tech. Accessories.</p>
          <Link className="outline-button" href="/shop">
            DISCOVER THE COLLECTION&nbsp; →
          </Link>
        </div>
      </section>

      <section className="trust-strip">
        <div>
          <b>♧</b>
          <span>UK AND CHINA<br />DELIVERY</span>
        </div>
        <div>
          <b>◇</b>
          <span>SECURE PAYMENTS<br />SHOP WITH CONFIDENCE</span>
        </div>
        <div>
          <b>✧</b>
          <span>PREMIUM FINDS<br />CAREFULLY SELECTED</span>
        </div>
        <div>
          <b>☏</b>
          <span>DEDICATED SUPPORT<br />WE'RE HERE TO HELP</span>
        </div>
      </section>

      <section className="category-grid">
        {categories.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="category-tile"
            style={{ backgroundImage: `url(${c.image})` }}
          >
            <div>
              <h2>{c.title.toUpperCase()}</h2>
              <span>SHOP NOW ↗</span>
            </div>
          </Link>
        ))}
      </section>

      {featuredProducts.length > 0 && (
        <section className="section">
          <div className="eyebrow">HANDPICKED FOR YOU</div>
          <h2 className="section-heading">FEATURED PRODUCTS</h2>

          <div
  className="featured-carousel"
  style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              overflowY: "hidden",
              width: "100%",
              paddingBottom: "16px",
              paddingRight: "12px",
              boxSizing: "border-box",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="product-card"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  flex: "0 0 44%",
                  minWidth: 0,
                  scrollSnapAlign: "start",
                }}
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
                    ? formatGBP(product.variants[0].pricePence)
                    : "Price unavailable"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="eyebrow">FIND YOUR NEXT FAVOURITE</div>
        <h2 className="section-heading">
          THE COLLECTION
          <br />
          IS YOURS TO EXPLORE.
        </h2>
        <Link className="outline-button" href="/shop">
          SHOP ALL PRODUCTS ↗
        </Link>
      </section>
    </>
  );
}
