import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { ok, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const q      = searchParams.get("q") ?? "";
    const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit  = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const status = searchParams.get("status");

    const where = {
      ...(q ? {
        OR: [
          { email:    { contains: q, mode: "insensitive" as const } },
          { phone:    { contains: q } },
          { username: { contains: q, mode: "insensitive" as const } },
          { profile:  { OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName:  { contains: q, mode: "insensitive" as const } },
          ]}},
        ],
      } : {}),
      ...(status === "frozen"   ? { isFrozen: true }  : {}),
      ...(status === "inactive" ? { isActive: false }  : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id:            true,
          email:         true,
          phone:         true,
          username:      true,
          role:          true,
          kycLevel:      true,
          membershipTier:true,
          isActive:      true,
          isFrozen:      true,
          emailVerified: true,
          phoneVerified: true,
          lastLoginAt:   true,
          createdAt:     true,
          profile: { select: { firstName: true, lastName: true } },
          wallet:  { select: { availableBalance: true } },
        },
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.user.count({ where }),
    ]);

    return ok({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleError(e);
  }
}
