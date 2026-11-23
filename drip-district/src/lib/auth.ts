
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const secret = () => {
  const value = process.env.AUTH_SECRET;

  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be configured with at least 32 characters.");
  }

  return new TextEncoder().encode(value);
};

export async function createAdminToken(email: string) {
  return new SignJWT({ role: "ADMIN", email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function isAdmin() {
  try {
    const token = (await cookies()).get("dd_admin")?.value;

    if (!token) return false;

    const { payload } = await jwtVerify(token, secret());

    if (
      payload.role !== "ADMIN" ||
      typeof payload.email !== "string" ||
      payload.email.trim().toLowerCase() !==
        process.env.ADMIN_EMAIL?.trim().toLowerCase()
    ) {
      return false;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email.trim().toLowerCase(),
      },
      select: {
        role: true,
        banned: true,
      },
    });

    return Boolean(user && user.role === "ADMIN" && !user.banned);
  } catch {
    return false;
  }
}
