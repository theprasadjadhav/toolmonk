"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

function fmtMoney(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

const rowLabelCls = "w-full sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 sm:py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50";
const rowValueCls = "px-4 py-2 sm:py-2.5 font-mono text-sm text-foreground flex-1 overflow-auto";
function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

interface CorpusRow { year: number; invested: number; corpus: number; returns: number }

export function SipCalculator() {
  const [monthly, setMonthly] = useState("");
  const [rate, setRate]       = useState("");
  const [years, setYears]     = useState("");
  const [copied, setCopied]   = useState(false);

  const pmt        = parseFloat(monthly);
  const annualRate = parseFloat(rate);
  const n          = parseFloat(years);

  const monthlyErr = fe(monthly, [[pmt <= 0, "Must be > 0"], [pmt > 10_000_000, "Max 10,000,000"]]);
  const rateErr    = fe(rate,    [[annualRate <= 0, "Must be > 0"], [annualRate > 100, "Max 100%"]]);
  const yearsErr   = fe(years,   [[n < 1, "Min 1 year"], [n > 50, "Max 50 years"]]);

  const valid = !monthlyErr && !rateErr && !yearsErr &&
    pmt > 0 && annualRate > 0 && n > 0 && isFinite(pmt) && isFinite(annualRate) && isFinite(n);

  const r      = valid ? annualRate / 12 / 100 : 0;
  const months = valid ? n * 12 : 0;

  const futureValue = valid && r > 0
    ? pmt * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
    : valid ? pmt * months : NaN;

  const totalInvested    = valid ? pmt * months : NaN;
  const estimatedReturns = isFinite(futureValue) ? futureValue - totalInvested : NaN;

  const corpusTable: CorpusRow[] = [];
  if (valid) {
    for (let y = 1; y <= Math.min(Math.ceil(n), 30); y++) {
      const m      = y * 12;
      const corpus = r > 0 ? pmt * ((Math.pow(1 + r, m) - 1) / r) * (1 + r) : pmt * m;
      const invested = pmt * m;
      corpusTable.push({ year: y, invested, corpus, returns: corpus - invested });
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
          <label className={labelCls}>— monthly investment</label>
          <input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)}
            placeholder="500" min="0.01" max="10000000"
            className={cn(inputBaseCls, monthlyErr && inputErrCls)} />
          {monthlyErr && <p className={errCls}>{monthlyErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— expected annual return (%) — 0.01 to 100</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
            placeholder="12" min="0.01" max="100" step="0.1"
            className={cn(inputBaseCls, rateErr && inputErrCls)} />
          {rateErr && <p className={errCls}>{rateErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— investment period (years) — 1 to 50</label>
          <input type="number" value={years} onChange={(e) => setYears(e.target.value)}
            placeholder="10" min="1" max="50" step="1"
            className={cn(inputBaseCls, yearsErr && inputErrCls)} />
          {yearsErr && <p className={errCls}>{yearsErr}</p>}
        </div>
      </div>

      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border">
          <div className="min-w-0">
            <p className={cn(labelCls, "mb-1")}>Total Corpus Value</p>
            <p className={cn("font-mono leading-none break-all", hasResult ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20")}>
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
            <span className={rowLabelCls}>Total Invested</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(totalInvested) : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Estimated Returns</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(estimatedReturns) : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Total Value</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(futureValue) : "—"}</span>
          </div>
        </div>
      </div>

      {corpusTable.length > 0 && (
        <div className="space-y-2">
          <p className={cn(labelCls, "mb-2")}>— year-by-year corpus growth</p>
          <div className="overflow-x-auto">
            <div className="border border-border min-w-[400px]">
              <div className="flex items-center border-b border-border bg-surface-muted">
                <span className="w-16 shrink-0 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">Year</span>
                <span className="flex-1 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">Invested</span>
                <span className="flex-1 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">Returns</span>
                <span className="flex-1 px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">Corpus</span>
              </div>
              {corpusTable.map((row) => (
                <div key={row.year} className="flex items-center border-b border-border last:border-b-0">
                  <span className={cn(rowValueCls, "w-16 shrink-0 border-r border-border font-mono text-[10px] text-foreground-muted/50")}>{row.year}</span>
                  <span className={cn(rowValueCls, "border-r border-border")}>{fmtMoney(row.invested)}</span>
                  <span className={cn(rowValueCls, "border-r border-border")}>{fmtMoney(row.returns)}</span>
                  <span className={rowValueCls}>{fmtMoney(row.corpus)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
