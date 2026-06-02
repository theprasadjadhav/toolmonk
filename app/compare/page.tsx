import Link from "next/link";
import type { Metadata } from "next";
import { COMPARISONS } from "@/lib/comparisons/data";

export const metadata: Metadata = {
  title: "Comparisons — ToolMonk",
  description:
    "Head-to-head comparisons of popular tools, formats, and concepts. Understand the trade-offs and choose the right option for your use case.",
  alternates: { canonical: "https://toolmonk.net/compare" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Breadcrumb */}
      <div className="border-b border-border py-4 px-4">
        <div className="mx-auto w-full max-w-7xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 font-mono text-xs text-foreground-muted">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">compare</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        {/* Header */}
        <header className="pb-8 border-b border-border mb-10">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-3">
            — comparisons
          </p>
          <h1 className="text-2xl md:text-3xl font-mono text-foreground leading-tight">
            Comparisons
          </h1>
          <p className="mt-3 text-sm text-foreground-muted leading-relaxed max-w-xl">
            Head-to-head breakdowns of popular tools, formats, and concepts. Understand the trade-offs so you can choose the right option for your use case.
          </p>
        </header>

        {/* Comparisons grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {COMPARISONS.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="group block border border-border bg-surface hover:border-primary transition-colors p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-sm text-foreground font-semibold">
                  {c.optionA.name}
                </span>
                <span className="font-mono text-xs text-foreground-muted">vs</span>
                <span className="font-mono text-sm text-foreground font-semibold">
                  {c.optionB.name}
                </span>
              </div>

              <h2 className="font-mono text-base text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                {c.title}
              </h2>

              <p className="text-sm text-foreground-muted leading-relaxed mb-4 line-clamp-3">
                {c.description}
              </p>

              <div className="flex items-center justify-between">
                <time
                  dateTime={c.publishedAt}
                  className="font-mono text-[11px] text-foreground-muted"
                >
                  {formatDate(c.publishedAt)}
                </time>
                <span className="font-mono text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  read →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
