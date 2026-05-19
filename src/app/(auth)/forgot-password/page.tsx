"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="glass-strong rounded-2xl p-10">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            If an account exists for <span className="font-medium text-slate-900 dark:text-white">{email}</span>,
            we&apos;ve sent password reset instructions.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-strong rounded-2xl p-8">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Reset your password</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          Enter the email address on your account and we&apos;ll send reset instructions.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="john@example.com"
              className="glass-input w-full px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={!email || loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_32px_rgba(16,185,129,0.45)]"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6">
          Remembered your password?{" "}
          <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
