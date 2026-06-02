import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { ToolMeta } from "@/lib/tools/types";
import { CATEGORIES } from "@/lib/tools/registry";
import { getToolIcon } from "@/components/icons";

interface ToolCardProps {
  tool: ToolMeta;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const categoryColor =
    CATEGORIES.find((c) => c.slug === tool.category)?.color ?? "#6366f1";
  const Icon = getToolIcon(tool);

  return (
    <Link
      href={tool.path}
      style={{ borderLeftColor: categoryColor }}
      className={cn(
        "group flex items-start gap-3 p-4 bg-surface-muted h-full",
        "border border-border border-l-2",
        "hover:bg-surface-elevated",
        "transition-all duration-150",
        className
      )}
    >
      <span className="w-7 h-7 shrink-0 mt-px flex items-center justify-center text-foreground-muted group-hover:text-primary transition-colors">
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-mono text-foreground group-hover:text-primary transition-colors leading-snug">
          {tool.title}
        </h3>
        <p className="font-mono text-xs text-foreground-muted mt-1 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
