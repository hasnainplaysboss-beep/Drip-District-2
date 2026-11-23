import OrderActions from "./OrderActions";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function money(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

export default async function OrdersPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: true,
    },
  });

  const paidOrders = orders.filter((order) =>
    ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  );

  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + order.totalPence,
    0
  );

  return (
    <section className="section">
      <div className="eyebrow">DRIP DISTRICT / ADMIN</div>

      <h1 className="section-heading">ORDERS</h1>

      <p className="muted">
        View customer purchases, payment details and delivery information.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          margin: "28px 0",
        }}
      >
        <div className="simple-card">
          <h2>{orders.length}</h2>
          <p>Total orders</p>
        </div>

        <div className="simple-card">
          <h2>{pendingOrders.length}</h2>
          <p>Pending payment</p>
        </div>

        <div className="simple-card">
          <h2>{paidOrders.length}</h2>
          <p>Paid orders</p>
        </div>

        <div className="simple-card">
          <h2>{money(totalRevenue)}</h2>
          <p>Paid order revenue</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="muted">No orders have been placed yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {orders.map((order) => (
            <article
              key={order.id}
              className="simple-card"
              style={{
                padding: "20px",
                overflowWrap: "anywhere",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>
                    Order #{order.id.slice(-8).toUpperCase()}
                  </h2>

                  <p className="muted">
                    {order.createdAt.toLocaleString("en-GB")}
                  </p>
                </div>

                <strong>{order.status}</strong>
              </div>

              <hr style={{ margin: "16px 0", opacity: 0.2 }} />

              <h3>Customer</h3>

              <p>{order.email}</p>

              {order.shippingName && (
                <p>Name: {order.shippingName}</p>
              )}

              {order.shippingPhone && (
                <p>Phone: {order.shippingPhone}</p>
              )}

              <h3>Delivery address</h3>

              <p>
                {[
                  order.shippingAddress1,
                  order.shippingAddress2,
                  order.shippingCity,
                  order.shippingCounty,
                  order.shippingPostcode,
                  order.shippingCountry,
                ]
                  .filter(Boolean)
                  .join(", ") || "No shipping address recorded"}
              </p>

              <h3>Items</h3>

              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.productTitle} — {item.variantLabel}
                    {" × "}
                    {item.quantity}
                    {" — "}
                    {money(item.unitPricePence * item.quantity)}
                  </li>
                ))}
              </ul>

              <hr style={{ margin: "16px 0", opacity: 0.2 }} />

              <p>Subtotal: {money(order.subtotalPence)}</p>
              <p>Delivery: {money(order.deliveryPence)}</p>

              <h3>Total: {money(order.totalPence)}</h3>

              <h3>Tracking</h3>

              <p>
                Carrier: {order.trackingCarrier || "Not added"}
              </p>

              <p>
                Tracking number: {order.trackingNumber || "Not added"}
              </p>
              <OrderActions
  orderId={order.id}
  status={order.status}
  trackingCarrier={order.trackingCarrier}
  trackingNumber={order.trackingNumber}
/>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
