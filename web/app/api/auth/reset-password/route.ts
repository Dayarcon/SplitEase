import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Look up the token
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "This reset link is invalid. Please request a new one." },
        { status: 400 }
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      // Clean up the expired token
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
