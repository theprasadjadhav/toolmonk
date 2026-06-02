import Link from "next/link";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/tools/registry";
import type { CategoryMeta, SubcategoryMeta, ToolMeta } from "@/lib/tools/types";
import { buildBreadcrumbSchema } from "@/lib/seo/structured-data";

interface BreadcrumbsProps {
  tool?: ToolMeta;
  subcategory?: SubcategoryMeta;
  category?: CategoryMeta;
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function Breadcrumbs({ tool, subcategory, category }: BreadcrumbsProps) {
  const items: BreadcrumbItem[] = [{ name: "home", path: "/" }];

  if (tool) {
    const cat = CATEGORIES.find((c) => c.slug === tool.category);
    if (cat) items.push({ name: cat.title.toLowerCase(), path: cat.path });

    if (tool.subcategory) {
      const sub = SUBCATEGORIES.find(
        (s) => s.slug === tool.subcategory && s.category === tool.category
      );
      if (sub) items.push({ name: sub.title.toLowerCase(), path: sub.path });
    }
    items.push({ name: tool.title.toLowerCase(), path: tool.path });
  } else if (subcategory) {
    const cat = CATEGORIES.find((c) => c.slug === subcategory.category);
    if (cat) items.push({ name: cat.title.toLowerCase(), path: cat.path });
    items.push({ name: subcategory.title.toLowerCase(), path: subcategory.path });
  } else if (category) {
    items.push({ name: category.title.toLowerCase(), path: category.path });
  }

  const schema = buildBreadcrumbSchema(
    items.map((i) => ({ name: i.name, path: i.path }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] tracking-wider text-foreground-muted">
          {items.map((item, index) => (
            <li key={item.path} className="flex items-center gap-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-border select-none">
                  /
                </span>
              )}
              {index < items.length - 1 ? (
                <Link
                  href={item.path}
                  className="hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className="text-foreground font-medium truncate max-w-[220px]"
                  aria-current="page"
                >
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
