import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const customers = await prisma.user.findMany({ select: { id:true,email:true,name:true,role:true,banned:true,createdAt:true,_count:{select:{orders:true}} }, orderBy:{createdAt:"desc"} });
  return NextResponse.json({ customers });
}
export async function PATCH(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.id || !["ban","unban","make-admin","make-customer"].includes(b.action)) return NextResponse.json({error:"Invalid customer action."},{status:400});
  const data = b.action==="ban"?{banned:true}:b.action==="unban"?{banned:false}:b.action==="make-admin"?{role:"ADMIN" as const}:{role:"CUSTOMER" as const};
  try { const customer=await prisma.user.update({where:{id:String(b.id)},data}); return NextResponse.json({customer}); }
  catch { return NextResponse.json({error:"Customer not found."},{status:404}); }
}
