
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

export default async function ProductsPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const products = await prisma.product.findMany({
    include: {
      variants: {
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
    <section className="section">
      <div className="eyebrow">DRIP DISTRICT / ADMIN</div>

      <h1 className="section-heading">PRODUCTS</h1>

      <p className="muted">
        Manage your product catalogue, prices, sizes and inventory.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          margin: "32px 0",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", margin: 0 }}>
            Your catalogue
          </h2>
          <p className="muted">
            {products.length} products in your database
          </p>
        </div>

        <Link
          href="/admin/products/new"
          style={{
            background: "white",
            color: "black",
            padding: "14px 20px",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          + ADD PRODUCT
        </Link>
      </div>

      {products.length === 0 ? (
        <div
          style={{
            border: "1px solid #444",
            padding: "32px 20px",
            textAlign: "center",
          }}
        >
          <h2>No products yet</h2>
          <p className="muted">
            Your product catalogue is currently empty.
          </p>
          <Link href="/admin/products/new">
            Add your first product
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "650px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr>
                {["PRODUCT", "CATEGORY", "PRICE", "STOCK", "STATUS"].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "16px 12px",
                        borderBottom: "1px solid #555",
                        fontSize: "12px",
                        letterSpacing: "1px",
                      }}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const prices = product.variants.map(
                  (variant) => variant.pricePence
                );

                const totalStock = product.variants.reduce(
                  (total, variant) => total + variant.stock,
                  0
                );

                const priceLabel =
                  prices.length === 0
                    ? "Not set"
                    : prices.length === 1 ||
                        Math.min(...prices) === Math.max(...prices)
                      ? formatPrice(Math.min(...prices))
                      : `${formatPrice(Math.min(...prices))} – ${formatPrice(
                          Math.max(...prices)
                        )}`;

                return (
                  <tr key={product.id}>
                    <td
                      style={{
                        padding: "18px 12px",
                        borderBottom: "1px solid #333",
                      }}
                    >
                      <strong>{product.title}</strong>
                      <div className="muted" style={{ fontSize: "12px" }}>
                        {product.slug}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "18px 12px",
                        borderBottom: "1px solid #333",
                      }}
                    >
                      {product.category}
                    </td>

                    <td
                      style={{
                        padding: "18px 12px",
                        borderBottom: "1px solid #333",
                      }}
                    >
                      {priceLabel}
                    </td>

                    <td
                      style={{
                        padding: "18px 12px",
                        borderBottom: "1px solid #333",
                      }}
                    >
                      {totalStock}
                    </td>

                    <td
                      style={{
                        padding: "18px 12px",
                        borderBottom: "1px solid #333",
                      }}
                    >
                      {product.active ? "ACTIVE" : "INACTIVE"}
                      {product.featured && (
                        <div style={{ fontSize: "11px", marginTop: "5px" }}>
                          FEATURED
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
