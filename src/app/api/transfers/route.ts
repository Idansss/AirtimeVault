import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/api/auth";
import { ok, created, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { applyWalletTransaction } from "@/lib/api/wallet";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { recipient, amount, note, pin } = await req.json();

    if (!recipient || !amount || !pin) return err("recipient, amount, and pin are required");
    if (amount < 100) return err("Minimum transfer amount is NGN 100");

    const sender = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!sender?.pin) return err("Set a transaction PIN before transferring", 400);
    if (!sender.isActive || sender.isFrozen) return err("Account is restricted. Contact support.", 403);

    const pinValid = await bcrypt.compare(String(pin), sender.pin);
    if (!pinValid) return err("Incorrect PIN", 401);

    const receiver = await prisma.user.findFirst({
      where: {
        OR: [{ username: recipient }, { phone: recipient }, { email: recipient }],
        isActive: true,
        isFrozen: false,
      },
    });
    if (!receiver) return err("Recipient not found", 404);
    if (receiver.id === session.sub) return err("Cannot transfer to yourself");

    const transfer = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await applyWalletTransaction({
        userId: session.sub,
        type: "P2P_SEND",
        amount,
        description: `Transfer to @${receiver.username}${note ? ` - ${note}` : ""}`,
        relatedId: receiver.id,
        direction: "debit",
        tx,
      });

      await applyWalletTransaction({
        userId: receiver.id,
        type: "P2P_RECEIVE",
        amount,
        description: `Transfer from @${sender.username}${note ? ` - ${note}` : ""}`,
        relatedId: session.sub,
        direction: "credit",
        tx,
      });

      const createdTransfer = await tx.p2PTransfer.create({
        data: {
          senderId: session.sub,
          receiverId: receiver.id,
          amount,
          note,
          status: "COMPLETED",
        },
      });

      await tx.notification.create({
        data: {
          userId: receiver.id,
          title: "Money Received",
          body: `You received NGN ${amount.toLocaleString()} from @${sender.username}`,
          type: "P2P_RECEIVE",
          metadata: { transferId: createdTransfer.id },
        },
      });

      return createdTransfer;
    });

    return created({ transfer, message: `NGN ${amount.toLocaleString()} sent to @${receiver.username}` });
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

    const transfers = await prisma.p2PTransfer.findMany({
      where: { OR: [{ senderId: session.sub }, { receiverId: session.sub }] },
      include: {
        sender: { select: { username: true, profile: { select: { firstName: true, lastName: true } } } },
        receiver: { select: { username: true, profile: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return ok({ transfers });
  } catch (e) {
    return handleError(e);
  }
}
