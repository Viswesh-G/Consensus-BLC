import type { Metadata } from "next";
import { Syne, Inter, Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Display font for hero headline only — geometric, editorial feel matching the
// tier of reference sites (ethereum.org, linear.app). One accent font max.
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

// Body font — Inter is the industry default for high-trust, legible product UIs.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Consensus — How Blockchains Agree",
  description:
    "An interactive, scroll-driven guide to blockchain consensus algorithms — from Proof of Work to Avalanche. Understand the decentralization, security, and scalability tradeoffs that define every chain.",
  openGraph: {
    title: "Consensus — How Blockchains Agree",
    description:
      "Interactive explainer covering 10+ consensus mechanisms: PoW, PoS, DPoS, PBFT, Avalanche, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning required by next-themes to avoid class mismatch on first render
    <html
      lang="en"
      className={cn(syne.variable, inter.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg-base text-fg-base antialiased">
        {/* next-themes ThemeProvider — class strategy for Tailwind v4 dark: variant */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
