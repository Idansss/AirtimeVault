"use client";

import { useState, useEffect, useCallback } from "react";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Conversion {
  id:            string;
  kind:          string;
  reference:     string;
  network:       string;
  phoneNumber:   string;
  dataBundle:    string | null;
  description:   string | null;
  airtimeAmount: number;
  walletAmount:  number;
  ratePercent:   number;
  status:        string;
  adminNote:     string | null;
  createdAt:     string;
  user: { username: string; phone: string; email: string; membershipTier: string };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:      "bg-yellow-500/20 text-yellow-300",
  PROCESSING:   "bg-blue-500/20 text-blue-300",
  UNDER_REVIEW: "bg-purple-500/20 text-purple-300",
  SUCCESSFUL:   "bg-emerald-500/20 text-emerald-300",
  REJECTED:     "bg-red-500/20 text-red-300",
  REVERSED:     "bg-slate-500/20 text-slate-300",
};

const STATUSES = ["ALL", "PENDING", "UNDER_REVIEW", "PROCESSING", "SUCCESSFUL", "REJECTED"];

function fmt(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

function ago(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

type ActionState = { id: string; action: "APPROVE" | "REJECT" | "UNDER_REVIEW" } | null;

export default function AdminConversionsPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [status,      setStatus]      = useState("PENDING");
  const [q,           setQ]           = useState("");
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [pending,     setPending]     = useState(0);
  const [action,      setAction]      = useState<ActionState>(null);
  const [note,        setNote]        = useState("");
  const [creditAmount,setCreditAmount]= useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const { toast }                     = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s   = status === "ALL" ? "" : status;
      const res = await api.get<{ conversions: Conversion[]; pendingCount: number; pagination: { total: number } }>(
        `/api/admin/conversions?status=${s}&q=${encodeURIComponent(q)}&page=${page}&limit=15`
      );
      setConversions(res.conversions);
      setTotal(res.pagination.total);
      setPending(res.pendingCount);
    } catch {
      toast("Failed to load conversions", "error");
    } finally {
      setLoading(false);
    }
  }, [status, q, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function applyAction() {
    if (!action) return;
    const selectedConversion = conversions.find((c) => c.id === action.id);
    const needsCreditAmount = action.action === "APPROVE" && Number(selectedConversion?.walletAmount ?? 0) <= 0;
    const parsedCreditAmount = creditAmount ? Number(creditAmount) : undefined;
    if (needsCreditAmount && (!parsedCreditAmount || parsedCreditAmount <= 0)) {
      toast("Enter the wallet amount to credit", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/api/admin/conversions/${action.id}`, {
        action: action.action,
        adminNote: note || undefined,
        walletAmount: parsedCreditAmount,
      });
      toast(`Conversion ${action.action.toLowerCase()}d`, "success");
      setAction(null);
      setNote("");
      setCreditAmount("");
      load();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Action failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const pages = Math.ceil(total / 15);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Conversions</h1>
          {pending > 0 && <p className="text-yellow-400 text-sm mt-0.5">{pending} pending review</p>}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-sm w-56"
            placeholder="Search ref, user…"
          />
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
              status === s
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-700">
              <tr>
                {["User", "Type", "Network", "Value", "Wallet", "Rate", "Status", "Submitted", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map((i) => (
                  <tr key={i} className="border-b border-slate-700">
                    {[1,2,3,4,5,6,7,8,9].map((j) => (
                      <td key={j} className="py-3 px-4"><div className="h-4 bg-slate-700 animate-pulse rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : conversions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">No conversions found.</td>
                </tr>
              ) : (
                conversions.map((c) => (
                  <>
                    <tr key={c.id} className={`border-b border-slate-700 hover:bg-slate-750 transition-colors ${action?.id === c.id ? "bg-slate-700" : ""}`}>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">@{c.user.username}</p>
                        <p className="text-slate-400 text-xs">{c.user.phone}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300">{c.kind}</span>
                        {c.dataBundle && <p className="text-slate-500 text-xs">{c.dataBundle}</p>}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{c.network}</td>
                      <td className="py-3 px-4 text-white font-medium">
                        {c.kind === "DATA" ? (c.dataBundle ?? "Manual review") : fmt(c.airtimeAmount)}
                        {c.description && <p className="text-slate-500 text-xs max-w-44 truncate">{c.description}</p>}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-medium">{fmt(c.walletAmount)}</td>
                      <td className="py-3 px-4 text-slate-300">{c.ratePercent}%</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[c.status] ?? "bg-slate-600 text-slate-200"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">{ago(c.createdAt)}</td>
                      <td className="py-3 px-4">
                        {(c.status === "PENDING" || c.status === "UNDER_REVIEW" || c.status === "PROCESSING") && (
                          <div className="flex gap-1">
                            <button type="button" onClick={() => { setAction({ id: c.id, action: "APPROVE" }); setCreditAmount(c.walletAmount > 0 ? String(c.walletAmount) : ""); }}
                              className="px-2 py-1 text-xs rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors">
                              Approve
                            </button>
                            <button type="button" onClick={() => { setAction({ id: c.id, action: "REJECT" }); setCreditAmount(""); }}
                              className="px-2 py-1 text-xs rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors">
                              Reject
                            </button>
                            {c.status === "PENDING" && (
                              <button type="button" onClick={() => { setAction({ id: c.id, action: "UNDER_REVIEW" }); setCreditAmount(""); }}
                                className="px-2 py-1 text-xs rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 transition-colors">
                                Review
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                    {action?.id === c.id && (
                      <tr key={`${c.id}-action`} className="bg-slate-700 border-b border-slate-600">
                        <td colSpan={9} className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm text-slate-300">
                              {action.action === "APPROVE" ? "Approve" : action.action === "REJECT" ? "Reject" : "Flag for review"}{" "}
                              <strong className="text-white">@{c.user.username}</strong>&apos;s {c.kind.toLowerCase()} conversion?
                            </span>
                            {action.action === "APPROVE" && Number(c.walletAmount) <= 0 && (
                              <input
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                                type="number"
                                min={1}
                                className="w-40 px-3 py-1.5 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="Wallet credit"
                              />
                            )}
                            <input
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-500"
                              placeholder={action.action === "REJECT" ? "Rejection reason (required)…" : "Admin note (optional)…"}
                            />
                            <Button onClick={applyAction} disabled={submitting || (action.action === "REJECT" && !note.trim())}
                              className={`text-xs px-3 py-1.5 rounded-lg ${action.action === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"} text-white disabled:opacity-50`}>
                              {submitting ? "…" : "Confirm"}
                            </Button>
                            <button type="button" onClick={() => { setAction(null); setNote(""); setCreditAmount(""); }}
                              className="text-xs text-slate-400 hover:text-white px-2">
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-400">Showing page {page} of {pages} ({total} total)</p>
          <div className="flex gap-2">
            <button type="button" aria-label="Previous page" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Next page" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
