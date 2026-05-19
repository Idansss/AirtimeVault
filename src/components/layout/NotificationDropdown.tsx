"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, BellOff, CheckCheck, ArrowLeftRight, ArrowUpRight, BadgeCheck, ShieldAlert, X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotifications, type AppNotification } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const TYPE_META: Record<string, { color: string; Icon: React.ElementType; href: string }> = {
  CONVERSION_APPROVED:   { color: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", Icon: ArrowLeftRight, href: "/convert/airtime"  },
  CONVERSION_REJECTED:   { color: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400",                Icon: ArrowLeftRight, href: "/convert/airtime"  },
  WITHDRAWAL_SUCCESSFUL: { color: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",            Icon: ArrowUpRight,   href: "/withdraw"         },
  WITHDRAWAL_REVERSED:   { color: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",        Icon: ArrowUpRight,   href: "/withdraw"         },
  KYC_APPROVED:          { color: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", Icon: BadgeCheck,     href: "/kyc"              },
  KYC_REJECTED:          { color: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400",                Icon: BadgeCheck,     href: "/kyc"              },
  ACCOUNT_FROZEN:        { color: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400",                Icon: ShieldAlert,    href: "/profile"          },
};
const DEFAULT_META = { color: "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400", Icon: Bell, href: "/notifications" };

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotificationItem({
  n,
  onClose,
  onMarkRead,
}: {
  n: AppNotification;
  onClose: () => void;
  onMarkRead: (id: string) => void;
}) {
  const router = useRouter();
  const meta   = TYPE_META[n.type] ?? DEFAULT_META;
  const Icon   = meta.Icon;

  function handleClick() {
    if (!n.isRead) onMarkRead(n.id);
    onClose();
    router.push(meta.href);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group",
        !n.isRead && "bg-emerald-50/50 dark:bg-emerald-500/5"
      )}
    >
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", meta.color)}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm text-slate-800 dark:text-slate-200 leading-snug",
            !n.isRead ? "font-semibold" : "font-medium"
          )}>
            {n.title}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5 tabular-nums">{timeAgo(n.createdAt)}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
      </div>
      <div className="flex flex-col items-center gap-1.5 shrink-0 self-center">
        {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
      </div>
    </button>
  );
}

export function NotificationDropdown() {
  const [open, setOpen]             = useState(false);
  const { data, loading, markAllRead, markRead } = useNotifications();
  const unread                      = data?.unread ?? 0;
  const containerRef                = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Bell trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
      >
        <Bell className={cn("w-5 h-5 transition-colors", open ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</p>
              {unread > 0 && (
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  {unread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 animate-pulse rounded w-1/2" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.notifications.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                <BellOff className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-0.5">We&apos;ll notify you when something happens.</p>
              </div>
            ) : (
              data.notifications.slice(0, 8).map((n) => (
                <NotificationItem
                  key={n.id}
                  n={n}
                  onClose={() => setOpen(false)}
                  onMarkRead={markRead}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {(data?.notifications.length ?? 0) > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 shrink-0">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1"
              >
                View all notifications
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
