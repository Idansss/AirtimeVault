import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, UtensilsCrossed, Laptop, Shirt, Ticket, Truck,
  GraduationCap, CheckCircle2, Clock, Store, ExternalLink, Building2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { NotifyMeButton } from "./NotifyMeButton";

const CATEGORY_META: Record<string, {
  name: string; category: string; status: "Onboarding" | "Planned";
  Icon: React.ElementType; color: string; keywords: string[];
  description: string;
}> = {
  food: {
    name: "Food Vendors", category: "Food & Dining", status: "Onboarding",
    Icon: UtensilsCrossed, color: "orange",
    keywords: ["food", "restaurant", "catering", "vendor", "kitchen", "meal", "cuisine"],
    description: "Restaurants and food businesses accepting AirtimeVault wallet payments.",
  },
  digital: {
    name: "Digital Products", category: "Digital Goods", status: "Planned",
    Icon: Laptop, color: "violet", keywords: [],
    description: "Courses, ebooks, templates, and digital products from verified sellers.",
  },
  fashion: {
    name: "Fashion Stores", category: "Fashion", status: "Planned",
    Icon: Shirt, color: "pink", keywords: [],
    description: "Verified clothing and accessories stores for wallet-funded purchases.",
  },
  events: {
    name: "Event Tickets", category: "Events", status: "Planned",
    Icon: Ticket, color: "blue", keywords: [],
    description: "Ticket vendors accepting AirtimeVault payments through links or invoices.",
  },
  logistics: {
    name: "Logistics Partners", category: "Logistics", status: "Planned",
    Icon: Truck, color: "indigo", keywords: [],
    description: "Delivery businesses for merchant order fulfillment and customer support.",
  },
  education: {
    name: "School Vendors", category: "Education", status: "Planned",
    Icon: GraduationCap, color: "teal", keywords: [],
    description: "Training centers, schools, exam pins, and learning products.",
  },
};

const COLOR_MAP: Record<string, {
  hero: string; iconBg: string; iconText: string; badge: string;
  badgeText: string; accent: string; border: string;
}> = {
  orange: {
    hero:      "from-orange-500 to-amber-600",
    iconBg:    "bg-orange-100 dark:bg-orange-500/20",
    iconText:  "text-orange-600 dark:text-orange-400",
    badge:     "bg-orange-100 dark:bg-orange-500/20",
    badgeText: "text-orange-700 dark:text-orange-300",
    accent:    "text-orange-600 dark:text-orange-400",
    border:    "border-orange-200 dark:border-orange-500/30",
  },
  violet: {
    hero:      "from-violet-500 to-purple-700",
    iconBg:    "bg-violet-100 dark:bg-violet-500/20",
    iconText:  "text-violet-600 dark:text-violet-400",
    badge:     "bg-violet-100 dark:bg-violet-500/20",
    badgeText: "text-violet-700 dark:text-violet-300",
    accent:    "text-violet-600 dark:text-violet-400",
    border:    "border-violet-200 dark:border-violet-500/30",
  },
  pink: {
    hero:      "from-pink-500 to-rose-600",
    iconBg:    "bg-pink-100 dark:bg-pink-500/20",
    iconText:  "text-pink-600 dark:text-pink-400",
    badge:     "bg-pink-100 dark:bg-pink-500/20",
    badgeText: "text-pink-700 dark:text-pink-300",
    accent:    "text-pink-600 dark:text-pink-400",
    border:    "border-pink-200 dark:border-pink-500/30",
  },
  blue: {
    hero:      "from-blue-500 to-cyan-600",
    iconBg:    "bg-blue-100 dark:bg-blue-500/20",
    iconText:  "text-blue-600 dark:text-blue-400",
    badge:     "bg-blue-100 dark:bg-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-300",
    accent:    "text-blue-600 dark:text-blue-400",
    border:    "border-blue-200 dark:border-blue-500/30",
  },
  indigo: {
    hero:      "from-indigo-500 to-blue-700",
    iconBg:    "bg-indigo-100 dark:bg-indigo-500/20",
    iconText:  "text-indigo-600 dark:text-indigo-400",
    badge:     "bg-indigo-100 dark:bg-indigo-500/20",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    accent:    "text-indigo-600 dark:text-indigo-400",
    border:    "border-indigo-200 dark:border-indigo-500/30",
  },
  teal: {
    hero:      "from-teal-500 to-emerald-600",
    iconBg:    "bg-teal-100 dark:bg-teal-500/20",
    iconText:  "text-teal-600 dark:text-teal-400",
    badge:     "bg-teal-100 dark:bg-teal-500/20",
    badgeText: "text-teal-700 dark:text-teal-300",
    accent:    "text-teal-600 dark:text-teal-400",
    border:    "border-teal-200 dark:border-teal-500/30",
  },
};

async function getApprovedMerchants(keywords: string[]) {
  if (keywords.length === 0) return [];
  return prisma.merchant.findMany({
    where: {
      status: "APPROVED",
      OR: keywords.map((k) => ({ businessType: { contains: k, mode: "insensitive" as const } })),
    },
    select: { id: true, businessName: true, businessType: true, createdAt: true },
    orderBy: { businessName: "asc" },
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) notFound();

  const c = COLOR_MAP[meta.color];
  const merchants = await getApprovedMerchants(meta.keywords);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Back */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {/* Hero */}
      <div className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${c.hero} p-8 text-white shadow-xl`}>
        <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <meta.Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">{meta.category}</p>
            <h1 className="text-2xl font-bold">{meta.name}</h1>
            <p className="text-white/80 text-sm mt-1.5 max-w-lg">{meta.description}</p>
          </div>
          {meta.status === "Onboarding" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 rounded-full px-3 py-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Onboarding
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 rounded-full px-3 py-1 shrink-0">
              <Clock className="w-3 h-3" /> Planned
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {meta.status === "Onboarding" ? (
        <OnboardingContent merchants={merchants} />
      ) : (
        <PlannedContent meta={meta} c={c} category={category} />
      )}
    </div>
  );
}

type Merchant = { id: string; businessName: string; businessType: string; createdAt: Date };

function OnboardingContent({
  merchants,
}: {
  merchants: Merchant[];
}) {
  if (merchants.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Store className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-white text-lg">No verified vendors yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            We&apos;re currently onboarding food vendors. Check back soon or apply to become a merchant.
          </p>
        </div>
        <Link
          href="/merchant"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Apply as Merchant <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {merchants.length} verified vendor{merchants.length !== 1 ? "s" : ""} available
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {merchants.map((m) => (
          <div
            key={m.id}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">{m.businessName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">{m.businessType}</p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-full px-2 py-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500" /> Verified
              </span>
            </div>
            <button
              type="button"
              disabled
              className="shrink-0 text-xs font-semibold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 cursor-not-allowed"
            >
              Pay with Wallet
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/20 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400">
        Wallet checkout will be enabled once payment links and settlement operations go live.
      </div>
    </div>
  );
}

function PlannedContent({
  meta, c, category,
}: {
  meta: (typeof CATEGORY_META)[string];
  c: (typeof COLOR_MAP)[string];
  category: string;
}) {
  const perks = [
    "Browse verified vendors in one place",
    "Pay directly from your AirtimeVault wallet",
    "Instant payment confirmation",
    "Dispute protection on all purchases",
  ];

  return (
    <div className="space-y-5">
      {/* Coming soon hero card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
        <div className={`w-20 h-20 rounded-2xl ${c.iconBg} flex items-center justify-center`}>
          <meta.Icon className={`w-10 h-10 ${c.iconText}`} />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full px-3 py-1 mb-3">
            <Clock className="w-3 h-3" /> Coming Soon
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{meta.name} is on its way</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
            We&apos;re actively verifying and onboarding {meta.category.toLowerCase()} partners. Get notified the moment this category goes live.
          </p>
        </div>

        {/* Notify me */}
        <NotifyMeButton category={category} label={meta.name} />
      </div>

      {/* What to expect */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">What to expect</h3>
        <div className="space-y-3">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{perk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Merchant CTA */}
      <div className={`border ${c.border} rounded-2xl p-5 flex items-center gap-4 bg-white dark:bg-slate-900`}>
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
          <Store className={`w-5 h-5 ${c.iconText}`} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800 dark:text-white text-sm">Own a {meta.category.toLowerCase()} business?</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Apply early to be among the first listed merchants.</p>
        </div>
        <Link
          href="/merchant"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          Apply <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
