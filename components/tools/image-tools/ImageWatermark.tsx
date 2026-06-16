"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useReducer,
} from "react";
import { cn } from "@/lib/utils/cn";
import { DropZone } from "@/components/ui/DropZone";
import {
  validateImageFile,
  stemName,
  downloadBlob,
  type OutputFormat,
} from "@/lib/utils/image";

// ── Style tokens ───────────────────────────────────────────────────────────────
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
const MAX_CANVAS_DIM = 16384;
const MAX_FILES = 50;

const FONTS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Impact",
  "Trebuchet MS",
  "Verdana",
] as const;

type FontFamily = (typeof FONTS)[number];

type Position =
  | "TL" | "TC" | "TR"
  | "ML" | "MC" | "MR"
  | "BL" | "BC" | "BR";

const POSITIONS: Position[] = [
  "TL", "TC", "TR",
  "ML", "MC", "MR",
  "BL", "BC", "BR",
];

const POSITION_LABELS: Record<Position, string> = {
  TL: "↖", TC: "↑", TR: "↗",
  ML: "←", MC: "·", MR: "→",
  BL: "↙", BC: "↓", BR: "↘",
};

// ── Watermark options ──────────────────────────────────────────────────────────
interface WatermarkOptions {
  text: string;
  fontFamily: FontFamily;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string;
  opacity: number;
  position: Position;
  repeat: boolean;
  gap: number;
  rotation: number;
  margin: number;
  outputFormat: OutputFormat;
}

type Action =
  | { type: "SET"; key: keyof WatermarkOptions; value: WatermarkOptions[keyof WatermarkOptions] }
  | { type: "TOGGLE_REPEAT" }
  | { type: "TOGGLE_BOLD" }
  | { type: "TOGGLE_ITALIC" };

const defaultOptions: WatermarkOptions = {
  text: "© Your Name",
  fontFamily: "Arial",
  fontSize: 40,
  bold: false,
  italic: false,
  color: "#ffffff",
  opacity: 70,
  position: "MC",
  repeat: false,
  gap: 80,
  rotation: 0,
  margin: 20,
  outputFormat: "original",
};

function optionsReducer(state: WatermarkOptions, action: Action): WatermarkOptions {
  switch (action.type) {
    case "SET":           return { ...state, [action.key]: action.value };
    case "TOGGLE_REPEAT": return { ...state, repeat: !state.repeat, rotation: !state.repeat ? -30 : 0 };
    case "TOGGLE_BOLD":   return { ...state, bold: !state.bold };
    case "TOGGLE_ITALIC": return { ...state, italic: !state.italic };
    default:              return state;
  }
}

// ── Canvas drawing ─────────────────────────────────────────────────────────────
function drawWatermark(canvas: HTMLCanvasElement, img: HTMLImageElement, opts: WatermarkOptions): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  if (!opts.text) return;

  const fontStr = [
    opts.italic ? "italic" : "",
    opts.bold   ? "bold"   : "",
    `${opts.fontSize}px`,
    opts.fontFamily,
  ].filter(Boolean).join(" ");

  ctx.font         = fontStr;
  ctx.fillStyle    = opts.color;
  ctx.globalAlpha  = opts.opacity / 100;
  ctx.textBaseline = "middle";

  if (opts.repeat) {
    const tw  = ctx.measureText(opts.text).width;
    const th  = opts.fontSize * 1.2;
    const gap = opts.gap;
    for (let row = -canvas.height; row < canvas.height * 2; row += th + gap) {
      for (let col = -canvas.width; col < canvas.width * 2; col += tw + gap) {
        ctx.save();
        ctx.translate(col + tw / 2, row + th / 2);
        ctx.rotate((opts.rotation * Math.PI) / 180);
        ctx.fillText(opts.text, 0, 0);
        ctx.restore();
      }
    }
  } else {
    const tw  = ctx.measureText(opts.text).width;
    const th  = opts.fontSize;
    const m   = opts.margin;
    const pos = opts.position;
    let x = m + tw / 2;
    let y = m + th / 2;
    if (pos.endsWith("C")) x = canvas.width / 2;
    if (pos.endsWith("R")) x = canvas.width - m - tw / 2;
    if (pos.startsWith("M")) y = canvas.height / 2;
    if (pos.startsWith("B")) y = canvas.height - m - th / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((opts.rotation * Math.PI) / 180);
    ctx.textAlign = "center";
    ctx.fillText(opts.text, 0, 0);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

function resolveOutputMime(format: OutputFormat, originalMime: string): string {
  switch (format) {
    case "jpeg": return "image/jpeg";
    case "png":  return "image/png";
    case "webp": return "image/webp";
    default:     return originalMime || "image/jpeg";
  }
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case "image/png":  return "png";
    case "image/webp": return "webp";
    case "image/gif":  return "gif";
    default:           return "jpg";
  }
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
export function ImageWatermark() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [fileError,   setFileError]   = useState("");
  const [limitError,  setLimitError]  = useState("");
  const [canvasError, setCanvasError] = useState("");
  const [dragging,   setDragging]   = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress,   setProgress]   = useState("");
  const [opts, dispatch] = useReducer(optionsReducer, defaultOptions);
  const [hexInput, setHexInput] = useState(defaultOptions.color);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const debounceRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageFilesRef   = useRef<ImageFile[]>([]);
  const nextIdRef       = useRef(0);
  imageFilesRef.current = imageFiles;

  // ── Preview redraw ─────────────────────────────────────────────────────────
  const previewImage = imageFiles[previewIdx] ?? imageFiles[0] ?? null;

  const schedulePreview = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!previewImage || !previewCanvasRef.current) return;
      try {
        drawWatermark(previewCanvasRef.current, previewImage.imgEl, opts);
        setCanvasError("");
      } catch (e) {
        setCanvasError("Failed to render watermark preview. Try a different image or adjust the settings.");
      }
    }, 200);
  }, [previewImage, opts]);

  useEffect(() => {
    schedulePreview();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [schedulePreview]);

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
      setLimitError(`Maximum ${MAX_FILES} images reached. Remove some images to add more.`);
      setTimeout(()=>setLimitError(""),5000)
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
        if (img.naturalWidth > MAX_CANVAS_DIM || img.naturalHeight > MAX_CANVAS_DIM) {
          URL.revokeObjectURL(url);
          setFileError(`${file.name}: too large (max ${MAX_CANVAS_DIM}px per side).`);
          return;
        }
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
    setCanvasError("");
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

  // ── Color helpers ──────────────────────────────────────────────────────────
  const onColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET", key: "color", value: e.target.value });
    setHexInput(e.target.value);
  };
  const onHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value);
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value))
      dispatch({ type: "SET", key: "color", value: e.target.value });
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const download = useCallback(async () => {
    if (!imageFiles.length || !opts.text) return;
    setDownloading(true);
    setProgress("");

    try {
      if (imageFiles.length === 1) {
        const imgFile = imageFiles[0];
        const canvas = document.createElement("canvas");
        drawWatermark(canvas, imgFile.imgEl, opts);
        const mime = resolveOutputMime(opts.outputFormat, imgFile.file.type);
        const blob = await canvasToBlob(canvas, mime);
        downloadBlob(blob, `${stemName(imgFile.file.name)}-watermarked.${mimeToExt(mime)}`);
      } else {
        // Lazy-load JSZip
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        const total = imageFiles.length;

        await Promise.all(imageFiles.map(async (imgFile, i) => {
          const canvas = document.createElement("canvas");
          drawWatermark(canvas, imgFile.imgEl, opts);
          const mime = resolveOutputMime(opts.outputFormat, imgFile.file.type);
          const blob = await canvasToBlob(canvas, mime);
          zip.file(`${stemName(imgFile.file.name)}-watermarked.${mimeToExt(mime)}`, blob);
          setProgress(`${i + 1} / ${total}`);
        }));

        setProgress("Zipping…");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "watermarked-images.zip");
      }
    } catch (e) {
      setCanvasError("Failed to download images. Try again or process fewer images at once.");
    } finally {
      setDownloading(false);
      setProgress("");
    }
  }, [imageFiles, opts]);

  const hasFiles = imageFiles.length > 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

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
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 border-2 border-dashed cursor-pointer transition-colors",
            dragging
              ? "border-primary/80 bg-surface-muted"
              : "border-border hover:border-foreground-muted/40 hover:bg-surface-muted",
          )}
          onClick={() => fileInputRef.current?.click()}
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
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onInputChange} />
        </div>
      )}

      {fileError  && <p className={errCls}>{fileError}</p>}
      {limitError && <p className={errCls}>{limitError}</p>}

      {/* ── Image list + controls ──────────────────────────────────────── */}
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

          {/* Preview canvas — shows previewIdx image */}
          <div className="border border-border bg-surface-muted" style={{ maxHeight: 320 }}>
            <canvas
              ref={previewCanvasRef}
              className="block mx-auto max-w-full object-contain"
              style={{ maxHeight: 320 }}
            />
          </div>
          {canvasError && <p className={errCls}>{canvasError}</p>}

          {/* Watermark text */}
          <div>
            <label className={labelCls}>— watermark text</label>
            <input
              type="text"
              maxLength={200}
              value={opts.text}
              onChange={(e) => dispatch({ type: "SET", key: "text", value: e.target.value })}
              placeholder="Enter watermark text…"
              className={inputCls}
            />
            {!opts.text && <p className={errCls}>Enter text to enable download.</p>}
          </div>

          {/* Controls grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Left column */}
            <div className="space-y-4">

              <div>
                <label className={labelCls}>— font family</label>
                <select
                  value={opts.fontFamily}
                  onChange={(e) => dispatch({ type: "SET", key: "fontFamily", value: e.target.value as FontFamily })}
                  className={cn(inputCls, "cursor-pointer")}
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>— font size — {opts.fontSize}px</label>
                <input type="range" min={12} max={120} value={opts.fontSize}
                  onChange={(e) => dispatch({ type: "SET", key: "fontSize", value: Number(e.target.value) })}
                  className="w-full accent-primary" />
              </div>

              <div className="flex gap-3 justify-between">
                <div>
                  <label className={labelCls}>— style</label>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => dispatch({ type: "TOGGLE_BOLD" })}
                      className={cn("font-mono text-[11px] px-4 py-2.5 border transition-colors font-bold",
                        opts.bold ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>B</button>
                    <button onClick={() => dispatch({ type: "TOGGLE_ITALIC" })}
                      className={cn("font-mono text-[11px] px-4 py-2.5 border transition-colors italic",
                        opts.italic ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>I</button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>— color</label>
                  <div className="flex items-center gap-2">
                    <div className="relative shrink-0">
                      <div className="w-[42px] h-[42px] border border-border cursor-pointer" style={{ backgroundColor: opts.color }} />
                      <input type="color" value={opts.color} onChange={onColorPickerChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                    <input type="text" value={hexInput} onChange={onHexInputChange}
                      maxLength={7} placeholder="#ffffff" className={cn(inputCls, "flex-1")} />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>— opacity — {opts.opacity}%</label>
                <input type="range" min={0} max={100} value={opts.opacity}
                  onChange={(e) => dispatch({ type: "SET", key: "opacity", value: Number(e.target.value) })}
                  className="w-full accent-primary" />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">

              <div>
                <label className={labelCls}>— mode</label>
                <div className="flex gap-2">
                  <button onClick={() => opts.repeat && dispatch({ type: "TOGGLE_REPEAT" })}
                    className={cn("font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 border flex-1 transition-colors",
                      !opts.repeat ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
                    single
                  </button>
                  <button onClick={() => !opts.repeat && dispatch({ type: "TOGGLE_REPEAT" })}
                    className={cn("font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 border flex-1 transition-colors",
                      opts.repeat ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
                    repeat
                  </button>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                {!opts.repeat && (
                  <div>
                    <label className={labelCls}>— position</label>
                    <div className="grid grid-cols-3 gap-px w-28">
                      {POSITIONS.map((pos) => (
                        <button key={pos}
                          onClick={() => dispatch({ type: "SET", key: "position", value: pos })}
                          title={pos}
                          className={cn("font-mono text-sm w-8 h-8 border transition-colors flex items-center justify-center",
                            opts.position === pos ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
                          {POSITION_LABELS[pos]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={cn("w-full space-y-3", !opts.repeat && "pt-5")}>
                  {opts.repeat && (
                    <div>
                      <label className={labelCls}>— gap — {opts.gap}px</label>
                      <input type="range" min={0} max={200} value={opts.gap}
                        onChange={(e) => dispatch({ type: "SET", key: "gap", value: Number(e.target.value) })}
                        className="w-full accent-primary" />
                    </div>
                  )}
                  <div>
                    <label className={labelCls}>— rotation — {opts.rotation}°</label>
                    <input type="range" min={-90} max={90} value={opts.rotation}
                      onChange={(e) => dispatch({ type: "SET", key: "rotation", value: Number(e.target.value) })}
                      className="w-full accent-primary" />
                  </div>
                  {!opts.repeat && (
                    <div>
                      <label className={labelCls}>— margin — {opts.margin}px</label>
                      <input type="range" min={0} max={100} value={opts.margin}
                        onChange={(e) => dispatch({ type: "SET", key: "margin", value: Number(e.target.value) })}
                        className="w-full accent-primary" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>— output format</label>
                <div className="flex gap-2">
                  {(["original", "jpeg", "png", "webp"] as OutputFormat[]).map((fmt) => (
                    <button key={fmt}
                      onClick={() => dispatch({ type: "SET", key: "outputFormat", value: fmt })}
                      className={cn("font-mono text-[10px] uppercase tracking-wider px-3 py-2.5 border flex-1 transition-colors",
                        opts.outputFormat === fmt ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Download */}
          <div className="pt-1 border-border">
            <button
              onClick={download}
              disabled={!opts.text || downloading || !!canvasError}
              className={cn(
                "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
                opts.text && !downloading && !canvasError
                  ? "hover:border-primary/40 hover:text-primary hover:bg-surface-muted"
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
