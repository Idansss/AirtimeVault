"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Search, CheckCircle } from "lucide-react";
import { transferSchema, type TransferInput } from "@/lib/validations/withdrawal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api, FetchError } from "@/lib/api/client";

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
}

interface RecipientUser { username: string; name: string; }
interface TransferResult { reference: string; amount: number; recipient: string; }

export default function SendMoneyPage() {
  const [recipient, setRecipient] = useState<RecipientUser | null>(null);
  const [looking, setLooking]     = useState(false);
  const [result, setResult]       = useState<TransferResult | null>(null);
  const { toast }                 = useToast();

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<TransferInput>({
    resolver: zodResolver(transferSchema),
  });

  const amount = watch("amount") ?? 0;

  async function lookupRecipient(identifier: string) {
    if (!identifier.trim()) return;
    setLooking(true);
    setRecipient(null);
    try {
      const data = await api.get<{ user: RecipientUser }>(`/api/users/lookup?q=${encodeURIComponent(identifier)}`);
      setRecipient(data.user ?? null);
      if (!data.user) toast("User not found", "error");
    } catch {
      toast("User not found", "error");
    } finally {
      setLooking(false);
    }
  }

  async function onSubmit(data: TransferInput) {
    try {
      const res = await api.post<{ transfer: TransferResult }>("/api/transfers", data);
      setResult(res.transfer);
      reset();
      setRecipient(null);
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Transfer failed. Please try again.", "error");
    }
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center gap-5 py-12">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transfer Successful!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{fmt(result.amount)} sent to @{result.recipient}</p>
        </div>
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Reference</span>
            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{result.reference}</code>
          </div>
        </div>
        <Button onClick={() => setResult(null)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8">
          Send More Money
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Send Money</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Transfer funds to another AirtimeVault user instantly.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Recipient</label>
          <div className="relative">
            <input
              {...register("recipient")}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Username, phone, or email"
              onBlur={(e) => lookupRecipient(e.target.value)}
            />
            <button
              type="button"
              aria-label="Look up recipient"
              onClick={() => lookupRecipient(watch("recipient"))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <Search className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          {errors.recipient && <p className="text-red-500 text-xs mt-1">{errors.recipient.message}</p>}
          {looking && <p className="text-slate-400 text-xs mt-1">Looking up user…</p>}
          {recipient && (
            <div className="mt-2 flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
              <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {recipient.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{recipient.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">@{recipient.username}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount (₦)</label>
          <input
            {...register("amount", { valueAsNumber: true })}
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="e.g. 1000"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        {amount > 0 && recipient && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Sending <span className="font-bold text-slate-900 dark:text-white">{fmt(amount)}</span> to{" "}
              <span className="font-bold text-slate-900 dark:text-white">{recipient.name}</span>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Note (optional)</label>
          <input
            {...register("note")}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="What is this for?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Transaction PIN</label>
          <input
            {...register("pin")}
            type="password"
            maxLength={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 tracking-widest text-center text-xl"
            placeholder="••••"
          />
          {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !recipient}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {isSubmitting ? "Sending…" : "Send Money"}
        </Button>
      </form>
    </div>
  );
}
