import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] tracking-wider",
        {
          "bg-surface-elevated text-foreground-muted border border-border":
            variant === "default",
          "bg-primary/10 text-primary border border-primary/20":
            variant === "primary",
          "bg-accent/10 text-accent border border-accent/20":
            variant === "success",
          "bg-status-warn-bg text-status-warn-text border border-status-warn-border":
            variant === "warning",
          "bg-status-err-bg text-status-err-text border border-status-err-border":
            variant === "danger",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
