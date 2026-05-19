"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, ShieldAlert, UserCheck } from "lucide-react";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

interface AdminUser {
  id:            string;
  email:         string;
  phone:         string;
  username:      string;
  role:          string;
  kycLevel:      string;
  membershipTier:string;
  isActive:      boolean;
  isFrozen:      boolean;
  createdAt:     string;
  profile: { firstName: string | null; lastName: string | null } | null;
  wallet:  { availableBalance: number } | null;
}

const KYC_STYLE: Record<string, string> = {
  LEVEL_0:  "bg-slate-600/30 text-slate-300",
  LEVEL_1:  "bg-blue-600/30 text-blue-300",
  LEVEL_2:  "bg-emerald-600/30 text-emerald-300",
  BUSINESS: "bg-purple-600/30 text-purple-300",
};

const TIER_STYLE: Record<string, string> = {
  BASIC:    "text-slate-400",
  SILVER:   "text-slate-200",
  GOLD:     "text-yellow-400",
  BUSINESS: "text-purple-400",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", notation: "compact", maximumFractionDigits: 0 }).format(n);
}

function ago(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

type ActionState = { id: string; action: "freeze" | "unfreeze" } | null;

const FILTERS = ["all", "frozen", "inactive"] as const;

export default function AdminUsersPage() {
  const [users,      setUsers]      = useState<AdminUser[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [q,          setQ]          = useState("");
  const [filter,     setFilter]     = useState<typeof FILTERS[number]>("all");
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [action,     setAction]     = useState<ActionState>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast }                   = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const f = filter === "all" ? "" : filter;
      const res = await api.get<{ users: AdminUser[]; pagination: { total: number } }>(
        `/api/admin/users?q=${encodeURIComponent(q)}&status=${f}&page=${page}&limit=15`
      );
      setUsers(res.users);
      setTotal(res.pagination.total);
    } catch {
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [q, filter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function applyAction() {
    if (!action) return;
    setSubmitting(true);
    try {
      await api.patch(`/api/admin/users/${action.id}`, { isFrozen: action.action === "freeze" });
      toast(`User ${action.action}d`, "success");
      setAction(null);
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
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} total</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-sm w-56"
            placeholder="Search name, email, phone…"
          />
        </div>
      </div>

      <div className="flex gap-1">
        {FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors border capitalize ${
              filter === f
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-700">
              <tr>
                {["User", "Email", "KYC", "Tier", "Balance", "Status", "Joined", "Actions"].map((h) => (
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <>
                    <tr key={u.id} className={`border-b border-slate-700 hover:bg-slate-750 transition-colors ${action?.id === u.id ? "bg-slate-700" : ""}`}>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">
                          {u.profile?.firstName ? `${u.profile.firstName} ${u.profile.lastName ?? ""}`.trim() : `@${u.username}`}
                        </p>
                        <p className="text-slate-400 text-xs">@{u.username}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${KYC_STYLE[u.kycLevel] ?? "bg-slate-600/30 text-slate-300"}`}>
                          {u.kycLevel.replace("_", " ")}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-xs font-semibold ${TIER_STYLE[u.membershipTier] ?? "text-slate-400"}`}>
                        {u.membershipTier}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 text-xs font-medium">
                        {u.wallet ? fmt(Number(u.wallet.availableBalance)) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {u.isFrozen ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-300">Frozen</span>
                        ) : u.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-500/20 text-slate-400">Inactive</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{ago(u.createdAt)}</td>
                      <td className="py-3 px-4">
                        <button type="button"
                          onClick={() => setAction({ id: u.id, action: u.isFrozen ? "unfreeze" : "freeze" })}
                          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${
                            u.isFrozen
                              ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40"
                              : "bg-red-600/20 text-red-400 hover:bg-red-600/40"
                          }`}
                        >
                          {u.isFrozen ? <UserCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {u.isFrozen ? "Unfreeze" : "Freeze"}
                        </button>
                      </td>
                    </tr>
                    {action?.id === u.id && (
                      <tr key={`${u.id}-action`} className="bg-slate-700 border-b border-slate-600">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-300">
                              {action.action === "freeze" ? "Freeze" : "Unfreeze"} account{" "}
                              <strong className="text-white">@{u.username}</strong>?
                              {action.action === "freeze" && <span className="text-red-400 ml-1">This will block all transactions.</span>}
                            </span>
                            <button type="button" onClick={applyAction} disabled={submitting}
                              className={`px-3 py-1.5 text-xs rounded-lg text-white disabled:opacity-50 ${
                                action.action === "freeze" ? "bg-red-600 hover:bg-red-500" : "bg-emerald-600 hover:bg-emerald-500"
                              }`}>
                              {submitting ? "…" : "Confirm"}
                            </button>
                            <button type="button" onClick={() => setAction(null)} className="text-xs text-slate-400 hover:text-white px-2">
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
          <p className="text-slate-400">Page {page} of {pages} ({total} users)</p>
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
