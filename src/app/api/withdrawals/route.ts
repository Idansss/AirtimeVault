import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/api/auth";
import { ok, created, err, handleError } from "@/lib/api/response";
import { prisma, type TxClient } from "@/lib/prisma";

import { applyWalletTransaction } from "@/lib/api/wallet";
import { WITHDRAWAL_FEES, KYC_DAILY_LIMITS } from "@/lib/constants";

export const dynamic = "force-dynamic";

function getWithdrawalFee(amount: number, tier: string): number {
  if (tier === "GOLD" || tier === "BUSINESS") return 0;
  const band = WITHDRAWAL_FEES.find((f) => amount >= f.min && amount <= f.max);
  return band?.fee ?? 200;
}

async function checkDailyLimit(userId: string, kycLevel: string, amount: number) {
  const limit = KYC_DAILY_LIMITS[kycLevel] ?? 10_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { _sum } = await prisma.withdrawal.aggregate({
    where: { userId, createdAt: { gte: today }, status: { not: "FAILED" } },
    _sum: { amount: true },
  });

  const usedToday = Number(_sum.amount ?? 0);
  if (usedToday + amount > limit) {
    throw Object.assign(new Error(`Daily withdrawal limit exceeded (NGN ${limit.toLocaleString()})`), { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { bankAccountId, amount, pin } = await req.json();

    if (!bankAccountId || !amount || !pin) return err("bankAccountId, amount, and pin are required");
    if (amount < 1000) return err("Minimum withdrawal is NGN 1,000");

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) return err("User not found", 404);
    if (!user.pin) return err("Set a transaction PIN before withdrawing", 400);

    const pinValid = await bcrypt.compare(String(pin), user.pin);
    if (!pinValid) return err("Incorrect PIN", 401);

    await checkDailyLimit(user.id, user.kycLevel, amount);

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId: session.sub },
    });
    if (!bankAccount) return err("Bank account not found", 404);

    const fee = getWithdrawalFee(amount, user.membershipTier);
    const netAmount = amount - fee;

    const withdrawal = await prisma.$transaction(async (tx: TxClient) => {
      const createdWithdrawal = await tx.withdrawal.create({
        data: {
          userId: session.sub,
          bankAccountId,
          amount,
          fee,
          netAmount,
          status: "PENDING",
          providerStatus: process.env.PAYSTACK_SECRET_KEY ? "READY_FOR_PROVIDER" : "MANUAL_PAYOUT_REQUIRED",
        },
      });

      await applyWalletTransaction({
        userId: session.sub,
        type: "WITHDRAWAL",
        amount,
        fee,
        description: `Withdrawal to ${bankAccount.bankName} ****${bankAccount.accountNumber.slice(-4)}`,
        relatedId: createdWithdrawal.id,
        direction: "debit",
        tx,
      });

      return createdWithdrawal;
    });

    return created({ withdrawal, message: "Withdrawal request submitted for processing." });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { userId: session.sub },
        include: { bankAccount: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawal.count({ where: { userId: session.sub } }),
    ]);

    return ok({ withdrawals, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleError(e);
  }
}
