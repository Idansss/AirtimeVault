"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, RefreshCw, Banknote, Receipt, AlertTriangle, MessageSquare } from "lucide-react";
import { api } from "@/lib/api/client";

interface ReportData {
  period:      string;
  users:       { total: number; new: number };
  conversions: { total: number; successful: number; successRate: number; airtimeReceived: number; walletCredited: number };
  withdrawals: { total: number; successful: number; volume: number; feesCollected: number };
  billPayments:{ total: number; volume: number };
  health:      { openDisputes: number; unresolvedFraudFlags: number };
  revenue:     { estimated: number };
}

const PERIODS = [
  { value: "7d",  label: "7 days"  },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time"},
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function fmtFull(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
}

function MetricCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-sm">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-4">
      <h2 className="text-white font-semibold text-sm border-b border-slate-700 pb-3">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-emerald-400" : "text-white"}`}>{value}</span>
    </div>
  );
}

export default function AdminReportsPage() {
  const [report,  setReport]  = useState<ReportData | null>(null);
  const [period,  setPeriod]  = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<ReportData>(`/api/admin/reports?period=${period}`)
      .then(setReport)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-700 rounded-xl ${className}`} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Platform Reports</h1>
          <p className="text-slate-400 text-sm mt-0.5">Aggregated metrics across all operations</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => setPeriod(value)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
                period === value
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1,2,3,4].map((i) => <Skeleton key={i} className="h-28" />)
        ) : (<>
          <MetricCard label="Est. Revenue"        value={fmt(report?.revenue.estimated ?? 0)}         sub="conversion spread + fees"       icon={TrendingUp}  color="bg-emerald-500/20 text-emerald-400" />
          <MetricCard label="Total Users"         value={String(report?.users.total ?? 0)}             sub={`+${report?.users.new ?? 0} new`} icon={Users}      color="bg-blue-500/20 text-blue-400"      />
          <MetricCard label="Airtime Received"    value={fmt(report?.conversions.airtimeReceived ?? 0)} sub="gross inflow"                  icon={RefreshCw}   color="bg-yellow-500/20 text-yellow-400"  />
          <MetricCard label="Withdrawal Volume"   value={fmt(report?.withdrawals.volume ?? 0)}         sub={`${fmt(report?.withdrawals.feesCollected ?? 0)} fees`} icon={Banknote} color="bg-purple-500/20 text-purple-400" />
        </>)}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Conversions">
            <Row label="Total requests"    value={String(report.conversions.total)} />
            <Row label="Successful"        value={String(report.conversions.successful)} />
            <Row label="Success rate"      value={`${report.conversions.successRate}%`} highlight />
            <Row label="Airtime received"  value={fmtFull(report.conversions.airtimeReceived)} />
            <Row label="Wallet credited"   value={fmtFull(report.conversions.walletCredited)} highlight />
            <Row label="Spread (revenue)"  value={fmtFull(report.conversions.airtimeReceived - report.conversions.walletCredited)} highlight />
          </Section>

          <Section title="Withdrawals">
            <Row label="Total requests"   value={String(report.withdrawals.total)} />
            <Row label="Successful"       value={String(report.withdrawals.successful)} />
            <Row label="Total volume"     value={fmtFull(report.withdrawals.volume)} />
            <Row label="Fees collected"   value={fmtFull(report.withdrawals.feesCollected)} highlight />
            <Row label="Success rate"     value={report.withdrawals.total > 0 ? `${Math.round((report.withdrawals.successful / report.withdrawals.total) * 100)}%` : "—"} />
          </Section>

          <Section title="Bill Payments">
            <Row label="Total payments"   value={String(report.billPayments.total)} />
            <Row label="Total volume"     value={fmtFull(report.billPayments.volume)} highlight />
          </Section>

          <Section title="Platform Health">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Unresolved fraud flags
              </span>
              <span className={`text-sm font-semibold ${report.health.unresolvedFraudFlags > 0 ? "text-red-400" : "text-emerald-400"}`}>
                {report.health.unresolvedFraudFlags}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400 text-sm flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Open disputes
              </span>
              <span className={`text-sm font-semibold ${report.health.openDisputes > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {report.health.openDisputes}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400 text-sm flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5 text-emerald-400" /> Total revenue
              </span>
              <span className="text-sm font-semibold text-emerald-400">{fmtFull(report.revenue.estimated)}</span>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
