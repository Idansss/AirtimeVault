import Link from "next/link";
import { ArrowLeft, FileText, Shield, Cookie, AlertTriangle, RotateCcw, UserCheck, Lock, Ban, Trash2, Handshake, ChevronRight } from "lucide-react";

const pages = [
  { label: "Terms of Service",      href: "/legal/terms",              Icon: FileText,     color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10",  border: "group-hover:border-emerald-400/50" },
  { label: "Privacy Policy",        href: "/legal/privacy",            Icon: Shield,       color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-500/10",        border: "group-hover:border-blue-400/50" },
  { label: "Cookie Policy",         href: "/legal/cookies",            Icon: Cookie,       color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10",      border: "group-hover:border-amber-400/50" },
  { label: "AML Policy",            href: "/legal/aml",                Icon: AlertTriangle,color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-500/10",          border: "group-hover:border-red-400/50" },
  { label: "Refund Policy",         href: "/legal/refund",             Icon: RotateCcw,    color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-50 dark:bg-violet-500/10",    border: "group-hover:border-violet-400/50" },
  { label: "KYC Policy",            href: "/legal/kyc",                Icon: UserCheck,    color: "text-cyan-600 dark:text-cyan-400",       bg: "bg-cyan-50 dark:bg-cyan-500/10",        border: "group-hover:border-cyan-400/50" },
  { label: "Escrow Policy",         href: "/legal/escrow",             Icon: Lock,         color: "text-slate-600 dark:text-slate-400",     bg: "bg-slate-100 dark:bg-slate-700/40",     border: "group-hover:border-slate-400/50" },
  { label: "Acceptable Use Policy", href: "/legal/acceptable-use",     Icon: Ban,          color: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-500/10",    border: "group-hover:border-orange-400/50" },
  { label: "Data Deletion Policy",  href: "/legal/data-deletion",      Icon: Trash2,       color: "text-pink-600 dark:text-pink-400",       bg: "bg-pink-50 dark:bg-pink-500/10",        border: "group-hover:border-pink-400/50" },
  { label: "Merchant Agreement",    href: "/legal/merchant-agreement", Icon: Handshake,    color: "text-teal-600 dark:text-teal-400",       bg: "bg-teal-50 dark:bg-teal-500/10",        border: "group-hover:border-teal-400/50" },
];

export default function LegalIndexPage() {
  return (
    <main className="min-h-screen bg-[#F6F5F1] dark:bg-[#0D1117] px-5 py-10 md:py-16">
      <div className="max-w-3xl mx-auto">

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Shield className="w-3.5 h-3.5" />
            Legal &amp; Compliance
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Legal Documents
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
            Operational policies governing how AirtimeVault handles your data, transactions, and account.
          </p>
        </div>

        {/* Policy cards */}
        <div className="grid sm:grid-cols-2 gap-3">
          {pages.map(({ label, href, Icon, color, bg, border }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${border} rounded-2xl p-4 transition-all duration-200 hover:shadow-md dark:hover:shadow-slate-900/50 hover:-translate-y-0.5`}
            >
              <div className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {label}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-slate-400 dark:text-slate-600 text-center leading-relaxed">
          These policies are product drafts. Please consult a qualified legal adviser before relying on them.
        </p>
      </div>
    </main>
  );
}
