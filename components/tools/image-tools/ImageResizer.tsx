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

type ResizeMode = "pixels" | "percentage";
type FitMode = "stretch" | "contain" | "cover";

interface OriginalState {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
}

interface ResizedState {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function clampDim(val: number): number {
  return Math.max(1, Math.min(16000, Math.round(val)));
}

/** Validate a pixel dimension input string. */
function validatePixelInput(val: string): string | null {
  if (val === "") return "Required";
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 1) return "Min 1 px";
  if (n > 16000) return "Max 16000 px";
  return null;
}

/** Validate a percentage input string. */
function validatePctInput(val: string): string | null {
  if (val === "") return "Required";
  const n = parseFloat(val);
  if (isNaN(n) || n < 1) return "Min 1%";
  if (n > 1000) return "Max 1000%";
  return null;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ImageResizer() {
  const [original, setOriginal] = useState<OriginalState | null>(null);
  const [resized, setResized] = useState<ResizedState | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileErr, setFileErr] = useState<string | null>(null);
  const [resizeErr, setResizeErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Mode & fit
  const [mode, setMode] = useState<ResizeMode>("pixels");
  const [fitMode, setFitMode] = useState<FitMode>("stretch");
  const [format, setFormat] = useState<OutputFormat>("original");

  // Dimension inputs
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [widthPct, setWidthPct] = useState("100");
  const [heightPct, setHeightPct] = useState("100");
  const [widthErr, setWidthErr] = useState<string | null>(null);
  const [heightErr, setHeightErr] = useState<string | null>(null);

  // Aspect ratio lock
  const [locked, setLocked] = useState(true);

  // Background color for contain mode
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgHexInput, setBgHexInput] = useState("#ffffff");

  // Large image warning
  const [largeWarn, setLargeWarn] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  // Refs track latest URLs so the unmount cleanup always has current values
  const originalUrlRef = useRef<string>("");
  const resizedUrlRef = useRef<string>("");

  // Keep refs in sync
  useEffect(() => { originalUrlRef.current = original?.previewUrl ?? ""; }, [original?.previewUrl]);
  useEffect(() => { resizedUrlRef.current = resized?.previewUrl ?? ""; }, [resized?.previewUrl]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      revokeUrl(originalUrlRef.current);
      revokeUrl(resizedUrlRef.current);
    };
  }, []);

  // ── File loading ─────────────────────────────────────────────────────────────

  const loadFile = useCallback(async (file: File) => {
    const validErr = validateImageFile(file);
    if (validErr) { setFileErr(validErr); return; }
    setFileErr(null);
    setResizeErr(null);
    setResized(null);
    setLargeWarn(null);

    // Revoke previous URLs via refs (always current, no stale closure)
    revokeUrl(originalUrlRef.current);
    revokeUrl(resizedUrlRef.current);

    try {
      const info = await getImageInfo(file);
      const url = URL.createObjectURL(file);

      const warn =
        info.width > 16000 || info.height > 16000
          ? `This image (${info.width}×${info.height}px) exceeds 16000px on one side. Dimensions will be capped at 16000 px.`
          : null;
      setLargeWarn(warn);

      setOriginal({ file, previewUrl: url, width: info.width, height: info.height, size: file.size });

      // Seed dimension inputs with original size
      setWidthInput(String(info.width));
      setHeightInput(String(info.height));
      setWidthPct("100");
      setHeightPct("100");
      setWidthErr(null);
      setHeightErr(null);
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

  // ── Dimension change handlers (with aspect ratio lock) ────────────────────────

  const handleWidthChange = (val: string) => {
    setWidthInput(val);
    if (mode === "pixels") {
      const err = validatePixelInput(val);
      setWidthErr(err);
      if (!err && locked && original) {
        const n = parseInt(val, 10);
        const newH = clampDim(n * (original.height / original.width));
        setHeightInput(String(newH));
        setHeightErr(validatePixelInput(String(newH)));
      }
    }
  };

  const handleHeightChange = (val: string) => {
    setHeightInput(val);
    if (mode === "pixels") {
      const err = validatePixelInput(val);
      setHeightErr(err);
      if (!err && locked && original) {
        const n = parseInt(val, 10);
        const newW = clampDim(n * (original.width / original.height));
        setWidthInput(String(newW));
        setWidthErr(validatePixelInput(String(newW)));
      }
    }
  };

  const handleWidthPctChange = (val: string) => {
    setWidthPct(val);
    const err = validatePctInput(val);
    setWidthErr(err);
    if (!err && locked) {
      setHeightPct(val);
      setHeightErr(validatePctInput(val));
    }
  };

  const handleHeightPctChange = (val: string) => {
    setHeightPct(val);
    const err = validatePctInput(val);
    setHeightErr(err);
    if (!err && locked) {
      setWidthPct(val);
      setWidthErr(validatePctInput(val));
    }
  };

  // ── Mode switch — re-derive inputs from current values ──────────────────────

  const switchMode = (m: ResizeMode) => {
    if (!original) { setMode(m); return; }
    setMode(m);
    setWidthErr(null);
    setHeightErr(null);
    if (m === "pixels") {
      setWidthInput(String(original.width));
      setHeightInput(String(original.height));
    } else {
      setWidthPct("100");
      setHeightPct("100");
    }
  };

  // ── Lock toggle ───────────────────────────────────────────────────────────────

  const toggleLock = () => {
    if (!locked && original) {
      // Re-lock: sync height to match width ratio
      if (mode === "pixels") {
        const w = parseInt(widthInput, 10);
        if (!isNaN(w) && w > 0) {
          const newH = clampDim(w * (original.height / original.width));
          setHeightInput(String(newH));
          setHeightErr(null);
        }
      } else {
        setHeightPct(widthPct);
        setHeightErr(null);
      }
    }
    setLocked((prev) => !prev);
  };

  // ── Background color input ─────────────────────────────────────────────────────

  const handleBgHexInput = (val: string) => {
    setBgHexInput(val);
    const full = val.startsWith("#") ? val : "#" + val;
    if (/^#[0-9a-f]{6}$/i.test(full)) setBgColor(full);
  };

  // ── Computed target dimensions ────────────────────────────────────────────────

  const getTargetDimensions = (): { w: number; h: number } | null => {
    if (!original) return null;
    if (mode === "pixels") {
      const w = parseInt(widthInput, 10);
      const h = parseInt(heightInput, 10);
      if (isNaN(w) || isNaN(h) || w < 1 || h < 1) return null;
      return { w: clampDim(w), h: clampDim(h) };
    } else {
      const pw = parseFloat(widthPct);
      const ph = parseFloat(heightPct);
      if (isNaN(pw) || isNaN(ph) || pw < 1 || ph < 1) return null;
      const w = clampDim(Math.round(original.width * pw / 100));
      const h = clampDim(Math.round(original.height * ph / 100));
      return { w, h };
    }
  };

  // Overflow warning for percentage mode
  const pctOverflowWarn = (() => {
    if (!original || mode !== "percentage") return null;
    const dims = getTargetDimensions();
    if (!dims) return null;
    if (dims.w > 16000 || dims.h > 16000)
      return `Output would be ${dims.w}×${dims.h}px — capped at 16000 px.`;
    return null;
  })();

  // ── Resize ────────────────────────────────────────────────────────────────────

  const resize = async () => {
    if (!original || busy) return;

    // Validate all inputs
    let hasErr = false;
    if (mode === "pixels") {
      const we = validatePixelInput(widthInput);
      const he = validatePixelInput(heightInput);
      setWidthErr(we);
      setHeightErr(he);
      if (we || he) hasErr = true;
    } else {
      const we = validatePctInput(widthPct);
      const he = validatePctInput(heightPct);
      setWidthErr(we);
      setHeightErr(he);
      if (we || he) hasErr = true;
    }
    if (hasErr) return;

    const dims = getTargetDimensions();
    if (!dims) return;
    const { w: targetW, h: targetH } = dims;

    setBusy(true);
    setResizeErr(null);
    revokeUrl(resizedUrlRef.current);

    try {
      const { file } = original;
      const outMime = getOutputMime(format, file.type);

      let resultBlob: Blob;

      if (fitMode === "stretch") {
        const bitmap = await createImageBitmap(file);
        resultBlob = await processWithWorker({
          bitmap,
          width: targetW,
          height: targetH,
          mime: outMime,
          quality: 0.92,
        });
      } else if (fitMode === "contain") {
        // Scale image to fit inside targetW×targetH, preserve aspect, center, fill rest with bgColor
        const srcAR = original.width / original.height;
        const dstAR = targetW / targetH;
        let drawW: number, drawH: number;
        if (srcAR > dstAR) {
          drawW = targetW;
          drawH = Math.round(targetW / srcAR);
        } else {
          drawH = targetH;
          drawW = Math.round(targetH * srcAR);
        }
        const offsetX = Math.round((targetW - drawW) / 2);
        const offsetY = Math.round((targetH - drawH) / 2);

        // Use main-thread canvas for contain (need to draw background + centered image)
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetW, targetH);

        const bitmap = await createImageBitmap(file);
        ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, offsetX, offsetY, drawW, drawH);
        bitmap.close();

        resultBlob = await new Promise<Blob>((res, rej) => {
          const q = outMime === "image/png" ? undefined : 0.92;
          canvas.toBlob(
            (b) => (b ? res(b) : rej(new Error("Canvas toBlob returned null"))),
            outMime,
            q,
          );
        });
      } else {
        // cover — crop source to fill targetW×targetH exactly
        const srcAR = original.width / original.height;
        const dstAR = targetW / targetH;

        let sx: number, sy: number, sw: number, sh: number;
        if (srcAR > dstAR) {
          // Source wider than dest — crop sides
          sh = original.height;
          sw = Math.round(original.height * dstAR);
          sx = Math.round((original.width - sw) / 2);
          sy = 0;
        } else {
          // Source taller than dest — crop top/bottom
          sw = original.width;
          sh = Math.round(original.width / dstAR);
          sx = 0;
          sy = Math.round((original.height - sh) / 2);
        }

        const bitmap = await createImageBitmap(file);
        resultBlob = await processWithWorker({
          bitmap,
          width: targetW,
          height: targetH,
          mime: outMime,
          quality: 0.92,
          sx,
          sy,
          sw,
          sh,
        });
      }

      const previewUrl = URL.createObjectURL(resultBlob);
      const outDims = await new Promise<{ w: number; h: number }>((res) => {
        const img = new Image();
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => res({ w: targetW, h: targetH });
        img.src = previewUrl;
      });

      setResized({
        blob: resultBlob,
        previewUrl,
        width: outDims.w,
        height: outDims.h,
        size: resultBlob.size,
      });
    } catch (e) {
      setResizeErr("Failed to resize the image. The file may be too large or in an unsupported format.");
    } finally {
      setBusy(false);
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────────

  const download = () => {
    if (!original || !resized) return;
    const outMime = getOutputMime(format, original.file.type);
    const ext = getOutputExtension(outMime);
    const stem = stemName(original.file.name);
    downloadBlob(resized.blob, `${stem}-${resized.width}x${resized.height}.${ext}`);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────

  const reset = () => {
    revokeUrl(originalUrlRef.current);
    revokeUrl(resizedUrlRef.current);
    setOriginal(null);
    setResized(null);
    setFileErr(null);
    setResizeErr(null);
    setLargeWarn(null);
    setWidthInput("");
    setHeightInput("");
    setWidthPct("100");
    setHeightPct("100");
    setWidthErr(null);
    setHeightErr(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Preview dimensions for badge ──────────────────────────────────────────────

  const targetDims = original ? getTargetDimensions() : null;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Error banner ──────────────────────────────────────────────── */}
      {resizeErr && <ErrorBanner error={resizeErr} />}

      {/* ── Large image warning ────────────────────────────────────────── */}
      {largeWarn && (
        <div className="flex items-start gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30">
          <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider shrink-0 mt-0.5">
            warn
          </span>
          <p className="font-mono text-xs text-amber-400 leading-relaxed">{largeWarn}</p>
        </div>
      )}

      {/* ── Drop zone ─────────────────────────────────────────────────── */}
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

      {fileErr && <p className={cn(errCls, "mt-2")}>{fileErr}</p>}

      {/* ── Controls ──────────────────────────────────────────────────── */}
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
                alt="Image to resize"
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

          {/* ── Before / After previews ────────────────────────────────── */}
          {(
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Original */}
              <div className="border border-border bg-surface">
                <div className="px-3 py-2 border-b border-border">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
                    — original
                  </span>
                </div>
                <div
                  className="h-40 w-full flex items-center justify-center overflow-hidden"
                  style={CHECKERBOARD}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={original.previewUrl}
                    alt="Image to resize"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="px-3 py-2 border-t border-border">
                  <p className="font-mono text-[11px] text-foreground">{formatBytes(original.size)}</p>
                  <p className="font-mono text-[10px] text-foreground-muted/50">
                    {original.width} × {original.height} px
                  </p>
                </div>
              </div>

              {/* Resized */}
              <div className="border border-border bg-surface">
                <div className="px-3 py-2 border-b border-border">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">
                    — resized
                  </span>
                </div>
                {resized ? <div
                  className="h-40 w-full flex items-center justify-center overflow-hidden"
                  style={CHECKERBOARD}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resized.previewUrl}
                    alt="Resized image"
                    className="h-full w-full object-contain"
                  />

                </div>
                  : (
                    <div className="h-40 flex items-center justify-center">
                      <p className="font-mono text-[10px] text-foreground-muted/30 uppercase tracking-wider">
                        {busy ? "processing…" : "not yet resized"}
                      </p>
                    </div>
                  )
                }
                {resized ?
                  <div className="px-3 py-2 border-t border-border">
                    <p className="font-mono text-[11px] text-foreground">{formatBytes(resized.size)}</p>
                    <p className="font-mono text-[10px] text-foreground-muted/50">
                      {resized.width} × {resized.height} px
                    </p>
                  </div>
                  :
                  <div className="px-3 py-2 border-t border-border">
                    <p className="font-mono text-[11px] text-foreground">-</p>
                    <p className="font-mono text-[10px] text-foreground-muted/50">
                      -
                    </p>
                  </div>
                }
              </div>
            </div>
          )}

          {/* Resize mode toggle */}
          <div>
            <label className={labelCls}>— resize mode</label>
            <div className="flex gap-3">
              {(["pixels", "percentage"] as ResizeMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
                    mode === m
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-foreground-muted hover:text-foreground",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Width / Height inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={cn(labelCls, "mb-0")}>
                — dimensions{mode === "pixels" ? " (px) · 1–16000" : " (%) · 1–1000"}
              </label>
              {/* Lock aspect ratio toggle */}
              <button
                onClick={toggleLock}
                title={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                className={cn(
                  "font-mono text-[10px] px-2.5 py-1 border transition-colors flex items-center gap-1.5",
                  locked
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}
              >
                {locked ? (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="1" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="1" />
                    <path d="M7 11V7a5 5 0 019.9-1" />
                  </svg>
                )}
                <span>{locked ? "locked" : "free"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Width {mode === "pixels" ? "px" : "%"}</label>
                {mode === "pixels" ? (
                  <input
                    type="number"
                    min={1}
                    max={16000}
                    value={widthInput}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className={cn(inputBaseCls, widthErr && inputErrCls)}
                  />
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    step={1}
                    value={widthPct}
                    onChange={(e) => handleWidthPctChange(e.target.value)}
                    className={cn(inputBaseCls, widthErr && inputErrCls)}
                  />
                )}
                {widthErr && <p className={errCls}>{widthErr}</p>}
              </div>
              <div>
                <label className={labelCls}>Height {mode === "pixels" ? "px" : "%"}</label>
                {mode === "pixels" ? (
                  <input
                    type="number"
                    min={1}
                    max={16000}
                    value={heightInput}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className={cn(inputBaseCls, heightErr && inputErrCls)}
                  />
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    step={1}
                    value={heightPct}
                    onChange={(e) => handleHeightPctChange(e.target.value)}
                    className={cn(inputBaseCls, heightErr && inputErrCls)}
                  />
                )}
                {heightErr && <p className={errCls}>{heightErr}</p>}
              </div>
            </div>

            {/* Preview target size badge */}
            {targetDims && !widthErr && !heightErr && (
              <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">
                → {targetDims.w} × {targetDims.h} px
                {pctOverflowWarn && (
                  <span className="ml-2 text-amber-400/70"> (capped at 16000 px)</span>
                )}
              </p>
            )}
          </div>

          {/* Fit mode + output format row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>— fit mode</label>
              <div className="flex gap-2">
                {(["stretch", "contain", "cover"] as FitMode[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFitMode(f)}
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider px-3 py-2 border transition-colors flex-1",
                      fitMode === f
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-foreground-muted hover:text-foreground",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">
                {fitMode === "stretch" && "Distort image to exact dimensions"}
                {fitMode === "contain" && "Fit inside canvas, letterbox with background"}
                {fitMode === "cover" && "Crop to fill canvas exactly"}
              </p>
            </div>

            <div>
              <label className={labelCls}>— output format</label>
              <div className="flex gap-2">
                {(["original", "jpeg", "png", "webp"] as OutputFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider px-2 py-2 border transition-colors flex-1",
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
          </div>

          {/* Background color — only for contain mode */}
          {fitMode === "contain" && (
            <div>
              <label className={labelCls}>— background color</label>
              <div className="flex gap-2 items-center">
                {/* Color swatch + native picker */}
                <div className="relative shrink-0 group w-10 h-10 border border-border cursor-pointer">
                  <div className="w-full h-full" style={{ backgroundColor: bgColor }} />
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => {
                      setBgColor(e.target.value);
                      setBgHexInput(e.target.value);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={bgHexInput}
                  onChange={(e) => handleBgHexInput(e.target.value)}
                  maxLength={7}
                  placeholder="#ffffff"
                  className={cn(inputBaseCls, "flex-1")}
                  spellCheck={false}
                />
                <button
                  onClick={() => { setBgColor("#ffffff"); setBgHexInput("#ffffff"); }}
                  className="font-mono text-[10px] px-3 py-2.5 border border-border text-foreground-muted hover:text-foreground transition-colors shrink-0"
                >
                  reset
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Resize button */}
            <button
              onClick={resize}
              disabled={busy || !!widthErr || !!heightErr}
              className={cn(
                "w-full font-mono text-[11px] uppercase tracking-wider px-6 py-3 border transition-colors",
                busy || widthErr || heightErr
                  ? "border-border text-foreground-muted/30 cursor-not-allowed"
                  : "border-foreground-muted text-foreground hover:bg-surface-muted hover:border-primary/40 hover:text-primary ",
              )}
            >
              {busy ? "resizing…" : "resize"}
            </button>

            {/* Download */}
            {resized && (
              <button
                onClick={download}
                className="w-full font-mono text-[11px] uppercase tracking-wider px-6 py-3 border border-foreground-muted text-foreground hover:border-primary/40 hover:text-primary transition-colors"
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
