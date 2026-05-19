import Link from "next/link";
import { ArrowLeftRight, Banknote, Send, Receipt, Gift, CreditCard, Shield } from "lucide-react";

const actions = [
  { href: "/convert/airtime", label: "Convert Airtime", icon: ArrowLeftRight, gradient: "from-emerald-400 to-teal-500"    },
  { href: "/withdraw",        label: "Withdraw",         icon: Banknote,       gradient: "from-blue-400 to-blue-600"      },
  { href: "/send",            label: "Send Money",       icon: Send,           gradient: "from-violet-400 to-purple-600"  },
  { href: "/bills",           label: "Pay Bills",        icon: Receipt,        gradient: "from-orange-400 to-orange-600"  },
  { href: "/gift-cards",      label: "Gift Cards",       icon: Gift,           gradient: "from-pink-400 to-rose-500"      },
  { href: "/virtual-card",    label: "Virtual Card",     icon: CreditCard,     gradient: "from-indigo-400 to-indigo-600"  },
  { href: "/escrow",          label: "Escrow",           icon: Shield,         gradient: "from-teal-400 to-cyan-600"      },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
      {actions.map(({ href, label, icon: Icon, gradient }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white hover:shadow-md hover:-translate-y-0.5 border border-slate-100 hover:border-slate-200 transition-all duration-200"
        >
          <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight group-hover:text-slate-900 transition-colors">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
