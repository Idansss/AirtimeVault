"use client";

import { useState, useEffect } from "react";
import { DEFAULT_RATES, NETWORK_LABELS, MEMBERSHIP_TIERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { NetworkLogo } from "@/components/ui/network-logo";
import { useToast } from "@/components/ui/toast";
import { api, FetchError } from "@/lib/api/client";

type Rates = typeof DEFAULT_RATES;

export default function AdminRatesPage() {
  const [rates,   setRates]   = useState<Rates>(JSON.parse(JSON.stringify(DEFAULT_RATES)));
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast }             = useToast();

  useEffect(() => {
    api.get<{ rates: Rates }>("/api/admin/rates")
      .then((d) => { if (d.rates) setRates(d.rates); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveRates() {
    setSaving(true);
    try {
      await api.put("/api/admin/rates", rates);
      toast("Conversion rates saved", "success");
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Failed to save rates", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Conversion Rates</h1>
          <p className="text-slate-400 text-sm mt-0.5">Rate changes apply immediately to new requests.</p>
        </div>
        <Button onClick={saveRates} disabled={saving || loading} className="bg-emerald-600 hover:bg-emerald-500 text-white">
          {saving ? "Saving…" : "Save Rates"}
        </Button>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map((i) => <div key={i} className="h-10 bg-slate-700 animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Network</th>
                {MEMBERSHIP_TIERS.map((t) => (
                  <th key={t} className="text-left py-3 px-4 text-slate-400 font-medium">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(Object.keys(rates) as (keyof Rates)[]).map((network) => (
                <tr key={network} className="hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <NetworkLogo network={network} size="xs" />
                      {NETWORK_LABELS[network]}
                    </div>
                  </td>
                  {MEMBERSHIP_TIERS.map((tier) => (
                    <td key={tier} className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          aria-label={`${NETWORK_LABELS[network]} ${tier} rate`}
                          value={rates[network][tier as keyof typeof rates[typeof network]]}
                          onChange={(e) => setRates((prev) => ({
                            ...prev,
                            [network]: { ...prev[network], [tier]: Number(e.target.value) },
                          }))}
                          className="w-16 px-2 py-1 rounded-lg bg-slate-700 border border-slate-600 text-white text-center focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <span className="text-slate-400">%</span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-slate-500 text-xs">
        Existing pending conversion requests retain the rate locked at submission time.
      </p>
    </div>
  );
}
