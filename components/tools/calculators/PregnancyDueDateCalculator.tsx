"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls } from "@/lib/utils/formStyles";

type Mode = "lmp" | "conception";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTrimester(weeks: number): string {
  if (weeks <= 12) return "1st trimester";
  if (weeks <= 26) return "2nd trimester";
  return "3rd trimester";
}

function calcWeeksPregnant(lmp: Date, today: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diff = today.getTime() - lmp.getTime();
  return Math.floor(diff / msPerWeek);
}

function calcDaysRemaining(edd: Date, today: Date): number {
  const diff = edd.getTime() - today.getTime();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

export function PregnancyDueDateCalculator() {
  const [mode, setMode] = useState<Mode>("lmp");
  const [dateValue, setDateValue] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let edd: Date | null = null;
  let weeksPregnant: number | null = null;
  let daysRemaining: number | null = null;
  let trimester: string | null = null;
  let inputError: string | null = null;

  if (dateValue) {
    const inputDate = new Date(dateValue + "T00:00:00");
    if (isNaN(inputDate.getTime())) {
      inputError = "Invalid date";
    } else if (mode === "lmp") {
      if (inputDate > today) {
        inputError = "LMP cannot be in the future";
      } else {
        edd = addDays(inputDate, 280);
        const weeks = calcWeeksPregnant(inputDate, today);
        if (weeks >= 0 && weeks <= 42) {
          weeksPregnant = weeks;
          trimester = getTrimester(weeks);
        }
        daysRemaining = calcDaysRemaining(edd, today);
      }
    } else {
      // conception mode
      if (inputDate > today) {
        inputError = "Conception date cannot be in the future";
      } else {
        edd = addDays(inputDate, 266);
        // weeks from LMP approximation: conception is ~14 days after LMP
        const lmpApprox = addDays(inputDate, -14);
        const weeks = calcWeeksPregnant(lmpApprox, today);
        if (weeks >= 0 && weeks <= 42) {
          weeksPregnant = weeks;
          trimester = getTrimester(weeks);
        }
        daysRemaining = calcDaysRemaining(edd, today);
      }
    }
  }

  const hasResult = edd !== null;

  return (
    <div className="space-y-6">
      {/* Mode tab */}
      <div>
        <span className={labelCls}>Calculation method</span>
        <div className="flex gap-2">
          {([
            { value: "lmp" as Mode, label: "Last menstrual period" },
            { value: "conception" as Mode, label: "Conception date" },
          ]).map((m) => (
            <button
              key={m.value}
              onClick={() => { setMode(m.value); setDateValue(""); }}
              className={cn(
                "flex-1 font-mono text-[11px] px-3 py-2 border transition-colors",
                mode === m.value
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date input */}
      <div>
        <label className={labelCls}>
          {mode === "lmp" ? "First day of last menstrual period" : "Conception date"}
        </label>
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          className={inputBaseCls}
        />
        {inputError && (
          <p className="font-mono text-[10px] text-red-500/70 mt-1">{inputError}</p>
        )}
      </div>

      {/* Results */}
      <div className="border border-border bg-surface-muted px-5 py-4 space-y-4">
        <div>
          <p className={labelCls}>Estimated due date</p>
          <p
            className={cn(
              "font-mono leading-none",
              hasResult ? "text-3xl text-foreground" : "text-3xl text-foreground-muted/20",
            )}
          >
            {edd !== null ? formatDate(edd) : "—"}
          </p>
        </div>

        {hasResult && (
          <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className={labelCls}>Week of pregnancy</p>
              <p className="font-mono text-sm text-foreground">
                {weeksPregnant !== null ? `Week ${weeksPregnant}` : "—"}
              </p>
            </div>
            <div>
              <p className={labelCls}>Trimester</p>
              <p className="font-mono text-sm text-foreground">
                {trimester ?? "—"}
              </p>
            </div>
            <div>
              <p className={labelCls}>Days remaining</p>
              <p className="font-mono text-sm text-foreground">
                {daysRemaining !== null
                  ? daysRemaining > 0
                    ? `${daysRemaining} days`
                    : daysRemaining === 0
                    ? "Due today"
                    : `${Math.abs(daysRemaining)} days past due`
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reference table */}
      <div className="border border-border">
        <div className="border-b border-border px-4 py-2">
          <p className={labelCls}>Trimester reference</p>
        </div>
        {[
          { trimester: "1st trimester", weeks: "Weeks 1 — 12" },
          { trimester: "2nd trimester", weeks: "Weeks 13 — 26" },
          { trimester: "3rd trimester", weeks: "Weeks 27 — 40" },
        ].map((row) => (
          <div key={row.trimester} className="flex items-center border-b border-border last:border-0">
            <span className="w-44 shrink-0 border-r border-border px-4 py-2.5 font-mono text-[10px] uppercase text-foreground-muted/50">
              {row.trimester}
            </span>
            <span className="px-4 py-2.5 font-mono text-sm text-foreground flex-1">
              {row.weeks}
            </span>
          </div>
        ))}
      </div>

      <p className="font-mono text-[11px] text-foreground-muted/50">
        {mode === "lmp"
          ? "Based on Naegele's rule: EDD = LMP + 280 days (40 weeks). Only 5% of babies are born on their exact due date."
          : "EDD = conception date + 266 days (38 weeks). Only 5% of babies are born on their exact due date."}
      </p>
    </div>
  );
}
