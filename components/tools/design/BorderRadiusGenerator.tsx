"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Unit = "px" | "%" | "rem";

interface Corners { tl: number; tr: number; br: number; bl: number }

const DEFAULT: Corners = { tl: 12, tr: 12, br: 12, bl: 12 };

const UNIT_MAX: Record<Unit, number> = { px: 100, "%": 50, rem: 10 };

// Presets stored as px, converted on apply
const PRESETS: { label: string; px: Corners }[] = [
  { label: "None",  px: { tl: 0,   tr: 0,   br: 0,   bl: 0 } },
  { label: "Sm",    px: { tl: 4,   tr: 4,   br: 4,   bl: 4 } },
  { label: "Md",    px: { tl: 8,   tr: 8,   br: 8,   bl: 8 } },
  { label: "Lg",    px: { tl: 16,  tr: 16,  br: 16,  bl: 16 } },
  { label: "XL",    px: { tl: 24,  tr: 24,  br: 24,  bl: 24 } },
  { label: "Pill",  px: { tl: 100, tr: 100, br: 100, bl: 100 } }, // 50% / 100px / 10rem = full pill
  { label: "Top",   px: { tl: 16,  tr: 16,  br: 0,   bl: 0 } },
  { label: "Leaf",  px: { tl: 0,   tr: 48,  br: 0,   bl: 48 } },
];

function pxToUnit(px: number, unit: Unit): number {
  const max = UNIT_MAX[unit];
  if (unit === "px")  return Math.round(Math.min(px, max));
  if (unit === "%")   return Math.round(Math.min(px / 2, max));   // 100px → 50%
  return Math.round(Math.min(px / 16, max) * 10) / 10;           // 100px → 6.25rem, clamped at 10
}

function buildCSS(c: Corners, unit: Unit): string {
  const max = UNIT_MAX[unit];
  const v = (n: number) => `${Math.min(n, max)}${unit}`;
  if (c.tl === c.tr && c.tr === c.br && c.br === c.bl) return v(c.tl);
  return `${v(c.tl)} ${v(c.tr)} ${v(c.br)} ${v(c.bl)}`;
}

const CORNER_FIELDS: { key: keyof Corners; label: string }[] = [
  { key: "tl", label: "Top left" },
  { key: "tr", label: "Top right" },
  { key: "br", label: "Bot right" },
  { key: "bl", label: "Bot left" },
];

export function BorderRadiusGenerator() {
  const [corners, setCorners] = useState<Corners>(DEFAULT);
  const [linked, setLinked] = useState(true);
  const [unit, setUnit] = useState<Unit>("px");
  const [copied, setCopied] = useState(false);

  const max = UNIT_MAX[unit];

  const set = (key: keyof Corners, val: number) => {
    const clamped = Math.max(0, Math.min(max, isNaN(val) ? 0 : val));
    setCorners((prev) =>
      linked
        ? { tl: clamped, tr: clamped, br: clamped, bl: clamped }
        : { ...prev, [key]: clamped },
    );
  };

  const changeUnit = (newUnit: Unit) => {
    const newMax = UNIT_MAX[newUnit];
    setCorners((prev) => ({
      tl: Math.min(prev.tl, newMax),
      tr: Math.min(prev.tr, newMax),
      br: Math.min(prev.br, newMax),
      bl: Math.min(prev.bl, newMax),
    }));
    setUnit(newUnit);
  };

  const applyPreset = (preset: { px: Corners }) => {
    const c: Corners = {
      tl: pxToUnit(preset.px.tl, unit),
      tr: pxToUnit(preset.px.tr, unit),
      br: pxToUnit(preset.px.br, unit),
      bl: pxToUnit(preset.px.bl, unit),
    };
    const same = c.tl === c.tr && c.tr === c.br && c.br === c.bl;
    setCorners(c);
    if (!same && linked) setLinked(false);
  };

  const radius = buildCSS(corners, unit);
  const css = `border-radius: ${radius};`;

  const copy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">

      {/* ── Preview ───────────────────────────────────────────────────── */}
      <div className="w-full h-44 flex items-center justify-center bg-surface-muted border border-border">
        <div
          className="w-36 h-28 bg-foreground/10 border-2 border-foreground/20 transition-all duration-150 br-preview"
          style={{ "--br-value": radius } as React.CSSProperties}
        />
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Sliders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— corners</p>
            <button
              onClick={() => setLinked((l) => !l)}
              className={cn(
                "font-mono text-[10px] px-2 py-1 border transition-colors",
                linked
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:text-foreground",
              )}
            >
              {linked ? "linked" : "unlinked"}
            </button>
          </div>

          {CORNER_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="font-mono text-[9px] text-foreground-muted/50 uppercase tracking-wider w-16 shrink-0">
                {label}
              </span>
              <input
                type="range"
                min={0}
                max={max}
                step={unit === "rem" ? 0.5 : 1}
                value={corners[key]}
                onChange={(e) => set(key, parseFloat(e.target.value))}
                className="flex-1 h-1.5 appearance-none bg-border cursor-pointer accent-foreground"
              />
              <div className="relative shrink-0">
                <input
                  type="number"
                  min={0}
                  max={max}
                  step={unit === "rem" ? 0.5 : 1}
                  value={corners[key]}
                  onChange={(e) => set(key, parseFloat(e.target.value))}
                  className="w-20 font-mono text-xs bg-surface-muted border border-border pl-2 pr-7 py-1 text-foreground outline-none focus:border-foreground-muted"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-foreground-muted/40 pointer-events-none select-none">
                  {unit}
                </span>
              </div>
            </div>
          ))}

          {/* Unit selector */}
          <div className="flex items-center gap-2 pt-1">
            <span className="font-mono text-[10px] text-foreground-muted/50 uppercase tracking-wider w-16 shrink-0">Unit</span>
            <div className="flex gap-1">
              {(["px", "%", "rem"] as Unit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => changeUnit(u)}
                  className={cn(
                    "font-mono text-[10px] px-3 py-1 border transition-colors",
                    unit === u
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-foreground-muted hover:text-foreground",
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— presets</p>
          <div className="grid grid-cols-4 gap-1">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="font-mono text-[9px] px-2 py-1.5 border border-border bg-surface text-foreground-muted hover:text-foreground hover:border-foreground-muted/50 transition-colors text-center"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Corner diagram */}
          <div className="mt-4 relative w-32 h-24 mx-auto">
            <div
              className="absolute inset-4 bg-foreground/5 border-2 border-foreground/20 transition-all duration-150 br-preview"
              style={{ "--br-value": radius } as React.CSSProperties}
            />
            {[
              { pos: "top-0 left-0 text-left",   key: "tl" as const },
              { pos: "top-0 right-0 text-right",  key: "tr" as const },
              { pos: "bottom-0 right-0 text-right", key: "br" as const },
              { pos: "bottom-0 left-0 text-left", key: "bl" as const },
            ].map(({ pos, key }) => (
              <span
                key={key}
                className={`absolute ${pos} font-mono text-[8px] text-foreground-muted/40 leading-none`}
              >
                {corners[key]} {unit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CSS output ────────────────────────────────────────────────── */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— css</p>
          <button
            onClick={copy}
            className={cn(
              "font-mono text-[10px] px-3 py-1 border",
              copied
                ? "border-primary/40 text-primary bg-primary/10"
                : "border-border text-foreground-muted hover:text-foreground",
            )}
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>
        <pre className="font-mono text-xs text-foreground bg-surface-muted border border-border px-4 py-3 select-all">
          {css}
        </pre>
      </div>
    </div>
  );
}
