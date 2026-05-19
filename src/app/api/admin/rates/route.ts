import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const rateSchema = z.record(
  z.string(),
  z.record(z.string(), z.number().min(1).max(100))
);

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const rates = await prisma.conversionRate.findMany({ where: { isActive: true } });
    return ok({ rates });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const parsed = rateSchema.safeParse(body);
    if (!parsed.success) return err("Rates must be numbers between 1 and 100");

    const updates = await Promise.all(
      Object.entries(parsed.data).flatMap(([network, tiers]) =>
        Object.entries(tiers).map(([tier, ratePercent]) =>
          prisma.conversionRate.upsert({
            where: { network_tier: { network: network as never, tier: tier as never } },
            create: {
              network: network as never,
              tier: tier as never,
              ratePercent,
              minAmount: 500,
              maxAmount: 500000,
              updatedBy: admin.sub,
            },
            update: { ratePercent, updatedBy: admin.sub },
          })
        )
      )
    );

    await prisma.auditLog.create({
      data: {
        userId: admin.sub,
        action: "RATES_UPDATE",
        entity: "ConversionRate",
        newValue: parsed.data,
      },
    });

    return ok({ updated: updates.length });
  } catch (e) {
    return handleError(e);
  }
}
