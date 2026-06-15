import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, TOOLS } from "@/lib/tools/registry";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategoryCard } from "@/components/tool/CategoryCard";
import { ToolCard } from "@/components/tool/ToolCard";
import { buildWebsiteSchema, buildOrganizationSchema } from "@/lib/seo/structured-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolmonk.net";

export const metadata: Metadata = {
  title: "ToolMonk | Free Online Tools for Everyone",
  description:
    "200+ free online tools for developers, designers, students, and professionals. Calculators, converters, dev tools, generators, and more. No signup required.",
  openGraph: {
    title: "ToolMonk | Free Online Tools for Everyone",
    description:
      "200+ free online tools: calculators, converters, developer utilities, generators, and more.",
    url: BASE_URL,
    type: "website",
  },
  alternates: { canonical: BASE_URL },
};

// Ordered by actual search demand (validated via Google Trends + competitor research)
const POPULAR_LINK_SLUGS = [
  "age-calculator",
  "bmi-calculator",
  "pdf-to-word",
  "password-generator",
];

// 12 most-searched tool types across all categories (general-user demand, not dev tools)
const POPULAR_TOOL_SLUGS = [
  "age-calculator",        // #1 confirmed
  "bmi-calculator",        // #3 confirmed
  "pdf-to-word",           // #2 confirmed
  "password-generator",    // #4 confirmed
  "currency-converter",    // top converter
  "percentage-calculator", // universal math
  "emi-calculator",        // high finance demand
  "calorie-calculator",    // health trend
  "pdf-compressor",        // PDF tools are huge
  "qr-code-generator",     // ubiquitous
  "image-compressor",      // widespread need
  "temperature-converter", // classic unit conversion
];

const REAL_TOOL_COUNT = TOOLS.filter((t) => !t.aliasOf).length;

const STATS = [
  { value: String(REAL_TOOL_COUNT), label: "Tools" },
  { value: String(CATEGORIES.length), label: "Categories" },
  { value: "100%", label: "Free" },
  { value: "Zero", label: "Signup needed" },
];

export default function HomePage() {
  const popularTools = POPULAR_TOOL_SLUGS
    .map((slug) => TOOLS.find((t) => t.slug === slug && !t.aliasOf))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);
  const websiteSchema = buildWebsiteSchema();
  const organizationSchema = buildOrganizationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="border-b border-border px-4 py-16 md:py-24"
        aria-label="Hero"
      >
        <div className="mx-auto w-full max-w-3xl text-center">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-8 animate-fade-in">
            — Free utility suite · no signup required
          </p>

          <h1
            className="font-mono text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight tracking-tight mb-10 animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            Every <span className="text-primary" >tool.</span> One place.
            <br />
          </h1>

          <div
            className="animate-fade-up relative z-20 mx-auto"
            style={{ animationDelay: "120ms" }}
          >
            <SearchBar tools={TOOLS} className="max-w-full" />
          </div>

          <p
            className="mt-4 font-mono text-[11px] tracking-wider text-foreground-muted animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            Popular:{" "}
            {POPULAR_LINK_SLUGS.map((slug, i) => {
              const tool = TOOLS.find((t) => t.slug === slug && !t.aliasOf);
              return tool ? (
                <span key={i}>
                  {i > 0 && (
                    <span className="mx-1.5 text-border" aria-hidden="true">·</span>
                  )}
                  <Link href={tool.path} className="hover:text-primary transition-colors">
                    {tool.title}
                  </Link>
                </span>
              ) : null;
            })}
          </p>

          {/* Stats row */}
          <div
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 border border-border rounded-xl overflow-hidden animate-fade-up"
            style={{ animationDelay: "240ms" }}
            aria-label="Platform statistics"
          >
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="px-5 py-5 border-b sm:border-b-0 border-r border-border last:border-r-0 [&:nth-child(2)]:border-r sm:[&:nth-child(2)]:border-r bg-surface-muted hover:bg-surface-elevated transition-colors"
              >
                <p className="font-mono text-2xl font-bold text-foreground leading-none">
                  {stat.value}
                </p>
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted mt-1.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section
        className="border-b border-border px-4 py-16"
        aria-labelledby="categories-heading"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-3">
                — Explore
              </p>
              <h2
                id="categories-heading"
                className="text-2xl md:text-3xl font-mono text-foreground"
              >
                Browse by category
              </h2>
            </div>
            <span className="font-mono text-[11px] tracking-wider text-foreground-muted hidden sm:block pb-1">
              {CATEGORIES.length} cats / {REAL_TOOL_COUNT} tools
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Tools ─────────────────────────────────────────────────────── */}
      <section
        className="border-b border-border px-4 py-16"
        aria-labelledby="popular-heading"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-3">
              — Most used
            </p>
            <h2
              id="popular-heading"
              className="text-2xl md:text-3xl font-mono text-foreground"
            >
              Popular tools
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {popularTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20" aria-label="Call to action">
        <div className="mx-auto w-full max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-4">
            — Always free
          </p>
          <h2 className="text-3xl md:text-4xl font-mono text-foreground mb-4 leading-tight">
            All tools. No cost.
            <br />
            No account.{" "}
            <span className="text-primary">Ever.</span>
          </h2>
          <p className="font-mono text-sm text-foreground-muted mb-8 leading-relaxed max-w-md">
            Every calculation runs in your browser. Nothing is sent to our
            servers. Your data stays yours.
          </p>
          <Link
            href="/all-tools"
            className="inline-flex items-center gap-2 bg-primary text-white font-mono text-sm px-5 py-2.5 rounded-lg hover:bg-primary-hover transition-colors"
          >
            Explore all tools
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
