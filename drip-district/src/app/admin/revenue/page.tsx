import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
export default async function Page(){if(!await isAdmin())redirect("/admin/login");return <section className="section"><div className="eyebrow">DRIP DISTRICT / ADMIN</div><h1 className="section-heading">REVENUE</h1><p className="muted">Admin module foundation. Connect and validate the required database workflows before using this section for live customer or order operations.</p></section>}
