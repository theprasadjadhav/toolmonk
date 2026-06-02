import Link from "next/link";
import type { Metadata } from "next";
import { ARTICLES } from "@/lib/blog/articles";

export const metadata: Metadata = {
  title: "Blog & Resources | ToolMonk",
  description:
    "Guides, explainers, and tutorials that complement ToolMonk's free online tools. Learn the formulas, concepts, and best practices behind the calculators, compilers, converters, and comparators you use.",
  alternates: { canonical: "https://toolmonk.net/blog" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
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
              <li className="text-foreground">blog</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        {/* Header */}
        <header className="pb-8 border-b border-border mb-10">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-3">
            — resources
          </p>
          <h1 className="text-2xl md:text-3xl font-mono text-foreground leading-tight">
            Blog & Resources
          </h1>
          <p className="mt-3 text-sm text-foreground-muted leading-relaxed max-w-xl">
            Guides and explainers behind the tools. Learn the formulas,
            concepts, language comparisons, and best practices so you understand
            what you&apos;re calculating, comparing, or running.
          </p>
        </header>

        {/* Articles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group block border border-border bg-surface hover:border-primary transition-colors p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary border border-primary px-1.5 py-0.5">
                  {article.category}
                </span>
                <span className="font-mono text-[11px] text-foreground-muted">
                  {article.readingTime} min read
                </span>
              </div>

              <h2 className="font-mono text-base text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                {article.title}
              </h2>

              <p className="text-sm text-foreground-muted leading-relaxed mb-4 line-clamp-3">
                {article.description}
              </p>

              <div className="flex items-center justify-between">
                <time
                  dateTime={article.publishedAt}
                  className="font-mono text-[11px] text-foreground-muted"
                >
                  {formatDate(article.publishedAt)}
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
