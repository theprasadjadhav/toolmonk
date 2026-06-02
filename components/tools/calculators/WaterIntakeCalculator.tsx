"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

type WeightUnit = "kg" | "lbs";

const selectCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";

function fe(val: string, rules: Array<[boolean, string]>): string | null {
  if (val === "") return null;
  for (const [bad, msg] of rules) if (bad) return msg;
  return null;
}

const ACTIVITY_OPTIONS = [
  { label: "Low (mostly sedentary)", multiplier: 1.0 },
  { label: "Moderate (some exercise)", multiplier: 1.2 },
  { label: "High (intense exercise)", multiplier: 1.4 },
];

const CLIMATE_OPTIONS = [
  { label: "Cold (below 10°C / 50°F)",        multiplier: 0.9 },
  { label: "Mild (10–20°C / 50–68°F)",        multiplier: 0.95 },
  { label: "Normal (20–25°C / 68–77°F)",   multiplier: 1.0 },
  { label: "Warm (25–30°C / 77–86°F)",        multiplier: 1.05 },
  { label: "Hot (30–35°C / 86–95°F)",         multiplier: 1.1 },
  { label: "Very hot (35–40°C / 95–104°F)",   multiplier: 1.15 },
  { label: "Extreme heat (above 40°C / 104°F)", multiplier: 1.2 },
  { label: "Humid (high humidity any temp)",  multiplier: 1.1 },
];

function fmt(n: number, d = 1): string {
  return n.toFixed(d);
}

export function WaterIntakeCalculator() {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [activityIdx, setActivityIdx] = useState(1);
  const [climateIdx, setClimateIdx] = useState(2);

  const wKg = parseFloat(weightKg);
  const wLbs = parseFloat(weightLbs);

  const weightKgErr = weightUnit === "kg"
    ? fe(weightKg, [[wKg <= 0, "Must be > 0"], [wKg > 500, "Max 500 kg"]])
    : null;
  const weightLbsErr = weightUnit === "lbs"
    ? fe(weightLbs, [[wLbs <= 0, "Must be > 0"], [wLbs > 1100, "Max 1,100 lbs"]])
    : null;

  const resolvedWeightKg = weightUnit === "kg" ? wKg : wLbs / 2.20462;

  const hasErr = !!(weightKgErr || weightLbsErr);
  const valid = !hasErr && isFinite(resolvedWeightKg) && resolvedWeightKg > 0;

  const activityMul = ACTIVITY_OPTIONS[activityIdx].multiplier;
  const climateMul = CLIMATE_OPTIONS[climateIdx].multiplier;

  const baseLiters = valid ? resolvedWeightKg * 0.033 : null;
  const totalLiters = baseLiters !== null ? baseLiters * activityMul * climateMul : null;

  const activityAdjustment =
    baseLiters !== null ? baseLiters * (activityMul - 1) : null;
  const climateAdjustment =
    baseLiters !== null ? baseLiters * activityMul * (climateMul - 1) : null;

  const totalMl = totalLiters !== null ? totalLiters * 1000 : null;
  const glasses = totalMl !== null ? totalMl / 250 : null;
  const totalOz = totalLiters !== null ? totalLiters * 33.814 : null;

  const formulaStr = valid && totalLiters !== null
    ? activityMul === 1 && climateMul === 1
      ? `${fmt(resolvedWeightKg)} kg × 0.033 = ${fmt(totalLiters, 2)} L`
      : `${fmt(resolvedWeightKg)} kg × 0.033 × ${activityMul} × ${climateMul} = ${fmt(totalLiters, 2)} L`
    : null;

  return (
    <div className="space-y-6">
      {/* Weight with inline unit toggle */}
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
            <input
              type="number"
              min="0.1"
              max="500"
              placeholder="70"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className={cn(inputBaseCls, weightKgErr && inputErrCls)}
            />
            {weightKgErr && <p className={errCls}>{weightKgErr}</p>}
          </>
        ) : (
          <>
            <input
              type="number"
              min="0.1"
              max="1100"
              placeholder="154"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              className={cn(inputBaseCls, weightLbsErr && inputErrCls)}
            />
            {weightLbsErr && <p className={errCls}>{weightLbsErr}</p>}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Activity level */}
        <div>
          <label className={labelCls}>Activity level</label>
          <select
            value={activityIdx}
            onChange={(e) => setActivityIdx(Number(e.target.value))}
            className={selectCls}
          >
            {ACTIVITY_OPTIONS.map((a, i) => (
              <option key={i} value={i}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {/* Climate */}
        <div>
          <label className={labelCls}>Climate</label>
          <select
            value={climateIdx}
            onChange={(e) => setClimateIdx(Number(e.target.value))}
            className={selectCls}
          >
            {CLIMATE_OPTIONS.map((c, i) => (
              <option key={i} value={i}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary result */}
      <div className={cn(
        "border px-5 py-4 transition-colors",
        valid ? "border-blue-400/50 bg-blue-400/5" : "border-border bg-surface-muted",
      )}>
        <p className={labelCls}>Daily water intake</p>
        <p
          className={cn(
            "font-mono leading-none mb-4",
            totalLiters !== null ? "text-4xl text-blue-400" : "text-4xl text-foreground-muted/20",
          )}
        >
          {totalLiters !== null ? `${fmt(totalLiters)} L` : "—"}
        </p>

        {totalLiters !== null && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-400/20">
            <div>
              <p className={labelCls}>Milliliters</p>
              <p className="font-mono text-sm text-foreground overflow-auto">{totalMl !== null ? `${Math.round(totalMl)} ml` : "—"}</p>
            </div>
            <div>
              <p className={labelCls}>Glasses (250 ml)</p>
              <p className="font-mono text-sm text-foreground overflow-auto">{glasses !== null ? `${fmt(glasses)} glasses` : "—"}</p>
            </div>
            <div>
              <p className={labelCls}>Fluid ounces</p>
              <p className="font-mono text-sm text-foreground overflow-auto">{totalOz !== null ? `${fmt(totalOz)} oz` : "—"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown table */}
      {baseLiters !== null && (
        <div className="border border-border">
          <div className="border-b border-border px-4 py-2">
            <p className={labelCls}>Calculation breakdown</p>
          </div>
          {[
            { label: "Base (weight × 0.033)", value: `${fmt(baseLiters)} L` },
            {
              label: `Activity adjustment (× ${activityMul})`,
              value: activityAdjustment !== null && activityAdjustment > 0
                ? `+ ${fmt(activityAdjustment)} L`
                : "no adjustment",
            },
            {
              label: `Climate adjustment (× ${climateMul})`,
              value: climateAdjustment !== null && climateAdjustment > 0
                ? `+ ${fmt(climateAdjustment)} L`
                : "no adjustment",
            },
            { label: "Total", value: `${fmt(totalLiters!)} L` },
          ].map((row) => (
            <div key={row.label} className="flex items-center border-b border-border last:border-0">
              <span className="w-56 shrink-0 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">
                {row.label}
              </span>
              <span className="px-4 py-2.5 font-mono text-sm text-foreground flex-1 overflow-auto">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Formula */}
      {formulaStr && (
        <div className="overflow-x-auto">
          <p className="font-mono text-[11px] text-foreground-muted/60 whitespace-nowrap">{formulaStr}</p>
        </div>
      )}

      <p className="font-mono text-[11px] text-foreground-muted/50">
        Based on the general guideline of 33 ml per kg of body weight per day. Individual needs vary; consult a healthcare professional for medical advice.
      </p>
    </div>
  );
}
