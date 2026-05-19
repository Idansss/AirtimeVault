"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";

interface KYCRecord {
  id:              string;
  userId:          string;
  level:           string;
  status:          string;
  bvn:             string | null;
  nin:             string | null;
  idType:          string | null;
  selfieUrl:       string | null;
  rejectionReason: string | null;
  createdAt:       string;
  user: { username: string; email: string; phone: string };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:  "bg-yellow-500/20 text-yellow-300",
  APPROVED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-red-500/20 text-red-300",
};

const KYC_LEVELS = ["LEVEL_1", "LEVEL_2", "BUSINESS"] as const;
const STATUSES = ["PENDING", "APPROVED", "REJECTED"];

type ActionState = { userId: string; action: "APPROVE" | "REJECT"; username: string; level: string } | null;

function ago(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

function mask(s: string | null) {
  if (!s) return "—";
  return s.slice(0, 3) + "••••••" + s.slice(-2);
}

export default function AdminKYCPage() {
  const [records,    setRecords]    = useState<KYCRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [status,     setStatus]     = useState("PENDING");
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [action,     setAction]     = useState<ActionState>(null);
  const [reason,     setReason]     = useState("");
  const [kycLevel,   setKycLevel]   = useState("LEVEL_1");
  const [submitting, setSubmitting] = useState(false);
  const { toast }                   = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ records: KYCRecord[]; pagination: { total: number } }>(
        `/api/admin/kyc?status=${status}&page=${page}&limit=15`
      );
      setRecords(res.records);
      setTotal(res.pagination.total);
    } catch {
      toast("Failed to load KYC records", "error");
    } finally {
      setLoading(false);
    }
  }, [status, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function applyAction() {
    if (!action) return;
    setSubmitting(true);
    try {
      await api.patch("/api/admin/kyc", {
        userId:          action.userId,
        action:          action.action,
        kycLevel:        action.action === "APPROVE" ? kycLevel : undefined,
        rejectionReason: action.action === "REJECT" ? reason : undefined,
      });
      toast(`KYC ${action.action.toLowerCase()}d for @${action.username}`, "success");
      setAction(null);
      setReason("");
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
        <h1 className="text-xl font-bold text-white">KYC Review</h1>
        <p className="text-slate-400 text-sm mt-0.5">{total} {status.toLowerCase()} submissions</p>
      </div>

      <div className="flex gap-1">
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
                {["User", "Level", "BVN / NIN", "ID Type", "Status", "Submitted", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4].map((i) => (
                  <tr key={i} className="border-b border-slate-700">
                    {[1,2,3,4,5,6,7].map((j) => (
                      <td key={j} className="py-3 px-4"><div className="h-4 bg-slate-700 animate-pulse rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">No {status.toLowerCase()} KYC submissions.</td>
                </tr>
              ) : (
                records.map((r) => (
                  <>
                    <tr key={r.id} className={`border-b border-slate-700 transition-colors ${action?.userId === r.userId ? "bg-slate-700" : "hover:bg-slate-750"}`}>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">@{r.user.username}</p>
                        <p className="text-slate-400 text-xs">{r.user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300">
                          {r.level.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs font-mono">
                        {r.bvn ? `BVN: ${mask(r.bvn)}` : r.nin ? `NIN: ${mask(r.nin)}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">{r.idType ?? "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] ?? "bg-slate-500/20 text-slate-300"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{ago(r.createdAt)}</td>
                      <td className="py-3 px-4">
                        {r.status === "PENDING" && (
                          <div className="flex gap-1">
                            <button type="button"
                              onClick={() => { setAction({ userId: r.userId, action: "APPROVE", username: r.user.username, level: r.level }); setKycLevel(r.level); }}
                              className="px-2 py-1 text-xs rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40">
                              Approve
                            </button>
                            <button type="button"
                              onClick={() => setAction({ userId: r.userId, action: "REJECT", username: r.user.username, level: r.level })}
                              className="px-2 py-1 text-xs rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40">
                              Reject
                            </button>
                          </div>
                        )}
                        {r.selfieUrl && (
                          <a href={r.selfieUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline block mt-1">
                            View docs
                          </a>
                        )}
                      </td>
                    </tr>
                    {action?.userId === r.userId && (
                      <tr key={`${r.id}-action`} className="bg-slate-700 border-b border-slate-600">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm text-slate-300">
                              {action.action === "APPROVE" ? "Approve" : "Reject"} KYC for{" "}
                              <strong className="text-white">@{action.username}</strong>?
                            </span>
                            {action.action === "APPROVE" && (
                              <AppSelect
                                value={kycLevel}
                                options={KYC_LEVELS.map((level) => ({ value: level, label: level.replace("_", " ") }))}
                                onChange={setKycLevel}
                                variant="dark"
                                size="sm"
                                className="w-40"
                              />
                            )}
                            {action.action === "REJECT" && (
                              <input value={reason} onChange={(e) => setReason(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="Rejection reason (required)…"
                              />
                            )}
                            <Button onClick={applyAction}
                              disabled={submitting || (action.action === "REJECT" && !reason.trim())}
                              className={`text-xs px-3 py-1.5 rounded-lg text-white disabled:opacity-50 ${action.action === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}`}>
                              {submitting ? "…" : "Confirm"}
                            </Button>
                            <button type="button" onClick={() => { setAction(null); setReason(""); }}
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
          <p className="text-slate-400">Page {page} of {pages}</p>
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
