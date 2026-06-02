"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Mode = "what-is" | "is-what" | "change";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  const r = parseFloat(n.toPrecision(10));
  if (Math.abs(r) >= 1e12 || (Math.abs(r) < 1e-7 && r !== 0)) return r.toExponential(4);
  return String(r);
}

function compute(mode: Mode, a: number, b: number) {
  if (mode === "what-is") {
    const val = (a / 100) * b;
    return { value: fmt(val), formula: `${fmt(a)}% × ${fmt(b)} ÷ 100 = ${fmt(val)}` };
  }
  if (mode === "is-what") {
    const val = (a / b) * 100;
    return { value: fmt(val) + "%", formula: `(${fmt(a)} ÷ ${fmt(b)}) × 100 = ${fmt(val)}%` };
  }
  // change
  const pct = ((b - a) / Math.abs(a)) * 100;
  const dir = pct >= 0 ? "increase" : "decrease";
  return {
    value: fmt(Math.abs(pct)) + "% " + dir,
    formula: `((${fmt(b)} − ${fmt(a)}) ÷ ${fmt(Math.abs(a))}) × 100 = ${fmt(Math.abs(pct))}%`,
  };
}

const MODES: { value: Mode; question: string }[] = [
  { value: "what-is", question: "What is X% of a number?" },
  { value: "is-what", question: "X is what % of a number?" },
  { value: "change",  question: "% change between two values" },
];

const inputCls = "font-mono text-base bg-surface border-border focus:border-foreground-muted outline-none px-1 py-0.5 text-foreground text-center w-24 transition-colors";

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("what-is");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [copied, setCopied] = useState(false);

  const na = parseFloat(a);
  const nb = parseFloat(b);

  const bErr =
    b !== "" && nb === 0 && mode === "is-what"
      ? "Cannot divide by zero"
      : b !== "" && nb === 0 && mode === "change"
      ? "Starting value cannot be zero"
      : null;
  const aErr =
    a !== "" && na === 0 && mode === "change"
      ? "Starting value cannot be zero"
      : null;

  const valid = !isNaN(na) && !isNaN(nb) && !bErr && !aErr && nb !== 0 && (mode !== "change" || na !== 0);
  const result = valid ? compute(mode, na, nb) : null;

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = (m: Mode) => { setMode(m); setA(""); setB(""); };

  return (
    <div className="space-y-6">

      {/* Mode selector — card style with the question as the label */}
      <div className="flex  gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => reset(m.value)}
            className={cn(
              "w-full text-center px-4 py-3 border font-mono text-[11px]",
              mode === m.value
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted/20",
            )}
          >
            {m.question}
          </button>
        ))}
      </div>

      {/* Inline equation input */}
      <div className="border border-border bg-surface-muted px-5 py-5">
        {mode === "what-is" && (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-3 font-mono text-lg text-foreground-muted">
            <span>What is</span>
            <input autoFocus type="number" value={a} onChange={(e) => setA(e.target.value)} placeholder="15" className={inputCls} />
            <span>% of</span>
            <input type="number" value={b} onChange={(e) => setB(e.target.value)} placeholder="200" className={inputCls} />
            <span className="text-foreground-muted/40">?</span>
          </div>
        )}

        {mode === "is-what" && (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-3 font-mono text-lg text-foreground-muted">
            <input autoFocus type="number" value={a} onChange={(e) => setA(e.target.value)} placeholder="30" className={inputCls} />
            <span>is what % of</span>
            <input type="number" value={b} onChange={(e) => setB(e.target.value)} placeholder="200" className={inputCls} />
            <span className="text-foreground-muted/40">?</span>
          </div>
        )}

        {mode === "change" && (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-3 font-mono text-lg text-foreground-muted">
            <span>From</span>
            <input autoFocus type="number" value={a} onChange={(e) => setA(e.target.value)} placeholder="100" className={inputCls} />
            <span>to</span>
            <input type="number" value={b} onChange={(e) => setB(e.target.value)} placeholder="150" className={inputCls} />
            <span className="text-foreground-muted/40">— % change?</span>
          </div>
        )}

        {(aErr || bErr) && (
          <p className="font-mono text-[10px] text-red-500/70 mt-2">{aErr ?? bErr}</p>
        )}

        {/* Answer line */}
        <div className="mt-4 pt-4 border-t border-border flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 mb-1">Answer</p>
            <p className={cn(
              "font-mono font-medium leading-none",
              result ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20",
            )}>
              {result?.value ?? "—"}
            </p>
          </div>
          <button
            onClick={copy}
            disabled={!result}
            className={cn(
              "font-mono text-[10px] px-3 py-1.5 border transition-colors shrink-0",
              copied
                ? "text-primary border-primary/40 bg-primary/10"
                : "border-border text-foreground-muted hover:text-foreground disabled:opacity-20",
            )}
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>

        {result && (
          <p className="font-mono text-[11px] text-foreground-muted/50 mt-2">
            {result.formula}
          </p>
        )}
      </div>
    </div>
  );
}
