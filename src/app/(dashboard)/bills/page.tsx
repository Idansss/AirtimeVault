"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { CheckCircle, Zap, Tv, Wifi, Phone, BookOpen, GraduationCap, Bus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BILL_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";
import { useToast } from "@/components/ui/toast";
import { api, FetchError } from "@/lib/api/client";

// ─── Network detection (for AIRTIME / DATA cross-validation) ──────────────────
const PHONE_PREFIXES: [string, string][] = [
  ["0703","MTN"],["0706","MTN"],["0803","MTN"],["0806","MTN"],
  ["0810","MTN"],["0813","MTN"],["0814","MTN"],["0816","MTN"],
  ["0903","MTN"],["0906","MTN"],["0913","MTN"],["0916","MTN"],
  ["0701","AIRTEL"],["0708","AIRTEL"],["0802","AIRTEL"],["0808","AIRTEL"],
  ["0812","AIRTEL"],["0902","AIRTEL"],["0907","AIRTEL"],["0912","AIRTEL"],
  ["0705","GLO"],["0805","GLO"],["0807","GLO"],["0815","GLO"],
  ["0905","GLO"],["0915","GLO"],
  ["0809","9MOBILE"],["0817","9MOBILE"],["0818","9MOBILE"],
  ["0908","9MOBILE"],["0909","9MOBILE"],
];

function detectPhone(phone: string): string | null {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("234")) d = "0" + d.slice(3);
  if (d.length < 4) return null;
  for (const [prefix, net] of PHONE_PREFIXES) {
    if (d.startsWith(prefix)) return net;
  }
  return null;
}

// ─── Per-category/provider validation ─────────────────────────────────────────
interface VResult { ok: boolean; msg: string }

function validateRecipient(category: string, provider: string, value: string): VResult | null {
  if (!value || value.trim().length < 3) return null;

  if (category === "AIRTIME" || category === "DATA") {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 11) return null;
    const detected = detectPhone(value);
    if (!detected) return { ok: false, msg: "Enter a valid Nigerian phone number (080XXXXXXXXX)" };
    if (detected !== provider) {
      const L: Record<string, string> = { MTN: "MTN", AIRTEL: "Airtel", GLO: "Glo", "9MOBILE": "9mobile" };
      return {
        ok: false,
        msg: `This is a ${L[detected] ?? detected} number. Switch the provider to ${L[detected] ?? detected} to continue.`,
      };
    }
    return { ok: true, msg: `${provider === "9MOBILE" ? "9mobile" : provider} number confirmed` };
  }

  if (category === "ELECTRICITY") {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 11) return null;
    if (digits.length !== 11) return { ok: false, msg: "Electricity meter numbers are exactly 11 digits" };
    return { ok: true, msg: "Meter number format looks correct" };
  }

  if (category === "CABLE_TV") {
    const digits = value.replace(/\D/g, "");
    if (provider === "DSTV" || provider === "GOTV") {
      if (digits.length < 10) return null;
      if (digits.length !== 10) return { ok: false, msg: `${provider === "DSTV" ? "DStv" : "GOtv"} smartcard number must be exactly 10 digits` };
      return { ok: true, msg: "Smartcard number format looks correct" };
    }
    if (provider === "STARTIMES") {
      if (digits.length < 12) return null;
      return { ok: true, msg: "StarTimes smartcard format looks correct" };
    }
    return null;
  }

  if (category === "EXAM_PIN") {
    if (provider === "WAEC") {
      if (value.includes("/") || value.includes("-") || /[A-Za-z]/.test(value.replace(/\s/g, ""))) {
        return { ok: false, msg: "WAEC scratch card PIN is numeric only — looks like you entered a registration number instead" };
      }
      const digits = value.replace(/\D/g, "");
      if (digits.length < 10) return null;
      if (digits.length < 10 || digits.length > 12) return { ok: false, msg: "WAEC scratch card PIN is 10–12 digits" };
      return { ok: true, msg: "WAEC PIN format looks correct" };
    }
    if (provider === "NECO") {
      const digits = value.replace(/\D/g, "");
      if (digits.length >= 10 && !value.includes("/") && !value.includes("-")) {
        return { ok: false, msg: "NECO uses registration numbers (e.g. 9XX/WE/2024/001), not PIN-only digits" };
      }
      return null;
    }
    if (provider === "JAMB") {
      if (value.includes("/")) return { ok: false, msg: "JAMB e-PIN should not contain slashes" };
      if (value.length >= 8) return { ok: true, msg: "JAMB e-PIN format looks correct" };
      return null;
    }
    if (provider === "NABTEB") {
      if (value.length >= 6 && !value.includes("/") && /^\d+$/.test(value.trim())) {
        return { ok: true, msg: "NABTEB PIN format looks correct" };
      }
      return null;
    }
    return null;
  }

  if (category === "INTERNET") {
    if (value.length < 6) return null;
    return { ok: true, msg: "Account number looks valid" };
  }

  if (category === "TRANSPORT") {
    if (provider === "BRT_LAGOS" || provider === "LAGBUS") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 16) return null;
      if (digits.length !== 16) return { ok: false, msg: "Cowry/LAGBUS card number must be 16 digits" };
      return { ok: true, msg: "Card number format looks correct" };
    }
    if (provider === "UBER" || provider === "BOLT") {
      if (value.trim().length < 5) return null;
      return { ok: true, msg: `${provider === "UBER" ? "Uber" : "Bolt"} voucher code looks valid` };
    }
    return null;
  }

  if (category === "SCHOOL") {
    if (provider === "SCHOOL_FEE") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 12) return null;
      if (digits.length !== 12) return { ok: false, msg: "Remita RRR is exactly 12 digits" };
      return { ok: true, msg: "Remita RRR format looks correct" };
    }
    if (provider === "JAMB_REG") {
      if (value.includes("/")) return { ok: false, msg: "JAMB registration number should not contain slashes" };
      if (value.length >= 8) return { ok: true, msg: "JAMB registration format looks correct" };
      return null;
    }
    return null;
  }

  return null;
}

// ─── Field metadata per category / provider ───────────────────────────────────
function getFieldMeta(category: string | null, provider: string): { label: string; placeholder: string; hint: string } {
  if (!category) return { label: "Account / Phone", placeholder: "Enter account number", hint: "" };
  const p = provider.toUpperCase();
  if (category === "AIRTIME" || category === "DATA") {
    const net = p === "9MOBILE" ? "9mobile" : p.charAt(0) + p.slice(1).toLowerCase();
    return { label: "Phone Number", placeholder: "080XXXXXXXXX", hint: `Enter the ${net} phone number to top up` };
  }
  if (category === "ELECTRICITY")
    return { label: "Meter Number", placeholder: "Enter 11-digit meter number", hint: "Your prepaid meter number (printed on meter)" };
  if (category === "CABLE_TV") {
    if (p === "DSTV")      return { label: "Smartcard Number", placeholder: "Enter 10-digit smartcard number", hint: "Found on the back of your DStv decoder" };
    if (p === "GOTV")      return { label: "Smartcard Number", placeholder: "Enter 10-digit smartcard number", hint: "Found on the back of your GOtv decoder" };
    if (p === "STARTIMES") return { label: "Smartcard Number", placeholder: "Enter StarTimes smartcard number", hint: "Found on the back of your StarTimes decoder" };
    return { label: "Smartcard Number", placeholder: "Enter smartcard number", hint: "" };
  }
  if (category === "EXAM_PIN") {
    if (p === "WAEC")   return { label: "Scratch Card PIN", placeholder: "Enter 10–12 digit WAEC PIN", hint: "Numeric PIN from your WAEC scratch card" };
    if (p === "NECO")   return { label: "Registration Number", placeholder: "e.g. 9XX/WE/2024/001/009", hint: "Your NECO examination registration number" };
    if (p === "JAMB")   return { label: "e-PIN / Profile Code", placeholder: "Enter JAMB e-PIN", hint: "From your JAMB profile or scratch card" };
    if (p === "NABTEB") return { label: "PIN", placeholder: "Enter NABTEB PIN", hint: "Numeric PIN from your NABTEB scratch card" };
    return { label: "PIN / Registration", placeholder: "Enter PIN or registration number", hint: "" };
  }
  if (category === "INTERNET") {
    if (p === "SMILE")      return { label: "Smile Account Number", placeholder: "Enter Smile account number", hint: "Found in your Smile app or welcome email" };
    if (p === "SPECTRANET") return { label: "Spectranet Account", placeholder: "Enter Spectranet account number", hint: "Found in your Spectranet portal" };
    return { label: "Account Number", placeholder: "Enter account number", hint: "" };
  }
  if (category === "TRANSPORT") {
    if (p === "BRT_LAGOS" || p === "LAGBUS") return { label: "Cowry Card Number", placeholder: "Enter 16-digit card number", hint: "Printed on the front of your Cowry / LAGBUS card" };
    if (p === "LASTMA")   return { label: "Vehicle Plate / Tag", placeholder: "e.g. KRD-123-EF", hint: "Your LASTMA registered vehicle plate or e-Tag ID" };
    if (p === "UBER")     return { label: "Uber Voucher Code", placeholder: "Enter voucher code", hint: "Alphanumeric code from your Uber voucher" };
    if (p === "BOLT")     return { label: "Bolt Voucher Code", placeholder: "Enter voucher code", hint: "Alphanumeric code from your Bolt voucher" };
    return { label: "Account / Reference", placeholder: "Enter reference", hint: "" };
  }
  if (category === "SCHOOL") {
    if (p === "SCHOOL_FEE") return { label: "Remita RRR", placeholder: "Enter 12-digit Remita RRR", hint: "Remita Retrieval Reference generated by your school" };
    if (p === "JAMB_REG")   return { label: "JAMB Registration Number", placeholder: "Enter JAMB reg number", hint: "From your JAMB profile" };
    if (p === "WAEC_REG")   return { label: "WAEC Candidate Number", placeholder: "Enter candidate number", hint: "From your WAEC registration slip" };
    if (p === "NECO_REG")   return { label: "NECO Registration Number", placeholder: "Enter registration number", hint: "From your NECO registration slip" };
    if (p === "POSTUTME")   return { label: "Exam / Scratch Card Number", placeholder: "Enter scratch card number", hint: "From the institution's Post-UTME scratch card" };
    return { label: "Reference / Number", placeholder: "Enter number", hint: "" };
  }
  return { label: "Account / Phone", placeholder: "Enter account number", hint: "" };
}

// ─── Icons, schema, types ──────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  AIRTIME:     <Phone         className="w-5 h-5" />,
  DATA:        <Wifi          className="w-5 h-5" />,
  ELECTRICITY: <Zap           className="w-5 h-5" />,
  CABLE_TV:    <Tv            className="w-5 h-5" />,
  INTERNET:    <Wifi          className="w-5 h-5" />,
  EXAM_PIN:    <BookOpen      className="w-5 h-5" />,
  SCHOOL:      <GraduationCap className="w-5 h-5" />,
  TRANSPORT:   <Bus           className="w-5 h-5" />,
};

const billSchema = z.object({
  provider:  z.string().min(1, "Select a provider"),
  recipient: z.string().min(3, "Enter recipient account / number"),
  amount:    z.number({ message: "Enter an amount" }).min(50, "Minimum payment is ₦50"),
  pin:       z.string().length(4, "PIN must be 4 digits"),
});
type BillForm = z.infer<typeof billSchema>;
interface Provider { code: string; name: string }

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BillsPage() {
  const [selected,  setSelected]  = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingP,  setLoadingP]  = useState(false);
  const [success,   setSuccess]   = useState(false);
  const { toast }                 = useToast();

  const {
    register, handleSubmit, watch, reset, setValue,
    formState: { errors, isSubmitting },
  } = useForm<BillForm>({ resolver: zodResolver(billSchema) });

  const amount    = watch("amount")    ?? 0;
  const provider  = watch("provider")  ?? "";
  const recipient = watch("recipient") ?? "";

  useEffect(() => {
    if (!selected) return;
    setProviders([]);
    setValue("provider", "");
    setLoadingP(true);
    api.get<{ providers: Provider[] }>(`/api/bills/providers?category=${selected}`)
      .then((d) => setProviders(d.providers))
      .catch(() => toast("Failed to load providers", "error"))
      .finally(() => setLoadingP(false));
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const fieldMeta    = getFieldMeta(selected, provider);
  const validation   = provider && recipient ? validateRecipient(selected!, provider, recipient) : null;
  const hasError     = validation !== null && !validation.ok;
  const hasSuccess   = validation !== null && validation.ok;

  async function onSubmit(data: BillForm) {
    if (hasError) return;
    try {
      await api.post("/api/bills", { category: selected, ...data });
      setSuccess(true);
      reset();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Payment failed. Please try again.", "error");
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center gap-5 py-12">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Successful!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Your bill has been paid successfully.</p>
        </div>
        <Button
          onClick={() => { setSuccess(false); setSelected(null); }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8"
        >
          Make Another Payment
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pay Bills</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Pay your bills directly from your wallet balance.</p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {BILL_CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => { setSelected(value); reset(); }}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              selected === value
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                : "border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-900 dark:border-slate-700"
            }`}
          >
            <div className={selected === value ? "text-emerald-600" : "text-slate-400"}>
              {CATEGORY_ICONS[value] ?? <Phone className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-medium text-center ${selected === value ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">
            {BILL_CATEGORIES.find((c) => c.value === selected)?.label} Payment
          </h2>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Provider</label>
            {loadingP ? (
              <div className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
            ) : (
              <AppSelect
                value={provider}
                placeholder="Select provider"
                options={providers.map((p) => ({ value: p.code, label: p.name }))}
                onChange={(v) => setValue("provider", v, { shouldDirty: true, shouldValidate: true })}
              />
            )}
            {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider.message}</p>}
          </div>

          {/* Recipient with live validation */}
          {provider && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {fieldMeta.label}
              </label>
              <input
                {...register("recipient")}
                placeholder={fieldMeta.placeholder}
                className={`w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:text-white focus:outline-none transition-colors ${
                  hasError
                    ? "border-red-400 dark:border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-500/5"
                    : hasSuccess
                      ? "border-emerald-400 dark:border-emerald-500 focus:border-emerald-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-emerald-500"
                }`}
              />
              {/* Hint text */}
              {!validation && fieldMeta.hint && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{fieldMeta.hint}</p>
              )}
              {/* Mismatch / error */}
              {hasError && (
                <div className="flex items-start gap-2 mt-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-xl px-3.5 py-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-red-700 dark:text-red-400">{validation!.msg}</p>
                </div>
              )}
              {/* Match confirmation */}
              {hasSuccess && (
                <div className="flex items-center gap-2 mt-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-3.5 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{validation!.msg}</p>
                </div>
              )}
              {errors.recipient && !validation && (
                <p className="text-red-500 text-xs mt-1">{errors.recipient.message}</p>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount (₦)</label>
            <input
              {...register("amount", { valueAsNumber: true })}
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="e.g. 2000"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          {amount > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-sm flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Total to pay</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{fmt(amount)}</span>
            </div>
          )}

          {/* PIN */}
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
            disabled={isSubmitting || hasError}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold"
          >
            {isSubmitting
              ? "Processing…"
              : hasError
                ? "Fix the error above to continue"
                : "Pay Now"}
          </Button>
        </form>
      )}
    </div>
  );
}
