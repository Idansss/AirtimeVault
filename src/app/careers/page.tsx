import Link from "next/link";
import { ArrowLeft, Briefcase, MapPin, Clock, Users, ChevronRight } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/constants";

const openings = [
  {
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Lagos (Remote-friendly)",
    type: "Full-time",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Lagos (Remote-friendly)",
    type: "Full-time",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    title: "Compliance & Risk Analyst",
    department: "Operations",
    location: "Lagos",
    type: "Full-time",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    title: "Customer Success Lead",
    department: "Support",
    location: "Lagos (Hybrid)",
    type: "Full-time",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
];

const perks = [
  "Competitive salary + equity",
  "Remote-friendly culture",
  "Health & wellness allowance",
  "Learning & development budget",
  "Regular team off-sites",
  "High-impact, fast-moving team",
];

export default function CareersPage() {
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
            <Briefcase className="w-3.5 h-3.5" />
            Careers
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Join the team.
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
            We&apos;re building the financial infrastructure for the next generation of Nigerian users. Come work on hard problems that matter.
          </p>
        </div>

        {/* Perks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-10 h-10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">Why AirtimeVault?</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {perk}
              </div>
            ))}
          </div>
        </div>

        {/* Open roles */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Open Roles</h2>
        <div className="space-y-3 mb-8">
          {openings.map(({ title, department, location, type, color, bg }) => (
            <a
              key={title}
              href={`mailto:${SUPPORT_EMAIL}?subject=Application: ${encodeURIComponent(title)}`}
              className="group flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-slate-900/50"
            >
              <div className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{department}</p>
              </div>
              <div className="text-right shrink-0 hidden sm:block">
                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 justify-end">
                  <MapPin className="w-3 h-3" />{location}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 justify-end mt-0.5">
                  <Clock className="w-3 h-3" />{type}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors shrink-0" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Don&apos;t see a role that fits?</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Send us your CV anyway — we&apos;re always open to exceptional talent.</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=General Application - AirtimeVault`}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Send Open Application
          </a>
        </div>
      </div>
    </main>
  );
}
