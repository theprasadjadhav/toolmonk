import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-mono transition-all disabled:opacity-40 disabled:pointer-events-none",
        {
          "bg-primary text-white hover:bg-primary-hover":
            variant === "primary",
          "bg-surface-muted text-foreground border border-border hover:bg-surface-elevated hover:border-primary/30":
            variant === "secondary",
          "border border-border text-foreground hover:border-primary/50 hover:text-primary":
            variant === "outline",
          "text-foreground-muted hover:text-foreground hover:bg-surface-muted":
            variant === "ghost",
        },
        {
          "text-xs px-3 py-1.5 gap-1.5": size === "sm",
          "text-sm px-4 py-2 gap-2": size === "md",
          "text-sm px-6 py-3 gap-2": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
