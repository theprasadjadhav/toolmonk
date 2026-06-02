import type { FAQItem } from "@/lib/tools/types";

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  return (
    <section aria-labelledby="faq-heading">
      <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-2">
        — FAQ
      </p>
      <h2
        id="faq-heading"
        className="text-xl font-mono text-foreground mb-6"
      >
        Frequently Asked Questions
      </h2>
      <div className="space-y-px border border-border rounded-xl overflow-hidden">
        {items.map((item, index) => (
          <details
            key={index}
            className="group bg-surface-muted border-b border-border last:border-0"
          >
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm text-foreground list-none select-none hover:text-primary transition-colors">
              <span>{item.question}</span>
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
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          </details>
        ))}
      </div>
    </section>
  );
}
