"use client";

import { useState, useMemo } from "react";
import { useToolFullscreen } from "@/components/tool/ToolPanel";
import { cn } from "@/lib/utils/cn";
import { UNIT_CONFIGS } from "./unit-configs";
import { useCopyState } from "@/lib/hooks/useCopyState";

export { UNIT_CONFIGS } from "./unit-configs";

// ── Format helpers ─────────────────────────────────────────────────────────────

function fmt(v: number): string {
  if (!isFinite(v) || isNaN(v)) return "—";
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 0.0001 && abs < 1e13) return parseFloat(v.toPrecision(8)).toString();
  return v.toExponential(5);
}

function toInputStr(v: number): string {
  if (!isFinite(v) || isNaN(v)) return "";
  return parseFloat(v.toPrecision(10)).toString();
}

// ── Component ──────────────────────────────────────────────────────────────────

interface UnitConverterProps {
  slug: string;
}

export function UnitConverter({ slug }: UnitConverterProps) {
  const config = UNIT_CONFIGS[slug]!;
  const [value,      setValue]      = useState("1");
  const [fromSymbol, setFromSymbol] = useState(config.defaultSymbol);
  const { copied, copy }            = useCopyState();
  const [search,     setSearch]     = useState("");
  const fullscreen = useToolFullscreen();

  const numVal   = parseFloat(value);
  const isValid  = !isNaN(numVal);
  const fromUnit = config.units.find((u) => u.symbol === fromSymbol) ?? config.units[0];
  const baseVal  = isValid ? fromUnit.toBase(numVal) : NaN;

  const results = useMemo(() =>
    config.units.map((u) => ({
      ...u,
      result: isNaN(baseVal) ? NaN : u.fromBase(baseVal),
    })),
    [config, baseVal]
  );

  const filtered = search.trim()
    ? results.filter((r) =>
        r.label.toLowerCase().includes(search.toLowerCase()) ||
        r.symbol.toLowerCase().includes(search.toLowerCase())
      )
    : results;

  const selectUnit = (symbol: string, result: number) => {
    setFromSymbol(symbol);
    if (isFinite(result) && !isNaN(result)) setValue(toInputStr(result));
  };

  return (
    <div className={cn("space-y-5", fullscreen && "flex-1 min-h-0 flex flex-col overflow-auto")}>
      
      {/* Input */}
      <div className="shrink-0 space-y-2">
        <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— value</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full sm:flex-1 px-4 py-2.5 border border-border bg-surface font-mono text-base text-foreground focus:outline-none focus:border-foreground-muted transition-colors"
            placeholder="Enter value…"
          />
          <select
            value={fromSymbol}
            onChange={(e) => setFromSymbol(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 border border-border bg-surface font-mono text-sm text-foreground focus:outline-none focus:border-foreground-muted transition-colors cursor-pointer"
          >
            {config.units.map((u) => (
              <option key={u.symbol} value={u.symbol}>
                {u.label} ({u.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="shrink-0 space-y-2">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— results</p>
          {config.units.length > 8 && (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="filter units…"
              className="ml-auto px-3 py-1 border border-border bg-surface font-mono text-xs text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:border-foreground-muted transition-colors w-40"
            />
          )}
        </div>

        <div className="space-y-px">
          {filtered.map(({ label, symbol, result }) => {
            const isFrom    = symbol === fromSymbol;
            const formatted = fmt(result);
            return (
              <div
                key={symbol}
                onClick={() => selectUnit(symbol, result)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 border cursor-pointer transition-colors group",
                  isFrom
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-surface hover:bg-surface-muted hover:border-foreground-muted/20"
                )}
              >
                <span className={cn(
                  "font-mono text-[11px] shrink-0 w-12 text-right",
                  isFrom ? "text-primary" : "text-foreground-muted/50"
                )}>
                  {symbol}
                </span>
                <span className="font-mono text-xs text-foreground-muted flex-1 min-w-0 hidden sm:block">
                  {label}
                </span>
                <span className={cn(
                  "font-mono text-sm shrink-0 w-28 sm:w-40 text-right tabular-nums",
                  isFrom ? "text-primary font-medium" : "text-foreground"
                )}>
                  {isValid ? formatted : "—"}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); copy(symbol, formatted); }}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 font-mono text-[10px] transition-all px-2 py-0.5 border shrink-0 min-w-[3rem]",
                    copied === symbol
                      ? "border-primary/40 bg-primary/10 text-primary opacity-100"
                      : "border-border text-foreground-muted hover:text-foreground",
                  )}
                >
                  {copied === symbol ? "copied!" : "copy"}
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="font-mono text-xs text-foreground-muted/50 px-4 py-3">No units match.</p>
          )}
        </div>
        <p className="font-mono text-[9px] text-foreground-muted/40">
          Click any row to use it as the input unit.
        </p>
      </div>
    </div>
  );
}
