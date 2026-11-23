
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "You are not authorised." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const customerId = String(body.customerId || "");
    const action = String(body.action || "");

    const allowedActions = [
      "ban",
      "unban",
      "make-admin",
      "remove-admin",
    ];

    if (!customerId || !allowedActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid customer or action." },
        { status: 400 }
      );
    }

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        role: true,
        banned: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    // Protect the account used to access the admin dashboard.
    if (
      adminEmail &&
      customer.email.trim().toLowerCase() === adminEmail
    ) {
      return NextResponse.json(
        { error: "You cannot change your own administrator account." },
        { status: 403 }
      );
    }

    if (action === "ban" || action === "remove-admin") {
      if (customer.role === "ADMIN") {
        const adminCount = await prisma.user.count({
          where: { role: "ADMIN" },
        });

        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "You cannot remove or ban the last administrator." },
            { status: 400 }
          );
        }
      }
    }

    let updateData: { banned?: boolean; role?: "CUSTOMER" | "ADMIN" };

    switch (action) {
      case "ban":
        updateData = { banned: true };
        break;

      case "unban":
        updateData = { banned: false };
        break;

      case "make-admin":
        updateData = { role: "ADMIN" };
        break;

      case "remove-admin":
        updateData = { role: "CUSTOMER" };
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported action." },
          { status: 400 }
        );
    }

    await prisma.user.update({
      where: { id: customerId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Customer management error:", error);

    return NextResponse.json(
      { error: "Unable to update this customer." },
      { status: 500 }
    );
  }
}
