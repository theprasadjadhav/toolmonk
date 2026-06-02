"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

const inputCls =
  "w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";
const inputErrCls = "border-red-400/60 focus:border-red-400";
const errCls = "font-mono text-[10px] text-red-500/70 mt-1";
const labelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60";

// ── Limits ─────────────────────────────────────────────────────────────────────
const MAX_INT_BASE    = 1_000_000_000_000_000; // 10^15
const MAX_INT_EXP     = 100_000;
const MAX_FLOAT_EXP   = 1_000_000;
const MAX_EXACT_DIGITS = 10_000;
const TRUNCATE_AT      = 2_000;

// ── Helpers ────────────────────────────────────────────────────────────────────

function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

function estimateDigits(base: number, exp: number): number {
  if (base === 0 || exp === 0) return 1;
  const d = exp * Math.log10(Math.abs(base));
  return isFinite(d) ? Math.floor(d) + 1 : Infinity;
}

function bigIntSci(n: bigint, sigFigs = 10): string {
  if (n === 0n) return "0";
  const neg = n < 0n;
  const s = (neg ? -n : n).toString();
  const e = s.length - 1;
  let mantissa = s[0];
  if (s.length > 1) {
    const dec = s.slice(1, sigFigs + 1).replace(/0+$/, "");
    if (dec) mantissa += "." + dec;
  }
  return `${neg ? "-" : ""}${mantissa}e+${e}`;
}

function floatSci(n: number, sigFigs = 10): string {
  if (!isFinite(n)) return n > 0 ? "Infinity" : "-Infinity";
  if (n === 0) return "0";
  return n
    .toExponential(sigFigs - 1)
    .replace(/(\.\d*?)0+(e)/, "$1$2")
    .replace(/\.(e)/, "$1");
}

/**
 * Scientific notation via log arithmetic — never overflows to Infinity.
 * Used when estimated digit count exceeds float range.
 */
function logBasedSci(base: number, exp: number, sigFigs = 6): string {
  if (base === 0) return "0";
  const log10abs = exp * Math.log10(Math.abs(base));
  const e = Math.floor(log10abs);
  const m = Math.pow(10, log10abs - e); // 1 ≤ m < 10
  const neg = base < 0 && Number.isInteger(exp) && exp % 2 === 1;
  return `${neg ? "-" : ""}${parseFloat(m.toPrecision(sigFigs))}e+${e}`;
}

function fmtNum(n: number): string {
  if (!isFinite(n)) return n > 0 ? "∞" : "-∞";
  if (isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-6))
    return n.toExponential(6).replace(/\.?0+(e)/, "$1");
  return String(parseFloat(n.toPrecision(12)));
}

// ── Computation ────────────────────────────────────────────────────────────────

interface CalcResult {
  /** Value shown prominently in the expression (full number or scientific). */
  headline: string;
  /** Always-present scientific notation string. */
  scientific: string;
  /** Exact full decimal string (possibly truncated), or null when unavailable. */
  full: string | null;
  isTruncated: boolean;
  digitCount: number;
}

function compute(base: number, exp: number): CalcResult {
  const isIntBase = Number.isInteger(base) && Math.abs(base) <= MAX_INT_BASE;
  const isIntExp  = Number.isInteger(exp)  && exp >= 0 && exp <= MAX_INT_EXP;

  if (isIntBase && isIntExp) {
    const est = estimateDigits(base, exp);

    if (est > MAX_EXACT_DIGITS) {
      const sci = logBasedSci(base, exp);
      return { headline: sci, scientific: sci, full: null, isTruncated: false, digitCount: est };
    }

    let bigResult: bigint;
    try {
      bigResult = BigInt(base) ** BigInt(exp);
    } catch {
      const f = Math.pow(base, exp);
      const sci = floatSci(f);
      return { headline: fmtNum(f), scientific: sci, full: null, isTruncated: false, digitCount: 0 };
    }

    const s = bigResult.toString();
    const digitCount = s.replace("-", "").length;
    const sci = bigIntSci(bigResult);
    const isTruncated = digitCount > TRUNCATE_AT;
    const tail = 8;
    const full = isTruncated
      ? s.slice(0, TRUNCATE_AT) +
        `\n… [${(digitCount - TRUNCATE_AT - tail).toLocaleString()} more digits] …\n` +
        s.slice(-tail)
      : s;

    return {
      headline: digitCount <= 20 ? s : sci,
      scientific: sci,
      full,
      isTruncated,
      digitCount,
    };
  }

  // Float path
  const result = Math.pow(base, exp);
  return {
    headline: fmtNum(result),
    scientific: floatSci(result),
    full: null,
    isTruncated: false,
    digitCount: 0,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ExponentCalculator() {
  const [base, setBase] = useState("");
  const [exp,  setExp]  = useState("");
  const [copied, setCopied]         = useState(false);
  const [copiedSci, setCopiedSci]   = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  const nb = base === "" ? NaN : Number(base);
  const ne = exp  === "" ? NaN : Number(exp);

  const bigIntCandidate =
    !isNaN(nb) && !isNaN(ne) &&
    Number.isInteger(nb) && Number.isInteger(ne) && ne >= 0;

  // ── Validation ─────────────────────────────────────────────────────────────
  const baseErr = fe(base, [
    [isNaN(nb), "Enter a valid number"],
    [!isNaN(ne) && nb === 0 && ne < 0,
      "0 cannot be raised to a negative exponent"],
    [!isNaN(ne) && nb < 0 && !Number.isInteger(ne),
      "Negative base with a fractional exponent gives complex numbers"],
    [bigIntCandidate && Math.abs(nb) > MAX_INT_BASE,
      `Base must be between −${MAX_INT_BASE.toLocaleString()} and ${MAX_INT_BASE.toLocaleString()}`],
  ]);

  // For float path: compute max safe exponent based on actual base value
  const maxSafeFloatExp = (!bigIntCandidate && !isNaN(nb) && Math.abs(nb) > 1)
    ? Math.floor(Math.log(Number.MAX_VALUE) / Math.log(Math.abs(nb)))
    : MAX_FLOAT_EXP;
  const minSafeFloatExp = (!bigIntCandidate && !isNaN(nb) && Math.abs(nb) > 0 && Math.abs(nb) < 1)
    ? -Math.floor(Math.log(Number.MAX_VALUE) / Math.log(1 / Math.abs(nb)))
    : -MAX_FLOAT_EXP;

  const expErr = fe(exp, [
    [isNaN(ne), "Enter a valid number"],
    [bigIntCandidate && ne > MAX_INT_EXP,
      `Exponent must be between 0 and ${MAX_INT_EXP.toLocaleString()}`],
    [!bigIntCandidate && ne > maxSafeFloatExp,
      `Exponent must be ≤ ${maxSafeFloatExp.toLocaleString()} for this base`],
    [!bigIntCandidate && ne < minSafeFloatExp,
      `Exponent must be ≥ ${minSafeFloatExp.toLocaleString()} for this base`],
  ]);

  const valid =
    base !== "" && exp !== "" &&
    !isNaN(nb) && !isNaN(ne) &&
    !baseErr && !expErr;

  const calc = useMemo<CalcResult | null>(() => {
    if (!valid) return null;
    return compute(nb, ne);
  }, [valid, nb, ne]);

  const copy = (val: string, set: (v: boolean) => void) => {
    navigator.clipboard.writeText(val).catch(() => {});
    set(true);
    setTimeout(() => set(false), 1500);
  };

  // Show scientific notation row only when headline is NOT already scientific
  const showSciRow = calc && calc.headline !== calc.scientific;

  return (
    <div className="space-y-5">

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelCls}>
            — base (max ±{MAX_INT_BASE.toLocaleString()})
          </label>
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder="2"
            className={cn(inputCls, baseErr && inputErrCls)}
          />
          {baseErr && <p className={errCls}>{baseErr}</p>}
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>
            — exponent (0 – {MAX_INT_EXP.toLocaleString()})
          </label>
          <input
            type="number"
            value={exp}
            onChange={(e) => setExp(e.target.value)}
            placeholder="3"
            step="any"
            className={cn(inputCls, expErr && inputErrCls)}
          />
          {expErr && <p className={errCls}>{expErr}</p>}
        </div>
      </div>

      {valid && calc && (
        <>
          {/* Visual expression */}
          <div className="flex items-start justify-center py-3 gap-1 flex-wrap">
            <span className="font-mono text-4xl text-foreground">{nb}</span>
            <span className="font-mono text-xl text-foreground-muted mt-0.5">
              {ne < 0 ? `(${ne})` : String(ne)}
            </span>
            <span className="font-mono text-3xl text-foreground-muted mx-2">=</span>
            <span className="font-mono text-4xl text-primary break-all leading-snug">
              {calc.headline}
            </span>
            <button
              onClick={() => copy(calc.full ?? calc.headline, setCopied)}
              className={cn(
                "font-mono text-[10px] px-3 py-1.5 self-center border shrink-0 ml-2",
                copied
                  ? "text-primary border-primary/40 bg-primary/10"
                  : "text-foreground-muted/80 border-border hover:text-foreground",
              )}
            >
              {copied ? "copied" : "copy"}
            </button>
          </div>

          {/* Scientific notation — only when headline isn't already scientific */}
          {showSciRow && (
            <div className="flex items-center gap-3 px-4 py-2.5 border border-border bg-surface-muted">
              <span className={labelCls}>Scientific</span>
              <span className="font-mono text-sm text-foreground flex-1 break-all">
                {calc.scientific}
              </span>
              <button
                onClick={() => copy(calc.scientific, setCopiedSci)}
                className={cn(
                  "font-mono text-[10px] px-2 py-1 border shrink-0",
                  copiedSci
                    ? "text-primary border-primary/40"
                    : "text-foreground-muted/60 border-border hover:text-foreground",
                )}
              >
                {copiedSci ? "✓" : "copy"}
              </button>
            </div>
          )}

          {/* Full decimal */}
          {calc.full !== null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label className={labelCls}>
                  — full decimal
                  {calc.isTruncated
                    ? ` (first ${TRUNCATE_AT.toLocaleString()} of ${calc.digitCount.toLocaleString()} digits)`
                    : ` (${calc.digitCount.toLocaleString()} digit${calc.digitCount !== 1 ? "s" : ""})`}
                </label>
                <button
                  onClick={() => copy(calc.full!, setCopiedFull)}
                  className={cn(
                    "font-mono text-[10px] px-2 py-1 border shrink-0",
                    copiedFull
                      ? "text-primary border-primary/40"
                      : "text-foreground-muted/60 border-border hover:text-foreground",
                  )}
                >
                  {copiedFull ? "✓" : "copy"}
                </button>
              </div>
              <div className="border border-border bg-surface p-3 max-h-52 overflow-y-auto overflow-x-auto">
                <pre className="font-mono text-xs text-foreground whitespace-pre-wrap break-all">
                  {calc.full}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
