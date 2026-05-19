"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: "Weak",   color: "bg-red-500"    };
  if (score <= 3) return { score, label: "Fair",   color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "Good",   color: "bg-blue-500"   };
  return              { score, label: "Strong", color: "bg-emerald-500" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError]         = useState("");
  const [password, setPassword]         = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setApiError("");
    try {
      const regRes  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const regJson = await regRes.json();
      if (!regRes.ok) {
        const msg = typeof regJson.error === "string"
          ? regJson.error
          : "Registration failed. Please try again.";
        setApiError(msg);
        return;
      }

      const loginRes = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ identifier: data.email, password: data.password }),
      });
      if (!loginRes.ok) {
        setApiError("Account created but login failed. Please sign in manually.");
        router.push("/login");
        return;
      }

      await fetch("/api/auth/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ identifier: data.phone, purpose: "PHONE_VERIFY" }),
      });

      router.push(`/verify?type=phone&identifier=${encodeURIComponent(data.phone)}`);
    } catch {
      setApiError("Network error. Please check your connection.");
    }
  }

  const strength = getPasswordStrength(password);

  return (
    <div className="w-full max-w-lg">
      <div className="glass-strong rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Create your account</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Join AirtimeVault — free and takes under 2 minutes</p>

        {apiError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
              <input
                id="firstName"
                {...register("firstName")}
                placeholder="John"
                className="glass-input w-full px-4 py-3"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
              <input
                id="lastName"
                {...register("lastName")}
                placeholder="Doe"
                className="glass-input w-full px-4 py-3"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
            <input
              id="email"
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              className="glass-input w-full px-4 py-3"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
            <input
              id="phone"
              {...register("phone")}
              type="tel"
              autoComplete="tel"
              placeholder="08012345678"
              className="glass-input w-full px-4 py-3"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
            <input
              id="username"
              {...register("username")}
              autoComplete="username"
              placeholder="johndoe"
              className="glass-input w-full px-4 py-3"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                {...register("password", { onChange: (e) => setPassword(e.target.value) })}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="glass-input w-full px-4 py-3 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-slate-200 dark:bg-slate-700"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">{strength.label}</p>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="referralCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Referral Code <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="referralCode"
              {...register("referralCode")}
              placeholder="Enter referral code"
              className="glass-input w-full px-4 py-3"
            />
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p>
              By creating an account you agree to our{" "}
              <Link href="/legal/terms" className="text-emerald-600 dark:text-emerald-400 hover:underline">Terms of Service</Link> and{" "}
              <Link href="/legal/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Policy</Link>.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_32px_rgba(16,185,129,0.45)]"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
