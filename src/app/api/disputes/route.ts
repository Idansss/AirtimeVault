import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { ok, created, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const disputeSchema = z.object({
  type:        z.enum(["CONVERSION", "WITHDRAWAL", "TRANSFER", "BILL", "ESCROW", "OTHER"]),
  subject:     z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Please describe the issue in detail (min 20 chars)"),
  escrowId:    z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body    = await req.json();
    const parsed  = disputeSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const dispute = await prisma.dispute.create({
      data: { userId: session.sub, ...parsed.data },
    });

    await prisma.supportTicket.create({
      data: {
        userId:      session.sub,
        subject:     `[Dispute] ${parsed.data.subject}`,
        description: parsed.data.description,
        priority:    "HIGH",
      },
    });

    return created({ dispute, message: "Dispute submitted. Our team will review within 24-48 hours." });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const disputes = await prisma.dispute.findMany({
      where:   { userId: session.sub },
      orderBy: { createdAt: "desc" },
    });
    return ok({ disputes });
  } catch (e) {
    return handleError(e);
  }
}
