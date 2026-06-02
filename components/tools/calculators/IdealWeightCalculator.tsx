"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

type Gender = "male" | "female";
type HeightUnit = "cm" | "ft";

function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

interface FormulaResult {
  name: string;
  kg: number;
}

function calcFormulas(gender: Gender, heightCm: number): FormulaResult[] {
  const inches = heightCm / 2.54;
  const excess = Math.max(0, inches - 60);
  const m = gender === "male";
  return [
    { name: "Devine",   kg: m ? 50   + 2.3  * excess : 45.5 + 2.3  * excess },
    { name: "Robinson", kg: m ? 52   + 1.9  * excess : 49   + 1.7  * excess },
    { name: "Miller",   kg: m ? 56.2 + 1.41 * excess : 53.1 + 1.36 * excess },
    { name: "Hamwi",    kg: m ? 48   + 2.7  * excess : 45.4 + 2.26 * excess },
  ];
}

function fmt(n: number, d = 1): string {
  return n.toFixed(d);
}

export function IdealWeightCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");

  const hCm = parseFloat(heightCm);
  const hFt = parseFloat(heightFt || "0");
  const hIn = parseFloat(heightIn || "0");

  const heightCmErr = heightUnit === "cm"
    ? fe(heightCm, [[hCm <= 0, "Must be > 0"], [hCm > 300, "Max 300 cm"]])
    : null;
  const heightFtErr = heightUnit === "ft" && heightFt !== ""
    ? fe(heightFt, [[hFt < 0, "Cannot be negative"], [hFt > 9, "Max 9 ft"]])
    : null;
  const heightInErr = heightUnit === "ft" && heightIn !== ""
    ? fe(heightIn, [[hIn < 0, "Cannot be negative"], [hIn > 11, "Max 11 in"]])
    : null;

  const resolvedHeightCm =
    heightUnit === "cm" ? hCm : (hFt * 12 + hIn) * 2.54;

  const hasErr = !!(heightCmErr || heightFtErr || heightInErr);
  const valid = !hasErr && isFinite(resolvedHeightCm) && resolvedHeightCm > 0;

  const formulas = valid ? calcFormulas(gender, resolvedHeightCm) : null;
  const avg = formulas ? formulas.reduce((s, f) => s + f.kg, 0) / formulas.length : null;

  return (
    <div className="space-y-6">
      {/* Gender */}
      <div>
        <span className={labelCls}>Gender</span>
        <div className="flex gap-px">
          {(["male", "female"] as const).map((g) => (
            <button key={g} onClick={() => setGender(g)}
              className={cn(
                "flex-1 font-mono text-[11px] px-3 py-2 border transition-colors capitalize",
                gender === g
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:text-foreground",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Height with inline unit toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={labelCls}>Height</span>
          <div className="flex gap-px">
            {(["cm", "ft"] as HeightUnit[]).map((u) => (
              <button key={u} onClick={() => setHeightUnit(u)}
                className={cn(
                  "font-mono text-[10px] px-2.5 py-1 border transition-colors",
                  heightUnit === u
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        {heightUnit === "cm" ? (
          <>
            <input type="number" min="1" max="300" placeholder="175" value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className={cn(inputBaseCls, heightCmErr && inputErrCls)} />
            {heightCmErr && <p className={errCls}>{heightCmErr}</p>}
          </>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1">
              <input type="number" min="0" max="9" placeholder="5 ft" value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                className={cn(inputBaseCls, heightFtErr && inputErrCls)} />
              {heightFtErr && <p className={errCls}>{heightFtErr}</p>}
            </div>
            <div className="flex-1">
              <input type="number" min="0" max="11" placeholder="9 in" value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                className={cn(inputBaseCls, heightInErr && inputErrCls)} />
              {heightInErr && <p className={errCls}>{heightInErr}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Primary result */}
      <div className="border border-border bg-surface-muted px-5 py-4 space-y-1">
        <p className={labelCls}>Average ideal weight</p>
        <p className={cn(
          "font-mono leading-none",
          avg !== null ? "text-4xl text-foreground" : "text-4xl text-foreground-muted/20",
        )}>
          {avg !== null ? `${fmt(avg)} kg` : "—"}
        </p>
        {avg !== null && (
          <p className="font-mono text-base text-foreground-muted overflow-auto">
            {fmt(avg * 2.20462)} lbs
          </p>
        )}
      </div>

      {/* Per-formula breakdown */}
      <div className="border border-border">
        <div className="border-b border-border px-4 py-2">
          <p className={labelCls}>Calculation — average of 4 formulas</p>
        </div>
        {(formulas ?? [
          { name: "Devine",   kg: 0, expression: "" },
          { name: "Robinson", kg: 0, expression: "" },
          { name: "Miller",   kg: 0, expression: "" },
          { name: "Hamwi",    kg: 0, expression: "" },
        ]).map((f) => (
          <div key={f.name} className="flex items-center border-b border-border last:border-0">
            <span className="w-28 shrink-0 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">
              {f.name}
            </span>
            <span className={cn(
              "shrink-0 border-border px-4 py-2.5 font-mono text-sm overflow-auto",
              formulas ? "text-foreground" : "text-foreground-muted/20",
            )}>
              {formulas ? `${fmt(f.kg)} kg` : "—"}
            </span>
            <span className={cn(
              " py-2.5 font-mono text-[12px] flex-1 overflow-auto",
              formulas ? "text-foreground-muted/60" : "text-foreground-muted/20",
            )}>
              {formulas ? `${fmt(f.kg * 2.20462)} lbs` : "—"}
            </span>
          </div>
        ))}
      </div>

      <p className="font-mono text-[11px] text-foreground-muted/50">
        Average of 4 formulas. Based on height only — does not account for muscle mass, bone density, or body composition.
      </p>

      {/* Formula reference */}
      <div className="space-y-1">
        <p className={labelCls}>— formulas ({gender})</p>
        <div className="flex flex-col gap-1">
          {(gender === "male" ? [
            "Devine     :  50    + 2.3  × (height in − 60)",
            "Robinson   :  52    + 1.9  × (height in − 60)",
            "Miller     :  56.2  + 1.41 × (height in − 60)",
            "Hamwi      :  48    + 2.7  × (height in − 60)",
          ] : [
            "Devine     :  45.5  + 2.3  × (height in − 60)",
            "Robinson   :  49    + 1.7  × (height in − 60)",
            "Miller     :  53.1  + 1.36 × (height in − 60)",
            "Hamwi      :  45.4  + 2.26 × (height in − 60)",
          ]).map((line) => (
            <span key={line} className="font-mono text-[11px] text-foreground-muted/60 whitespace-pre">{line}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
