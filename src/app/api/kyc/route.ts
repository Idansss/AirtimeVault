import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const kycSchema = z.object({
  level:      z.enum(["LEVEL_1", "LEVEL_2"]),
  bvn:        z.string().length(11).optional(),
  nin:        z.string().length(11).optional(),
  idType:     z.string().optional(),
  idNumber:   z.string().optional(),
  selfieUrl:  z.string().url().optional(),
  idUrl:      z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const kyc     = await prisma.kYCRecord.findUnique({ where: { userId: session.sub } });
    return ok({ kyc });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body    = await req.json();
    const parsed  = kycSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const { level, bvn, nin, idType, idNumber, selfieUrl, idUrl } = parsed.data;

    if (level === "LEVEL_1" && !bvn && !nin) return err("BVN or NIN required for Level 1 KYC");
    if (level === "LEVEL_2" && (!selfieUrl || !idUrl)) return err("Selfie and ID document required for Level 2 KYC");

    if (process.env.KYC_MANUAL_REVIEW !== "true") {
      return err("Use the embedded identity verification flow or enable manual KYC review", 503);
    }

    const kyc = await prisma.kYCRecord.upsert({
      where:  { userId: session.sub },
      create: { userId: session.sub, level, status: "PENDING", bvn, nin, idType, idNumber, selfieUrl, idUrl },
      update: { level, status: "PENDING", bvn, nin, idType, idNumber, selfieUrl, idUrl },
    });

    return ok({ kyc, message: "KYC submitted for review. You will be notified within 24 hours." });
  } catch (e) {
    return handleError(e);
  }
}
