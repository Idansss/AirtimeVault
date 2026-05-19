import Link from "next/link";
import { ArrowLeft, LifeBuoy, CreditCard, AlertCircle, BadgeCheck, ChevronRight, Mail, MessageCircle, Phone } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/constants";

const topics = [
  {
    Icon: CreditCard,
    title: "Converting Airtime",
    body: "Submit a request, send the exact airtime amount to the displayed number, then wait for admin verification (usually within 30 minutes).",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    Icon: CreditCard,
    title: "Withdrawals",
    body: "Add a verified bank account under Profile → Bank Accounts, enter an amount, and confirm with your 4-digit transaction PIN.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    Icon: AlertCircle,
    title: "Failed Transactions",
    body: "Open a support ticket with your transaction reference number and any proof of payment. Our team reviews within 24 hours.",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
  },
  {
    Icon: BadgeCheck,
    title: "KYC Verification",
    body: "Use the Identity Verification page in your dashboard to upload a valid government-issued ID and unlock higher limits.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
];

const channels = [
  {
    Icon: Mail,
    label: "Email Support",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    note: "Response within 24 hours",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    value: SUPPORT_WHATSAPP,
    href: `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`,
    note: "Mon – Fri, 9 AM – 6 PM WAT",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    Icon: Phone,
    label: "Live Chat",
    value: "Start a conversation",
    href: "/contact",
    note: "Available during business hours",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#F6F5F1] dark:bg-[#0D1117] px-5 py-10 md:py-16">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <LifeBuoy className="w-3.5 h-3.5" />
            Help &amp; Support
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            How can we help?
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
            Find answers to common questions or reach our team directly.
          </p>
        </div>

        {/* Topics */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Common Topics</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {topics.map(({ Icon, title, body, color, bg }) => (
            <div
              key={title}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"
            >
              <div className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1.5">{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Contact channels */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Contact Us</h2>
        <div className="space-y-3">
          {channels.map(({ Icon, label, value, href, note, color, bg }) => (
            <a
              key={label}
              href={href}
              className="group flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-slate-900/50"
            >
              <div className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{value}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400 dark:text-slate-500">{note}</p>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 mt-0.5 ml-auto transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
