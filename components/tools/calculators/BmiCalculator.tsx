"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

type WeightUnit = "kg" | "lbs";
type HeightUnit = "cm" | "ft";

function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

function calcBmi(weightKg: number, heightM: number): number {
  return weightKg / (heightM * heightM);
}

interface Category {
  label: string;
  color: string;         // text color
  borderColor: string;   // border color
  bgColor: string;       // subtle background
  dotColor: string;      // indicator dot
}

function getCategory(bmi: number): Category {
  if (bmi < 18.5) return {
    label: "Underweight",
    color: "text-blue-400",
    borderColor: "border-blue-400/50",
    bgColor: "bg-blue-400/5",
    dotColor: "bg-blue-400",
  };
  if (bmi < 25) return {
    label: "Normal weight",
    color: "text-green-400",
    borderColor: "border-green-400/50",
    bgColor: "bg-green-400/5",
    dotColor: "bg-green-400",
  };
  if (bmi < 30) return {
    label: "Overweight",
    color: "text-amber-400",
    borderColor: "border-amber-400/50",
    bgColor: "bg-amber-400/5",
    dotColor: "bg-amber-400",
  };
  return {
    label: "Obese",
    color: "text-red-400",
    borderColor: "border-red-400/50",
    bgColor: "bg-red-400/5",
    dotColor: "bg-red-400",
  };
}

function healthyWeightRange(heightM: number): { min: number; max: number } {
  return { min: 18.5 * heightM * heightM, max: 24.9 * heightM * heightM };
}

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

const REFERENCE_ROWS = [
  { range: "Below 18.5", label: "Underweight", color: "text-blue-400",  dot: "bg-blue-400" },
  { range: "18.5 — 24.9", label: "Normal weight", color: "text-green-400", dot: "bg-green-400" },
  { range: "25.0 — 29.9", label: "Overweight",  color: "text-amber-400", dot: "bg-amber-400" },
  { range: "30.0 and above", label: "Obese",    color: "text-red-400",   dot: "bg-red-400" },
];

export function BmiCalculator() {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weightKg, setWeightKg]     = useState("");
  const [weightLbs, setWeightLbs]   = useState("");
  const [heightCm, setHeightCm]     = useState("");
  const [heightFt, setHeightFt]     = useState("");
  const [heightIn, setHeightIn]     = useState("");

  const wKg  = parseFloat(weightKg);
  const wLbs = parseFloat(weightLbs);
  const hCm  = parseFloat(heightCm);
  const hFt  = parseFloat(heightFt || "0");
  const hIn  = parseFloat(heightIn || "0");

  const weightKgErr = weightUnit === "kg"
    ? fe(weightKg,  [[wKg <= 0, "Must be > 0"], [wKg > 500, "Max 500 kg"]])
    : null;
  const weightLbsErr = weightUnit === "lbs"
    ? fe(weightLbs, [[wLbs <= 0, "Must be > 0"], [wLbs > 1100, "Max 1,100 lbs"]])
    : null;
  const heightCmErr = heightUnit === "cm"
    ? fe(heightCm,  [[hCm <= 0, "Must be > 0"], [hCm > 300, "Max 300 cm"]])
    : null;
  const heightFtErr = heightUnit === "ft" && heightFt !== ""
    ? fe(heightFt,  [[hFt < 0, "Cannot be negative"], [hFt > 9, "Max 9 ft"]])
    : null;
  const heightInErr = heightUnit === "ft" && heightIn !== ""
    ? fe(heightIn,  [[hIn < 0, "Cannot be negative"], [hIn > 11, "Max 11 in"]])
    : null;

  const resolvedWeightKg = weightUnit === "kg" ? wKg : wLbs / 2.20462;
  const resolvedHeightM  = heightUnit === "cm"
    ? hCm / 100
    : (hFt * 12 + hIn) * 0.0254;

  const hasErr = !!(weightKgErr || weightLbsErr || heightCmErr || heightFtErr || heightInErr);
  const valid  = !hasErr && isFinite(resolvedWeightKg) && resolvedWeightKg > 0
               && isFinite(resolvedHeightM) && resolvedHeightM > 0;

  const bmi      = valid ? calcBmi(resolvedWeightKg, resolvedHeightM) : null;
  const category = bmi !== null ? getCategory(bmi) : null;
  const range    = valid ? healthyWeightRange(resolvedHeightM) : null;

  const rangeMin = range ? (weightUnit === "kg" ? `${fmt(range.min)} kg` : `${fmt(range.min * 2.20462)} lbs`) : null;
  const rangeMax = range ? (weightUnit === "kg" ? `${fmt(range.max)} kg` : `${fmt(range.max * 2.20462)} lbs`) : null;

  // Formula string
  const formulaStr = valid && bmi !== null
    ? `BMI = ${fmt(resolvedWeightKg, 1)} ÷ (${fmt(resolvedHeightM, 3)})² = ${fmt(resolvedWeightKg, 1)} ÷ ${fmt(resolvedHeightM * resolvedHeightM, 4)} = ${fmt(bmi, 1)}`
    : null;

  return (
    <div className="space-y-6">

      {/* Inputs — weight and height each have their own unit toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Weight</span>
            <div className="flex gap-px">
              {(["kg", "lbs"] as WeightUnit[]).map((u) => (
                <button key={u} onClick={() => setWeightUnit(u)}
                  className={cn(
                    "font-mono text-[10px] px-2.5 py-1 border transition-colors",
                    weightUnit === u
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-foreground-muted hover:text-foreground",
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {weightUnit === "kg" ? (
            <>
              <input type="number" min="0.1" max="500" placeholder="70" value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className={cn(inputBaseCls, weightKgErr && inputErrCls)} />
              {weightKgErr && <p className={errCls}>{weightKgErr}</p>}
            </>
          ) : (
            <>
              <input type="number" min="0.1" max="1100" placeholder="154" value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className={cn(inputBaseCls, weightLbsErr && inputErrCls)} />
              {weightLbsErr && <p className={errCls}>{weightLbsErr}</p>}
            </>
          )}
        </div>

        {/* Height */}
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
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Result */}
      <div className={cn(
        "border px-5 py-4 space-y-4 transition-colors border-border bg-surface-muted",
      )}>
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-border">
          <div>
            <p className={labelCls}>BMI</p>
            <p className={cn(
              "font-mono leading-none text-4xl",
              category ? category.color : "text-foreground-muted/20",
            )}>
              {bmi !== null ? fmt(bmi) : "—"}
            </p>
          </div>
          {category && (
            <span className={cn(
              "font-mono text-[11px] px-3 py-1 border shrink-0",
              category.color, category.borderColor,
            )}>
              {category.label}
            </span>
          )}
        </div>

        {/* Formula */}
        {formulaStr && (
          <div className="overflow-x-auto">
            <p className="font-mono text-[11px] text-foreground-muted/60 whitespace-nowrap">
              {formulaStr}
            </p>
          </div>
        )}

        {/* Healthy range */}
        {rangeMin && rangeMax && (
          <div className="pt-1">
            <p className={cn(labelCls, "mb-0.5")}>Healthy range for your height</p>
            <p className="font-mono text-sm text-foreground">
              {rangeMin} — {rangeMax}
            </p>
          </div>
        )}
      </div>

      {/* Reference table */}
      <div className="border border-border">
        <div className="border-b border-border px-4 py-2">
          <p className={labelCls}>BMI categories</p>
        </div>
        {REFERENCE_ROWS.map((row) => {
          const isActive = category?.label === row.label;
          return (
            <div key={row.label} className={cn(
              "flex items-center border-b border-border last:border-0 transition-colors",
              isActive && "bg-surface-muted",
            )}>
              <div className="w-44 shrink-0 border-r border-border px-4 py-2.5 flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", row.dot)} />
                <span className="font-mono text-[10px] uppercase text-foreground-muted/50">{row.range}</span>
              </div>
              <span className={cn("px-4 py-2.5 font-mono text-sm flex-1", isActive ? row.color : "text-foreground")}>
                {row.label}
                {isActive && <span className="font-mono text-[10px] ml-2 opacity-60">← you</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
