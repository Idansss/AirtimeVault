"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2 } from "lucide-react";

export function NotifyMeButton({ category, label }: { category: string; label: string }) {
  const key = `marketplace_notify_${category}`;
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSubscribed(localStorage.getItem(key) === "1");
  }, [key]);

  function toggle() {
    if (subscribed) {
      localStorage.removeItem(key);
      setSubscribed(false);
    } else {
      localStorage.setItem(key, "1");
      setSubscribed(true);
    }
  }

  if (subscribed) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
      >
        <CheckCircle2 className="w-4 h-4" />
        You&apos;ll be notified when {label} launches
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
    >
      <Bell className="w-4 h-4" />
      Notify me when it launches
    </button>
  );
}
