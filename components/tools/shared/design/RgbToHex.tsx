"use client";

import { useState } from "react";
import { rgbToHex, rgbToHsl } from "@/lib/utils/color";
import { CopyButton } from "@/components/ui/CopyButton";
import { useCopyState } from "@/lib/hooks/useCopyState";

interface Channel { label: string; min: number; max: number; color: string }
const CHANNELS: Channel[] = [
  { label: "R", min: 0, max: 255, color: "#ef4444" },
  { label: "G", min: 0, max: 255, color: "#22c55e" },
  { label: "B", min: 0, max: 255, color: "#3b82f6" },
  { label: "A", min: 0, max: 100, color: "#a3a3a3" },
];

export function RgbToHex() {
  const [channels, setChannels] = useState([59, 130, 246, 100]); // r,g,b,alpha%
  const { copied, copy } = useCopyState();

  const [r, g, b, a] = channels;
  const hex = rgbToHex(r, g, b);
  const hexWithAlpha = hex + Math.round((a / 100) * 255).toString(16).padStart(2, "0");
  const hsl = rgbToHsl(r, g, b);
  const alpha = (a / 100).toFixed(2);

  const set = (i: number, val: number) => {
    const next = [...channels];
    next[i] = Math.max(CHANNELS[i].min, Math.min(CHANNELS[i].max, val));
    setChannels(next);
  };

  const outputs = [
    { key: "hex",  label: "HEX",  value: hex.toUpperCase() },
    { key: "hexa", label: "HEX+A", value: hexWithAlpha.toUpperCase() },
    { key: "rgb",  label: "RGB",  value: `rgb(${r}, ${g}, ${b})` },
    { key: "rgba", label: "RGBA", value: `rgba(${r}, ${g}, ${b}, ${alpha})` },
    { key: "hsl",  label: "HSL",  value: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
  ];

  return (
    <div className="space-y-6">

      {/* ── Preview ───────────────────────────────────────────────────── */}
      <div
        className="w-full h-24 border border-border transition-all duration-100"
        style={{ backgroundColor: `rgba(${r},${g},${b},${alpha})` }}
      />

      {/* ── Sliders ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— channels</p>
        {CHANNELS.map(({ label, min, max }, i) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className="font-mono text-[11px] font-medium w-4 shrink-0"
              style={{ color: CHANNELS[i].color }}
            >
              {label}
            </span>
            <input
              type="range"
              min={min}
              max={max}
              value={channels[i]}
              onChange={(e) => set(i, parseInt(e.target.value))}
              className="flex-1 h-1.5 appearance-none bg-border cursor-pointer"
              style={{ accentColor: CHANNELS[i].color }}
            />
            <input
              type="number"
              min={min}
              max={max}
              value={channels[i]}
              onChange={(e) => set(i, parseInt(e.target.value) || 0)}
              className="w-14 font-mono text-xs text-center bg-surface-muted border border-border px-2 py-1 text-foreground outline-none focus:border-foreground-muted"
            />
          </div>
        ))}
      </div>

      {/* ── Outputs ───────────────────────────────────────────────────── */}
      <div className="space-y-2 border-t border-border pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— output</p>
        <div className="space-y-px">
          {outputs.map(({ key, label, value }) => (
            <div key={key} className="flex items-center border border-border bg-surface">
              <span className="font-mono text-[10px] text-foreground-muted/50 uppercase tracking-wider px-3 py-2.5 w-16 shrink-0 border-r border-border">
                {label}
              </span>
              <span className="font-mono text-sm text-foreground px-4 py-2.5 flex-1 select-all">
                {value}
              </span>
              <CopyButton
                copied={copied === key}
                onClick={() => copy(key, value)}
                className="border-border mr-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
