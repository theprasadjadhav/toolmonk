import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CATEGORIES,
  getSubcategoriesByCategory,
  getFlatToolsByCategory,
  getCategoryStaticParams,
} from "@/lib/tools/registry";
import { generateCategoryMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/structured-data";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SubcategoryCard } from "@/components/tool/CategoryCard";
import { ToolCard } from "@/components/tool/ToolCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { adsConfig } from "@/lib/ads/config";
import { getCategoryIcon } from "@/components/icons";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return getCategoryStaticParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  return generateCategoryMetadata(category);
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;

  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const CategoryIcon = getCategoryIcon(categorySlug);

  const subcategories = getSubcategoriesByCategory(
    category.slug as Parameters<typeof getSubcategoriesByCategory>[0]
  );
  const flatTools = getFlatToolsByCategory(
    category.slug as Parameters<typeof getFlatToolsByCategory>[0]
  );

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: category.title, path: category.path },
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
          <Breadcrumbs category={category} />
        </div>
      </div>

      <div className={adsConfig.enabled ? "mx-auto w-full max-w-7xl px-4 py-10" : "mx-auto w-full max-w-5xl px-4 py-10"}>
        <AdSlot placement="top-banner" className="mb-8" />

        <div className={adsConfig.enabled ? "grid grid-cols-1 lg:grid-cols-4 gap-10" : ""}>
          {/* Main content */}
          <main className={adsConfig.enabled ? "lg:col-span-3 space-y-10" : "max-w-5xl mx-auto w-full space-y-10"}>
            {/* Category header */}
            <header className="flex items-start gap-4 pb-8 border-b border-border">
              <span
                className="shrink-0 w-12 h-12 border border-border flex items-center justify-center"
                style={{
                  backgroundColor: `${category.color}12`,
                  color: category.color,
                }}
                aria-hidden="true"
              >
                {/* eslint-disable-next-line react-hooks/static-components */}
                <CategoryIcon size={22} />
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-mono text-foreground leading-tight">
                  {category.title}
                </h1>
                <p className="mt-2 text-sm text-foreground-muted leading-relaxed max-w-xl">
                  {category.description}
                </p>
              </div>
            </header>

            {/* Subcategories */}
            {subcategories.length > 0 && (
              <section>
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-4">
                  — Browse by type
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {subcategories.map((sub) => (
                    <SubcategoryCard key={sub.slug} subcategory={sub} />
                  ))}
                </div>
              </section>
            )}

            {/* Flat tools */}
            {flatTools.length > 0 && (
              <section>
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-4">
                  — {flatTools.length} tools
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {flatTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            )}

            {/* Overview */}
            {category.overview && (
              <section aria-labelledby="category-about-heading">
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-2">
                  — About
                </p>
                <h2
                  id="category-about-heading"
                  className="text-xl font-mono text-foreground mb-6"
                >
                  {category.overview.heading}
                </h2>
                <div
                  className="space-y-4 text-sm text-foreground-muted leading-relaxed [&_strong]:text-foreground [&_code]:font-mono [&_code]:text-primary [&_p]:mb-0"
                  dangerouslySetInnerHTML={{ __html: category.overview.body }}
                />
              </section>
            )}

            {/* Which tool */}
            {category.whichTool && category.whichTool.length > 0 && (
              <section aria-labelledby="tool-finder-heading">
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-2">
                  — Quick Reference
                </p>
                <h2
                  id="tool-finder-heading"
                  className="text-xl font-mono text-foreground mb-6"
                >
                  Which tool should I use?
                </h2>
                <div className="border border-border overflow-hidden">
                  {category.whichTool.map((row, i) => (
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
