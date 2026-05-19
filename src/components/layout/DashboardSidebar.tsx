"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeftRight, Banknote, Send, Receipt, Gift,
  CreditCard, Shield, User, HeadphonesIcon, LogOut,
  LayoutDashboard, Bell, Store, BriefcaseBusiness,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import { AirtimeVaultLogo } from "@/components/ui/airtime-vault-logo";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Transfers",
    items: [
      { href: "/convert/airtime", label: "Convert Airtime", icon: ArrowLeftRight  },
      { href: "/convert/data",    label: "Convert Data",    icon: ArrowLeftRight  },
      { href: "/withdraw",        label: "Withdraw",        icon: Banknote        },
      { href: "/send",            label: "Send Money",      icon: Send            },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/bills",        label: "Pay Bills",    icon: Receipt           },
      { href: "/marketplace",  label: "Marketplace",  icon: Store             },
      { href: "/gift-cards",   label: "Gift Cards",   icon: Gift              },
      { href: "/virtual-card", label: "Virtual Card", icon: CreditCard        },
      { href: "/escrow",       label: "Escrow",       icon: Shield            },
      { href: "/merchant",     label: "Merchant",     icon: BriefcaseBusiness },
    ],
  },
];

const accountItems = [
  { href: "/notifications", label: "Notifications", icon: Bell            },
  { href: "/profile",       label: "Profile",       icon: User            },
  { href: "/kyc",           label: "Verify ID",     icon: Shield          },
  { href: "/support",       label: "Support",       icon: HeadphonesIcon  },
];

function NavLink({
  href, label, icon: Icon, pathname,
}: {
  href: string; label: string; icon: React.ElementType; pathname: string;
}) {
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        active
          ? "sidebar-nav-active text-emerald-400 border border-emerald-500/20"
          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
      )}
    >
      <Icon className={cn(
        "w-[17px] h-[17px] shrink-0 transition-colors",
        active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
      )} />
      <span className="flex-1 leading-none">{label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
    </Link>
  );
}

function Hairline() {
  return <div className="sidebar-hairline mx-4 h-px shrink-0" />;
}

export function DashboardSidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await api.post("/api/auth/logout", {});
    router.push("/login");
  }

  return (
    <aside className={cn(
      "sidebar-bg hidden md:flex flex-col h-screen sticky top-0 overflow-hidden transition-[width] duration-300 ease-in-out shrink-0",
      isOpen ? "w-64" : "w-0"
    )}>
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 shrink-0">
        <Link href="/dashboard" className="flex items-center">
          <AirtimeVaultLogo markClassName="size-9" textClassName="text-base text-white" />
        </Link>
      </div>

      <Hairline />

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto flex flex-col sidebar-scroll">
        <nav className="p-3 pt-4 space-y-4">
          {navGroups.map(({ label, items }) => (
            <div key={label}>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.14em] px-3 mb-1.5">
                {label}
              </p>
              <div className="space-y-0.5">
                {items.map(({ href, label: l, icon }) => (
                  <NavLink key={href} href={href} label={l} icon={icon} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Account section pinned to bottom */}
        <div className="mt-auto p-3 pb-5">
          <Hairline />
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.14em] px-3 mt-4 mb-1.5">
            Account
          </p>
          <div className="space-y-0.5">
            {accountItems.map(({ href, label, icon }) => (
              <NavLink key={href} href={href} label={label} icon={icon} pathname={pathname} />
            ))}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150 border border-transparent"
          >
            <LogOut className="w-[17px] h-[17px] shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
