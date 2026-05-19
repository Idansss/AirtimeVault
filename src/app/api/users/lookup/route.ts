import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q || q.length < 2) return err("Enter at least 2 characters");

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: q }, { phone: q }, { email: q }],
        isActive: true,
        isFrozen: false,
      },
      select: {
        id:      true,
        username: true,
        phone:   true,
        profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    if (!user) return err("User not found", 404);

    return ok({
      user: {
        id:       user.id,
        username: user.username,
        name:     `${user.profile?.firstName ?? ""} ${user.profile?.lastName ?? ""}`.trim(),
        avatarUrl: user.profile?.avatarUrl ?? null,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
