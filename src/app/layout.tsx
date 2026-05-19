import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const dmSans       = DM_Sans({ subsets: ["latin"], variable: "--font-sans",    weight: ["400", "500", "600"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "AirtimeVault", template: "%s | AirtimeVault" },
  description: "Turn unused airtime into spendable money. Convert MTN, Airtel, Glo, and 9mobile airtime into wallet funds.",
  keywords: ["airtime", "conversion", "fintech", "Nigeria", "wallet", "digital payments"],
  openGraph: {
    title: "AirtimeVault",
    description: "Turn unused airtime into spendable money.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
