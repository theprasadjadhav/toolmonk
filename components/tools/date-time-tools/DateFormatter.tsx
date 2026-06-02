"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls } from "@/lib/utils/formStyles";

function pad(n: number) { return String(n).padStart(2, "0"); }

function weekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - start.getTime();
  return Math.ceil((diff / 86_400_000 + start.getDay() + 1) / 7);
}

function nowLocalISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateFormatter() {
  const [dtStr, setDtStr] = useState(nowLocalISO());
  const [copied, setCopied] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!dtStr) return [];
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return [];
    const Y = d.getFullYear(), M = pad(d.getMonth() + 1), D = pad(d.getDate());
    const H = pad(d.getHours()), Min = pad(d.getMinutes()), S = pad(d.getSeconds());
    const unixSec = Math.floor(d.getTime() / 1000);
    return [
      { key: "ymd",      label: "YYYY-MM-DD",        value: `${Y}-${M}-${D}` },
      { key: "dmy",      label: "DD/MM/YYYY",        value: `${D}/${M}/${Y}` },
      { key: "mdy",      label: "MM/DD/YYYY",        value: `${M}/${D}/${Y}` },
      { key: "dmy2",     label: "DD-MM-YYYY",        value: `${D}-${M}-${Y}` },
      { key: "iso",      label: "ISO 8601",           value: d.toISOString() },
      { key: "rfc",      label: "RFC 2822",           value: d.toUTCString() },
      { key: "unix",     label: "Unix (seconds)",    value: String(unixSec) },
      { key: "unixms",   label: "Unix (ms)",          value: String(d.getTime()) },
      { key: "time",     label: "Time (HH:MM:SS)",   value: `${H}:${Min}:${S}` },
      { key: "long",     label: "Long locale",        value: d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
      { key: "short",    label: "Short locale",       value: d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
      { key: "dow",      label: "Day of week",        value: d.toLocaleDateString("en-US", { weekday: "long" }) },
      { key: "month",    label: "Month",              value: d.toLocaleDateString("en-US", { month: "long" }) },
      { key: "week",     label: "Week of year",       value: String(weekNumber(d)) },
      { key: "quarter",  label: "Quarter",            value: `Q${Math.ceil((d.getMonth() + 1) / 3)}` },
    ];
  }, [dtStr]);

  const copy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className={labelCls}>— date &amp; time</label>
          <input type="datetime-local" value={dtStr}
            onChange={(e) => setDtStr(e.target.value)}
            className={inputCls} />
        </div>
        <button onClick={() => setDtStr(nowLocalISO())}
          className="font-mono text-[10px] px-3 py-3 border border-border text-foreground-muted hover:text-primary hover:border-primary/40 transition-colors whitespace-nowrap shrink-0">
          Use now
        </button>
      </div>

      {rows.length > 0 && (
        <div className="space-y-1">
          <p className={labelCls}>— formats</p>
          <div className="border border-border divide-y divide-border">
            {rows.map(({ key, label, value }) => (
              <div key={key} className="bg-surface hover:bg-surface-muted transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-4 py-2 sm:py-2.5 sm:w-44 sm:shrink-0 sm:border-r border-b sm:border-b-0 border-border text-foreground-muted/80">
                    {label}
                  </span>
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="font-mono text-sm px-4 py-2.5 flex-1 min-w-0 text-foreground/80 break-all">
                      {value}
                    </span>
                    <button onClick={() => copy(key, value)}
                      className={cn("font-mono text-[10px] px-3 py-1.5 border mx-2 border-border shrink-0", copied === key ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground")}>
                      {copied === key ? "copied!" : "copy"}
                    </button>
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
