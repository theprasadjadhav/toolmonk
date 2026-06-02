"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

const CHARSETS = {
  lower: { label: "a–z lowercase", chars: "abcdefghijklmnopqrstuvwxyz" },
  upper: { label: "A–Z uppercase", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  digits: { label: "0–9 digits", chars: "0123456789" },
  symbols: { label: "!@#… symbols", chars: "!@#$%^&*()_+-=[]{}|;:,.<>?" },
  hex: { label: "0–9, a–f hex", chars: "0123456789abcdef" },
} as const;

type CharsetKey = keyof typeof CHARSETS;

export function RandomStringGenerator() {
  const [length, setLength] = useState("16");
  const [count, setCount] = useState("5");
  const [enabled, setEnabled] = useState<Record<CharsetKey, boolean>>({
    lower: true,
    upper: false,
    digits: true,
    symbols: false,
    hex: false,
  });
  const [custom, setCustom] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | "all" | null>(null);

  const len = parseInt(length, 10);
  const cnt = parseInt(count, 10);

  const lenErr =
    length === "" ? null
    : isNaN(len) || len < 1 ? "Min 1"
    : len > 512 ? "Max 512"
    : null;
  const cntErr =
    count === "" ? null
    : isNaN(cnt) || cnt < 1 ? "Min 1"
    : cnt > 100 ? "Max 100"
    : null;

  const charset =
    (Object.entries(CHARSETS) as [CharsetKey, { label: string; chars: string }][])
      .filter(([k]) => enabled[k])
      .map(([, v]) => v.chars)
      .join("") + custom;

  const hasCharset = charset.length > 0;
  const canGenerate = !lenErr && !cntErr && hasCharset && length !== "" && count !== "";

  const generate = useCallback(() => {
    if (!canGenerate) return;
    const total = len * cnt;
    const arr = new Uint32Array(total);
    crypto.getRandomValues(arr);
    const strings = Array.from({ length: cnt }, (_, i) =>
      Array.from({ length: len }, (_, j) => charset[arr[i * len + j] % charset.length]).join(""),
    );
    setResults(strings);
  }, [canGenerate, len, cnt, charset]);

  const copy = (i: number | "all") => {
    const text = i === "all" ? results.join("\n") : results[i as number];
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— length (1–512)</label>
          <input
            type="number"
            min={1}
            max={512}
            step={1}
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className={cn(inputBaseCls, lenErr && inputErrCls)}
          />
          {lenErr && <p className={errCls}>{lenErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— count (1–100)</label>
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={cn(inputBaseCls, cntErr && inputErrCls)}
          />
          {cntErr && <p className={errCls}>{cntErr}</p>}
        </div>
      </div>

      <div>
        <label className={labelCls}>— character sets</label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(CHARSETS) as [CharsetKey, { label: string; chars: string }][]).map(
            ([k, v]) => (
              <button
                key={k}
                onClick={() => setEnabled((prev) => ({ ...prev, [k]: !prev[k] }))}
                className={cn(
                  "font-mono text-[10px] px-3 py-1.5 border transition-colors",
                  enabled[k]
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}
              >
                {enabled[k] ? "✓ " : ""}
                {v.label}
              </button>
            ),
          )}
        </div>
      </div>

      <div>
        <label className={labelCls}>— custom characters (optional)</label>
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="e.g. ABC123"
          className={inputBaseCls}
        />
      </div>

      {!hasCharset && (
        <p className={errCls}>Select at least one character set or enter custom characters</p>
      )}

      <button
        onClick={generate}
        disabled={!canGenerate}
        className={cn(
          "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
          canGenerate
            ? "border-foreground-muted/40 bg-surface-muted hover:text-primary hover:border-primary/40"
            : "border-border text-foreground-muted/30 cursor-not-allowed",
        )}
      >
        Generate
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="border border-border divide-y divide-border">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-surface">
                <span className="font-mono text-sm text-foreground flex-1 break-all overflow-auto">
                  {r}
                </span>
                <button
                  onClick={() => copy(i)}
                  className={cn(
                    "font-mono text-[10px] px-3 py-1.5 border shrink-0",
                    copied === i
                      ? "text-primary border-primary/40"
                      : "text-foreground-muted/80 hover:text-foreground border-border",
                  )}
                >
                  {copied === i ? "copied!" : "copy"}
                </button>
              </div>
            ))}
          </div>
          {results.length > 1 && (
            <button
              onClick={() => copy("all")}
              className={cn(
                "w-full font-mono text-[10px] px-4 py-2 border",
                copied === "all"
                  ? "border-primary/40 text-primary"
                  : "border-border text-foreground-muted/60 hover:text-foreground",
              )}
            >
              {copied === "all" ? "copied all!" : "copy all"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
