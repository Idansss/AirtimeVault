import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  firstName:   z.string().min(2).optional(),
  lastName:    z.string().min(2).optional(),
  dateOfBirth: z.string().optional(),
  address:     z.string().optional(),
  state:       z.string().optional(),
}).partial();

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const profile = await prisma.profile.findUnique({
      where: { userId: session.sub },
    });
    return ok({ profile });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body    = await req.json();
    const parsed  = updateSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const { firstName, lastName, dateOfBirth, address, state } = parsed.data;

    const profile = await prisma.profile.upsert({
      where: { userId: session.sub },
      create: {
        userId:      session.sub,
        firstName:   firstName ?? "",
        lastName:    lastName  ?? "",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        address,
        state,
      },
      update: {
        ...(firstName    ? { firstName }                         : {}),
        ...(lastName     ? { lastName }                          : {}),
        ...(dateOfBirth  ? { dateOfBirth: new Date(dateOfBirth) } : {}),
        ...(address      ? { address }                           : {}),
        ...(state        ? { state }                             : {}),
      },
    });

    return ok({ profile });
  } catch (e) {
    return handleError(e);
  }
}
