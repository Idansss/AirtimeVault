"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, CheckCircle2, ChevronLeft } from "lucide-react";

const PIN_LENGTH = 4;

type Step = "enter" | "confirm";

function PinInput({
  value,
  onChange,
  label,
  error,
}: {
  value: string[];
  onChange: (digits: string[]) => void;
  label: string;
  error?: string;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[idx]  = char;
    onChange(next);
    if (char && idx < PIN_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    const next  = Array(PIN_LENGTH).fill("");
    paste.split("").forEach((c, i) => { next[i] = c; });
    onChange(next);
    const focusIdx = Math.min(paste.length, PIN_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 text-center">{label}</p>
      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {value.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`PIN digit ${i + 1}`}
            className="glass-input w-14 h-16 text-center text-2xl font-bold"
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}

export default function SetupPinPage() {
  const router = useRouter();
  const [step, setStep]         = useState<Step>("enter");
  const [pin, setPin]           = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [confirm, setConfirm]   = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const pinCode     = pin.join("");
  const confirmCode = confirm.join("");

  function handleNext() {
    if (pinCode.length < PIN_LENGTH) return;
    setStep("confirm");
    setConfirm(Array(PIN_LENGTH).fill(""));
  }

  function handleBack() {
    setStep("enter");
    setApiError("");
  }

  async function handleSubmit() {
    if (confirmCode.length < PIN_LENGTH) return;
    if (pinCode !== confirmCode) {
      setApiError("PINs do not match. Please try again.");
      setConfirm(Array(PIN_LENGTH).fill(""));
      return;
    }
    setApiError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/set-pin", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pin: pinCode, confirmPin: confirmCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setApiError(json.error ?? "Failed to set PIN. Please try again.");
        return;
      }
      setDone(true);
      setTimeout(() => { router.push("/dashboard"); }, 1500);
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="glass-strong rounded-2xl p-10">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">PIN set successfully!</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-strong rounded-2xl p-8">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {step === "enter" ? "Create your PIN" : "Confirm your PIN"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
          {step === "enter"
            ? "Choose a 4-digit PIN you'll use to authorise every transaction."
            : "Enter your PIN again to confirm."}
        </p>

        {apiError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm text-center">
            {apiError}
          </div>
        )}

        {step === "enter" ? (
          <>
            <PinInput value={pin} onChange={setPin} label="Enter a 4-digit PIN" />
            <button
              type="button"
              onClick={handleNext}
              disabled={pinCode.length < PIN_LENGTH}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_32px_rgba(16,185,129,0.45)] mt-6"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <PinInput value={confirm} onChange={setConfirm} label="Re-enter your PIN" />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={confirmCode.length < PIN_LENGTH || loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_32px_rgba(16,185,129,0.45)] mt-6"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving PIN…" : "Set PIN & Continue"}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm mt-3 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          </>
        )}

        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <p className="text-emerald-600 dark:text-emerald-400 text-xs text-center">
            Your PIN is encrypted and never stored in plain text. Keep it private — never share it with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
