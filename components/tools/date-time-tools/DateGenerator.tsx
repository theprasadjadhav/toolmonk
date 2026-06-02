"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, errCls } from "@/lib/utils/formStyles";

function pad(n: number) { return String(n).padStart(2, "0"); }
function localDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatDate(d: Date, fmt: string): string {
  const Y = d.getFullYear(), M = pad(d.getMonth() + 1), D = pad(d.getDate());
  switch (fmt) {
    case "YYYY-MM-DD": return `${Y}-${M}-${D}`;
    case "DD/MM/YYYY": return `${D}/${M}/${Y}`;
    case "MM/DD/YYYY": return `${M}/${D}/${Y}`;
    case "long":       return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    case "unix":       return String(Math.floor(d.getTime() / 1000));
    default:           return `${Y}-${M}-${D}`;
  }
}

const FORMATS = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "long", "unix"] as const;
type Fmt = (typeof FORMATS)[number];
type Mode = "random" | "sequential";

export function DateGenerator() {
  const today = todayISO();
  const [startStr,    setStartStr]    = useState(today);
  const [endStr,      setEndStr]      = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [rawCount,    setRawCount]    = useState("10");
  const [mode,        setMode]        = useState<Mode>("random");
  const [weekdaysOnly, setWeekdaysOnly] = useState(false);
  const [fmt,         setFmt]         = useState<Fmt>("YYYY-MM-DD");
  const [output,      setOutput]      = useState<string[]>([]);
  const [copied,      setCopied]      = useState(false);

  const count = parseInt(rawCount, 10);

  const startErr = startStr && endStr && localDate(startStr) > localDate(endStr) ? "Start must be before end" : "";
  const endErr   = endStr && startStr && localDate(endStr) < localDate(startStr) ? "End must be after start" : "";
  const countErr =
    rawCount.trim() === "" ? "Required"
    : isNaN(count) || count < 1 ? "Minimum 1"
    : count > 100 ? "Maximum 100"
    : "";

  const canGenerate = startStr && endStr && !startErr && !endErr && !countErr;

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;
    const start = localDate(startStr);
    const end   = localDate(endStr);

    // Build pool of valid dates
    const pool: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const dow = cur.getDay();
      if (!weekdaysOnly || (dow !== 0 && dow !== 6)) {
        pool.push(new Date(cur));
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (pool.length === 0) { setOutput(["No dates match the criteria."]); return; }

    let dates: Date[];
    if (mode === "sequential") {
      dates = pool.slice(0, count);
    } else {
      // Random without replacement (Fisher-Yates sample)
      const n = Math.min(count, pool.length);
      const arr = [...pool];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      dates = arr.slice(0, n).sort((a, b) => a.getTime() - b.getTime());
    }

    setOutput(dates.map((d) => formatDate(d, fmt)));
    setCopied(false);
  }, [canGenerate, startStr, endStr, count, mode, weekdaysOnly, fmt]);

  const handleCopyAll = useCallback(() => {
    navigator.clipboard.writeText(output.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— start date</label>
          <input type="date" value={startStr}
            onChange={(e) => { setStartStr(e.target.value); setOutput([]); }}
            className={cn(inputCls, startErr && "border-red-500/40")} />
          {startErr && <p className={errCls}>{startErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— end date</label>
          <input type="date" value={endStr}
            onChange={(e) => { setEndStr(e.target.value); setOutput([]); }}
            className={cn(inputCls, endErr && "border-red-500/40")} />
          {endErr && <p className={errCls}>{endErr}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>— count <span className="normal-case text-foreground-muted/40">(1–100)</span></label>
          <input type="number" value={rawCount} min={1} max={100}
            onChange={(e) => { setRawCount(e.target.value); setOutput([]); }}
            className={cn(inputCls, countErr && "border-red-500/40")} />
          {countErr && <p className={errCls}>{countErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— mode</label>
          <div className="flex gap-1">
            {(["random", "sequential"] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setOutput([]); }}
                className={cn("flex-1 font-mono text-[10px] px-2 py-2.5 border transition-colors",
                  mode === m ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>— output format</label>
          <select value={fmt} onChange={(e) => { setFmt(e.target.value as Fmt); setOutput([]); }}
            className={cn(inputCls, "cursor-pointer")}>
            {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setWeekdaysOnly((v) => !v)}
          className={cn("font-mono text-[10px] px-3 py-2 border transition-colors w-full sm:w-42",
            weekdaysOnly ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
          Weekdays only (Mon–Fri)
        </button>
      </div>

      <button onClick={handleGenerate} disabled={!canGenerate}
        className={cn(
          "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
          canGenerate ? "border-foreground-muted text-foreground hover:border-primary/40 hover:text-primary" : "border-border text-foreground-muted/40 cursor-not-allowed",
        )}>
        Generate dates
      </button>

      {output.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className={labelCls}>— {output.length} date{output.length !== 1 ? "s" : ""} generated</p>
            <button onClick={handleCopyAll}
              className={cn("font-mono text-[10px] px-3 py-1 border border-border transition-colors",
                copied ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground")}>
              {copied ? "copied!" : "copy all"}
            </button>
          </div>
          <div className="border border-border divide-y divide-border max-h-80 overflow-y-auto">
            {output.map((d, i) => (
              <div key={i} className="flex items-center bg-surface hover:bg-surface-muted transition-colors">
                <span className="font-mono text-[10px] text-foreground-muted/40 px-4 py-2 w-10 border-r border-border shrink-0">{i + 1}</span>
                <span className="font-mono text-sm px-4 py-2 text-foreground/80">{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
