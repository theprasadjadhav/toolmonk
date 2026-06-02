"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

export type GcdLcmMode = "gcd" | "lcm";

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

interface GcdLcmCalculatorProps {
  mode: GcdLcmMode;
}

export function GcdLcmCalculator({ mode }: GcdLcmCalculatorProps) {
  const [raw, setRaw] = useState("");
  const [copied, setCopied] = useState(false);

  const numbers = useMemo(() => {
    return raw
      .split(/[\s,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n) && n > 0);
  }, [raw]);

  const result = useMemo(() => {
    if (numbers.length === 0) return null;
    if (numbers.length === 1) return { value: numbers[0] };

    let acc = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      acc = mode === "gcd" ? gcd(acc, numbers[i]) : lcm(acc, numbers[i]);
    }
    return { value: acc };
  }, [numbers, mode]);

  const stepsDisplay = useMemo(() => {
    if (!result || numbers.length <= 1) return null;
    const fn = mode === "gcd" ? "GCD" : "LCM";
    const lines: string[] = [];

    if (numbers.length === 2) {
      lines.push(`${fn}(${numbers[0]}, ${numbers[1]}) = ${result.value}`);
      return lines;
    }

    // 3+ numbers: show reduction chain
    lines.push(
      `${fn}(${numbers.join(", ")}) = ${fn}(${fn}(${numbers[0]}, ${numbers[1]}), ${numbers.slice(2).join(", ")})`,
    );
    let acc = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      const prev = acc;
      const next = numbers[i];
      const val = mode === "gcd" ? gcd(prev, next) : lcm(prev, next);
      lines.push(`${fn}(${prev}, ${next}) = ${val}`);
      acc = val;
    }
    return lines;
  }, [numbers, result, mode]);

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const label = mode === "gcd" ? "GCD" : "LCM";
  const fullLabel = mode === "gcd" ? "Greatest Common Divisor" : "Least Common Multiple";

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
          placeholder="e.g. 12, 18, 24"
          rows={3}
          className="w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted resize-y"
        />
        {raw.trim() !== "" && numbers.length === 0 && (
          <p className="font-mono text-[10px] text-red-500/70 mt-1">No valid positive integers found</p>
        )}
        {numbers.length > 0 && (
          <p className="font-mono text-[10px] text-foreground-muted/40">
            {numbers.length} number{numbers.length !== 1 ? "s" : ""} recognised
          </p>
        )}
      </div>

      {/* Result */}
      <div className="border border-border bg-surface-muted px-5 py-4 space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-2">
          — {fullLabel}
        </p>
        <div className="flex items-center gap-4">
          <span className="font-mono text-4xl text-foreground">
            {result !== null ? result.value : "—"}
          </span>
          <button
            onClick={() => result !== null && copy(String(result.value))}
            disabled={result === null}
            className={cn(
              "font-mono text-[10px] px-3 py-1.5 border ml-auto shrink-0",
              copied
                ? "text-primary border-primary/40 bg-primary/10"
                : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20",
            )}
          >
            {copied ? "copied!" : "copy"}
          </button>
        </div>
        {result !== null && numbers.length === 1 && (
          <p className="font-mono text-[10px] text-foreground-muted/50 mt-1">
            only one number entered — add more to compute {label}
          </p>
        )}
      </div>

      {/* Steps */}
      {stepsDisplay && stepsDisplay.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— steps</p>
          <div className="border border-border divide-y divide-border">
            {stepsDisplay.map((line, i) => (
              <div key={i} className="font-mono text-sm text-foreground bg-surface px-4 py-2.5">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
