"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Op = "+" | "−" | "×" | "÷";

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}

function simplify(n: number, d: number): [number, number] {
  if (d === 0) return [n, 0];
  const g = gcd(Math.abs(n), Math.abs(d));
  const sn = n / g, sd = d / g;
  return sd < 0 ? [-sn, -sd] : [sn, sd];
}

interface Fraction { n: number; d: number }

function operate(a: Fraction, b: Fraction, op: Op): Fraction | null {
  if (a.d === 0 || b.d === 0) return null;
  if (op === "÷" && b.n === 0) return null;
  let rn: number, rd: number;
  switch (op) {
    case "+": rn = a.n * b.d + b.n * a.d; rd = a.d * b.d; break;
    case "−": rn = a.n * b.d - b.n * a.d; rd = a.d * b.d; break;
    case "×": rn = a.n * b.n; rd = a.d * b.d; break;
    case "÷": rn = a.n * b.d; rd = a.d * b.n; break;
  }
  const [sn, sd] = simplify(rn, rd);
  return { n: sn, d: sd };
}

function fmtFrac(n: number, d: number): string {
  if (d === 1) return String(n);
  return `${n}/${d}`;
}

function toDecimal(n: number, d: number): string {
  if (d === 0) return "undefined";
  const v = n / d;
  return String(parseFloat(v.toPrecision(10)));
}

function toPct(n: number, d: number): string {
  if (d === 0) return "undefined";
  return parseFloat(((n / d) * 100).toPrecision(10)) + "%";
}

const OPS: Op[] = ["+", "−", "×", "÷"];

function FracInput({
  n, d, onN, onD, label, denomError,
}: {
  n: string; d: string; onN: (v: string) => void; onD: (v: string) => void; label: string; denomError?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">{label}</p>
      <div className="flex flex-col items-center gap-2 w-28">
        <input type="number" value={n} onChange={(e) => onN(e.target.value)} placeholder="0"
          className="w-full font-mono text-lg text-center bg-surface-muted border border-border px-2 py-1.5 text-foreground outline-none focus:border-foreground-muted" />
        <div className={cn("w-full h-px", denomError ? "bg-red-400/60" : "bg-foreground/30")} />
        <input type="number" value={d} onChange={(e) => onD(e.target.value)} placeholder="1"
          className={cn(
            "w-full font-mono text-lg text-center bg-surface-muted border px-2 py-1.5 outline-none",
            denomError ? "border-red-400/60 text-foreground focus:border-red-400" : "border-border text-foreground focus:border-foreground-muted",
          )} />
        {denomError && (
          <p className="font-mono text-[10px] text-red-500/70 text-center leading-tight">{denomError}</p>
        )}
      </div>
    </div>
  );
}

export function FractionCalculator() {
  const [n1, setN1] = useState(""); const [d1, setD1] = useState("");
  const [n2, setN2] = useState(""); const [d2, setD2] = useState("");
  const [op, setOp] = useState<Op>("+");
  const [copied, setCopied] = useState<string | null>(null);

  const parsedD1 = parseInt(d1);
  const parsedD2 = parseInt(d2);

  const d1Error = d1 !== "" && parsedD1 === 0 ? "cannot be 0" : undefined;
  const d2Error = d2 !== "" && parsedD2 === 0 ? "cannot be 0" : undefined;
  const divError = op === "÷" && n2 !== "" && parseInt(n2) === 0 ? "division by zero" : undefined;

  const a: Fraction = { n: parseInt(n1) || 0, d: parsedD1 };
  const b: Fraction = { n: parseInt(n2) || 0, d: parsedD2 };

  const hasInput = n1 !== "" && d1 !== "" && n2 !== "" && d2 !== "";
  const hasError = !!d1Error || !!d2Error || !!divError;
  const result = hasInput && !hasError ? operate(a, b, op) : null;

  const copy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  // Build step-by-step explanation
  const steps: string[] = [];
  if (result && hasInput) {
    if (op === "+" || op === "−") {
      const rn = op === "+" ? a.n * b.d + b.n * a.d : a.n * b.d - b.n * a.d;
      const rd = a.d * b.d;
      const [sn, sd] = simplify(rn, rd);
      steps.push(`= (${a.n}×${b.d} ${op} ${b.n}×${a.d}) / (${a.d}×${b.d})`);
      steps.push(`= ${rn}/${rd}`);
      if (sn !== rn || sd !== rd) steps.push(`= ${fmtFrac(sn, sd)} (simplified)`);
    } else if (op === "×") {
      steps.push(`= (${a.n}×${b.n}) / (${a.d}×${b.d})`);
      steps.push(`= ${a.n * b.n}/${a.d * b.d}`);
      if (result.n !== a.n * b.n || result.d !== a.d * b.d)
        steps.push(`= ${fmtFrac(result.n, result.d)} (simplified)`);
    } else {
      steps.push(`= (${a.n}×${b.d}) / (${a.d}×${b.n})  [flip and multiply]`);
      steps.push(`= ${a.n * b.d}/${a.d * b.n}`);
      if (result.n !== a.n * b.d || result.d !== a.d * b.n)
        steps.push(`= ${fmtFrac(result.n, result.d)} (simplified)`);
    }
  }

  return (
    <div className="space-y-5">

      {/* Fraction inputs + operator */}
      <div className="flex flex-wrap justify-center items-center gap-4">
        <FracInput n={n1} d={d1} onN={setN1} onD={setD1} label="— fraction 1" denomError={d1Error} />

        {/* Operator */}
        <div className="space-y-1.5 pb-0.5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">operation</p>
          <div className="flex gap-1">
            {OPS.map((o) => (
              <button key={o} onClick={() => setOp(o)}
                className={cn(
                  "font-mono text-base w-9 py-2 border",
                  op === o
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}>
                {o}
              </button>
            ))}
          </div>
        </div>

        <FracInput n={n2} d={d2} onN={setN2} onD={setD2} label="— fraction 2" denomError={d2Error ?? divError} />

        <div className="space-y-1.5 pt-5">
          <span className="font-mono text-lg text-foreground">==</span>
        </div>

        <div className="space-y-1.5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— result</p>
          <div className="flex flex-col items-center gap-2 w-28">
            <span className="w-full font-mono text-lg text-center bg-surface-muted border border-border px-2 py-1.5 text-foreground outline-none focus:border-foreground-muted overflow-auto">
              {result ? result.n : "-"}</span>
            <div className="w-full h-px bg-foreground/30" />
            <span className="w-full font-mono text-lg text-center bg-surface-muted border border-border px-2 py-1.5 text-foreground outline-none focus:border-foreground-muted overflow-auto">
              {result ? result.d : "-"}</span>
          </div>
        </div>


        {result && <button onClick={() => copy("frac", fmtFrac(result.n, result.d))}
          className={cn("font-mono text-[10px] px-3 py-1.5 border mt-5",
            copied === "frac" ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20")}>
          {copied === "frac" ? "copied!" : "copy"}
        </button>}

      </div>

      {/* Result */}
      <div className="border border-border bg-surface-muted px-5 py-4 space-y-3">

        {result ? (
          <>
            {/* Other formats */}
            <div className="border-border pt-3 space-y-2 ">
              {[
                { key: "dec", label: "Decimal", val: toDecimal(result.n, result.d) },
                { key: "pct", label: "Percent", val: toPct(result.n, result.d) },
                { key: "frac", label: "Fraction", val: fmtFrac(result.n, result.d) },
              ].map(({ key, label, val }) => (
                <div key={key} className="flex items-center">
                  <span className="font-mono text-[10px] text-foreground-muted/50 uppercase tracking-wider w-20 shrink-0">{label}</span>
                  <span className="font-mono text-sm text-foreground flex-1 overflow-auto">{val}</span>
                  <button onClick={() => copy(key + "2", val)}
                    className={cn("font-mono text-[10px] px-2 py-1 border border-border transition-colors",
                      copied === key + "2" ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20")}>
                    {copied === key + "2" ? "copied!" : "copy"}
                  </button>
                  
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="font-mono text-foreground-muted/25 text-2xl">—</p>
        )}
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— steps</p>
          <div className="border border-border bg-surface px-4 py-3 space-y-1">
            <p className="font-mono text-sm text-foreground-muted/70">
              {fmtFrac(a.n, a.d)} {op} {fmtFrac(b.n, b.d)}
            </p>
            {steps.map((s, i) => (
              <p key={i} className="font-mono text-sm text-foreground-muted/60 pl-2">{s}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
