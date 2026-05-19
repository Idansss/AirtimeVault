"use client";

import { useState, useEffect } from "react";
import { Menu, PanelLeft, Search } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import { api } from "@/lib/api/client";
import { NotificationDropdown } from "./NotificationDropdown";
import { SearchModal } from "./SearchModal";

interface AccountSummary {
  username: string;
  profile: { firstName: string | null; lastName: string | null; avatarUrl: string | null } | null;
}

export function DashboardNavbar({
  onToggleSidebar,
  sidebarOpen,
}: {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [account, setAccount] = useState<AccountSummary | null>(null);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    api.get<{ user: AccountSummary }>("/api/auth/me")
      .then((data) => setAccount(data.user))
      .catch(() => {});

    function onAvatarUpdated(event: Event) {
      const detail = (event as CustomEvent<{ avatarUrl: string | null }>).detail;
      setAccount((current) => current
        ? {
            ...current,
            profile: {
              firstName: current.profile?.firstName ?? null,
              lastName: current.profile?.lastName ?? null,
              avatarUrl: detail.avatarUrl,
            },
          }
        : current
      );
    }

    window.addEventListener("airtimevault:avatar-updated", onAvatarUpdated);
    return () => window.removeEventListener("airtimevault:avatar-updated", onAvatarUpdated);
  }, []);

  const displayName = account?.profile
    ? [account.profile.firstName, account.profile.lastName].filter(Boolean).join(" ") || account.username
    : "My Account";
  const initials = account?.profile
    ? `${account.profile.firstName?.[0] ?? ""}${account.profile.lastName?.[0] ?? ""}` || account.username[0]
    : "U";

  return (
    <>
      <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
        {/* Left: mobile hamburger + desktop sidebar toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden md:flex p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <PanelLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Search trigger */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 rounded-xl px-3.5 py-2.5 w-72 transition-colors text-left"
          aria-label="Search transactions"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-400 flex-1">Search transactions…</span>
          <kbd className="hidden lg:inline-flex text-[10px] text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-medium font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Mobile search icon */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
          <NotificationDropdown />
          <Link
            href="/profile"
            className="flex items-center gap-2.5 ml-1 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Profile"
          >
            <UserAvatar src={account?.profile?.avatarUrl} name={displayName} initials={initials} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-white leading-none">{displayName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">View profile</p>
            </div>
          </Link>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
