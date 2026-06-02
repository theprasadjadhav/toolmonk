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
const rowLabelCls = "w-full sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 sm:py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50";
const rowValueCls = "px-4 py-2 sm:py-2.5 font-mono text-sm text-foreground flex-1 overflow-auto";
const errCls = "font-mono text-[10px] text-red-500/70 mt-1";

function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

const MAX_AMOUNT = 1_000_000_000;

interface GrowthRow { year: number; value: number; gain: number }

export function InvestmentCalculator() {
  const [initial, setInitial] = useState("");
  const [rate, setRate]       = useState("");
  const [years, setYears]     = useState("");
  const [copied, setCopied]   = useState(false);

  const pv = parseFloat(initial);
  const r  = parseFloat(rate) / 100;
  const n  = parseFloat(years);

  const initialErr = fe(initial, [[pv <= 0, "Must be > 0"], [pv > MAX_AMOUNT, "Max 1,000,000,000"]]);
  const rateErr    = fe(rate,    [[parseFloat(rate) <= 0, "Must be > 0"], [parseFloat(rate) > 100, "Max 100%"]]);
  const yearsErr   = fe(years,   [[n < 1, "Min 1 year"], [n > 100, "Max 100 years"]]);

  const valid = !initialErr && !rateErr && !yearsErr &&
    pv > 0 && r > 0 && n > 0 && isFinite(pv) && isFinite(r) && isFinite(n);
  const futureValue = valid ? pv * Math.pow(1 + r, n) : NaN;
  const totalGain   = isFinite(futureValue) ? futureValue - pv : NaN;
  const gainPct     = isFinite(totalGain) ? (totalGain / pv) * 100 : NaN;

  const growthTable: GrowthRow[] = [];
  if (valid) {
    for (let y = 1; y <= Math.min(Math.ceil(n), 30); y++) {
      const val = pv * Math.pow(1 + r, y);
      growthTable.push({ year: y, value: val, gain: val - pv });
    }
  }

  const copy = () => {
    if (!isFinite(futureValue)) return;
    navigator.clipboard.writeText(fmtMoney(futureValue));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasResult = valid && isFinite(futureValue);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>— initial investment</label>
          <input type="number" value={initial} onChange={(e) => setInitial(e.target.value)}
            placeholder="10,000" min="0.01" max="1000000000"
            className={cn(inputCls, initialErr && inputErrCls)} />
          {initialErr && <p className={errCls}>{initialErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— annual return rate (%) — 0.01 to 100</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
            placeholder="10" min="0.01" max="100" step="0.1"
            className={cn(inputCls, rateErr && inputErrCls)} />
          {rateErr && <p className={errCls}>{rateErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— investment period (years) — 1 to 100</label>
          <input type="number" value={years} onChange={(e) => setYears(e.target.value)}
            placeholder="10" min="1" max="100" step="1"
            className={cn(inputCls, yearsErr && inputErrCls)} />
          {yearsErr && <p className={errCls}>{yearsErr}</p>}
        </div>
      </div>

      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border">
          <div>
            <p className={cn(labelCls, "mb-1")}>Future Value</p>
            <p className={cn("font-mono leading-none overflow-auto", hasResult ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20")}>
              {hasResult ? fmtMoney(futureValue) : "—"}
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
            <span className={rowLabelCls}>Initial Investment</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(pv) : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Total Gain</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(totalGain) : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Total Gain %</span>
            <span className={rowValueCls}>{hasResult ? `${fmtNum(gainPct)}%` : "—"}</span>
          </div>
        </div>

        {hasResult && (
          <div className="overflow-x-auto">
            <p className="font-mono text-[11px] text-foreground-muted/50 whitespace-nowrap">
              FV = PV × (1 + r)^n = {fmtMoney(pv)} × (1 + {fmtNum(r, 4)})^{n} = {fmtMoney(futureValue)}
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
                <span className="flex-1 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">Value</span>
                <span className="flex-1 px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">Total Gain</span>
              </div>
              {growthTable.map((row) => (
                <div key={row.year} className="flex items-center border-b border-border last:border-b-0">
                  <span className={cn(rowValueCls, "w-16 shrink-0 border-r border-border font-mono text-[10px] text-foreground-muted/50")}>{row.year}</span>
                  <span className={rowValueCls}>{fmtMoney(row.value)}</span>
                  <span className={rowValueCls}>{fmtMoney(row.gain)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
