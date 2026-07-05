"use client";

import { useState, useEffect, useMemo } from "react";
import { useToolFullscreen } from "@/components/tool/ToolPanel";
import { cn } from "@/lib/utils/cn";
import { CURRENCY_META, POPULAR_CODES } from "./currency-data";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

const API_URL = "https://open.er-api.com/v6/latest/USD";

type RateMap = Record<string, number>;

function fmt(v: number): string {
  if (!isFinite(v) || isNaN(v)) return "—";
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 100_000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (abs >= 1000)    return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (abs >= 1)       return parseFloat(v.toFixed(4)).toString();
  if (abs >= 0.01)    return parseFloat(v.toFixed(6)).toString();
  return v.toPrecision(4);
}

function toInputStr(v: number): string {
  if (!isFinite(v) || isNaN(v)) return "";
  return parseFloat(v.toPrecision(10)).toString();
}

export function CurrencyConverter() {
  const [rates, setRates]           = useState<RateMap | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [amount, setAmount]         = useState("1");
  const [fromCode, setFromCode]     = useState("USD");
  const [search, setSearch]         = useState("");
  const [copied, setCopied]         = useState<string | null>(null);
  const fullscreen = useToolFullscreen();

  useEffect(() => {
    fetch(API_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Network error");
        return r.json();
      })
      .then((data) => {
        if (data.result === "success") {
          setRates(data.rates as RateMap);
          setLastUpdated(data.time_last_update_utc ?? "");
        } else {
          setError("Exchange rate service returned an error.");
        }
      })
      .catch(() => setError("Could not load exchange rates. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  const numAmount = parseFloat(amount);
  const isValid = !isNaN(numAmount) && numAmount >= 0;

  // Rates are relative to USD. Convert A → B: amount * (rateB / rateA)
  const convert = (to: string): number => {
    if (!rates || !isValid) return NaN;
    const fromRate = rates[fromCode] ?? 1;
    const toRate   = rates[to]       ?? 1;
    return numAmount * (toRate / fromRate);
  };

  // Popular codes first, then alphabetical remainder
  const allCodes = useMemo(() => {
    if (!rates) return POPULAR_CODES;
    const keys    = Object.keys(rates);
    const popular = POPULAR_CODES.filter((c) => keys.includes(c));
    const rest    = keys.filter((c) => !POPULAR_CODES.includes(c)).sort();
    return [...popular, ...rest];
  }, [rates]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allCodes;
    const q = search.toLowerCase();
    return allCodes.filter((code) => {
      const meta = CURRENCY_META[code];
      return (
        code.toLowerCase().includes(q) ||
        meta?.name.toLowerCase().includes(q)
      );
    });
  }, [allCodes, search]);

  const copy = async (val: string, code: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const selectCurrency = (code: string, result: number) => {
    setFromCode(code);
    if (isFinite(result) && !isNaN(result)) setAmount(toInputStr(result));
  };

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
      })
    : "";

  return (
    <div className={cn("space-y-5", fullscreen && "flex-1 min-h-0 flex flex-col overflow-auto")}>
      
      {error && <ErrorBanner error={error} className="shrink-0" />}

      {/* Input */}
      <div className="shrink-0 space-y-2">
        <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— amount</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            className="flex-1 px-4 py-2.5 border border-border bg-surface font-mono text-base text-foreground focus:outline-none focus:border-foreground-muted transition-colors"
            placeholder="Enter amount…"
          />
          <select
            value={fromCode}
            onChange={(e) => setFromCode(e.target.value)}
            className="px-3 py-2.5 border border-border bg-surface font-mono text-sm text-foreground focus:outline-none focus:border-foreground-muted transition-colors cursor-pointer max-w-[240px]"
          >
            {allCodes.map((code) => {
              const meta = CURRENCY_META[code];
              return (
                <option key={code} value={code}>
                  {meta?.flag ?? ""} {code}{meta ? ` — ${meta.name}` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="font-mono text-xs text-foreground-muted/50 py-12 text-center">
          Loading exchange rates…
        </div>
      ) : !error && (
        <div className="shrink-0 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— results</p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="filter currencies…"
              className="ml-auto px-3 py-1 border border-border bg-surface font-mono text-xs text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:border-foreground-muted transition-colors w-44"
            />
          </div>

          <div className="space-y-px">
            {filtered.map((code) => {
              const meta      = CURRENCY_META[code];
              const result    = convert(code);
              const formatted = fmt(result);
              const isFrom    = code === fromCode;

              return (
                <div
                  key={code}
                  onClick={() => selectCurrency(code, result)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 border cursor-pointer transition-colors group",
                    isFrom
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-surface hover:bg-surface-muted hover:border-foreground-muted/20"
                  )}
                >
                  <span className="text-base shrink-0 w-6 text-center select-none leading-none">
                    {meta?.flag ?? ""}
                  </span>
                  <span className={cn(
                    "font-mono text-[11px] shrink-0 w-10",
                    isFrom ? "text-primary" : "text-foreground-muted/50"
                  )}>
                    {code}
                  </span>
                  <span className="font-mono text-xs text-foreground-muted flex-1 min-w-0 hidden sm:block truncate">
                    {meta?.name ?? code}
                  </span>
                  <span className={cn(
                    "font-mono text-sm shrink-0 text-right tabular-nums",
                    isFrom ? "text-primary font-medium" : "text-foreground"
                  )}>
                    {isValid ? formatted : "—"}
                    {meta?.symbol && (
                      <span className="text-foreground-muted/40 ml-1 text-[10px]">{meta.symbol}</span>
                    )}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); copy(formatted, code); }}
                    className="opacity-0 group-hover:opacity-100 font-mono text-[10px] text-foreground-muted hover:text-foreground transition-all px-2 py-0.5 border border-border shrink-0 min-w-[3rem]"
                  >
                    {copied === code ? "✓" : "copy"}
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="font-mono text-xs text-foreground-muted/50 px-4 py-3">No currencies match.</p>
            )}
          </div>

          <p className="font-mono text-[9px] text-foreground-muted/40 leading-relaxed">
            Click any row to use it as the base currency.
            {formattedDate && ` Rates updated ${formattedDate}.`}
            {" "}Source: open.er-api.com
          </p>
        </div>
      )}
    </div>
  );
}
