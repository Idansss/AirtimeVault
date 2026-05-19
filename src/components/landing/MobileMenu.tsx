"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AirtimeVaultLogo } from "@/components/ui/airtime-vault-logo";

const links = [
  { href: "/#rates",        label: "Rates"        },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#features",     label: "Features"     },
  { href: "/#faq",          label: "FAQ"          },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 flex flex-col md:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <AirtimeVaultLogo markClassName="size-8" textClassName="text-lg text-white" />
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col gap-1 p-6">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-lg font-medium transition-colors">
                {label}
              </Link>
            ))}
          </nav>
          <div className="p-6 flex flex-col gap-3 border-t border-slate-800">
            <Link href="/login" onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl border border-slate-700 text-center text-white font-semibold hover:bg-slate-800 transition-colors">
              Sign In
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-center text-white font-bold transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
