import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { ok, created, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const merchantSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.string().min(2),
  cacNumber: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const merchant = await prisma.merchant.findUnique({ where: { userId: session.sub } });
    return ok({ merchant });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = merchantSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const existing = await prisma.merchant.findUnique({ where: { userId: session.sub } });
    if (existing) return err("Merchant profile already exists", 409);

    const merchant = await prisma.merchant.create({
      data: {
        userId: session.sub,
        businessName: parsed.data.businessName,
        businessType: parsed.data.businessType,
        cacNumber: parsed.data.cacNumber,
        webhookUrl: parsed.data.webhookUrl || null,
        status: "PENDING",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.sub,
        action: "MERCHANT_APPLICATION",
        entity: "Merchant",
        entityId: merchant.id,
        newValue: { businessName: merchant.businessName, businessType: merchant.businessType },
      },
    });

    return created({ merchant, message: "Merchant application submitted" });
  } catch (e) {
    return handleError(e);
  }
}
