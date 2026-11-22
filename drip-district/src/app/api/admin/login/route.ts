
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAdminToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const normalisedEmail = String(email || "").trim().toLowerCase();
    const submittedPassword = String(password || "");

    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "DIAGNOSTIC: EMAIL_NOT_FOUND" },
        { status: 401 }
      );
    }

    if (user.banned) {
      return NextResponse.json(
        { error: "DIAGNOSTIC: ACCOUNT_BANNED" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "DIAGNOSTIC: NOT_ADMIN" },
        { status: 401 }
      );
    }

    const passwordMatches = await compare(
      submittedPassword,
      user.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "DIAGNOSTIC: PASSWORD_MISMATCH" },
        { status: 401 }
      );
    }

    const token = await createAdminToken(user.email);

    const response = NextResponse.json({ ok: true });

    response.cookies.set("dd_admin", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
