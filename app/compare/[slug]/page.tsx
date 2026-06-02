import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { COMPARISONS, getComparison } from "@/lib/comparisons/data";
import { TOOLS } from "@/lib/tools/registry";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `https://toolmonk.net/compare/${slug}` },
    openGraph: {
      title: c.title,
      description: c.description,
      url: `https://toolmonk.net/compare/${slug}`,
      type: "article",
      publishedTime: c.publishedAt,
    },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) notFound();

  const relatedTools = c.relatedToolSlugs
    .map((s) => TOOLS.find((t) => t.slug === s))
    .filter(Boolean);

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
              <li>
                <Link href="/compare" className="hover:text-foreground transition-colors">
                  compare
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground truncate max-w-[200px]">{c.slug}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        {/* Header */}
        <header className="pb-8 border-b border-border mb-10">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-3">
            — comparison
          </p>
          <h1 className="text-2xl md:text-3xl font-mono text-foreground leading-tight mb-4">
            {c.title}
          </h1>
          <p className="text-sm text-foreground-muted leading-relaxed max-w-2xl">
            {c.description}
          </p>
        </header>

        {/* VS cards */}
        <section aria-label="Side-by-side comparison" className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Option A */}
            <div className="border border-border p-6">
              <h2 className="font-mono text-lg text-foreground mb-3 pb-3 border-b border-border">
                {c.optionA.name}
              </h2>
              <p className="text-sm text-foreground-muted leading-relaxed mb-5">
                {c.optionA.summary}
              </p>
              <div className="mb-4">
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-foreground-muted mb-2">
                  Pros
                </p>
                <ul className="space-y-1.5">
                  {c.optionA.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                      <span className="font-mono text-[#4ade80] mt-0.5 shrink-0">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-foreground-muted mb-2">
                  Cons
                </p>
                <ul className="space-y-1.5">
                  {c.optionA.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                      <span className="font-mono text-primary mt-0.5 shrink-0">−</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Option B */}
            <div className="border border-border p-6">
              <h2 className="font-mono text-lg text-foreground mb-3 pb-3 border-b border-border">
                {c.optionB.name}
              </h2>
              <p className="text-sm text-foreground-muted leading-relaxed mb-5">
                {c.optionB.summary}
              </p>
              <div className="mb-4">
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-foreground-muted mb-2">
                  Pros
                </p>
                <ul className="space-y-1.5">
                  {c.optionB.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                      <span className="font-mono text-[#4ade80] mt-0.5 shrink-0">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-foreground-muted mb-2">
                  Cons
                </p>
                <ul className="space-y-1.5">
                  {c.optionB.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                      <span className="font-mono text-primary mt-0.5 shrink-0">−</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section aria-label="Comparison table" className="mb-12">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-4">
            — at a glance
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 text-foreground-muted font-normal text-[11px] tracking-[0.1em] uppercase w-1/3">
                    Aspect
                  </th>
                  <th className="text-left py-3 pr-4 text-foreground font-semibold w-1/3">
                    {c.optionA.name}
                  </th>
                  <th className="text-left py-3 text-foreground font-semibold w-1/3">
                    {c.optionB.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.comparisonTable.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 text-foreground-muted text-xs">{row.aspect}</td>
                    <td className="py-3 pr-4 text-foreground text-xs">{row.a}</td>
                    <td className="py-3 text-foreground text-xs">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Verdict */}
        <section aria-label="Verdict" className="mb-12">
          <div className="border border-primary p-6">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary mb-3">
              — verdict
            </p>
            <p className="text-sm text-foreground-muted leading-relaxed">{c.verdict}</p>
          </div>
        </section>

        {/* Related tools */}
        {relatedTools.length > 0 && (
          <section aria-label="Related tools">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-4">
              — related tools
            </p>
            <div className="flex flex-wrap gap-3">
              {relatedTools.map((tool) => (
                <Link
                  key={tool!.slug}
                  href={tool!.path}
                  className="font-mono text-sm border border-border text-foreground-muted px-4 py-2 hover:border-primary hover:text-primary transition-colors"
                >
                  {tool!.title} →
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/compare"
            className="font-mono text-xs text-primary hover:underline"
          >
            ← all comparisons
          </Link>
        </div>
      </div>
    </div>
  );
}
