import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api/auth";
import { airtimeConversionSchema, dataConversionSchema } from "@/lib/validations/conversion";
import { DEFAULT_RATES } from "@/lib/constants";

async function getActiveRate(network: keyof typeof DEFAULT_RATES, tier: keyof typeof DEFAULT_RATES.MTN) {
  const configured = await prisma.conversionRate.findUnique({
    where: { network_tier: { network, tier } },
  });

  if (configured?.isActive) {
    return {
      ratePercent: Number(configured.ratePercent),
      minAmount:   Number(configured.minAmount),
      maxAmount:   Number(configured.maxAmount),
    };
  }

  return {
    ratePercent: DEFAULT_RATES[network][tier] ?? DEFAULT_RATES[network].BASIC,
    minAmount:   500,
    maxAmount:   500_000,
  };
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req).catch(() => null);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const isDataConversion = body?.kind === "DATA" || body?.isData === true || Boolean(body?.dataBundle);
  const parsed = isDataConversion ? dataConversionSchema.safeParse(body) : airtimeConversionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  if (!user.isActive || user.isFrozen) {
    return NextResponse.json({ success: false, error: "Account is restricted. Contact support." }, { status: 403 });
  }
  if (!user.pin) {
    return NextResponse.json({ success: false, error: "Set a transaction PIN before submitting conversions" }, { status: 400 });
  }

  const pinValid = await bcrypt.compare(String(parsed.data.pin), user.pin);
  if (!pinValid) return NextResponse.json({ success: false, error: "Incorrect PIN" }, { status: 401 });

  if (isDataConversion) {
    const { network, phoneNumber, dataBundle, description } = parsed.data as {
      network: keyof typeof DEFAULT_RATES;
      phoneNumber: string;
      dataBundle: string;
      description?: string;
    };

    const conversion = await prisma.conversionRequest.create({
      data: {
        userId: user.id,
        kind: "DATA",
        network,
        phoneNumber,
        dataBundle,
        description,
        airtimeAmount: 0,
        ratePercent: 0,
        walletAmount: 0,
        status: "UNDER_REVIEW",
      },
    });

    return NextResponse.json({ success: true, data: { conversion } }, { status: 201 });
  }

  const { network, phoneNumber, airtimeAmount, proofUrl } = parsed.data as {
    network: keyof typeof DEFAULT_RATES;
    phoneNumber: string;
    airtimeAmount: number;
    proofUrl?: string;
  };

  const rate = await getActiveRate(network, user.membershipTier as keyof typeof DEFAULT_RATES.MTN);
  if (airtimeAmount < rate.minAmount || airtimeAmount > rate.maxAmount) {
    return NextResponse.json({
      success: false,
      error: `Amount must be between ${rate.minAmount.toLocaleString()} and ${rate.maxAmount.toLocaleString()} for this rate`,
    }, { status: 400 });
  }

  const ratePercent = rate.ratePercent;
  const walletAmount = (airtimeAmount * ratePercent) / 100;

  const conversion = await prisma.conversionRequest.create({
    data: {
      userId: user.id,
      kind: "AIRTIME",
      network,
      phoneNumber,
      airtimeAmount,
      ratePercent,
      walletAmount,
      proofUrl,
      status: "PENDING",
    },
  });

  return NextResponse.json({ success: true, data: { conversion } }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req).catch(() => null);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const conversions = await prisma.conversionRequest.findMany({
    where:   { userId: session.sub },
    orderBy: { createdAt: "desc" },
    take:    20,
  });

  return NextResponse.json({ success: true, data: { conversions } });
}
