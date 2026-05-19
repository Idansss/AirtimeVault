import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin  = await requireAdmin(req);
    const { id } = await params;
    const { isResolved } = await req.json();

    const flag = await prisma.fraudFlag.findUnique({ where: { id } });
    if (!flag) return err("Fraud flag not found", 404);

    const updated = await prisma.fraudFlag.update({
      where: { id },
      data:  { isResolved: Boolean(isResolved) },
    });

    await prisma.auditLog.create({
      data: {
        userId:   admin.sub,
        action:   "FRAUD_FLAG_RESOLVED",
        entity:   "FraudFlag",
        entityId: id,
      },
    });

    return ok({ flag: updated });
  } catch (e) {
    return handleError(e);
  }
}
