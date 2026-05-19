import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Shield, Cookie, AlertTriangle, RotateCcw, UserCheck, Lock, Ban, Trash2, Handshake } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  terms:              <FileText     className="w-6 h-6" />,
  privacy:            <Shield       className="w-6 h-6" />,
  cookies:            <Cookie       className="w-6 h-6" />,
  aml:                <AlertTriangle className="w-6 h-6" />,
  refund:             <RotateCcw    className="w-6 h-6" />,
  kyc:                <UserCheck    className="w-6 h-6" />,
  escrow:             <Lock         className="w-6 h-6" />,
  "acceptable-use":   <Ban          className="w-6 h-6" />,
  "data-deletion":    <Trash2       className="w-6 h-6" />,
  "merchant-agreement": <Handshake  className="w-6 h-6" />,
};

const COLORS: Record<string, { icon: string; bg: string; accent: string }> = {
  terms:              { icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10",  accent: "bg-emerald-500" },
  privacy:            { icon: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-500/10",        accent: "bg-blue-500" },
  cookies:            { icon: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10",      accent: "bg-amber-500" },
  aml:                { icon: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-500/10",          accent: "bg-red-500" },
  refund:             { icon: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-50 dark:bg-violet-500/10",    accent: "bg-violet-500" },
  kyc:                { icon: "text-cyan-600 dark:text-cyan-400",       bg: "bg-cyan-50 dark:bg-cyan-500/10",        accent: "bg-cyan-500" },
  escrow:             { icon: "text-slate-600 dark:text-slate-400",     bg: "bg-slate-100 dark:bg-slate-700/40",     accent: "bg-slate-500" },
  "acceptable-use":   { icon: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-500/10",   accent: "bg-orange-500" },
  "data-deletion":    { icon: "text-pink-600 dark:text-pink-400",       bg: "bg-pink-50 dark:bg-pink-500/10",        accent: "bg-pink-500" },
  "merchant-agreement": { icon: "text-teal-600 dark:text-teal-400",    bg: "bg-teal-50 dark:bg-teal-500/10",        accent: "bg-teal-500" },
};

const content: Record<string, { title: string; effective: string; sections: { heading: string; paragraphs: string[] }[] }> = {
  terms: {
    title: "Terms of Service",
    effective: "Effective January 1, 2025",
    sections: [
      {
        heading: "Service Overview",
        paragraphs: [
          "AirtimeVault provides wallet and value conversion workflows subject to identity checks, transaction review, limits, and partner availability.",
          "By accessing or using AirtimeVault, you agree to be bound by these Terms of Service and all applicable laws and regulations.",
        ],
      },
      {
        heading: "Transactions &amp; Limits",
        paragraphs: [
          "Transactions may be delayed, rejected, reversed, or held for review where fraud, compliance, provider failure, or user error is suspected.",
          "AirtimeVault reserves the right to impose daily, weekly, or monthly transaction limits based on your KYC verification level.",
        ],
      },
      {
        heading: "Disclaimer",
        paragraphs: [
          "These terms are a product draft and must be reviewed by legal counsel before public launch.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    effective: "Effective January 1, 2025",
    sections: [
      {
        heading: "Data We Collect",
        paragraphs: [
          "AirtimeVault collects account, profile, KYC, transaction, device, and support data needed to operate the service and manage risk.",
          "We may also collect usage analytics and fraud-detection signals to improve service reliability.",
        ],
      },
      {
        heading: "How We Use Your Data",
        paragraphs: [
          "Personal data is processed under the Nigeria Data Protection Act 2023 and any applicable partner requirements.",
          "We do not sell your personal information to third parties. Data is only shared with partners required to deliver the service.",
        ],
      },
      {
        heading: "Your Rights",
        paragraphs: [
          "Users may request correction, export, or deletion of their personal data where legally permitted. Contact support to submit a data request.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    effective: "Effective January 1, 2025",
    sections: [
      {
        heading: "How We Use Cookies",
        paragraphs: [
          "AirtimeVault uses essential cookies for authentication, security, session management, and fraud prevention.",
          "These cookies are strictly necessary for the service to function and cannot be disabled without affecting core functionality.",
        ],
      },
      {
        heading: "Cookie Categories",
        paragraphs: [
          "Session cookies: temporary cookies deleted when you close your browser.",
          "Persistent cookies: stored for a defined period to remember your preferences and keep you signed in.",
        ],
      },
    ],
  },
  aml: {
    title: "AML Policy",
    effective: "Effective January 1, 2025",
    sections: [
      {
        heading: "Our AML Commitment",
        paragraphs: [
          "AirtimeVault monitors suspicious patterns, enforces transaction limits, verifies users, keeps audit logs, and escalates suspicious activity to licensed partners where required.",
        ],
      },
      {
        heading: "Enforcement Actions",
        paragraphs: [
          "High-risk activity may lead to account freeze, delayed settlement, enhanced due diligence, or outright rejection of transactions.",
          "AirtimeVault reserves the right to report suspicious activity to relevant Nigerian financial authorities.",
        ],
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    effective: "Effective January 1, 2025",
    sections: [
      {
        heading: "Refund Eligibility",
        paragraphs: [
          "Refunds and reversals depend on transaction status, provider confirmation, and whether value has already been delivered or consumed.",
          "Failed transactions where funds were debited but value was not delivered are eligible for a full refund within 72 hours.",
        ],
      },
    ],
  },
  kyc: {
    title: "KYC Policy",
    effective: "Effective January 1, 2025",
    sections: [
      {
        heading: "Verification Levels",
        paragraphs: [
          "KYC levels determine wallet limits, withdrawal access, transfer access, and access to higher-risk products.",
          "Level 1 requires a phone number. Level 2 requires a valid government-issued ID. Level 3 requires additional business documentation.",
        ],
      },
    ],
  },
  escrow: {
    title: "Escrow Policy",
    effective: "Effective January 1, 2025",
    sections: [
      {
        heading: "Escrow Release Conditions",
        paragraphs: [
          "Escrow funds are only released after buyer confirmation or dispute resolution under clear evidence rules.",
          "AirtimeVault acts solely as a neutral custodian and does not adjudicate commercial disputes between parties.",
        ],
      },
    ],
  },
  "acceptable-use": {
    title: "Acceptable Use Policy",
    effective: "Effective January 1, 2025",
    sections: [
      {
        heading: "Prohibited Activities",
        paragraphs: [
          "Users may not use AirtimeVault for fraud, unauthorized telecom value resale, illegal betting, money laundering, sanctions evasion, or abusive merchant activity.",
          "Violation of this policy may result in immediate account suspension and reporting to relevant authorities.",
        ],
      },
    ],
  },
  "data-deletion": {
    title: "Data Deletion Policy",
    effective: "Effective January 1, 2025",
    sections: [
      {
        heading: "Deletion Requests",
        paragraphs: [
          "Users may request deletion of their account and associated personal data at any time via the settings page or by contacting support.",
        ],
      },
      {
        heading: "Retention Exceptions",
        paragraphs: [
          "AirtimeVault may retain records required for fraud prevention, financial reporting, dispute resolution, or legal obligations even after a deletion request.",
          "Retained records are stored securely and not used for marketing or product improvement purposes.",
        ],
      },
    ],
  },
  "merchant-agreement": {
    title: "Merchant Agreement",
    effective: "Effective January 1, 2025",
    sections: [
      {
        heading: "Merchant Eligibility",
        paragraphs: [
          "Merchants must complete business verification before accepting wallet payments, using API keys, or receiving settlements.",
        ],
      },
      {
        heading: "Settlement Terms",
        paragraphs: [
          "Settlements are processed on a T+1 basis subject to transaction review and compliance checks.",
          "AirtimeVault reserves the right to withhold settlement for accounts under investigation or with outstanding disputes.",
        ],
      },
    ],
  },
};

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = content[slug];
  if (!page) notFound();

  const color = COLORS[slug] ?? COLORS.terms;
  const icon  = ICONS[slug];

  return (
    <main className="min-h-screen bg-[#F6F5F1] dark:bg-[#0D1117] px-5 py-10 md:py-16">
      <article className="max-w-2xl mx-auto">

        {/* Back button */}
        <Link
          href="/legal"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All Legal Documents
        </Link>

        {/* Header card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 md:p-9 mb-5">
          <div className={`${color.bg} ${color.icon} w-14 h-14 rounded-2xl flex items-center justify-center mb-5`}>
            {icon}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {page.title}
          </h1>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">{page.effective}</p>
        </div>

        {/* Content sections */}
        <div className="space-y-4">
          {page.sections.map((section, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-1 h-5 rounded-full ${color.accent}`} />
                <h2
                  className="font-display text-base font-bold text-slate-900 dark:text-white"
                  dangerouslySetInnerHTML={{ __html: section.heading }}
                />
              </div>
              <div className="space-y-3 pl-4">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl p-5">
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>Draft Notice:</strong> This document is a product draft and must be reviewed by a qualified legal adviser before public launch. It does not constitute legal advice.
          </p>
        </div>
      </article>
    </main>
  );
}
