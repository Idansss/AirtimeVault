import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ok, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RATES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    const [user, dbRates] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: session.sub },
        select: { membershipTier: true },
      }),
      prisma.conversionRate.findMany({ where: { isActive: true } }),
    ]);

    const tier = user?.membershipTier ?? "BASIC";

    // Start from hardcoded defaults, then overlay DB values
    const rates: Record<string, Record<string, number>> = JSON.parse(JSON.stringify(DEFAULT_RATES));
    for (const r of dbRates) {
      if (!rates[r.network]) rates[r.network] = {};
      rates[r.network][r.tier] = Number(r.ratePercent);
    }

    return ok({ rates, tier });
  } catch (e) {
    return handleError(e);
  }
}
