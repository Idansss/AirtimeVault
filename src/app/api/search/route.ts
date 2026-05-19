import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ok, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (q.length < 2) return ok({ results: [] });

    const userId = session.sub;
    const like   = { contains: q, mode: "insensitive" as const };

    const [ledger, conversions, bills, withdrawals] = await Promise.all([
      prisma.walletLedger.findMany({
        where: {
          wallet: { userId },
          OR: [{ reference: like }, { description: like }],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, type: true, amount: true, status: true, reference: true, description: true, createdAt: true },
      }),
      prisma.conversionRequest.findMany({
        where: {
          userId,
          OR: [{ reference: like }, { phoneNumber: like }],
        },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, network: true, airtimeAmount: true, walletAmount: true, status: true, reference: true, createdAt: true },
      }),
      prisma.billPayment.findMany({
        where: {
          userId,
          OR: [{ provider: like }, { recipient: like }],
        },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, category: true, provider: true, recipient: true, amount: true, status: true, createdAt: true },
      }),
      prisma.withdrawal.findMany({
        where: {
          userId,
          OR: [{ reference: like }, { providerRef: like }],
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, amount: true, status: true, reference: true, createdAt: true },
      }),
    ]);

    return ok({
      results: {
        ledger:      ledger.map((r) => ({ ...r, amount: Number(r.amount), createdAt: r.createdAt.toISOString() })),
        conversions: conversions.map((r) => ({ ...r, airtimeAmount: Number(r.airtimeAmount), walletAmount: Number(r.walletAmount), createdAt: r.createdAt.toISOString() })),
        bills:       bills.map((r) => ({ ...r, amount: Number(r.amount), createdAt: r.createdAt.toISOString() })),
        withdrawals: withdrawals.map((r) => ({ id: r.id, amount: Number(r.amount), status: r.status, reference: r.reference, createdAt: r.createdAt.toISOString() })),
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
