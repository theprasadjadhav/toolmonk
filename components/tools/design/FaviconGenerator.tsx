"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { DropZone } from "@/components/ui/DropZone";

const SIZES = [16, 32, 48, 64, 96, 180, 192, 512];
const LABELS: Record<number, string> = {
  16: "favicon.ico",
  32: "favicon-32.png",
  48: "favicon-48.png",
  64: "favicon-64.png",
  96: "favicon-96.png",
  180: "apple-touch-icon.png",
  192: "android-192.png",
  512: "android-512.png",
};

function resizeCanvas(src: HTMLImageElement, size: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, size, size);
  return canvas.toDataURL("image/png");
}

interface Generated { size: number; dataUrl: string }

export function FaviconGenerator() {
  const [previews, setPreviews] = useState<Generated[]>([]);
  const [fileName, setFileName] = useState("");

  const process = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const generated = SIZES.map((size) => ({ size, dataUrl: resizeCanvas(img, size) }));
      setPreviews(generated);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const download = (dataUrl: string, name: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = name;
    a.click();
  };

  const downloadAll = () => {
    previews.forEach((p, i) => {
      setTimeout(() => download(p.dataUrl, LABELS[p.size]), i * 120);
    });
  };

  const clear = () => { setPreviews([]); setFileName(""); };

  return (
    <div className="space-y-6">

      {/* ── Upload ────────────────────────────────────────────────────── */}
      {previews.length === 0 && (
        <DropZone
          variant="image"
          accept="image/*"
          label="Drop your image here, or"
          hint="PNG, JPG, SVG, WebP · ideally square"
          onFiles={(files) => { const f = files[0]; if (f) process(f); }}
        />
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— generated from</p>
              <p className="font-mono text-xs text-foreground mt-0.5">{fileName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadAll}
                className="font-mono text-[10px] px-3 py-1.5 border border-border text-foreground-muted hover:text-foreground transition-colors"
              >
                ↓ all
              </button>
              <button
                onClick={clear}
                className="font-mono text-[10px] px-3 py-1.5 border border-border text-foreground-muted hover:text-foreground transition-colors"
              >
                ✕ reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previews.map(({ size, dataUrl }) => (
              <div key={size} className="border border-border bg-surface p-3 space-y-2">
                {/* Checkerboard background for transparency */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23ccc'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23ccc'/%3E%3C/svg%3E\")",
                    backgroundSize: "8px 8px",
                  }}
                >
                  {/* Cap preview display at 64px so small sizes look right */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dataUrl}
                    alt="Favicon preview"
                    style={{ width: Math.min(size, 64), height: Math.min(size, 64) }}
                    className="block"
                  />
                </div>
                <div>
                  <p className="font-mono text-[11px] text-foreground font-medium">{size}×{size}</p>
                  <p className="font-mono text-[9px] text-foreground-muted/50 truncate">{LABELS[size]}</p>
                </div>
                <button
                  onClick={() => download(dataUrl, LABELS[size])}
                  className="w-full font-mono text-[10px] px-2 py-1.5 border border-border text-foreground-muted hover:text-foreground transition-colors"
                >
                  ↓ download
                </button>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="border border-border bg-surface-muted px-4 py-3 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/50">— usage tips</p>
            <p className="font-mono text-[11px] text-foreground-muted/70">
              Place <code className="text-foreground">favicon.ico</code> in your site root.
              Add <code className="text-foreground">apple-touch-icon.png</code> for iOS home screens.
              Reference <code className="text-foreground">android-192.png</code> in your Web App Manifest.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
