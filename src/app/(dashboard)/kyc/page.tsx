"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Shield, CheckCircle2, Clock, XCircle, Loader2,
  ChevronRight, AlertCircle, RefreshCw, Camera, Lock, Zap,
} from "lucide-react";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

// Sumsub WebSDK is not SSR-compatible — lazy load on client only
const SumsubWebSdk = dynamic(() => import("@sumsub/websdk-react"), { ssr: false });

type KYCLevel  = "LEVEL_1" | "LEVEL_2";
type KYCStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

interface KYCRecord {
  id:          string;
  level:       KYCLevel;
  status:      KYCStatus;
  externalRef?: string;
  rejectionReason?: string;
  verifiedAt?: string;
}

const TIERS = [
  { level: "BASIC",    limit: "₦10,000/day",    desc: "Default — no verification needed",   badge: "bg-slate-100 text-slate-600 dark:text-slate-400"    },
  { level: "LEVEL_1",  limit: "₦100,000/day",   desc: "Standard document check",            badge: "bg-amber-100 text-amber-700 dark:text-amber-300"    },
  { level: "LEVEL_2",  limit: "₦500,000/day",   desc: "Document + selfie / liveness",       badge: "bg-blue-100 text-blue-700 dark:text-blue-300"      },
  { level: "BUSINESS", limit: "₦5,000,000/day", desc: "Business registration (admin only)", badge: "bg-purple-100 text-purple-700"  },
];

const STATUS_UI: Record<KYCStatus, { label: string; icon: React.ReactNode; className: string }> = {
  PENDING:      { label: "Submitted",   icon: <Clock        className="w-4 h-4" />, className: "text-amber-600  bg-amber-50  border-amber-200"  },
  UNDER_REVIEW: { label: "Under Review",icon: <Clock        className="w-4 h-4" />, className: "text-blue-600   bg-blue-50   border-blue-200"   },
  APPROVED:     { label: "Verified ✓",  icon: <CheckCircle2 className="w-4 h-4" />, className: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  REJECTED:     { label: "Rejected",    icon: <XCircle      className="w-4 h-4" />, className: "text-red-600    bg-red-50    border-red-200"    },
};

type UIState = "idle" | "starting" | "sdk" | "submitted" | "no_keys";

export default function KYCPage() {
  const { toast } = useToast();

  const [kyc, setKyc]               = useState<KYCRecord | null>(null);
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<KYCLevel>("LEVEL_1");
  const [uiState, setUiState]       = useState<UIState>("idle");
  const [sdkToken, setSdkToken]     = useState<string | null>(null);

  const loadKYC = useCallback(() => {
    api.get<{ kyc: KYCRecord | null }>("/api/kyc")
      .then((d) => setKyc(d.kyc))
      .catch(() => {})
      .finally(() => setLoadingKyc(false));
  }, []);

  useEffect(() => { loadKYC(); }, [loadKYC]);

  async function startVerification() {
    setUiState("starting");
    try {
      const data = await api.post<{ token: string }>("/api/kyc/token", { level: selectedLevel });
      setSdkToken(data.token);
      setUiState("sdk");
    } catch (e) {
      if (e instanceof FetchError && e.status === 503) {
        setUiState("no_keys");
      } else {
        toast(e instanceof FetchError ? e.message : "Failed to start verification", "error");
        setUiState("idle");
      }
    }
  }

  // Refresh token when it expires mid-flow
  async function handleTokenExpire(): Promise<string> {
    const data = await api.post<{ token: string }>("/api/kyc/token", { level: selectedLevel });
    return data.token;
  }

  // Called by the SDK on every step change / completion
  function handleMessage(type: string, payload: Record<string, unknown>) {
    if (type === "idCheck.onApplicantStatusChanged") {
      const status = payload?.reviewStatus as string | undefined;
      if (status === "completed" || status === "onHold") {
        setUiState("submitted");
        // Reload KYC record so the status badge updates
        setTimeout(loadKYC, 1500);
      }
    }
    if (type === "idCheck.onError") {
      toast("Verification error. Please try again.", "error");
      setUiState("idle");
    }
  }

  if (loadingKyc) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Identity Verification</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Verify your identity to unlock higher transaction limits.</p>
      </div>

      {/* Tier overview */}
      <div className="grid gap-2">
        {TIERS.map(({ level, limit, desc, badge }) => (
          <div key={level} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 dark:border-slate-800">
            <div className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${badge}`}>
              {level.replace("_", " ")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{limit}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </div>
        ))}
      </div>

      {/* Current status */}
      {kyc && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${STATUS_UI[kyc.status].className}`}>
          <div className="mt-0.5">{STATUS_UI[kyc.status].icon}</div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {kyc.level.replace("_", " ")} — {STATUS_UI[kyc.status].label}
            </p>
            {kyc.status === "PENDING"      && <p className="text-xs opacity-75 mt-0.5">Your documents are queued for review. Usually takes under 2 minutes.</p>}
            {kyc.status === "UNDER_REVIEW" && <p className="text-xs opacity-75 mt-0.5">A reviewer is checking your documents. You&apos;ll be notified when complete.</p>}
            {kyc.status === "APPROVED"     && <p className="text-xs opacity-75 mt-0.5">Your identity is verified. You can now transact up to your tier limit.</p>}
            {kyc.status === "REJECTED"     && kyc.rejectionReason && (
              <p className="text-xs opacity-75 mt-0.5">Reason: {kyc.rejectionReason}</p>
            )}
          </div>
          {kyc.status === "REJECTED" && (
            <button type="button" onClick={() => setUiState("idle")} aria-label="Resubmit verification" className="shrink-0">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ── Sumsub SDK widget ── */}
      {uiState === "sdk" && sdkToken && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-800 dark:text-white">Identity Check — Powered by Sumsub</span>
            </div>
            <button
              type="button"
              onClick={() => { setUiState("idle"); setSdkToken(null); }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="min-h-[500px]">
            <SumsubWebSdk
              accessToken={sdkToken}
              expirationHandler={handleTokenExpire}
              config={{ lang: "en" }}
              options={{ addViewportTag: false, adaptIframeHeight: true }}
              onMessage={handleMessage}
              onError={() => { toast("Verification session error. Please try again.", "error"); setUiState("idle"); }}
            />
          </div>
        </div>
      )}

      {/* ── Submitted confirmation ── */}
      {uiState === "submitted" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Documents Submitted</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Your identity verification is being processed. You will receive a notification when it&apos;s complete — usually within 1–2 minutes.
          </p>
          <button
            type="button"
            onClick={() => { setUiState("idle"); loadKYC(); }}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Back to KYC Status
          </button>
        </div>
      )}

      {/* ── Unconfigured (no API keys) ── */}
      {uiState === "no_keys" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-500/30 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">KYC Provider Not Configured</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                To enable identity verification, add your Sumsub credentials to the server environment:
              </p>
              <div className="mt-3 bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-300 space-y-1">
                <p>SUMSUB_APP_TOKEN=<span className="text-emerald-400">your_app_token</span></p>
                <p>SUMSUB_SECRET_KEY=<span className="text-emerald-400">your_secret_key</span></p>
                <p>SUMSUB_WEBHOOK_SECRET=<span className="text-emerald-400">your_webhook_secret</span></p>
              </div>
              <p className="text-slate-400 text-xs mt-2">
                Get your keys from the{" "}
                <span className="text-emerald-600 font-medium">Sumsub Dashboard → Settings → API Keys</span>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUiState("idle")}
            className="mt-4 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Go back
          </button>
        </div>
      )}

      {/* ── Start verification form (idle, not yet approved) ── */}
      {(uiState === "idle" || uiState === "starting") && kyc?.status !== "APPROVED" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">
                {kyc?.status === "REJECTED" ? "Resubmit Verification" : "Start Identity Verification"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Sumsub — takes 1–2 minutes</p>
            </div>
          </div>

          {/* Level selector */}
          <div className="flex gap-3 mb-5">
            {(["LEVEL_1", "LEVEL_2"] as KYCLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  selectedLevel === lvl
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {lvl === "LEVEL_1" ? "Level 1" : "Level 2"}
                <span className="block text-xs font-normal mt-0.5 opacity-70">
                  {lvl === "LEVEL_1" ? "ID document only" : "ID + selfie / liveness"}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { Icon: Camera, label: "Take a photo or upload from device",               color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10"    },
              { Icon: Lock,   label: "256-bit encrypted — never stored on our servers",  color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
              { Icon: Zap,    label: "Automated result in under 2 minutes",              color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
            ].map(({ Icon, label, color }) => (
              <div key={label} className="text-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">{label}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={startVerification}
            disabled={uiState === "starting"}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors"
          >
            {uiState === "starting"
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
              : <><Shield className="w-4 h-4" /> Begin Verification</>
            }
          </button>
        </div>
      )}

      {/* ── Already approved ── */}
      {kyc?.status === "APPROVED" && uiState === "idle" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 p-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="font-bold text-slate-900 dark:text-white mb-1">Identity Verified</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Your {kyc.level.replace("_", " ")} verification is complete.
            {kyc.verifiedAt && (
              <> Verified on {new Date(kyc.verifiedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}.</>
            )}
          </p>
          {kyc.level === "LEVEL_1" && (
            <button
              type="button"
              onClick={() => { setSelectedLevel("LEVEL_2"); setUiState("idle"); }}
              className="mt-4 text-sm text-emerald-600 font-medium hover:underline"
            >
              Upgrade to Level 2 (₦500K/day) →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
