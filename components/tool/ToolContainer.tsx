import type { ToolMeta, FAQItem, ToolSectionItem } from "@/lib/tools/types";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AdSlot } from "@/components/ads/AdSlot";
import { adsConfig } from "@/lib/ads/config";
import { HowToUse } from "./HowToUse";
import { FAQ } from "./FAQ";
import { ToolSections } from "./ToolSection";
import { RelatedTools } from "./RelatedTools";
import { buildSoftwareAppSchema, buildHowToSchema, buildFAQSchema } from "@/lib/seo/structured-data";
import { CATEGORIES } from "@/lib/tools/registry";
import { getToolIcon } from "@/components/icons";
import { ToolPanel } from "./ToolPanel";

interface ToolContainerProps {
  tool: ToolMeta;
  children: React.ReactNode;
  howToSteps?: string[];
  faqs?: FAQItem[];
  sections?: ToolSectionItem[];
}

export function ToolContainer({
  tool,
  children,
  howToSteps,
  faqs,
  sections,
}: ToolContainerProps) {
  const schema = buildSoftwareAppSchema(tool);
  const howToSchema = howToSteps && howToSteps.length > 0 ? buildHowToSchema(tool.title, howToSteps) : null;
  const faqSchema = faqs && faqs.length > 0 ? buildFAQSchema(faqs) : null;
  const categoryColor =
    CATEGORIES.find((c) => c.slug === tool.category)?.color ?? "#6366f1";
  const Icon = getToolIcon(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="min-h-screen bg-surface">
        <div className="border-b border-border py-4 px-4">
          <div className={adsConfig.enabled ? "mx-auto w-full max-w-7xl" : "mx-auto w-full max-w-5xl"}>
            <Breadcrumbs tool={tool} />
          </div>
        </div>

        <div className={adsConfig.enabled ? "mx-auto w-full max-w-7xl px-4 py-10" : "mx-auto w-full max-w-5xl px-4 py-10"}>
          <AdSlot placement="top-banner" className="mb-8" />

          <div className={adsConfig.enabled ? "grid grid-cols-1 lg:grid-cols-4 gap-10" : ""}>
            <main className={adsConfig.enabled ? "lg:col-span-3 space-y-10" : "max-w-5xl mx-auto w-full space-y-10"} id="main-content">
              <header className="flex items-start gap-4 pb-8 border-b border-border">
                <span
                  className="w-12 h-12 rounded-xl border border-border flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${categoryColor}12`,
                    color: categoryColor,
                  }}
                >
                  {/* eslint-disable-next-line react-hooks/static-components */}
                  <Icon size={22} />
                </span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-mono text-foreground leading-tight">
                    {tool.title}
                  </h1>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed max-w-xl">
                    {tool.description}
                  </p>
                </div>
              </header>

              <ToolPanel>
                {children}
              </ToolPanel>

              <AdSlot placement="in-content" />

              {howToSteps && howToSteps.length > 0 && (
                <HowToUse steps={howToSteps} toolTitle={tool.title} />
              )}

              {sections && sections.length > 0 && (
                <ToolSections sections={sections} />
              )}

              {faqs && faqs.length > 0 && <FAQ items={faqs} />}

              <RelatedTools slugs={tool.relatedSlugs} />
            </main>

            {adsConfig.enabled && (
              <aside
                className="hidden lg:flex lg:flex-col gap-6"
                aria-label="Sidebar"
              >
                <AdSlot placement="sidebar" />
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
