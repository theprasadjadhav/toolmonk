"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

const rowLabelCls = "w-full sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 sm:py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50";
const rowValueCls = "px-4 py-2 sm:py-2.5 font-mono text-sm text-foreground flex-1 overflow-auto";
function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

const MAX_AMOUNT = 1_000_000_000;

export function EmiCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate]           = useState("");
  const [tenure, setTenure]       = useState("");
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");
  const [copied, setCopied]       = useState(false);

  const p = parseFloat(principal);
  const r = parseFloat(rate);
  const t = parseFloat(tenure);

  const principalErr = fe(principal, [[p <= 0, "Must be > 0"], [p > MAX_AMOUNT, "Max 1,000,000,000"]]);
  const rateErr      = fe(rate, [[r < 0, "Cannot be negative"], [r > 100, "Max 100%"]]);
  const tenureErr    = fe(tenure, [
    [t < 1, tenureUnit === "years" ? "Min 1 year" : "Min 1 month"],
    [tenureUnit === "years" && t > 50, "Max 50 years"],
    [tenureUnit === "months" && t > 600, "Max 600 months"],
  ]);

  const months      = isNaN(t) || t <= 0 ? 0 : tenureUnit === "years" ? t * 12 : t;
  const monthlyRate = isNaN(r) || r < 0 ? NaN : r / 12 / 100;

  let emi = NaN;
  if (!principalErr && !rateErr && !tenureErr && p > 0 && monthlyRate >= 0 && months > 0) {
    emi = monthlyRate > 0
      ? (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      : p / months;
  }

  const totalPayable  = isFinite(emi) ? emi * months : NaN;
  const totalInterest = isFinite(totalPayable) ? totalPayable - p : NaN;
  const hasResult     = isFinite(emi) && emi > 0;

  const principalPct = hasResult && isFinite(totalPayable) ? (p / totalPayable) * 100 : 0;
  const interestPct  = 100 - principalPct;

  const copy = () => {
    if (!hasResult) return;
    navigator.clipboard.writeText(fmt(emi));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— loan amount</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)}
            placeholder="5,00,000" min="0.01" max="1000000000"
            className={cn(inputBaseCls, principalErr && inputErrCls)} />
          {principalErr && <p className={errCls}>{principalErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— annual interest rate (%) — 0 to 100</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
            placeholder="8.5" min="0" max="100" step="0.1"
            className={cn(inputBaseCls, rateErr && inputErrCls)} />
          {rateErr && <p className={errCls}>{rateErr}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>
            — loan tenure ({tenureUnit === "years" ? "1–50 years" : "1–600 months"})
          </label>
          <div className="flex gap-2">
            <input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)}
              placeholder="5" min="1" max={tenureUnit === "years" ? "50" : "600"}
              className={cn(inputBaseCls, "flex-1", tenureErr && inputErrCls)} />
            <div className="flex gap-2 shrink-0">
              {(["years", "months"] as const).map((u) => (
                <button key={u} onClick={() => setTenureUnit(u)}
                  className={cn("font-mono text-[11px] px-4 border transition-colors",
                    tenureUnit === u ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
                  {u}
                </button>
              ))}
            </div>
          </div>
          {tenureErr && <p className={errCls}>{tenureErr}</p>}
        </div>
      </div>

      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border">
          <div>
            <p className={cn(labelCls, "mb-1")}>Monthly EMI</p>
            <p className={cn("font-mono leading-none", hasResult ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20")}>
              {hasResult ? fmt(emi) : "—"}
            </p>
          </div>
          <button onClick={copy} disabled={!hasResult}
            className={cn("font-mono text-[10px] px-3 py-1.5 border shrink-0",
              copied ? "text-primary border-primary/40 bg-primary/10" : "border-border text-foreground-muted hover:text-foreground disabled:opacity-20")}>
            {copied ? "copied" : "copy"}
          </button>
        </div>

        <div className="border border-border divide-y divide-border">
          {[
            { label: "Principal",            val: isFinite(p) && p > 0 ? fmt(p) : "—" },
            { label: "Total interest",        val: isFinite(totalInterest) ? fmt(totalInterest) : "—" },
            { label: "Total amount payable",  val: isFinite(totalPayable) ? fmt(totalPayable) : "—" },
          ].map(({ label, val }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center bg-surface">
              <span className={rowLabelCls}>{label}</span>
              <span className={rowValueCls}>{val}</span>
            </div>
          ))}
        </div>

        {hasResult && (
          <div className="space-y-1.5 pt-1">
            <div className="flex h-2 w-full overflow-hidden border border-border">
              <div className="bg-primary/70 h-full transition-all" style={{ width: `${principalPct}%` }} />
              <div className="bg-foreground/20 h-full transition-all" style={{ width: `${interestPct}%` }} />
            </div>
            <div className="flex justify-between font-mono text-[10px] text-foreground-muted/50">
              <span>Principal {principalPct.toFixed(1)}%</span>
              <span>Interest {interestPct.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      <p className="font-mono text-[11px] text-foreground-muted/40 border-t border-border pt-3">
        EMI = P × r(1+r)^n / [(1+r)^n − 1] · r = annual rate ÷ 12 ÷ 100 · n = months
      </p>
    </div>
  );
}
