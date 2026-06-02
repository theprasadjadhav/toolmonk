import type { ToolSectionItem } from "@/lib/tools/types";

interface ToolSectionsProps {
  sections: ToolSectionItem[];
}

export function ToolSections({ sections }: ToolSectionsProps) {
  if (!sections.length) return null;

  return (
    <div className="space-y-px border border-border overflow-hidden">
      {sections.map((section, index) => (
        <details
          key={index}
          className="group bg-surface-muted border-b border-border last:border-0"
        >
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:text-primary transition-colors">
            <h2 className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
              {section.title}
            </h2>
            <svg
              className="w-3.5 h-3.5 text-foreground-muted shrink-0 ml-4 transition-transform duration-200 group-open:rotate-45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </summary>
          <div
            className="px-5 pb-5 pt-1 font-mono text-sm text-foreground-muted leading-relaxed [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-semibold [&_strong]:text-foreground"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </details>
      ))}
    </div>
  );
}
