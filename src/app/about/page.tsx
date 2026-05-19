import Link from "next/link";
import { ArrowLeft, Zap, Shield, Users, Globe, TrendingUp, Heart } from "lucide-react";

const values = [
  { Icon: Zap,        title: "Speed",       body: "We process conversions and payments as fast as the underlying networks allow — no unnecessary delays.", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
  { Icon: Shield,     title: "Security",    body: "Every transaction is monitored, every account is verified. Your funds are protected at every step.",    color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-500/10" },
  { Icon: Users,      title: "Inclusion",   body: "We're building for the 200 million Nigerians who need fast, reliable, affordable financial access.",      color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10" },
  { Icon: Globe,      title: "Reach",       body: "From airtime conversion to bill payments, we're expanding the scope of what your wallet can do.",        color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { Icon: TrendingUp, title: "Growth",      body: "We reinvest in reliability, compliance, and new products so you can do more with AirtimeVault over time.", color: "text-cyan-600 dark:text-cyan-400",   bg: "bg-cyan-50 dark:bg-cyan-500/10" },
  { Icon: Heart,      title: "Community",   body: "Our users are our partners. Your feedback drives every feature we build.",                                color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-500/10" },
];

const stats = [
  { label: "Users Served",       value: "50,000+"  },
  { label: "Transactions",       value: "2M+"      },
  { label: "Networks Supported", value: "4"        },
  { label: "Uptime",             value: "99.9%"    },
];

export default function AboutPage() {
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
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Heart className="w-3.5 h-3.5" />
            About Us
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Built for Nigeria,<br />by Nigerians.
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
            AirtimeVault is a fintech platform that makes it easy to convert airtime to cash, pay bills, send money, and manage your wallet — all in one place.
          </p>
        </div>

        {/* Mission card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 md:p-9 mb-5">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-3">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We believe financial tools should be fast, fair, and accessible to everyone. AirtimeVault was started to solve the real problem of stuck airtime — we&apos;ve since grown into a full-stack wallet platform serving tens of thousands of users across Nigeria.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
            Our goal is simple: be the most trusted place to move value in Nigeria.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 mt-8">Our Values</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {values.map(({ Icon, title, body, color, bg }) => (
            <div key={title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
