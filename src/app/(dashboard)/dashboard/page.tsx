import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/api/auth";
import { prisma } from "@/lib/prisma";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import type { WalletSummary, LedgerEntry } from "@/types";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtCompact(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN",
    notation: "compact", maximumFractionDigits: 1,
  }).format(n);
}

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const [wallet, user, ledgerRows] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId: session.sub } }),
    prisma.user.findUnique({
      where:  { id: session.sub },
      select: { isActive: true, isFrozen: true },
    }),
    prisma.walletLedger.findMany({
      where:   { wallet: { userId: session.sub } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  if (!user?.isActive || user?.isFrozen) redirect("/login");

  const walletData: WalletSummary = {
    availableBalance: Number(wallet?.availableBalance ?? 0),
    pendingBalance:   Number(wallet?.pendingBalance   ?? 0),
    lockedBalance:    Number(wallet?.lockedBalance    ?? 0),
    totalConverted:   Number(wallet?.totalConverted   ?? 0),
    totalWithdrawn:   Number(wallet?.totalWithdrawn   ?? 0),
    totalSpent:       Number(wallet?.totalSpent       ?? 0),
    cashbackEarned:   Number(wallet?.cashbackEarned   ?? 0),
    referralEarned:   Number(wallet?.referralEarned   ?? 0),
  };

  const entries: LedgerEntry[] = ledgerRows.map((e) => ({
    id:            e.id,
    type:          e.type,
    status:        e.status as LedgerEntry["status"],
    amount:        Number(e.amount),
    balanceBefore: Number(e.balanceBefore),
    balanceAfter:  Number(e.balanceAfter),
    fee:           Number(e.fee),
    reference:     e.reference,
    description:   e.description ?? "",
    createdAt:     e.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{getGreeting()} 👋</h1>
          <p className="text-slate-400 text-sm mt-0.5">{fmtDate(new Date())}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          All systems operational
        </div>
      </div>

      {/* Wallet card + stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WalletCard wallet={walletData} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="stat-card-purple flex-1 rounded-2xl p-5 border">
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-[0.13em]">
              Total Withdrawn
            </p>
            <p className="text-2xl font-bold text-violet-700 dark:text-violet-300 mt-2 leading-none">
              {fmtCompact(walletData.totalWithdrawn)}
            </p>
            <p className="text-[11px] text-violet-400 mt-1.5">Lifetime withdrawals</p>
          </div>
          <div className="stat-card-emerald flex-1 rounded-2xl p-5 border">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.13em]">
              Cashback Earned
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2 leading-none">
              {fmtCompact(walletData.cashbackEarned)}
            </p>
            <p className="text-[11px] text-emerald-400 mt-1.5">From all transactions</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Recent Transactions</h2>
        <TransactionTable entries={entries} />
      </div>

    </div>
  );
}
