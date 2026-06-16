"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { DropZone } from "@/components/ui/DropZone";
import {
  type OutputFormat,
  getOutputMime,
  getOutputExtension,
  stemName,
  downloadBlob,
  validateImageFile,
} from "@/lib/utils/image";

// ── Style constants ────────────────────────────────────────────────────────────

const labelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const inputCls =
  "w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";
const errCls = "font-mono text-[10px] text-red-500/70 mt-1";
const CHECKERBOARD: React.CSSProperties = {
  backgroundImage:
    "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 16px 16px",
};

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_FILES = 50;

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

// ── Canvas drawing ─────────────────────────────────────────────────────────────

interface DrawOptions {
  img: HTMLImageElement;
  angle: number;
  flipH: boolean;
  flipV: boolean;
  expandCanvas: boolean;
  bgColor: string;
}

interface CanvasDimensions {
  width: number;
  height: number;
}

function computeDimensions(img: HTMLImageElement, angle: number, expand: boolean): CanvasDimensions {
  if (!expand) return { width: img.naturalWidth, height: img.naturalHeight };
  const rad = (angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const w = img.naturalWidth * cos + img.naturalHeight * sin;
  const h = img.naturalWidth * sin + img.naturalHeight * cos;
  return { width: Math.ceil(w), height: Math.ceil(h) };
}

function drawToCanvas(canvas: HTMLCanvasElement, { img, angle, flipH, flipV, expandCanvas, bgColor }: DrawOptions) {
  const { width, height } = computeDimensions(img, angle, expandCanvas);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width / 2, height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  if (flipH) ctx.scale(-1, 1);
  if (flipV) ctx.scale(1, -1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string): Promise<Blob> {
  return new Promise((res, rej) =>
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("toBlob returned null"))),
      mime,
      mime === "image/png" ? undefined : 0.92,
    )
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ImageFile {
  id: number;
  file: File;
  objectUrl: string;
  imgEl: HTMLImageElement;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ImageRotator() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [limitError, setLimitError] = useState("");

  // Controls
  const [angle, setAngle] = useState(0);
  const [angleInput, setAngleInput] = useState("0");
  const [angleError, setAngleError] = useState<string | null>(null);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [expandCanvas, setExpandCanvas] = useState(true);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgHexInput, setBgHexInput] = useState("#ffffff");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
  const [outDims, setOutDims] = useState<CanvasDimensions | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState("");

  const inputRef       = useRef<HTMLInputElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageFilesRef  = useRef<ImageFile[]>([]);
  const nextIdRef      = useRef(0);
  imageFilesRef.current = imageFiles;

  const previewImage = imageFiles[previewIdx] ?? imageFiles[0] ?? null;

  // ── Debounced preview redraw ───────────────────────────────────────────────

  const scheduleRedraw = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!previewImage || !canvas) return;
      drawToCanvas(canvas, { img: previewImage.imgEl, angle, flipH, flipV, expandCanvas, bgColor });
      const { width, height } = computeDimensions(previewImage.imgEl, angle, expandCanvas);
      setOutDims({ width, height });
    }, 150);
  }, [previewImage, angle, flipH, flipV, expandCanvas, bgColor]);

  useEffect(() => {
    scheduleRedraw();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [scheduleRedraw]);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => { imageFilesRef.current.forEach((f) => URL.revokeObjectURL(f.objectUrl)); };
  }, []);

  // ── Load files ─────────────────────────────────────────────────────────────

  const loadFiles = useCallback((files: File[]) => {
    setFileError("");
    const available = MAX_FILES - imageFilesRef.current.length;
    const toLoad = files.slice(0, available);
    if (toLoad.length === 0) {
      setLimitError(`Maximum ${MAX_FILES} images reached. Remove some to add more.`);
      setTimeout(() => setLimitError(""), 5000);
      return;
    }
    if (files.length > toLoad.length) {
      setLimitError(`Maximum ${MAX_FILES} images allowed — ${files.length - toLoad.length} file(s) skipped.`);
      setTimeout(() => setLimitError(""), 5000);
    } else {
      setLimitError("");
    }

    toLoad.forEach((file) => {
      const err = validateImageFile(file);
      if (err) { setFileError(err); return; }

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImageFiles((prev) => [...prev, { id: nextIdRef.current++, file, objectUrl: url, imgEl: img }]);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setFileError(`${file.name}: could not load image.`);
      };
      img.src = url;
    });
  }, []);

  const removeFile = useCallback((id: number) => {
    setImageFiles((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx !== -1) URL.revokeObjectURL(prev[idx].objectUrl);
      const next = prev.filter((f) => f.id !== id);
      setPreviewIdx((p) => Math.min(p, Math.max(0, next.length - 1)));
      if (next.length < MAX_FILES) setLimitError("");
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    imageFilesRef.current.forEach((f) => URL.revokeObjectURL(f.objectUrl));
    setImageFiles([]);
    setPreviewIdx(0);
    setFileError("");
    setLimitError("");
    setOutDims(null);
  }, []);

  // ── Drag & drop ────────────────────────────────────────────────────────────

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) loadFiles(files);
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) loadFiles(files);
    e.target.value = "";
  };

  // ── Angle helpers ──────────────────────────────────────────────────────────

  const validateAngle = (raw: string): boolean => {
    const n = parseFloat(raw);
    if (raw === "" || isNaN(n)) { setAngleError("Enter a number between -360 and 360"); return false; }
    if (n < -360 || n > 360)   { setAngleError("Angle must be between -360 and 360");  return false; }
    setAngleError(null);
    return true;
  };

  const handleAngleInput = (raw: string) => {
    setAngleInput(raw);
    if (validateAngle(raw)) setAngle(parseFloat(raw));
  };

  const applyAngleDelta = (delta: number) => {
    const next = ((angle + delta) % 360 + 360) % 360;
    const nextDisplay = next > 180 ? next - 360 : next;
    setAngle(nextDisplay);
    setAngleInput(String(nextDisplay));
    setAngleError(null);
  };

  // ── Background hex input ───────────────────────────────────────────────────

  const handleBgHexInput = (v: string) => {
    setBgHexInput(v);
    const full = v.startsWith("#") ? v : "#" + v;
    if (/^#[0-9a-fA-F]{6}$/.test(full)) setBgColor(full.toLowerCase());
  };

  // ── Download ───────────────────────────────────────────────────────────────

  const handleDownload = useCallback(async () => {
    if (!imageFiles.length || !!angleError) return;
    setDownloading(true);
    setProgress("");

    const drawOpts = { angle, flipH, flipV, expandCanvas, bgColor };

    try {
      if (imageFiles.length === 1) {
        const imgFile = imageFiles[0];
        const canvas = document.createElement("canvas");
        drawToCanvas(canvas, { img: imgFile.imgEl, ...drawOpts });
        const outMime = getOutputMime(outputFormat, imgFile.file.type);
        const ext = getOutputExtension(outMime);
        const blob = await canvasToBlob(canvas, outMime);
        downloadBlob(blob, `${stemName(imgFile.file.name)}-rotated.${ext}`);
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        const total = imageFiles.length;

        await Promise.all(imageFiles.map(async (imgFile, i) => {
          const canvas = document.createElement("canvas");
          drawToCanvas(canvas, { img: imgFile.imgEl, ...drawOpts });
          const outMime = getOutputMime(outputFormat, imgFile.file.type);
          const ext = getOutputExtension(outMime);
          const blob = await canvasToBlob(canvas, outMime);
          zip.file(`${stemName(imgFile.file.name)}-rotated.${ext}`, blob);
          setProgress(`${i + 1} / ${total}`);
        }));

        setProgress("Zipping…");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "rotated-images.zip");
      }
    } catch (e) {
      setFileError("Failed to process one or more images. The file may be too large or in an unsupported format.");
    } finally {
      setDownloading(false);
      setProgress("");
    }
  }, [imageFiles, angle, flipH, flipV, expandCanvas, bgColor, outputFormat, angleError]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const hasFiles = imageFiles.length > 0;
  const canDownload = hasFiles && !downloading && !angleError;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Drop zone — full size when empty */}
      {!hasFiles && (
        <DropZone
          variant="image"
          accept="image/*"
          multiple
          hint={`JPEG, PNG, WebP, GIF, BMP, AVIF · max 50 MB each · up to ${MAX_FILES} images`}
          onFiles={(files) => {
            const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
            if (arr.length) loadFiles(arr);
          }}
        />
      )}

      {/* Compact add-more strip (shown when images are loaded) */}
      {hasFiles && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 border-2 border-dashed cursor-pointer transition-colors",
            dragging
              ? "border-primary/80 bg-surface-muted"
              : "border-border hover:border-foreground-muted/40 hover:bg-surface-muted",
          )}
        >
          <span className="font-mono text-[11px] text-foreground-muted">+ Add more images</span>
          <span className="font-mono text-[10px] text-foreground-muted/40">
            {imageFiles.length} loaded · max {MAX_FILES}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); clearAll(); }}
            className="ml-auto font-mono text-[11px] text-foreground-muted/60 hover:text-red-400/80 transition-colors shrink-0"
          >
            ✕ clear all
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onInputChange} />
        </div>
      )}

      {fileError  && <p className={errCls}>{fileError}</p>}
      {limitError && <p className={errCls}>{limitError}</p>}

      {/* ── Controls + Preview ────────────────────────────────────────────── */}
      {hasFiles && (
        <div className="space-y-5">

          {/* Thumbnail strip */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {imageFiles.map((imgFile, i) => (
              <div
                key={imgFile.id}
                onClick={() => setPreviewIdx(i)}
                className={cn(
                  "relative shrink-0 w-20 cursor-pointer border transition-colors",
                  i === previewIdx
                    ? "border-primary/60"
                    : "border-border hover:border-foreground-muted/40",
                )}
              >
                <div className="w-20 h-16 overflow-hidden flex items-center justify-center" style={CHECKERBOARD}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgFile.objectUrl} alt="" className="max-w-full max-h-full object-contain px-1" />
                </div>
                <p className="font-mono text-[9px] text-foreground-muted/60 truncate px-1 py-0.5 bg-surface-muted">
                  {imgFile.file.name}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(imgFile.id); }}
                  className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center bg-black/60 text-white font-mono text-[9px] hover:bg-red-500/80 transition-colors"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Live canvas preview */}
          <div className="border border-border bg-surface-muted" style={{ maxHeight: 256 }}>
            <canvas
              ref={canvasRef}
              className="block mx-auto max-w-full object-contain"
              style={{ maxHeight: 256 }}
            />
          </div>

          {/* Output dimensions */}
          {outDims && (
            <p className="font-mono text-[11px] text-foreground-muted/60">
              Output: <span className="text-foreground">{outDims.width} × {outDims.height} px</span>
            </p>
          )}

          {/* Controls — 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Left: flip / rotate / angle */}
            <div className="space-y-4">

              <div>
                <label className={labelCls}>— flip</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFlipH((v) => !v)}
                    className="font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 border flex-1 transition-colors border-border text-foreground-muted hover:text-primary hover:border-primary/40"
                  >
                    ↔ horizontal
                  </button>
                  <button
                    onClick={() => setFlipV((v) => !v)}
                    className="font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 border flex-1 transition-colors border-border text-foreground-muted hover:text-primary hover:border-primary/40"
                  >
                    ↕ vertical
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>— rotate</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => applyAngleDelta(-90)}
                    className="font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 border flex-1 transition-colors border-border text-foreground-muted hover:text-primary hover:border-primary/40"
                  >
                    ↺ 90° left
                  </button>
                  <button
                    onClick={() => applyAngleDelta(90)}
                    className="font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 border flex-1 transition-colors border-border text-foreground-muted hover:text-primary hover:border-primary/40"
                  >
                    ↻ 90° right
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>— angle (−360 to 360)</label>
                <input
                  type="number"
                  min="-360"
                  max="360"
                  step="1"
                  value={angleInput}
                  onChange={(e) => handleAngleInput(e.target.value)}
                  className={cn(inputCls, angleError && "border-red-400/60 focus:border-red-400")}
                />
                {angleError && <p className={errCls}>{angleError}</p>}
              </div>
            </div>

            {/* Right: canvas mode, bg color, output format */}
            <div className="space-y-4">

              <div>
                <label className={labelCls}>
                  — canvas: {expandCanvas ? "grows to fit rotated image" : "keeps original dimensions"}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandCanvas(true)}
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 border flex-1 transition-colors",
                      expandCanvas
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-foreground-muted hover:text-foreground",
                    )}
                  >
                    expand
                  </button>
                  <button
                    onClick={() => setExpandCanvas(false)}
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 border flex-1 transition-colors",
                      !expandCanvas
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-foreground-muted hover:text-foreground",
                    )}
                  >
                    clip
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>— background color</label>
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <div className="w-[42px] h-[40px] border border-border cursor-pointer" style={{ backgroundColor: bgColor }} />
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => { setBgColor(e.target.value.toLowerCase()); setBgHexInput(e.target.value.toLowerCase()); }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    maxLength={7}
                    value={bgHexInput}
                    spellCheck={false}
                    onChange={(e) => handleBgHexInput(e.target.value)}
                    className={cn(inputCls, "flex-1")}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>— output format</label>
                <div className="flex gap-2">
                  {FORMAT_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setOutputFormat(value)}
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-wider px-3 py-2.5 border flex-1 transition-colors",
                        outputFormat === value
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border text-foreground-muted hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Download button */}
          <div className="pt-1 border-border">
            <button
              onClick={handleDownload}
              disabled={!canDownload}
              className={cn(
                "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
                canDownload
                  ? "border-foreground-muted text-foreground hover:text-primary hover:border-primary/40"
                  : "border-border text-foreground-muted/40 cursor-not-allowed",
              )}
            >
              {downloading
                ? progress ? `Processing… ${progress}` : "Generating…"
                : imageFiles.length > 1
                  ? `↓ Download ZIP (${imageFiles.length} images)`
                  : "↓ Download"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
