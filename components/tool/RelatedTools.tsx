import { getRelatedTools } from "@/lib/tools/registry";
import { ToolCard } from "./ToolCard";

interface RelatedToolsProps {
  slugs: string[];
}

export function RelatedTools({ slugs }: RelatedToolsProps) {
  const tools = getRelatedTools(slugs);
  if (tools.length === 0) return null;

  return (
    <section aria-labelledby="related-tools-heading">
      <h2
        id="related-tools-heading"
        className="text-xl font-bold text-foreground mb-4"
      >
        Related Tools
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
