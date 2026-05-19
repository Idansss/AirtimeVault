import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, handleError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

const schema = z.object({
  identifier: z.string().min(1),
  purpose:    z.enum(["PHONE_VERIFY", "EMAIL_VERIFY", "WITHDRAW_2FA", "RESET_PIN"]),
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Invalid input");

    const { identifier, purpose } = parsed.data;
    const isEmail = identifier.includes("@");

    const code      = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.oTPCode.create({
      data: {
        ...(isEmail ? { email: identifier } : { phone: identifier }),
        code,
        purpose,
        expiresAt,
      },
    });

    const deliveryMode = process.env.OTP_DELIVERY_MODE ?? (process.env.NODE_ENV === "production" ? "" : "log");
    if (deliveryMode === "log") {
      console.info(`[OTP] ${identifier} -> ${code}`);
    } else {
      return err("OTP delivery provider is not configured", 503);
    }

    return ok({ message: "OTP sent", expiresInMinutes: 10 });
  } catch (e) {
    return handleError(e);
  }
}
