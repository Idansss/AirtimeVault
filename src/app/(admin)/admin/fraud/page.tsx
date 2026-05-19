"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";

interface FraudFlag {
  id:          string;
  userId:      string;
  type:        string;
  description: string;
  isResolved:  boolean;
  createdAt:   string;
  user: { username: string; email: string; phone: string };
}

const TYPE_STYLE: Record<string, string> = {
  VELOCITY:         "bg-orange-500/20 text-orange-300",
  SUSPICIOUS_LOGIN: "bg-yellow-500/20 text-yellow-300",
  CHARGEBACK:       "bg-red-500/20 text-red-300",
  DUPLICATE:        "bg-purple-500/20 text-purple-300",
  MANUAL:           "bg-slate-500/20 text-slate-300",
};

function ago(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

export default function AdminFraudPage() {
  const [flags,      setFlags]      = useState<FraudFlag[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [resolved,   setResolved]   = useState(false);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [resolving,  setResolving]  = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newFlag,    setNewFlag]    = useState({ userId: "", type: "MANUAL", description: "" });
  const [creating,   setCreating]   = useState(false);
  const { toast }                   = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ flags: FraudFlag[]; pagination: { total: number } }>(
        `/api/admin/fraud?resolved=${resolved}&page=${page}&limit=15`
      );
      setFlags(res.flags);
      setTotal(res.pagination.total);
    } catch {
      toast("Failed to load fraud flags", "error");
    } finally {
      setLoading(false);
    }
  }, [resolved, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function resolveFlag(id: string) {
    setResolving(id);
    try {
      await api.patch(`/api/admin/fraud/${id}`, { isResolved: true });
      toast("Flag resolved", "success");
      load();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Failed to resolve", "error");
    } finally {
      setResolving(null);
    }
  }

  async function createFlag() {
    if (!newFlag.userId || !newFlag.description) {
      toast("User ID and description are required", "error");
      return;
    }
    setCreating(true);
    try {
      await api.post("/api/admin/fraud", newFlag);
      toast("Fraud flag created", "success");
      setShowCreate(false);
      setNewFlag({ userId: "", type: "MANUAL", description: "" });
      load();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Failed to create flag", "error");
    } finally {
      setCreating(false);
    }
  }

  const pages = Math.ceil(total / 15);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Fraud Flags</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} {resolved ? "resolved" : "unresolved"}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowCreate((v) => !v)}
            className="px-3 py-1.5 text-xs rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/40">
            + Flag User
          </button>
        </div>
      </div>

      <div className="flex gap-1">
        {[false, true].map((r) => (
          <button key={String(r)} type="button" onClick={() => { setResolved(r); setPage(1); }}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
              resolved === r
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
            }`}>
            {r ? "Resolved" : "Unresolved"}
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="bg-slate-800 rounded-2xl border border-red-600/30 p-5 space-y-3">
          <h3 className="text-white font-semibold text-sm">Create Fraud Flag</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">User ID</label>
              <input value={newFlag.userId} onChange={(e) => setNewFlag((p) => ({ ...p, userId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-red-500"
                placeholder="User UUID…" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type</label>
              <AppSelect
                value={newFlag.type}
                options={["VELOCITY", "SUSPICIOUS_LOGIN", "CHARGEBACK", "DUPLICATE", "MANUAL"].map((type) => ({
                  value: type,
                  label: type,
                }))}
                onChange={(value) => setNewFlag((p) => ({ ...p, type: value }))}
                variant="dark"
                size="sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea value={newFlag.description} onChange={(e) => setNewFlag((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-red-500 resize-none"
              rows={2} placeholder="Describe the suspicious behaviour…" />
          </div>
          <div className="flex gap-2">
            <Button onClick={createFlag} disabled={creating}
              className="bg-red-600 hover:bg-red-500 text-white text-xs px-4 py-1.5 rounded-lg disabled:opacity-50">
              {creating ? "Creating…" : "Create Flag"}
            </Button>
            <button type="button" onClick={() => setShowCreate(false)} className="text-xs text-slate-400 hover:text-white px-3">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-700">
              <tr>
                {["User", "Type", "Description", "Flagged", "Action"].map((h) => (
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
              ) : flags.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    {resolved ? "No resolved flags." : "No active fraud flags. 🎉"}
                  </td>
                </tr>
              ) : (
                flags.map((f) => (
                  <tr key={f.id} className="border-b border-slate-700 hover:bg-slate-750 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">@{f.user.username}</p>
                      <p className="text-slate-400 text-xs">{f.user.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLE[f.type] ?? "bg-slate-500/20 text-slate-300"}`}>
                        {f.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs max-w-xs truncate">{f.description}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{ago(f.createdAt)}</td>
                    <td className="py-3 px-4">
                      {!f.isResolved && (
                        <button type="button"
                          onClick={() => resolveFlag(f.id)}
                          disabled={resolving === f.id}
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 disabled:opacity-50"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {resolving === f.id ? "…" : "Resolve"}
                        </button>
                      )}
                    </td>
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
