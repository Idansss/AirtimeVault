import Link from "next/link";
import { Link as LinkIcon, QrCode, BarChart3 } from "lucide-react";
import { AirtimeVaultLogo } from "@/components/ui/airtime-vault-logo";

const features = [
  { icon: LinkIcon, title: "Payment links", body: "Collect AirtimeVault wallet payments with shareable links." },
  { icon: QrCode, title: "QR payments", body: "Accept in-person wallet payments with scan-to-pay flows." },
  { icon: BarChart3, title: "Settlement reports", body: "Track sales, fees, refunds, and bank settlement status." },
];

export default function MerchantsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-12">
        <nav>
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <AirtimeVaultLogo markClassName="size-8" textClassName="text-base text-white" />
          </Link>
        </nav>

        <section className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Accept AirtimeVault as payment</h1>
          <p className="text-slate-400 text-lg mt-5">
            Merchant tools are planned for verified businesses. Wallet checkout, QR payments, API keys, and settlements should only be enabled after KYB and payment partner approval.
          </p>
          <Link href="/register" className="inline-flex mt-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-3 font-semibold">
            Join merchant waitlist
          </Link>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <Icon className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold mt-4">{title}</h2>
              <p className="text-sm text-slate-400 mt-2">{body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
