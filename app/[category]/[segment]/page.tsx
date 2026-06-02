import { notFound } from "next/navigation";
import {
  TOOLS,
  SUBCATEGORIES,
  CATEGORIES,
  getSegmentStaticParams,
  getToolsBySubcategory,
} from "@/lib/tools/registry";
import {
  generateToolMetadata,
  generateSubcategoryMetadata,
} from "@/lib/seo/metadata";
import Link from "next/link";
import { buildBreadcrumbSchema } from "@/lib/seo/structured-data";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ToolCard } from "@/components/tool/ToolCard";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { AdSlot } from "@/components/ads/AdSlot";
import { adsConfig } from "@/lib/ads/config";
import { getSubcategoryIcon, getToolIcon } from "@/components/icons";
import type { ToolCategory } from "@/lib/tools/types";

interface PageProps {
  params: Promise<{ category: string; segment: string }>;
}

export async function generateStaticParams() {
  return getSegmentStaticParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { category, segment } = await params;

  const subcategory = SUBCATEGORIES.find(
    (s) => s.slug === segment && s.category === category
  );
  if (subcategory) return generateSubcategoryMetadata(category, segment);

  return generateToolMetadata(segment);
}

export default async function CategorySegmentPage({ params }: PageProps) {
  const { category: categorySlug, segment } = await params;

  // ── Case 1: Subcategory listing ──────────────────────────────────────────────
  const subcategory = SUBCATEGORIES.find(
    (s) => s.slug === segment && s.category === categorySlug
  );

  if (subcategory) {
    const tools = getToolsBySubcategory(categorySlug as ToolCategory, segment);
    const parentCategory = CATEGORIES.find((c) => c.slug === categorySlug);
    const SubcategoryIcon = getSubcategoryIcon(segment, categorySlug);

    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: parentCategory?.title ?? categorySlug, path: `/${categorySlug}` },
      { name: subcategory.title, path: subcategory.path },
    ]);

    return (
      <div className="min-h-screen bg-surface">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        {/* Breadcrumb */}
        <div className="border-b border-border py-4 px-4">
          <div className={adsConfig.enabled ? "mx-auto w-full max-w-7xl" : "mx-auto w-full max-w-5xl"}>
            <Breadcrumbs subcategory={subcategory} />
          </div>
        </div>

        <div className={adsConfig.enabled ? "mx-auto w-full max-w-7xl px-4 py-10" : "mx-auto w-full max-w-5xl px-4 py-10"}>
          <AdSlot placement="top-banner" className="mb-8" />

          <div className={adsConfig.enabled ? "grid grid-cols-1 lg:grid-cols-4 gap-10" : ""}>
            {/* Main content */}
            <main className={adsConfig.enabled ? "lg:col-span-3 space-y-10" : "max-w-5xl mx-auto w-full space-y-10"}>
              {/* Subcategory header */}
              <header className="flex items-start gap-4 pb-8 border-b border-border">
                <span
                  className="shrink-0 w-12 h-12 border border-border flex items-center justify-center"
                  style={{
                    backgroundColor: parentCategory
                      ? `${parentCategory.color}12`
                      : "transparent",
                    color: parentCategory?.color ?? "currentColor",
                  }}
                  aria-hidden="true"
                >
                  {/* eslint-disable-next-line react-hooks/static-components */}
                  <SubcategoryIcon size={22} />
                </span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-mono text-foreground leading-tight">
                    {subcategory.title}
                  </h1>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed max-w-xl">
                    {subcategory.description}
                  </p>
                </div>
              </header>

              {/* Tools grid */}
              <section>
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-4">
                  — {tools.length} tools
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {tools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>

              {/* Overview */}
              {subcategory.overview && (
                <section aria-labelledby="sub-about-heading">
                  <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-2">
                    — About
                  </p>
                  <h2
                    id="sub-about-heading"
                    className="text-xl font-mono text-foreground mb-6"
                  >
                    {subcategory.overview.heading}
                  </h2>
                  <div
                    className="space-y-4 text-sm text-foreground-muted leading-relaxed [&_strong]:text-foreground [&_code]:font-mono [&_code]:text-primary [&_p]:mb-0"
                    dangerouslySetInnerHTML={{ __html: subcategory.overview.body }}
                  />
                </section>
              )}

              {/* Which tool */}
              {subcategory.whichTool && subcategory.whichTool.length > 0 && (
                <section aria-labelledby="sub-tool-finder-heading">
                  <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-2">
                    — Quick Reference
                  </p>
                  <h2
                    id="sub-tool-finder-heading"
                    className="text-xl font-mono text-foreground mb-6"
                  >
                    Which tool should I use?
                  </h2>
                  <div className="border border-border overflow-hidden">
                    {subcategory.whichTool.map((row, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-6 px-4 py-3 border-b border-border last:border-0 hover:bg-surface-muted transition-colors"
                      >
                        <span className="font-mono text-sm text-foreground-muted">
                          {row.task}
                        </span>
                        <Link
                          href={row.toolPath}
                          className="font-mono text-sm text-primary hover:underline shrink-0 whitespace-nowrap"
                        >
                          {row.toolTitle} →
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </main>

            {/* Ad sidebar */}
            {adsConfig.enabled && (
              <aside className="hidden lg:flex lg:flex-col gap-6" aria-label="Sidebar">
                <AdSlot placement="sidebar" />
              </aside>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Case 2: Flat tool page ───────────────────────────────────────────────────
  const tool = TOOLS.find(
    (t) =>
      t.slug === segment &&
      t.category === categorySlug &&
      t.subcategory === undefined
  );

  if (!tool) notFound();

  const defaultSteps = [
    "Enter your data or parameters in the input area above.",
    "Results are calculated automatically as you type.",
    "Copy or download your result as needed.",
  ];

  const defaultFaqs = [
    {
      question: `What is the ${tool.title}?`,
      answer: tool.description,
    },
    {
      question: `Is the ${tool.title} free to use?`,
      answer: `Yes — the ${tool.title} is completely free with no registration or download required.`,
    },
    {
      question: "Is my data secure?",
      answer:
        "All calculations and processing happen directly in your browser. No data is sent to our servers.",
    },
    {
      question: `Can I use the ${tool.title} on mobile?`,
      answer:
        "Yes, ToolMonk is fully responsive and works on smartphones, tablets, and desktop computers.",
    },
  ];

  const FlatToolIcon = getToolIcon(tool);

  return (
    <ToolContainer tool={tool} howToSteps={defaultSteps} faqs={defaultFaqs}>
      <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
        <span className="w-14 h-14 flex items-center justify-center text-foreground-muted" aria-hidden="true">
          {/* eslint-disable-next-line react-hooks/static-components */}
          <FlatToolIcon size={32} />
        </span>
        <p className="font-mono text-lg text-foreground">
          {tool.title}
        </p>
        <p className="text-mono text-sm text-foreground-muted max-w-sm leading-relaxed">
          Tool interface coming soon. Check back or{" "}
          <a
            href="https://github.com"
            className="text-primary hover:underline"
          >
            contribute on GitHub
          </a>
          .
        </p>
      </div>
    </ToolContainer>
  );
}
