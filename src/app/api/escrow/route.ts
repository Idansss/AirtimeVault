import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { ok, created, err, handleError } from "@/lib/api/response";
import { prisma, type TxClient } from "@/lib/prisma";

import { applyWalletTransaction } from "@/lib/api/wallet";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(3),
  seller: z.string().min(1),
  amount: z.number().min(500),
  description: z.string().min(10),
  deliveryDays: z.number().int().min(1).max(60).default(7),
  pin: z.string().length(4),
});

const ESCROW_FEE_PERCENT = 1.5;

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const buyer = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!buyer?.pin) return err("Set a transaction PIN before creating escrow", 400);

    const pinValid = await bcrypt.compare(parsed.data.pin, buyer.pin);
    if (!pinValid) return err("Incorrect PIN", 401);

    const seller = await prisma.user.findFirst({
      where: {
        OR: [{ username: parsed.data.seller }, { phone: parsed.data.seller }, { email: parsed.data.seller }],
        isActive: true,
        isFrozen: false,
      },
    });
    if (!seller) return err("Seller not found", 404);
    if (seller.id === buyer.id) return err("You cannot create escrow with yourself");

    const fee = Number(((parsed.data.amount * ESCROW_FEE_PERCENT) / 100).toFixed(2));

    const deal = await prisma.$transaction(async (tx: TxClient) => {
      const createdDeal = await tx.escrowDeal.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          title: parsed.data.title,
          description: parsed.data.description,
          amount: parsed.data.amount,
          fee,
          deliveryDays: parsed.data.deliveryDays,
          status: "FUNDED",
          fundedAt: new Date(),
        },
      });

      await applyWalletTransaction({
        userId: buyer.id,
        type: "ESCROW_LOCK",
        amount: parsed.data.amount,
        fee,
        description: `Escrow funded - ${parsed.data.title}`,
        relatedId: createdDeal.id,
        direction: "debit",
        tx,
      });

      await tx.notification.create({
        data: {
          userId: seller.id,
          title: "Escrow Deal Funded",
          body: `@${buyer.username} funded an escrow deal: ${parsed.data.title}`,
          type: "ESCROW_FUNDED",
          metadata: { escrowId: createdDeal.id },
        },
      });

      return createdDeal;
    });

    return created({ deal, message: "Escrow deal created and funded" });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const deals = await prisma.escrowDeal.findMany({
      where: { OR: [{ buyerId: session.sub }, { sellerId: session.sub }] },
      include: {
        buyer: { select: { username: true, profile: { select: { firstName: true, lastName: true } } } },
        seller: { select: { username: true, profile: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ deals });
  } catch (e) {
    return handleError(e);
  }
}
