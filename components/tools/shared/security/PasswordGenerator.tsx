"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function getStrength(pw: string): { label: string; color: string; score: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: "Weak", color: "bg-red-400", score };
  if (score <= 4) return { label: "Fair", color: "bg-amber-400", score };
  if (score <= 5) return { label: "Good", color: "bg-yellow-400", score };
  if (score <= 6) return { label: "Strong", color: "bg-green-400", score };
  return { label: "Very Strong", color: "bg-emerald-400", score };
}

function genPassword(
  length: number,
  lower: boolean,
  upper: boolean,
  digits: boolean,
  symbols: boolean,
): string {
  let charset = "";
  if (lower) charset += LOWER;
  if (upper) charset += UPPER;
  if (digits) charset += DIGITS;
  if (symbols) charset += SYMBOLS;
  if (!charset) charset = LOWER;
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => charset[v % charset.length]).join("");
}

export function PasswordGenerator() {
  const [length, setLength] = useState("16");
  const [count, setCount] = useState("1");
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | "all" | null>(null);

  const len = parseInt(length, 10);
  const cnt = parseInt(count, 10);

  const lenErr =
    length === "" ? null
    : isNaN(len) || len < 4 ? "Min 4"
    : len > 256 ? "Max 256"
    : null;
  const cntErr =
    count === "" ? null
    : isNaN(cnt) || cnt < 1 ? "Min 1"
    : cnt > 100 ? "Max 100"
    : null;

  const noCharset = !useLower && !useUpper && !useDigits && !useSymbols;
  const canGenerate =
    !lenErr && !cntErr && !noCharset && length !== "" && count !== "";

  const generate = useCallback(() => {
    if (!canGenerate) return;
    setPasswords(
      Array.from({ length: cnt }, () =>
        genPassword(len, useLower, useUpper, useDigits, useSymbols),
      ),
    );
  }, [canGenerate, len, cnt, useLower, useUpper, useDigits, useSymbols]);

  const copy = (i: number | "all") => {
    const text = i === "all" ? passwords.join("\n") : passwords[i as number];
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  const strength = passwords.length > 0 ? getStrength(passwords[0]) : null;

  return (
    <div className="space-y-5">
      {/* Length + Count */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— length (4–256)</label>
          <input
            type="number"
            min={4}
            max={256}
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

      {/* Character sets */}
      <div>
        <label className={labelCls}>— character sets</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "a–z lowercase", active: useLower, toggle: () => setUseLower((v) => !v) },
            { label: "A–Z uppercase", active: useUpper, toggle: () => setUseUpper((v) => !v) },
            { label: "0–9 digits", active: useDigits, toggle: () => setUseDigits((v) => !v) },
            { label: "!@#… symbols", active: useSymbols, toggle: () => setUseSymbols((v) => !v) },
          ].map(({ label, active, toggle }) => (
            <button
              key={label}
              onClick={toggle}
              className={cn(
                "font-mono text-[10px] px-3 py-1.5 border transition-colors",
                active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:text-foreground",
              )}
            >
              {active ? "✓ " : ""}
              {label}
            </button>
          ))}
        </div>
        {noCharset && <p className={errCls}>Select at least one character set</p>}
      </div>

      {/* Generate */}
      <button
        onClick={generate}
        disabled={!canGenerate}
        className={cn(
          "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
          canGenerate
            ? "border-border bg-surface-muted text-foreground hover:border-primary/40 hover:text-primary"
            : "border-border text-foreground-muted/30 cursor-not-allowed",
        )}
      >
        Generate
      </button>

      {/* Results */}
      {passwords.length > 0 && (
        <div className="space-y-3">
          {strength && (
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5 flex-1">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 transition-colors",
                      i < strength.score ? strength.color : "bg-border",
                    )}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-foreground-muted/60 shrink-0">
                {strength.label}
              </span>
            </div>
          )}

          <div className="border border-border divide-y divide-border">
            {passwords.map((pw, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-surface">
                <span className="font-mono text-sm text-foreground flex-1 break-all overflow-auto">
                  {pw}
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

          {passwords.length > 1 && (
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
