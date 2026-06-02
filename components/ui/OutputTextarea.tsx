import { cn } from "@/lib/utils/cn";
import { CopyButton } from "@/components/ui/CopyButton";

interface OutputTextareaProps {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  copied: boolean;
  onCopy: () => void;
  /** Extra note rendered below the textarea */
  note?: string;
  className?: string;
  textareaClassName?: string;
}

export function OutputTextarea({
  label,
  value,
  placeholder = "Output will appear here…",
  rows = 6,
  copied,
  onCopy,
  note,
  className,
  textareaClassName,
}: OutputTextareaProps) {
  const textareaCls =
    "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted resize-y";

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <label className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 block">
          {label}
        </label>
        {value && (
          <CopyButton
            copied={copied}
            onClick={onCopy}
            className="py-1"
          />
        )}
      </div>
      <textarea
        readOnly
        value={value}
        placeholder={placeholder}
        rows={rows}
        className={cn(textareaCls, "text-foreground/80 cursor-default", textareaClassName)}
      />
      {note && (
        <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">{note}</p>
      )}
    </div>
  );
}
