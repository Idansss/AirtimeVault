"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

interface Merchant {
  id: string;
  businessName: string;
  businessType: string;
  cacNumber: string | null;
  webhookUrl: string | null;
  apiKey: string;
  secretKey: string;
  status: string;
  feePercent: number;
  totalSales: number;
}

export default function MerchantPage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [cacNumber, setCacNumber] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const { toast } = useToast();

  async function loadMerchant() {
    setLoading(true);
    try {
      const data = await api.get<{ merchant: Merchant | null }>("/api/merchant");
      setMerchant(data.merchant);
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Failed to load merchant profile", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMerchant();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitApplication() {
    setSubmitting(true);
    try {
      await api.post("/api/merchant", { businessName, businessType, cacNumber, webhookUrl });
      toast("Merchant application submitted", "success");
      await loadMerchant();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function copy(value: string) {
    navigator.clipboard.writeText(value).then(() => toast("Copied", "success")).catch(() => {});
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Merchant Portal</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Apply to accept AirtimeVault wallet payments.</p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">Loading merchant profile...</div>
      ) : merchant ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <BriefcaseBusiness className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{merchant.businessName}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{merchant.businessType}</p>
                </div>
              </div>
              <span className="text-xs rounded-full bg-amber-100 text-amber-700 dark:text-amber-300 px-2 py-1">{merchant.status}</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-6 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                <p className="text-slate-500 dark:text-slate-400">Fee</p>
                <p className="font-semibold text-slate-900">{Number(merchant.feePercent)}%</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                <p className="text-slate-500 dark:text-slate-400">Sales</p>
                <p className="font-semibold text-slate-900">NGN {Number(merchant.totalSales).toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                <p className="text-slate-500 dark:text-slate-400">Settlement</p>
                <p className="font-semibold text-slate-900">Disabled</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">API Access</h2>
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300">
              API payment acceptance remains disabled until this merchant is approved and settlement operations are configured.
            </div>
            {merchant.status === "APPROVED" ? (
              <div className="space-y-3">
                {[
                  ["API key", merchant.apiKey],
                  ["Secret key", merchant.secretKey],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl p-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                      <code className="text-sm text-slate-800 truncate block">{value}</code>
                    </div>
                    <button type="button" onClick={() => copy(value)} className="p-2 text-slate-400 hover:text-slate-700">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Keys will be usable after admin approval.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Merchant Application</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Business Name</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Business Type</label>
            <input value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500" placeholder="Food vendor, fashion store, school, logistics..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">CAC Number</label>
            <input value={cacNumber} onChange={(e) => setCacNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500" placeholder="Optional for early review" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Webhook URL</label>
            <input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500" placeholder="https://example.com/webhooks/airtimevault" />
          </div>
          <Button onClick={submitApplication} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      )}
    </div>
  );
}
