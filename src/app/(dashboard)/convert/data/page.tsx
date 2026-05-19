"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { NETWORK_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";
import { NetworkLogo } from "@/components/ui/network-logo";
import { useToast } from "@/components/ui/toast";
import { api, FetchError } from "@/lib/api/client";

const NETWORKS = ["MTN", "AIRTEL", "GLO", "NINEMOBILE"] as const;
type Network = typeof NETWORKS[number];

const DATA_BUNDLES = ["1GB", "2GB", "5GB", "10GB", "20GB", "Other"];

interface DataResult {
  reference: string;
  network: string;
}

export default function ConvertDataPage() {
  const [network, setNetwork]       = useState<Network>("MTN");
  const [phone, setPhone]           = useState("");
  const [bundle, setBundle]         = useState("");
  const [details, setDetails]       = useState("");
  const [pin, setPin]               = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState<DataResult | null>(null);
  const { toast }                   = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !bundle || !pin) {
      toast("Please fill in all required fields", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<{ conversion: DataResult }>("/api/conversions", {
        kind: "DATA",
        network,
        phoneNumber:   phone,
        dataBundle:    bundle,
        description:   details,
        pin,
      });
      setResult(res.conversion);
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Submission failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center gap-5 py-12">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Your data conversion request is under review.</p>
        </div>
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Reference</span>
            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{result.reference}</code>
          </div>
        </div>
        <p className="text-sm text-slate-500 text-center">
          Our team will review your data conversion and credit your wallet within 24 hours.
        </p>
        <Button onClick={() => setResult(null)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8">
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Convert Data</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Convert unused data bundles into wallet funds.</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
        <p className="font-semibold mb-1">Note on Data Conversion</p>
        <p>Data conversion requests are reviewed manually. Not all bundle types are eligible. Your request will be assessed within 24 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Network</label>
          <div className="grid grid-cols-4 gap-2">
            {NETWORKS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNetwork(n)}
                className={`min-h-24 py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center justify-center gap-2 ${
                  network === n
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500"
                }`}
              >
                <NetworkLogo network={n} size="md" />
                {NETWORK_LABELS[n]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="080XXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data Bundle Size</label>
          <AppSelect
            value={bundle}
            placeholder="Select data bundle"
            options={DATA_BUNDLES.map((b) => ({ value: b, label: b }))}
            onChange={setBundle}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Additional Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
            rows={3}
            placeholder="Describe the data bundle, expiry date, or any other relevant details…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Transaction PIN</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 tracking-widest text-center text-xl"
            placeholder="••••"
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold">
          {submitting ? "Submitting…" : "Submit Data Conversion Request"}
        </Button>
      </form>
    </div>
  );
}
