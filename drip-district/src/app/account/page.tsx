
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

function getTrackingUrl(carrier: string, trackingNumber: string) {
  const name = carrier.toLowerCase();

  if (name.includes("royal mail")) {
    return `https://www.royalmail.com/track-your-item#/tracking-results/${encodeURIComponent(trackingNumber)}`;
  }

  if (name.includes("dpd")) {
    return `https://www.dpd.co.uk/service/tracking?parcel=${encodeURIComponent(trackingNumber)}`;
  }

  if (name.includes("evri")) {
    return `https://www.evri.com/track/parcel/${encodeURIComponent(trackingNumber)}`;
  }

  if (name.includes("yodel")) {
    return `https://www.yodel.co.uk/track/${encodeURIComponent(trackingNumber)}`;
  }

  if (name.includes("ups")) {
    return `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`;
  }

  if (name.includes("dhl")) {
    return `https://www.dhl.com/gb-en/home/tracking.html?tracking-id=${encodeURIComponent(trackingNumber)}`;
  }

  return null;
}

export default async function AccountPage() {
  const user = await getCustomerSession();

  if (!user) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      status: true,
      totalPence: true,
      createdAt: true,
      trackingNumber: true,
      trackingCarrier: true,
      items: {
        select: {
          productTitle: true,
          variantLabel: true,
          quantity: true,
        },
      },
    },
  });

  return (
    <main className="section">
      <div className="eyebrow">YOUR DISTRICT</div>

      <h1 className="section-heading">
        WELCOME BACK{user.name ? `, ${user.name.toUpperCase()}` : "."}
      </h1>

      <p>Your Drip District customer account.</p>

      <section className="auth-card">
        <h2>ACCOUNT DETAILS</h2>
        <p><strong>Name:</strong> {user.name || "Not provided"}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Account type:</strong> Customer</p>
      </section>

      <section className="section">
        <h2 className="section-heading">YOUR RECENT ORDERS</h2>

        {orders.length === 0 ? (
          <p>You haven't placed any orders yet.</p>
        ) : (
          <div>
            {orders.map((order) => {
              const trackingUrl =
                order.trackingNumber && order.trackingCarrier
                  ? getTrackingUrl(
                      order.trackingCarrier,
                      order.trackingNumber
                    )
                  : null;

              return (
                <div key={order.id} className="auth-card">
                  <h3>Order #{order.id.slice(-8).toUpperCase()}</h3>

                  <p><strong>Status:</strong> {order.status}</p>

                  <p>
                    <strong>Total:</strong>{" "}
                    £{(order.totalPence / 100).toFixed(2)}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {order.createdAt.toLocaleDateString("en-GB")}
                  </p>

                  <h4>Items</h4>

                  {order.items.map((item, index) => (
                    <p key={index}>
                      {item.productTitle} — {item.variantLabel}
                      {" × "}{item.quantity}
                    </p>
                  ))}

                  {order.trackingNumber && (
                    <div style={{ marginTop: "18px" }}>
                      <h4>DELIVERY TRACKING</h4>

                      <p>
                        <strong>Carrier:</strong>{" "}
                        {order.trackingCarrier || "Not specified"}
                      </p>

                      <p>
                        <strong>Tracking number:</strong>{" "}
                        {order.trackingNumber}
                      </p>

                      {trackingUrl ? (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="outline-button"
                        >
                          TRACK YOUR PARCEL ↗
                        </a>
                      ) : (
                        <p className="muted">
                          Use your tracking number on your carrier's website.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Link href="/shop" className="outline-button">
        CONTINUE SHOPPING ↗
      </Link>
    </main>
  );
}
