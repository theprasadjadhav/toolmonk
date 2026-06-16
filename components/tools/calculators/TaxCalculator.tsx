"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls } from "@/lib/utils/formStyles";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

const rowLabelCls = "w-full sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 sm:py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50";
const rowValueCls = "px-4 py-2 sm:py-2.5 font-mono text-sm text-foreground flex-1 min-w-0 break-all";

type Bracket = { from: number; to: number; rate: number };

interface CountryConfig {
  name: string;
  currency: string;
  filingOptions?: string[];
  deduction: (filing: string) => number;
  brackets: (filing: string) => Bracket[];
  extras?: (gross: number, tax: number) => { label: string; amount: number }[];
  note: string;
  law: string;
}

const COUNTRIES: Record<string, CountryConfig> = {
  us: {
    name: "United States", currency: "USD",
    filingOptions: ["Single", "Married Filing Jointly"],
    deduction: (f) => f === "Married Filing Jointly" ? 30000 : 15000,
    brackets: (f) => f === "Married Filing Jointly"
      ? [
          { from: 0,      to: 23850,   rate: 10 },
          { from: 23850,  to: 96950,   rate: 12 },
          { from: 96950,  to: 206700,  rate: 22 },
          { from: 206700, to: 394600,  rate: 24 },
          { from: 394600, to: 501050,  rate: 32 },
          { from: 501050, to: 751600,  rate: 35 },
          { from: 751600, to: Infinity, rate: 37 },
        ]
      : [
          { from: 0,      to: 11925,   rate: 10 },
          { from: 11925,  to: 48475,   rate: 12 },
          { from: 48475,  to: 103350,  rate: 22 },
          { from: 103350, to: 197300,  rate: 24 },
          { from: 197300, to: 250525,  rate: 32 },
          { from: 250525, to: 626350,  rate: 35 },
          { from: 626350, to: Infinity, rate: 37 },
        ],
    note: "2025 federal brackets. Standard deduction $15,000 (Single) / $30,000 (MFJ). Excludes state tax and FICA.",
    law: "IRS Rev. Proc. 2024-61 · Tax Cuts and Jobs Act (TCJA) 2017 as inflation-adjusted for tax year 2025",
  },
  uk: {
    name: "United Kingdom", currency: "GBP",
    deduction: () => 12570,
    brackets: () => [
      { from: 0,      to: 12570,   rate: 0  },
      { from: 12570,  to: 50270,   rate: 20 },
      { from: 50270,  to: 125140,  rate: 40 },
      { from: 125140, to: Infinity, rate: 45 },
    ],
    extras: (gross) => {
      const ni = gross <= 12570 ? 0
        : gross <= 50270 ? (gross - 12570) * 0.08
        : (50270 - 12570) * 0.08 + (gross - 50270) * 0.02;
      return [{ label: "National Insurance — Class 1 employee (est.)", amount: ni }];
    },
    note: "2025/26 UK income tax. Personal allowance £12,570 (frozen to 2028). NI Class 1 employee: 8% up to £50,270, 2% above.",
    law: "HMRC 2025–26 · Income Tax Act 2007 · National Insurance Contributions Act 2014 · Autumn Statement 2022 (PA freeze)",
  },
  in: {
    name: "India", currency: "INR",
    filingOptions: ["New Regime", "Old Regime"],
    deduction: (r) => r === "Old Regime" ? 50000 : 75000,
    brackets: (r) => r === "Old Regime"
      ? [
          { from: 0,       to: 250000,   rate: 0  },
          { from: 250000,  to: 500000,   rate: 5  },
          { from: 500000,  to: 1000000,  rate: 20 },
          { from: 1000000, to: Infinity, rate: 30 },
        ]
      : [
          { from: 0,       to: 400000,   rate: 0  },
          { from: 400000,  to: 800000,   rate: 5  },
          { from: 800000,  to: 1200000,  rate: 10 },
          { from: 1200000, to: 1600000,  rate: 15 },
          { from: 1600000, to: 2000000,  rate: 20 },
          { from: 2000000, to: 2400000,  rate: 25 },
          { from: 2400000, to: Infinity, rate: 30 },
        ],
    extras: (_, tax) => [{ label: "Health & Education Cess (4%)", amount: tax * 0.04 }],
    note: "FY 2025-26 (AY 2026-27). New Regime: 7 slabs, std. deduction ₹75,000. Old Regime: std. deduction ₹50,000. Sec. 87A rebate (up to ₹60,000 for income ≤ ₹12L, New Regime) and surcharge not applied.",
    law: "Finance Act 2025 (Union Budget 2025-26, presented 1 Feb 2025) · Income Tax Act 1961 · CBDT Circular",
  },
  ca: {
    name: "Canada", currency: "CAD",
    deduction: () => 16129,
    brackets: () => [
      { from: 0,      to: 57375,   rate: 15   },
      { from: 57375,  to: 114750,  rate: 20.5 },
      { from: 114750, to: 158519,  rate: 26   },
      { from: 158519, to: 226000,  rate: 29   },
      { from: 226000, to: Infinity, rate: 33  },
    ],
    extras: (gross) => {
      const cpp = Math.min(Math.max(gross - 3500, 0), 67800) * 0.0595;
      const ei  = Math.min(gross, 65700) * 0.0164;
      return [
        { label: "CPP contribution (5.95%, est.)", amount: cpp },
        { label: "EI premium (1.64%, est.)", amount: ei },
      ];
    },
    note: "2025 Canadian federal tax. BPA $16,129. CPP 5.95% on $3,500–$71,300 YMPE; EI 1.64% up to $65,700. Excludes provincial tax.",
    law: "CRA 2025 · Income Tax Act (R.S.C. 1985, c.1) · Canada Pension Plan Act · Employment Insurance Act",
  },
  au: {
    name: "Australia", currency: "AUD",
    deduction: () => 0,
    brackets: () => [
      { from: 0,      to: 18200,   rate: 0  },
      { from: 18200,  to: 45000,   rate: 16 },
      { from: 45000,  to: 135000,  rate: 30 },
      { from: 135000, to: 190000,  rate: 37 },
      { from: 190000, to: Infinity, rate: 45 },
    ],
    extras: (gross) => [{ label: "Medicare levy (2%)", amount: gross > 26000 ? gross * 0.02 : 0 }],
    note: "FY 2024-25 Australian rates (Stage 3 modified, effective 1 July 2024). Tax-free threshold $18,200. Medicare levy 2% applies above ~$26,000.",
    law: "ATO 2024-25 · Treasury Laws Amendment (Cost of Living Tax Cuts) Act 2024 · A New Tax System (Medicare Levy) Act 1999",
  },
};

function calcTax(income: number, brackets: Bracket[]) {
  let tax = 0;
  const rows: { bracket: string; taxable: number; rate: number; tax: number }[] = [];
  for (const b of brackets) {
    if (income <= b.from) break;
    const taxable = Math.min(income, b.to === Infinity ? income : b.to) - b.from;
    const bracketTax = taxable * (b.rate / 100);
    tax += bracketTax;
    if (b.rate > 0) rows.push({ bracket: b.to === Infinity ? `${fmt(b.from)}+` : `${fmt(b.from)}–${fmt(b.to)}`, taxable, rate: b.rate, tax: bracketTax });
  }
  return { tax, rows };
}

export function TaxCalculator() {
  const [country, setCountry] = useState("us");
  const [income, setIncome]   = useState("");
  const [filing, setFiling]   = useState("Single");
  const config = COUNTRIES[country];

  const result = useMemo(() => {
    const gross = parseFloat(income);
    if (isNaN(gross) || gross <= 0) return null;
    const deduction = config.deduction(filing);
    const taxable   = Math.max(0, gross - deduction);
    const { tax, rows } = calcTax(taxable, config.brackets(filing));
    const extras    = config.extras?.(gross, tax) ?? [];
    const totalTax  = tax + extras.reduce((s, e) => s + e.amount, 0);
    const marginalRate = config.brackets(filing).slice().reverse().find((b) => gross > b.from)?.rate ?? 0;
    return { gross, deduction, taxable, incomeTax: tax, extras, totalTax, netIncome: gross - totalTax, effectiveRate: (totalTax / gross) * 100, marginalRate, rows };
  }, [income, filing, config]);

  return (
    <div className="space-y-5">

      {/* Country selector */}
      <div className="space-y-1.5">
        <label className={labelCls}>— country</label>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(COUNTRIES).map(([key, c]) => (
            <button key={key} onClick={() => { setCountry(key); setFiling(c.filingOptions?.[0] ?? "Single"); }}
              className={cn("font-mono text-[11px] px-4 py-2 border",
                country === key ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filing status */}
      {config.filingOptions && (
        <div className="space-y-1.5">
          <label className={labelCls}>— filing status / regime</label>
          <div className="flex gap-2">
            {config.filingOptions.map((opt) => (
              <button key={opt} onClick={() => setFiling(opt)}
                className={cn("flex-1 font-mono text-[11px] px-3 py-2 border",
                  filing === opt ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Income input */}
      <div className="space-y-1.5">
        <label className={labelCls}>— annual income ({config.currency})</label>
        <input type="number" value={income} onChange={(e) => setIncome(e.target.value)}
          placeholder="60,000" min="0" className={inputBaseCls} />
      </div>

      {/* Summary */}
      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border overflow-auto">
          <div>
            <p className={cn(labelCls, "mb-1")}>Income tax ({config.currency})</p>
            <p className={cn("font-mono leading-none", result ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20")}>
              {result ? fmt(result.incomeTax) : "—"}
            </p>
          </div>
          {result && (
            <div className="text-right font-mono text-sm text-foreground-muted/60 space-y-0.5">
              <p>Effective {result.effectiveRate.toFixed(2)}%</p>
              <p>Marginal {result.marginalRate}%</p>
            </div>
          )}
        </div>
        <div className="border border-border divide-y divide-border">
          {[
            { label: "Gross income",   val: result ? fmt(result.gross) : "—" },
            { label: "Deduction",      val: result ? fmt(result.deduction) : "—" },
            { label: "Taxable income", val: result ? fmt(result.taxable) : "—" },
            { label: "Income tax",     val: result ? fmt(result.incomeTax) : "—" },
            ...(result?.extras ?? []).map((e) => ({ label: e.label, val: fmt(e.amount) })),
            { label: "Total tax",      val: result ? fmt(result.totalTax) : "—" },
            { label: "Net income",     val: result ? fmt(result.netIncome) : "—" },
          ].map(({ label, val }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center bg-surface">
              <span className={rowLabelCls}>{label}</span>
              <span className={rowValueCls}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bracket breakdown */}
      {result && result.rows.length > 0 && (
        <div className="space-y-1.5">
          <p className={labelCls}>— bracket breakdown</p>
          <div className="overflow-x-auto">
            <div className="border border-border min-w-[360px]">
              <div className="flex border-b border-border bg-surface-muted">
                {["Range", "Taxable", "Rate", "Tax"].map((h) => (
                  <span key={h} className="flex-1 font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50 px-3 py-2 border-r border-border last:border-r-0">{h}</span>
                ))}
              </div>
              {result.rows.map((r) => (
                <div key={r.bracket} className="flex border-b border-border last:border-b-0 overflow-auto">
                  <span className="flex-1 font-mono text-[11px] text-foreground px-3 py-2 border-r border-border overflow-auto">{r.bracket}</span>
                  <span className="flex-1 font-mono text-[11px] text-foreground px-3 py-2 border-r border-border overflow-auto">{fmt(r.taxable)}</span>
                  <span className="flex-1 font-mono text-[11px] text-foreground px-3 py-2 border-r border-border overflow-auto">{r.rate}%</span>
                  <span className="flex-1 font-mono text-[11px] text-foreground px-3 py-2 overflow-auto">{fmt(r.tax)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes & legal reference */}
      <div className="border-t border-border pt-3 space-y-1">
        <p className="font-mono text-[11px] text-foreground-muted/80">{config.note}</p>
        <p className="font-mono text-[10px] text-foreground-muted/60">Ref: {config.law}</p>
        <p className="font-mono text-[10px] text-foreground-muted/50 italic pt-1">
          <span className="text-primary"># </span> 
          Tax laws change frequently. Results are estimates only — verify with official government sources or a qualified tax professional before filing.
        </p>
      </div>
    </div>
  );
}
