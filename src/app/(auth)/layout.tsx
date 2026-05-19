import Link from "next/link";
import { Zap, Shield, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AirtimeVaultLogo } from "@/components/ui/airtime-vault-logo";

const PERKS = [
  { icon: Zap,        title: "Convert in under 30 min",  desc: "MTN, Airtel, Glo, and 9mobile all supported"     },
  { icon: Shield,     title: "PIN-protected wallet",     desc: "Every transaction secured with your 4-digit PIN" },
  { icon: TrendingUp, title: "Up to 85% payout rate",   desc: "Higher tiers unlock better conversion rates"     },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen landing-bg text-slate-900 dark:text-white flex dot-grid">

      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[460px] xl:w-[500px] shrink-0 flex-col relative overflow-hidden border-r border-slate-200 dark:border-white/4">
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-violet absolute -top-16 -left-16 w-72 h-72 opacity-25" />
          <div className="orb-teal   absolute bottom-10 -right-8  w-64 h-64 opacity-15" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <AirtimeVaultLogo markClassName="size-9" textClassName="text-xl text-slate-900 dark:text-white" />
          </Link>

          {/* Headline + perks */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="font-display font-extrabold text-4xl xl:text-[2.75rem] leading-[1.06] tracking-tight mb-5">
              Your airtime.<br />
              <span className="bg-linear-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                Real money.
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-10 max-w-[340px]">
              Convert unused airtime into spendable wallet funds. Pay bills, send money, and withdraw to bank — all from one secure place.
            </p>

            <div className="space-y-3">
              {PERKS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="glass flex items-start gap-3.5 rounded-xl px-4 py-3.5">
                  <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-slate-600 dark:text-slate-500 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-400 dark:text-slate-700 text-xs">
            © {new Date().getFullYear()} AirtimeVault Technologies Ltd.
          </p>
        </div>
      </div>

      {/* ── Right form area ── */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Subtle ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-700/5 blur-[110px]" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-emerald-700/5 blur-[90px]" />
        </div>

        {/* Mobile header */}
        <header className="lg:hidden relative z-10 p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center w-fit">
            <AirtimeVaultLogo markClassName="size-8" textClassName="text-lg text-slate-900 dark:text-white" />
          </Link>
          <ThemeToggle className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/8 transition-all" />
        </header>

        {/* Desktop theme toggle */}
        <div className="hidden lg:flex justify-end p-6 relative z-10">
          <ThemeToggle className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/8 transition-all" />
        </div>

        <main className="flex-1 flex items-center justify-center p-4 relative z-10">
          {children}
        </main>

        <footer className="relative z-10 p-6 text-center text-slate-400 dark:text-slate-700 text-xs">
          © {new Date().getFullYear()} AirtimeVault. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
