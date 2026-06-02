"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useCopyState } from "@/lib/hooks/useCopyState";
import { labelCls, inputCls, errCls } from "@/lib/utils/formStyles";
import { CopyButton } from "@/components/ui/CopyButton";

function localDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function calcYMD(start: Date, end: Date) {
  const [a, b] = start <= end ? [start, end] : [end, start];
  let years  = b.getFullYear() - a.getFullYear();
  let months = b.getMonth()    - a.getMonth();
  let days   = b.getDate()     - a.getDate();
  if (days < 0) { months--; days += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

export function DateDifferenceCalculator() {
  const [startStr, setStartStr] = useState("");
  const [endStr,   setEndStr]   = useState("");
  const { copied, copy } = useCopyState();

  const startErr = startStr && endStr && localDate(startStr) > localDate(endStr) ? "" : "";
  const endErr   = endStr && startStr && localDate(endStr) < localDate(startStr) ? "" : "";

  const result = useMemo(() => {
    if (!startStr || !endStr) return null;
    const a = localDate(startStr);
    const b = localDate(endStr);
    const totalMs = Math.abs(b.getTime() - a.getTime());
    const tDays   = Math.round(totalMs / 86_400_000);
    const { years, months, days } = calcYMD(a, b);
    const sign = b < a ? "−" : "";
    return {
      summary: `${sign}${years > 0 ? `${years}y ` : ""}${months > 0 ? `${months}mo ` : ""}${days}d`.trim() || "0 days",
      years, months, days,
      totalDays: tDays,
      totalWeeks: (tDays / 7).toFixed(2),
      totalHours: (totalMs / 3_600_000).toFixed(0),
      totalMinutes: (totalMs / 60_000).toFixed(0),
      totalSeconds: (totalMs / 1_000).toFixed(0),
      isNegative: b < a,
    };
  }, [startStr, endStr]);

  const ROWS = result ? [
    { key: "summary",  label: "Difference",    value: result.summary },
    { key: "days",     label: "Days only",     value: result.totalDays.toLocaleString("en-US") },
    { key: "weeks",    label: "Weeks",         value: result.totalWeeks },
    { key: "hours",    label: "Hours",         value: Number(result.totalHours).toLocaleString("en-US") },
    { key: "minutes",  label: "Minutes",       value: Number(result.totalMinutes).toLocaleString("en-US") },
    { key: "seconds",  label: "Seconds",       value: Number(result.totalSeconds).toLocaleString("en-US") },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— start date</label>
          <input type="date" value={startStr} onChange={(e) => setStartStr(e.target.value)}
            className={cn(inputCls, startErr && "border-red-500/40")} />
          {startErr && <p className={errCls}>{startErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— end date</label>
          <input type="date" value={endStr} onChange={(e) => setEndStr(e.target.value)}
            className={cn(inputCls, endErr && "border-red-500/40")} />
          {endErr && <p className={errCls}>{endErr}</p>}
        </div>
      </div>

      {result?.isNegative && (
        <p className="font-mono text-[10px] text-yellow-500/70">End date is before start date — showing absolute difference.</p>
      )}

      {!startStr || !endStr ? (
        <p className="font-mono text-[10px] text-foreground-muted/40">Select both dates to calculate the difference.</p>
      ) : ROWS.length > 0 && (
        <div className="space-y-1">
          <p className={labelCls}>— results</p>
          <div className="border border-border divide-y divide-border">
            {ROWS.map(({ key, label, value }) => (
              <div key={key} className={cn("bg-surface", key === "summary" && "bg-surface-muted")}>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className={cn(
                    "font-mono text-[10px] uppercase tracking-wider px-4 py-2 sm:py-2.5 sm:w-44 sm:shrink-0 sm:border-r border-b sm:border-b-0 border-border",
                    key === "summary" ? "text-primary" : "text-foreground-muted/80"
                  )}>
                    {label}
                  </span>
                  <div className="flex items-center flex-1 min-w-0">
                    <span className={cn(
                      "font-mono text-sm px-4 py-2.5 flex-1 min-w-0 break-words",
                      key === "summary" ? "text-primary" : "text-foreground/80"
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
