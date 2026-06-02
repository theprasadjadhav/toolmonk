import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Container({
  size = "xl",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4",
        {
          "max-w-3xl": size === "sm",
          "max-w-4xl": size === "md",
          "max-w-5xl": size === "lg",
          "max-w-7xl": size === "xl",
          "": size === "full",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
