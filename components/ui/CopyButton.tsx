import { cn } from "@/lib/utils/cn";

interface CopyButtonProps {
  copied: boolean;
  onClick: () => void;
  className?: string;
  /** "copy" / "copied!" labels, defaults below */
  labelCopy?: string;
  labelCopied?: string;
}

export function CopyButton({
  copied,
  onClick,
  className,
  labelCopy = "copy",
  labelCopied = "copied!",
}: CopyButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-mono text-[10px] px-3 py-1.5 border shrink-0 transition-colors",
        copied
          ? "text-primary border-primary/40 bg-primary/10"
          : "text-foreground-muted/80 hover:text-foreground border-border",
        className,
      )}
    >
      {copied ? labelCopied : labelCopy}
    </button>
  );
}
