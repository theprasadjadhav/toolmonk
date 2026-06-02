import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { CategoryMeta, SubcategoryMeta } from "@/lib/tools/types";
import { TOOLS } from "@/lib/tools/registry";
import {
  getCategoryIcon,
  getSubcategoryIcon,
} from "@/components/icons";

interface CategoryCardProps {
  category: CategoryMeta;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const toolCount = TOOLS.filter((t) => t.category === category.slug).length;
  const Icon = getCategoryIcon(category.slug);

  return (
    <Link
      href={category.path}
      className={cn(
        "group flex flex-col gap-3 p-5 bg-surface-muted border border-border",
        "hover:border-primary/30 hover:bg-surface-elevated",
        "transition-all duration-150",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${category.color}18`, color: category.color }}
        >
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Icon size={18} />
        </span>
        <span className="font-mono text-[10px] tracking-wider text-foreground-muted">
          {toolCount}
        </span>
      </div>
      <div>
        <h3 className="text-sm font-mono text-foreground group-hover:text-primary transition-colors leading-snug">
          {category.title}
        </h3>
        <p className="font-mono text-xs text-foreground-muted mt-1 line-clamp-1 leading-relaxed">
          {category.description}
        </p>
      </div>
    </Link>
  );
}

interface SubcategoryCardProps {
  subcategory: SubcategoryMeta;
  className?: string;
}

export function SubcategoryCard({subcategory,className}: SubcategoryCardProps) {
  const toolCount = TOOLS.filter(
    (t) =>
      t.category === subcategory.category && t.subcategory === subcategory.slug
  ).length;
  const Icon = getSubcategoryIcon(subcategory.slug, subcategory.category);

  return (
    <Link
      href={subcategory.path}
      className={cn(
        "group flex items-center gap-3 p-4 bg-surface-muted border border-border",
        "hover:border-primary/30 hover:bg-surface-elevated",
        "transition-all duration-150",
        className
      )}
    >
      <span className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-foreground-muted group-hover:text-primary group-hover:border-primary/30 transition-colors shrink-0">
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-mono text-foreground group-hover:text-primary transition-colors leading-snug">
          {subcategory.title}
        </h3>
        <p className="font-mono text-[10px] tracking-wider text-foreground-muted mt-0.5">
          {toolCount} tools
        </p>
      </div>
    </Link>
  );
}
