"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, LayoutDashboard, ArrowLeftRight, Banknote,
  Send, Receipt, Gift, CreditCard, Shield, User, Bell,
  HelpCircle, RefreshCw, ArrowUpRight, ArrowDownLeft, Loader2,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

// ── Quick nav links ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",       href: "/dashboard",       Icon: LayoutDashboard  },
  { label: "Convert Airtime", href: "/convert/airtime", Icon: ArrowLeftRight   },
  { label: "Convert Data",    href: "/convert/data",    Icon: ArrowLeftRight   },
  { label: "Withdraw",        href: "/withdraw",        Icon: Banknote         },
  { label: "Send Money",      href: "/send",            Icon: Send             },
  { label: "Pay Bills",       href: "/bills",           Icon: Receipt          },
  { label: "Gift Cards",      href: "/gift-cards",      Icon: Gift             },
  { label: "Virtual Card",    href: "/virtual-card",    Icon: CreditCard       },
  { label: "Escrow",          href: "/escrow",          Icon: Shield           },
  { label: "Profile",         href: "/profile",         Icon: User             },
  { label: "Notifications",   href: "/notifications",   Icon: Bell             },
  { label: "Help",            href: "/help",            Icon: HelpCircle       },
];

const TX_TYPE_ICON: Record<string, React.ElementType> = {
  AIRTIME_CONVERSION: ArrowLeftRight,
  DATA_CONVERSION:    ArrowLeftRight,
  WITHDRAWAL:         ArrowUpRight,
  P2P_SEND:           ArrowUpRight,
  P2P_RECEIVE:        ArrowDownLeft,
  BILL_PAYMENT:       Receipt,
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED:   "text-emerald-600 dark:text-emerald-400",
  SUCCESSFUL:  "text-emerald-600 dark:text-emerald-400",
  PENDING:     "text-amber-600 dark:text-amber-400",
  PROCESSING:  "text-blue-600 dark:text-blue-400",
  FAILED:      "text-red-500 dark:text-red-400",
  REVERSED:    "text-slate-500 dark:text-slate-400",
  REJECTED:    "text-red-500 dark:text-red-400",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SearchResults {
  ledger:      { id: string; type: string; amount: number; status: string; reference: string; description: string; createdAt: string }[];
  conversions: { id: string; network: string; airtimeAmount: number; walletAmount: number; status: string; reference: string; createdAt: string }[];
  bills:       { id: string; category: string; provider: string; recipient: string; amount: number; status: string; createdAt: string }[];
  withdrawals: { id: string; amount: number; status: string; reference: string; createdAt: string }[];
}

interface FlatResult { id: string; label: string; sub: string; amount?: number; status?: string; href: string; createdAt?: string; Icon: React.ElementType }

function flattenResults(results: SearchResults): FlatResult[] {
  const out: FlatResult[] = [];
  for (const tx of results.ledger) {
    out.push({
      id: `ledger-${tx.id}`, label: tx.type.replace(/_/g, " "), sub: tx.reference,
      amount: tx.amount, status: tx.status, href: "/dashboard",
      createdAt: tx.createdAt, Icon: TX_TYPE_ICON[tx.type] ?? RefreshCw,
    });
  }
  for (const c of results.conversions) {
    out.push({
      id: `conv-${c.id}`, label: `${c.network} Airtime Conversion`, sub: c.reference,
      amount: c.airtimeAmount, status: c.status, href: "/convert/airtime",
      createdAt: c.createdAt, Icon: ArrowLeftRight,
    });
  }
  for (const b of results.bills) {
    out.push({
      id: `bill-${b.id}`, label: `${b.provider} ${b.category.replace("_", " ")}`, sub: b.recipient,
      amount: b.amount, status: b.status, href: "/bills",
      createdAt: b.createdAt, Icon: Receipt,
    });
  }
  for (const w of results.withdrawals) {
    out.push({
      id: `wd-${w.id}`, label: "Withdrawal", sub: w.reference,
      amount: w.amount, status: w.status, href: "/withdraw",
      createdAt: w.createdAt, Icon: Banknote,
    });
  }
  return out;
}

// ── Main component ─────────────────────────────────────────────────────────────
export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router                  = useRouter();
  const inputRef                = useRef<HTMLInputElement>(null);
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState<SearchResults | null>(null);
  const [cursor, setCursor]     = useState(0);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery(""); setResults(null); setCursor(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const d = await api.get<{ results: SearchResults }>(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(d.results);
      } catch { setResults(null); }
      finally { setLoading(false); }
    }, 300);
  }, [query]);

  // Filtered nav items
  const navMatches = useMemo(() => (
    query.length >= 1
      ? NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()))
      : NAV_ITEMS.slice(0, 6)
  ), [query]);

  const txResults = useMemo(() => (results ? flattenResults(results) : []), [results]);
  const totalItems = navMatches.length + txResults.length;

  const navigate = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, totalItems - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        const allItems = [...navMatches, ...txResults];
        if (allItems[cursor]) navigate(allItems[cursor].href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, cursor, totalItems, navMatches, txResults, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[70vh]">

        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          {loading
            ? <Loader2 className="w-4 h-4 text-slate-400 shrink-0 animate-spin" />
            : <Search className="w-4 h-4 text-slate-400 shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            placeholder="Search transactions, references, providers…"
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); setResults(null); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex text-[10px] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto">

          {/* Quick nav */}
          {navMatches.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4 pt-3 pb-1">
                {query ? "Pages" : "Quick Navigation"}
              </p>
              {navMatches.map((item, i) => {
                const active = cursor === i;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setCursor(i)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      active ? "bg-emerald-50 dark:bg-emerald-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", active ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
                      <item.Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className={cn("text-sm font-medium", active ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300")}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Transaction results */}
          {txResults.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4 pt-3 pb-1">
                Transactions
              </p>
              {txResults.map((item, i) => {
                const idx    = navMatches.length + i;
                const active = cursor === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setCursor(idx)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      active ? "bg-emerald-50 dark:bg-emerald-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400", active ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800")}>
                      <item.Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate capitalize", active ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300")}>
                        {item.label.toLowerCase().replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-mono">{item.sub}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {item.amount !== undefined && (
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{fmt(item.amount)}</p>
                      )}
                      {item.status && (
                        <p className={cn("text-[10px] font-bold uppercase", STATUS_COLOR[item.status] ?? "text-slate-400")}>
                          {item.status}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {query.length >= 2 && !loading && txResults.length === 0 && (
            <div className="flex flex-col items-center py-10 text-slate-400 dark:text-slate-500">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm font-medium">No transactions found</p>
              <p className="text-xs mt-0.5">Try a reference number, provider name, or amount</p>
            </div>
          )}

          <div className="h-2" />
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center gap-4 text-[10px] text-slate-400 dark:text-slate-500">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span><kbd className="font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
