"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useCopyState } from "@/lib/hooks/useCopyState";
import { labelCls, inputCls, errCls } from "@/lib/utils/formStyles";
import { CopyButton } from "@/components/ui/CopyButton";

function parseTime(s: string): number | null {
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = parseInt(m[1], 10), min = parseInt(m[2], 10), sec = parseInt(m[3] ?? "0", 10);
  if (h > 23 || min > 59 || sec > 59) return null;
  return h * 3600 + min * 60 + sec;
}

function fmtDuration(totalSec: number) {
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  if (m > 0) return `${m}m ${pad(s)}s`;
  return `${s}s`;
}

export function TimeDifferenceCalculator() {
  const [t1, setT1]         = useState("");
  const [t2, setT2]         = useState("");
  const [acrossMidnight, setAM] = useState(false);
  const { copied, copy } = useCopyState();

  const t1Err = t1 && parseTime(t1) === null ? "Use HH:MM or HH:MM:SS format" : "";
  const t2Err = t2 && parseTime(t2) === null ? "Use HH:MM or HH:MM:SS format" : "";

  const result = useMemo(() => {
    if (!t1 || !t2 || t1Err || t2Err) return null;
    const s1 = parseTime(t1)!;
    const s2 = parseTime(t2)!;
    let diff = s2 - s1;
    if (acrossMidnight && diff < 0) diff += 86400;
    const abs = Math.abs(diff);
    return {
      diff: abs,
      hours:   Math.floor(abs / 3600),
      minutes: Math.floor(abs / 60) % 60,
      seconds: abs % 60,
      totalMinutes: Math.floor(abs / 60),
      totalSeconds: abs,
      summary: fmtDuration(abs),
      crossed: acrossMidnight && diff > 0 && s2 < s1,
    };
  }, [t1, t2, t1Err, t2Err, acrossMidnight]);

  const ROWS = result ? [
    { key: "summary",  label: "Difference",     value: result.summary },
    { key: "hours",    label: "Hours",          value: String(result.hours) },
    { key: "minutes",  label: "Total minutes",  value: result.totalMinutes.toLocaleString("en-US") },
    { key: "seconds",  label: "Total seconds",  value: result.totalSeconds.toLocaleString("en-US") },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— start time <span className="normal-case text-foreground-muted/40">(HH:MM or HH:MM:SS)</span></label>
          <input type="text" value={t1} placeholder="14:30:00" maxLength={8}
            onChange={(e) => setT1(e.target.value)}
            className={cn(inputCls, t1Err && "border-red-500/40")} />
          {t1Err && <p className={errCls}>{t1Err}</p>}
        </div>
        <div>
          <label className={labelCls}>— end time</label>
          <input type="text" value={t2} placeholder="18:45:30" maxLength={8}
            onChange={(e) => setT2(e.target.value)}
            className={cn(inputCls, t2Err && "border-red-500/40")} />
          {t2Err && <p className={errCls}>{t2Err}</p>}
        </div>
      </div>

      <button
        onClick={() => setAM((v) => !v)}
        className={cn(
          "font-mono text-[10px] px-3 py-2 border transition-colors",
          acrossMidnight
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border text-foreground-muted hover:text-foreground",
        )}
      >
        Spans midnight (end time is next day)
      </button>

      {(!t1 || !t2) && (
        <p className="font-mono text-[10px] text-foreground-muted/40">Enter both times to calculate the difference.</p>
      )}

      {ROWS.length > 0 && (
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
