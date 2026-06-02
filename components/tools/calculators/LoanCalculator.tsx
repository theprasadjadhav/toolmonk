"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

function fmtMoney(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n);
}

const rowLabelCls = "w-full sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 sm:py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50";
const rowValueCls = "px-4 py-2 sm:py-2.5 font-mono text-sm text-foreground flex-1 overflow-auto";
function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

const MAX_AMOUNT = 1_000_000_000;

export function LoanCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate]           = useState("");
  const [term, setTerm]           = useState("");
  const [termUnit, setTermUnit]   = useState<"years" | "months">("years");
  const [copied, setCopied]       = useState("");

  const p = parseFloat(principal);
  const r = parseFloat(rate);
  const t = parseFloat(term);

  const maxTermYears  = 50;
  const maxTermMonths = maxTermYears * 12;

  const principalErr = fe(principal, [[p <= 0, "Must be > 0"], [p > MAX_AMOUNT, "Max 1,000,000,000"]]);
  const rateErr      = fe(rate, [[r < 0, "Cannot be negative"], [r > 100, "Max 100%"]]);
  const termErr      = fe(term, [
    [t < 1, termUnit === "years" ? "Min 1 year" : "Min 1 month"],
    [termUnit === "years" && t > maxTermYears, `Max ${maxTermYears} years`],
    [termUnit === "months" && t > maxTermMonths, `Max ${maxTermMonths} months`],
  ]);

  const months      = isNaN(t) || t <= 0 ? 0 : termUnit === "years" ? t * 12 : t;
  const monthlyRate = isNaN(r) || r < 0 ? NaN : r / 12 / 100;

  let monthly = NaN;
  if (!principalErr && !rateErr && !termErr && p > 0 && monthlyRate >= 0 && months > 0) {
    monthly = monthlyRate > 0
      ? (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      : p / months;
  }

  const totalPayment  = isFinite(monthly) ? monthly * months : NaN;
  const totalInterest = isFinite(totalPayment) ? totalPayment - p : NaN;
  const hasResult     = isFinite(monthly) && monthly > 0;

  const copy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— loan amount</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)}
            placeholder="10,000" min="0.01" max="1000000000"
            className={cn(inputBaseCls, principalErr && inputErrCls)} />
          {principalErr && <p className={errCls}>{principalErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— annual interest rate (%) — 0 to 100</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
            placeholder="7.5" min="0" max="100" step="0.1"
            className={cn(inputBaseCls, rateErr && inputErrCls)} />
          {rateErr && <p className={errCls}>{rateErr}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>
            — loan term ({termUnit === "years" ? "1–50 years" : "1–600 months"})
          </label>
          <div className="flex gap-2">
            <input type="number" value={term} onChange={(e) => setTerm(e.target.value)}
              placeholder="5" min="1" max={termUnit === "years" ? "50" : "600"}
              className={cn(inputBaseCls, "flex-1", termErr && inputErrCls)} />
            <div className="flex gap-2 shrink-0">
              {(["years", "months"] as const).map((u) => (
                <button key={u} onClick={() => setTermUnit(u)}
                  className={cn("font-mono text-[11px] px-4 border transition-colors",
                    termUnit === u ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
                  {u}
                </button>
              ))}
            </div>
          </div>
          {termErr && <p className={errCls}>{termErr}</p>}
        </div>
      </div>

      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border">
          <div>
            <p className={cn(labelCls, "mb-1")}>Monthly payment</p>
            <p className={cn("font-mono leading-none", hasResult ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20")}>
              {hasResult ? fmtMoney(monthly) : "—"}
            </p>
          </div>
          <button onClick={() => copy("result", fmtMoney(monthly))} disabled={!hasResult}
            className={cn("font-mono text-[10px] px-3 py-1.5 border shrink-0",
              copied === "result" ? "text-primary border-primary/40 bg-primary/10" : "border-border text-foreground-muted hover:text-foreground disabled:opacity-20")}>
            {copied === "result" ? "copied" : "copy"}
          </button>
        </div>

        <div className="border border-border divide-y divide-border">
          {[
            { label: "Principal",       val: isFinite(p) && p > 0 ? fmtMoney(p) : "—" },
            { label: "Total interest",  val: isFinite(totalInterest) ? fmtMoney(totalInterest) : "—" },
            { label: "Total payment",   val: isFinite(totalPayment) ? fmtMoney(totalPayment) : "—" },
            { label: "Interest share",  val: hasResult ? `${((totalInterest / totalPayment) * 100).toFixed(1)}%` : "—" },
          ].map(({ label, val }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center bg-surface">
              <span className={rowLabelCls}>{label}</span>
              <div className="flex flex-1 justify-between overflow-auto">
                <span className={rowValueCls}>{val}</span>
                <button onClick={() => copy(label, val)} disabled={!hasResult}
                  className={cn("font-mono text-[10px] px-3 m-2 py-1.5 border shrink-0",
                    copied === label ? "text-primary border-primary/40 bg-primary/10" : "border-border text-foreground-muted hover:text-foreground disabled:opacity-20")}>
                  {copied === label ? "copied" : "copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] text-foreground-muted/40 border-t border-border pt-3">
        M = P × r(1+r)^n / [(1+r)^n − 1] · r = annual rate ÷ 12 ÷ 100 · n = months
      </p>
    </div>
  );
}
