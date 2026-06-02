import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  muted?: boolean;
}

export function Section({
  muted = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("py-12 md:py-16", muted && "bg-surface-muted", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  description,
  eyebrow,
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      {eyebrow && (
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-3">
          — {eyebrow}
        </p>
      )}
      <h2 className="text-2xl md:text-3xl font-mono text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-2 font-mono text-sm text-foreground-muted">{description}</p>
      )}
    </div>
  );
}
