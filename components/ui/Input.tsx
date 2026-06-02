import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="font-mono text-[11px] tracking-wider uppercase text-foreground-muted"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-3 py-2.5 text-sm bg-surface-muted border border-border text-foreground placeholder-foreground-muted",
          "transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
          error && "border-status-err-border",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${inputId}-error`
            : helperText
            ? `${inputId}-helper`
            : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="font-mono text-[11px] text-status-err-text" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="font-mono text-[11px] text-foreground-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
