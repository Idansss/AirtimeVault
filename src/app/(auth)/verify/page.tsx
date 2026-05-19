"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

function maskIdentifier(id: string, type: string) {
  if (type === "email" && id.includes("@")) {
    const [local, domain] = id.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  }
  if (id.length >= 7) {
    return `${id.slice(0, 4)}****${id.slice(-3)}`;
  }
  return id;
}

function VerifyContent() {
  const params     = useSearchParams();
  const router     = useRouter();
  const type       = params.get("type") ?? "phone";
  const identifier = params.get("identifier") ?? "";

  const [digits, setDigits]       = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [apiError, setApiError]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [verified, setVerified]   = useState(false);
  const [cooldown, setCooldown]   = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const purpose = type === "email" ? "EMAIL_VERIFY" : "PHONE_VERIFY";

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleDigitChange = (idx: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next  = Array(OTP_LENGTH).fill("");
    paste.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const focusIdx = Math.min(paste.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const sendOtp = useCallback(async () => {
    setResending(true);
    try {
      await fetch("/api/auth/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ identifier, purpose }),
      });
      setCooldown(RESEND_COOLDOWN);
    } finally {
      setResending(false);
    }
  }, [identifier, purpose]);

  async function handleVerify() {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) return;
    setApiError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ identifier, code, purpose }),
      });
      const json = await res.json();
      if (!res.ok || !json.data?.verified) {
        setApiError(json.error ?? "Invalid or expired code. Try again.");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }
      setVerified(true);
      setTimeout(() => { router.push("/setup-pin"); }, 1200);
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const code = digits.join("");

  if (verified) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="glass-strong rounded-2xl p-10">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">Verified!</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Setting up your security PIN…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-strong rounded-2xl p-8">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Verify your {type}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-slate-900 dark:text-white">{maskIdentifier(identifier, type)}</span>
        </p>

        {apiError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            {apiError}
          </div>
        )}

        <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`Digit ${i + 1}`}
              className="glass-input w-12 h-14 text-center text-xl font-bold"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={code.length < OTP_LENGTH || loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_32px_rgba(16,185,129,0.45)] mb-4"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Verifying…" : "Verify Code"}
        </button>

        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Didn&apos;t receive a code?{" "}
          {cooldown > 0 ? (
            <span className="text-slate-400 dark:text-slate-500">Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={sendOtp}
              disabled={resending}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
