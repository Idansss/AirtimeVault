import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "PENDING";
    const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit  = Math.min(100, Number(searchParams.get("limit") ?? 20));

    const [records, total] = await Promise.all([
      prisma.kYCRecord.findMany({
        where:   { status: status as never },
        include: {
          user: { select: { username: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.kYCRecord.count({ where: { status: status as never } }),
    ]);

    return ok({ records, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleError(e);
  }
}

const approveSchema = z.object({
  userId:         z.string(),
  action:         z.enum(["APPROVE", "REJECT"]),
  rejectionReason:z.string().optional(),
  kycLevel:       z.enum(["LEVEL_1", "LEVEL_2", "BUSINESS"]).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const admin  = await requireAdmin(req);
    const body   = await req.json();
    const parsed = approveSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const { userId, action, rejectionReason, kycLevel } = parsed.data;

    const kyc = await prisma.kYCRecord.findUnique({ where: { userId } });
    if (!kyc) return err("KYC record not found", 404);

    if (action === "APPROVE") {
      const level = kycLevel ?? kyc.level;
      await prisma.$transaction([
        prisma.kYCRecord.update({
          where: { userId },
          data:  { status: "APPROVED", verifiedAt: new Date() },
        }),
        prisma.user.update({
          where: { id: userId },
          data:  { kycLevel: level },
        }),
      ]);

      await prisma.notification.create({
        data: {
          userId,
          title: "KYC Approved",
          body:  `Your identity has been verified (${level.replace("_", " ")}). Your transaction limits have been upgraded.`,
          type:  "KYC_APPROVED",
        },
      });
    } else {
      await prisma.kYCRecord.update({
        where: { userId },
        data:  { status: "REJECTED", rejectionReason },
      });

      await prisma.notification.create({
        data: {
          userId,
          title: "KYC Not Approved",
          body:  rejectionReason ?? "Your KYC submission could not be verified. Please resubmit.",
          type:  "KYC_REJECTED",
        },
      });
    }

    await prisma.auditLog.create({
      data: { userId: admin.sub, action: `KYC_${action}`, entity: "KYCRecord", entityId: kyc.id },
    });

    return ok({ message: `KYC ${action.toLowerCase()}d` });
  } catch (e) {
    return handleError(e);
  }
}
