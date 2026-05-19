import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/sumsub";

export const dynamic = "force-dynamic";

interface SumsubEvent {
  type:            string;
  applicantId:     string;
  externalUserId:  string;
  reviewStatus?:   string;
  reviewResult?: {
    reviewAnswer:      "GREEN" | "RED";
    rejectLabels?:     string[];
    reviewRejectType?: string;
    moderationComment?: string;
  };
}

export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const sigHeader = req.headers.get("x-payload-digest") ?? "";
  const secret    = process.env.SUMSUB_WEBHOOK_SECRET ?? "";

  // Verify signature if secret is configured
  if (secret && !verifyWebhookSignature(rawBody, sigHeader, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: SumsubEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only act on final review events
  if (event.type !== "applicantReviewed" && event.type !== "applicantPending") {
    return NextResponse.json({ ok: true });
  }

  const kyc = await prisma.kYCRecord.findFirst({
    where: { externalRef: event.applicantId },
  });

  if (!kyc) {
    // Try by externalUserId
    const kycByUser = await prisma.kYCRecord.findUnique({
      where: { userId: event.externalUserId },
    });
    if (!kycByUser) return NextResponse.json({ ok: true });

    await updateKYC(kycByUser.userId, event);
    return NextResponse.json({ ok: true });
  }

  await updateKYC(kyc.userId, event);
  return NextResponse.json({ ok: true });
}

async function updateKYC(userId: string, event: SumsubEvent) {
  const answer = event.reviewResult?.reviewAnswer;
  const isApproved = answer === "GREEN";
  const isRejected = answer === "RED" &&
    event.reviewResult?.reviewRejectType === "FINAL";

  if (event.type === "applicantPending") {
    await prisma.kYCRecord.update({
      where: { userId },
      data:  { status: "UNDER_REVIEW" },
    });
    return;
  }

  if (isApproved) {
    const kycRecord = await prisma.kYCRecord.findUnique({ where: { userId } });
    const newLevel  = kycRecord?.level === "LEVEL_2" ? "LEVEL_2" : "LEVEL_1";

    await prisma.kYCRecord.update({
      where: { userId },
      data:  { status: "APPROVED", verifiedAt: new Date() },
    });

    // Upgrade user's KYC level
    await prisma.user.update({
      where: { id: userId },
      data:  { kycLevel: newLevel },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId,
        title: "Identity Verified!",
        body:  `Your identity verification was successful. Your transaction limits have been upgraded.`,
        type:  "KYC_APPROVED",
      },
    });
  } else if (isRejected) {
    const reason = event.reviewResult?.moderationComment
      ?? event.reviewResult?.rejectLabels?.join(", ")
      ?? "Verification failed.";

    await prisma.kYCRecord.update({
      where: { userId },
      data:  { status: "REJECTED", rejectionReason: reason },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Verification Unsuccessful",
        body:  `Your identity verification could not be completed. Reason: ${reason}. You may resubmit.`,
        type:  "KYC_REJECTED",
      },
    });
  }
}
