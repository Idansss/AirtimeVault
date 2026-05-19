"use client";

import Image from "next/image";
import { useState } from "react";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { CheckCircle, Loader2 } from "lucide-react";

interface GiftCard {
  brand:         string;
  logo:          string;
  denominations: number[];
  bg:            string;
  logoFrame:     string;
}

const GIFT_CARDS: GiftCard[] = [
  { brand: "Amazon",      logo: "/gift-card-logos/amazon.png",      denominations: [25, 50, 100, 200], bg: "bg-[#101820] border-slate-800 text-white", logoFrame: "bg-[#101820]" },
  { brand: "Google Play", logo: "/gift-card-logos/google-play.png", denominations: [5, 10, 25, 50],    bg: "bg-white border-blue-100",                  logoFrame: "bg-white" },
  { brand: "iTunes",      logo: "/gift-card-logos/itunes.png",      denominations: [15, 25, 50, 100],  bg: "bg-white border-rose-100",                  logoFrame: "bg-white" },
  { brand: "Netflix",     logo: "/gift-card-logos/netflix.png",     denominations: [10, 15, 25, 50],   bg: "bg-black border-slate-800 text-white",      logoFrame: "bg-black" },
  { brand: "PlayStation", logo: "/gift-card-logos/playstation.png", denominations: [10, 25, 50, 100],  bg: "bg-blue-50 border-blue-100",                logoFrame: "bg-gradient-to-b from-sky-500 to-blue-950" },
  { brand: "Spotify",     logo: "/gift-card-logos/spotify.png",     denominations: [10, 30, 60],       bg: "bg-black border-slate-800 text-white",      logoFrame: "bg-black" },
  { brand: "Steam",       logo: "/gift-card-logos/steam.png",       denominations: [10, 20, 50, 100],  bg: "bg-sky-50 border-sky-100",                  logoFrame: "bg-white" },
  { brand: "Xbox",        logo: "/gift-card-logos/xbox.png",        denominations: [10, 25, 50, 100],  bg: "bg-green-50 border-green-100",              logoFrame: "bg-[#22a70f]" },
];

const USD_RATE = 1620;

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

interface SuccessData { brand: string; denomination: number; reference: string }

export default function GiftCardsPage() {
  const { toast } = useToast();
  const [selected,     setSelected]     = useState<string | null>(null);
  const [denomination, setDenomination] = useState<number | null>(null);
  const [pin,          setPin]          = useState("");
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState<SuccessData | null>(null);

  const card = GIFT_CARDS.find((c) => c.brand === selected);

  function selectCard(brand: string) {
    setSelected(brand);
    setDenomination(null);
    setPin("");
  }

  async function handleBuy() {
    if (!selected || !denomination || pin.length < 4) return;
    setLoading(true);
    try {
      const res = await api.post<{ reference: string }>("/api/gift-cards", {
        brand:       selected,
        denomination,
        currency:    "USD",
        amount:      denomination * USD_RATE,
        pin,
      });
      setSuccess({ brand: selected, denomination, reference: res.reference });
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Purchase failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center gap-5 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{success.brand} Gift Card Purchased!</h2>
          <p className="text-slate-500 text-sm mt-1">
            ${success.denomination} USD • Your card will be delivered via notification within 5 minutes.
          </p>
          <p className="text-xs text-slate-400 mt-2 font-mono">Ref: {success.reference}</p>
        </div>
        <button
          type="button"
          onClick={() => { setSuccess(null); setSelected(null); setDenomination(null); setPin(""); }}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors"
        >
          Buy Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gift Cards</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Buy international gift cards instantly with your wallet balance.</p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {GIFT_CARDS.map(({ brand, logo, denominations, bg, logoFrame }) => (
          <button
            key={brand}
            type="button"
            onClick={() => selectCard(brand)}
            className={`relative overflow-hidden p-3 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
              selected === brand
                ? "border-emerald-500 bg-emerald-50 shadow-md"
                : `${bg} hover:border-slate-300`
            }`}
          >
            {selected === brand && (
              <span className="absolute top-2 right-2 z-10 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 8 8" className="w-2.5 h-2.5"><path d="M1.5 4 L3.5 6 L6.5 2" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            )}
            <div className={`relative mb-3 aspect-[4/3] rounded-xl overflow-hidden border border-white/40 ${logoFrame}`}>
              <Image
                src={logo}
                alt={`${brand} logo`}
                fill
                sizes="(max-width: 640px) 45vw, 160px"
                className="object-contain p-3"
                priority={brand === "Amazon" || brand === "Google Play"}
              />
            </div>
            <p className={`font-semibold text-sm leading-tight ${selected === brand ? "text-slate-900" : "text-current"}`}>
              {brand}
            </p>
            <p className={selected === brand ? "text-emerald-700 text-xs mt-0.5" : "text-slate-400 text-xs mt-0.5"}>
              From ${denominations[0]}
            </p>
          </button>
        ))}
      </div>

      {/* Purchase form */}
      {card && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className={`relative h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-slate-200 ${card.logoFrame}`}>
              <Image
                src={card.logo}
                alt={`${card.brand} logo`}
                fill
                sizes="48px"
                className="object-contain p-1.5"
              />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">{card.brand} Gift Card</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Rate: $1 = {fmt(USD_RATE)}</p>
            </div>
          </div>

          {/* Denomination */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Amount (USD)</label>
            <div className="flex flex-wrap gap-2.5">
              {card.denominations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDenomination(d)}
                  className={`px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                    denomination === d
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "border-slate-200 text-slate-600 hover:border-emerald-300"
                  }`}
                >
                  ${d}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {denomination && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Card value</span>
                <span className="font-medium">${denomination} USD</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Exchange rate</span>
                <span className="font-medium">$1 = {fmt(USD_RATE)}</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Total</span>
                <span className="text-emerald-700">{fmt(denomination * USD_RATE)}</span>
              </div>
            </div>
          )}

          {/* PIN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Transaction PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 tracking-[0.5em] text-center text-xl transition-colors"
              placeholder="••••"
            />
          </div>

          <button
            type="button"
            onClick={handleBuy}
            disabled={!denomination || pin.length < 4 || loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Processing…" : `Buy ${card.brand} Gift Card`}
          </button>
        </div>
      )}
    </div>
  );
}
