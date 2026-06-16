"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

function fmtMoney(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

function fmtNum(n: number, decimals = 2): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toFixed(decimals)).toLocaleString("en-US");
}

const labelCls = "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const inputCls = "w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";
const inputErrCls = "border-red-400/60 focus:border-red-400";
const selectCls = "w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";
const rowLabelCls = "w-full sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 sm:py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50";
const rowValueCls = "px-4 py-2 sm:py-2.5 font-mono text-sm text-foreground flex-1 min-w-0 break-all";
const errCls = "font-mono text-[10px] text-red-500/70 mt-1";

function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

const MAX_AMOUNT = 1_000_000_000;

const FREQUENCIES: { label: string; value: number }[] = [
  { label: "Annually (1×/year)",     value: 1  },
  { label: "Semi-annually (2×/year)", value: 2  },
  { label: "Quarterly (4×/year)",    value: 4  },
  { label: "Monthly (12×/year)",     value: 12 },
];

interface GrowthRow { year: number; amount: number; interest: number }

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate]           = useState("");
  const [time, setTime]           = useState("");
  const [freq, setFreq]           = useState(12);
  const [copied, setCopied]       = useState(false);

  const p = parseFloat(principal);
  const r = parseFloat(rate) / 100;
  const t = parseFloat(time);
  const n = freq;

  const principalErr = fe(principal, [[p <= 0, "Must be > 0"], [p > MAX_AMOUNT, "Max 1,000,000,000"]]);
  const rateErr      = fe(rate,      [[parseFloat(rate) <= 0, "Must be > 0"], [parseFloat(rate) > 100, "Max 100%"]]);
  const timeErr      = fe(time,      [[t <= 0, "Must be > 0"], [t > 100, "Max 100 years"]]);

  const valid = !principalErr && !rateErr && !timeErr &&
    p > 0 && r > 0 && t > 0 && isFinite(p) && isFinite(r) && isFinite(t);
  const finalAmount    = valid ? p * Math.pow(1 + r / n, n * t) : NaN;
  const totalInterest  = isFinite(finalAmount) ? finalAmount - p : NaN;
  const growthMultiplier = isFinite(finalAmount) ? finalAmount / p : NaN;

  const growthTable: GrowthRow[] = [];
  if (valid) {
    const years = Math.min(Math.ceil(t), 10);
    for (let y = 1; y <= years; y++) {
      const amt = p * Math.pow(1 + r / n, n * y);
      growthTable.push({ year: y, amount: amt, interest: amt - p });
    }
  }

  const copy = () => {
    if (!isFinite(finalAmount)) return;
    navigator.clipboard.writeText(fmtMoney(finalAmount));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasResult = valid && isFinite(finalAmount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— principal (P)</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)}
            placeholder="10,000" min="0.01" max="1000000000"
            className={cn(inputCls, principalErr && inputErrCls)} />
          {principalErr && <p className={errCls}>{principalErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— annual rate (%) — 0.01 to 100</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
            placeholder="8" min="0.01" max="100" step="0.1"
            className={cn(inputCls, rateErr && inputErrCls)} />
          {rateErr && <p className={errCls}>{rateErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— time (years) — 0.01 to 100</label>
          <input type="number" value={time} onChange={(e) => setTime(e.target.value)}
            placeholder="5" min="0.01" max="100" step="1"
            className={cn(inputCls, timeErr && inputErrCls)} />
          {timeErr && <p className={errCls}>{timeErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— compounding frequency</label>
          <select value={freq} onChange={(e) => setFreq(parseInt(e.target.value))} className={selectCls}>
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border">
          <div className="min-w-0">
            <p className={cn(labelCls, "mb-1")}>Final Amount</p>
            <p className={cn("font-mono leading-none break-all", hasResult ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20")}>
              {hasResult ? fmtMoney(finalAmount) : "—"}
            </p>
          </div>
          <button onClick={copy} disabled={!hasResult}
            className={cn("font-mono text-[10px] px-3 py-1.5 border transition-colors shrink-0",
              copied ? "text-primary border-primary/40 bg-primary/10" : "border-border text-foreground-muted hover:text-foreground disabled:opacity-20")}>
            {copied ? "copied" : "copy"}
          </button>
        </div>

        <div className="border border-border divide-y divide-border">
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Principal</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(p) : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Total Interest</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(totalInterest) : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Growth Multiplier</span>
            <span className={rowValueCls}>{hasResult ? `${fmtNum(growthMultiplier)}×` : "—"}</span>
          </div>
        </div>

        {hasResult && (
          <div className="overflow-x-auto">
            <p className="font-mono text-[11px] text-foreground-muted/50 whitespace-nowrap">
              A = P(1 + r/n)^(nt) = {fmtMoney(p)}(1 + {fmtNum(r / n, 6)})^{n * t} = {fmtMoney(finalAmount)}
            </p>
          </div>
        )}
      </div>

      {growthTable.length > 0 && (
        <div className="space-y-2">
          <p className={cn(labelCls, "mb-2")}>— year-by-year growth</p>
          <div className="overflow-x-auto">
            <div className="border border-border min-w-[320px]">
              <div className="flex items-center border-b border-border bg-surface-muted">
                <span className="w-16 shrink-0 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">Year</span>
                <span className="flex-1 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">Amount</span>
                <span className="flex-1 px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">Interest Earned</span>
              </div>
              {growthTable.map((row) => (
                <div key={row.year} className="flex items-center border-b border-border last:border-b-0">
                  <span className={cn(rowValueCls, "w-16 shrink-0 border-r border-border font-mono text-[10px] text-foreground-muted/50")}>{row.year}</span>
                  <span className={cn(rowValueCls, "border-r border-border")}>{fmtMoney(row.amount)}</span>
                  <span className={rowValueCls}>{fmtMoney(row.interest)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
