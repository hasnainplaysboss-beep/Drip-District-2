import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
export default async function Admin(){if(!await isAdmin())redirect("/admin/login");return <section className="section"><div className="eyebrow">DRIP DISTRICT / CONTROL</div><h1 className="section-heading">ADMIN DASHBOARD</h1><div className="admin-grid"><Link href="/admin/customers">CUSTOMERS</Link><Link href="/admin/revenue">REVENUE</Link><Link href="/admin/orders">ORDERS</Link><Link href="/admin/products">PRODUCTS</Link></div></section>}
