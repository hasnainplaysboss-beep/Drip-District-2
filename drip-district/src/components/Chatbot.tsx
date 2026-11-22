"use client";
import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
type Message={role:"assistant"|"user";text:string};
export default function Chatbot(){
 const [open,setOpen]=useState(false),[input,setInput]=useState(""),[messages,setMessages]=useState<Message[]>([{role:"assistant",text:"Welcome to Drip District. How can I help with your order, delivery or products?"}]),[busy,setBusy]=useState(false);
 async function send(){const q=input.trim();if(!q||busy)return;setMessages(m=>[...m,{role:"user",text:q}]);setInput("");setBusy(true);try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q})});const d=await r.json();setMessages(m=>[...m,{role:"assistant",text:d.reply||"Please contact our support team for further help."}]);}catch{setMessages(m=>[...m,{role:"assistant",text:"Sorry, support is temporarily unavailable. Please use our contact page."}]);}finally{setBusy(false);}}
 return <><button className="chat-launch" onClick={()=>setOpen(!open)} aria-label="Open Drip District AI"><MessageCircle/> <span>DRIP DISTRICT AI</span></button>{open&&<aside className="chat-panel"><header><div><b>DRIP DISTRICT AI</b><small>Customer assistance</small></div><button onClick={()=>setOpen(false)} aria-label="Close chat"><X/></button></header><div className="chat-messages">{messages.map((m,i)=><p className={m.role} key={i}>{m.text}</p>)}</div><form onSubmit={e=>{e.preventDefault();void send();}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask us anything..." aria-label="Message"/><button disabled={busy||!input.trim()} aria-label="Send"><Send/></button></form></aside>}</>;
}
