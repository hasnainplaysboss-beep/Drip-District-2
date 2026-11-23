
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatGBP } from "@/lib/money";
import ProductBuy from "./ProductBuy";
import ProductGallery from "./ProductGallery";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let p = null;

  try {
    p = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: {
          where: { active: true },
        },
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {}

  if (!p || !p.active) return notFound();

  return (
    <>
      <div className="page-intro">
        <div className="eyebrow">DRIP DISTRICT / PRODUCT</div>
        <h1>{p.title}</h1>
      </div>

      <section className="section product-detail-layout">
        <div className="product-detail-gallery">
          <ProductGallery images={p.images} title={p.title} />
        </div>

        <div className="product-detail-info">
          <p>{p.description}</p>

          <p>{p.reviews.length} customer reviews</p>

          <ProductBuy
            product={{
              id: p.id,
              title: p.title,
              variants: p.variants.map((v) => ({
                id: v.id,
                pricePence: v.pricePence,
                region: v.deliveryRegion,
                stock: v.stock,
                size: v.size,
                colour: v.colour,
              })),
            }}
          />
        </div>
      </section>

      <section className="section">
        <h2 className="section-heading">CUSTOMER REVIEWS</h2>

        {p.reviews.map((r) => (
          <article className="simple-card" key={r.id}>
            <b>
              {r.rating}/5 · {r.title}
            </b>

            <p>{r.body}</p>

            {r.verified && <small>Verified purchase</small>}
          </article>
        ))}
      </section>
    </>
  );
}
