import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { ok, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") ?? "30d"; // 7d, 30d, 90d, all

    const since = (() => {
      const d = new Date();
      if (period === "7d")  { d.setDate(d.getDate() - 7);   return d; }
      if (period === "30d") { d.setDate(d.getDate() - 30);  return d; }
      if (period === "90d") { d.setDate(d.getDate() - 90);  return d; }
      return new Date(0); // all time
    })();

    const [
      totalUsers,
      newUsers,
      totalConversions,
      successfulConversions,
      totalWithdrawals,
      successfulWithdrawals,
      totalBillPayments,
      openDisputes,
      unresolvedFraudFlags,
      conversionVolume,
      withdrawalVolume,
      billPaymentVolume,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.conversionRequest.count({ where: { createdAt: { gte: since } } }),
      prisma.conversionRequest.count({ where: { status: "SUCCESSFUL", createdAt: { gte: since } } }),
      prisma.withdrawal.count({ where: { createdAt: { gte: since } } }),
      prisma.withdrawal.count({ where: { status: "SUCCESSFUL", createdAt: { gte: since } } }),
      prisma.billPayment.count({ where: { createdAt: { gte: since } } }),
      prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
      prisma.fraudFlag.count({ where: { isResolved: false } }),
      prisma.conversionRequest.aggregate({
        where: { status: "SUCCESSFUL", createdAt: { gte: since } },
        _sum:  { airtimeAmount: true, walletAmount: true },
      }),
      prisma.withdrawal.aggregate({
        where: { status: "SUCCESSFUL", createdAt: { gte: since } },
        _sum:  { amount: true, fee: true },
      }),
      prisma.billPayment.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: since } },
        _sum:  { amount: true },
      }),
    ]);

    const platformRevenue =
      Number(conversionVolume._sum.airtimeAmount ?? 0) -
      Number(conversionVolume._sum.walletAmount  ?? 0) +
      Number(withdrawalVolume._sum.fee           ?? 0);

    return ok({
      period,
      users: { total: totalUsers, new: newUsers },
      conversions: {
        total:      totalConversions,
        successful: successfulConversions,
        successRate: totalConversions > 0 ? Math.round((successfulConversions / totalConversions) * 100) : 0,
        airtimeReceived: Number(conversionVolume._sum.airtimeAmount ?? 0),
        walletCredited:  Number(conversionVolume._sum.walletAmount  ?? 0),
      },
      withdrawals: {
        total:           totalWithdrawals,
        successful:      successfulWithdrawals,
        volume:          Number(withdrawalVolume._sum.amount ?? 0),
        feesCollected:   Number(withdrawalVolume._sum.fee    ?? 0),
      },
      billPayments: {
        total:  totalBillPayments,
        volume: Number(billPaymentVolume._sum.amount ?? 0),
      },
      health: {
        openDisputes,
        unresolvedFraudFlags,
      },
      revenue: { estimated: platformRevenue },
    });
  } catch (e) {
    return handleError(e);
  }
}
