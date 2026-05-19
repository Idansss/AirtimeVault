import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Activity } from "lucide-react";

const services = [
  { name: "Airtime Conversion",    status: "operational", latency: "420ms" },
  { name: "Bill Payments",         status: "operational", latency: "310ms" },
  { name: "Wallet Transfers",      status: "operational", latency: "280ms" },
  { name: "Withdrawals",           status: "operational", latency: "510ms" },
  { name: "KYC Verification",      status: "operational", latency: "850ms" },
  { name: "Virtual Cards",         status: "operational", latency: "390ms" },
  { name: "User Authentication",   status: "operational", latency: "120ms" },
  { name: "Push Notifications",    status: "operational", latency: "65ms"  },
];

const incidents: { date: string; title: string; status: "resolved" | "investigating"; body: string }[] = [
  {
    date: "May 10, 2025",
    title: "Elevated withdrawal processing times",
    status: "resolved",
    body: "Some withdrawal requests experienced delays of up to 45 minutes due to a partner bank API timeout. All pending transactions were processed and the issue was resolved at 14:32 WAT.",
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "operational") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Operational
      </span>
    );
  }
  if (status === "degraded") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15 px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3 h-3" /> Degraded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15 px-2.5 py-1 rounded-full">
      <AlertCircle className="w-3 h-3" /> Outage
    </span>
  );
}

export default function StatusPage() {
  const allOperational = services.every((s) => s.status === "operational");

  return (
    <main className="min-h-screen bg-[#F6F5F1] dark:bg-[#0D1117] px-5 py-10 md:py-16">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Activity className="w-3.5 h-3.5" />
            System Status
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Status Page
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
            Real-time status for all AirtimeVault services.
          </p>
        </div>

        {/* Overall banner */}
        {allOperational ? (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 rounded-2xl p-5 flex items-center gap-4 mb-6">
            <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">All Systems Operational</p>
              <p className="text-emerald-700 dark:text-emerald-400/70 text-xs mt-0.5">No incidents reported. Last checked just now.</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-2xl p-5 flex items-center gap-4 mb-6">
            <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">Some Services Degraded</p>
              <p className="text-amber-700 dark:text-amber-400/70 text-xs mt-0.5">Our team is actively investigating. See details below.</p>
            </div>
          </div>
        )}

        {/* Services */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Services</h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-8">
          {services.map((service, i) => (
            <div
              key={service.name}
              className={`flex items-center justify-between px-5 py-3.5 ${i < services.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
            >
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{service.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">{service.latency}</span>
                <StatusBadge status={service.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Incidents */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Recent Incidents</h2>
        {incidents.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-sm text-slate-400 dark:text-slate-500">
            No incidents in the past 30 days.
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map(({ date, title, status, body }) => (
              <div key={title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 px-2.5 py-1 rounded-full ${
                    status === "resolved"
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15"
                      : "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15"
                  }`}>
                    {status === "resolved" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {status === "resolved" ? "Resolved" : "Investigating"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">{date}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
