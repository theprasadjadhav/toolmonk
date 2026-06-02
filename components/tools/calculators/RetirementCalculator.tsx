"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

function fmtMoney(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

function fmtNum(n: number, decimals = 2): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toFixed(decimals)).toLocaleString("en-US");
}

const rowLabelCls = "w-full sm:w-52 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 sm:py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50";
const rowValueCls = "px-4 py-2 sm:py-2.5 font-mono text-sm text-foreground flex-1 overflow-auto";
function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

export function RetirementCalculator() {
  const [currentAge, setCurrentAge]       = useState("");
  const [retireAge, setRetireAge]         = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [inflation, setInflation]         = useState("6");
  const [returnRate, setReturnRate]       = useState("10");
  const [copied, setCopied]               = useState(false);

  const ca  = parseFloat(currentAge);
  const ra  = parseFloat(retireAge);
  const me  = parseFloat(monthlyExpenses);
  const inf = parseFloat(inflation) / 100;
  const ret = parseFloat(returnRate) / 100;

  const currentAgeErr    = fe(currentAge,    [[ca < 1, "Min 1"], [ca > 99, "Max 99"]]);
  const retireAgeErr     = fe(retireAge,     [
    [ra < 2, "Min 2"],
    [ra > 100, "Max 100"],
    [currentAge !== "" && !currentAgeErr && ra <= ca, "Must be greater than current age"],
  ]);
  const expensesErr      = fe(monthlyExpenses, [[me <= 0, "Must be > 0"], [me > 10_000_000, "Max 10,000,000"]]);
  const inflationErr     = fe(inflation,     [[parseFloat(inflation) < 0, "Cannot be negative"], [parseFloat(inflation) > 30, "Max 30%"]]);
  const returnRateErr    = fe(returnRate,    [[parseFloat(returnRate) <= 0, "Must be > 0"], [parseFloat(returnRate) > 50, "Max 50%"]]);

  const valid = !currentAgeErr && !retireAgeErr && !expensesErr && !inflationErr && !returnRateErr &&
    ca > 0 && ra > ca && me > 0 && inf >= 0 && ret > 0 &&
    isFinite(ca) && isFinite(ra) && isFinite(me) && isFinite(inf) && isFinite(ret);

  const yearsToRetire        = valid ? ra - ca : NaN;
  const monthlyAtRetirement  = valid ? me * Math.pow(1 + inf, yearsToRetire) : NaN;
  const annualAtRetirement   = isFinite(monthlyAtRetirement) ? monthlyAtRetirement * 12 : NaN;

  const realRate    = ret - inf;
  const corpusNeeded = isFinite(annualAtRetirement)
    ? realRate > 0 ? annualAtRetirement / realRate : annualAtRetirement * 25
    : NaN;

  const monthlyReturnRate = ret / 12;
  const months            = isFinite(yearsToRetire) ? yearsToRetire * 12 : 0;
  const monthlySavingsNeeded =
    valid && isFinite(corpusNeeded) && months > 0 && monthlyReturnRate > 0
      ? (corpusNeeded * monthlyReturnRate) / ((Math.pow(1 + monthlyReturnRate, months) - 1) * (1 + monthlyReturnRate))
      : NaN;

  const copy = () => {
    if (!isFinite(corpusNeeded)) return;
    navigator.clipboard.writeText(fmtMoney(corpusNeeded));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasResult = valid && isFinite(corpusNeeded);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— current age — 1 to 99</label>
          <input type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)}
            placeholder="30" min="1" max="99"
            className={cn(inputBaseCls, currentAgeErr && inputErrCls)} />
          {currentAgeErr && <p className={errCls}>{currentAgeErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— retirement age — 2 to 100</label>
          <input type="number" value={retireAge} onChange={(e) => setRetireAge(e.target.value)}
            placeholder="60" min="2" max="100"
            className={cn(inputBaseCls, retireAgeErr && inputErrCls)} />
          {retireAgeErr && <p className={errCls}>{retireAgeErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— monthly expenses today</label>
          <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)}
            placeholder="3,000" min="0.01" max="10000000"
            className={cn(inputBaseCls, expensesErr && inputErrCls)} />
          {expensesErr && <p className={errCls}>{expensesErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— expected inflation rate (%) — 0 to 30</label>
          <input type="number" value={inflation} onChange={(e) => setInflation(e.target.value)}
            placeholder="6" min="0" max="30" step="0.5"
            className={cn(inputBaseCls, inflationErr && inputErrCls)} />
          {inflationErr && <p className={errCls}>{inflationErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— expected return on investment (%) — 0.01 to 50</label>
          <input type="number" value={returnRate} onChange={(e) => setReturnRate(e.target.value)}
            placeholder="10" min="0.01" max="50" step="0.5"
            className={cn(inputBaseCls, returnRateErr && inputErrCls)} />
          {returnRateErr && <p className={errCls}>{returnRateErr}</p>}
        </div>
      </div>

      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border">
          <div>
            <p className={cn(labelCls, "mb-1")}>Retirement Corpus Needed</p>
            <p className={cn("font-mono leading-none overflow-auto", hasResult ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20")}>
              {hasResult ? fmtMoney(corpusNeeded) : "—"}
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
            <span className={rowLabelCls}>Years to Retirement</span>
            <span className={rowValueCls}>{hasResult ? `${fmtNum(yearsToRetire, 0)} years` : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Monthly Expenses at Retirement</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(monthlyAtRetirement) : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Annual Expenses at Retirement</span>
            <span className={rowValueCls}>{hasResult ? fmtMoney(annualAtRetirement) : "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface">
            <span className={rowLabelCls}>Monthly Savings Needed Now</span>
            <span className={rowValueCls}>{hasResult && isFinite(monthlySavingsNeeded) ? fmtMoney(monthlySavingsNeeded) : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
