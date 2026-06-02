"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

const selectCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";

type Encoding = "hex" | "base64url" | "alphanumeric";

function toHex(arr: Uint8Array): string {
  return Array.from(arr, (v) => v.toString(16).padStart(2, "0")).join("");
}

function toBase64Url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function toAlphanumeric(arr: Uint8Array): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
}

function generateApiKey(
  bytes: number,
  encoding: Encoding,
  prefix: string,
  groupSize: number,
  separator: string,
): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);

  let raw: string;
  if (encoding === "hex") raw = toHex(arr);
  else if (encoding === "base64url") raw = toBase64Url(arr);
  else raw = toAlphanumeric(arr);

  if (groupSize > 0 && separator) {
    const groups: string[] = [];
    for (let i = 0; i < raw.length; i += groupSize) {
      groups.push(raw.slice(i, i + groupSize));
    }
    raw = groups.join(separator);
  }

  return prefix ? `${prefix}${raw}` : raw;
}

export function ApiKeyGenerator() {
  const [bytes, setBytes] = useState("32");
  const [encoding, setEncoding] = useState<Encoding>("hex");
  const [prefix, setPrefix] = useState("");
  const [groupSize, setGroupSize] = useState("0");
  const [separator, setSeparator] = useState("-");
  const [count, setCount] = useState("3");
  const [keys, setKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | "all" | null>(null);

  const bytesN = parseInt(bytes, 10);
  const groupN = parseInt(groupSize, 10);
  const countN = parseInt(count, 10);

  const bytesErr =
    bytes === "" ? null
    : isNaN(bytesN) || bytesN < 8 ? "Min 8 bytes"
    : bytesN > 256 ? "Max 256 bytes"
    : null;
  const groupErr =
    groupSize === "" ? null
    : isNaN(groupN) || groupN < 0 ? "Min 0 (no grouping)"
    : groupN > 64 ? "Max 64"
    : null;
  const countErr =
    count === "" ? null
    : isNaN(countN) || countN < 1 ? "Min 1"
    : countN > 50 ? "Max 50"
    : null;
  const prefixErr = prefix.length > 32 ? "Max 32 characters" : null;

  const canGenerate =
    !bytesErr && !groupErr && !countErr && !prefixErr && bytes !== "" && count !== "";

  const generate = useCallback(() => {
    if (!canGenerate) return;
    setKeys(
      Array.from({ length: countN }, () =>
        generateApiKey(bytesN, encoding, prefix, groupN, separator),
      ),
    );
  }, [canGenerate, bytesN, encoding, prefix, groupN, separator, countN]);

  const copy = (i: number | "all") => {
    const text = i === "all" ? keys.join("\n") : keys[i as number];
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Bytes + Count */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— byte length (8–256)</label>
          <input
            type="number"
            min={8}
            max={256}
            step={8}
            value={bytes}
            onChange={(e) => setBytes(e.target.value)}
            className={cn(inputBaseCls, bytesErr && inputErrCls)}
          />
          {bytesErr && <p className={errCls}>{bytesErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— count (1–50)</label>
          <input
            type="number"
            min={1}
            max={50}
            step={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={cn(inputBaseCls, countErr && inputErrCls)}
          />
          {countErr && <p className={errCls}>{countErr}</p>}
        </div>
      </div>

      {/* Encoding */}
      <div>
        <label className={labelCls}>— encoding</label>
        <select
          value={encoding}
          onChange={(e) => setEncoding(e.target.value as Encoding)}
          className={selectCls}
        >
          <option value="hex">Hex (0–9, a–f)</option>
          <option value="base64url">Base64 URL-safe (A–Z, a–z, 0–9, -, _)</option>
          <option value="alphanumeric">Alphanumeric (A–Z, a–z, 0–9)</option>
        </select>
      </div>

      {/* Prefix + Separator */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— prefix (optional, max 32)</label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="e.g. sk_live_"
            className={cn(inputBaseCls, prefixErr && inputErrCls)}
          />
          {prefixErr && <p className={errCls}>{prefixErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— separator (for grouping)</label>
          <input
            type="text"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            placeholder="-"
            maxLength={3}
            className={inputBaseCls}
          />
        </div>
      </div>

      {/* Group size */}
      <div>
        <label className={labelCls}>— group every N chars (0 = no grouping)</label>
        <input
          type="number"
          min={0}
          max={64}
          step={4}
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value)}
          className={cn(inputBaseCls, groupErr && inputErrCls)}
        />
        {groupErr && <p className={errCls}>{groupErr}</p>}
      </div>

      <button
        onClick={generate}
        disabled={!canGenerate}
        className={cn(
          "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border",
          canGenerate
            ? "bg-surface-muted border-foreground-muted/30 hover:text-primary hover:border-primary/40"
            : "border-border text-foreground-muted/30 cursor-not-allowed",
        )}
      >
        Generate
      </button>

      {keys.length > 0 && (
        <div className="space-y-2">
          <div className="border border-border divide-y divide-border">
            {keys.map((k, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-surface">
                <span className="font-mono text-sm text-foreground flex-1 break-all overflow-auto">
                  {k}
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
          {keys.length > 1 && (
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
        All keys are generated client-side using the Web Crypto API and are never sent to a server.
      </p>
    </div>
  );
}
