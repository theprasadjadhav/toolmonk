"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

function cryptoFloat(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / 0x100000000;
}

export function RandomNumberGenerator() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [decimals, setDecimals] = useState("0");
  const [unique, setUnique] = useState(false);
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const minN = parseFloat(min);
  const maxN = parseFloat(max);
  const countN = parseInt(count, 10);
  const decN = parseInt(decimals, 10);

  const minErr =
    min === "" ? null : isNaN(minN) ? "Must be a number" : null;
  const maxErr =
    max === "" ? null
    : isNaN(maxN) ? "Must be a number"
    : !isNaN(minN) && maxN <= minN ? "Max must be > min"
    : null;
  const countErr =
    count === "" ? null
    : isNaN(countN) || countN < 1 ? "Min 1"
    : countN > 1000 ? "Max 1000"
    : null;
  const decErr =
    decimals === "" ? null
    : isNaN(decN) || decN < 0 ? "Min 0"
    : decN > 10 ? "Max 10"
    : null;

  const uniqueErr =
    unique &&
    decN === 0 &&
    !isNaN(countN) &&
    !isNaN(minN) &&
    !isNaN(maxN) &&
    countN > Math.floor(maxN) - Math.ceil(minN) + 1
      ? `Cannot generate ${countN} unique integers in [${min}, ${max}]`
      : null;

  const canGenerate =
    !minErr && !maxErr && !countErr && !decErr && !uniqueErr &&
    min !== "" && max !== "" && count !== "" && decimals !== "";

  const generate = useCallback(() => {
    if (!canGenerate) return;

    let nums: number[];

    if (unique && decN === 0) {
      const lo = Math.ceil(minN);
      const hi = Math.floor(maxN);
      const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
      for (let i = pool.length - 1; i > 0; i--) {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        const j = arr[0] % (i + 1);
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      nums = pool.slice(0, countN);
    } else {
      nums = Array.from({ length: countN }, () => {
        const v = minN + cryptoFloat() * (maxN - minN);
        return decN === 0 ? Math.floor(v) : parseFloat(v.toFixed(decN));
      });
    }

    if (sortOrder === "asc") nums.sort((a, b) => a - b);
    if (sortOrder === "desc") nums.sort((a, b) => b - a);

    setResults(nums.map((n) => n.toFixed(decN)));
  }, [canGenerate, minN, maxN, countN, decN, unique, sortOrder]);

  const copy = () => {
    navigator.clipboard.writeText(results.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— minimum</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className={cn(inputBaseCls, minErr && inputErrCls)}
          />
          {minErr && <p className={errCls}>{minErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— maximum</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className={cn(inputBaseCls, maxErr && inputErrCls)}
          />
          {maxErr && <p className={errCls}>{maxErr}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— count (1–1000)</label>
          <input
            type="number"
            min={1}
            max={1000}
            step={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={cn(inputBaseCls, countErr && inputErrCls)}
          />
          {countErr && <p className={errCls}>{countErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— decimal places (0–10)</label>
          <input
            type="number"
            min={0}
            max={10}
            step={1}
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            className={cn(inputBaseCls, decErr && inputErrCls)}
          />
          {decErr && <p className={errCls}>{decErr}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setUnique((v) => !v)}
          className={cn(
            "font-mono text-[10px] px-3 py-1.5 border transition-colors",
            unique
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-foreground-muted hover:text-foreground",
          )}
        >
          {unique ? "✓ " : ""}unique numbers
        </button>
        {(["none", "asc", "desc"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortOrder(s)}
            className={cn(
              "font-mono text-[10px] px-3 py-1.5 border transition-colors",
              sortOrder === s
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:text-foreground",
            )}
          >
            sort: {s === "none" ? "off" : s}
          </button>
        ))}
      </div>

      {uniqueErr && <p className={errCls}>{uniqueErr}</p>}

      <button
        onClick={generate}
        disabled={!canGenerate}
        className={cn(
          "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border",
          canGenerate
            ? "bg-surface-muted hover:text-primary border-foreground-muted/40 hover:border-primary/40"
            : "border-border text-foreground-muted/30 cursor-not-allowed",
        )}
      >
        Generate
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.length === 1 ? (
            <div className="border border-border bg-surface-muted px-5 py-4">
              <p className={labelCls}>— result</p>
              <p className="font-mono text-4xl text-foreground">{results[0]}</p>
            </div>
          ) : (
            <div className="border border-border divide-y divide-border max-h-64 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="flex items-center px-4 py-2 bg-surface">
                  <span className="font-mono text-[10px] text-foreground-muted/40 w-8 shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-mono text-sm text-foreground">{r}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={copy}
            className={cn(
              "w-full font-mono text-[10px] px-4 py-2 border",
              copied
                ? "border-primary/40 text-primary"
                : "border-border text-foreground-muted/60 hover:text-foreground",
            )}
          >
            {copied ? "copied!" : results.length > 1 ? "copy all" : "copy"}
          </button>
        </div>
      )}
    </div>
  );
}
