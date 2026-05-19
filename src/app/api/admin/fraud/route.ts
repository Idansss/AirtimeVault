import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { ok, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const resolved = searchParams.get("resolved") === "true";
    const page     = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit    = Math.min(100, Number(searchParams.get("limit") ?? 20));

    const [flags, total] = await Promise.all([
      prisma.fraudFlag.findMany({
        where:   { isResolved: resolved },
        include: {
          user: { select: { username: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.fraudFlag.count({ where: { isResolved: resolved } }),
    ]);

    return ok({ flags, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin  = await requireAdmin(req);
    const { userId, type, description, metadata } = await req.json();
    if (!userId || !type || !description) return ok({ error: "userId, type, description required" });

    const flag = await prisma.fraudFlag.create({
      data: { userId, type, description, metadata },
    });

    await prisma.auditLog.create({
      data: {
        userId:   admin.sub,
        action:   "FRAUD_FLAG_CREATED",
        entity:   "FraudFlag",
        entityId: flag.id,
        newValue: { userId, type },
      },
    });

    return ok({ flag });
  } catch (e) {
    return handleError(e);
  }
}
