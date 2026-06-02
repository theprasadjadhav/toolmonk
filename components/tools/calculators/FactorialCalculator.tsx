"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

const MAX_N = 1000;

function factorialBig(n: number): bigint {
  let result = 1n;
  for (let i = 2; i <= n; i++) result *= BigInt(i);
  return result;
}

function bigIntToSci(val: bigint, sigFigs = 8): string {
  const s = val.toString();
  if (s.length <= sigFigs) return s;
  const exp = s.length - 1;
  const mantissa = s[0] + "." + s.slice(1, sigFigs + 1);
  return `${parseFloat(mantissa).toPrecision(sigFigs)}e+${exp}`;
}

export function FactorialCalculator() {
  const [raw, setRaw] = useState("");
  const [copied, setCopied] = useState<"sci" | "full" | null>(null);

  const n = parseInt(raw, 10);
  const inputErr =
    raw.trim() === "" ? null
    : isNaN(n) || !Number.isInteger(parseFloat(raw)) ? "Must be a whole number"
    : n < 0 ? "Must be ≥ 0"
    : n > MAX_N ? `Max ${MAX_N}`
    : null;

  const valid = raw.trim() !== "" && inputErr === null;

  const result = useMemo(() => {
    if (!valid) return null;
    const value = factorialBig(n);
    const full  = value.toString();
    const digits = full.length;
    const sci   = digits > 15 ? bigIntToSci(value) : null;

    let stepStr: string;
    if (n === 0) {
      stepStr = "0! = 1  (by definition)";
    } else if (n <= 12) {
      const terms = Array.from({ length: n }, (_, i) => n - i).join(" × ");
      stepStr = `${n}! = ${terms} = ${full}`;
    } else {
      stepStr = `${n}! = ${n} × ${n - 1} × … × 2 × 1 = ${sci ?? full}`;
    }

    return { value, full, sci, digits, stepStr };
  }, [n, valid]);

  const copy = (key: "sci" | "full", val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">

      {/* Input */}
      <div className="space-y-1.5">
        <label className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
          — integer n (0 – {MAX_N})
        </label>
        <input
          type="number"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="e.g. 7"
          min={0}
          max={MAX_N}
          step={1}
          className={cn(
            "w-full font-mono text-base bg-surface-muted border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted",
            inputErr ? "border-red-400/60 focus:border-red-400" : "border-border",
          )}
        />
        {inputErr && (
          <p className="font-mono text-[10px] text-red-500/70">{inputErr}</p>
        )}
      </div>

      {/* Result */}
      <div className="border border-border bg-surface-muted px-5 py-4 space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— result</p>

        {/* Primary display: scientific or full if small */}
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <span className="font-mono text-4xl text-foreground ">
            {result !== null ? (result.sci ?? result.full) : "—"}
          </span>
          {result !== null && result.sci && (
            <button onClick={() => copy("sci", result.sci!)}
              className={cn(
                "font-mono text-[10px] px-3 py-1.5 border shrink-0",
                copied === "sci"
                  ? "text-primary border-primary/40 bg-primary/10"
                  : "text-foreground-muted/80 hover:text-foreground border-border",
              )}
            >
              {copied === "sci" ? "copied!" : "copy sci"}
            </button>
          )}
          {result !== null && !result.sci && (
            <button onClick={() => copy("full", result.full)}
              className={cn(
                "font-mono text-[10px] px-3 py-1.5 border shrink-0",
                copied === "full"
                  ? "text-primary border-primary/40 bg-primary/10"
                  : "text-foreground-muted/80 hover:text-foreground border-border",
              )}
            >
              {copied === "full" ? "copied!" : "copy"}
            </button>
          )}
        </div>

        {/* Digit count + full value copy for large numbers */}
        {result !== null && result.sci && (
          <div className="pt-2 border-t border-border space-y-2">
            <p className="font-mono text-[11px] text-foreground-muted/50">
              {result.digits.toLocaleString()} digits
            </p>
            <div className="flex items-start gap-3">
              <p className="font-mono text-[11px] text-foreground-muted/40 break-all flex-1 leading-relaxed max-h-28 overflow-y-auto">
                {result.full}
              </p>
              <button onClick={() => copy("full", result.full)}
                className={cn(
                  "font-mono text-[10px] px-3 py-1.5 border shrink-0",
                  copied === "full"
                    ? "text-primary border-primary/40 bg-primary/10"
                    : "text-foreground-muted/80 hover:text-foreground border-border",
                )}
              >
                {copied === "full" ? "copied!" : "copy full"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      {result && (
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— breakdown</p>
          <div className="border border-border bg-surface px-4 py-3">
            <p className="font-mono text-sm text-foreground/80 break-all">{result.stepStr}</p>
          </div>
        </div>
      )}

    </div>
  );
}
