"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface Stop { id: string; color: string; position: number }

const DEFAULT_STOPS: Stop[] = [
  { id: "1", color: "#3b82f6", position: 0 },
  { id: "2", color: "#8b5cf6", position: 100 },
];

let uid = 3;

type GradientType = "linear" | "radial" | "conic";

function buildGradient(type: GradientType, angle: number, stops: Stop[]): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopsCSS = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");
  if (type === "linear") return `linear-gradient(${angle}deg, ${stopsCSS})`;
  if (type === "radial") return `radial-gradient(circle, ${stopsCSS})`;
  return `conic-gradient(from 0deg, ${stopsCSS})`;
}

export function GradientGenerator() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>(DEFAULT_STOPS);
  const [copied, setCopied] = useState(false);

  const gradient = buildGradient(type, angle, stops);
  const css = `background: ${gradient};`;

  const addStop = () => {
    const mid = 50;
    setStops((prev) => [
      ...prev,
      { id: String(uid++), color: "#ec4899", position: mid },
    ]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStop = (id: string, patch: Partial<Stop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const copy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const TYPES: { value: GradientType; label: string }[] = [
    { value: "linear", label: "Linear" },
    { value: "radial", label: "Radial" },
    { value: "conic",  label: "Conic" },
  ];

  return (
    <div className="space-y-5">

      {/* ── Preview ───────────────────────────────────────────────────── */}
      <div
        className="w-full h-40 border border-border transition-all duration-200"
        style={{ background: gradient }}
      />

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Left: type + angle */}
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— type</p>
            <div className="flex gap-2">
              {TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setType(value)}
                  className={cn(
                    "flex-1 font-mono text-xs px-3 py-2 border transition-colors",
                    type === value
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-surface text-foreground-muted hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {type === "linear" && (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— angle</p>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={0} max={360} value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className="flex-1 h-1.5 appearance-none bg-border cursor-pointer accent-foreground"
                />
                <span className="font-mono text-sm text-foreground w-14 text-right">{angle}°</span>
              </div>
              {/* Angle wheel (visual shortcut buttons) */}
              <div className="flex flex-wrap gap-1">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAngle(a)}
                    className={cn(
                      "font-mono text-[9px] px-2 py-0.5 border transition-colors",
                      angle === a
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-foreground-muted/50 hover:text-foreground",
                    )}
                  >
                    {a}°
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: color stops */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— color stops</p>
            <button
              onClick={addStop}
              className="font-mono text-[10px] px-2 py-1 border border-border text-foreground-muted hover:text-foreground transition-colors"
            >
              + add
            </button>
          </div>
          <div className="space-y-2">
            {stops.map((stop) => (
              <div key={stop.id} className="flex items-center gap-2">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                  className="w-8 h-8 cursor-pointer bg-transparent p-0.5"
                  title="Color"
                />
                
                <input
                  type="range" min={0} max={100} value={stop.position}
                  onChange={(e) => updateStop(stop.id, { position: parseInt(e.target.value) })}
                  className="flex-1 h-1.5 appearance-none bg-border cursor-pointer accent-foreground"
                />
                <span className="font-mono text-[11px] text-foreground-muted w-8 text-right shrink-0">
                  {stop.position}%
                </span>
                <button
                  onClick={() => removeStop(stop.id)}
                  disabled={stops.length <= 2}
                  className="font-mono text-[12px] text-foreground-muted/40 hover:text-red-400 transition-colors disabled:opacity-20 shrink-0 w-5 text-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CSS output ────────────────────────────────────────────────── */}
      <div className="border-t border-border pt-4 space-y-2">
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
        <pre className="font-mono text-xs text-foreground bg-surface-muted border border-border px-4 py-3 overflow-x-auto select-all whitespace-pre-wrap break-all">
          {css}
        </pre>
      </div>
    </div>
  );
}
