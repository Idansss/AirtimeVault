import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, ChevronRight } from "lucide-react";

const posts = [
  {
    tag: "Product",
    tagColor: "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15",
    title: "How AirtimeVault converts your airtime in under 30 minutes",
    summary: "A walkthrough of our end-to-end verification pipeline — from submission to wallet credit.",
    date: "May 12, 2025",
    readTime: "4 min read",
  },
  {
    tag: "Security",
    tagColor: "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/15",
    title: "Why we built multi-layer fraud detection from day one",
    summary: "The decisions behind our transaction monitoring system and what it means for your funds.",
    date: "Apr 28, 2025",
    readTime: "6 min read",
  },
  {
    tag: "Finance",
    tagColor: "text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/15",
    title: "Understanding airtime-to-cash rates in Nigeria",
    summary: "A transparent breakdown of how conversion rates are set across MTN, Airtel, Glo, and 9Mobile.",
    date: "Apr 10, 2025",
    readTime: "5 min read",
  },
  {
    tag: "Product",
    tagColor: "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15",
    title: "Introducing Bill Payments: pay electricity, cable, and data from your wallet",
    summary: "Our newest feature lets you settle utility bills directly from your AirtimeVault balance.",
    date: "Mar 22, 2025",
    readTime: "3 min read",
  },
  {
    tag: "Company",
    tagColor: "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15",
    title: "AirtimeVault passes 50,000 users — what we learned",
    summary: "Reflections on growth, reliability lessons, and what's coming next for our platform.",
    date: "Mar 5, 2025",
    readTime: "7 min read",
  },
];

export default function BlogPage() {
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
          <div className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Blog
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Stories &amp; Updates
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
            Product news, financial insights, and behind-the-scenes from the AirtimeVault team.
          </p>
        </div>

        {/* Posts */}
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.title}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 transition-all cursor-default"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${post.tagColor}`}>
                    {post.tag}
                  </span>
                  <h2 className="font-display font-bold text-slate-900 dark:text-white text-base leading-snug mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
                    {post.summary}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
              </div>
              <div className="flex items-center gap-3 mt-4 text-xs text-slate-400 dark:text-slate-500">
                <span>{post.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-400 dark:text-slate-600 text-center">
          More articles coming soon. Check back regularly.
        </p>
      </div>
    </main>
  );
}
