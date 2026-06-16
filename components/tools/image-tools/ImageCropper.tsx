"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { DropZone } from "@/components/ui/DropZone";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { labelCls, inputBaseCls, inputErrCls, errCls } from "@/lib/utils/formStyles";
import {
  type OutputFormat,
  type ImageInfo,
  getOutputMime,
  getOutputExtension,
  formatBytes,
  stemName,
  revokeUrl,
  downloadBlob,
  validateImageFile,
  getImageInfo,
} from "@/lib/utils/image";
import type CropperType from "cropperjs";
import "cropperjs/dist/cropper.css";

// ── Style constants ────────────────────────────────────────────────────────────

const CHECKERBOARD: React.CSSProperties = {
  backgroundImage:
    "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 16px 16px",
};

// ── Aspect ratio config ────────────────────────────────────────────────────────

type AspectPreset = "free" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "custom";

const ASPECT_PRESETS: Record<AspectPreset, { label: string; ratio: number }> = {
  free: { label: "Free", ratio: NaN },
  "1:1": { label: "1:1", ratio: 1 },
  "4:3": { label: "4:3", ratio: 4 / 3 },
  "3:4": { label: "3:4", ratio: 3 / 4 },
  "16:9": { label: "16:9", ratio: 16 / 9 },
  "9:16": { label: "9:16", ratio: 9 / 16 },
  custom: { label: "Custom", ratio: NaN },
};

const ASPECT_ORDER: AspectPreset[] = ["free", "1:1", "4:3", "3:4", "16:9", "9:16", "custom"];

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "original", label: "original" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

// ── Component ──────────────────────────────────────────────────────────────────

export function ImageCropper() {
  const [fileError, setFileError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgInfo, setImgInfo] = useState<ImageInfo | null>(null);

  const [aspectPreset, setAspectPreset] = useState<AspectPreset>("free");
  const [customW, setCustomW] = useState("3");
  const [customH, setCustomH] = useState("2");
  const [customWErr, setCustomWErr] = useState<string | null>(null);
  const [customHErr, setCustomHErr] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");

  const [cropInfo, setCropInfo] = useState<{ w: number; h: number } | null>(null);
  const [cropperReady, setCropperReady] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);

  interface CropResult { url: string; blob: Blob; width: number; height: number; size: number; }
  const [result, setResult] = useState<CropResult | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<CropperType | null>(null);
  const imgSrcRef = useRef<string | null>(null);

  // ── Effective aspect ratio ───────────────────────────────────────────────────

  const getEffectiveRatio = useCallback((): number => {
    if (aspectPreset === "free") return NaN;
    if (aspectPreset !== "custom") return ASPECT_PRESETS[aspectPreset].ratio;
    const w = parseFloat(customW);
    const h = parseFloat(customH);
    return (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) ? w / h : NaN;
  }, [aspectPreset, customW, customH]);

  // ── Init cropper when imgSrc changes ─────────────────────────────────────────
  // The <img ref={imgRef}> is ALWAYS mounted when imgSrc is set (never conditionally
  // removed). This is the key requirement for re-crop to work: the DOM element
  // must persist so cropperjs can stay attached.

  useEffect(() => {
    if (!imgSrc || !imgRef.current) return;

    let active = true;
    setCropperReady(false);
    setCropInfo(null);

    // Small delay ensures the img src has been painted before cropperjs measures it
    const timer = setTimeout(() => {
      import("cropperjs").then(({ default: CropperClass }) => {
        if (!active || !imgRef.current) return;

        cropperRef.current?.destroy();

        cropperRef.current = new CropperClass(imgRef.current, {
          viewMode: 1,
          aspectRatio: getEffectiveRatio(),
          autoCropArea: 0.8,
          responsive: true,
          background: false,
          checkOrientation: true,
          ready() {
            if (active) setCropperReady(true);
          },
          crop(e) {
            setCropInfo({
              w: Math.max(0, Math.round(e.detail.width)),
              h: Math.max(0, Math.round(e.detail.height)),
            });
          },
        });
      });
    }, 50);

    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgSrc]);

  // cropperjs listens to the window 'resize' event to recalculate its geometry.
  // Firing a synthetic resize on scroll forces it to re-anchor the crop box
  // coordinates after the page has been scrolled, preventing crop box drift.
  useEffect(() => {
    if (!cropperReady) return;
    const onScroll = () => window.dispatchEvent(new Event("resize"));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [cropperReady]);

  // ── Sync aspect ratio on live instance ──────────────────────────────────────

  useEffect(() => {
    if (!cropperReady || !cropperRef.current) return;
    cropperRef.current.setAspectRatio(getEffectiveRatio());
  }, [getEffectiveRatio, cropperReady]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cropperRef.current?.destroy();
      if (imgSrcRef.current) revokeUrl(imgSrcRef.current);
    };
  }, []);

  // ── File handling ────────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setFileError(null);
    setCropError(null);
    setResult(prev => { if (prev?.url) revokeUrl(prev.url); return null; });
    setCropInfo(null);
    setCropperReady(false);

    const err = validateImageFile(file);
    if (err) { setFileError(err); return; }

    try {
      const info = await getImageInfo(file);
      const url = URL.createObjectURL(file);

      // Destroy existing cropper before swapping src
      cropperRef.current?.destroy();
      cropperRef.current = null;

      setImgSrc(prev => {
        if (prev) revokeUrl(prev);
        imgSrcRef.current = url;
        return url;
      });
      setImgInfo(info);
    } catch (e) {
      setFileError("Failed to load image. The file may be corrupted or in an unsupported format.");
    }
  }, []);

  // ── Crop ─────────────────────────────────────────────────────────────────────

  const handleCrop = useCallback(() => {
    if (!cropperRef.current || !imgInfo || !cropperReady || cropping) return;

    setCropping(true);
    setCropError(null);

    const outMime = getOutputMime(outputFormat, imgInfo.mime);
    const canvas = cropperRef.current.getCroppedCanvas({
      maxWidth: 4096,
      maxHeight: 4096,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    if (!canvas) {
      setCropError("Could not generate cropped canvas. Adjust the crop selection and try again.");
      setCropping(false);
      return;
    }

    const quality = outMime === "image/png" ? undefined : 0.92;
    canvas.toBlob(
      (blob) => {
        setCropping(false);
        if (!blob) { setCropError("Failed to encode the cropped image."); return; }
        const url = URL.createObjectURL(blob);
        setResult(prev => {
          if (prev?.url) revokeUrl(prev.url);
          return { url, blob, width: canvas.width, height: canvas.height, size: blob.size };
        });
      },
      outMime,
      quality,
    );
  }, [imgInfo, outputFormat, cropperReady, cropping]);


  // ── Download ─────────────────────────────────────────────────────────────────

  const handleDownload = useCallback(() => {
    if (!result || !imgInfo) return;
    const outMime = getOutputMime(outputFormat, imgInfo.mime);
    const ext = getOutputExtension(outMime);
    downloadBlob(result.blob, `${stemName(imgInfo.name)}-cropped.${ext}`);
  }, [result, imgInfo, outputFormat]);

  // ── Reset ────────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    cropperRef.current?.destroy();
    cropperRef.current = null;

    setImgSrc(prev => { if (prev) revokeUrl(prev); imgSrcRef.current = null; return null; });
    setResult(prev => { if (prev?.url) revokeUrl(prev.url); return null; });
    setImgInfo(null);
    setCropInfo(null);
    setCropError(null);
    setCropperReady(false);
    setFileError(null);
    setAspectPreset("free");
    setOutputFormat("original");
    setCustomW("3");
    setCustomH("2");
    setCustomWErr(null);
    setCustomHErr(null);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Error banner */}
      {cropError && <ErrorBanner error={cropError} />}

      {/* Drop zone — hidden once an image is loaded */}
      {!imgSrc && (
        <DropZone
          variant="image"
          accept="image/*"
          hint="JPEG, PNG, WebP, GIF, BMP, AVIF · max 50 MB"
          onFiles={(files) => { const f = files[0]; if (f) processFile(f); }}
        />
      )}

      {fileError && <p className={errCls}>{fileError}</p>}

      {/* ── Main panel — shown once image is loaded ────────────────────── */}
      {imgSrc && imgInfo && (
        <div className="space-y-5">

          {/* File info bar */}
          <div className="flex items-center gap-4 px-4 py-3 border border-border bg-surface-muted">
            <div className="w-10 h-10 shrink-0 overflow-hidden border border-border flex items-center justify-center" style={CHECKERBOARD}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc} alt="" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-foreground truncate">{imgInfo.name}</p>
              <p className="font-mono text-[10px] text-foreground-muted/50 mt-0.5">
                {imgInfo.width} × {imgInfo.height} px · {formatBytes(imgInfo.size)}
              </p>
            </div>
            <button onClick={handleReset}
              className="ml-auto font-mono text-[11px] text-foreground-muted/80 hover:text-primary/80 transition-colors shrink-0">
              ✕ change
            </button>
          </div>

          {/* Cropper canvas
              IMPORTANT: this <img> must remain in the DOM as long as imgSrc is set.
              Fixed height container prevents cropperjs from recalculating a shifting
              geometry as content above/below changes. */}
          <div className="w-full border border-border bg-surface overflow-hidden" style={{ height: 420 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop area"
              style={{ display: "block", maxWidth: "100%" }}
            />
          </div>

          {/* Live crop size */}
          {cropInfo && cropperReady && (
            <p className="font-mono text-[11px] text-foreground-muted/60">
              selection:{" "}
              <span className="text-foreground">{cropInfo.w} × {cropInfo.h} px</span>
            </p>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Aspect ratio */}
            <div>
              <label className={labelCls}>— aspect ratio</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                {ASPECT_ORDER.map((preset) => (
                  <button key={preset} onClick={() => setAspectPreset(preset)}
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider px-2 py-2 border transition-colors",
                      aspectPreset === preset
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-foreground-muted hover:text-foreground",
                    )}>
                    {ASPECT_PRESETS[preset].label}
                  </button>
                ))}
              </div>

              {aspectPreset === "custom" && (
                <div className="flex items-start gap-2 mt-3">
                  <div className="flex-1">
                    <label className={labelCls}>W</label>
                    <input type="number" min="0.1" step="0.1" value={customW}
                      onChange={(e) => {
                        setCustomW(e.target.value);
                        const n = parseFloat(e.target.value);
                        setCustomWErr(isNaN(n) || n <= 0 ? "Positive number" : null);
                      }}
                      className={cn(inputBaseCls, customWErr && inputErrCls)} />
                    {customWErr && <p className={errCls}>{customWErr}</p>}
                  </div>
                  <span className="font-mono text-foreground-muted pt-8">:</span>
                  <div className="flex-1">
                    <label className={labelCls}>H</label>
                    <input type="number" min="0.1" step="0.1" value={customH}
                      onChange={(e) => {
                        setCustomH(e.target.value);
                        const n = parseFloat(e.target.value);
                        setCustomHErr(isNaN(n) || n <= 0 ? "Positive number" : null);
                      }}
                      className={cn(inputBaseCls, customHErr && inputErrCls)} />
                    {customHErr && <p className={errCls}>{customHErr}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Output format */}
            <div>
              <label className={labelCls}>— output format</label>
              <div className="flex gap-2">
                {FORMAT_OPTIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => setOutputFormat(value)}
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider px-3 py-2 border transition-colors flex-1",
                      outputFormat === value
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-foreground-muted hover:text-foreground",
                    )}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Crop button */}
          <button
            onClick={handleCrop}
            disabled={!cropperReady || cropping}
            className={cn(
              "w-full font-mono text-[11px] uppercase tracking-wider px-6 py-3 border transition-colors",
              !cropperReady || cropping
                ? "border-border text-foreground-muted/30 cursor-not-allowed"
                : "border-foreground-muted text-foreground hover:text-primary hover:border-primary/40",
            )}
          >
            {!cropperReady ? "loading…" : cropping ? "cropping…" : "crop image"}
          </button>

          {cropping && (
            <div className="h-px bg-border overflow-hidden">
              <div className="h-full bg-foreground-muted/30 animate-pulse w-full" />
            </div>
          )}

          {/* ── Result ───────────────────────────────────────────────────── */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-border">

              {/* Side-by-side: original | cropped */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Original */}
                <div className="border border-border bg-surface">
                  <div className="px-3 py-2 border-b border-border">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— original</span>
                  </div>
                  <div className="h-40 overflow-hidden flex items-center justify-center" style={CHECKERBOARD}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc} alt="Original" className="h-full w-full object-contain" />
                  </div>
                  <div className="px-3 py-2 border-t border-border">
                    <p className="font-mono text-[11px] text-foreground">{formatBytes(imgInfo.size)}</p>
                    <p className="font-mono text-[10px] text-foreground-muted/50">{imgInfo.width} × {imgInfo.height} px</p>
                  </div>
                </div>

                {/* Cropped */}
                <div className="border border-border bg-surface">
                  <div className="px-3 py-2 border-b border-border">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— cropped</span>
                  </div>
                  <div className="h-40 overflow-hidden flex items-center justify-center" style={CHECKERBOARD}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.url} alt="Cropped" className="h-full w-full object-contain" />
                  </div>
                  <div className="px-3 py-2 border-t border-border">
                    <p className="font-mono text-[11px] text-foreground">{formatBytes(result.size)}</p>
                    <p className="font-mono text-[10px] text-foreground-muted/50">{result.width} × {result.height} px</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button onClick={handleDownload}
                  className="w-full font-mono text-[11px] uppercase tracking-wider px-6 py-3 border border-foreground-muted text-foreground hover:border-primary/40 hover:text-primary transition-colors">
                  ↓ download
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
