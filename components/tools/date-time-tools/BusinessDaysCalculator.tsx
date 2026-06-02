"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls } from "@/lib/utils/formStyles";

function localDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function BusinessDaysCalculator() {
  const [startStr, setStartStr] = useState("");
  const [endStr,   setEndStr]   = useState("");
  const [copied,   setCopied]   = useState<string | null>(null);

  const result = useMemo(() => {
    if (!startStr || !endStr) return null;
    const [a, b] = [localDate(startStr), localDate(endStr)];
    const [start, end] = a <= b ? [a, b] : [b, a];

    let businessDays = 0, weekendDays = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dow = cur.getDay();
      if (dow === 0 || dow === 6) weekendDays++;
      else businessDays++;
      cur.setDate(cur.getDate() + 1);
    }
    const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return { businessDays, weekendDays, totalDays, reversed: a > b };
  }, [startStr, endStr]);

  const copy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const ROWS = result ? [
    { key: "business", label: "Business days", value: result.businessDays.toLocaleString("en-US"), highlight: true },
    { key: "total",    label: "Calendar days", value: result.totalDays.toLocaleString("en-US") },
    { key: "weekends", label: "Weekend days",  value: result.weekendDays.toLocaleString("en-US") },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— start date</label>
          <input type="date" value={startStr} onChange={(e) => setStartStr(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>— end date</label>
          <input type="date" value={endStr} onChange={(e) => setEndStr(e.target.value)} className={inputCls} />
        </div>
      </div>

      {(!startStr || !endStr) && (
        <p className="font-mono text-[10px] text-foreground-muted/40">Select both dates to calculate business days.</p>
      )}

      {ROWS.length > 0 && (
        <div className="space-y-1">
          <p className={labelCls}>— results {result?.reversed ? <span className="text-yellow-500/70">(dates swapped — showing absolute range)</span> : ""}</p>
          <div className="border border-border divide-y divide-border">
            {ROWS.map(({ key, label, value, highlight }) => (
              <div key={key} className={cn("flex items-center bg-surface", highlight && "bg-surface-muted")}>
                <span className={cn("font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 w-40 sm:w-48 shrink-0 border-r border-border", highlight ? "text-primary" : "text-foreground-muted/80")}>
                  {label}
                </span>
                <span className={cn("font-mono px-4 py-2.5 flex-1", highlight ? "text-sm text-primary" : "text-sm text-foreground/80")}>
                  {value}
                </span>
                <button onClick={() => copy(key, value)} className={cn("font-mono text-[10px] px-3 py-1.5 border mx-2 border-border shrink-0", copied === key ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground")}>
                  {copied === key ? "copied!" : "copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
