import Link from "next/link";
import { notFound } from "next/navigation";
const config:Record<string,{title:string;links:{label:string;href:string}[]}> = {
 clothing:{title:"CLOTHING",links:[{label:"MEN'S",href:"/clothing/mens"},{label:"WOMEN'S",href:"/clothing/womens"}]},
 accessories:{title:"ACCESSORIES",links:[{label:"MEN'S",href:"/accessories/mens"},{label:"WOMEN'S",href:"/accessories/womens"}]},
 electronics:{title:"ELECTRONICS",links:[]}
};
export default async function Category({params}:{params:Promise<{category:string}>}){const {category}=await params;const c=config[category];if(!c)return notFound();return <><div className="page-intro"><div className="eyebrow">DRIP DISTRICT / SHOP</div><h1>{c.title}</h1><p>Explore the latest from Drip District.</p></div><div className="section"><div className="category-grid">{c.links.map(x=><Link className="simple-card" href={x.href} key={x.href}><h2>{x.label}</h2><span>EXPLORE ↗</span></Link>)}</div><Link className="outline-button" href={`/shop?category=${category}`}>SHOP {c.title} ↗</Link></div></>}
