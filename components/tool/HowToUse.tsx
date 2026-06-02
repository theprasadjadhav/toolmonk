interface HowToUseProps {
  steps: string[];
  toolTitle: string;
}

export function HowToUse({ steps, toolTitle }: HowToUseProps) {
  return (
    <section aria-labelledby="how-to-use-heading">
      <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-2">
        — Guide
      </p>
      <h2
        id="how-to-use-heading"
        className="text-xl font-mono text-foreground mb-6"
      >
        How to Use the {toolTitle}
      </h2>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4">
            <span
              className="shrink-0 font-mono text-[11px] tracking-wider text-primary pt-0.5 w-6 text-right"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <p
              className="font-mono text-sm text-foreground-muted leading-relaxed border-l border-border pl-4"
              dangerouslySetInnerHTML={{ __html: step }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
