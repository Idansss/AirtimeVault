"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users, RefreshCw, Banknote, BarChart2, AlertTriangle,
  MessageSquare, FileText, Settings, ScanFace,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AirtimeVaultLogo } from "@/components/ui/airtime-vault-logo";

const adminNav = [
  { href: "/admin",             label: "Overview",    icon: BarChart2    },
  { href: "/admin/users",       label: "Users",       icon: Users        },
  { href: "/admin/conversions", label: "Conversions", icon: RefreshCw    },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: Banknote     },
  { href: "/admin/kyc",         label: "KYC Review",  icon: ScanFace     },
  { href: "/admin/rates",       label: "Rates",       icon: Settings     },
  { href: "/admin/fraud",       label: "Fraud Flags", icon: AlertTriangle},
  { href: "/admin/disputes",    label: "Disputes",    icon: MessageSquare},
  { href: "/admin/reports",     label: "Reports",     icon: FileText     },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 bg-slate-900 border-r border-slate-800 flex-col min-h-screen">
      <div className="p-5 border-b border-slate-800">
        <AirtimeVaultLogo admin markClassName="size-9" textClassName="text-base text-white" />
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {adminNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href || (href !== "/admin" && pathname.startsWith(href))
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
