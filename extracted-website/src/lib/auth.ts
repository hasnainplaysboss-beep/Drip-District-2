import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || 'unsafe-dev-secret-change-me');
export async function createSession(payload:{id:string,email:string,role:string}) {
 return new SignJWT(payload).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret);
}
export async function getSession() {
 const c=await cookies(); const token=c.get('dd_session')?.value;
 if(!token) return null;
 try { return (await jwtVerify(token,secret)).payload as {id:string,email:string,role:string}; } catch{return null;}
}
export async function setSession(token:string) {
 const c=await cookies(); c.set('dd_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7});
}
export async function clearSession(){const c=await cookies();c.delete('dd_session');}
