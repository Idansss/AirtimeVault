import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { ok, created, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { applyWalletTransaction } from "@/lib/api/wallet";

export const dynamic = "force-dynamic";

const billSchema = z.object({
  category: z.string().min(1),
  provider: z.string().min(1),
  recipient: z.string().min(1),
  amount: z.number().min(50, "Minimum bill payment is NGN 50"),
  itemCode: z.string().optional(),
  pin: z.string().length(4),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = billSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const { category, provider, recipient, amount, itemCode, pin } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user?.pin) return err("Set a transaction PIN before making payments", 400);

    const pinValid = await bcrypt.compare(pin, user.pin);
    if (!pinValid) return err("Incorrect PIN", 401);

    if (process.env.BILLS_MANUAL_FULFILLMENT !== "true") {
      return err("Bill payment provider is not configured", 503);
    }

    const payment = await prisma.$transaction(async (tx) => {
      await applyWalletTransaction({
        userId: session.sub,
        type: "BILL_PAYMENT",
        amount,
        description: `${category} payment - ${provider} (${recipient})`,
        direction: "debit",
        tx,
      });

      return tx.billPayment.create({
        data: {
          userId: session.sub,
          category: category as never,
          provider,
          recipient,
          amount,
          itemCode,
          status: "PENDING",
          metadata: { fulfillmentMode: "manual" },
        },
      });
    });

    return created({ payment, message: `${category} payment submitted for manual fulfillment` });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));

    const payments = await prisma.billPayment.findMany({
      where: { userId: session.sub, ...(category ? { category: category as never } : {}) },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return ok({ payments });
  } catch (e) {
    return handleError(e);
  }
}
