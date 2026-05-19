import Link from "next/link";
import {
  ArrowRight, Shield, Zap, Smartphone,
  Send, CreditCard, RefreshCw, BadgePercent,
  Star, Lock, Eye, TrendingUp, Plus, ArrowUpRight,
} from "lucide-react";
import { DEFAULT_RATES, NETWORK_LABELS, SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/constants";
import { MobileMenu } from "@/components/landing/MobileMenu";
import { FAQAccordion } from "@/components/landing/FAQAccordion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NetworkLogo } from "@/components/ui/network-logo";
import { AirtimeVaultLogo, AirtimeVaultMark } from "@/components/ui/airtime-vault-logo";

const NETWORK_BG: Record<string, string> = {
  MTN:        "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
  AIRTEL:     "from-red-500/10 to-red-500/5 border-red-500/20",
  GLO:        "from-green-500/10 to-green-500/5 border-green-500/20",
  NINEMOBILE: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
};

const NETWORKS = ["MTN", "AIRTEL", "GLO", "NINEMOBILE"] as const;

const HOW_IT_WORKS = [
  { step: "01", title: "Submit Request",   desc: "Select your network, enter the airtime amount and your transaction PIN." },
  { step: "02", title: "Send the Airtime", desc: "Transfer the exact airtime to our secure collection number shown after submission." },
  { step: "03", title: "We Verify",        desc: "Our system confirms receipt and an agent verifies your transfer." },
  { step: "04", title: "Wallet Credited",  desc: "Funds land in your AirtimeVault wallet — usually in under 30 minutes." },
];

const FEATURES = [
  { icon: RefreshCw,    title: "Airtime Conversion",  desc: "Convert MTN, Airtel, Glo, and 9mobile airtime to wallet funds in minutes.",        gradient: "from-emerald-400 to-teal-500"  },
  { icon: Smartphone,   title: "Data Conversion",      desc: "Turn unused data bundles into spendable wallet balance instantly.",                 gradient: "from-blue-400 to-blue-600"     },
  { icon: Zap,          title: "Bill Payments",         desc: "Pay electricity, cable TV, internet, and more straight from your wallet.",         gradient: "from-orange-400 to-orange-600" },
  { icon: Send,         title: "P2P Transfers",         desc: "Send money instantly to any AirtimeVault user by username or phone.",              gradient: "from-violet-400 to-purple-600" },
  { icon: CreditCard,   title: "Virtual Card",          desc: "Shop online on any platform using a virtual Naira card from your wallet.",         gradient: "from-pink-400 to-rose-500"     },
  { icon: BadgePercent, title: "Referral Bonuses",      desc: "Earn ₦500 for every friend who joins and completes their first conversion.",       gradient: "from-amber-400 to-orange-500"  },
];

const TESTIMONIALS: { name: string; role: string; rating: number; text: string }[] = [/*
  { name: "Chukwuemeka A.", role: "Lagos, Nigeria",  rating: 5, text: "..." },
*/];

const TRUST_POINTS = [
  { icon: Lock,       title: "Transaction PIN",     desc: "Every withdrawal and transfer requires your 4-digit PIN."              },
  { icon: Shield,     title: "KYC Verification",    desc: "Identity verification protects your account and unlocks higher limits." },
  { icon: Eye,        title: "Fraud Monitoring",    desc: "Automated systems flag suspicious activity 24/7."                      },
  { icon: TrendingUp, title: "Encrypted Transfers", desc: "All data is encrypted in transit and at rest."                        },
];

const FOOTER_LINKS = {
  Product: [
    { label: "Convert Airtime", href: "/register" },
    { label: "Bill Payments",   href: "/register" },
    { label: "Send Money",      href: "/register" },
    { label: "Virtual Card",    href: "/register" },
    { label: "Gift Cards",      href: "/register" },
  ],
  Company: [
    { label: "About Us", href: "/about"   },
    { label: "Blog",     href: "/blog"    },
    { label: "Careers",  href: "/careers" },
    { label: "Contact",  href: "/contact" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/legal/terms"   },
    { label: "Privacy Policy",   href: "/legal/privacy" },
    { label: "Cookie Policy",    href: "/legal/cookies" },
    { label: "AML Policy",       href: "/legal/aml"     },
  ],
  Support: [
    { label: "Help Centre", href: "/help"                                                   },
    { label: "Live Chat",   href: "/contact"                                                },
    { label: "WhatsApp",    href: `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`   },
    { label: "Status Page", href: "/status"                                                 },
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen landing-bg text-slate-900 dark:text-white overflow-x-hidden dot-grid">

      {/* ── Navbar ── */}
      <nav className="glass-nav sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <AirtimeVaultLogo markClassName="size-8" textClassName="text-lg text-slate-900 dark:text-white" />
          </Link>

          <div className="hidden md:flex items-center gap-7 text-slate-700 dark:text-slate-200 text-sm">
            {[["Rates","/#rates"],["How It Works","/#how-it-works"],["Features","/#features"],["FAQ","/#faq"]].map(([label,href])=>(
              <Link key={label} href={href} className="hover:text-slate-900 dark:hover:text-white transition-colors">{label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 transition-all" />
            <Link href="/login" className="hidden md:block text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors font-medium px-2">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_32px_rgba(16,185,129,0.45)]"
            >
              Get Started
            </Link>
            <MobileMenu />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[700px] h-[600px] rounded-full bg-violet-700/10 blur-[130px]" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[400px] rounded-full bg-emerald-700/8 blur-[110px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-700/6 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: text ── */}
            <div>

              <h1 className="font-display font-extrabold leading-[1.02] tracking-tight mb-6">
                <span className="block text-5xl sm:text-6xl xl:text-7xl">Turn unused</span>
                <span className="block text-5xl sm:text-6xl xl:text-7xl">airtime into</span>
                <span className="block text-5xl sm:text-6xl xl:text-7xl bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-500 bg-clip-text text-transparent mt-1">
                  real money
                </span>
              </h1>

              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
                Convert MTN, Airtel, Glo, and 9mobile airtime to wallet funds in under 30 minutes.
                Pay bills, withdraw to bank, or send money — all from one secure wallet.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.55)]"
                >
                  Start Converting Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/#how-it-works"
                  className="glass inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  See How It Works
                </Link>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {NETWORKS.map((n) => (
                  <div key={n} className={`flex items-center gap-2 bg-linear-to-r ${NETWORK_BG[n]} border rounded-xl px-3 py-1.5`}>
                    <NetworkLogo network={n} size="xs" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{NETWORK_LABELS[n]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: 3D visuals ── */}
            <div className="relative hidden lg:flex items-center justify-center h-[560px]">

              {/* Spinning rings */}
              <div className="spin-ring absolute w-[420px] h-[420px] rounded-full border border-violet-400/20 dark:border-violet-500/8" />
              <div className="spin-ring-r absolute w-[320px] h-[320px] rounded-full border border-emerald-400/15 dark:border-emerald-500/7" />
              <div className="spin-ring absolute w-[220px] h-[220px] rounded-full border border-slate-300/30 dark:border-white/4" />

              {/* 3D orbs */}
              <div className="orb-violet float-b absolute -top-4 right-4 w-48 h-48 opacity-80" />
              <div className="orb-teal   float-c absolute bottom-8 -right-4 w-28 h-28 opacity-70" />
              <div className="orb-blue   float-d absolute top-1/3 -left-4 w-18 h-18 opacity-55" />

              {/* Floating geometric shapes */}
              <div className="geo-violet float-a absolute top-10 left-12 w-11 h-11 rounded-xl rotate-12" />
              <div className="geo-emerald float-c absolute top-6 right-24 w-8 h-8 rounded-lg -rotate-8" />
              <div className="geo-blue   float-b absolute bottom-20 left-8 w-9 h-9 rounded-xl rotate-6" />
              <div className="geo-violet float-d absolute bottom-10 right-12 w-7 h-7 rounded-lg rotate-45" />

              {/* 3D wallet card mockup — always dark */}
              <div className="card-3d relative w-full max-w-[300px]">
                <div className="wallet-card-bg rounded-2xl p-5 text-white shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/9">
                  <div className="wallet-glow-purple absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none" />
                  <div className="wallet-glow-green  absolute -bottom-10 -left-6  w-36 h-36 rounded-full pointer-events-none" />
                  <div className="wallet-grid-overlay absolute inset-0 rounded-2xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-white/40 text-[10px] font-semibold uppercase tracking-[0.15em]">Available Balance</p>
                        <p className="text-3xl font-display font-bold mt-1.5 tracking-tight">₦24,500.00</p>
                      </div>
                      <div className="p-2 rounded-xl border border-white/10 bg-white/5">
                        <Eye className="w-3.5 h-3.5 text-white/40" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[["Converted","₦120K"],["Withdrawn","₦80K"],["Cashback","₦1.2K"]].map(([l,v])=>(
                        <div key={l} className="bg-white/5 rounded-xl p-2.5 border border-white/6">
                          <p className="text-[9px] text-white/30 uppercase tracking-wide">{l}</p>
                          <p className="text-xs text-white/75 font-semibold mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        [Plus,         "Convert",  "bg-emerald-500/15"],
                        [ArrowUpRight, "Withdraw", "bg-blue-500/15"   ],
                        [Send,         "Send",     "bg-purple-500/15" ],
                      ].map(([Icon, label, bg]) => (
                        <div key={label as string} className={`${bg} rounded-xl py-3 flex flex-col items-center gap-1.5`}>
                          <Icon className="w-3.5 h-3.5 text-white/60" />
                          <p className="text-[10px] text-white/55 font-medium">{label as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification chips */}
              <div className="glass float-c absolute top-16 -left-4 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-lg min-w-[160px]">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold">₦5,000 Converted</p>
                  <p className="text-[10px] text-slate-500">Just now · MTN</p>
                </div>
              </div>

              <div className="glass float-b absolute bottom-24 -left-6 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-lg">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold">Withdrawal sent</p>
                  <p className="text-[10px] text-slate-500">₦10,000 · GTBank</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "4",     label: "Networks",    sub: "MTN · Airtel · Glo · 9mobile", card: "bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/15", val: "text-emerald-600 dark:text-emerald-400" },
            { value: "< 30m", label: "Avg. Speed",  sub: "Per conversion",                card: "bg-violet-50 dark:bg-violet-500/8 border border-violet-200 dark:border-violet-500/15",   val: "text-violet-600 dark:text-violet-400"  },
            { value: "PIN",   label: "Protected",   sub: "Every transaction",              card: "bg-blue-50 dark:bg-blue-500/8 border border-blue-200 dark:border-blue-500/15",           val: "text-blue-600 dark:text-blue-400"     },
            { value: "24/7",  label: "Fraud Watch", sub: "Automated detection",            card: "bg-orange-50 dark:bg-orange-500/8 border border-orange-200 dark:border-orange-500/15",  val: "text-orange-600 dark:text-orange-400" },
          ].map(({ value, label, sub, card, val }) => (
            <div key={label} className={`rounded-2xl p-5 ${card}`}>
              <p className={`font-display text-3xl font-bold mb-1 ${val}`}>{value}</p>
              <p className="font-semibold text-sm text-slate-800 dark:text-white">{label}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rates ── */}
      <section id="rates" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">Live Rates</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Today&apos;s Conversion Rates</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">Higher membership tiers unlock better rates. Upgrade anytime.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {NETWORKS.map((n) => (
            <div key={n} className={`glass bg-linear-to-b ${NETWORK_BG[n]} rounded-2xl p-6 text-center`}>
              <NetworkLogo network={n} size="lg" className="mx-auto mb-3" />
              <p className="font-semibold mb-3 text-sm">{NETWORK_LABELS[n]}</p>
              <p className="font-display text-5xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">{DEFAULT_RATES[n].BASIC}%</p>
              <p className="text-slate-500 text-xs mt-2">Basic rate</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-white/6">
                <tr>
                  <th className="text-left py-3.5 px-5 text-slate-500 font-medium">Network</th>
                  {["Basic","Silver","Gold","Business"].map((t) => (
                    <th key={t} className="text-center py-3.5 px-4 text-slate-500 font-medium">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/4">
                {NETWORKS.map((n) => (
                  <tr key={n} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <NetworkLogo network={n} size="xs" />
                        <span className="font-medium">{NETWORK_LABELS[n]}</span>
                      </div>
                    </td>
                    {(["BASIC","SILVER","GOLD","BUSINESS"] as const).map((tier) => (
                      <td key={tier} className="py-3.5 px-4 text-center">
                        <span className={`font-bold ${tier === "GOLD" || tier === "BUSINESS" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                          {DEFAULT_RATES[n][tier]}%
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-center text-slate-500 text-xs mt-3">
          Rates are updated periodically. Your rate is locked at submission time.
        </p>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">Process</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-slate-600 dark:text-slate-400">Four simple steps from airtime to spendable wallet funds.</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <div key={step} className="relative group">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-5 left-12 right-0 h-px bg-linear-to-r from-emerald-500/25 to-transparent z-0" />
              )}
              <div className="glass relative z-10 rounded-2xl p-5 overflow-hidden hover:border-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5">
                {/* Decorative oversized step number */}
                <span className="absolute -bottom-3 -right-1 font-display text-8xl font-bold text-slate-200 dark:text-white/4 leading-none select-none pointer-events-none">{step}</span>
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-display font-bold text-sm mb-4 shadow-[0_0_18px_rgba(16,185,129,0.3)] text-white">
                    {step}
                  </div>
                  <h3 className="font-bold mb-2">{title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Everything in One Wallet</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            AirtimeVault is more than airtime conversion — it&apos;s a complete financial toolkit for everyday Nigerians.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, gradient }) => (
            <div
              key={title}
              className="glass group rounded-2xl p-5 flex gap-4 items-start hover:border-slate-300 dark:hover:border-white/14 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`w-11 h-11 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-1.5">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Security — always dark panel ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div
          className="panel-security relative rounded-3xl p-8 md:p-12 overflow-hidden"
        >
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-600/15 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-60 h-60 rounded-full bg-violet-700/10 blur-[70px]" />
          <div className="wallet-grid-overlay absolute inset-0 rounded-3xl" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>

              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 text-white">Your money is safe with us</h2>
              <p className="text-slate-400 leading-relaxed">
                Every account is protected with multiple layers of security — so you can convert and transact with complete confidence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white/5 border border-white/8 rounded-2xl p-4 hover:border-emerald-500/25 transition-colors">
                  <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {TESTIMONIALS.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-3">What our users say</h2>
            <p className="text-slate-600 dark:text-slate-400">From verified users and completed transactions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, rating, text }) => (
              <div key={name} className="glass rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div className="border-t border-slate-200 dark:border-white/6 pt-4">
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-slate-500 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">FAQ</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Frequently Asked Questions</h2>
          <p className="text-slate-600 dark:text-slate-400">Everything you need to know before getting started.</p>
        </div>
        <FAQAccordion />
        <p className="text-center text-slate-500 text-sm mt-8">
          Still have questions?{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">
            Contact our support team
          </a>
        </p>
      </section>

      {/* ── Final CTA — always dark panel ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div
          className="panel-cta relative rounded-3xl p-10 md:p-16 text-center overflow-hidden"
        >
          <div className="pointer-events-none wallet-grid-overlay absolute inset-0 rounded-3xl" />
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-emerald-600/15 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 orb-violet w-60 h-60 opacity-20" />
          <div className="relative">
            <AirtimeVaultMark className="size-14 mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">Ready to convert your airtime?</h2>
            <p className="text-slate-400 text-lg mb-9 max-w-xl mx-auto leading-relaxed">
              Create your free account and submit your first conversion request in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_32px_rgba(16,185,129,0.3)] hover:shadow-[0_0_52px_rgba(16,185,129,0.55)]"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 transition-all"
              >
                Sign In
              </Link>
            </div>
            <p className="text-slate-500 text-sm mt-6">No setup fee · No monthly charge · Only small withdrawal fees.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 dark:border-white/5 pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center mb-4">
                <AirtimeVaultLogo markClassName="size-8" textClassName="text-base text-slate-900 dark:text-white" />
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">
                Nigeria&apos;s trusted airtime-to-cash platform. Convert, withdraw, pay bills and more.
              </p>
            </div>

            {(Object.entries(FOOTER_LINKS) as [string, { label: string; href: string }[]][]).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-semibold text-sm mb-4">{title}</h3>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-white/4 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} AirtimeVault Technologies Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/legal/privacy" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Privacy</Link>
              <Link href="/legal/terms"   className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
