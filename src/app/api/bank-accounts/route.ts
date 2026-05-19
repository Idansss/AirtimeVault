import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { ok, created, err, handleError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const addSchema = z.object({
  bankCode: z.string().min(1, "Select a bank"),
  accountNumber: z.string().length(10, "Account number must be 10 digits"),
  accountName: z.string().min(2).optional(),
  bankName: z.string().min(1, "Bank name required"),
  setAsDefault: z.boolean().optional(),
});

async function resolveAccountName(bankCode: string, accountNumber: string) {
  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackKey) return null;

  const res = await fetch(
    `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers: { Authorization: `Bearer ${paystackKey}` } }
  );
  const data = await res.json() as { status: boolean; data?: { account_name: string } };
  if (!res.ok || !data.status || !data.data?.account_name) return null;
  return data.data.account_name;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const accounts = await prisma.bankAccount.findMany({
      where: { userId: session.sub },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return ok({ accounts });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const { bankCode, accountNumber, bankName, setAsDefault } = parsed.data;

    const existing = await prisma.bankAccount.findUnique({
      where: { userId_accountNumber: { userId: session.sub, accountNumber } },
    });
    if (existing) return err("This account number is already saved", 409);

    const resolvedName = await resolveAccountName(bankCode, accountNumber);
    if (!resolvedName && process.env.BANK_MANUAL_VERIFICATION !== "true") {
      return err("Bank verification provider is not configured", 503);
    }
    const accountName = resolvedName ?? parsed.data.accountName;
    if (!accountName) return err("Account name is required when manual verification is enabled");

    if (setAsDefault) {
      await prisma.bankAccount.updateMany({
        where: { userId: session.sub },
        data: { isDefault: false },
      });
    }

    const account = await prisma.bankAccount.create({
      data: {
        userId: session.sub,
        bankCode,
        bankName,
        accountNumber,
        accountName,
        isDefault: setAsDefault ?? false,
      },
    });

    return created({ account });
  } catch (e) {
    return handleError(e);
  }
}
