
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerActions from "./CustomerActions";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const customers = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      orders: {
        where: {
          status: {
            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
        select: {
          totalPence: true,
        },
      },
    },
  });

  const totalCustomers = customers.length;
  const bannedCustomers = customers.filter((c) => c.banned).length;
  const adminCount = customers.filter((c) => c.role === "ADMIN").length;

  return (
    <section className="section">
      <div className="eyebrow">DRIP DISTRICT / ADMIN</div>

      <h1 className="section-heading">CUSTOMERS</h1>

      <p className="muted">
        Manage customer accounts, permissions and access.
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
          <h2>{totalCustomers}</h2>
          <p>Total accounts</p>
        </div>

        <div className="simple-card">
          <h2>{bannedCustomers}</h2>
          <p>Banned accounts</p>
        </div>

        <div className="simple-card">
          <h2>{adminCount}</h2>
          <p>Administrators</p>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "850px",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: "14px" }}>CUSTOMER</th>
              <th style={{ padding: "14px" }}>ORDERS</th>
              <th style={{ padding: "14px" }}>TOTAL SPENT</th>
              <th style={{ padding: "14px" }}>ROLE</th>
              <th style={{ padding: "14px" }}>STATUS</th>
              <th style={{ padding: "14px" }}>JOINED</th>
              <th style={{ padding: "14px" }}>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => {
              const spent = customer.orders.reduce(
                (sum, order) => sum + order.totalPence,
                0
              );

              return (
                <tr key={customer.id}>
                  <td style={{ padding: "14px" }}>
                    <strong>{customer.name || "Unnamed customer"}</strong>
                    <br />
                    <small>{customer.email}</small>
                  </td>

                  <td style={{ padding: "14px" }}>
                    {customer.orders.length}
                  </td>

                  <td style={{ padding: "14px" }}>
                    £{(spent / 100).toFixed(2)}
                  </td>

                  <td style={{ padding: "14px" }}>
                    {customer.role}
                  </td>

                  <td style={{ padding: "14px" }}>
                    {customer.banned ? "BANNED" : "ACTIVE"}
                  </td>

                  <td style={{ padding: "14px" }}>
                    {customer.createdAt.toLocaleDateString("en-GB")}
                  </td>

                  <td style={{ padding: "14px" }}>
                    <CustomerActions
                      customerId={customer.id}
                      banned={customer.banned}
                      role={customer.role}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && (
        <p className="muted">No registered customers yet.</p>
      )}
    </section>
  );
}
