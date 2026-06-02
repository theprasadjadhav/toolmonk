"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  const r = parseFloat(n.toPrecision(10));
  return String(r);
}

function calcMedian(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calcStdDev(nums: number[], mean: number): number {
  const v = nums.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / nums.length;
  return Math.sqrt(v);
}

function calcMode(nums: number[]): string {
  if (!nums.length) return "—";
  const freq: Record<number, number> = {};
  for (const n of nums) freq[n] = (freq[n] || 0) + 1;
  const maxF = Math.max(...Object.values(freq));
  const modes = Object.keys(freq)
    .filter((k) => freq[+k] === maxF)
    .map(Number)
    .sort((a, b) => a - b);
  return modes.map(fmt).join(", ");
}

export interface StatisticsCalculatorProps {
  /** Key of the stat row to highlight — used by individual stat tool pages */
  highlight: string;
}


export function StatisticsCalculator({ highlight }: StatisticsCalculatorProps) {
  const [raw, setRaw] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const numbers = useMemo(() => {
    return raw
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n));
  }, [raw]);

  const stats = useMemo(() => {
    if (!numbers.length) return null;
    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;
    const sd = calcStdDev(numbers, mean);
    return {
      mean:     fmt(mean),
      median:   fmt(calcMedian(sorted)),
      mode:     calcMode(numbers),
      sum:      fmt(sum),
      count:    numbers.length,
      min:      fmt(sorted[0]),
      max:      fmt(sorted[sorted.length - 1]),
      range:    fmt(sorted[sorted.length - 1] - sorted[0]),
      stdDev:   fmt(sd),
      variance: fmt(sd * sd),
    };
  }, [numbers]);

  const copy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const ALL_ROWS: { key: keyof NonNullable<typeof stats>; label: string }[] = [
    { key: "mean",     label: "Mean (average)" },
    { key: "median",   label: "Median" },
    { key: "mode",     label: "Mode" },
    { key: "sum",      label: "Sum" },
    { key: "count",    label: "Count" },
    { key: "min",      label: "Min" },
    { key: "max",      label: "Max" },
    { key: "range",    label: "Range" },
    { key: "stdDev",   label: "Std deviation" },
    { key: "variance", label: "Variance" },
  ];

  const STAT_ROWS = highlight
    ? [
        ...ALL_ROWS.filter((r) => r.key === highlight),
        ...ALL_ROWS.filter((r) => r.key !== highlight),
      ]
    : ALL_ROWS;

  return (
    <div className="space-y-5">

      {/* Input */}
      <div className="space-y-1.5">
        <label className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
          — numbers (space, comma, or newline separated)
        </label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="e.g. 12, 45, 7, 93, 28 ..."
          rows={4}
          className="w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted resize-y"
        />
        {raw.trim() !== "" && numbers.length === 0 && (
          <p className="font-mono text-[10px] text-red-500/70 mt-1">No valid numbers found</p>
        )}
        {numbers.length > 0 && (
          <p className="font-mono text-[10px] text-foreground-muted/40">
            {numbers.length} number{numbers.length !== 1 ? "s" : ""} recognised
          </p>
        )}
      </div>

      {/* Stats table */}
      <div className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— results</p>
        <div className="border border-border divide-y divide-border">
          {STAT_ROWS.map(({ key, label }) => {
            const val = stats?.[key] ?? "—";
            const isHighlighted = key === highlight;
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center bg-surface",
                )}
              >
                <span className={cn("font-mono text-[10px] text-foreground-muted/80 uppercase tracking-wider px-4 py-2.5 w-28 sm:w-40 shrink-0 border-r border-border", isHighlighted ? "text-primary": "")}>
                  {label}
                </span>
                <span className={cn(
                  "font-mono px-4 py-2.5 flex-1",
                  isHighlighted ? "text-sm text-primary" : "text-sm text-foreground/80",
                  !stats && "text-foreground-muted/25",
                )}>
                  {val}
                </span>
                <button
                  onClick={() => stats && copy(key, String(val))}
                  disabled={!stats}
                  className={cn(
                    "font-mono text-[10px] px-3 py-1.5 border mx-2 border-border shrink-0",
                    copied === key
                      ? "text-primary border-primary/40 bg-primary/10"
                      : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20",
                  )}
                >
                  {copied === key ? "copied!" : "copy"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
