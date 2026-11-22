
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAdminToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const normalisedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const submittedPassword = String(password || "");

    if (!normalisedEmail || !submittedPassword) {
      return NextResponse.json(
        { error: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (
      !user ||
      user.banned ||
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    const passwordMatches = await compare(
      submittedPassword,
      user.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid admin credentials." },
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
      { error: "Something went wrong on the server." },
      { status: 500 }
    );
  }
}
