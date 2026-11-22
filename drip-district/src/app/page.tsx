import Link from "next/link";
import { categories } from "@/lib/catalog";
export default function Home(){return <>
 <section className="hero"><div className="hero-copy"><div className="eyebrow">DRIP DISTRICT</div><h1>THE DISTRICT<br/>OF WHAT'S NEXT.</h1><p>Designer clothing. Tech. Accessories.</p><Link className="outline-button" href="/shop">DISCOVER THE COLLECTION&nbsp; →</Link></div></section>
 <section className="trust-strip"><div><b>♧</b><span>UK AND CHINA<br/>DELIVERY</span></div><div><b>◇</b><span>SECURE PAYMENTS<br/>SHOP WITH CONFIDENCE</span></div><div><b>✧</b><span>PREMIUM FINDS<br/>CAREFULLY SELECTED</span></div><div><b>☏</b><span>DEDICATED SUPPORT<br/>WE'RE HERE TO HELP</span></div></section>
 <section className="category-grid">{categories.map(c=><Link key={c.title} href={c.href} className="category-tile" style={{backgroundImage:`url(${c.image})`}}><div><h2>{c.title.toUpperCase()}</h2><span>SHOP NOW ↗</span></div></Link>)}</section>
 <section className="section"><div className="eyebrow">FIND YOUR NEXT FAVOURITE</div><h2 className="section-heading">THE COLLECTION<br/>IS YOURS TO EXPLORE.</h2><Link className="outline-button" href="/shop">SHOP ALL PRODUCTS ↗</Link></section>
 </>}
