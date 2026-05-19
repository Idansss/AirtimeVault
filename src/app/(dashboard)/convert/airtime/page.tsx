"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { airtimeConversionSchema, type AirtimeConversionInput } from "@/lib/validations/conversion";
import { NETWORK_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { NetworkLogo, type NetworkKey } from "@/components/ui/network-logo";
import { useToast } from "@/components/ui/toast";
import { useRates } from "@/hooks/use-rates";
import { api, FetchError } from "@/lib/api/client";

// Nigerian number prefix → network
const PREFIX_MAP: [string, string][] = [
  // MTN
  ["0703", "MTN"], ["0706", "MTN"], ["0803", "MTN"], ["0806", "MTN"],
  ["0810", "MTN"], ["0813", "MTN"], ["0814", "MTN"], ["0816", "MTN"],
  ["0903", "MTN"], ["0906", "MTN"], ["0913", "MTN"], ["0916", "MTN"],
  ["07025","MTN"], ["07026","MTN"],
  // Airtel
  ["0701", "AIRTEL"], ["0708", "AIRTEL"], ["0802", "AIRTEL"], ["0808", "AIRTEL"],
  ["0812", "AIRTEL"], ["0902", "AIRTEL"], ["0907", "AIRTEL"], ["0912", "AIRTEL"],
  ["07028","AIRTEL"],
  // Glo
  ["0705", "GLO"], ["0805", "GLO"], ["0807", "GLO"], ["0815", "GLO"],
  ["0905", "GLO"], ["0915", "GLO"],
  // 9Mobile
  ["0809", "NINEMOBILE"], ["0817", "NINEMOBILE"], ["0818", "NINEMOBILE"],
  ["0908", "NINEMOBILE"], ["0909", "NINEMOBILE"],
];

function detectNetwork(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  // Normalize +234... or 234... to 0...
  if (digits.startsWith("234")) digits = "0" + digits.slice(3);
  if (digits.length < 4) return null;
  for (const [prefix, net] of PREFIX_MAP) {
    if (digits.startsWith(prefix)) return net;
  }
  return null;
}

const NETWORKS = ["MTN", "AIRTEL", "GLO", "NINEMOBILE"] as const;

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
}

interface ConversionResult {
  reference: string;
  walletAmount: number;
  airtimeAmount: number;
  network: string;
}

export default function ConvertAirtimePage() {
  const [result, setResult]               = useState<ConversionResult | null>(null);
  const [detectedNetwork, setDetected]    = useState<string | null>(null);
  const { toast }                         = useToast();
  const { tier, loading: ratesLoading, rateFor } = useRates();

  const {
    register, handleSubmit, watch, reset, setValue,
    formState: { errors, isSubmitting },
  } = useForm<AirtimeConversionInput>({
    resolver: zodResolver(airtimeConversionSchema),
    defaultValues: { network: "MTN" },
  });

  const network     = watch("network");
  const phoneNumber = watch("phoneNumber") ?? "";
  const amount      = watch("airtimeAmount") ?? 0;

  // Auto-detect and auto-select network as the user types
  useEffect(() => {
    const detected = detectNetwork(phoneNumber);
    setDetected(detected);
    if (detected) {
      setValue("network", detected as AirtimeConversionInput["network"], { shouldValidate: false });
    }
  }, [phoneNumber, setValue]);

  const mismatch = detectedNetwork !== null && network !== detectedNetwork;

  const liveRate = network ? rateFor(network as NetworkKey) : 0;
  const preview  = !mismatch && network && amount > 0
    ? { walletValue: (amount * liveRate) / 100, rate: liveRate }
    : null;

  async function onSubmit(data: AirtimeConversionInput) {
    if (mismatch) return; // safety guard
    try {
      const res = await api.post<{ conversion: ConversionResult }>("/api/conversions", data);
      setResult(res.conversion);
      reset();
      setDetected(null);
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Submission failed. Please try again.", "error");
    }
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center gap-5 py-12">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Your conversion request has been received.</p>
        </div>
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Reference</span>
            <code className="text-slate-700 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{result.reference}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Airtime amount</span>
            <span className="font-semibold text-slate-800 dark:text-white">{fmt(result.airtimeAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-slate-500 dark:text-slate-400">Expected wallet credit</span>
            <span className="font-bold text-emerald-600">{fmt(result.walletAmount)}</span>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300 w-full">
          <p className="font-semibold mb-1">Next steps</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-600 dark:text-blue-400">
            <li>Send <strong>{fmt(result.airtimeAmount)}</strong> {result.network} airtime to our number</li>
            <li>Your wallet will be credited after admin verification (≤ 30 min)</li>
          </ol>
        </div>
        <Button onClick={() => setResult(null)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8">
          Convert More Airtime
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Convert Airtime</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Send airtime and receive wallet funds instantly.</p>
      </div>

      {/* Rates */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Today&apos;s Rates</h2>
          <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">
            {tier} tier
          </span>
        </div>
        <div className="space-y-2">
          {NETWORKS.map((n) => (
            <div key={n} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <NetworkLogo network={n} size="xs" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{NETWORK_LABELS[n]}</span>
              </div>
              {ratesLoading ? (
                <div className="w-10 h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
              ) : (
                <span className="text-sm font-semibold text-emerald-600">
                  {rateFor(n)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">

        {/* Phone Number — comes FIRST so detection drives network selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
          <div className="relative">
            <input
              {...register("phoneNumber")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors pr-36"
              placeholder="080XXXXXXXX"
              maxLength={14}
            />
            {/* Detection badge */}
            {detectedNetwork && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                <NetworkLogo network={detectedNetwork as NetworkKey} size="xs" />
                {NETWORK_LABELS[detectedNetwork as keyof typeof NETWORK_LABELS]}
              </div>
            )}
          </div>
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
        </div>

        {/* Network selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Network</label>
          <div className="grid grid-cols-4 gap-2">
            {NETWORKS.map((n) => {
              const isSelected  = network === n;
              const isDetected  = detectedNetwork === n;
              const isMismatch  = isSelected && mismatch;
              return (
                <label key={n} className="cursor-pointer">
                  <input {...register("network")} type="radio" value={n} className="sr-only" />
                  <div className={`min-h-24 py-3 px-2 rounded-xl border-2 text-center text-xs font-semibold transition-all flex flex-col items-center justify-center gap-2 ${
                    isMismatch
                      ? "border-red-400 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                      : isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : isDetected
                          ? "border-emerald-300 dark:border-emerald-700 text-slate-600 dark:text-slate-400"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}>
                    <NetworkLogo network={n} size="md" />
                    {NETWORK_LABELS[n]}
                    {isDetected && !isSelected && (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded-full leading-none">detected</span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
          {errors.network && <p className="text-red-500 text-xs mt-1">{errors.network.message}</p>}
        </div>

        {/* Mismatch warning */}
        {mismatch && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-xl p-4">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Network mismatch</p>
              <p className="text-xs text-red-600 dark:text-red-400/80 mt-0.5">
                This number belongs to <strong>{NETWORK_LABELS[detectedNetwork as NetworkKey]}</strong>, but you selected <strong>{NETWORK_LABELS[network as NetworkKey]}</strong>. Sending the wrong network&apos;s airtime will result in a failed conversion.
              </p>
            </div>
          </div>
        )}

        {/* Detected match confirmation */}
        {detectedNetwork && !mismatch && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-3.5 py-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Network verified — this is a <strong className="ml-0.5">{NETWORK_LABELS[detectedNetwork as NetworkKey]}</strong> number.
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Airtime Amount (₦)</label>
          <input
            {...register("airtimeAmount", { valueAsNumber: true })}
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="e.g. 5000"
          />
          {errors.airtimeAmount && <p className="text-red-500 text-xs mt-1">{errors.airtimeAmount.message}</p>}
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Conversion Rate</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{preview.rate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">You will receive</span>
              <span className="font-bold text-emerald-700 text-base">{fmt(preview.walletValue)}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Estimated. Final amount depends on admin verification.</p>
          </div>
        )}

        {/* PIN */}
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
          disabled={isSubmitting || mismatch}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-base"
        >
          {isSubmitting ? "Submitting…" : mismatch ? "Fix network mismatch to continue" : "Submit Conversion Request"}
        </Button>
      </form>

      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-semibold mb-1">How it works</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-600 dark:text-blue-400">
          <li>Submit your conversion request above</li>
          <li>Send the exact airtime amount to our number (shown after submission)</li>
          <li>Receive wallet funds within 30 minutes</li>
        </ol>
      </div>
    </div>
  );
}
