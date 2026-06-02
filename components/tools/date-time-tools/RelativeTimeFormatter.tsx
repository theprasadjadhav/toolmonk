"use client";

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls } from "@/lib/utils/formStyles";

function pad(n: number) { return String(n).padStart(2, "0"); }

function nowLocalISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getRelativeTime(target: Date, now: Date): { relative: string; breakdown: string } {
  const diffMs = target.getTime() - now.getTime();
  const absSec = Math.abs(diffMs) / 1000;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  let relative: string;
  if (absSec < 60)         relative = rtf.format(Math.round(diffMs / 1000),         "second");
  else if (absSec < 3600)  relative = rtf.format(Math.round(diffMs / 60000),        "minute");
  else if (absSec < 86400) relative = rtf.format(Math.round(diffMs / 3600000),      "hour");
  else if (absSec < 2592000) relative = rtf.format(Math.round(diffMs / 86400000),   "day");
  else if (absSec < 31536000) relative = rtf.format(Math.round(diffMs / 2592000),   "month");
  else                       relative = rtf.format(Math.round(diffMs / 31536000),   "year");

  // Detailed breakdown
  const totalSec  = Math.floor(absSec);
  const years     = Math.floor(totalSec / 31536000);
  const months    = Math.floor((totalSec % 31536000) / 2592000);
  const days      = Math.floor((totalSec % 2592000)  / 86400);
  const hours     = Math.floor((totalSec % 86400)    / 3600);
  const minutes   = Math.floor((totalSec % 3600)     / 60);
  const seconds   = totalSec % 60;

  const parts: string[] = [];
  if (years)   parts.push(`${years}y`);
  if (months)  parts.push(`${months}mo`);
  if (days)    parts.push(`${days}d`);
  if (hours)   parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || !parts.length) parts.push(`${seconds}s`);

  const dir = diffMs < 0 ? "ago" : "from now";
  const breakdown = `${parts.join(" ")} ${dir}`;

  return { relative, breakdown };
}

export function RelativeTimeFormatter() {
  const [dtStr,     setDtStr]     = useState(nowLocalISO());
  const [now,       setNow]       = useState(() => new Date());
  const [copied,    setCopied]    = useState<string | null>(null);

  // Update "now" every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  const result = useMemo(() => {
    if (!dtStr) return null;
    const target = new Date(dtStr);
    if (isNaN(target.getTime())) return null;
    const { relative, breakdown } = getRelativeTime(target, now);
    const diffMs = target.getTime() - now.getTime();
    const absSec = Math.floor(Math.abs(diffMs) / 1000);
    return [
      { key: "relative",  label: "Relative",      value: relative,     highlight: true },
      { key: "exact",     label: "Exact breakdown",value: breakdown },
      { key: "target",    label: "Input date",    value: target.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }) },
      { key: "reference", label: "Reference (now)", value: now.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }) },
      { key: "diffsec",   label: "Total seconds",  value: absSec.toLocaleString("en-US") },
    ];
  }, [dtStr, now]);

  const copy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className={labelCls}>— date &amp; time to convert</label>
          <input type="datetime-local" value={dtStr}
            onChange={(e) => { setDtStr(e.target.value); setCopied(null); }}
            className={inputCls} />
        </div>
        <button onClick={() => { setDtStr(nowLocalISO()); setNow(new Date()); }}
          className="font-mono text-[10px] px-3 py-3 border border-border text-foreground-muted hover:text-primary hover:border-primary/40 transition-colors whitespace-nowrap shrink-0">
          Use now
        </button>
      </div>

      <p className="font-mono text-[10px] text-foreground-muted/40">
        Relative expressions update automatically every second.
      </p>

      {result && (
        <div className="space-y-1">
          <p className={labelCls}>— results</p>
          <div className="border border-border divide-y divide-border">
            {result.map(({ key, label, value, highlight }) => (
              <div key={key} className={cn("bg-surface", highlight && "bg-surface-muted")}>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className={cn(
                    "font-mono text-[10px] uppercase tracking-wider px-4 py-2 sm:py-2.5 sm:w-48 sm:shrink-0 sm:border-r border-b sm:border-b-0 border-border",
                    highlight ? "text-primary" : "text-foreground-muted/80"
                  )}>
                    {label}
                  </span>
                  <div className="flex items-center flex-1 min-w-0">
                    <span className={cn(
                      "font-mono px-4 py-2.5 flex-1 min-w-0 break-words",
                      highlight ? "text-lg sm:text-xl text-primary" : "text-sm text-foreground/80"
                    )}>
                      {value}
                    </span>
                    <button onClick={() => copy(key, value)}
                      className={cn(
                        "font-mono text-[10px] px-3 py-1.5 border mx-2 border-border shrink-0",
                        copied === key ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground"
                      )}>
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
