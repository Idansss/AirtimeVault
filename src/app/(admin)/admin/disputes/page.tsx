"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

interface Dispute {
  id:          string;
  type:        string;
  subject:     string;
  description: string;
  status:      string;
  createdAt:   string;
  user: { username: string; email: string };
}

const STATUS_STYLES: Record<string, string> = {
  OPEN:         "bg-yellow-500/20 text-yellow-300",
  UNDER_REVIEW: "bg-blue-500/20 text-blue-300",
  RESOLVED:     "bg-emerald-500/20 text-emerald-300",
  CLOSED:       "bg-slate-500/20 text-slate-300",
};

const TYPE_STYLES: Record<string, string> = {
  CONVERSION: "bg-blue-500/20 text-blue-300",
  WITHDRAWAL: "bg-purple-500/20 text-purple-300",
  TRANSFER:   "bg-indigo-500/20 text-indigo-300",
  BILL:       "bg-amber-500/20 text-amber-300",
  ESCROW:     "bg-emerald-500/20 text-emerald-300",
  OTHER:      "bg-slate-500/20 text-slate-300",
};

const STATUSES = ["ALL", "OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"];

function ago(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [status,   setStatus]   = useState("OPEN");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const { toast }               = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s   = status === "ALL" ? "" : status;
      const res = await api.get<{ disputes: Dispute[]; pagination: { total: number } }>(
        `/api/admin/disputes?status=${s}&page=${page}&limit=15`
      );
      setDisputes(res.disputes);
      setTotal(res.pagination.total);
    } catch {
      toast("Failed to load disputes", "error");
    } finally {
      setLoading(false);
    }
  }, [status, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const pages = Math.ceil(total / 15);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Disputes</h1>
        <p className="text-slate-400 text-sm mt-0.5">{total} {status.toLowerCase().replace("_", " ")}</p>
      </div>

      <div className="flex gap-1 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} type="button" onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
              status === s
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
            }`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-700">
              <tr>
                {["User", "Type", "Subject", "Status", "Opened"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-slate-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4].map((i) => (
                  <tr key={i} className="border-b border-slate-700">
                    {[1,2,3,4,5].map((j) => (
                      <td key={j} className="py-3 px-4"><div className="h-4 bg-slate-700 animate-pulse rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">No disputes found.</td>
                </tr>
              ) : (
                disputes.map((d) => (
                  <tr key={d.id} className="border-b border-slate-700 hover:bg-slate-750 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">@{d.user.username}</p>
                      <p className="text-slate-400 text-xs">{d.user.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[d.type] ?? "bg-slate-500/20 text-slate-300"}`}>
                        {d.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white text-sm">{d.subject}</p>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{d.description}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[d.status] ?? "bg-slate-500/20 text-slate-300"}`}>
                        {d.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{ago(d.createdAt)}</td>
                  </tr>
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
