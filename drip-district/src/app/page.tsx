
import Link from "next/link";
import { categories } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

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
    take: 8,
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
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "24px",
            }}
          >
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    style={{
                      width: "100%",
                      aspectRatio: "3 / 4",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      aspectRatio: "3 / 4",
                      background: "#eee",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    NO IMAGE
                  </div>
                )}

                <h3>{product.title}</h3>

                {product.variants[0] && (
                  <p>
                    £{(product.variants[0].pricePence / 100).toFixed(2)}
                  </p>
                )}
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
