import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { upsertApplicant, getAccessToken, SUMSUB_LEVEL_1, SUMSUB_LEVEL_2 } from "@/lib/sumsub";

export const dynamic = "force-dynamic";

const schema = z.object({
  level: z.enum(["LEVEL_1", "LEVEL_2"]),
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
      return err("KYC provider not configured. Please contact support.", 503);
    }

    const session = await requireAuth(req);
    const body    = await req.json();
    const parsed  = schema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const { level } = parsed.data;
    const levelName = level === "LEVEL_1" ? SUMSUB_LEVEL_1 : SUMSUB_LEVEL_2;

    const user = await prisma.user.findUnique({
      where:   { id: session.sub },
      select:  { id: true, email: true },
    });
    if (!user) return err("User not found", 404);

    // Create or retrieve applicant, then get a fresh SDK token
    const applicant = await upsertApplicant(user.id, user.email, levelName);

    // Save the applicant ID so the webhook can look up the user
    await prisma.kYCRecord.upsert({
      where:  { userId: session.sub },
      create: { userId: session.sub, level, status: "PENDING", externalRef: applicant.id },
      update: { level, status: "PENDING", externalRef: applicant.id },
    });

    const token = await getAccessToken(user.id, levelName);
    return ok({ token, applicantId: applicant.id });
  } catch (e) {
    return handleError(e);
  }
}
