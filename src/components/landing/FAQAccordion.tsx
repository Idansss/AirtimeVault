"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How does airtime conversion work?",
    a: "Submit a conversion request on AirtimeVault, then transfer the exact airtime amount to our secure collection number. Our team verifies the transfer and credits your wallet — typically within 30 minutes.",
  },
  {
    q: "How long does it take to receive funds?",
    a: "Most conversions are processed within 15–30 minutes during business hours (8 AM – 10 PM). Complex or large conversions may take up to 2 hours. You'll receive a push notification the moment your wallet is credited.",
  },
  {
    q: "What are the minimum and maximum amounts?",
    a: "The minimum conversion is ₦500. Maximum depends on your KYC level: unverified accounts up to ₦10,000/day, Level 1 up to ₦100,000/day, Level 2 up to ₦500,000/day, and Business accounts up to ₦5,000,000/day.",
  },
  {
    q: "Which networks are supported?",
    a: "We support all four major Nigerian networks: MTN, Airtel, Glo, and 9mobile. Data bundle conversion is also available for all networks, subject to eligibility review.",
  },
  {
    q: "Is my information and money secure?",
    a: "Yes. All accounts are protected by a 4-digit transaction PIN required for every transfer and withdrawal. We use industry-standard encryption, KYC verification, and automated fraud detection to keep your funds safe.",
  },
  {
    q: "How do I withdraw to my bank account?",
    a: "Add your Nigerian bank account in your profile, then visit the Withdraw page. Enter the amount and your PIN — funds land in your bank within 1–24 hours. A small processing fee applies (₦50 for up to ₦10,000, ₦100 up to ₦100,000). Gold members get 3 free withdrawals per month.",
  },
];

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {FAQS.map(({ q, a }, i) => (
        <div key={i} className="glass rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
          >
            <span className={cn("font-medium transition-colors", open === i ? "text-emerald-600 dark:text-emerald-400" : "")}>
              {q}
            </span>
            <ChevronDown className={cn("w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200", open === i && "rotate-180")} />
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-200 dark:border-white/6 pt-4">
              {a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
