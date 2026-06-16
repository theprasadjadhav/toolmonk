"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

function fmtMoney(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

const rowLabelCls = "w-full sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 sm:py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50";
const rowValueCls = "px-4 py-2 sm:py-2.5 font-mono text-sm text-foreground flex-1 min-w-0 break-all";
function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

const MAX_AMOUNT  = 1_000_000_000;
const TERM_PRESETS = [10, 15, 20, 30];

interface AmortRow { year: number; principal: number; interest: number; balance: number }

function buildAmortization(loanAmt: number, monthlyRate: number, months: number, payment: number): AmortRow[] {
  const rows: AmortRow[] = [];
  let balance = loanAmt;
  let yPrincipal = 0, yInterest = 0;
  for (let m = 1; m <= months; m++) {
    const intPaid  = balance * monthlyRate;
    const prinPaid = Math.min(payment - intPaid, balance);
    balance = Math.max(0, balance - prinPaid);
    yPrincipal += prinPaid;
    yInterest  += intPaid;
    if (m % 12 === 0 || m === months) {
      rows.push({ year: Math.ceil(m / 12), principal: yPrincipal, interest: yInterest, balance });
      yPrincipal = 0; yInterest = 0;
    }
  }
  return rows;
}

export function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("");
  const [downPct, setDownPct]     = useState("20");
  const [rate, setRate]           = useState("");
  const [termYears, setTermYears] = useState("30");
  const [copied, setCopied]       = useState(false);
  const [showFull, setShowFull]   = useState(false);

  const price = parseFloat(homePrice);
  const down  = parseFloat(downPct);
  const r     = parseFloat(rate);
  const term  = parseFloat(termYears);

  const priceErr   = fe(homePrice, [[price <= 0, "Must be > 0"], [price > MAX_AMOUNT, "Max 1,000,000,000"]]);
  const downErr    = fe(downPct,   [[down < 0, "Cannot be negative"], [down > 100, "Max 100%"]]);
  const rateErr    = fe(rate,      [[r < 0, "Cannot be negative"], [r > 100, "Max 100%"]]);
  const termErr    = fe(termYears, [[term < 1, "Min 1 year"], [term > 100, "Max 100 years"]]);

  const downAmt = isFinite(price) && isFinite(down) ? price * (down / 100) : NaN;
  const loanAmt = isFinite(price) && isFinite(downAmt) ? price - downAmt : NaN;
  const months  = isFinite(term) && term > 0 ? term * 12 : 0;
  const mRate   = isFinite(r) && r >= 0 ? r / 12 / 100 : NaN;

  let monthly = NaN;
  if (!priceErr && !downErr && !rateErr && !termErr &&
      isFinite(loanAmt) && loanAmt > 0 && isFinite(mRate) && mRate >= 0 && months > 0) {
    monthly = mRate > 0
      ? (loanAmt * mRate * Math.pow(1 + mRate, months)) / (Math.pow(1 + mRate, months) - 1)
      : loanAmt / months;
  }

  const totalPayment  = isFinite(monthly) ? monthly * months : NaN;
  const totalInterest = isFinite(totalPayment) && isFinite(loanAmt) ? totalPayment - loanAmt : NaN;
  const hasResult     = isFinite(monthly) && monthly > 0;

  const amort        = hasResult && isFinite(loanAmt) && isFinite(mRate) ? buildAmortization(loanAmt, mRate, months, monthly) : [];
  const displayAmort = showFull ? amort : amort.slice(0, 5);

  const copy = () => {
    if (!hasResult) return;
    navigator.clipboard.writeText(fmtMoney(monthly));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— home price</label>
          <input type="number" value={homePrice} onChange={(e) => setHomePrice(e.target.value)}
            placeholder="400,000" min="0.01" max="1000000000"
            className={cn(inputBaseCls, priceErr && inputErrCls)} />
          {priceErr && <p className={errCls}>{priceErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— down payment (%) — 0 to 100</label>
          <div className="flex gap-2">
            <input type="number" value={downPct} onChange={(e) => setDownPct(e.target.value)}
              placeholder="20" min="0" max="100" step="1"
              className={cn(inputBaseCls, "flex-1", downErr && inputErrCls)} />
          </div>
          {downErr && <p className={errCls}>{downErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— annual interest rate (%) — 0 to 100</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
            placeholder="6.5" min="0" max="100" step="0.1"
            className={cn(inputBaseCls, rateErr && inputErrCls)} />
          {rateErr && <p className={errCls}>{rateErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— loan term (years) — 1 to 100</label>
          <div className="flex gap-px">
            <input type="number" value={TERM_PRESETS.includes(parseInt(termYears)) ? "" : termYears}
              onChange={(e) => setTermYears(e.target.value)}
              placeholder="5" min="1" max="100"
              className={cn(inputBaseCls, "", termErr && inputErrCls)} />
          </div>
          {termErr && <p className={errCls}>{termErr}</p>}
        </div>
      </div>

      {isFinite(loanAmt) && loanAmt > 0 && !priceErr && !downErr && (
        <p className="font-mono text-[11px] text-foreground-muted/50">
          Loan amount: {fmtMoney(loanAmt)} ({fmtMoney(price)} − {fmtMoney(downAmt)} down)
        </p>
      )}

      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border">
          <div className="min-w-0">
            <p className={cn(labelCls, "mb-1")}>Monthly payment</p>
            <p className={cn("font-mono leading-none break-all", hasResult ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20")}>
              {hasResult ? fmtMoney(monthly) : "—"}
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
            { label: "Loan amount",    val: isFinite(loanAmt) && loanAmt > 0 ? fmtMoney(loanAmt) : "—" },
            { label: "Total interest", val: isFinite(totalInterest) ? fmtMoney(totalInterest) : "—" },
            { label: "Total payment",  val: isFinite(totalPayment) ? fmtMoney(totalPayment) : "—" },
            { label: "Interest share", val: hasResult ? `${((totalInterest / totalPayment) * 100).toFixed(1)}%` : "—" },
          ].map(({ label, val }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center bg-surface">
              <span className={rowLabelCls}>{label}</span>
              <span className={rowValueCls}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {amort.length > 0 && (
        <div className="space-y-1.5">
          <p className={labelCls}>— amortization schedule</p>
          <div className="overflow-x-auto">
            <div className="border border-border min-w-[400px]">
              <div className="flex items-center border-b border-border bg-surface-muted">
                {["Year", "Principal Paid", "Interest Paid", "Remaining Balance"].map((h, i) => (
                  <span key={h} className={cn("font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 px-3 py-2",
                    i === 0 ? "w-14 shrink-0 border-r border-border" : "flex-1 border-r border-border last:border-r-0")}>
                    {h}
                  </span>
                ))}
              </div>
              {displayAmort.map((row) => (
                <div key={row.year} className="flex items-center border-b border-border last:border-b-0 overflow-auto">
                  <span className="font-mono text-[11px] text-foreground-muted/60 px-3 py-2 w-14 shrink-0 border-r border-border overflow-auto">{row.year}</span>
                  <span className="font-mono text-[11px] text-foreground px-3 py-2 flex-1 border-r border-border overflow-auto">{fmtMoney(row.principal)}</span>
                  <span className="font-mono text-[11px] text-foreground px-3 py-2 flex-1 border-r border-border overflow-auto">{fmtMoney(row.interest)}</span>
                  <span className="font-mono text-[11px] text-foreground px-3 py-2 flex-1 overflow-auto">{fmtMoney(row.balance)}</span>
                </div>
              ))}
            </div>
          </div>
          {amort.length > 5 && (
            <button onClick={() => setShowFull((v) => !v)}
              className="font-mono text-[10px] text-foreground-muted hover:text-foreground transition-colors">
              {showFull ? "Show less" : `Show all ${amort.length} years`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
