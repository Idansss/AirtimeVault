"use client";

import { ArrowUpRight, ArrowDownLeft, RefreshCw, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LedgerEntry } from "@/types";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  AIRTIME_CONVERSION: <RefreshCw className="w-4 h-4" />,
  DATA_CONVERSION:    <RefreshCw className="w-4 h-4" />,
  WITHDRAWAL:         <ArrowUpRight className="w-4 h-4" />,
  P2P_SEND:           <ArrowUpRight className="w-4 h-4" />,
  P2P_RECEIVE:        <ArrowDownLeft className="w-4 h-4" />,
  BILL_PAYMENT:       <Receipt className="w-4 h-4" />,
};

const TYPE_LABEL: Record<string, string> = {
  AIRTIME_CONVERSION: "Airtime Conversion",
  DATA_CONVERSION:    "Data Conversion",
  WITHDRAWAL:         "Withdrawal",
  P2P_SEND:           "Transfer Sent",
  P2P_RECEIVE:        "Transfer Received",
  BILL_PAYMENT:       "Bill Payment",
  GIFT_CARD_PURCHASE: "Gift Card",
  CASHBACK:           "Cashback",
  REFERRAL_BONUS:     "Referral Bonus",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED:    "bg-red-100 text-red-700",
  REVERSED:  "bg-slate-100 text-slate-600",
};

const DEBIT_TYPES = ["WITHDRAWAL", "P2P_SEND", "BILL_PAYMENT", "GIFT_CARD_PURCHASE", "VIRTUAL_CARD_FUND", "ESCROW_LOCK"];

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
}

export function TransactionTable({ entries }: { entries: LedgerEntry[] }) {
  if (!entries.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500 hidden sm:table-cell">Reference</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500 hidden md:table-cell">Date</th>
            <th className="text-right py-3 px-4 font-medium text-slate-500">Amount</th>
            <th className="text-center py-3 px-4 font-medium text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((e) => {
            const isDebit = DEBIT_TYPES.includes(e.type);
            return (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-lg", isDebit ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600")}>
                      {TYPE_ICONS[e.type] ?? <RefreshCw className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{TYPE_LABEL[e.type] ?? e.type}</p>
                      <p className="text-slate-400 text-xs">{e.description}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <code className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {e.reference.slice(0, 12)}…
                  </code>
                </td>
                <td className="py-3 px-4 hidden md:table-cell text-slate-500">
                  {new Date(e.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className={cn("py-3 px-4 text-right font-semibold", isDebit ? "text-red-600" : "text-emerald-600")}>
                  {isDebit ? "-" : "+"}{fmt(e.amount)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STATUS_STYLE[e.status])}>
                    {e.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
