import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_AVATAR_BYTES = 900 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const formData = await req.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) return err("Upload an image file");
    if (!ALLOWED_TYPES.has(file.type)) return err("Only JPG, PNG, and WebP images are supported");
    if (file.size > MAX_AVATAR_BYTES) return err("Display picture must be 900KB or smaller");

    const buffer = Buffer.from(await file.arrayBuffer());
    const avatarUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    const profile = await prisma.profile.upsert({
      where: { userId: session.sub },
      create: {
        userId: session.sub,
        firstName: "",
        lastName: "",
        avatarUrl,
      },
      update: { avatarUrl },
    });

    return ok({ avatarUrl: profile.avatarUrl });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    await prisma.profile.updateMany({
      where: { userId: session.sub },
      data: { avatarUrl: null },
    });

    return ok({ avatarUrl: null });
  } catch (e) {
    return handleError(e);
  }
}
