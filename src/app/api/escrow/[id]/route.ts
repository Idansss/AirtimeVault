import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { applyWalletTransaction } from "@/lib/api/wallet";

export const dynamic = "force-dynamic";

const actionSchema = z.object({
  action: z.enum(["MARK_DELIVERED", "RELEASE", "OPEN_DISPUTE"]),
  reason: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const deal = await prisma.escrowDeal.findUnique({
      where: { id },
      include: {
        buyer: { select: { username: true } },
        seller: { select: { username: true } },
      },
    });
    if (!deal) return err("Escrow deal not found", 404);
    if (deal.buyerId !== session.sub && deal.sellerId !== session.sub) return err("Forbidden", 403);

    const { action, reason } = parsed.data;

    if (action === "MARK_DELIVERED") {
      if (deal.sellerId !== session.sub) return err("Only the seller can mark delivery", 403);
      if (deal.status !== "FUNDED") return err("Deal is not ready for delivery");
      await prisma.escrowDeal.update({
        where: { id },
        data: { status: "DELIVERED", deliveredAt: new Date() },
      });
      await prisma.notification.create({
        data: {
          userId: deal.buyerId,
          title: "Escrow Delivery Marked",
          body: `@${deal.seller.username} marked "${deal.title}" as delivered.`,
          type: "ESCROW_DELIVERED",
          metadata: { escrowId: id },
        },
      });
      return ok({ message: "Delivery marked" });
    }

    if (action === "RELEASE") {
      if (deal.buyerId !== session.sub) return err("Only the buyer can release funds", 403);
      if (deal.status !== "DELIVERED" && deal.status !== "FUNDED") return err("Deal cannot be released from this status");

      await prisma.$transaction(async (tx) => {
        const locked = await tx.escrowDeal.updateMany({
          where: { id, status: { in: ["FUNDED", "DELIVERED"] } },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        if (locked.count !== 1) throw Object.assign(new Error("Escrow deal was already processed"), { status: 409 });

        await applyWalletTransaction({
          userId: deal.sellerId,
          type: "ESCROW_RELEASE",
          amount: Number(deal.amount),
          description: `Escrow released - ${deal.title}`,
          relatedId: deal.id,
          direction: "credit",
          tx,
        });

        await tx.notification.create({
          data: {
            userId: deal.sellerId,
            title: "Escrow Released",
            body: `Funds for "${deal.title}" have been released to your wallet.`,
            type: "ESCROW_RELEASED",
            metadata: { escrowId: id },
          },
        });
      });

      return ok({ message: "Escrow funds released" });
    }

    if (action === "OPEN_DISPUTE") {
      if (!reason || reason.length < 10) return err("Dispute reason must be at least 10 characters");
      await prisma.$transaction([
        prisma.escrowDeal.update({ where: { id }, data: { status: "DISPUTED" } }),
        prisma.dispute.create({
          data: {
            userId: session.sub,
            escrowId: id,
            type: "ESCROW",
            subject: `Escrow dispute: ${deal.title}`,
            description: reason,
          },
        }),
      ]);
      return ok({ message: "Dispute opened" });
    }
  } catch (e) {
    return handleError(e);
  }
}
