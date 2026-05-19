import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ok, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id:             true,
        email:          true,
        phone:          true,
        username:       true,
        role:           true,
        kycLevel:       true,
        membershipTier: true,
        emailVerified:  true,
        phoneVerified:  true,
        referralCode:   true,
        isFrozen:       true,
        lastLoginAt:    true,
        createdAt:      true,
        profile: {
          select: { firstName: true, lastName: true, avatarUrl: true, state: true },
        },
        wallet: {
          select: { availableBalance: true, pendingBalance: true, lockedBalance: true },
        },
        kycRecord: {
          select: { status: true, level: true },
        },
      },
    });

    if (!user) return handleError(Object.assign(new Error("User not found"), { status: 404 }));

    return ok({ user });
  } catch (e) {
    return handleError(e);
  }
}
