"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { hexToRgb as hexToRgbNullable } from "@/lib/utils/color";

interface Shadow {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}


let uid = 2;

const DEFAULT: Shadow[] = [
  { id: "1", x: 4, y: 4, blur: 16, spread: 0, color: "#ff0000", opacity: 0.25, inset: false },
];

const hexToRgb = (hex: string): [number, number, number] => hexToRgbNullable(hex) ?? [0, 0, 0];

function shadowCSS(s: Shadow): string {
  const [r, g, b] = hexToRgb(s.color);
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(${r},${g},${b},${s.opacity.toFixed(2)})`;
}

export function CssBoxShadowGenerator() {
  const [shadows, setShadows] = useState<Shadow[]>(DEFAULT);
  const [active, setActive] = useState("1");
  const [copied, setCopied] = useState(false);

  const shadow = shadows.find((s) => s.id === active) ?? shadows[0];
  const fullCSS = shadows.map(shadowCSS).join(",\n      ");
  const css = `box-shadow: ${fullCSS};`;

  const update = (patch: Partial<Shadow>) =>
    setShadows((prev) => prev.map((s) => (s.id === active ? { ...s, ...patch } : s)));

  const addShadow = () => {
    const id = String(uid++);
    setShadows((prev) => [
      ...prev,
      { id, x: 2, y: 8, blur: 24, spread: 0, color: "#000000", opacity: 0.15, inset: false },
    ]);
    setActive(id);
  };

  const removeShadow = (id: string) => {
    if (shadows.length <= 1) return;
    const remaining = shadows.filter((s) => s.id !== id);
    setShadows(remaining);
    if (active === id) setActive(remaining[0].id);
  };

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
          className="w-28 h-28 bg-surface border border-border/50 transition-all duration-100"
          style={{ boxShadow: shadows.map(shadowCSS).join(", ") }}
        />
      </div>

      {/* ── Shadow tabs ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {shadows.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => setActive(s.id)}
              className={cn(
                "font-mono text-[10px] px-3 py-1.5 border transition-colors",
                active === s.id
                  ? "border-foreground-muted bg-surface-muted text-foreground"
                  : "border-border text-foreground-muted hover:text-foreground",
              )}
            >
              Shadow {i + 1}
            </button>
            {shadows.length > 1 && (
              <button
                onClick={() => removeShadow(s.id)}
                className="font-mono text-[11px] text-foreground-muted/30 hover:text-red-400 px-1 transition-colors"
              >×</button>
            )}
          </div>
        ))}
        <button
          onClick={addShadow}
          className="font-mono text-[10px] px-3 py-1.5 border border-dashed border-border text-foreground-muted hover:text-foreground transition-colors"
        >
          + add
        </button>
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      {shadow && (
        <div className="space-y-3 border border-border bg-surface p-4">
          {(
            [
              { label: "X offset", min: -50, max: 50, step: 1,    value: shadow.x,       key: "x" as const,       unit: "px" },
              { label: "Y offset", min: -50, max: 50, step: 1,    value: shadow.y,       key: "y" as const,       unit: "px" },
              { label: "Blur",     min: 0,   max: 80, step: 1,    value: shadow.blur,    key: "blur" as const,    unit: "px" },
              { label: "Spread",   min: -30, max: 50, step: 1,    value: shadow.spread,  key: "spread" as const,  unit: "px" },
              { label: "Opacity",  min: 0,   max: 1,  step: 0.01, value: shadow.opacity, key: "opacity" as const, unit: "" },
            ] as const
          ).map(({ label, min, max, step, value, key, unit }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-foreground-muted/60 uppercase tracking-wider w-16 shrink-0">
                {label}
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => update({ [key]: parseFloat(e.target.value) })}
                className="flex-1 h-1.5 appearance-none bg-border cursor-pointer accent-foreground"
              />
              <div className="relative shrink-0">
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => update({ [key]: parseFloat(e.target.value) || 0 })}
                  className="w-20 font-mono text-xs bg-surface-muted border border-border pl-2 pr-6 py-1 text-foreground outline-none focus:border-foreground-muted"
                />
                {unit && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-foreground-muted/40 pointer-events-none select-none">
                    {unit}
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-1">
            <span className="font-mono text-[10px] text-foreground-muted/60 uppercase tracking-wider w-16 shrink-0">Color</span>
            <input
              type="color"
              value={shadow.color}
              onChange={(e) => update({ color: e.target.value })}
              className="w-8 h-7 cursor-pointer bg-transparent p-0.5"
            />
            <label className="flex items-center gap-2 ml-auto cursor-pointer">
              <input
                type="checkbox"
                checked={shadow.inset}
                onChange={(e) => update({ inset: e.target.checked })}
                className="accent-foreground"
              />
              <span className="font-mono text-[10px] text-foreground-muted uppercase tracking-wider">inset</span>
            </label>
          </div>
        </div>
      )}

      {/* ── CSS output ────────────────────────────────────────────────── */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— css</p>
          <button
            onClick={copy}
            className={cn(
              "font-mono text-[10px] px-3 py-1 border ",
              copied ? "border-primary/40 text-primary bg-surface-muted" : "border-border text-foreground-muted hover:text-foreground",
            )}
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>
        <pre className="font-mono text-xs text-foreground bg-surface-muted border border-border px-4 py-3 overflow-x-auto select-all whitespace-pre-wrap break-all">
          {css}
        </pre>
      </div>
    </div>
  );
}
