"use client";

import { Bell, BellOff, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TYPE_COLOR: Record<string, string> = {
  CONVERSION_APPROVED: "bg-emerald-100 text-emerald-700",
  CONVERSION_REJECTED: "bg-red-100 text-red-700",
  WITHDRAWAL_SUCCESSFUL: "bg-emerald-100 text-emerald-700",
  WITHDRAWAL_REVERSED: "bg-amber-100 text-amber-700 dark:text-amber-300",
  KYC_APPROVED: "bg-blue-100 text-blue-700 dark:text-blue-300",
  KYC_REJECTED: "bg-red-100 text-red-700",
  ACCOUNT_FROZEN: "bg-red-100 text-red-700",
  default: "bg-slate-100 text-slate-600 dark:text-slate-400",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "Just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const { data, loading, markAllRead, markRead } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          {data && data.unread > 0 && (
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{data.unread} unread</p>
          )}
        </div>
        {data && data.unread > 0 && (
          <Button
            onClick={markAllRead}
            variant="outline"
            className="flex items-center gap-2 text-sm border-slate-200 text-slate-600 hover:text-slate-900"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {loading ? (
          <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 animate-pulse rounded w-1/3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !data?.notifications.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <BellOff className="w-10 h-10 mb-3 opacity-40" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm mt-1">We&apos;ll notify you when something happens.</p>
          </div>
        ) : (
          data.notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => !n.isRead && markRead(n.id)}
              className={cn(
                "w-full text-left p-4 flex items-start gap-3 transition-colors hover:bg-slate-50",
                !n.isRead && "bg-emerald-50/40"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                TYPE_COLOR[n.type] ?? TYPE_COLOR.default
              )}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-medium text-slate-900", !n.isRead && "font-semibold")}>
                    {n.title}
                  </p>
                  <span className="text-xs text-slate-400 shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
