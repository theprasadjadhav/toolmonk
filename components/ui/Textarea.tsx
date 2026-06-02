import { cn } from "@/lib/utils/cn";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="font-mono text-[11px] tracking-wider uppercase text-foreground-muted"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full px-3 py-2.5 text-sm bg-surface-muted border border-border text-foreground placeholder-foreground-muted resize-y min-h-32",
          "transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
          error && "border-status-err-border",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${textareaId}-error`
            : helperText
            ? `${textareaId}-helper`
            : undefined
        }
        {...props}
      />
      {error && (
        <p
          id={`${textareaId}-error`}
          className="font-mono text-[11px] text-status-err-text"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${textareaId}-helper`}
          className="font-mono text-[11px] text-foreground-muted"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
