"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, errCls } from "@/lib/utils/formStyles";

function pad(n: number) { return String(n).padStart(2, "0"); }

function localDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addToDate(base: Date, amount: number, unit: string, op: "add" | "sub"): Date {
  const sign = op === "add" ? 1 : -1;
  const d = new Date(base);
  switch (unit) {
    case "days":   d.setDate(d.getDate() + sign * amount); break;
    case "weeks":  d.setDate(d.getDate() + sign * amount * 7); break;
    case "months": d.setMonth(d.getMonth() + sign * amount); break;
    case "years":  d.setFullYear(d.getFullYear() + sign * amount); break;
  }
  return d;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const UNITS = ["days", "weeks", "months", "years"] as const;
type Unit = (typeof UNITS)[number];

export function DateCalculator() {
  const [dateStr, setDateStr]  = useState(todayISO());
  const [op,      setOp]       = useState<"add" | "sub">("add");
  const [rawAmt,  setRawAmt]   = useState("7");
  const [unit,    setUnit]     = useState<Unit>("days");
  const [copied,  setCopied]   = useState<string | null>(null);

  const amount = parseInt(rawAmt, 10);
  const amtErr =
    rawAmt.trim() === "" ? "Required"
    : isNaN(amount) || amount < 1 ? "Minimum 1"
    : amount > 9999 ? "Maximum 9999"
    : "";

  const result = useMemo(() => {
    if (!dateStr || amtErr) return null;
    const base = localDate(dateStr);
    const res  = addToDate(base, amount, unit, op);
    const today = new Date(); today.setHours(0,0,0,0);
    const diffMs = res.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / 86_400_000);

    const Y = res.getFullYear(), M = pad(res.getMonth() + 1), D = pad(res.getDate());
    return [
      { key: "ymd",   label: "YYYY-MM-DD",        value: `${Y}-${M}-${D}`, highlight: true },
      { key: "dmy",   label: "DD/MM/YYYY",        value: `${D}/${M}/${Y}` },
      { key: "long",  label: "Long date",         value: res.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
      { key: "dow",   label: "Day of week",       value: res.toLocaleDateString("en-US", { weekday: "long" }) },
      { key: "from",  label: "From today",        value: diffDays === 0 ? "Today" : diffDays > 0 ? `in ${diffDays} day${diffDays !== 1 ? "s" : ""}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""} ago` },
    ];
  }, [dateStr, op, amount, unit, amtErr]);

  const copy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>— start date</label>
        <div className="flex gap-2">
          <input type="date" value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className={cn(inputCls, "flex-1")} />
          <button onClick={() => setDateStr(todayISO())}
            className="font-mono text-[10px] px-3 border border-border text-foreground-muted hover:text-primary hover:border-primary/40 transition-colors whitespace-nowrap shrink-0">
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Operation */}
        <div>
          <label className={labelCls}>— operation</label>
          <div className="flex gap-1">
            {(["add", "sub"] as const).map((o) => (
              <button key={o} onClick={() => setOp(o)}
                className={cn(
                  "flex-1 font-mono text-[11px] px-3 py-2.5 border transition-colors",
                  op === o ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground",
                )}>
                {o === "add" ? "+ Add" : "− Subtract"}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className={labelCls}>— amount <span className="normal-case text-foreground-muted/40">(1–9999)</span></label>
          <input type="number" value={rawAmt} min={1} max={9999}
            onChange={(e) => setRawAmt(e.target.value)}
            className={cn(inputCls, amtErr && "border-red-500/40")} />
          {amtErr && <p className={errCls}>{amtErr}</p>}
        </div>

        {/* Unit */}
        <div>
          <label className={labelCls}>— unit</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}
            className={cn(inputCls, "cursor-pointer")}>
            {UNITS.map((u) => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {result && (
        <div className="space-y-1">
          <p className={labelCls}>— result</p>
          <div className="border border-border divide-y divide-border">
            {result.map(({ key, label, value, highlight }) => (
              <div key={key} className={cn("bg-surface", highlight && "bg-surface-muted")}>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className={cn(
                    "font-mono text-[10px] uppercase tracking-wider px-4 py-2 sm:py-2.5 sm:w-44 sm:shrink-0 sm:border-r border-b sm:border-b-0 border-border",
                    highlight ? "text-primary" : "text-foreground-muted/80"
                  )}>
                    {label}
                  </span>
                  <div className="flex items-center flex-1 min-w-0">
                    <span className={cn(
                      "font-mono text-sm px-4 py-2.5 flex-1 min-w-0 break-words",
                      highlight ? "text-primary" : "text-foreground/80"
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
