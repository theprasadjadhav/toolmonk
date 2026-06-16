"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

function fmtMoney(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

const labelCls = "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const inputCls = "w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";
const inputErrCls = "border-red-400/60 focus:border-red-400";
const rowLabelCls = "w-full sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 sm:py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50";
const rowValueCls = "px-4 py-2 sm:py-2.5 font-mono text-sm text-foreground flex-1 overflow-auto";
const errCls = "font-mono text-[10px] text-red-500/70 mt-1";

// Returns first failing message or null
function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

const MAX_AMOUNT = 1_000_000_000;

export function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate]           = useState("");
  const [time, setTime]           = useState("");
  const [copied, setCopied]       = useState(false);

  const p = parseFloat(principal);
  const r = parseFloat(rate);
  const t = parseFloat(time);

  const principalErr = fe(principal, [[p <= 0, "Must be > 0"], [p > MAX_AMOUNT, "Max 1,000,000,000"]]);
  const rateErr      = fe(rate,      [[r <= 0, "Must be > 0"], [r > 100, "Max 100%"]]);
  const timeErr      = fe(time,      [[t <= 0, "Must be > 0"], [t > 100, "Max 100 years"]]);

  const valid = !principalErr && !rateErr && !timeErr &&
    p > 0 && r > 0 && t > 0 && isFinite(p) && isFinite(r) && isFinite(t);
  const interest    = valid ? (p * r * t) / 100 : NaN;
  const totalAmount = valid ? p + interest : NaN;

  const copy = () => {
    if (!isFinite(interest)) return;
    navigator.clipboard.writeText(fmtMoney(interest));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasResult = valid && isFinite(interest);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>— principal (P)</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)}
            placeholder="10,000" min="0.01" max="1000000000"
            className={cn(inputCls, principalErr && inputErrCls)} />
          {principalErr && <p className={errCls}>{principalErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— annual rate (R %) — 0.01 to 100</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
            placeholder="8" min="0.01" max="100" step="0.1"
            className={cn(inputCls, rateErr && inputErrCls)} />
          {rateErr && <p className={errCls}>{rateErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— time (T years) — 0.01 to 100</label>
          <input type="number" value={time} onChange={(e) => setTime(e.target.value)}
            placeholder="3" min="0.01" max="100" step="0.5"
            className={cn(inputCls, timeErr && inputErrCls)} />
          {timeErr && <p className={errCls}>{timeErr}</p>}
        </div>
      </div>

      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border">
          <div className="min-w-0">
            <p className={cn(labelCls, "mb-1")}>Simple Interest</p>
            <p className={cn("font-mono leading-none break-all", hasResult ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20")}>
              {hasResult ? fmtMoney(interest) : "—"}
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
            <span className={rowLabelCls}>Principal (P)</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(p) : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Interest (I)</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(interest) : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Total Amount (A)</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(totalAmount) : "—"}</span>
          </div>
        </div>

        {hasResult && (
          <div className="overflow-x-auto">
            <p className="font-mono text-[11px] text-foreground-muted/50 whitespace-nowrap">
              I = P × R × T / 100 = {fmtMoney(p)} × {r}% × {t} / 100 = {fmtMoney(interest)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
