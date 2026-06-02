"use client";

import { useState } from "react";
import { hexToRgb, rgbToHsl } from "@/lib/utils/color";
import { CopyButton } from "@/components/ui/CopyButton";
import { useCopyState } from "@/lib/hooks/useCopyState";

export function HexToRgb() {
  const [hex, setHex] = useState("");
  const { copied, copy } = useCopyState();

  const normalized = /^#?[0-9a-f]{3}$/i.test(hex.trim())
    ? "#" + hex.trim().replace("#", "").split("").map((c) => c + c).join("")
    : hex.trim().startsWith("#") ? hex.trim() : "#" + hex.trim();

  const rgb = hexToRgb(normalized);
  const hsl = rgb ? rgbToHsl(...rgb) : null;

  const outputs = rgb && hsl
    ? [
        { key: "rgb",  label: "RGB",  value: `rgb(${rgb.join(", ")})` },
        { key: "rgba", label: "RGBA", value: `rgba(${rgb.join(", ")}, 1)` },
        { key: "hsl",  label: "HSL",  value: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
        { key: "r",    label: "R",    value: String(rgb[0]) },
        { key: "g",    label: "G",    value: String(rgb[1]) },
        { key: "b",    label: "B",    value: String(rgb[2]) },
      ]
    : [
        { key: "rgb",  label: "RGB",  value: `rgb(-, -, -)` },
        { key: "rgba", label: "RGBA", value: `rgba(-, -, -, -)` },
        { key: "hsl",  label: "HSL",  value: `hsl(-, -%, -%)` },
        { key: "r",    label: "R",    value: "-" },
        { key: "g",    label: "G",    value: "-" },
        { key: "b",    label: "B",    value: "-" },
      ];

  return (
    <div className="space-y-6">

      {/* ── Input ─────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— hex color</p>
        <div className="flex gap-3 items-center">
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            placeholder="#3b82f6"
            spellCheck={false}
            className="flex-1 font-mono text-sm bg-surface-muted border border-border px-4 py-3 text-foreground outline-none focus:border-foreground-muted placeholder:text-foreground-muted/30"
          />
          {rgb && (
            <div
              className="w-14 h-12 border border-border shrink-0"
              style={{ backgroundColor: normalized }}
            />
          )}
        </div>
        {hex && !rgb && (
          <p className="font-mono text-[11px] text-amber-500">invalid hex — use 3 or 6 hex digits</p>
        )}
      </div>

      {/* ── Outputs ───────────────────────────────────────────────────── */}
      {outputs.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— converted values</p>
          <div className="space-y-px">
            {outputs.map(({ key, label, value }) => (
              <div key={key} className="flex items-center gap-0 border border-border bg-surface">
                <span className="font-mono text-[10px] text-foreground-muted/50 uppercase tracking-wider px-3 py-3 w-14 shrink-0 border-r border-border">
                  {label}
                </span>
                <span className="font-mono text-sm text-foreground px-4 py-3 flex-1 select-all">
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
      )}

      {/* ── Color info ────────────────────────────────────────────────── */}
      {rgb && hsl && (
        <div className="grid grid-cols-3 gap-px border border-border bg-border">
          {[
            { label: "Hue", value: `${hsl[0]}°` },
            { label: "Saturation", value: `${hsl[1]}%` },
            { label: "Lightness", value: `${hsl[2]}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface px-4 py-3 text-center">
              <p className="font-mono text-[9px] text-foreground-muted/40 uppercase tracking-widest">{label}</p>
              <p className="font-mono text-lg text-foreground mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
