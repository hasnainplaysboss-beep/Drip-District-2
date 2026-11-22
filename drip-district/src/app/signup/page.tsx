
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/customer-auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") ?? "").trim();

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(
      formData.get("confirmPassword") ?? ""
    );

    if (!email || !password || !confirmPassword) {
      return NextResponse.redirect(
        new URL("/signup?error=missing", request.url),
        303
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.redirect(
        new URL("/signup?error=password-mismatch", request.url),
        303
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.redirect(
        new URL("/signup?error=weak-password", request.url),
        303
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.redirect(
        new URL("/signup?error=email-exists", request.url),
        303
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    await createCustomerSession(user.id, user.email);

    return NextResponse.redirect(
      new URL("/account", request.url),
      303
    );
  } catch (error) {
    console.error("Customer signup error:", error);

    return NextResponse.redirect(
      new URL("/signup?error=server", request.url),
      303
    );
  }
}
