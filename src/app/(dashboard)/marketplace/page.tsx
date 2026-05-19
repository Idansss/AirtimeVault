"use client";

import Link from "next/link";
import { UtensilsCrossed, Laptop, Shirt, Ticket, Truck, GraduationCap, ShoppingBag, Sparkles, Clock, CheckCircle2, Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PARTNERS = [
  {
    slug: "food",
    name: "Food Vendors",
    category: "Food & Dining",
    status: "Onboarding",
    description: "Restaurants and small food businesses that can accept wallet payments after merchant verification.",
    Icon: UtensilsCrossed,
    color: "orange",
  },
  {
    slug: "digital",
    name: "Digital Products",
    category: "Digital Goods",
    status: "Planned",
    description: "Courses, ebooks, templates, and other digital products from verified sellers.",
    Icon: Laptop,
    color: "violet",
  },
  {
    slug: "fashion",
    name: "Fashion Stores",
    category: "Fashion",
    status: "Planned",
    description: "Verified clothing and accessories stores for wallet-funded purchases.",
    Icon: Shirt,
    color: "pink",
  },
  {
    slug: "events",
    name: "Event Tickets",
    category: "Events",
    status: "Planned",
    description: "Ticket vendors that can accept AirtimeVault payments through links or invoices.",
    Icon: Ticket,
    color: "blue",
  },
  {
    slug: "logistics",
    name: "Logistics Partners",
    category: "Logistics",
    status: "Planned",
    description: "Delivery businesses for merchant order fulfillment and offline customer support.",
    Icon: Truck,
    color: "indigo",
  },
  {
    slug: "education",
    name: "School Vendors",
    category: "Education",
    status: "Planned",
    description: "Training centers, schools, exam pins, and learning products.",
    Icon: GraduationCap,
    color: "teal",
  },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; text: string; border: string }> = {
  orange: { bg: "bg-orange-50 dark:bg-orange-500/10", icon: "text-orange-500 dark:text-orange-400", text: "text-orange-600 dark:text-orange-400", border: "border-orange-100 dark:border-orange-500/20" },
  violet: { bg: "bg-violet-50 dark:bg-violet-500/10", icon: "text-violet-500 dark:text-violet-400", text: "text-violet-600 dark:text-violet-400", border: "border-violet-100 dark:border-violet-500/20" },
  pink:   { bg: "bg-pink-50 dark:bg-pink-500/10",     icon: "text-pink-500 dark:text-pink-400",     text: "text-pink-600 dark:text-pink-400",     border: "border-pink-100 dark:border-pink-500/20"   },
  blue:   { bg: "bg-blue-50 dark:bg-blue-500/10",     icon: "text-blue-500 dark:text-blue-400",     text: "text-blue-600 dark:text-blue-400",     border: "border-blue-100 dark:border-blue-500/20"   },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-500/10", icon: "text-indigo-500 dark:text-indigo-400", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-500/20" },
  teal:   { bg: "bg-teal-50 dark:bg-teal-500/10",     icon: "text-teal-500 dark:text-teal-400",     text: "text-teal-600 dark:text-teal-400",     border: "border-teal-100 dark:border-teal-500/20"   },
};

const onboarding = PARTNERS.filter((p) => p.status === "Onboarding");
const planned    = PARTNERS.filter((p) => p.status === "Planned");

export default function MarketplacePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-800 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest bg-white/20 rounded-full px-3 py-1 mb-2">
              <Sparkles className="w-3 h-3" /> Partner Network
            </span>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="mt-1.5 text-emerald-100 text-sm max-w-lg">
              Spend your AirtimeVault wallet balance at verified partner businesses — from food vendors to digital stores and beyond.
            </p>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-3 gap-4">
          {[
            { label: "Partner Categories",   value: "6" },
            { label: "Currently Onboarding", value: "1" },
            { label: "Coming Soon",          value: "5" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-xl font-bold">{value}</p>
              <p className="text-[11px] text-emerald-100 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Notice banner ──────────────────────────────────────────────────── */}
      <div className="flex gap-3 items-start bg-amber-50 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/20 rounded-2xl p-4">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Checkout not yet active</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5 leading-relaxed">
            Marketplace checkout is intentionally disabled until merchant verification, wallet payment links, refunds, and settlement operations go live.
          </p>
        </div>
      </div>

      {/* ── Now Onboarding ─────────────────────────────────────────────────── */}
      {onboarding.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Now Onboarding
            </span>
            <div className="flex-1 h-px bg-emerald-100 dark:bg-emerald-500/20" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {onboarding.map((partner) => (
              <PartnerCard key={partner.slug} partner={partner} c={COLOR_MAP[partner.color]} featured />
            ))}
          </div>
        </section>
      )}

      {/* ── Coming Soon ────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <Clock className="w-3.5 h-3.5" /> Coming Soon
          </span>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {planned.map((partner) => (
            <PartnerCard key={partner.slug} partner={partner} c={COLOR_MAP[partner.color]} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PartnerCard({
  partner,
  c,
  featured = false,
}: {
  partner: (typeof PARTNERS)[number];
  c: (typeof COLOR_MAP)[string];
  featured?: boolean;
}) {
  return (
    <Link
      href={`/marketplace/${partner.slug}`}
      className={cn(
        "group relative bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-slate-900/60",
        featured
          ? "border-emerald-200 dark:border-emerald-500/30 shadow-sm"
          : "border-slate-100 dark:border-slate-800"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", c.bg)}>
          <partner.Icon className={cn("w-5 h-5", c.icon)} />
        </div>
        <StatusBadge status={partner.status} />
      </div>

      {/* Text */}
      <div className="flex-1">
        <h2 className="font-semibold text-slate-900 dark:text-white text-[15px]">{partner.name}</h2>
        <p className={cn("text-[11px] font-bold uppercase tracking-wide mt-0.5", c.text)}>{partner.category}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">{partner.description}</p>
      </div>

      {/* Footer */}
      <div className={cn("pt-3 border-t flex items-center justify-between", featured ? "border-emerald-100 dark:border-emerald-500/20" : "border-slate-100 dark:border-slate-800")}>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          {partner.status === "Onboarding" ? "View vendors" : "Learn more & get notified"}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Onboarding") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-full px-2.5 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Onboarding
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-1">
      <Clock className="w-3 h-3" />
      Planned
    </span>
  );
}
