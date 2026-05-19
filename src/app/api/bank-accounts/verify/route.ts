import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ok, err, handleError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** Verify bank account name via Paystack. */
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const bankCode      = searchParams.get("bankCode");
    const accountNumber = searchParams.get("accountNumber");

    if (!bankCode || !accountNumber || accountNumber.length !== 10) {
      return err("bankCode and 10-digit accountNumber are required");
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) return err("Payment provider not configured", 503);

    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: { Authorization: `Bearer ${paystackKey}` } }
    );

    const data = await res.json() as { status: boolean; data?: { account_name: string; account_number: string } };

    if (!res.ok || !data.status) return err("Could not verify account. Check details and try again.", 422);

    return ok({
      accountName:   data.data!.account_name,
      accountNumber: data.data!.account_number,
    });
  } catch (e) {
    return handleError(e);
  }
}
