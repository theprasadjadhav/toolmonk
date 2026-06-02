"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function primeFactors(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) {
      factors.push(d);
      n = n / d;
    }
    d++;
  }
  if (n > 1) factors.push(n);
  return factors;
}

function getDivisors(n: number): number[] {
  const divs: number[] = [];
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      divs.push(i);
      if (i !== n / i) divs.push(n / i);
    }
  }
  return divs.sort((a, b) => a - b);
}

// Returns ordinal string for the prime index (1-indexed)
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Returns the index of n in the sequence of primes (1-indexed), up to a reasonable limit
function primeIndex(n: number): number {
  let count = 0;
  for (let i = 2; i <= n; i++) {
    if (isPrime(i)) count++;
    if (i === n) return count;
  }
  return count;
}

function formatFactorization(factors: number[]): string {
  if (factors.length === 0) return "";
  // Group consecutive equal factors
  const groups: { base: number; exp: number }[] = [];
  for (const f of factors) {
    if (groups.length > 0 && groups[groups.length - 1].base === f) {
      groups[groups.length - 1].exp++;
    } else {
      groups.push({ base: f, exp: 1 });
    }
  }
  return groups
    .map(({ base, exp }) => (exp === 1 ? String(base) : `${base}^${exp}`))
    .join(" x ");
}

export function PrimeCheckerCalculator() {
  const [raw, setRaw] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const MAX_N = 10_000_000;
  const n = parseInt(raw, 10);
  const inputErr =
    raw.trim() !== "" && (isNaN(n) || !Number.isInteger(parseFloat(raw)) || n <= 0)
      ? "Enter a positive integer"
      : raw.trim() !== "" && n > MAX_N
      ? "Max 10,000,000 (for performance)"
      : null;
  const valid = !isNaN(n) && raw.trim() !== "" && !inputErr;

  const result = useMemo(() => {
    if (!valid) return null;
    if (n <= 0) {
      return { n, prime: false, edge: n === 0 ? "0 is not prime" : "negative numbers are not prime" };
    }
    if (n === 1) {
      return { n, prime: false, edge: "1 is neither prime nor composite" };
    }
    const prime = isPrime(n);
    const factors = primeFactors(n);
    const divisors = getDivisors(n);
    const factorStr = formatFactorization(factors);
    const index = prime ? primeIndex(n) : null;
    return { n, prime, factors, divisors, factorStr, index, edge: null };
  }, [n, valid]);

  const copy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">

      
      {/* Input */}
      <div className="space-y-1.5">
        <label className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— positive integer (max 10,000,000)</label>
        <input
          type="number"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="e.g. 97"
          min="1"
          className={cn("w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted", inputErr && "border-red-400/60 focus:border-red-400")}
        />
        {inputErr && <p className="font-mono text-[10px] text-red-500/70 mt-1">{inputErr}</p>}
      </div>

      {/* Prime badge */}
      {result && (
        <div className="border border-border bg-surface-muted px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-4xl text-foreground">{result.n}</span>
            {result.edge ? (
              <span className="font-mono text-[11px] px-3 py-1 border border-border text-foreground-muted bg-surface">
                {result.edge}
              </span>
            ) : result.prime ? (
              <span className="font-mono text-[11px] px-3 py-1 border border-primary/40 text-primary bg-surface-muted">
                PRIME
              </span>
            ) : (
              <span className="font-mono text-[11px] px-3 py-1 border border-border text-foreground-muted bg-surface">
                COMPOSITE
              </span>
            )}
          </div>
          {result.prime && result.index !== null && (
            <p className="font-mono text-[11px] text-foreground-muted/60">
              {result.n} is the {ordinal(result.index!)} prime number
            </p>
          )}
        </div>
      )}

      {/* Factorization */}
      {result && !result.edge && result.factors && (
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— prime factorization</p>
          <div className="border border-border divide-y divide-border">
            <div className="flex items-center bg-surface">
              <span className="font-mono text-[10px] text-foreground-muted/50 uppercase tracking-wider px-4 py-2.5 w-36 shrink-0 border-r border-border">
                factorization
              </span>
              <span className="font-mono text-base text-foreground px-4 py-2.5 flex-1">
                {result.prime
                  ? `${result.n} is prime`
                  : `${result.n} = ${result.factorStr}`}
              </span>
              <button
                onClick={() =>
                  copy(
                    "factorization",
                    result.prime ? String(result.n) : `${result.n} = ${result.factorStr}`,
                  )
                }
                className={cn(
                  "font-mono text-[10px] px-3 py-1.5 mr-2 border border-border shrink-0",
                  copied === "factorization"
                    ? "text-primary border-primary/40 bg-primary/10"
                    : "text-foreground-muted/80 hover:text-foreground",
                )}
              >
                {copied === "factorization" ? "copied!" : "copy"}
              </button>
            </div>
            {!result.prime && result.factors && (
              <div className="flex items-center bg-surface">
                <span className="font-mono text-[10px] text-foreground-muted/50 uppercase tracking-wider px-4 py-2.5 w-36 shrink-0 border-r border-border">
                  factor list
                </span>
                <span className="font-mono text-sm text-foreground/80 px-4 py-2.5 flex-1">
                  {result.factors.join(", ")}
                </span>
                <button
                onClick={() =>
                  copy(
                    "factor-list",
                    result.prime ? String(result.n) : result.factors.join(", "),
                  )
                }
                className={cn(
                  "font-mono text-[10px] px-3 py-1.5 mr-2 border border-border shrink-0",
                  copied === "factor-list"
                    ? "text-primary border-primary/40 bg-primary/10"
                    : "text-foreground-muted/80 hover:text-foreground",
                )}
              >
                {copied === "factorization" ? "copied!" : "copy"}
              </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divisors */}
      {result && !result.edge && result.divisors && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
              — all divisors ({result.divisors.length})
            </p>
            
          </div>
          <div className="border border-border bg-surface px-4 py-3 flex justify-between">
            <p className="font-mono text-sm self-center text-foreground/80 break-all">
              {result.divisors.join(", ")}
            </p>
            <button
              onClick={() => copy("divisors", result.divisors!.join(", "))}
              className={cn(
                "font-mono text-[10px] ml-6 px-3 py-1.5 border border-border",
                copied === "divisors"
                  ? "text-primary border-primary/40 bg-primary/10"
                  : "text-foreground-muted/80 hover:text-foreground",
              )}
            >
              {copied === "divisors" ? "copied!" : "copy"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
