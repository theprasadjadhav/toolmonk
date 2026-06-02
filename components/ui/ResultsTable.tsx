import { cn } from "@/lib/utils/cn";
import { CopyButton } from "@/components/ui/CopyButton";

export interface ResultRow {
  key: string;
  label: string;
  value: string;
  /** Optional sub-label shown below the main label (e.g. format string) */
  subLabel?: string;
}

interface ResultsTableProps {
  rows: ResultRow[];
  copied: string | null;
  onCopy: (key: string, value: string) => void;
  /** Column width for the label cell (default "w-44") */
  labelWidth?: string;
}

export function ResultsTable({ rows, copied, onCopy, labelWidth = "w-44" }: ResultsTableProps) {
  return (
    <div className="border border-border divide-y divide-border">
      {rows.map(({ key, label, subLabel, value }) => (
        <div key={key} className="bg-surface hover:bg-surface-muted transition-colors">
          <div className={cn("flex", subLabel ? "flex-col sm:flex-row sm:items-center" : "items-center")}>
            <div
              className={cn(
                "px-4 shrink-0 border-border",
                subLabel
                  ? "py-2 sm:py-2.5 sm:border-r border-b sm:border-b-0 space-y-0.5 sm:w-52"
                  : `py-2.5 border-r ${labelWidth}`,
              )}
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/80 block">
                {label}
              </span>
              {subLabel && (
                <span className="font-mono text-[9px] text-foreground-muted/40 block">{subLabel}</span>
              )}
            </div>
            <div className="flex items-center flex-1 min-w-0">
              <span className="font-mono text-sm px-4 py-2.5 flex-1 min-w-0 text-foreground/80 break-all">
                {value}
              </span>
              <CopyButton
                copied={copied === key}
                onClick={() => onCopy(key, value)}
                className="mx-2"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
