
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

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
            {orders.map((order) => (
              <div key={order.id} className="auth-card">
                <p>Order: {order.id}</p>
                <p>Status: {order.status}</p>
                <p>
                  Total: £{(order.totalPence / 100).toFixed(2)}
                </p>
                <p>
                  Date: {order.createdAt.toLocaleDateString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link href="/shop" className="outline-button">
        CONTINUE SHOPPING ↗
      </Link>
    </main>
  );
}
