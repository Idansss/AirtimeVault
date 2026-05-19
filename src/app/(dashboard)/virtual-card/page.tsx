"use client";

import {
  CreditCard, Plus, Snowflake, Trash2, Eye, EyeOff,
  Zap, Loader2, DollarSign, ShieldCheck, X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface VirtualCard {
  id: string; maskedPan: string; expiry: string; currency: string;
  balance: number; spendingLimit: number | null; isFrozen: boolean;
  providerRef: string; cvv?: string; createdAt: string;
}

function fmt(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

function fmtNGN(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

// ── Card visual ───────────────────────────────────────────────────────────────
function CardFace({ card, showDetails, onToggle }: { card: VirtualCard; showDetails: boolean; onToggle: () => void }) {
  const pan = card.maskedPan;
  const lastFour = pan.slice(-4);
  const displayPan = showDetails ? pan : `•••• •••• •••• ${lastFour}`;
  const displayExpiry = showDetails ? card.expiry : "••/••";
  const displayCvv = showDetails ? (card.cvv ?? "•••") : "•••";

  return (
    <div className={cn(
      "relative rounded-2xl p-6 text-white overflow-hidden select-none",
      "bg-linear-to-br from-slate-800 via-slate-900 to-slate-950",
      card.isFrozen && "opacity-60"
    )}>
      {/* shimmer lines */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-violet-500/10 blur-2xl" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">AirtimeVault</p>
            <p className="text-xs text-white/40 mt-0.5">Virtual Card</p>
          </div>
          <div className="flex items-center gap-2">
            {card.isFrozen && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded-full px-2 py-0.5">
                <Snowflake className="w-3 h-3" /> Frozen
              </span>
            )}
            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={showDetails ? "Hide card details" : "Show card details"}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Chip */}
        <div className="w-10 h-7 rounded-md bg-amber-300/60 mb-5 flex items-center justify-center">
          <div className="w-7 h-5 rounded-sm border border-amber-400/40 grid grid-cols-2 gap-px p-1">
            <div className="bg-amber-400/40 rounded-sm" /><div className="bg-amber-400/40 rounded-sm" />
            <div className="bg-amber-400/40 rounded-sm" /><div className="bg-amber-400/40 rounded-sm" />
          </div>
        </div>

        <p className="text-lg font-mono tracking-[0.2em] mb-5">{displayPan}</p>

        <div className="flex items-end justify-between">
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Expires</p>
              <p className="text-sm font-semibold font-mono">{displayExpiry}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">CVV</p>
              <p className="text-sm font-semibold font-mono">{displayCvv}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Balance</p>
            <p className="text-lg font-bold">{fmt(card.balance)}</p>
          </div>
        </div>
      </div>

      {/* Mastercard logo */}
      <div className="absolute bottom-5 right-5 flex">
        <div className="w-8 h-8 rounded-full bg-red-500/80" />
        <div className="w-8 h-8 rounded-full bg-amber-400/80 -ml-3" />
      </div>
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PinInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Transaction PIN</label>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="••••"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 tracking-widest text-center text-xl"
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VirtualCardPage() {
  const { toast } = useToast();
  const [card, setCard]             = useState<VirtualCard | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [modal, setModal]           = useState<"create" | "fund" | "terminate" | null>(null);

  // Create form
  const [amount, setAmount]   = useState("10");
  const [pin, setPin]         = useState("");
  const [submitting, setSub]  = useState(false);

  // Fund form
  const [fundAmt, setFundAmt] = useState("5");
  const [fundPin, setFundPin] = useState("");

  const loadCard = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get<{ cards: VirtualCard[] }>("/api/virtual-cards");
      setCard(d.cards[0] ?? null);
    } catch { setCard(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCard(); }, [loadCard]);

  async function createCard() {
    setSub(true);
    try {
      await api.post("/api/virtual-cards", { amount: Number(amount), pin });
      toast("Virtual card created successfully!", "success");
      setModal(null); setPin(""); setAmount("10");
      await loadCard();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Failed to create card", "error");
    } finally { setSub(false); }
  }

  async function fundCard() {
    if (!card) return;
    setSub(true);
    try {
      await api.patch(`/api/virtual-cards/${card.id}`, { action: "fund", amount: Number(fundAmt), pin: fundPin });
      toast(`Card funded with $${fundAmt}`, "success");
      setModal(null); setFundPin(""); setFundAmt("5");
      await loadCard();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Fund failed", "error");
    } finally { setSub(false); }
  }

  async function toggleFreeze() {
    if (!card) return;
    try {
      const action = card.isFrozen ? "unfreeze" : "freeze";
      await api.patch(`/api/virtual-cards/${card.id}`, { action });
      toast(card.isFrozen ? "Card unfrozen" : "Card frozen", "success");
      await loadCard();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Action failed", "error");
    }
  }

  async function terminateCard() {
    if (!card) return;
    setSub(true);
    try {
      await api.patch(`/api/virtual-cards/${card.id}`, { action: "terminate" });
      toast("Card terminated", "success");
      setModal(null); setCard(null);
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Termination failed", "error");
    } finally { setSub(false); }
  }

  const usdCost = Number(amount) * 1600;
  const totalCost = Math.round(usdCost * 1.015);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Virtual Card</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Create a USD virtual Mastercard for online payments.</p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : card ? (
        <div className="space-y-4">
          <CardFace card={card} showDetails={showDetails} onToggle={() => setShowDetails((v) => !v)} />

          {/* Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => { setModal("fund"); setFundPin(""); setFundAmt("5"); }}
              className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all text-slate-700 dark:text-slate-300"
            >
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-medium">Fund</span>
            </button>
            <button
              type="button"
              onClick={toggleFreeze}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 border rounded-xl transition-all text-slate-700 dark:text-slate-300",
                card.isFrozen
                  ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200"
              )}
            >
              <Snowflake className={cn("w-5 h-5", card.isFrozen ? "text-blue-500" : "text-slate-400")} />
              <span className="text-xs font-medium">{card.isFrozen ? "Unfreeze" : "Freeze"}</span>
            </button>
            <button
              type="button"
              onClick={() => setModal("terminate")}
              className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 transition-all text-slate-700 dark:text-slate-300"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
              <span className="text-xs font-medium">Delete</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
            <CreditCard className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 dark:text-white text-lg">No Virtual Card Yet</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xs mx-auto">
              Create a USD virtual Mastercard to pay for subscriptions, online shopping, and more.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setModal("create"); setPin(""); setAmount("10"); }}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Virtual Card
          </button>
        </div>
      )}

      {/* Features */}
      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Virtual Card Features</p>
        </div>
        <ul className="space-y-1.5">
          {[
            "Pay on any website that accepts Mastercard",
            "Fund card from your NGN wallet balance",
            "Freeze or delete anytime for security",
            "Real-time transaction notifications",
            "1% creation fee, no monthly charges",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
              <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {f}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Create Modal ── */}
      {modal === "create" && (
        <Modal title="Create Virtual Card" onClose={() => setModal(null)}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Initial Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                type="number"
                min="5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                placeholder="10"
              />
            </div>
            {Number(amount) >= 5 && (
              <p className="text-xs text-slate-400 mt-1.5">
                ≈ {fmtNGN(totalCost)} deducted (incl. 1.5% fee at ₦1,600/USD)
              </p>
            )}
          </div>

          <PinInput value={pin} onChange={setPin} />

          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
            A 1.5% creation fee applies. Cards are powered by Flutterwave.
          </div>

          <button
            type="button"
            onClick={createCard}
            disabled={submitting || Number(amount) < 5 || pin.length !== 4}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "Create & Fund Card"}
          </button>
        </Modal>
      )}

      {/* ── Fund Modal ── */}
      {modal === "fund" && (
        <Modal title="Fund Card" onClose={() => setModal(null)}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                type="number"
                min="1"
                title="Fund amount in USD"
                placeholder="5"
                value={fundAmt}
                onChange={(e) => setFundAmt(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            {Number(fundAmt) >= 1 && (
              <p className="text-xs text-slate-400 mt-1.5">
                ≈ {fmtNGN(Number(fundAmt) * 1600)} from wallet
              </p>
            )}
          </div>

          <PinInput value={fundPin} onChange={setFundPin} />

          <button
            type="button"
            onClick={fundCard}
            disabled={submitting || Number(fundAmt) < 1 || fundPin.length !== 4}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Funding…</> : "Fund Card"}
          </button>
        </Modal>
      )}

      {/* ── Terminate Modal ── */}
      {modal === "terminate" && (
        <Modal title="Delete Card" onClose={() => setModal(null)}>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to permanently delete this card? Any remaining balance will be lost and this action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={terminateCard}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</> : "Yes, Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
