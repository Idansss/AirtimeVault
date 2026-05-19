import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { ok, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit  = Math.min(100, Number(searchParams.get("limit") ?? 20));

    const where = status ? { status: status as never } : {};

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          user: { select: { username: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.dispute.count({ where }),
    ]);

    return ok({ disputes, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleError(e);
  }
}
