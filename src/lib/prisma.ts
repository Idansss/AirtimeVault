import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL env var is required");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Lazy singleton: not instantiated until first use, so build-time import is safe.
export function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return createClient();
  }
  if (!global.__prisma) {
    global.__prisma = createClient();
  }
  return global.__prisma;
}

// Convenience re-export for existing code; calling the getter on each property
// access is safe because the underlying PrismaClient methods are functions.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as never)[prop as keyof PrismaClient];
  },
});
