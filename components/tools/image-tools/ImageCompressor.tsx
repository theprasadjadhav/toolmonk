"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";
import {
  type OutputFormat,
  getOutputMime,
  getOutputExtension,
  formatBytes,
  stemName,
  revokeUrl,
  downloadBlob,
  getImageInfo,
  processWithWorker,
  validateImageFile,
} from "@/lib/utils/image";

// ── Style tokens ───────────────────────────────────────────────────────────────

const CHECKERBOARD: React.CSSProperties = {
  backgroundImage:
    "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 16px 16px",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface OriginalState {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
}

interface CompressedState {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ImageCompressor() {
  const [original, setOriginal] = useState<OriginalState | null>(null);
  const [compressed, setCompressed] = useState<CompressedState | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileErr, setFileErr] = useState<string | null>(null);
  const [compressErr, setCompressErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Controls
  const [quality, setQuality] = useState(85);
  const [format, setFormat] = useState<OutputFormat>("original");
  const [maxSide, setMaxSide] = useState("");
  const [maxSideErr, setMaxSideErr] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  // Refs track latest URLs so the unmount cleanup always has current values
  const originalUrlRef = useRef<string>("");
  const compressedUrlRef = useRef<string>("");

  // Keep refs in sync
  useEffect(() => { originalUrlRef.current = original?.previewUrl ?? ""; }, [original?.previewUrl]);
  useEffect(() => { compressedUrlRef.current = compressed?.previewUrl ?? ""; }, [compressed?.previewUrl]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      revokeUrl(originalUrlRef.current);
      revokeUrl(compressedUrlRef.current);
    };
  }, []);

  // ── File loading ─────────────────────────────────────────────────────────────

  const loadFile = useCallback(async (file: File) => {
    const validErr = validateImageFile(file);
    if (validErr) {
      setFileErr(validErr);
      return;
    }
    setFileErr(null);
    setCompressErr(null);
    setCompressed(null);

    // Revoke previous URLs via refs (always current, no stale closure)
    revokeUrl(originalUrlRef.current);
    revokeUrl(compressedUrlRef.current);

    try {
      const info = await getImageInfo(file);
      const url = URL.createObjectURL(file);
      setOriginal({
        file,
        previewUrl: url,
        width: info.width,
        height: info.height,
        size: file.size,
      });
    } catch (e) {
      setFileErr("Failed to load image. The file may be corrupted or in an unsupported format.");
    }
  }, []);

  // ── Drag & drop ──────────────────────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  };

  // ── maxSide validation ────────────────────────────────────────────────────────

  const validateMaxSide = (val: string): string | null => {
    if (val === "") return null;
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 32) return "Min 32 px";
    if (n > 16000) return "Max 16000 px";
    return null;
  };

  const handleMaxSideChange = (val: string) => {
    setMaxSide(val);
    setMaxSideErr(validateMaxSide(val));
  };

  // ── Compression ───────────────────────────────────────────────────────────────

  const compress = async () => {
    if (!original || busy) return;
    const msErr = validateMaxSide(maxSide);
    if (msErr) { setMaxSideErr(msErr); return; }

    setBusy(true);
    setCompressErr(null);
    setCompressed(null);

    // Revoke old compressed URL via ref
    revokeUrl(compressedUrlRef.current);

    try {
      const { file } = original;
      const outMime = getOutputMime(format, file.type);

      // Determine target max side
      const targetMaxSide = maxSide !== "" ? parseInt(maxSide, 10) : undefined;

      // Compute target dimensions (proportional scale)
      let targetW = original.width;
      let targetH = original.height;
      if (targetMaxSide !== undefined) {
        const maxDim = Math.max(original.width, original.height);
        if (maxDim > targetMaxSide) {
          const ratio = targetMaxSide / maxDim;
          targetW = Math.max(1, Math.round(original.width * ratio));
          targetH = Math.max(1, Math.round(original.height * ratio));
        }
      }

      let resultBlob: Blob;

      if (["image/jpeg", "image/png", "image/webp"].includes(outMime)) {
        // Use browser-image-compression for JPEG/PNG/WebP.
        // maxSizeMB = quality% of original size — guarantees actual size reduction
        // and makes the quality slider directly control the compression ratio.
        const { default: imageCompression } = await import("browser-image-compression");
        const originalMB = file.size / (1024 * 1024);
        const maxSizeMB = Math.max(originalMB * (quality / 100), 0.01);
        resultBlob = await imageCompression(file, {
          maxSizeMB,
          maxWidthOrHeight: targetMaxSide,
          useWebWorker: true,
          fileType: outMime,
          initialQuality: quality / 100,
        });
      } else {
        // Fallback for formats unsupported by browser-image-compression (AVIF, GIF, BMP)
        const bitmap = await createImageBitmap(file);
        resultBlob = await processWithWorker({
          bitmap,
          width: targetW,
          height: targetH,
          mime: outMime,
          quality: quality / 100,
        });
      }

      // Build preview + dimensions from result blob
      const previewUrl = URL.createObjectURL(resultBlob);
      // Get actual output dimensions by loading the result
      const outInfo = await new Promise<{ w: number; h: number }>((res) => {
        const img = new Image();
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => res({ w: targetW, h: targetH });
        img.src = previewUrl;
      });

      setCompressed({
        blob: resultBlob,
        previewUrl,
        width: outInfo.w,
        height: outInfo.h,
        size: resultBlob.size,
      });
    } catch (e) {
      setCompressErr("Compression failed. The image may be too large or in an unsupported format.");
    } finally {
      setBusy(false);
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────────

  const download = () => {
    if (!original || !compressed) return;
    const outMime = getOutputMime(format, original.file.type);
    const ext = getOutputExtension(outMime);
    const stem = stemName(original.file.name);
    downloadBlob(compressed.blob, `${stem}-compressed.${ext}`);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────

  const reset = () => {
    revokeUrl(originalUrlRef.current);
    revokeUrl(compressedUrlRef.current);
    setOriginal(null);
    setCompressed(null);
    setFileErr(null);
    setCompressErr(null);
    setMaxSide("");
    setMaxSideErr(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Computed stats ────────────────────────────────────────────────────────────

  const savings =
    compressed && original
      ? ((original.size - compressed.size) / original.size) * 100
      : null;
  const ratio =
    compressed && original ? (original.size / compressed.size).toFixed(2) : null;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Error banner ──────────────────────────────────────────────── */}
      {compressErr && <ErrorBanner error={compressErr} />}

      {/* ── Drop zone (when no file loaded) ───────────────────────────── */}
      {!original && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 px-8 py-16 border-2 border-dashed cursor-pointer transition-colors select-none",
            dragging
              ? "border-primary/80"
              : "border-border hover:border-foreground-muted/40 hover:bg-surface-muted",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-foreground-muted/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div className="text-center space-y-1">
            <p className="font-mono text-sm text-foreground-muted">
              Drop an image here, or{" "}
              <span className="text-foreground underline underline-offset-2">browse</span>
            </p>
            <p className="font-mono text-xs text-foreground-muted/50">
              JPEG, PNG, WebP, GIF, BMP, AVIF · max 50 MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) loadFile(f);
            }}
          />
        </div>
      )}

      {fileErr && (
        <p className={cn(errCls, "mt-2")}>{fileErr}</p>
      )}

      {/* ── Controls (once file is loaded) ────────────────────────────── */}
      {original && (
        <div className="space-y-5">

          {/* Original info */}
          <div className="flex items-center gap-4 px-4 py-3 border border-border bg-surface-muted">
            <div
              className="w-14 h-14 shrink-0 overflow-hidden border border-border flex items-center justify-center"
              style={CHECKERBOARD}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={original.previewUrl}
                alt="Original image"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs text-foreground truncate">{original.file.name}</p>
              <p className="font-mono text-[10px] text-foreground-muted/50 mt-0.5">
                {original.width} × {original.height} px · {formatBytes(original.size)}
              </p>
            </div>
            <button
              onClick={reset}
              className="ml-auto font-mono text-[11px] text-foreground-muted/80 hover:text-primary/80 transition-colors shrink-0"
            >
              ✕ change
            </button>
          </div>

          {/* ── Side-by-side previews ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Original */}
            <div className="border border-border bg-surface space-y-0">
              <div className="px-3 py-2 border-b border-border">
                <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
                  — original
                </span>
              </div>
              <div
                className="h-40 w-full overflow-hidden flex items-center justify-center"
                style={CHECKERBOARD}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={original.previewUrl}
                  alt="Original image"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="px-3 py-2 border-t border-border space-y-0.5">
                <p className="font-mono text-[11px] text-foreground">
                  {formatBytes(original.size)}
                </p>
                <p className="font-mono text-[10px] text-foreground-muted/50">
                  {original.width} × {original.height} px
                </p>
              </div>
            </div>

            {/* Compressed */}
            <div className="border border-border bg-surface space-y-0">
              <div className="px-3 py-2 border-b border-border">
                <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
                  — compressed
                </span>
              </div>
              <div
                className="h-40 w-full overflow-hidden flex items-center justify-center"
                style={CHECKERBOARD}
              >
                {compressed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={compressed.previewUrl}
                    alt="Compressed image"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center">
                    <p className="font-mono text-[10px] text-foreground-muted/30 uppercase tracking-wider">
                      {busy ? "processing…" : "not yet compressed"}
                    </p>
                  </div>
                )}
              </div>
              <div className="px-3 py-2 border-t border-border space-y-0.5 min-h-[52px]">
                {compressed ? (
                  <>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-[11px] text-foreground">
                        {formatBytes(compressed.size)}
                      </p>
                      {savings !== null && (
                        <span
                          className={cn(
                            "font-mono text-[10px] font-medium",
                            savings > 0 ? "text-green-500" : "text-red-400",
                          )}
                        >
                          {savings > 0 ? "↓" : "↑"} {Math.abs(savings).toFixed(1)}%
                        </span>
                      )}
                      {ratio && savings !== null && savings > 0 && (
                        <span className="font-mono text-[10px] text-foreground-muted/40">
                          {ratio}× ratio
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-foreground-muted/50">
                      {compressed.width} × {compressed.height} px
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-[10px] text-foreground">—</p>
                    <p className="font-mono text-[10px] text-foreground-muted/60">—</p>
                  </>
                )}
              </div>
            </div>
          </div>


          {/* Quality slider */}
          <div>
            <label className={labelCls}>
              — quality: {quality}
            </label>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-foreground-muted/50 w-4 shrink-0">1</span>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="flex-1 h-1.5 appearance-none bg-border cursor-pointer accent-foreground"
              />
              <span className="font-mono text-[10px] text-foreground-muted/50 w-6 shrink-0 text-right">100</span>
            </div>
          </div>

          {/* Format + maxSide row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>— output format</label>
              <div className="flex gap-2 mt-2.5">
                {(["original", "jpeg", "png", "webp"] as OutputFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider px-3 py-2 border transition-colors flex-1",
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

            <div>
              <label className={cn(labelCls, "leading-normal")}>
                — max dimension (px) · 32–16000, empty = no limit
              </label>
              <input
                type="number"
                min={32}
                max={16000}
                value={maxSide}
                onChange={(e) => handleMaxSideChange(e.target.value)}
                placeholder="e.g. 1920"
                className={cn(inputBaseCls, maxSideErr && inputErrCls)}
              />
              {maxSideErr && <p className={errCls}>{maxSideErr}</p>}
            </div>
          </div>



          {/* ── Stats ──────────────────────────────────────── */}
          {compressed && savings !== null && (
            <div className="border border-border bg-surface-muted divide-y divide-border">
              {[
                {
                  label: "Original size",
                  val: formatBytes(original.size),
                },
                {
                  label: "Compressed size",
                  val: formatBytes(compressed.size),
                },
                {
                  label: "Space saved",
                  val:
                    savings > 0
                      ? `${formatBytes(original.size - compressed.size)} (${savings.toFixed(1)}%)`
                      : savings === 0
                        ? "0 B (0%)"
                        : `+${formatBytes(compressed.size - original.size)} (file grew ${Math.abs(savings).toFixed(1)}%)`,
                },
                {
                  label: "Compression ratio",
                  val: savings > 0 ? `${ratio}:1` : "—",
                },
              ].map(({ label, val }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-full sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-border px-4 py-2 font-mono text-[10px] uppercase text-foreground-muted/50">
                    {label}
                  </span>
                  <span className="px-4 py-2 font-mono text-sm text-foreground flex-1">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Compress button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={compress}
              disabled={busy || !!maxSideErr}
              className={cn(
                "w-full font-mono text-[11px] uppercase tracking-wider px-6 py-3 border transition-colors ",
                busy || maxSideErr
                  ? "border-border text-foreground-muted/30 cursor-not-allowed"
                  : "border-foreground-muted text-foreground hover:text-primary hover:border-primary/40",
              )}
            >
              {busy ? "compressing…" : "compress"}
            </button>

            {compressed && (
              <button
                onClick={download}
                className="w-full font-mono text-[11px] uppercase tracking-wider px-6 py-3 border border-foreground-muted text-foreground hover:bg-surface-muted transition-colors hover:text-primary hover:border-primary/40"
              >
                ↓ download
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
