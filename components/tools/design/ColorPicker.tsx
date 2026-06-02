"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { hexToRgb, rgbToHex, rgbToHsl } from "@/lib/utils/color";

// ── Color math ────────────────────────────────────────────────────────────────

const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ColorPicker() {
  const [hex, setHex] = useState("#3b82f6");
  const [hexInput, setHexInput] = useState("#3b82f6");
  const [history, setHistory] = useState<string[]>(["#3b82f6"]);
  const [copied, setCopied] = useState("");

  const rgb = hexToRgb(hex) ?? [0, 0, 0];
  const hsl = rgbToHsl(...(rgb as [number, number, number]));
  const hsv = rgbToHsv(...(rgb as [number, number, number]));

  const updateColor = (newHex: string) => {
    const full = newHex.toLowerCase();
    setHex(full);
    setHexInput(full);
    setHistory((prev) => [full, ...prev.filter((c) => c !== full)].slice(0, 25));
  };

  const handleHexInput = (v: string) => {
    setHexInput(v);
    const full = v.startsWith("#") ? v : "#" + v;
    if (/^#[0-9a-f]{6}$/i.test(full)) updateColor(full);
  };

  const handleRgb = (channel: number, val: number) => {
    const r = [...rgb] as [number, number, number];
    r[channel] = Math.max(0, Math.min(255, val));
    updateColor(rgbToHex(...r));
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${rgb.join(", ")})`;
  const hslStr = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
  const hsvStr = `hsv(${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%)`;

  const CHANNEL_LABELS = ["R", "G", "B"];

  return (
    <div className="space-y-6">

      {/* ── Color swatch + native picker ──────────────────────────────── */}
      <div className="flex gap-5 items-center">
        <div className="relative shrink-0 group">
          <div
            className="w-24 h-24 border border-border cursor-pointer"
            style={{ backgroundColor: hex }}
          />
          <input
            type="color"
            value={hex}
            onChange={(e) => updateColor(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Click to open color picker"
          />
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="font-mono text-[9px] uppercase tracking-widest bg-black/50 text-white px-2 py-1">
              pick
            </span>
          </span>
        </div>

        <div className="flex-1 space-y-2">
          {[
            { key: "hex", label: "HEX", value: hexStr },
            { key: "rgb", label: "RGB", value: rgbStr },
            { key: "hsl", label: "HSL", value: hslStr },
            { key: "hsv", label: "HSV", value: hsvStr },
          ].map(({ key, label, value }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 w-7 shrink-0">
                {label}
              </span>
              {key === "hex" ? (
                <input
                  value={hexInput}
                  onChange={(e) => handleHexInput(e.target.value)}
                  spellCheck={false}
                  className="flex-1 font-mono text-xs bg-surface-muted border border-border px-3 py-1.5 text-foreground outline-none focus:border-foreground-muted"
                />
              ) : (
                <span className="flex-1 font-mono text-xs bg-surface-muted border border-border px-3 py-1.5 text-foreground select-all">
                  {value}
                </span>
              )}
              <button
                onClick={() => copy(value, key)}
                className={cn(
                  "font-mono text-[10px] px-2.5 py-1.5 border shrink-0",
                  copied === key
                    ? "border-primary/40 text-primary bg-surface-muted"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}
              >
                {copied === key ? "copied!" : "copy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── RGB sliders ───────────────────────────────────────────────── */}
      <div className="space-y-3 pt-2 border-t border-border">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— rgb channels</p>
        {CHANNEL_LABELS.map((ch, i) => (
          <div key={ch} className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-foreground-muted w-3 shrink-0">{ch}</span>
            <input
              type="range"
              min={0}
              max={255}
              value={rgb[i]}
              onChange={(e) => handleRgb(i, parseInt(e.target.value))}
              className="flex-1 h-1.5 appearance-none bg-border cursor-pointer accent-foreground"
            />
            <input
              type="number"
              min={0}
              max={255}
              value={rgb[i]}
              onChange={(e) => handleRgb(i, parseInt(e.target.value) || 0)}
              className="w-14 font-mono text-xs text-center bg-surface-muted border border-border px-2 py-1 text-foreground outline-none focus:border-foreground-muted"
            />
          </div>
        ))}
      </div>

      {/* ── Contrast ratio ────────────────────────────────────────────── */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <div className="flex-1 h-12 border border-border flex items-center justify-center" style={{ backgroundColor: hex }}>
          <span className="font-mono text-[11px] font-bold" style={{ color: "#ffffff" }}>Aa</span>
        </div>
        <div className="flex-1 h-12 border border-border flex items-center justify-center" style={{ backgroundColor: hex }}>
          <span className="font-mono text-[11px] font-bold" style={{ color: "#000000" }}>Aa</span>
        </div>
        <div className="flex-1 h-12 border border-border flex items-center justify-center bg-white">
          <span className="font-mono text-[10px] text-black/50" style={{ color: hex }}>on white</span>
        </div>
        <div className="flex-1 h-12 border border-border flex items-center justify-center bg-black">
          <span className="font-mono text-[10px] text-white/50" style={{ color: hex }}>on black</span>
        </div>
      </div>

      {/* ── History ───────────────────────────────────────────────────── */}
      {history.length > 1 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— recent</p>
          <div className="flex flex-wrap gap-1.5">
            {history.map((c) => (
              <button
                key={c}
                onClick={() => updateColor(c)}
                title={c}
                className={cn(
                  "w-7 h-7 border transition-transform hover:scale-110",
                  hex === c ? "border-foreground" : "border-border",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
