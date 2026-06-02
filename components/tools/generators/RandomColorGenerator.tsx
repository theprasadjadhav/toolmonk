"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, inputErrCls, errCls } from "@/lib/utils/formStyles";

type Format = "hex" | "rgb" | "hsl";

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return [f(0), f(8), f(4)];
}

function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function formatColor(c: HSL, fmt: Format): string {
  if (fmt === "hsl") return `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
  if (fmt === "hex") return hslToHex(c.h, c.s, c.l);
  const [r, g, b] = hslToRgb(c.h, c.s, c.l);
  return `rgb(${r}, ${g}, ${b})`;
}

function cryptoInt(min: number, max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return Math.floor(min + (arr[0] / 0x100000000) * (max - min + 1));
}

export function RandomColorGenerator() {
  const [count, setCount] = useState("6");
  const [format, setFormat] = useState<Format>("hex");
  const [hueMin, setHueMin] = useState("0");
  const [hueMax, setHueMax] = useState("360");
  const [satMin, setSatMin] = useState("40");
  const [satMax, setSatMax] = useState("90");
  const [lightMin, setLightMin] = useState("30");
  const [lightMax, setLightMax] = useState("70");
  const [colors, setColors] = useState<HSL[]>([]);
  const [copied, setCopied] = useState<number | "all" | null>(null);

  const cntN = parseInt(count, 10);
  const hMinN = parseInt(hueMin, 10);
  const hMaxN = parseInt(hueMax, 10);
  const sMinN = parseInt(satMin, 10);
  const sMaxN = parseInt(satMax, 10);
  const lMinN = parseInt(lightMin, 10);
  const lMaxN = parseInt(lightMax, 10);

  const cntErr =
    count === "" ? null
    : isNaN(cntN) || cntN < 1 ? "Min 1"
    : cntN > 100 ? "Max 100"
    : null;
  const hueErr =
    hueMin !== "" && hueMax !== "" && (hMinN < 0 || hMaxN > 360 || hMinN > hMaxN)
      ? "Hue range 0–360, min ≤ max"
      : null;
  const satErr =
    satMin !== "" && satMax !== "" && (sMinN < 0 || sMaxN > 100 || sMinN > sMaxN)
      ? "Saturation range 0–100, min ≤ max"
      : null;
  const lightErr =
    lightMin !== "" && lightMax !== "" && (lMinN < 0 || lMaxN > 100 || lMinN > lMaxN)
      ? "Lightness range 0–100, min ≤ max"
      : null;

  const canGenerate = !cntErr && !hueErr && !satErr && !lightErr && count !== "";

  const generate = useCallback(() => {
    if (!canGenerate) return;
    setColors(
      Array.from({ length: cntN }, () => ({
        h: cryptoInt(hMinN, hMaxN),
        s: cryptoInt(sMinN, sMaxN),
        l: cryptoInt(lMinN, lMaxN),
      })),
    );
  }, [canGenerate, cntN, hMinN, hMaxN, sMinN, sMaxN, lMinN, lMaxN]);

  const copy = (i: number | "all") => {
    const text =
      i === "all"
        ? colors.map((c) => formatColor(c, format)).join("\n")
        : formatColor(colors[i as number], format);
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Count + Format */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>— count (1–100)</label>
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={cn(inputCls, cntErr && inputErrCls)}
          />
          {cntErr && <p className={errCls}>{cntErr}</p>}
        </div>
        <div>
          <label className={labelCls}>— output format</label>
          <div className="flex gap-2 h-[42px]">
            {(["hex", "rgb", "hsl"] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  "flex-1 font-mono text-[10px] border transition-colors uppercase",
                  format === f
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hue range */}
      <div>
        <label className={labelCls}>— hue range (0–360)</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min={0}
            max={360}
            placeholder="min"
            value={hueMin}
            onChange={(e) => setHueMin(e.target.value)}
            className={cn(inputCls, hueErr && inputErrCls)}
          />
          <input
            type="number"
            min={0}
            max={360}
            placeholder="max"
            value={hueMax}
            onChange={(e) => setHueMax(e.target.value)}
            className={cn(inputCls, hueErr && inputErrCls)}
          />
        </div>
        {hueErr && <p className={errCls}>{hueErr}</p>}
      </div>

      {/* Saturation range */}
      <div>
        <label className={labelCls}>— saturation % (0–100)</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min={0}
            max={100}
            placeholder="min"
            value={satMin}
            onChange={(e) => setSatMin(e.target.value)}
            className={cn(inputCls, satErr && inputErrCls)}
          />
          <input
            type="number"
            min={0}
            max={100}
            placeholder="max"
            value={satMax}
            onChange={(e) => setSatMax(e.target.value)}
            className={cn(inputCls, satErr && inputErrCls)}
          />
        </div>
        {satErr && <p className={errCls}>{satErr}</p>}
      </div>

      {/* Lightness range */}
      <div>
        <label className={labelCls}>— lightness % (0–100)</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min={0}
            max={100}
            placeholder="min"
            value={lightMin}
            onChange={(e) => setLightMin(e.target.value)}
            className={cn(inputCls, lightErr && inputErrCls)}
          />
          <input
            type="number"
            min={0}
            max={100}
            placeholder="max"
            value={lightMax}
            onChange={(e) => setLightMax(e.target.value)}
            className={cn(inputCls, lightErr && inputErrCls)}
          />
        </div>
        {lightErr && <p className={errCls}>{lightErr}</p>}
      </div>

      <button
        onClick={generate}
        disabled={!canGenerate}
        className={cn(
          "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
          canGenerate
            ? " bg-surface-muted border-foreground-muted/30 hover:text-primary hover:border-primary/40"
            : "border-border text-foreground-muted/30 cursor-not-allowed",
        )}
      >
        Generate
      </button>

      {colors.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {colors.map((c, i) => {
              const hex = hslToHex(c.h, c.s, c.l);
              const label = formatColor(c, format);
              return (
                <button
                  key={i}
                  onClick={() => copy(i)}
                  className="group border border-border overflow-hidden text-left transition-opacity hover:opacity-90"
                >
                  <div className="h-16 w-full" style={{ backgroundColor: hex }} />
                  <div className="bg-surface px-2.5 py-1.5 flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] text-foreground truncate">{label}</span>
                    <span className="font-mono text-[9px] text-foreground-muted/95 shrink-0">
                      {copied === i ? "copied!" : "copy"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => copy("all")}
            className={cn(
              "w-full font-mono text-[10px] px-4 py-2 border",
              copied === "all"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-foreground-muted/60 hover:text-foreground",
            )}
          >
            {copied === "all" ? "copied all!" : "copy all"}
          </button>
        </div>
      )}
    </div>
  );
}
