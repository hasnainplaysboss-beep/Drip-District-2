"use client";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatGBP } from "@/lib/money";
export default function Cart(){const {items,remove}=useCart();const total=items.reduce((n,i)=>n+i.price*i.quantity,0);return <section className="section"><div className="eyebrow">YOUR SELECTION</div><h1 className="section-heading">YOUR BAG</h1>{items.map(i=><div className="cart-line" key={i.id}><div><b>{i.title}</b><p>{i.delivery} delivery · Qty {i.quantity}</p></div><div>{formatGBP(i.price*i.quantity)} <button onClick={()=>remove(i.id)}>Remove</button></div></div>)}<h2>Total {formatGBP(total)}</h2>{items.length?<Link className="outline-button" href="/checkout">CONTINUE TO CHECKOUT ↗</Link>:<p>Your bag is empty. <Link href="/shop">Discover the collection.</Link></p>}</section>}
