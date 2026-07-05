"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import {
  validatePdfFile,
  loadPdfLib,
  loadPdfJs,
  renderThumbnails,
  renderPageToCanvas,
  downloadPDF,
  stemName,
} from "@/lib/utils/pdfUtils";
import { StandardFonts, rgb } from "pdf-lib";
import { PageSelector } from "./PageSelector";
import { PdfDropZone } from "./PdfDropZone";
type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

const labelCls =
  "font-mono text-[9px] uppercase tracking-widest text-foreground-muted/55 block mb-1.5";
const inputCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2 text-foreground outline-none focus:border-foreground-muted/50 transition-colors";
const btnPrimary =
  "w-full font-mono text-[10px] uppercase tracking-widest border border-primary/40 text-primary hover:border-primary transition-colors px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed";
const posBtnCls = (active: boolean) =>
  cn(
    "flex-1 font-mono text-[8px] uppercase py-1 border transition-colors",
    active
      ? "border-primary text-primary bg-primary/5"
      : "border-border text-foreground-muted/40 hover:border-foreground-muted/30"
  );

const POSITIONS: { value: Position; label: string }[] = [
  { value: "top-left", label: "TL" },
  { value: "top-center", label: "TC" },
  { value: "top-right", label: "TR" },
  { value: "bottom-left", label: "BL" },
  { value: "bottom-center", label: "BC" },
  { value: "bottom-right", label: "BR" },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

export function PdfPageNumber() {
  const fullscreen = useToolFullscreen();
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  // Number settings
  const [position, setPosition] = useState<Position>("bottom-center");
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(10);
  const [color, setColor] = useState("#555555");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  // Preview state
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadFile = useCallback(async (f: File) => {
    const err = validatePdfFile(f);
    if (err) { setFileError(err); return; }
    setFileError(null);
    setFile(f);
    setThumbnails([]);
    setSelected(new Set());
    setPreviewSrc(null);
    setError(null);
    setThumbLoading(true);
    try {
      const doc = await loadPdfJs(f);
      await doc.destroy();
      const thumbs = await renderThumbnails(f, 100);
      setThumbnails(thumbs);
      setSelected(new Set(thumbs.map((_, i) => i)));
    } catch {
      setFileError("Could not read PDF — it may be corrupt or password-protected.");
      setFile(null);
    } finally {
      setThumbLoading(false);
    }
  }, []);

  // ── Live preview on first page ─────────────────────────────────────────────

  const buildPreview = useCallback(async () => {
    if (!file || thumbnails.length === 0) return;
    try {
      // Render the first page at reasonable width
      const pdfjsDoc = await loadPdfJs(file);
      const canvas = await renderPageToCanvas(pdfjsDoc, 1, 800);
      await pdfjsDoc.destroy();

      const ctx = canvas.getContext("2d")!;
      const { r, g, b } = hexToRgb(color);
      ctx.fillStyle = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
      ctx.font = `${fontSize * (canvas.width / 595)}px monospace`;
      ctx.textBaseline = "middle";

      const pageNum = startNumber; // first page number
      const text = `${prefix}${pageNum}${suffix}`;
      const tw = ctx.measureText(text).width;
      const margin = 20 * (canvas.width / 595);
      const row = position.startsWith("top");
      const x =
        position.endsWith("left") ? margin :
        position.endsWith("right") ? canvas.width - margin - tw :
        canvas.width / 2 - tw / 2;
      const y = row ? margin * 1.5 : canvas.height - margin * 1.5;

      ctx.fillText(text, x, y);
      setPreviewSrc(canvas.toDataURL("image/jpeg", 0.92));
    } catch { /* silent */ }
  }, [file, thumbnails, position, startNumber, fontSize, color, prefix, suffix]);

  useEffect(() => {
    if (!file || thumbnails.length === 0) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(buildPreview, 300);
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); };
  }, [buildPreview, file, thumbnails.length]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  };

  const apply = useCallback(async () => {
    if (!file) return;
    if (selected.size === 0) { setError("Select at least one page to number."); return; }
    if (startNumber < 1 || startNumber > 9999) { setError("Start number must be between 1 and 9999."); return; }
    if (fontSize < 4 || fontSize > 72) { setError("Font size must be between 4 and 72."); return; }
    setBusy(true);
    setError(null);

    try {
      const doc = await loadPdfLib(file);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const { r, g, b } = hexToRgb(color);
      const textColor = rgb(r, g, b);

      const sortedPages = Array.from(selected).sort((a, b) => a - b);
      let counter = startNumber;

      for (const pageIdx of sortedPages) {
        const page = doc.getPage(pageIdx);
        const { width, height } = page.getSize();
        const text = `${prefix}${counter}${suffix}`;
        const tw = font.widthOfTextAtSize(text, fontSize);
        const margin = 20;
        const row = position.startsWith("top");
        const x =
          position.endsWith("left") ? margin :
          position.endsWith("right") ? width - margin - tw :
          width / 2 - tw / 2;
        const y = row ? height - margin - fontSize : margin;

        page.drawText(text, { x, y, size: fontSize, font, color: textColor });
        counter++;
      }

      const bytes = await doc.save({ useObjectStreams: true });
      downloadPDF(bytes, `${stemName(file.name)}-numbered.pdf`);
    } catch {
      setError("Failed to add page numbers — the PDF may be corrupt or encrypted.");
    } finally {
      setBusy(false);
    }
  }, [file, selected, position, startNumber, fontSize, color, prefix, suffix]);

  const reset = () => {
    setFile(null);
    setThumbnails([]);
    setSelected(new Set());
    setPreviewSrc(null);
    setError(null);
    setFileError(null);
  };

  return (
    <div className={cn("space-y-6", fullscreen && "flex-1 min-h-0 flex flex-col")}>
      {/* Fullscreen button */}
      <div className="flex justify-end gap-2">
        {file && !fileError && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase text-foreground-muted border border-border hover:text-primary hover:border-primary/40 transition-colors"
          >
            Reset
          </button>
        )}
        <FullscreenButton />
      </div>

      <PdfDropZone
        onFile={loadFile}
        dragging={dragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        currentFile={file}
        hint="Max 200 MB"
      />

      {fileError && (
        <p className="font-mono text-[10px] text-red-500/70 border border-red-500/20 px-3 py-2 bg-red-500/5">
          {fileError}
        </p>
      )}

      {thumbLoading && (
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
          <span className="font-mono text-[9px] text-foreground-muted/40">Loading…</span>
        </div>
      )}

      {file && !thumbLoading && thumbnails.length > 0 && (
        <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch", fullscreen && "flex-1 min-h-0 overflow-y-auto")}>
          {/* Left: settings */}
          <div className="space-y-5">
            {/* Page selector */}
            <PageSelector
              thumbnails={thumbnails}
              selected={selected}
              onChange={setSelected}
              label="Pages to number"
              maxHeight={220}
            />

            {/* Position */}
            <div>
              <span className={labelCls}>Position</span>
              <div className="grid grid-cols-3 gap-1">
                {POSITIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPosition(value)}
                    className={posBtnCls(position === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Number settings row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Start number</label>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={startNumber}
                  onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Font size (pt) · 4 - 72</label>
                <input
                  type="number"
                  min={4}
                  max={72}
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.max(4, Math.min(72, parseInt(e.target.value) || 10)))}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Prefix / Suffix / Color */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.slice(0, 20))}
                  placeholder="e.g. Page "
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value.slice(0, 20))}
                  placeholder="e.g.  of 10"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-9 border border-border bg-surface-muted cursor-pointer p-0"
                    style={{ padding: "1px" }}
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setColor(v);
                    }}
                    className={cn(inputCls, "text-xs")}
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={apply} disabled={busy || selected.size === 0} className={btnPrimary}>
                {busy ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
                    Adding numbers…
                  </span>
                ) : `Add page numbers & Download`}
              </button>
            </div>

            {error && (
              <p className="font-mono text-[10px] text-red-500/70 border border-red-500/20 px-3 py-2 bg-red-500/5">
                {error}
              </p>
            )}
          </div>

          {/* Right: preview — flex-col so the box stretches to match left column height */}
          <div className="flex flex-col gap-2">
            <span className={labelCls}>
              Preview — first page
              <span className="ml-2 normal-case text-foreground-muted/30">(live)</span>
            </span>
            <div className="flex-1 border border-border bg-surface-muted overflow-hidden flex items-start justify-center min-h-[240px]">
              {previewSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSrc}
                  alt="PDF page preview"
                  className="w-full block"
                />
              ) : (
                <span className="font-mono text-[9px] text-foreground-muted/25 uppercase tracking-widest self-center">
                  Preview loading…
                </span>
              )}
            </div>
           
          </div>
        </div>
      )}
    </div>
  );
}
