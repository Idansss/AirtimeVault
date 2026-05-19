import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, Clock, MapPin, ChevronRight } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/constants";

const channels = [
  {
    Icon: Mail,
    label: "Email Support",
    description: "Send us a message and we'll respond within 24 hours.",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    cta: "Send Email",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "hover:border-blue-300 dark:hover:border-blue-500/40",
  },
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    description: "Chat with our support team in real time during business hours.",
    value: SUPPORT_WHATSAPP,
    href: `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`,
    cta: "Open WhatsApp",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "hover:border-emerald-300 dark:hover:border-emerald-500/40",
  },
];

const faqs = [
  {
    q: "How long does a conversion take?",
    a: "Most conversions are verified and credited within 30 minutes after we confirm receipt of airtime.",
  },
  {
    q: "My transaction shows 'pending' — what do I do?",
    a: "Pending transactions are under review. If it stays pending for over 2 hours, contact support with your reference number.",
  },
  {
    q: "How do I reset my transaction PIN?",
    a: "Go to Profile → Security → Reset PIN. You'll need to verify your identity before setting a new PIN.",
  },
  {
    q: "Is my money safe with AirtimeVault?",
    a: "Yes. Wallet funds are held in partner accounts and are not used for any other purpose. All activity is logged and auditable.",
  },
];

export default function ContactPage() {
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
            <Mail className="w-3.5 h-3.5" />
            Contact Us
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            We&apos;re here to help.
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
            Reach our team via email or WhatsApp. We respond fast.
          </p>
        </div>

        {/* Contact channels */}
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {channels.map(({ Icon, label, description, value, href, cta, color, bg, border }) => (
            <div
              key={label}
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${border} rounded-2xl p-6 transition-all hover:shadow-md dark:hover:shadow-slate-900/50 hover:-translate-y-0.5`}
            >
              <div className={`${bg} ${color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-slate-900 dark:text-white mb-1">{label}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{description}</p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mb-4">{value}</p>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold ${color} hover:opacity-80 transition-opacity`}
              >
                {cta} <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>

        {/* Business info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-5">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-0.5">Business Hours</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Monday – Friday, 9 AM – 6 PM WAT</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Emergency support: 24/7 via email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-0.5">Location</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Lagos, Nigeria</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Remote-first team</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 mt-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-1 h-4 rounded-full bg-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1.5">{q}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
