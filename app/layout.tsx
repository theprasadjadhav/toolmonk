import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdProvider } from "@/components/ads/AdProvider";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolmonk.net";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ToolMonk — Free Online Tools for Everyone",
    template: "%s | ToolMonk",
  },
  description:
    "180+ free online tools for developers, designers, students, and professionals. Calculators, converters, dev tools, generators, and more. No signup required.",
  keywords: [
    "free online tools",
    "calculator",
    "converter",
    "developer tools",
    "json formatter",
    "unit converter",
    "password generator",
  ],
  openGraph: {
    type: "website",
    siteName: "ToolMonk",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head />
      <body className="min-h-screen flex flex-col bg-surface text-foreground antialiased">
        <AdProvider>
          <AnalyticsProvider />
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </AdProvider>
      </body>
    </html>
  );
}
