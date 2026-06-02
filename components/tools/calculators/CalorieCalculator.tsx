"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

type Gender = "male" | "female";
type WeightUnit = "kg" | "lbs";
type HeightUnit = "cm" | "ft";

const selectCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";

function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

const ACTIVITY_LEVELS = [
  { label: "Sedentary(little or no exercise)", multiplier: 1.2 },
  { label: "Lightly active (1–3 days/week)", multiplier: 1.375 },
  { label: "Moderately active (3–5 days/week)", multiplier: 1.55 },
  { label: "Very active (6–7 days/week)", multiplier: 1.725 },
  { label: "Extra active (physical job or 2x training)", multiplier: 1.9 },
];

function calcBmr(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  if (gender === "male") return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtF(n: number, d = 1): string {
  return n.toFixed(d);
}

export function CalorieCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [activityIdx, setActivityIdx] = useState(1);

  const ageN = parseFloat(age);
  const wKg = parseFloat(weightKg);
  const wLbs = parseFloat(weightLbs);
  const hCm = parseFloat(heightCm);
  const hFt = parseFloat(heightFt || "0");
  const hIn = parseFloat(heightIn || "0");

  const ageErr = fe(age, [[ageN < 1, "Min 1 year"], [ageN > 120, "Max 120 years"]]);
  const weightKgErr = weightUnit === "kg"
    ? fe(weightKg, [[wKg <= 0, "Must be > 0"], [wKg > 500, "Max 500 kg"]])
    : null;
  const weightLbsErr = weightUnit === "lbs"
    ? fe(weightLbs, [[wLbs <= 0, "Must be > 0"], [wLbs > 1100, "Max 1,100 lbs"]])
    : null;
  const heightCmErr = heightUnit === "cm"
    ? fe(heightCm, [[hCm <= 0, "Must be > 0"], [hCm > 300, "Max 300 cm"]])
    : null;
  const heightFtErr = heightUnit === "ft" && heightFt !== ""
    ? fe(heightFt, [[hFt < 0, "Cannot be negative"], [hFt > 9, "Max 9 ft"]])
    : null;
  const heightInErr = heightUnit === "ft" && heightIn !== ""
    ? fe(heightIn, [[hIn < 0, "Cannot be negative"], [hIn > 11, "Max 11 in"]])
    : null;

  const resolvedWeightKg = weightUnit === "kg" ? wKg : wLbs / 2.20462;
  const resolvedHeightCm = heightUnit === "cm" ? hCm : (hFt * 12 + hIn) * 2.54;

  const hasErr = !!(ageErr || weightKgErr || weightLbsErr || heightCmErr || heightFtErr || heightInErr);
  const valid =
    !hasErr &&
    isFinite(ageN) && ageN > 0 &&
    isFinite(resolvedWeightKg) && resolvedWeightKg > 0 &&
    isFinite(resolvedHeightCm) && resolvedHeightCm > 0;

  const bmr = valid ? calcBmr(gender, resolvedWeightKg, resolvedHeightCm, ageN) : null;
  const multiplier = ACTIVITY_LEVELS[activityIdx].multiplier;
  const tdee = bmr !== null ? bmr * multiplier : null;

  const formulaBmr = valid && bmr !== null
    ? gender === "male"
      ? `BMR = 10 × ${fmtF(resolvedWeightKg)} + 6.25 × ${fmtF(resolvedHeightCm)} − 5 × ${Math.round(ageN)} + 5 = ${fmt(bmr)}`
      : `BMR = 10 × ${fmtF(resolvedWeightKg)} + 6.25 × ${fmtF(resolvedHeightCm)} − 5 × ${Math.round(ageN)} − 161 = ${fmt(bmr)}`
    : null;
  const formulaTdee = valid && bmr !== null && tdee !== null
    ? `TDEE = ${fmt(bmr)} × ${multiplier} = ${fmt(tdee)}`
    : null;

  const rows: { label: string, subLable: string, value: string | null; primary?: boolean; colorCls?: string }[] = [
    { label: "BMR", subLable: "(base metabolic rate)", value: bmr !== null ? `${fmt(bmr)} kcal` : null },
    { label: "Maintenance", subLable: "(TDEE)", value: tdee !== null ? `${fmt(tdee)} kcal` : null, primary: true },
    { label: "Weight loss", subLable: "(TDEE − 500)", value: tdee !== null ? `${fmt(tdee - 500)} kcal` : null, colorCls: "text-blue-400" },
    { label: "Weight gain", subLable: "(TDEE + 500)", value: tdee !== null ? `${fmt(tdee + 500)} kcal` : null, colorCls: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Gender tab */}
      <div>
        <span className={labelCls}>Gender</span>
        <div className="flex gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
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

      {/* Inputs grid */}
      <div className="flex flex-col sm:flex-row justify-between gap-2">

        {/* Age */}
        <div className="w-full space-y-2 self-center pt-1.5">
          <div className="flex items-center justify-between">
            <label className={labelCls}>Age (years) — 1 to 120</label>
          </div>
          <input
            type="number"
            min="1"
            max="120"
            placeholder="30"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={cn(inputBaseCls, ageErr && inputErrCls)}
          />
          <p className={cn(errCls, !ageErr && "invisible")}>{ageErr ?? "\u00A0"}</p>
        </div>

        {/* Weight with inline unit toggle */}
        <div className="w-full space-y-2">
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
              <p className={cn(errCls, !weightKgErr && "invisible")}>{weightKgErr ?? "\u00A0"}</p>
            </>
          ) : (
            <>
              <input type="number" min="0.1" max="1100" placeholder="154" value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className={cn(inputBaseCls, weightLbsErr && inputErrCls)} />
              <p className={cn(errCls, !weightLbsErr && "invisible")}>{weightLbsErr ?? "\u00A0"}</p>
            </>
          )}
        </div>

        {/* Height with inline unit toggle */}
        <div className="w-full space-y-2">
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
              <p className={cn(errCls, !heightCmErr && "invisible")}>{heightCmErr ?? "\u00A0"}</p>
            </>
          ) : (
            <div className="flex gap-2">
              <div className="w-1/2">
                <input type="number" min="0" max="9" placeholder="5" value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  className={cn(inputBaseCls, heightFtErr && inputErrCls)} />
                <p className={cn(errCls, !heightFtErr && "invisible")}>{heightFtErr ?? "\u00A0"}</p>
              </div>
              <div className="w-1/2">
                <input type="number" min="0" max="11" placeholder="9" value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  className={cn(inputBaseCls, heightInErr && inputErrCls)} />
                <p className={cn(errCls, !heightInErr && "invisible")}>{heightInErr ?? "\u00A0"}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity level */}
      <div>
        <label className={labelCls}>Activity level</label>
        <select
          value={activityIdx}
          onChange={(e) => setActivityIdx(Number(e.target.value))}
          className={selectCls}
        >
          {ACTIVITY_LEVELS.map((a, i) => (
            <option key={i} value={i}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="border border-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center border-b border-border last:border-0">
            <span className="w-40 shrink-0 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">
              {row.label}
              <p>              
                {row.subLable}
              </p>
            </span>

            <span
              className={cn(
                "px-4 py-2.5 font-mono flex-1 overflow-auto",
                row.primary
                  ? "text-foreground"
                  : row.colorCls
                    ? cn("text-sm", row.colorCls)
                    : "text-sm text-foreground",
                row.value === null && "text-foreground-muted/20 text-sm",
              )}
            >
              {row.value ?? "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Formulas */}
      {formulaBmr && (
        <div className="space-y-1">
          <p className={labelCls}>— formula</p>
          <div className="overflow-x-auto">
            <p className="font-mono text-[11px] text-foreground-muted/60 whitespace-nowrap">{formulaBmr}</p>
          </div>
          {formulaTdee && (
            <div className="overflow-x-auto">
              <p className="font-mono text-[11px] text-foreground-muted/60 whitespace-nowrap">{formulaTdee}</p>
            </div>
          )}
        </div>
      )}

      {tdee !== null && (
        <p className="font-mono text-[11px] text-foreground-muted/50">
          BMR calculated using the Mifflin-St Jeor equation. Multiply by activity factor ({multiplier}) to get TDEE.
        </p>
      )}
    </div>
  );
}
