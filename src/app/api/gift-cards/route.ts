import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { created, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { applyWalletTransaction } from "@/lib/api/wallet";

export const dynamic = "force-dynamic";

const schema = z.object({
  brand: z.string().min(1),
  denomination: z.number().positive(),
  currency: z.string().default("USD"),
  amount: z.number().positive(),
  pin: z.string().length(4),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    if (process.env.GIFT_CARD_MANUAL_FULFILLMENT !== "true") {
      return err("Gift card provider is not configured", 503);
    }

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user?.pin) return err("Set a transaction PIN before buying gift cards", 400);

    const pinValid = await bcrypt.compare(parsed.data.pin, user.pin);
    if (!pinValid) return err("Incorrect PIN", 401);

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdOrder = await tx.giftCardOrder.create({
        data: {
          userId: session.sub,
          brand: parsed.data.brand,
          denomination: parsed.data.denomination,
          currency: parsed.data.currency,
          amount: parsed.data.amount,
          status: "PENDING",
        },
      });

      await applyWalletTransaction({
        userId: session.sub,
        type: "GIFT_CARD_PURCHASE",
        amount: parsed.data.amount,
        description: `${parsed.data.brand} ${parsed.data.currency} ${parsed.data.denomination} gift card`,
        relatedId: createdOrder.id,
        direction: "debit",
        tx,
      });

      return createdOrder;
    });

    return created({ reference: order.reference, order });
  } catch (e) {
    return handleError(e);
  }
}
