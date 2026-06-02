"use client";

import { useState } from "react";
import { FileConverter, type OutputFile } from "./FileConverter";
import { cn } from "@/lib/utils/cn";

async function convertViaCanvas(file: File, mime: string, quality?: number): Promise<OutputFile> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        async (blob) => {
          if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
          const buf = await blob.arrayBuffer();
          const ext = mime === "image/png" ? "png" : "webp";
          resolve({
            name: file.name.replace(/\.[^.]+$/, "") + "." + ext,
            data: new Uint8Array(buf),
            mime,
          });
        },
        mime,
        quality,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Failed to load ${file.name}`)); };
    img.src = url;
  });
}

export function PngToWebp() {
  const [quality, setQuality] = useState(85);

  const handleConvert = async (files: File[]): Promise<OutputFile[]> => {
    return Promise.all(files.map((f) => convertViaCanvas(f, "image/webp", quality / 100)));
  };

  return (
    <FileConverter
      accept="image/png,.png"
      acceptLabel="PNG"
      multiple
      options={
        <label className="flex items-center gap-2">
          <span className="hidden sm:inline font-mono text-[11px] text-foreground-muted uppercase tracking-wider shrink-0">
            quality
          </span>
          <input
            type="range"
            min={1}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-24 accent-foreground cursor-pointer"
          />
          <span className={cn(
            "font-mono text-xs tabular-nums shrink-0 w-8",
            quality >= 80 ? "text-foreground" : quality >= 50 ? "text-foreground-muted" : "text-foreground-muted/50"
          )}>
            {quality}%
          </span>
        </label>
      }
      onConvert={handleConvert}
    />
  );
}
