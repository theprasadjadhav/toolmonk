"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

type Mode = "basic" | "complement" | "combined";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toPrecision(8)).toString();
}

function toPercent(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return fmt(n * 100) + "%";
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

function toFraction(f: number, t: number): string {
  if (t === 0 || !isFinite(f / t)) return "—";
  const g = gcd(f, t);
  return `${f / g} / ${t / g}`;
}

function parseProb(s: string): number | null {
  const raw = s.trim().replace(/%$/, "");
  let p = parseFloat(raw);
  if (isNaN(p)) return null;
  if (p > 1 && p <= 100) p = p / 100;
  if (p < 0 || p > 1) return null;
  return p;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "basic",      label: "Favorable / Total" },
  { value: "complement", label: "Complement" },
  { value: "combined",   label: "A and B" },
];

const labelCls = "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const inputCls = "w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";
const inputErrCls = "border-red-400/60 focus:border-red-400";
const errCls = "font-mono text-[10px] text-red-500/70 mt-1";
const rowLabelCls = "w-28 sm:w-44 shrink-0 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50";
const rowValueCls = "px-4 py-2.5 font-mono text-sm text-foreground flex-1 overflow-auto";

function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

export function ProbabilityCalculator() {
  const [mode, setMode] = useState<Mode>("basic");
  const [favorable, setFavorable] = useState("");
  const [total, setTotal]         = useState("");
  const [pA, setPA]               = useState("");
  const [p1, setP1]               = useState("");
  const [p2, setP2]               = useState("");
  const [copied, setCopied]       = useState<string | null>(null);

  const copy = (key: string, val: string) => {
    if (val === "—") return;
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const reset = (m: Mode) => {
    setMode(m);
    setFavorable(""); setTotal(""); setPA(""); setP1(""); setP2("");
  };

  const basicResult = useMemo(() => {
    const f = parseFloat(favorable), t = parseFloat(total);
    if (isNaN(f) || isNaN(t) || t === 0 || f < 0 || t < 0 || f > t) return null;
    const p = f / t;
    return { decimal: fmt(p), percent: toPercent(p), fraction: toFraction(f, t), formula: `${f} ÷ ${t} = ${fmt(p)}` };
  }, [favorable, total]);

  const complementResult = useMemo(() => {
    const p = parseProb(pA);
    if (p === null) return null;
    const comp = 1 - p;
    return { pA: fmt(p), pAPercent: toPercent(p), pNotA: fmt(comp), pNotAPercent: toPercent(comp), formula: `1 − ${fmt(p)} = ${fmt(comp)}` };
  }, [pA]);

  const combinedResult = useMemo(() => {
    const a = parseProb(p1), b = parseProb(p2);
    if (a === null || b === null) return null;
    const product = a * b;
    return { pA: fmt(a), pAPercent: toPercent(a), pB: fmt(b), pBPercent: toPercent(b), product: fmt(product), percent: toPercent(product), formula: `${fmt(a)} × ${fmt(b)} = ${fmt(product)}` };
  }, [p1, p2]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {MODES.map((m) => (
          <button key={m.value} onClick={() => reset(m.value)}
            className={cn("flex-1 font-mono text-[11px] px-3 py-2 border transition-colors",
              mode === m.value ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
            {m.label}
          </button>
        ))}
      </div>

      {mode === "basic" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            {(() => {
              const f = parseFloat(favorable), t = parseFloat(total);
              const favErr = fe(favorable, [[f < 0, "Cannot be negative"], [f > 10_000_000, "Max 10,000,000"], [total !== "" && !isNaN(t) && f > t, "Cannot exceed total outcomes"]]);
              const totErr = fe(total, [[parseFloat(total) <= 0, "Must be > 0"], [parseFloat(total) > 10_000_000, "Max 10,000,000"]]);
              return (
                <>
                  <div>
                    <label className={labelCls}>— favorable outcomes</label>
                    <input autoFocus type="number" min="0" value={favorable} onChange={(e) => setFavorable(e.target.value)} placeholder="3" className={cn(inputCls, favErr && inputErrCls)} />
                    {favErr && <p className={errCls}>{favErr}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>— total outcomes</label>
                    <input type="number" min="1" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="10" className={cn(inputCls, totErr && inputErrCls)} />
                    {totErr && <p className={errCls}>{totErr}</p>}
                  </div>
                </>
              );
            })()}
          </div>
          <div className="border border-border divide-y divide-border">
            {([
              { key: "decimal",  label: "Probability", val: basicResult?.decimal  ?? "—" },
              { key: "percent",  label: "Percentage",  val: basicResult?.percent  ?? "—" },
              { key: "fraction", label: "Fraction",    val: basicResult?.fraction ?? "—" },
            ] as const).map(({ key, label, val }) => (
              <div key={key} className="flex items-center bg-surface">
                <span className={rowLabelCls}>{label}</span>
                <span className={cn(rowValueCls, !basicResult && "text-foreground-muted/25")}>{val}</span>
                <button onClick={() => copy(key, val)} disabled={!basicResult}
                  className={cn("font-mono text-[10px] px-3 py-1.5 border mx-2 border-border shrink-0", copied === key ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20")}>
                  {copied === key ? "copied!" : "copy"}</button>
              </div>
            ))}
          </div>
          {basicResult && <p className="font-mono text-[11px] text-foreground-muted/40">{basicResult.formula}</p>}
        </>
      )}

      {mode === "complement" && (
        <>
          <div><label className={labelCls}>— P(A): probability the event happens (0–1 or 0–100%)</label>
            <input autoFocus type="text" value={pA} onChange={(e) => setPA(e.target.value)} placeholder="0.3  or  30%" className={inputCls} /></div>
          <div className="border border-border divide-y divide-border">
            {([
              { key: "pa",    label: "P(A) — happens",      val: complementResult ? `${complementResult.pA} (${complementResult.pAPercent})` : "—" },
              { key: "pnota", label: "P(not A) — does not", val: complementResult ? `${complementResult.pNotA} (${complementResult.pNotAPercent})` : "—" },
            ] as const).map(({ key, label, val }) => (
              <div key={key} className="flex items-center bg-surface">
                <span className={rowLabelCls}>{label}</span>
                <span className={cn(rowValueCls, !complementResult && "text-foreground-muted/25")}>{val}</span>
                <button onClick={() => copy(key, val)} disabled={!complementResult}
                  className={cn("font-mono text-[10px] px-3 py-1.5 border mx-2 border-border shrink-0", copied === key ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20")}>
                  {copied === key ? "copied!" : "copy"}</button>
              </div>
            ))}
          </div>
          {complementResult && <p className="font-mono text-[11px] text-foreground-muted/40">{complementResult.formula}</p>}
        </>
      )}

      {mode === "combined" && (
        <>
          <p className="font-mono text-[11px] text-foreground-muted/50">P(A and B) = P(A) × P(B) — valid for independent events only</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>— P(A)</label>
              <input autoFocus type="text" value={p1} onChange={(e) => setP1(e.target.value)} placeholder="0.5  or  50%" className={inputCls} /></div>
            <div><label className={labelCls}>— P(B)</label>
              <input type="text" value={p2} onChange={(e) => setP2(e.target.value)} placeholder="0.4  or  40%" className={inputCls} /></div>
          </div>
          <div className="border border-border divide-y divide-border">
            {([
              { key: "pa",  label: "P(A)",       val: combinedResult ? `${combinedResult.pA} (${combinedResult.pAPercent})` : "—" },
              { key: "pb",  label: "P(B)",       val: combinedResult ? `${combinedResult.pB} (${combinedResult.pBPercent})` : "—" },
              { key: "pab", label: "P(A and B)", val: combinedResult ? `${combinedResult.product} (${combinedResult.percent})` : "—" },
            ] as const).map(({ key, label, val }) => (
              <div key={key} className="flex items-center bg-surface">
                <span className={rowLabelCls}>{label}</span>
                <span className={cn(rowValueCls, !combinedResult && "text-foreground-muted/25")}>{val}</span>
                <button onClick={() => copy(key, val)} disabled={!combinedResult}
                  className={cn("font-mono text-[10px] px-3 py-1.5 border mx-2 border-border shrink-0", copied === key ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20")}>
                  {copied === key ? "copied!" : "copy"}</button>
              </div>
            ))}
          </div>
          {combinedResult && <p className="font-mono text-[11px] text-foreground-muted/40">{combinedResult.formula}</p>}
        </>
      )}
    </div>
  );
}
