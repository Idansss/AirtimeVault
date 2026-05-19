import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { applyWalletTransaction } from "@/lib/api/wallet";

export const dynamic = "force-dynamic";

const actionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "UNDER_REVIEW"]),
  adminNote: z.string().optional(),
  walletAmount: z.number().positive().optional(),
});

const ACTIVE_STATUSES = ["PENDING", "PROCESSING", "UNDER_REVIEW"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const conversion = await prisma.conversionRequest.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!conversion) return err("Conversion not found", 404);
    if (!ACTIVE_STATUSES.includes(conversion.status as never)) {
      return err(`Conversion is already ${conversion.status.toLowerCase()}`);
    }

    const { action, adminNote, walletAmount } = parsed.data;

    if (action === "APPROVE") {
      const creditAmount = walletAmount ?? Number(conversion.walletAmount);
      if (creditAmount <= 0) return err("A positive wallet amount is required before approval");

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const locked = await tx.conversionRequest.updateMany({
          where: { id, status: { in: [...ACTIVE_STATUSES] } },
          data: {
            status: "SUCCESSFUL",
            walletAmount: creditAmount,
            adminNote,
            processedAt: new Date(),
            processedBy: admin.sub,
          },
        });
        if (locked.count !== 1) throw Object.assign(new Error("Conversion has already been processed"), { status: 409 });

        await applyWalletTransaction({
          userId: conversion.userId,
          type: conversion.kind === "DATA" ? "DATA_CONVERSION" : "AIRTIME_CONVERSION",
          amount: creditAmount,
          description: `${conversion.kind.toLowerCase()} conversion - ${conversion.network}`,
          relatedId: conversion.id,
          direction: "credit",
          tx,
        });

        await tx.notification.create({
          data: {
            userId: conversion.userId,
            title: "Conversion Approved",
            body: `Your ${conversion.kind.toLowerCase()} conversion has been approved. NGN ${creditAmount.toLocaleString()} was credited to your wallet.`,
            type: "CONVERSION_APPROVED",
            metadata: { conversionId: id },
          },
        });
      });
    } else if (action === "REJECT") {
      await prisma.conversionRequest.update({
        where: { id },
        data: { status: "REJECTED", adminNote, processedAt: new Date(), processedBy: admin.sub },
      });

      await prisma.notification.create({
        data: {
          userId: conversion.userId,
          title: "Conversion Rejected",
          body: adminNote ?? "Your conversion could not be processed. Contact support for details.",
          type: "CONVERSION_REJECTED",
          metadata: { conversionId: id },
        },
      });
    } else {
      await prisma.conversionRequest.update({
        where: { id },
        data: { status: "UNDER_REVIEW", adminNote },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.sub,
        action: `CONVERSION_${action}`,
        entity: "ConversionRequest",
        entityId: id,
        newValue: { action, adminNote, walletAmount },
      },
    });

    return ok({ message: `Conversion ${action.toLowerCase()}d` });
  } catch (e) {
    return handleError(e);
  }
}
