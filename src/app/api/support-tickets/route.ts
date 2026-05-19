import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { ok, created, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = ticketSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.sub,
        subject: parsed.data.subject,
        description: parsed.data.description,
      },
    });

    return created({ ticket, message: "Support ticket submitted" });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.sub },
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return ok({ tickets });
  } catch (e) {
    return handleError(e);
  }
}
