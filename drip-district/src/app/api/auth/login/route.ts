
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/customer-auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      return NextResponse.redirect(
        new URL("/login?error=missing", request.url),
        303
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.banned || user.role !== "CUSTOMER") {
      return NextResponse.redirect(
        new URL("/login?error=invalid", request.url),
        303
      );
    }

    const passwordMatches = await compare(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.redirect(
        new URL("/login?error=invalid", request.url),
        303
      );
    }

    await createCustomerSession(user.id, user.email);

    return NextResponse.redirect(
      new URL("/account", request.url),
      303
    );
  } catch (error) {
    console.error("Customer login error:", error);

    return NextResponse.redirect(
      new URL("/login?error=server", request.url),
      303
    );
  }
}

