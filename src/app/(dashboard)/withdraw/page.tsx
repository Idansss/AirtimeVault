"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle, Plus } from "lucide-react";
import { withdrawalSchema, type WithdrawalInput } from "@/lib/validations/withdrawal";
import { WITHDRAWAL_FEES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";
import { useToast } from "@/components/ui/toast";
import { useBankAccounts } from "@/hooks/use-bank-accounts";
import { api, FetchError } from "@/lib/api/client";

function getWithdrawalFee(amount: number) {
  const tier = WITHDRAWAL_FEES.find((f) => amount >= f.min && amount <= f.max);
  return tier?.fee ?? 0;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
}

interface WithdrawalResult {
  reference: string;
  amount: number;
  netAmount: number;
  fee: number;
  bankName: string;
}

export default function WithdrawPage() {
  const { accounts, loading: accountsLoading } = useBankAccounts();
  const [result, setResult]                    = useState<WithdrawalResult | null>(null);
  const { toast }                              = useToast();

  const { register, handleSubmit, watch, reset, setValue, formState: { errors, isSubmitting } } = useForm<WithdrawalInput>({
    resolver: zodResolver(withdrawalSchema),
  });

  const amount        = watch("amount") ?? 0;
  const bankAccountId = watch("bankAccountId") ?? "";
  const fee           = getWithdrawalFee(amount);
  const net           = Math.max(0, amount - fee);

  async function onSubmit(data: WithdrawalInput) {
    try {
      const res = await api.post<{ withdrawal: WithdrawalResult }>("/api/withdrawals", data);
      setResult(res.withdrawal);
      reset();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Withdrawal failed. Please try again.", "error");
    }
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center gap-5 py-12">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Withdrawal Initiated!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Your withdrawal is being processed.</p>
        </div>
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Reference</span>
            <code className="text-slate-700 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{result.reference}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Amount</span>
            <span className="font-semibold text-slate-800 dark:text-white">{fmt(result.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Fee</span>
            <span className="font-semibold text-red-500">- {fmt(result.fee)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 dark:border-slate-800 pt-3">
            <span className="text-slate-500 dark:text-slate-400">You will receive</span>
            <span className="font-bold text-emerald-600">{fmt(result.netAmount)}</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 text-center">
          Funds will be sent to your bank within 1–24 hours.
        </p>
        <Button onClick={() => setResult(null)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8">
          Make Another Withdrawal
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Withdraw Funds</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Transfer your wallet balance to your Nigerian bank account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bank Account</label>
          {accountsLoading ? (
            <div className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
          ) : accounts.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
              <p className="text-sm text-slate-500 mb-2">No bank accounts saved yet.</p>
              <a href="/profile" className="text-sm text-emerald-600 font-medium hover:underline inline-flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add a bank account in your profile
              </a>
            </div>
          ) : (
            <AppSelect
              value={bankAccountId}
              placeholder="Select bank account"
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.bankName} - ${a.accountNumber}`,
                description: `${a.accountName}${a.isDefault ? " - Default" : ""}`,
              }))}
              onChange={(value) => setValue("bankAccountId", value, { shouldDirty: true, shouldValidate: true })}
            />
          )}
          {errors.bankAccountId && <p className="text-red-500 text-xs mt-1">{errors.bankAccountId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount (₦)</label>
          <input
            {...register("amount", { valueAsNumber: true })}
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="e.g. 5000"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        {amount > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Withdrawal amount</span>
              <span className="font-medium">{fmt(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Processing fee</span>
              <span className="font-medium text-red-500">- {fmt(fee)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="font-semibold text-slate-800 dark:text-white">You will receive</span>
              <span className="font-bold text-emerald-700 text-base">{fmt(net)}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Transaction PIN</label>
          <input
            {...register("pin")}
            type="password"
            maxLength={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors tracking-widest text-center text-xl"
            placeholder="••••"
          />
          {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || accountsLoading || accounts.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {isSubmitting ? "Processing…" : "Withdraw Funds"}
        </Button>
      </form>

      <p className="text-xs text-slate-400 text-center">
        Withdrawals are processed within 1–24 hours. Gold members get 3 free withdrawals per month.
      </p>
    </div>
  );
}
