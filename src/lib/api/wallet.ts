import { prisma } from "@/lib/prisma";
import { ApiError } from "./auth";
import type { Prisma, TransactionType } from "@prisma/client";

type WalletTx = Prisma.TransactionClient;

/** Credit or debit wallet and write a ledger entry atomically. */
export async function applyWalletTransaction({
  userId,
  type,
  amount,
  fee = 0,
  description,
  relatedId,
  metadata,
  direction,
  tx: externalTx,
}: {
  userId:     string;
  type:       TransactionType;
  amount:     number;
  fee?:       number;
  description: string;
  relatedId?: string;
  metadata?:  Record<string, string | number | boolean | null>;
  direction:  "credit" | "debit";
  tx?:         WalletTx;
}) {
  const run = async (tx: WalletTx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new ApiError(404, "Wallet not found");

    const balanceBefore = Number(wallet.availableBalance);
    const debitTotal     = amount + fee;
    const netChange      = direction === "credit" ? amount : -debitTotal;

    if (direction === "debit") {
      const updated = await tx.wallet.updateMany({
        where: { id: wallet.id, availableBalance: { gte: debitTotal } },
        data:  {
          availableBalance: { decrement: debitTotal },
          ...(type === "WITHDRAWAL"
            ? { totalWithdrawn: { increment: amount } }
            : { totalSpent: { increment: amount } }),
        },
      });
      if (updated.count !== 1) throw new ApiError(400, "Insufficient wallet balance");
    } else {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { increment: amount },
          ...(type === "AIRTIME_CONVERSION" || type === "DATA_CONVERSION"
            ? { totalConverted: { increment: amount } }
            : {}),
          ...(type === "CASHBACK" ? { cashbackEarned: { increment: amount } } : {}),
          ...(type === "REFERRAL_BONUS" ? { referralEarned: { increment: amount } } : {}),
        },
      });
    }

    const balanceAfter = balanceBefore + netChange;

    const ledger = await tx.walletLedger.create({
      data: {
        walletId:     wallet.id,
        type,
        status:       "COMPLETED",
        amount,
        balanceBefore,
        balanceAfter,
        fee,
        description,
        relatedId,
        metadata,
      },
    });

    const updatedWallet = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
    return { wallet: updatedWallet, ledger };
  };

  return externalTx ? run(externalTx) : prisma.$transaction(run);
}
