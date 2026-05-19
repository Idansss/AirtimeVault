import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

const schema = z.object({
  identifier: z.string().min(1),
  code:       z.string().length(6),
  purpose:    z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Invalid input");

    const { identifier, code, purpose } = parsed.data;
    const isEmail = identifier.includes("@");

    const otp = await prisma.oTPCode.findFirst({
      where: {
        ...(isEmail ? { email: identifier } : { phone: identifier }),
        code,
        purpose,
        usedAt:    null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) return err("Invalid or expired OTP", 400);

    await prisma.oTPCode.update({
      where: { id: otp.id },
      data:  { usedAt: new Date() },
    });

    // Mark phone/email verified on the user if applicable
    const session = await requireAuth(req).catch(() => null);
    if (session && (purpose === "PHONE_VERIFY" || purpose === "EMAIL_VERIFY")) {
      await prisma.user.update({
        where: { id: session.sub },
        data: {
          ...(purpose === "PHONE_VERIFY" ? { phoneVerified: true } : { emailVerified: true }),
        },
      });
    }

    return ok({ verified: true });
  } catch (e) {
    return handleError(e);
  }
}
