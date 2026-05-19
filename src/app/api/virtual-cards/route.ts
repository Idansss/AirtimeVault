import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ok, created, handleError } from "@/lib/api/response";
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

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const cards   = await prisma.virtualCard.findMany({
      where:   { userId: session.sub, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return ok({
      cards: cards.map((c) => ({
        ...c,
        balance:      Number(c.balance),
        spendingLimit: c.spendingLimit ? Number(c.spendingLimit) : null,
        createdAt:    c.createdAt.toISOString(),
        updatedAt:    c.updatedAt.toISOString(),
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { amount, pin } = await req.json();

    if (!amount || Number(amount) < 5) throw new ApiError(400, "Minimum card amount is $5");
    if (!pin || String(pin).length !== 4) throw new ApiError(400, "Transaction PIN is required");

    // Verify PIN
    const user = await prisma.user.findUnique({
      where:  { id: session.sub },
      select: { pin: true, profile: { select: { firstName: true, lastName: true } } },
    });
    if (!user?.pin) throw new ApiError(403, "Please set a transaction PIN first");

    const { compare } = await import("bcryptjs");
    if (!(await compare(String(pin), user.pin))) throw new ApiError(403, "Incorrect PIN");

    // Check existing card (one per user for now)
    const existing = await prisma.virtualCard.findFirst({ where: { userId: session.sub, isActive: true } });
    if (existing) throw new ApiError(400, "You already have an active virtual card");

    // USD rate: deduct NGN equivalent (rate fixed at 1600 NGN/USD)
    const USD_RATE   = 1600;
    const ngnCost    = Number(amount) * USD_RATE;
    const fee        = Math.round(ngnCost * 0.015); // 1.5% creation fee
    const totalDebit = ngnCost + fee;

    const wallet = await prisma.wallet.findUnique({ where: { userId: session.sub } });
    if (!wallet || Number(wallet.availableBalance) < totalDebit) {
      throw new ApiError(400, `Insufficient wallet balance. Need ₦${totalDebit.toLocaleString()}`);
    }
    const balanceBefore = Number(wallet.availableBalance);
    const balanceAfter  = balanceBefore - totalDebit;

    const billingName = user.profile
      ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
      : session.username;

    // Create card on Flutterwave
    const cardData = await flw("/virtual-cards", {
      method: "POST",
      body: JSON.stringify({
        currency:            "USD",
        amount:              Number(amount),
        billing_name:        billingName || "AirtimeVault User",
        billing_address:     "1, AirtimeVault Street",
        billing_city:        "Lagos",
        billing_state:       "Lagos",
        billing_postal_code: "100001",
        billing_country:     "NG",
        callback_url:        `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/flutterwave-card`,
      }),
    });

    // Deduct from wallet + create card record atomically
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: session.sub },
        data:  { availableBalance: { decrement: totalDebit } },
      }),
      prisma.walletLedger.create({
        data: {
          wallet:        { connect: { userId: session.sub } },
          type:          "VIRTUAL_CARD_FUND",
          amount:        totalDebit,
          balanceBefore,
          balanceAfter,
          status:        "COMPLETED",
          reference:     `VCF-${Date.now()}`,
          description:   `Virtual card creation — $${amount} USD`,
        },
      }),
      prisma.virtualCard.create({
        data: {
          userId:       session.sub,
          cardProvider: "flutterwave",
          maskedPan:    cardData.maskedpan ?? cardData.card_pan ?? "•••• •••• •••• ????",
          expiry:       cardData.expiration ?? "",
          currency:     "USD",
          balance:      Number(amount),
          providerRef:  String(cardData.id ?? ""),
        },
      }),
    ]);

    return created({ message: "Virtual card created successfully" });
  } catch (e) {
    return handleError(e);
  }
}
