"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

type Gender = "male" | "female";
type LengthUnit = "cm" | "in";
type HeightUnit = "cm" | "ft";
type WeightUnit = "kg" | "lbs";

function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

function calcBodyFatMale(heightCm: number, neckCm: number, waistCm: number): number {
  return (
    495 /
      (1.0324 -
        0.19077 * Math.log10(waistCm - neckCm) +
        0.15456 * Math.log10(heightCm)) -
    450
  );
}

function calcBodyFatFemale(
  heightCm: number,
  neckCm: number,
  waistCm: number,
  hipCm: number,
): number {
  return (
    495 /
      (1.29579 -
        0.35004 * Math.log10(waistCm + hipCm - neckCm) +
        0.221 * Math.log10(heightCm)) -
    450
  );
}

interface CategoryRow {
  label: string;
  rangeMale: string;
  rangeFemale: string;
  match: (pct: number, gender: Gender) => boolean;
  color: string;
  borderColor: string;
  bgColor: string;
  dot: string;
}

const CATEGORIES: CategoryRow[] = [
  {
    label: "Essential fat",
    rangeMale: "< 6%",
    rangeFemale: "< 14%",
    match: (p, g) => (g === "male" ? p < 6 : p < 14),
    color: "text-blue-400",
    borderColor: "border-blue-400/50",
    bgColor: "bg-blue-400/5",
    dot: "bg-blue-400",
  },
  {
    label: "Athletes",
    rangeMale: "6 — 13%",
    rangeFemale: "14 — 20%",
    match: (p, g) => (g === "male" ? p >= 6 && p < 14 : p >= 14 && p < 21),
    color: "text-cyan-400",
    borderColor: "border-cyan-400/50",
    bgColor: "bg-cyan-400/5",
    dot: "bg-cyan-400",
  },
  {
    label: "Fitness",
    rangeMale: "14 — 17%",
    rangeFemale: "21 — 24%",
    match: (p, g) => (g === "male" ? p >= 14 && p < 18 : p >= 21 && p < 25),
    color: "text-green-400",
    borderColor: "border-green-400/50",
    bgColor: "bg-green-400/5",
    dot: "bg-green-400",
  },
  {
    label: "Average",
    rangeMale: "18 — 24%",
    rangeFemale: "25 — 31%",
    match: (p, g) => (g === "male" ? p >= 18 && p < 25 : p >= 25 && p < 32),
    color: "text-amber-400",
    borderColor: "border-amber-400/50",
    bgColor: "bg-amber-400/5",
    dot: "bg-amber-400",
  },
  {
    label: "Obese",
    rangeMale: ">= 25%",
    rangeFemale: ">= 32%",
    match: (p, g) => (g === "male" ? p >= 25 : p >= 32),
    color: "text-red-400",
    borderColor: "border-red-400/50",
    bgColor: "bg-red-400/5",
    dot: "bg-red-400",
  },
];

function fmt(n: number, d = 1): string {
  return n.toFixed(d);
}

// Reusable inline unit toggle buttons
function UnitToggle<T extends string>({ unit, options, onSwitch }: {
  unit: T;
  options: T[];
  onSwitch: (u: T) => void;
}) {
  return (
    <div className="flex gap-px">
      {options.map((u) => (
        <button key={u} onClick={() => onSwitch(u)}
          className={cn(
            "font-mono text-[10px] px-2.5 py-1 border transition-colors",
            unit === u
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-foreground-muted hover:text-foreground",
          )}
        >
          {u}
        </button>
      ))}
    </div>
  );
}

export function BodyFatCalculator() {
  const [gender, setGender] = useState<Gender>("male");

  // Per-field unit state
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [neckUnit,   setNeckUnit]   = useState<LengthUnit>("cm");
  const [waistUnit,  setWaistUnit]  = useState<LengthUnit>("cm");
  const [hipUnit,    setHipUnit]    = useState<LengthUnit>("cm");

  // Per-field value state (separate per unit, like BmiCalculator)
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [neckCm,   setNeckCm]   = useState("");
  const [neckIn,   setNeckIn]   = useState("");
  const [waistCm,  setWaistCm]  = useState("");
  const [waistIn,  setWaistIn]  = useState("");
  const [hipCm,    setHipCm]    = useState("");
  const [hipIn,    setHipIn]    = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [weightKg,   setWeightKg]   = useState("");
  const [weightLbs,  setWeightLbs]  = useState("");

  // Parsed raw values
  const hCm  = parseFloat(heightCm);
  const hFt  = parseFloat(heightFt || "0");
  const hIn  = parseFloat(heightIn  || "0");
  const nCm  = parseFloat(neckCm);
  const nIn  = parseFloat(neckIn);
  const wCm  = parseFloat(waistCm);
  const wIn  = parseFloat(waistIn);
  const hpCm  = parseFloat(hipCm);
  const hpIn  = parseFloat(hipIn);
  const wKg   = parseFloat(weightKg);
  const wLbs  = parseFloat(weightLbs);
  const resolvedWt = weightUnit === "kg" ? wKg : wLbs / 2.20462;

  // Resolved cm values
  const resolvedH  = heightUnit === "cm" ? hCm  : (hFt * 12 + hIn) * 2.54;
  const resolvedN  = neckUnit   === "cm" ? nCm  : nIn  * 2.54;
  const resolvedW  = waistUnit  === "cm" ? wCm  : wIn  * 2.54;
  const resolvedHp = hipUnit    === "cm" ? hpCm : hpIn * 2.54;

  // Validation
  const heightCmErr = heightUnit === "cm"
    ? fe(heightCm, [[hCm <= 0, "Must be > 0"], [hCm > 300, "Max 300 cm"]])
    : null;
  const heightFtErr = heightUnit === "ft" && heightFt !== ""
    ? fe(heightFt, [[hFt < 0, "Cannot be negative"], [hFt > 9, "Max 9 ft"]])
    : null;
  const heightInErr = heightUnit === "ft" && heightIn !== ""
    ? fe(heightIn, [[hIn < 0, "Cannot be negative"], [hIn > 11, "Max 11 in"]])
    : null;

  const neckErr = neckUnit === "cm"
    ? fe(neckCm, [[nCm <= 0, "Must be > 0"], [nCm > 100, "Max 100 cm"]])
    : fe(neckIn, [[nIn <= 0, "Must be > 0"], [nIn > 39, "Max 39 in"]]);

  const waistCmErr = waistUnit === "cm"
    ? fe(waistCm, [
        [wCm <= 0, "Must be > 0"],
        [wCm > 300, "Max 300 cm"],
        [gender === "male" && neckCm !== "" && !neckErr && isFinite(resolvedW) && isFinite(resolvedN) && resolvedW <= resolvedN, "Waist must be > neck"],
      ])
    : null;
  const waistInErr = waistUnit === "in"
    ? fe(waistIn, [
        [wIn <= 0, "Must be > 0"],
        [wIn > 118, "Max 118 in"],
        [gender === "male" && neckIn !== "" && !neckErr && isFinite(resolvedW) && isFinite(resolvedN) && resolvedW <= resolvedN, "Waist must be > neck"],
      ])
    : null;
  const waistErr = waistCmErr ?? waistInErr;

  const hipCmErr = gender === "female" && hipUnit === "cm"
    ? fe(hipCm, [[hpCm <= 0, "Must be > 0"], [hpCm > 300, "Max 300 cm"]])
    : null;
  const hipInErr = gender === "female" && hipUnit === "in"
    ? fe(hipIn, [[hpIn <= 0, "Must be > 0"], [hpIn > 118, "Max 118 in"]])
    : null;
  const hipErr = hipCmErr ?? hipInErr;

  const weightKgErr  = weightUnit === "kg"
    ? fe(weightKg,  [[wKg  <= 0, "Must be > 0"], [wKg  > 500,  "Max 500 kg"]])
    : null;
  const weightLbsErr = weightUnit === "lbs"
    ? fe(weightLbs, [[wLbs <= 0, "Must be > 0"], [wLbs > 1100, "Max 1,100 lbs"]])
    : null;
  const weightErr = weightKgErr ?? weightLbsErr;

  const hasErr = !!(heightCmErr || heightFtErr || heightInErr || neckErr || waistErr || hipErr || weightErr);

  const validMale = !hasErr && gender === "male"
    && isFinite(resolvedH) && resolvedH > 0
    && isFinite(resolvedN) && resolvedN > 0
    && isFinite(resolvedW) && resolvedW > 0
    && resolvedW > resolvedN;
  const validFemale = !hasErr && gender === "female"
    && isFinite(resolvedH) && resolvedH > 0
    && isFinite(resolvedN) && resolvedN > 0
    && isFinite(resolvedW) && resolvedW > 0
    && isFinite(resolvedHp) && resolvedHp > 0
    && resolvedW + resolvedHp > resolvedN;
  const valid = validMale || validFemale;

  const bf = valid
    ? gender === "male"
      ? calcBodyFatMale(resolvedH, resolvedN, resolvedW)
      : calcBodyFatFemale(resolvedH, resolvedN, resolvedW, resolvedHp)
    : null;

  const bfValue = bf;
  const category =
    bfValue !== null ? CATEGORIES.find((c) => c.match(bfValue, gender)) ?? null : null;

  const hasWeight = isFinite(resolvedWt) && resolvedWt > 0 && !weightErr;
  const fatMass  = bf !== null && hasWeight ? (bf / 100) * resolvedWt : null;
  const leanMass = fatMass !== null ? resolvedWt - fatMass : null;

  // Formula always uses resolved cm values
  const formulaStr = valid && bf !== null
    ? gender === "male"
      ? `%BF = 495 / (1.0324 − 0.19077 × log10(${fmt(resolvedW)}−${fmt(resolvedN)}) + 0.15456 × log10(${fmt(resolvedH)})) − 450 = ${fmt(bf)}%`
      : `%BF = 495 / (1.29579 − 0.35004 × log10(${fmt(resolvedW)}+${fmt(resolvedHp)}−${fmt(resolvedN)}) + 0.221 × log10(${fmt(resolvedH)})) − 450 = ${fmt(bf)}%`
    : null;

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

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Height */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Height</span>
            <UnitToggle unit={heightUnit} options={["cm", "ft"]} onSwitch={setHeightUnit} />
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

        {/* Neck */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Neck circumference</span>
            <UnitToggle unit={neckUnit} options={["cm", "in"]} onSwitch={setNeckUnit} />
          </div>
          {neckUnit === "cm" ? (
            <>
              <input type="number" min="1" max="100" placeholder="38" value={neckCm}
                onChange={(e) => setNeckCm(e.target.value)}
                className={cn(inputBaseCls, neckErr && inputErrCls)} />
            </>
          ) : (
            <>
              <input type="number" min="1" max="39" placeholder="15" value={neckIn}
                onChange={(e) => setNeckIn(e.target.value)}
                className={cn(inputBaseCls, neckErr && inputErrCls)} />
            </>
          )}
          {neckErr && <p className={errCls}>{neckErr}</p>}
        </div>

        {/* Waist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Waist circumference</span>
            <UnitToggle unit={waistUnit} options={["cm", "in"]} onSwitch={setWaistUnit} />
          </div>
          {waistUnit === "cm" ? (
            <>
              <input type="number" min="1" max="300" placeholder="85" value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                className={cn(inputBaseCls, waistErr && inputErrCls)} />
            </>
          ) : (
            <>
              <input type="number" min="1" max="118" placeholder="33" value={waistIn}
                onChange={(e) => setWaistIn(e.target.value)}
                className={cn(inputBaseCls, waistErr && inputErrCls)} />
            </>
          )}
          {waistErr && <p className={errCls}>{waistErr}</p>}
        </div>

        {/* Hip (female only) */}
        {gender === "female" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={labelCls}>Hip circumference</span>
              <UnitToggle unit={hipUnit} options={["cm", "in"]} onSwitch={setHipUnit} />
            </div>
            {hipUnit === "cm" ? (
              <>
                <input type="number" min="1" max="300" placeholder="95" value={hipCm}
                  onChange={(e) => setHipCm(e.target.value)}
                  className={cn(inputBaseCls, hipErr && inputErrCls)} />
              </>
            ) : (
              <>
                <input type="number" min="1" max="118" placeholder="37" value={hipIn}
                  onChange={(e) => setHipIn(e.target.value)}
                  className={cn(inputBaseCls, hipErr && inputErrCls)} />
              </>
            )}
            {hipErr && <p className={errCls}>{hipErr}</p>}
          </div>
        )}

        {/* Weight (optional) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Body weight — optional</span>
            <UnitToggle unit={weightUnit} options={["kg", "lbs"]} onSwitch={setWeightUnit} />
          </div>
          {weightUnit === "kg" ? (
            <>
              <input type="number" min="0.1" max="500" placeholder="75" value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className={cn(inputBaseCls, weightKgErr && inputErrCls)} />
              {weightKgErr && <p className={errCls}>{weightKgErr}</p>}
            </>
          ) : (
            <>
              <input type="number" min="0.1" max="1100" placeholder="165" value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className={cn(inputBaseCls, weightLbsErr && inputErrCls)} />
              {weightLbsErr && <p className={errCls}>{weightLbsErr}</p>}
            </>
          )}
        </div>
      </div>

      {/* Primary result */}
      <div className={cn(
        "border px-5 py-4 space-y-4 transition-colors",
        category ? cn(category.borderColor) : "border-border bg-surface-muted",
      )}>
        <div>
          <p className={labelCls}>Body fat percentage</p>
          <p className={cn(
            "font-mono leading-none",
            bf !== null
              ? cn("text-4xl", category?.color ?? "text-foreground")
              : "text-4xl text-foreground-muted/20",
          )}>
            {bf !== null ? `${fmt(bf)}%` : "—"}
          </p>
        </div>

        {category && (
          <div>
            <p className={labelCls}>Category</p>
            <span className={cn(
              "font-mono text-sm border px-3 py-1 inline-flex items-center gap-2",
              category.color,
              category.borderColor,
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", category.dot)} />
              {category.label}
            </span>
          </div>
        )}

        {(fatMass !== null || leanMass !== null) && (
          <div className="pt-2 border-t border-border grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls}>Fat mass</p>
              <p className="font-mono text-sm text-foreground overflow-auto">
                {fatMass !== null
                  ? weightUnit === "kg"
                    ? `${fmt(fatMass)} kg`
                    : `${fmt(fatMass * 2.20462)} lbs`
                  : "—"}
              </p>
            </div>
            <div>
              <p className={labelCls}>Lean mass</p>
              <p className="font-mono text-sm text-foreground overflow-auto">
                {leanMass !== null
                  ? weightUnit === "kg"
                    ? `${fmt(leanMass)} kg`
                    : `${fmt(leanMass * 2.20462)} lbs`
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Formula */}
      {formulaStr && (
        <div className="overflow-x-auto">
          <p className="font-mono text-[11px] text-foreground-muted/60 whitespace-nowrap">{formulaStr}</p>
        </div>
      )}

      {/* Category reference table */}
      <div className="border border-border">
        <div className="border-b border-border px-4 py-2">
          <p className={labelCls}>Body fat categories (American Council on Exercise)</p>
        </div>
        <div className="flex items-center border-b border-border bg-surface-muted">
          <span className="w-36 shrink-0 border-r border-border px-4 py-2 font-mono text-[10px] uppercase text-foreground-muted/50">
            Category
          </span>
          <span className="w-28 shrink-0 border-r border-border px-4 py-2 font-mono text-[10px] uppercase text-foreground-muted/50">
            Men
          </span>
          <span className="px-4 py-2 font-mono text-[10px] uppercase text-foreground-muted/50 flex-1">
            Women
          </span>
        </div>
        {CATEGORIES.map((c) => {
          const isActive = category?.label === c.label;
          return (
            <div
              key={c.label}
              className={cn(
                "flex items-center border-b border-border last:border-0 transition-colors",
                isActive && "bg-surface-muted",
              )}
            >
              <span className="w-36 shrink-0 border-r border-border px-4 py-2.5 flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.dot)} />
                <span className="font-mono text-[10px] uppercase text-foreground-muted/50">{c.label}</span>
              </span>
              <span className={cn(
                "w-28 shrink-0 border-r border-border px-4 py-2.5 font-mono text-sm overflow-auto",
                isActive ? c.color : "text-foreground",
              )}>
                {c.rangeMale}
              </span>
              <span className={cn(
                "px-4 py-2.5 font-mono text-sm flex-1 overflow-auto",
                isActive ? c.color : "text-foreground",
              )}>
                {c.rangeFemale}
              </span>
            </div>
          );
        })}
      </div>

      <p className="font-mono text-[11px] text-foreground-muted/50">
        Uses the US Navy circumference method. Measure at the narrowest point for waist and neck; widest point for hips. Formula uses cm internally.
      </p>
    </div>
  );
}
