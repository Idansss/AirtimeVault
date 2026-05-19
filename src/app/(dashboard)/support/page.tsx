"use client";

import { Mail, Phone, Plus, ChevronDown, ChevronUp, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/constants";
import { api, FetchError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

const FAQS = [
  { q: "How long does airtime conversion take?", a: "Most conversions are processed within 30 minutes. During peak hours it may take up to 2 hours." },
  { q: "What is the minimum amount I can convert?", a: "The minimum airtime conversion amount is NGN 500." },
  { q: "Why was my conversion rejected?", a: "Conversions may be rejected if the airtime was not received, the amount did not match, or suspicious activity was detected." },
  { q: "How do I withdraw to my bank account?", a: "Go to Withdraw, add your bank account, enter the amount and your PIN. Withdrawals are processed manually until payout provider credentials are configured." },
  { q: "How do I upgrade my membership tier?", a: "Your tier is upgraded by admins based on verification level, transaction history, and account risk review." },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function loadTickets() {
    const data = await api.get<{ tickets: SupportTicket[] }>("/api/support-tickets");
    setTickets(data.tickets);
  }

  useEffect(() => {
    loadTickets().catch(() => {});
  }, []);

  async function submitTicket() {
    setSubmitting(true);
    try {
      await api.post("/api/support-tickets", { subject, description });
      toast("Support ticket submitted", "success");
      setSubject("");
      setDescription("");
      setShowTicket(false);
      await loadTickets();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Failed to submit ticket", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help & Support</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Find answers or contact our support team.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors group">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
            <Mail className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">Email Support</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">{SUPPORT_EMAIL}</p>
          </div>
        </a>
        <a href={`https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors group">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
            <Phone className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">WhatsApp</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">{SUPPORT_WHATSAPP}</p>
          </div>
        </a>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        <div className="p-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Frequently Asked Questions</h2>
        </div>
        {FAQS.map((faq, i) => (
          <div key={faq.q}>
            <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{faq.q}</span>
              {openFaq === i
                ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              }
            </button>
            {openFaq === i && (
              <div className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800 dark:text-white">My Support Tickets</h2>
          <Button onClick={() => setShowTicket(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Ticket
          </Button>
        </div>
        {tickets.length === 0 ? (
          <div className="py-6 flex flex-col items-center text-center gap-2">
            <LifeBuoy className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No support tickets yet.</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">Open a ticket if you need help with your account.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{ticket.subject}</p>
                  <span className="text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 border border-slate-200 dark:border-slate-700">{ticket.status}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ticket.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTicket && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Open a Ticket</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500" placeholder="Brief description of your issue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 resize-none" rows={4} placeholder="Describe your issue in detail" />
          </div>
          <div className="flex gap-3">
            <Button onClick={submitTicket} disabled={submitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Ticket"}
            </Button>
            <Button variant="outline" onClick={() => setShowTicket(false)} className="flex-1 rounded-xl">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
