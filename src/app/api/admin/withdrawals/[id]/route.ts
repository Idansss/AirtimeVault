import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { applyWalletTransaction } from "@/lib/api/wallet";

export const dynamic = "force-dynamic";

const actionSchema = z.object({
  action: z.enum(["MARK_PROCESSING", "MARK_SUCCESSFUL", "MARK_FAILED", "REVERSE"]),
  providerRef: z.string().optional(),
  failureReason: z.string().optional(),
});

const statusMap = {
  MARK_PROCESSING: "PROCESSING",
  MARK_SUCCESSFUL: "SUCCESSFUL",
  MARK_FAILED: "FAILED",
  REVERSE: "REVERSED",
} as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: { user: true, bankAccount: true },
    });
    if (!withdrawal) return err("Withdrawal not found", 404);

    const { action, providerRef, failureReason } = parsed.data;
    if ((action === "MARK_FAILED" || action === "REVERSE") && (withdrawal.status === "FAILED" || withdrawal.status === "REVERSED")) {
      return err("Withdrawal has already been refunded", 409);
    }
    if (withdrawal.status === "SUCCESSFUL" && action !== "REVERSE") {
      return err("Successful withdrawals can only be reversed", 409);
    }

    if (action === "MARK_FAILED" || action === "REVERSE") {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.withdrawal.update({
          where: { id },
          data: {
            status: statusMap[action],
            providerRef,
            failureReason,
            processedAt: new Date(),
          },
        });

        await applyWalletTransaction({
          userId: withdrawal.userId,
          type: "REVERSAL",
          amount: Number(withdrawal.amount),
          description: `Withdrawal reversal - ${withdrawal.reference}`,
          relatedId: withdrawal.id,
          direction: "credit",
          tx,
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            title: "Withdrawal Reversed",
            body: `Your withdrawal of NGN ${Number(withdrawal.amount).toLocaleString()} has been reversed to your wallet. ${failureReason ?? ""}`,
            type: "WITHDRAWAL_REVERSED",
          },
        });
      });
    } else {
      await prisma.withdrawal.update({
        where: { id },
        data: {
          status: statusMap[action],
          providerRef,
          failureReason,
          processedAt: new Date(),
        },
      });

      if (action === "MARK_SUCCESSFUL") {
        await prisma.notification.create({
          data: {
            userId: withdrawal.userId,
            title: "Withdrawal Successful",
            body: `NGN ${Number(withdrawal.netAmount).toLocaleString()} has been sent to ${withdrawal.bankAccount.bankName} ****${withdrawal.bankAccount.accountNumber.slice(-4)}.`,
            type: "WITHDRAWAL_SUCCESSFUL",
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.sub,
        action: `WITHDRAWAL_${action}`,
        entity: "Withdrawal",
        entityId: id,
        newValue: parsed.data,
      },
    });

    return ok({ message: `Withdrawal ${action.toLowerCase().replace(/_/g, " ")}` });
  } catch (e) {
    return handleError(e);
  }
}
