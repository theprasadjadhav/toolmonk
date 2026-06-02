"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useCopyState } from "@/lib/hooks/useCopyState";
import { labelCls, inputCls, errCls } from "@/lib/utils/formStyles";
import { CopyButton } from "@/components/ui/CopyButton";

// ── Helpers ────────────────────────────────────────────────────────────────────

function localDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function calcAge(birth: Date, ref: Date) {
  let years  = ref.getFullYear() - birth.getFullYear();
  let months = ref.getMonth()    - birth.getMonth();
  let days   = ref.getDate()     - birth.getDate();
  if (days < 0) {
    months--;
    days += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate();
  }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

function daysUntilNextBirthday(birth: Date, ref: Date): number {
  let next = new Date(ref.getFullYear(), birth.getMonth(), birth.getDate());
  if (next <= ref) next = new Date(ref.getFullYear() + 1, birth.getMonth(), birth.getDate());
  return Math.ceil((next.getTime() - ref.getTime()) / 86_400_000);
}

function totalDays(birth: Date, ref: Date): number {
  return Math.floor((ref.getTime() - birth.getTime()) / 86_400_000);
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AgeCalculator() {
  const [birthStr, setBirthStr] = useState("");
  const [refStr,   setRefStr]   = useState(todayISO());
  const { copied, copy } = useCopyState();

  const birthErr =
    !birthStr ? "" :
    localDate(birthStr) > localDate(refStr || todayISO()) ? "Birthdate must be before the reference date" : "";

  const refErr =
    refStr && birthStr && localDate(refStr) < localDate(birthStr)
      ? "Reference date must be after birthdate" : "";

  const result = useMemo(() => {
    if (!birthStr || !refStr || birthErr || refErr) return null;
    const birth = localDate(birthStr);
    const ref   = localDate(refStr);
    if (birth > ref) return null;
    const { years, months, days } = calcAge(birth, ref);
    const td  = totalDays(birth, ref);
    const nbd = daysUntilNextBirthday(birth, ref);
    const dow = ref.toLocaleDateString("en-US", { weekday: "long" });
    return { years, months, days, totalDays: td, totalWeeks: Math.floor(td / 7), totalMonths: years * 12 + months, nextBirthday: nbd, dow };
  }, [birthStr, refStr, birthErr, refErr]);

  const ROWS = result ? [
    { key: "age",     label: "Age",           value: `${result.years} year${result.years !== 1 ? "s" : ""}, ${result.months} month${result.months !== 1 ? "s" : ""}, ${result.days} day${result.days !== 1 ? "s" : ""}` },
    { key: "years",   label: "Years only",    value: String(result.years) },
    { key: "months",  label: "Total months",  value: result.totalMonths.toLocaleString("en-US") },
    { key: "weeks",   label: "Total weeks",   value: result.totalWeeks.toLocaleString("en-US") },
    { key: "days",    label: "Total days",    value: result.totalDays.toLocaleString("en-US") },
    { key: "next",    label: "Next birthday", value: result.nextBirthday === 0 ? "Today!" : `in ${result.nextBirthday} day${result.nextBirthday !== 1 ? "s" : ""}` },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— date of birth</label>
          <input type="date" value={birthStr} max={todayISO()}
            onChange={(e) => setBirthStr(e.target.value)}
            className={cn(inputCls, birthErr && "border-red-500/40")} />
          {birthErr && <p className={errCls}>{birthErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— reference date <span className="normal-case text-foreground-muted/40">(default: today)</span></label>
          <input type="date" value={refStr}
            onChange={(e) => setRefStr(e.target.value)}
            className={cn(inputCls, refErr && "border-red-500/40")} />
          {refErr && <p className={errCls}>{refErr}</p>}
        </div>
      </div>

      {!birthStr && (
        <p className="font-mono text-[10px] text-foreground-muted/40">Enter a date of birth to calculate age.</p>
      )}

      {ROWS.length > 0 && (
        <div className="space-y-1">
          <p className={labelCls}>— results</p>
          <div className="border border-border divide-y divide-border">
            {ROWS.map(({ key, label, value }) => (
              <div key={key} className={cn("bg-surface", key === "age" && "bg-surface-muted")}>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className={cn(
                    "font-mono text-[10px] uppercase tracking-wider px-4 py-2 sm:py-2.5 sm:w-44 sm:shrink-0 sm:border-r border-b sm:border-b-0 border-border",
                    key === "age" ? "text-primary" : "text-foreground-muted/80"
                  )}>
                    {label}
                  </span>
                  <div className="flex items-center flex-1 min-w-0">
                    <span className={cn(
                      "font-mono text-sm px-4 py-2.5 flex-1 min-w-0 break-words",
                      key === "age" ? "text-primary" : "text-foreground/80"
                    )}>
                      {value}
                    </span>
                    <CopyButton copied={copied === key} onClick={() => copy(key, value)} className="mx-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
