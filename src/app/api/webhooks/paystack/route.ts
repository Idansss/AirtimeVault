import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) return false;
  const hash   = crypto.createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (event.event) {
      case "transfer.success": {
        const reference = event.data.reference as string;
        await prisma.withdrawal.updateMany({
          where: { reference },
          data:  { status: "SUCCESSFUL", providerRef: String(event.data.id ?? ""), processedAt: new Date() },
        });
        break;
      }
      case "transfer.failed":
      case "transfer.reversed": {
        const reference = event.data.reference as string;
        const withdrawal = await prisma.withdrawal.findFirst({ where: { reference } });
        if (withdrawal) {
          if (withdrawal.status === "REVERSED" || withdrawal.status === "FAILED") break;
          // Refund wallet
          const wallet = await prisma.wallet.findUnique({ where: { userId: withdrawal.userId } });
          if (wallet) {
            const balanceBefore = Number(wallet.availableBalance);
            const balanceAfter  = balanceBefore + Number(withdrawal.amount);
            await prisma.$transaction([
              prisma.withdrawal.update({
                where: { id: withdrawal.id },
                data:  { status: "REVERSED", failureReason: String(event.data.reason ?? "Transfer failed") },
              }),
              prisma.wallet.update({
                where: { id: wallet.id },
                data:  { availableBalance: balanceAfter },
              }),
              prisma.walletLedger.create({
                data: {
                  walletId:     wallet.id,
                  type:         "REVERSAL",
                  status:       "COMPLETED",
                  amount:       withdrawal.amount,
                  balanceBefore,
                  balanceAfter,
                  description:  `Withdrawal reversal — ${reference}`,
                  relatedId:    withdrawal.id,
                },
              }),
            ]);
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  return NextResponse.json({ received: true });
}
