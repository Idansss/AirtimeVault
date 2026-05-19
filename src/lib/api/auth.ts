import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export interface SessionPayload {
  sub:      string;
  email:    string;
  role:     string;
  username: string;
}

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new ApiError(500, "JWT secret is not configured");
  }
  return new TextEncoder().encode(value ?? "dev-secret-change-me");
}

export async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get("av_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Use in Server Components and Server Actions (reads from next/headers). */
export async function getServerSession(): Promise<SessionPayload | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("av_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest): Promise<SessionPayload> {
  const session = await getSession(req);
  if (!session) throw new ApiError(401, "Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { email: true, role: true, username: true, isActive: true, isFrozen: true },
  });
  if (!user) throw new ApiError(401, "Unauthorized");
  if (!user.isActive || user.isFrozen) throw new ApiError(403, "Account is restricted. Contact support.");

  return {
    sub: session.sub,
    email: user.email,
    role: user.role,
    username: user.username,
  };
}

export async function requireAdmin(req: NextRequest): Promise<SessionPayload> {
  const session = await requireAuth(req);
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Forbidden");
  }
  return session;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
