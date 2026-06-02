"use client";

import { useState, useEffect } from "react";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

// ── Cron utilities ─────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function matchPart(value: number, part: string): boolean {
  if (part === "*") return true;
  for (const seg of part.split(",")) {
    if (seg === "*") return true;
    if (seg.startsWith("*/")) {
      const step = parseInt(seg.slice(2));
      if (!isNaN(step) && step > 0 && value % step === 0) return true;
    } else if (seg.includes("/")) {
      const [range, stepStr] = seg.split("/");
      const step = parseInt(stepStr);
      if (range.includes("-")) {
        const [lo, hi] = range.split("-").map(Number);
        if (value >= lo && value <= hi && (value - lo) % step === 0) return true;
      }
    } else if (seg.includes("-")) {
      const [lo, hi] = seg.split("-").map(Number);
      if (value >= lo && value <= hi) return true;
    } else {
      if (parseInt(seg) === value) return true;
    }
  }
  return false;
}

function isMatch(d: Date, parts: string[]): boolean {
  const [min, hour, dom, month, dow] = parts;
  return (
    matchPart(d.getMinutes(), min) &&
    matchPart(d.getHours(), hour) &&
    matchPart(d.getDate(), dom) &&
    matchPart(d.getMonth() + 1, month) &&
    matchPart(d.getDay(), dow)
  );
}

function nextRuns(expr: string, count = 8): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const results: Date[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  for (let i = 0; i < 527040 && results.length < count; i++) {
    if (isMatch(cursor, parts)) results.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return results;
}

function describe(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid — expected 5 fields (minute hour day month weekday)";
  const [min, hour, dom, month, dow] = parts;
  if (expr.trim() === "* * * * *") return "Every minute";
  if (expr.trim() === "0 * * * *") return "Every hour, on the hour";
  if (expr.trim() === "0 0 * * *") return "Daily at midnight (00:00)";
  if (expr.trim() === "0 12 * * *") return "Daily at noon (12:00)";
  if (expr.trim() === "0 0 * * 0") return "Every Sunday at midnight";
  if (expr.trim() === "0 0 1 * *") return "Monthly on the 1st at midnight";
  if (expr.trim() === "0 0 1 1 *") return "Annually on Jan 1st at midnight";
  if (expr.trim() === "0 9 * * 1-5") return "Weekdays (Mon–Fri) at 9:00 AM";

  const fmtPart = (part: string, unit: string, names?: string[]): string => {
    if (part === "*") return `every ${unit}`;
    if (part.startsWith("*/")) return `every ${part.slice(2)} ${unit}s`;
    const segs = part.split(",").map((seg) => {
      if (seg.includes("-")) {
        const [a, b] = seg.split("-");
        return `${names?.[+a] ?? a}–${names?.[+b] ?? b}`;
      }
      return names?.[+seg] ?? seg;
    });
    return `${unit} ${segs.join(", ")}`;
  };

  const d: string[] = [];
  d.push(fmtPart(min, "minute"));
  d.push(fmtPart(hour, "hour"));
  if (dom !== "*") d.push(fmtPart(dom, "day of month"));
  if (month !== "*") d.push(fmtPart(month, "month", ["", ...MONTH_NAMES]));
  if (dow !== "*") d.push(fmtPart(dow, "weekday", DAY_NAMES));
  return d.join(", ");
}

// ── Presets ────────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Every minute", expr: "* * * * *" },
  { label: "Every hour", expr: "0 * * * *" },
  { label: "Daily midnight", expr: "0 0 * * *" },
  { label: "Daily noon", expr: "0 12 * * *" },
  { label: "Weekdays 9am", expr: "0 9 * * 1-5" },
  { label: "Every 5 min", expr: "*/5 * * * *" },
  { label: "Weekly Sunday", expr: "0 0 * * 0" },
  { label: "Monthly 1st", expr: "0 0 1 * *" },
] as const;

// ── Field editors ──────────────────────────────────────────────────────────────

const FIELDS = [
  { key: "min", label: "Minute", hint: "0–59", placeholder: "0", },
  { key: "hour", label: "Hour", hint: "0–23", placeholder: "*", },
  { key: "dom", label: "Day of Month", hint: "1–31", placeholder: "*", },
  { key: "month", label: "Month", hint: "1–12", placeholder: "*", },
  { key: "dow", label: "Weekday", hint: "0–6", placeholder: "*", },
] as const;

type FieldKey = "min" | "hour" | "dom" | "month" | "dow";

function exprToFields(expr: string): Record<FieldKey, string> {
  const p = expr.trim().split(/\s+/);
  return { min: p[0] ?? "*", hour: p[1] ?? "*", dom: p[2] ?? "*", month: p[3] ?? "*", dow: p[4] ?? "*" };
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function CronGenerator() {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const [fields, setFields] = useState<Record<FieldKey, string>>(exprToFields("0 9 * * 1-5"));
  const [runs, setRuns] = useState<Date[]>([]);
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const description = describe(expr);
  const isValid = expr.trim().split(/\s+/).length === 5;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isValid) { setRuns([]); return; }
    setRuns(nextRuns(expr, 8));
  }, [expr, isValid]);

  const applyExpr = (e: string) => {
    setExpr(e);
    setFields(exprToFields(e));
  };

  const handleFieldChange = (key: FieldKey, val: string) => {
    const next = { ...fields, [key]: val };
    setFields(next);
    setExpr(`${next.min} ${next.hour} ${next.dom} ${next.month} ${next.dow}`);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(expr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!runs.length) return;
    const text = runs.map((d, i) => `${i + 1}. ${d.toLocaleString()}`).join("\n");
    downloadText(text, "cron-schedule.txt");
  };

  return (
    <div className={cn("space-y-5", fullscreen && "h-full flex flex-col overflow-auto")}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarButton icon={<Icons.Copy />} label="copy" feedback="copied!" showFeedback={copied} onClick={copy} disabled={!expr.trim()} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {/* Presets */}
      <div className="shrink-0 space-y-2">
        <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— presets</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(({ label, expr: e }) => (
            <button key={e} onClick={() => applyExpr(e)}
              className={cn(
                "px-3 py-1 font-mono text-[11px] border transition-colors",
                expr.trim() === e
                  ? "border-primary/40 text-primary bg-primary/10"
                  : "border-border text-foreground-muted hover:border-foreground-muted hover:text-foreground"
              )}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Expression input */}
      <div className="shrink-0 space-y-2">
        <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— expression</p>
        <input value={expr} onChange={(e) => applyExpr(e.target.value)}
          spellCheck={false}
          className="w-full px-4 py-2.5 border border-border bg-surface font-mono text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-foreground-muted transition-colors tracking-widest" />

        <div className={cn(
          "px-4 py-2.5 border font-mono text-xs",
          isValid ? "border-green-500/20 bg-green-500/5 text-green-400" : "border-red-500/20 bg-red-500/5 text-red-400"
        )}>
          {description}
        </div>
      </div>

      
      {/* Field editors */}
      <div className="shrink-0 space-y-2">
        <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— fields</p>
        <div className="grid grid-cols-5 gap-2">
          {FIELDS.map(({ key, label, hint, placeholder }) => (
            <div key={key} className="space-y-1.5 border border-border bg-surface-muted p-2.5">
              <div className="flex items-center justify-between gap-1">
                <p className="font-mono text-[10px] text-foreground-muted uppercase tracking-wider">{label}</p>
                <span className="font-mono text-[9px] text-foreground-muted/40">{hint}</span>
              </div>
              <input
                value={fields[key]}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                placeholder={placeholder}
                spellCheck={false}
                className="w-full px-2 py-1.5 border border-border bg-surface font-mono text-sm text-foreground text-center focus:outline-none focus:border-foreground-muted transition-colors"
              />
            </div>
          ))}
        </div>

         {/* Syntax cheatsheet */}
      <div className="shrink-0 flex flex-wrap gap-x-4 gap-y-1 mx-2">
        {[
          { sym: "*",    meaning: "every value" },
          { sym: "*/5",  meaning: "every 5 units" },
          { sym: "1-5",  meaning: "range 1 through 5" },
          { sym: "1,15", meaning: "1st and 15th" },
        ].map(({ sym, meaning }) => (
          <span key={sym} className="font-mono text-[10px] text-foreground-muted/60">
            <span className="text-primary">{sym}</span>{" — "}{meaning}
          </span>
        ))}
      </div>
      </div>

      {/* Next runs */}
      {runs.length > 0 && (
        <div className="shrink-0 space-y-2">
          <PanelLabel actions={<PanelButton icon={<Icons.Download />} title="Download schedule" onClick={handleDownload} />}>— next scheduled runs</PanelLabel>
          <div className="space-y-1">
            {runs.map((d, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-2.5 border border-border bg-surface">
                <span className="font-mono text-[10px] text-foreground-muted/50 w-5 shrink-0">{i + 1}</span>
                <span className="font-mono text-xs text-foreground">
                  {d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                </span>
                <span className="font-mono text-xs text-foreground-muted ml-auto">
                  {d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
