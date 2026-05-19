"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

interface Withdrawal {
  id:            string;
  reference:     string;
  amount:        number;
  netAmount:     number;
  fee:           number;
  status:        string;
  failureReason: string | null;
  createdAt:     string;
  user:          { username: string; email: string };
  bankAccount:   { bankName: string; accountNumber: string; accountName: string };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:    "bg-yellow-500/20 text-yellow-300",
  PROCESSING: "bg-blue-500/20 text-blue-300",
  SUCCESSFUL: "bg-emerald-500/20 text-emerald-300",
  FAILED:     "bg-red-500/20 text-red-300",
  REVERSED:   "bg-slate-500/20 text-slate-300",
};

const STATUSES = ["ALL", "PENDING", "PROCESSING", "SUCCESSFUL", "FAILED", "REVERSED"];

type ActionType = "MARK_PROCESSING" | "MARK_SUCCESSFUL" | "MARK_FAILED" | "REVERSE";
type ActionState = { id: string; action: ActionType } | null;

function fmt(n: number) { return `₦${Number(n).toLocaleString()}`; }
function ago(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [status,      setStatus]      = useState("PENDING");
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [pending,     setPending]     = useState(0);
  const [action,      setAction]      = useState<ActionState>(null);
  const [note,        setNote]        = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const { toast }                     = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s   = status === "ALL" ? "" : status;
      const res = await api.get<{ withdrawals: Withdrawal[]; pendingCount: number; pagination: { total: number } }>(
        `/api/admin/withdrawals?status=${s}&page=${page}&limit=15`
      );
      setWithdrawals(res.withdrawals);
      setTotal(res.pagination.total);
      setPending(res.pendingCount);
    } catch {
      toast("Failed to load withdrawals", "error");
    } finally {
      setLoading(false);
    }
  }, [status, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function applyAction() {
    if (!action) return;
    setSubmitting(true);
    try {
      await api.patch(`/api/admin/withdrawals/${action.id}`, {
        action: action.action,
        ...(note ? { failureReason: note } : {}),
      });
      toast(`Withdrawal ${action.action.toLowerCase().replace(/_/g, " ")}`, "success");
      setAction(null);
      setNote("");
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
      <div>
        <h1 className="text-xl font-bold text-white">Withdrawals</h1>
        {pending > 0 && <p className="text-yellow-400 text-sm mt-0.5">{pending} pending processing</p>}
      </div>

      <div className="flex gap-1 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} type="button" onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
              status === s
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-700">
              <tr>
                {["User", "Bank", "Amount", "Net", "Fee", "Status", "When", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map((i) => (
                  <tr key={i} className="border-b border-slate-700">
                    {[1,2,3,4,5,6,7,8].map((j) => (
                      <td key={j} className="py-3 px-4"><div className="h-4 bg-slate-700 animate-pulse rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No withdrawals found.</td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <>
                    <tr key={w.id} className={`border-b border-slate-700 transition-colors ${action?.id === w.id ? "bg-slate-700" : "hover:bg-slate-750"}`}>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">@{w.user.username}</p>
                        <p className="text-slate-400 text-xs">{w.user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-300 text-xs">{w.bankAccount.bankName}</p>
                        <p className="text-slate-500 text-xs">****{w.bankAccount.accountNumber.slice(-4)}</p>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{fmt(w.amount)}</td>
                      <td className="py-3 px-4 text-emerald-400">{fmt(w.netAmount)}</td>
                      <td className="py-3 px-4 text-red-400 text-xs">{fmt(w.fee)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[w.status] ?? "bg-slate-500/20 text-slate-300"}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{ago(w.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {w.status === "PENDING" && (
                            <button type="button" onClick={() => setAction({ id: w.id, action: "MARK_PROCESSING" })}
                              className="px-2 py-1 text-xs rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/40">
                              Processing
                            </button>
                          )}
                          {(w.status === "PENDING" || w.status === "PROCESSING") && (<>
                            <button type="button" onClick={() => setAction({ id: w.id, action: "MARK_SUCCESSFUL" })}
                              className="px-2 py-1 text-xs rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40">
                              Success
                            </button>
                            <button type="button" onClick={() => setAction({ id: w.id, action: "MARK_FAILED" })}
                              className="px-2 py-1 text-xs rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40">
                              Fail
                            </button>
                          </>)}
                          {w.status === "SUCCESSFUL" && (
                            <button type="button" onClick={() => setAction({ id: w.id, action: "REVERSE" })}
                              className="px-2 py-1 text-xs rounded-lg bg-slate-600/40 text-slate-400 hover:bg-slate-600/60">
                              Reverse
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {action?.id === w.id && (
                      <tr key={`${w.id}-action`} className="bg-slate-700 border-b border-slate-600">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-300">
                              Mark <strong className="text-white">@{w.user.username}</strong>&apos;s {fmt(w.amount)} withdrawal as{" "}
                              <strong className="text-white">{action.action.replace("MARK_", "").toLowerCase()}</strong>?
                            </span>
                            {(action.action === "MARK_FAILED" || action.action === "REVERSE") && (
                              <input value={note} onChange={(e) => setNote(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="Reason (optional)…"
                              />
                            )}
                            <Button onClick={applyAction} disabled={submitting}
                              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50">
                              {submitting ? "…" : "Confirm"}
                            </Button>
                            <button type="button" onClick={() => { setAction(null); setNote(""); }}
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
          <p className="text-slate-400">Page {page} of {pages} ({total} total)</p>
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
