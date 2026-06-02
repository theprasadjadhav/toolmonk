"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  const r = parseFloat(n.toPrecision(12));
  const abs = Math.abs(r);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) return r.toExponential(6).replace(/\.?0+e/, "e");
  return String(r);
}

function isPerfectRoot(num: number, n: number): boolean {
  if (num < 0 || !Number.isInteger(num)) return false;
  const root = Math.round(Math.pow(num, 1 / n));
  return Math.pow(root, n) === num;
}


export function SquareRootCalculator() {
  const [num, setNum] = useState("");
  const [root, setRoot] = useState("2");
  const [copied, setCopied] = useState(false);

  const n = parseFloat(num);
  const r = parseFloat(root) || 2;

  const rootErr =
    root !== "" && (isNaN(parseFloat(root)) || parseFloat(root) <= 0)
      ? "Root must be > 0"
      : null;
  const numErr =
    num !== "" && !isNaN(n) && n < 0 && r % 2 === 0
      ? "Even root of a negative number is not real"
      : null;

  const valid = !isNaN(n) && !isNaN(r) && r > 0 && !rootErr && !numErr;
  const result = valid ? Math.pow(n, 1 / r) : NaN;
  const resultStr = valid ? fmt(result) : "—";

  const perfect = valid && isPerfectRoot(n, r);

  // Symbol for display
  const rootSymbol = r === 2 ? "√" : r === 3 ? "∛" : `ⁿ√`;
  const rootPrefix = r !== 2 && r !== 3 ? `${r}` : "";

  const copy = () => {
    navigator.clipboard.writeText(resultStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">

      {/* Inputs */}
      <div className="flex justify-center gap-4">
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— root (n)</label>
          <input
            type="number"
            value={root}
            onChange={(e) => setRoot(e.target.value)}
            min="1"
            step="1"
            placeholder="2"
            className={cn("w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted", rootErr && "border-red-400/60 focus:border-red-400")}
          />
          {rootErr && <p className="font-mono text-[10px] text-red-500/70 mt-1">{rootErr}</p>}
        </div>
        <span className="space-y-1.5 self-center pt-6">
          √
        </span>

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— number</label>
          <input
            type="number"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            placeholder="e.g. 144"
            className={cn("w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted", numErr && "border-red-400/60 focus:border-red-400")}
          />
          {numErr && <p className="font-mono text-[10px] text-red-500/70 mt-1">{numErr}</p>}
        </div>
      </div>


      {/* Visual expression + result */}
      {valid && (
        <div className="flex items-center justify-center gap-2 py-3">
          <span className="font-mono text-foreground-muted text-xl">{rootPrefix}{rootSymbol}</span>
          <span className="font-mono text-3xl text-foreground">{num}</span>
          <span className="font-mono text-2xl text-foreground-muted mx-1">=</span>
          <span className={cn("font-mono text-3xl", perfect ? "text-primary" : "text-foreground")}>
            {resultStr}
          </span>
          {perfect && (
            <span className="font-mono text-[10px] text-primary border border-primary/40 px-1.5 py-0.5 ml-1">
              perfect
            </span>
          )}

          <button
            onClick={copy}
            disabled={!valid}
            className={cn(
              "font-mono text-[10px] px-3 py-1.5 border  shrink-0",
              copied ? "text-primary border-primary/40 bg-primary/10" : "text-foreground-muted/80 hover:text-foreground disabled:opacity-20",
            )}
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>
      )}

    </div>
  );
}
