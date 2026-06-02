"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

export type PermCombMode = "permutation" | "combination";

const MAX_N = 1000;

function factorialBig(n: number): bigint {
  let result = 1n;
  for (let i = 2; i <= n; i++) result *= BigInt(i);
  return result;
}

function permutationBig(n: number, r: number): bigint {
  // nPr = n! / (n-r)! — compute directly to avoid huge intermediate factorials
  let result = 1n;
  for (let i = n - r + 1; i <= n; i++) result *= BigInt(i);
  return result;
}

function combinationBig(n: number, r: number): bigint {
  // nCr — use smaller r for efficiency
  const k = Math.min(r, n - r);
  let num = 1n, den = 1n;
  for (let i = 0; i < k; i++) {
    num *= BigInt(n - i);
    den *= BigInt(i + 1);
  }
  return num / den;
}

function bigIntToSci(val: bigint, sigFigs = 8): string {
  const s = val.toString();
  if (s.length <= sigFigs) return s;
  const exp = s.length - 1;
  const mantissa = s[0] + "." + s.slice(1, sigFigs + 1);
  return `${parseFloat(mantissa).toPrecision(sigFigs)}e+${exp}`;
}





interface PermCombCalculatorProps {
  mode: PermCombMode;
}

export function PermCombCalculator({ mode }: PermCombCalculatorProps) {
  const [rawN, setRawN] = useState("");
  const [rawR, setRawR] = useState("");
  const [copied, setCopied] = useState<"sci" | "full" | null>(null);

  const symbol   = mode === "permutation" ? "P" : "C";
  const fullName = mode === "permutation" ? "Permutations" : "Combinations";

  const n = parseInt(rawN, 10);
  const r = parseInt(rawR, 10);

  const validationMsg = useMemo(() => {
    if (rawN.trim() === "" || rawR.trim() === "") return null;
    if (isNaN(n) || isNaN(r)) return "Enter valid integers for n and r";
    if (n < 0 || r < 0) return "n and r must be non-negative";
    if (r > n) return "r cannot be greater than n";
    if (n > MAX_N) return `Max n is ${MAX_N}`;
    return null;
  }, [n, r, rawN, rawR]);

  const result = useMemo(() => {
    if (rawN.trim() === "" || rawR.trim() === "") return null;
    if (isNaN(n) || isNaN(r) || r > n || n < 0 || r < 0 || n > MAX_N) return null;

    const value = mode === "permutation" ? permutationBig(n, r) : combinationBig(n, r);
    const full  = value.toString();
    const digits = full.length;
    const sci   = digits > 15 ? bigIntToSci(value) : null;

    let stepLines: string[];
    if (mode === "permutation") {
      if (n <= 20) {
        const fn  = factorialBig(n).toString();
        const fnr = factorialBig(n - r).toString();
        stepLines = [
          `P(n, r) = n! / (n − r)!`,
          `P(${n}, ${r}) = ${n}! / (${n} − ${r})!`,
          `= ${fn} / ${fnr}`,
          `= ${sci ?? full}`,
        ];
      } else {
        stepLines = [
          `P(n, r) = n! / (n − r)!`,
          `P(${n}, ${r}) = ${n} × ${n - 1} × … × ${n - r + 1}`,
          `= ${sci ?? full}`,
        ];
      }
    } else {
      if (n <= 20) {
        const fn  = factorialBig(n).toString();
        const fr  = factorialBig(r).toString();
        const fnr = factorialBig(n - r).toString();
        stepLines = [
          `C(n, r) = n! / (r! × (n − r)!)`,
          `C(${n}, ${r}) = ${n}! / (${r}! × (${n} − ${r})!)`,
          `= ${fn} / (${fr} × ${fnr})`,
          `= ${sci ?? full}`,
        ];
      } else {
        stepLines = [
          `C(n, r) = n! / (r! × (n − r)!)`,
          `C(${n}, ${r}) = ${n}! / (${r}! × ${n - r}!)`,
          `= ${sci ?? full}`,
        ];
      }
    }

    return { value, full, sci, digits, stepLines };
  }, [n, r, rawN, rawR, mode]);



  const copy = (key: "sci" | "full", val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const hasErr = !!validationMsg && rawN.trim() !== "" && rawR.trim() !== "";

  return (
    <div className="space-y-5">

      

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
            — n (total items, max {MAX_N})
          </label>
          <input type="number" value={rawN} onChange={(e) => setRawN(e.target.value)}
            placeholder="n" min={0} max={MAX_N} step={1}
            className={cn(
              "w-full font-mono text-base bg-surface-muted border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted",
              hasErr ? "border-red-400/60 focus:border-red-400" : "border-border",
            )}
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
            — r (items chosen)
          </label>
          <input type="number" value={rawR} onChange={(e) => setRawR(e.target.value)}
            placeholder="r" min={0} step={1}
            className={cn(
              "w-full font-mono text-base bg-surface-muted border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted",
              hasErr ? "border-red-400/60 focus:border-red-400" : "border-border",
            )}
          />
        </div>
      </div>

      {validationMsg && (
        <p className="font-mono text-[10px] text-red-500/70">{validationMsg}</p>
      )}

      {/* Result */}
      <div className="border border-border bg-surface-muted px-5 py-4 space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
          — {fullName} {symbol}({rawN || "n"}, {rawR || "r"})
        </p>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <span className="font-mono text-4xl text-foreground">
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

        {/* Full digits for large results */}
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
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— steps</p>
          <div className="border border-border divide-y divide-border">
            {result.stepLines.map((line, i) => (
              <div key={i} className="font-mono text-sm text-foreground bg-surface px-4 py-2.5 overflow-x-auto whitespace-nowrap">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
