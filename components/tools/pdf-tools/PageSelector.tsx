"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface PageSelectorProps {
  thumbnails: string[];
  selected: Set<number>; // 0-indexed page numbers
  onChange: (next: Set<number>) => void;
  label?: string;
  maxHeight?: number;
}

export function PageSelector({
  thumbnails,
  selected,
  onChange,
  label,
  maxHeight = 300,
}: PageSelectorProps) {
  const [lastClicked, setLastClicked] = useState<number | null>(null);

  const toggle = useCallback(
    (idx: number, shift: boolean) => {
      const next = new Set(selected);
      if (shift && lastClicked !== null) {
        // Range select: fill from lastClicked to idx
        const lo = Math.min(lastClicked, idx);
        const hi = Math.max(lastClicked, idx);
        const allInRange = Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);
        const allSelected = allInRange.every((p) => selected.has(p));
        allInRange.forEach((p) => (allSelected ? next.delete(p) : next.add(p)));
      } else {
        if (next.has(idx)) { next.delete(idx); } else { next.add(idx); }
      }
      setLastClicked(idx);
      onChange(next);
    },
    [selected, lastClicked, onChange]
  );

  const selectAll = () => {
    onChange(new Set(thumbnails.map((_, i) => i)));
    setLastClicked(thumbnails.length - 1);
  };

  const deselectAll = () => {
    onChange(new Set());
    setLastClicked(null);
  };

  if (thumbnails.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {label && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted/55">
            {label}
          </span>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <span className="font-mono text-[9px] text-foreground-muted/40">
            {selected.size} / {thumbnails.length} selected
          </span>
          <button
            type="button"
            onClick={selectAll}
            className="font-mono text-[9px] cursor-pointer underline underline-offset-2  tracking-widest text-foreground-muted/80 hover:text-primary  transition-colors"
          >
          all
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="font-mono text-[9px]  tracking-widest cursor-pointer underline underline-offset-2  text-foreground-muted/80 hover:text-primary transition-colors"
          >
            none
          </button>
        </div>
      </div>

      {/* Thumbnail grid */}
      <div
        className="overflow-y-auto border border-border p-2"
        style={{ maxHeight }}
      >
        <div className="grid gap-1.5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
          {thumbnails.map((src, idx) => {
            const isSelected = selected.has(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => toggle(idx, e.shiftKey)}
                title={`Page ${idx + 1} — click to toggle, shift+click for range`}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 p-0.5 border-2 transition-colors select-none",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-foreground-muted/40"
                )}
              >
                {/* Checkbox overlay */}
                <div
                  className={cn(
                    "absolute top-1 left-1 w-3.5 h-3.5 border flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-foreground-muted/30 bg-surface"
                  )}
                >
                  {isSelected && (
                    <svg
                      viewBox="0 0 10 10"
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="white"
                      strokeWidth={2}
                    >
                      <polyline points="1.5,5 4,7.5 8.5,2.5" />
                    </svg>
                  )}
                </div>
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Page ${idx + 1} thumbnail`}
                  className="w-full block"
                  draggable={false}
                />
                {/* Page number */}
                <span
                  className={cn(
                    "font-mono text-[8px] tabular-nums",
                    isSelected ? "text-primary" : "text-foreground-muted/40"
                  )}
                >
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      
    </div>
  );
}
