"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
type Item = { id: string; title: string; price: number; quantity: number; delivery: "UK"|"CHINA"; image?: string };
type CartContextType = { items: Item[]; count: number; add: (item: Item)=>void; remove:(id:string)=>void; clear:()=>void };
const Ctx = createContext<CartContextType | null>(null);
export function CartProvider({children}:{children:React.ReactNode}) {
  const [items,setItems] = useState<Item[]>([]);
  useEffect(()=>{ try { setItems(JSON.parse(localStorage.getItem("dd_cart")||"[]")); } catch {} },[]);
  useEffect(()=>{ localStorage.setItem("dd_cart",JSON.stringify(items)); },[items]);
  const value = useMemo(()=>({items,count:items.reduce((n,i)=>n+i.quantity,0),add:(item:Item)=>setItems(old=>{const found=old.find(x=>x.id===item.id);return found?old.map(x=>x.id===item.id?{...x,quantity:x.quantity+item.quantity}:x):[...old,item]}),remove:(id:string)=>setItems(old=>old.filter(x=>x.id!==id)),clear:()=>setItems([])}),[items]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useCart(){const value=useContext(Ctx);if(!value)throw new Error("useCart must be used inside CartProvider");return value;}
