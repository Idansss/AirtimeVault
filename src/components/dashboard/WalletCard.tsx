"use client";

import { Eye, EyeOff, ArrowUpRight, Plus, Send } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { WalletSummary } from "@/types";

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(n);
}

const ACTIONS = [
  { href: "/convert/airtime", label: "Convert",  Icon: Plus,        iconCls: "text-emerald-400", bgCls: "bg-emerald-500/15 group-hover:bg-emerald-500/25" },
  { href: "/withdraw",        label: "Withdraw", Icon: ArrowUpRight, iconCls: "text-blue-400",   bgCls: "bg-blue-500/15 group-hover:bg-blue-500/25"       },
  { href: "/send",            label: "Send",     Icon: Send,         iconCls: "text-purple-400", bgCls: "bg-purple-500/15 group-hover:bg-purple-500/25"   },
] as const;

export function WalletCard({ wallet }: { wallet: WalletSummary }) {
  const [hidden, setHidden] = useState(false);

  return (
    <div className="wallet-card-bg relative rounded-2xl overflow-hidden text-white">
      {/* Decorative glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="wallet-glow-purple absolute -top-16 -right-16 w-72 h-72 rounded-full" />
        <div className="wallet-glow-green  absolute -bottom-16 -left-8 w-56 h-56 rounded-full" />
        <div className="wallet-grid-overlay absolute inset-0" />
      </div>

      <div className="relative p-6">
        {/* Balance */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-[0.16em]">
              Available Balance
            </p>
            <p className="text-4xl font-bold mt-2 tracking-tight leading-none">
              {hidden ? "₦ ••••••" : fmt(wallet.availableBalance)}
            </p>
            {wallet.pendingBalance > 0 && (
              <p className="text-white/35 text-xs mt-2">
                +{fmt(wallet.pendingBalance)} pending clearance
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setHidden((v) => !v)}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            aria-label={hidden ? "Show balance" : "Hide balance"}
          >
            {hidden
              ? <EyeOff className="w-4 h-4 text-white/50" />
              : <Eye    className="w-4 h-4 text-white/50" />}
          </button>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {([
            { label: "Converted", value: fmt(wallet.totalConverted),  accent: false },
            { label: "Withdrawn", value: fmt(wallet.totalWithdrawn),   accent: false },
            { label: "Cashback",  value: fmt(wallet.cashbackEarned),   accent: true  },
          ] as const).map(({ label, value, accent }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 border border-white/[0.07]">
              <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
              <p className={`font-semibold text-[13px] mt-1 leading-none truncate ${accent ? "text-emerald-400" : "text-white/80"}`}>
                {hidden ? "••••" : value}
              </p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          {ACTIONS.map(({ href, label, Icon, iconCls, bgCls }) => (
            <Link
              key={href}
              href={href}
              className="wallet-action-btn group flex flex-col items-center gap-2 p-3.5 rounded-xl transition-all duration-150"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${bgCls}`}>
                <Icon className={`w-4 h-4 ${iconCls}`} />
              </div>
              <span className="text-white/55 text-xs font-medium group-hover:text-white/80 transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
