import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { setPinSchema } from "@/lib/validations/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body    = await req.json();
    const parsed  = setPinSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const pinHash = await bcrypt.hash(parsed.data.pin, 10);

    await prisma.user.update({
      where: { id: session.sub },
      data:  { pin: pinHash },
    });

    return ok({ message: "PIN set successfully" });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { oldPin, pin, confirmPin } = await req.json();

    if (!oldPin || !pin || pin !== confirmPin) return err("Invalid PIN data");

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user?.pin) return err("No PIN set. Use POST to set a new PIN.");

    const valid = await bcrypt.compare(oldPin, user.pin);
    if (!valid) return err("Current PIN is incorrect", 401);

    const pinHash = await bcrypt.hash(pin, 10);
    await prisma.user.update({ where: { id: session.sub }, data: { pin: pinHash } });

    return ok({ message: "PIN updated" });
  } catch (e) {
    return handleError(e);
  }
}
