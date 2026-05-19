import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ok, handleError } from "@/lib/api/response";
import { ApiError } from "@/lib/api/auth";
import { prisma } from "@/lib/prisma";

const FLW_BASE = "https://api.flutterwave.com/v3";

function flwHeaders() {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new ApiError(503, "Card provider is not configured");
  return { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" };
}

async function flw(path: string, options?: RequestInit) {
  const res  = await fetch(`${FLW_BASE}${path}`, { ...options, headers: flwHeaders() });
  const json = await res.json();
  if (json.status !== "success") throw new ApiError(400, json.message ?? "Card provider error");
  return json.data;
}

export const dynamic = "force-dynamic";

async function getOwnedCard(userId: string, id: string) {
  const card = await prisma.virtualCard.findFirst({ where: { id, userId, isActive: true } });
  if (!card) throw new ApiError(404, "Card not found");
  return card;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    const { id }  = await params;
    const card    = await getOwnedCard(session.sub, id);

    // Fetch live details from Flutterwave (includes CVV for display)
    let liveData: Record<string, unknown> = {};
    if (card.providerRef) {
      try { liveData = await flw(`/virtual-cards/${card.providerRef}`); } catch { /* use cached */ }
    }

    return ok({
      card: {
        ...card,
        balance:      Number(card.balance),
        spendingLimit: card.spendingLimit ? Number(card.spendingLimit) : null,
        cvv:          (liveData.cvv as string) ?? null,
        createdAt:    card.createdAt.toISOString(),
        updatedAt:    card.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session        = await requireAuth(req);
    const { id }         = await params;
    const { action, amount, pin } = await req.json();
    const card           = await getOwnedCard(session.sub, id);

    if (action === "freeze") {
      if (card.providerRef) await flw(`/virtual-cards/${card.providerRef}/status/block`, { method: "PUT" });
      await prisma.virtualCard.update({ where: { id }, data: { isFrozen: true } });
      return ok({ message: "Card frozen" });
    }

    if (action === "unfreeze") {
      if (card.providerRef) await flw(`/virtual-cards/${card.providerRef}/status/unblock`, { method: "PUT" });
      await prisma.virtualCard.update({ where: { id }, data: { isFrozen: false } });
      return ok({ message: "Card unfrozen" });
    }

    if (action === "terminate") {
      if (card.providerRef) await flw(`/virtual-cards/${card.providerRef}/terminate`, { method: "PUT" });
      await prisma.virtualCard.update({ where: { id }, data: { isActive: false } });
      return ok({ message: "Card terminated" });
    }

    if (action === "fund") {
      if (!amount || Number(amount) < 1) throw new ApiError(400, "Minimum fund amount is $1");
      if (!pin || String(pin).length !== 4) throw new ApiError(400, "Transaction PIN is required");

      const user = await prisma.user.findUnique({
        where: { id: session.sub }, select: { pin: true },
      });
      const { compare } = await import("bcryptjs");
      if (!user?.pin || !(await compare(String(pin), user.pin))) {
        throw new ApiError(403, "Incorrect PIN");
      }

      const USD_RATE  = 1600;
      const ngnCost      = Number(amount) * USD_RATE;
      const wallet       = await prisma.wallet.findUnique({ where: { userId: session.sub } });
      if (!wallet || Number(wallet.availableBalance) < ngnCost) {
        throw new ApiError(400, `Insufficient balance. Need ₦${ngnCost.toLocaleString()}`);
      }
      const balanceBefore = Number(wallet.availableBalance);
      const balanceAfter  = balanceBefore - ngnCost;

      if (card.providerRef) {
        await flw(`/virtual-cards/${card.providerRef}/fund`, {
          method: "POST",
          body:   JSON.stringify({ debit_currency: "NGN", amount: ngnCost }),
        });
      }

      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: session.sub },
          data:  { availableBalance: { decrement: ngnCost } },
        }),
        prisma.walletLedger.create({
          data: {
            wallet:        { connect: { userId: session.sub } },
            type:          "VIRTUAL_CARD_FUND",
            amount:        ngnCost,
            balanceBefore,
            balanceAfter,
            status:        "COMPLETED",
            reference:     `VCF-${Date.now()}`,
            description:   `Card top-up — $${amount} USD`,
          },
        }),
        prisma.virtualCard.update({
          where: { id },
          data:  { balance: { increment: Number(amount) } },
        }),
      ]);

      return ok({ message: `Card funded with $${amount}` });
    }

    throw new ApiError(400, "Invalid action");
  } catch (e) {
    return handleError(e);
  }
}
