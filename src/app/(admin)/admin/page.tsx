"use client";

import { useEffect, useState } from "react";
import { Users, RefreshCw, Banknote, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api/client";

interface ReportData {
  users:       { total: number; new: number };
  conversions: { total: number; successful: number; successRate: number; airtimeReceived: number; walletCredited: number };
  withdrawals: { total: number; successful: number; volume: number; feesCollected: number };
  health:      { openDisputes: number; unresolvedFraudFlags: number };
  revenue:     { estimated: number };
}

interface RecentConversion {
  id: string; network: string; airtimeAmount: number; walletAmount: number;
  user: { username: string };
}

interface RecentWithdrawal {
  id: string; amount: number;
  user: { username: string };
  bankAccount: { bankName: string };
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-700 rounded-xl ${className}`} />;
}

function StatCard({ label, value, sub, icon: Icon, color, href }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string; href: string;
}) {
  return (
    <Link href={href} className="block bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-sm">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [report,  setReport]  = useState<ReportData | null>(null);
  const [convs,   setConvs]   = useState<RecentConversion[]>([]);
  const [withdraws,setWithdrs]= useState<RecentWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ReportData & { period: string }>("/api/admin/reports?period=7d"),
      api.get<{ conversions: RecentConversion[] }>("/api/admin/conversions?status=PENDING&limit=5"),
      api.get<{ withdrawals: RecentWithdrawal[] }>("/api/admin/withdrawals?status=PENDING&limit=5"),
    ])
      .then(([rep, conv, with_]) => {
        setReport(rep);
        setConvs(conv.conversions);
        setWithdrs(with_.withdrawals);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-0.5">Last 7 days</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1,2,3,4].map((i) => <Skeleton key={i} className="h-28" />)
        ) : (<>
          <StatCard label="Total Users"         value={String(report?.users.total ?? 0)}                   sub={`+${report?.users.new ?? 0} new`}     icon={Users}         color="bg-blue-500/20 text-blue-400"       href="/admin/users" />
          <StatCard label="Pending Conversions" value={String(report?.conversions.total ?? 0)}             sub={`${report?.conversions.successRate ?? 0}% success`}    icon={RefreshCw}     color="bg-yellow-500/20 text-yellow-400"   href="/admin/conversions" />
          <StatCard label="Withdrawal Volume"   value={fmt(report?.withdrawals.volume ?? 0)}               sub={`${fmt(report?.withdrawals.feesCollected ?? 0)} fees`} icon={Banknote}      color="bg-emerald-500/20 text-emerald-400" href="/admin/withdrawals" />
          <StatCard label="Fraud Flags"         value={String(report?.health.unresolvedFraudFlags ?? 0)}   sub={`${report?.health.openDisputes ?? 0} disputes`}       icon={AlertTriangle} color="bg-red-500/20 text-red-400"         href="/admin/fraud" />
        </>)}
      </div>

      {!loading && report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Estimated Revenue</p>
            <p className="text-2xl font-bold text-emerald-400">{fmt(report.revenue.estimated)}</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Airtime Received</p>
            <p className="text-2xl font-bold text-white">{fmt(report.conversions.airtimeReceived)}</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Wallet Credited</p>
            <p className="text-2xl font-bold text-white">{fmt(report.conversions.walletCredited)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Pending Conversions</h2>
            <Link href="/admin/conversions" className="text-xs text-emerald-400 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : convs.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">All clear — no pending conversions.</p>
          ) : (
            <div className="space-y-0 divide-y divide-slate-700">
              {convs.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-white text-sm font-medium">@{c.user.username}</p>
                    <p className="text-slate-400 text-xs">{c.network} · ₦{Number(c.airtimeAmount).toLocaleString()}</p>
                  </div>
                  <Link href="/admin/conversions" className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full hover:bg-yellow-500/30">
                    Review →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Pending Withdrawals</h2>
            <Link href="/admin/withdrawals" className="text-xs text-emerald-400 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : withdraws.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">All clear — no pending withdrawals.</p>
          ) : (
            <div className="space-y-0 divide-y divide-slate-700">
              {withdraws.map((w) => (
                <div key={w.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-white text-sm font-medium">@{w.user.username}</p>
                    <p className="text-slate-400 text-xs">{w.bankAccount.bankName} · ₦{Number(w.amount).toLocaleString()}</p>
                  </div>
                  <Link href="/admin/withdrawals" className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full hover:bg-yellow-500/30">
                    Process →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
