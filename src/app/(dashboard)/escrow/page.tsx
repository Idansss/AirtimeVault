"use client";

import { Shield, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

interface EscrowDeal {
  id: string;
  title: string;
  description: string;
  amount: number;
  fee: number;
  status: string;
  deliveryDays: number;
  createdAt: string;
  buyer: { username: string };
  seller: { username: string };
}

const STATUS_STYLE: Record<string, string> = {
  FUNDED: "bg-blue-100 text-blue-700 dark:text-blue-300",
  DELIVERED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  DISPUTED: "bg-red-100 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-700 dark:text-slate-300",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(n));
}

export default function EscrowPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [deals, setDeals] = useState<EscrowDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [seller, setSeller] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [pin, setPin] = useState("");
  const { toast } = useToast();

  async function loadDeals() {
    setLoading(true);
    try {
      const data = await api.get<{ deals: EscrowDeal[] }>("/api/escrow");
      setDeals(data.deals);
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Failed to load escrow deals", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeals();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createDeal() {
    setSubmitting(true);
    try {
      await api.post("/api/escrow", {
        title,
        seller,
        amount: Number(amount),
        description,
        deliveryDays: Number(deliveryDays),
        pin,
      });
      toast("Escrow deal created and funded", "success");
      setShowCreate(false);
      setTitle("");
      setSeller("");
      setAmount("");
      setDescription("");
      setDeliveryDays("7");
      setPin("");
      await loadDeals();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Failed to create escrow deal", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function applyAction(id: string, action: "MARK_DELIVERED" | "RELEASE") {
    try {
      await api.patch(`/api/escrow/${id}`, { action });
      toast(action === "RELEASE" ? "Escrow funds released" : "Delivery marked", "success");
      await loadDeals();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Action failed", "error");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Escrow</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Safe wallet-backed payments for buyers and sellers.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-2 rounded-xl">
          <Plus className="w-4 h-4" />
          New Deal
        </Button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">Loading escrow deals...</div>
      ) : deals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="font-semibold text-slate-800 dark:text-white mb-2">No Escrow Deals</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
            Create an escrow deal to protect your next transaction. Funds are released after delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900">{deal.title}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Buyer @{deal.buyer.username} {"->"} Seller @{deal.seller.username}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{deal.description}</p>
                </div>
                <span className={`text-xs rounded-full px-2 py-1 font-medium ${STATUS_STYLE[deal.status] ?? "bg-slate-100 text-slate-700 dark:text-slate-300"}`}>
                  {deal.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">{fmt(deal.amount)}</span>
                  <span className="text-slate-400 ml-2">Fee {fmt(deal.fee)}</span>
                </div>
                <div className="flex gap-2">
                  {deal.status === "FUNDED" && (
                    <Button variant="outline" onClick={() => applyAction(deal.id, "MARK_DELIVERED")} className="rounded-xl text-xs">
                      Mark delivered
                    </Button>
                  )}
                  {(deal.status === "FUNDED" || deal.status === "DELIVERED") && (
                    <Button onClick={() => applyAction(deal.id, "RELEASE")} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                      Release funds
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Create Escrow Deal</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Deal Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500" placeholder="e.g. iPhone 14 Pro purchase" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Seller Username / Phone / Email</label>
            <input value={seller} onChange={(e) => setSeller(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500" placeholder="Enter seller identifier" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount (NGN)</label>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500" placeholder="150000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Delivery Days</label>
              <input value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 resize-none" rows={3} placeholder="Describe what is being purchased" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Transaction PIN</label>
            <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} type="password" maxLength={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 tracking-widest text-center text-xl" placeholder="****" />
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
            Escrow fee: 1.5% of deal amount. The buyer is debited for amount plus fee when the deal is created.
          </div>

          <div className="flex gap-3">
            <Button onClick={createDeal} disabled={submitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create & Fund Deal"}
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400">
        <p className="font-semibold text-slate-800 dark:text-white mb-2">How Escrow Works</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Buyer creates a deal and funds the escrow from wallet balance</li>
          <li>Seller delivers the product or service</li>
          <li>Buyer releases funds to seller wallet</li>
          <li>If there is a dispute, open a dispute from support with the escrow reference</li>
        </ol>
      </div>
    </div>
  );
}
