import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where:   { id },
      include: {
        profile:    true,
        kycRecord:  true,
        wallet:     { include: { ledgerEntries: { take: 10, orderBy: { createdAt: "desc" } } } },
        conversions:{ take: 10, orderBy: { createdAt: "desc" } },
        withdrawals:{ take: 10, orderBy: { createdAt: "desc" } },
        fraudFlags: { where: { isResolved: false } },
      },
    });

    if (!user) return err("User not found", 404);
    return ok({ user });
  } catch (e) {
    return handleError(e);
  }
}

const patchSchema = z.object({
  isFrozen:      z.boolean().optional(),
  isActive:      z.boolean().optional(),
  role:          z.enum(["USER","MERCHANT","AGENT","ADMIN","SUPER_ADMIN"]).optional(),
  kycLevel:      z.enum(["LEVEL_0","LEVEL_1","LEVEL_2","BUSINESS"]).optional(),
  membershipTier:z.enum(["BASIC","SILVER","GOLD","BUSINESS"]).optional(),
  adminNote:     z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await params;
    const body   = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const user = await prisma.user.update({
      where: { id },
      data:  parsed.data,
    });

    await prisma.auditLog.create({
      data: {
        userId:   admin.sub,
        action:   "ADMIN_USER_UPDATE",
        entity:   "User",
        entityId: id,
        newValue: parsed.data,
      },
    });

    if (parsed.data.isFrozen) {
      await prisma.notification.create({
        data: {
          userId: id,
          title:  "Account Action",
          body:   "Your account has been reviewed by our team. Contact support for assistance.",
          type:   "ACCOUNT_FROZEN",
        },
      });
    }

    return ok({ user, message: "User updated" });
  } catch (e) {
    return handleError(e);
  }
}
