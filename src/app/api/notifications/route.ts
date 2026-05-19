import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ok, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const page  = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where:   { userId: session.sub, ...(unreadOnly ? { isRead: false } : {}) },
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.notification.count({ where: { userId: session.sub, isRead: false } }),
    ]);

    return ok({ notifications, unreadCount });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { ids } = await req.json() as { ids?: string[] };

    if (ids?.length) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId: session.sub },
        data:  { isRead: true },
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: session.sub, isRead: false },
        data:  { isRead: true },
      });
    }

    return ok({ message: "Marked as read" });
  } catch (e) {
    return handleError(e);
  }
}
