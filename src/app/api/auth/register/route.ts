import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { firstName, lastName, email, phone, username, password, referralCode } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }, { username }] },
    });

    if (existing) {
      const field = existing.email === email ? "email" : existing.phone === phone ? "phone" : "username";
      return NextResponse.json({ success: false, error: `${field} already in use` }, { status: 409 });
    }

    const referrer = referralCode
      ? await prisma.user.findUnique({ where: { referralCode } })
      : null;

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        username,
        passwordHash,
        referredBy: referrer?.id ?? null,
        profile: { create: { firstName, lastName } },
        wallet:  { create: {} },
      },
    });

    if (referrer) {
      await prisma.referral.create({
        data: { referrerId: referrer.id, referredId: user.id },
      });
    }

    return NextResponse.json({ success: true, data: { userId: user.id } }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
