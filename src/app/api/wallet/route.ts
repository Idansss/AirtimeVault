import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ok, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));
    const skip  = (page - 1) * limit;
    const type  = searchParams.get("type") ?? undefined;

    const [wallet, ledgerEntries, total] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: session.sub } }),
      prisma.walletLedger.findMany({
        where:   {
          wallet: { userId: session.sub },
          ...(type ? { type: type as never } : {}),
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.walletLedger.count({
        where: { wallet: { userId: session.sub } },
      }),
    ]);

    return ok({ wallet, ledgerEntries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleError(e);
  }
}
