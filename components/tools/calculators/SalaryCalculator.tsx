"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { inputBaseCls } from "@/lib/utils/formStyles";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

const labelCls = "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block overflow-auto" ;
const rowLabelCls = "w-full sm:w-52 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 sm:py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50 overflow-auto";
const rowValueCls = "px-4 py-2 sm:py-2.5 font-mono text-sm text-foreground flex-1 overflow-auto";

interface CountryConfig {
  name: string;
  currency: string;
  deductions: (gross: number, filing: string) => { label: string; amount: number }[];
  filingOptions?: string[];
  note: string;
  law: string;
}

const COUNTRIES: Record<string, CountryConfig> = {
  us: {
    name: "United States", currency: "USD",
    filingOptions: ["Single", "Married Filing Jointly"],
    deductions: (gross, filing) => {
      const stdDed  = filing === "Married Filing Jointly" ? 30000 : 15000;
      const taxable = Math.max(0, gross - stdDed);
      // 2025 federal brackets
      const brackets: [number, number, number][] = filing === "Married Filing Jointly"
        ? [
            [0, 23850, 0.10], [23850, 96950, 0.12], [96950, 206700, 0.22],
            [206700, 394600, 0.24], [394600, 501050, 0.32], [501050, 751600, 0.35], [751600, Infinity, 0.37],
          ]
        : [
            [0, 11925, 0.10], [11925, 48475, 0.12], [48475, 103350, 0.22],
            [103350, 197300, 0.24], [197300, 250525, 0.32], [250525, 626350, 0.35], [626350, Infinity, 0.37],
          ];
      let fedTax = 0;
      for (const [from, to, rate] of brackets) {
        if (taxable <= from) break;
        fedTax += (Math.min(taxable, to as number) - from) * (rate as number);
      }
      const ss  = Math.min(gross, 176100) * 0.062;  // 2025 SS wage base
      const med = gross * 0.0145;
      return [
        { label: "Federal income tax", amount: fedTax },
        { label: "Social Security (6.2%, up to $176,100)", amount: ss },
        { label: "Medicare (1.45%)", amount: med },
      ];
    },
    note: "2025 federal rates. Standard deduction $15,000 (Single) / $30,000 (MFJ). SS wage base $176,100. Excludes state tax.",
    law: "IRS Rev. Proc. 2024-61 · TCJA 2017 (2025 inflation adjustment) · Social Security Administration 2025 COLA notice",
  },
  uk: {
    name: "United Kingdom", currency: "GBP",
    deductions: (gross) => {
      const personalAllowance = 12570;
      const taxable = Math.max(0, gross - personalAllowance);
      const incomeTax = taxable <= 0 ? 0
        : taxable <= 37700 ? taxable * 0.20
        : taxable <= 112570 ? 37700 * 0.20 + (taxable - 37700) * 0.40
        : 37700 * 0.20 + 74870 * 0.40 + (taxable - 112570) * 0.45;
      const ni = gross <= 12570 ? 0
        : gross <= 50270 ? (gross - 12570) * 0.08
        : (50270 - 12570) * 0.08 + (gross - 50270) * 0.02;
      return [
        { label: "Income tax", amount: incomeTax },
        { label: "National Insurance — Class 1 employee", amount: ni },
      ];
    },
    note: "2025/26 UK rates. Personal allowance £12,570 (frozen). NI: 8% on £12,570–£50,270; 2% above. Higher rate 40% over £50,270.",
    law: "HMRC 2025–26 · Income Tax Act 2007 · National Insurance Contributions Act 2014 · Autumn Statement 2022 (PA freeze to 2028)",
  },
  in: {
    name: "India", currency: "INR",
    filingOptions: ["New Regime", "Old Regime"],
    deductions: (gross, regime) => {
      const stdDed  = regime === "Old Regime" ? 50000 : 75000;
      const taxable = Math.max(0, gross - stdDed);
      const brackets: [number, number, number][] = regime === "Old Regime"
        ? [[0,250000,0],[250000,500000,0.05],[500000,1000000,0.20],[1000000,Infinity,0.30]]
        : [[0,400000,0],[400000,800000,0.05],[800000,1200000,0.10],[1200000,1600000,0.15],[1600000,2000000,0.20],[2000000,2400000,0.25],[2400000,Infinity,0.30]];
      let tax = 0;
      for (const [from, to, rate] of brackets) {
        if (taxable <= from) break;
        tax += (Math.min(taxable, to as number) - from) * (rate as number);
      }
      const cess = tax * 0.04;
      const pf   = Math.min(gross * 0.12, 21600); // employee PF 12% capped at ~₹21,600/yr
      return [
        { label: "Income tax", amount: tax },
        { label: "Health & Education Cess (4%)", amount: cess },
        { label: "PF — employee contribution (12%, est.)", amount: pf },
      ];
    },
    note: "FY 2025-26 (AY 2026-27). New Regime: 7 slabs, std. deduction ₹75,000. Old Regime: std. deduction ₹50,000. Sec. 87A rebate (≤₹12L, New Regime) & surcharge not applied. PF capped at ₹21,600/yr.",
    law: "Finance Act 2025 (Union Budget 2025-26, 1 Feb 2025) · Income Tax Act 1961 · Employees' Provident Funds Act 1952",
  },
  ca: {
    name: "Canada", currency: "CAD",
    deductions: (gross) => {
      const bpa      = 16129;
      const taxable  = Math.max(0, gross - bpa);
      const brackets: [number, number, number][] = [
        [0,57375,0.15],[57375,114750,0.205],[114750,158519,0.26],[158519,226000,0.29],[226000,Infinity,0.33],
      ];
      let fedTax = 0;
      for (const [from, to, rate] of brackets) {
        if (taxable <= from) break;
        fedTax += (Math.min(taxable, to as number) - from) * (rate as number);
      }
      const cpp = Math.min(Math.max(gross - 3500, 0), 67800) * 0.0595;
      const ei  = Math.min(gross, 65700) * 0.0164;
      return [
        { label: "Federal income tax", amount: fedTax },
        { label: "CPP contribution (5.95%)", amount: cpp },
        { label: "EI premium (1.64%)", amount: ei },
      ];
    },
    note: "2025 Canadian federal rates. BPA $16,129. CPP 5.95% on $3,500–$71,300 YMPE; EI 1.64% up to $65,700. Excludes provincial tax.",
    law: "CRA 2025 · Income Tax Act (R.S.C. 1985, c.1) · Canada Pension Plan Act · Employment Insurance Act",
  },
  au: {
    name: "Australia", currency: "AUD",
    deductions: (gross) => {
      // Stage 3 modified rates, effective 1 July 2024
      const brackets: [number, number, number][] = [
        [0,18200,0],[18200,45000,0.16],[45000,135000,0.30],[135000,190000,0.37],[190000,Infinity,0.45],
      ];
      let tax = 0;
      for (const [from, to, rate] of brackets) {
        if (gross <= from) break;
        tax += (Math.min(gross, to as number) - from) * (rate as number);
      }
      const medicare = gross > 26000 ? gross * 0.02 : 0;
      return [
        { label: "Income tax", amount: tax },
        { label: "Medicare levy (2%)", amount: medicare },
      ];
    },
    note: "FY 2024-25 Australian rates (Stage 3 modified, effective 1 July 2024). Tax-free threshold $18,200. Medicare levy 2% applies above ~$26,000.",
    law: "ATO 2024-25 · Treasury Laws Amendment (Cost of Living Tax Cuts) Act 2024 · A New Tax System (Medicare Levy) Act 1999",
  },
};

export function SalaryCalculator() {
  const [country, setCountry] = useState("us");
  const [ctc, setCtc]         = useState("");
  const [filing, setFiling]   = useState("Single");
  const config = COUNTRIES[country];

  const result = useMemo(() => {
    const gross = parseFloat(ctc);
    if (isNaN(gross) || gross <= 0) return null;
    const deductions = config.deductions(gross, filing);
    const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
    const netAnnual  = gross - totalDeductions;
    const netMonthly = netAnnual / 12;
    return { gross, deductions, totalDeductions, netAnnual, netMonthly };
  }, [ctc, filing, config]);

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

      {/* Gross income */}
      <div className="space-y-1.5">
        <label className={labelCls}>— gross annual salary ({config.currency})</label>
        <input type="number" value={ctc} onChange={(e) => setCtc(e.target.value)}
          placeholder="60,000" min="0" className={inputBaseCls} />
      </div>

      {/* Result */}
      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border overflow-auto">
          <div>
            <p className={cn(labelCls, "mb-1")}>Monthly take-home ({config.currency})</p>
            <p className={cn("font-mono leading-none", result ? "text-4xl text-foreground" : "text-2xl text-foreground-muted/20")}>
              {result ? fmt(result.netMonthly) : "—"}
            </p>
          </div>
          {result && (
            <div className="text-right font-mono text-sm text-foreground-muted/60">
              <p>Annual: {fmt(result.netAnnual)}</p>
            </div>
          )}
        </div>

        <div className="border border-border divide-y divide-border">
          {[
            { label: "Gross salary",    val: result ? fmt(result.gross) : "—" },
            ...(result?.deductions ?? []).map((d) => ({ label: d.label, val: fmt(d.amount) })),
            { label: "Total deductions", val: result ? fmt(result.totalDeductions) : "—" },
            { label: "Net annual",       val: result ? fmt(result.netAnnual) : "—" },
            { label: "Net monthly",      val: result ? fmt(result.netMonthly) : "—" },
          ].map(({ label, val }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center bg-surface">
              <span className={rowLabelCls}>{label}</span>
              <span className={rowValueCls}>{val}</span>
            </div>
          ))}
        </div>
      </div>

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
