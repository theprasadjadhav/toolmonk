"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

type TokenType = "uuid-v4" | "hex" | "base64" | "base64url" | "alphanumeric";

function generateUUIDv4(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;
  const hex = Array.from(arr, (v) => v.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateToken(type: TokenType, bytes: number): string {
  if (type === "uuid-v4") return generateUUIDv4();
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  if (type === "hex") return Array.from(arr, (v) => v.toString(16).padStart(2, "0")).join("");
  if (type === "base64") return btoa(String.fromCharCode(...arr));
  if (type === "base64url")
    return btoa(String.fromCharCode(...arr))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
}

const TOKEN_TYPES: { value: TokenType; label: string; desc: string }[] = [
  { value: "uuid-v4", label: "UUID v4", desc: "8-4-4-4-12 hex format" },
  { value: "hex", label: "Hex", desc: "0–9, a–f" },
  { value: "base64", label: "Base64", desc: "A–Z, a–z, 0–9, +, /" },
  { value: "base64url", label: "Base64 URL", desc: "URL-safe variant (-, _)" },
  { value: "alphanumeric", label: "Alphanumeric", desc: "A–Z, a–z, 0–9" },
];

export function TokenGenerator() {
  const [type, setType] = useState<TokenType>("uuid-v4");
  const [bytes, setBytes] = useState("32");
  const [count, setCount] = useState("1");
  const [tokens, setTokens] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | "all" | null>(null);

  const bytesN = parseInt(bytes, 10);
  const countN = parseInt(count, 10);

  const bytesErr =
    type === "uuid-v4" ? null
    : bytes === "" ? null
    : isNaN(bytesN) || bytesN < 8 ? "Min 8 bytes"
    : bytesN > 512 ? "Max 512 bytes"
    : null;
  const countErr =
    count === "" ? null
    : isNaN(countN) || countN < 1 ? "Min 1"
    : countN > 100 ? "Max 100"
    : null;

  const canGenerate =
    !bytesErr && !countErr && count !== "" && (type === "uuid-v4" || bytes !== "");

  const generate = useCallback(() => {
    if (!canGenerate) return;
    setTokens(Array.from({ length: countN }, () => generateToken(type, bytesN)));
  }, [canGenerate, type, bytesN, countN]);

  const copy = (i: number | "all") => {
    const text = i === "all" ? tokens.join("\n") : tokens[i as number];
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Token type */}
      <div>
        <label className={labelCls}>— token type</label>
        <div className="flex flex-col gap-2">
          {TOKEN_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-2.5 text-left transition-colors border border-border",
                type === t.value ? "bg-surface-muted border-primary/40" : "bg-surface hover:bg-surface-muted/50",
              )}
            >
              
              <span className={cn("font-mono text-sm text-foreground flex-1" , type === t.value && "text-primary" )}>{t.label}</span>
              <span className={cn("font-mono text-[10px] text-foreground-muted/50" , type === t.value && "text-primary" )}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bytes + Count */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={cn(labelCls, type === "uuid-v4" && "opacity-40")}>
            — byte length (8–512)
          </label>
          <input
            type="number"
            min={8}
            max={512}
            step={8}
            value={bytes}
            disabled={type === "uuid-v4"}
            onChange={(e) => setBytes(e.target.value)}
            className={cn(
              inputBaseCls,
              bytesErr && inputErrCls,
              type === "uuid-v4" && "opacity-40 cursor-not-allowed",
            )}
          />
          {bytesErr && <p className={errCls}>{bytesErr}</p>}
          {type === "uuid-v4" && (
            <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">fixed — 16 bytes</p>
          )}
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
            className={cn(inputBaseCls, countErr && inputErrCls)}
          />
          {countErr && <p className={errCls}>{countErr}</p>}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={!canGenerate}
        className={cn(
          "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
          canGenerate
            ? "bg-surface-muted border-foreground-muted/30 hover:text-primary hover:border-primary/40"
            : "border-border text-foreground-muted/30 cursor-not-allowed",
        )}
      >
        Generate
      </button>

      {tokens.length > 0 && (
        <div className="space-y-2">
          <div className="border border-border divide-y divide-border">
            {tokens.map((t, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-surface">
                <span className="font-mono text-sm text-foreground flex-1 break-all overflow-auto">
                  {t}
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
          {tokens.length > 1 && (
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

      <p className="font-mono text-[11px] text-foreground-muted/50">
        All tokens are generated client-side using the Web Crypto API and are never sent to a
        server.
      </p>
    </div>
  );
}
