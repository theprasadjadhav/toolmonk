"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import {
  validatePdfFile,
  loadPdfLib,
  loadPdfJs,
  renderThumbnails,
  renderThumbnailsFromBytes,
  downloadPDF,
  stemName,
} from "@/lib/utils/pdfUtils";
import { degrees } from "pdf-lib";
import { PageSelector } from "./PageSelector";
import { PdfDropZone } from "./PdfDropZone";

const labelCls =
  "font-mono text-[9px] uppercase tracking-widest text-foreground-muted/55 block mb-1";
const btnPrimary =
  "w-full font-mono text-[10px] uppercase tracking-widest border border-primary/40 text-primary hover:border-primary transition-colors px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed";
const rotBtnCls = (active: boolean) =>
  cn(
    "w-full flex items-center gap-2 px-4 py-2.5 border font-mono transition-colors",
    active
      ? "border-primary/40 text-primary "
      : "border-border text-foreground-muted/60 hover:border-foreground-muted/40 hover:text-foreground"
  );

type RotAngle = 90 | -90 | 180;

export function PdfRotate() {
  const fullscreen = useToolFullscreen();
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rotation, setRotation] = useState<RotAngle>(90);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [rotatedBytes, setRotatedBytes] = useState<Uint8Array | null>(null);

  const loadFile = useCallback(async (f: File) => {
    const err = validatePdfFile(f);
    if (err) { setFileError(err); return; }
    setFileError(null);
    setFile(f);
    setThumbnails([]);
    setSelected(new Set());
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

  const rotate = useCallback(async () => {
    if (!file) return;
    if (selected.size === 0) { setError("Select at least one page to rotate."); return; }
    setBusy(true);
    setError(null);
    setRotatedBytes(null);
    try {
      const doc = await loadPdfLib(file);
      for (const pageIdx of selected) {
        const page = doc.getPage(pageIdx);
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + rotation + 360) % 360));
      }
      const bytes = await doc.save({ useObjectStreams: true });
      setRotatedBytes(bytes);

      // Pass a copy to pdfjs — it transfers the ArrayBuffer to the worker thread,
      // which would detach the original `bytes` and corrupt the download.
      setThumbLoading(true);
      const newThumbs = await renderThumbnailsFromBytes(bytes.slice(), 100);
      setThumbnails(newThumbs);
      setThumbLoading(false);
    } catch {
      setError("Rotation failed — the PDF may be corrupt or encrypted.");
    } finally {
      setBusy(false);
    }
  }, [file, selected, rotation]);

  const reset = () => {
    setFile(null);
    setThumbnails([]);
    setSelected(new Set());
    setError(null);
    setFileError(null);
    setRotatedBytes(null);
  };

  return (
    <div className={cn("space-y-6", fullscreen && "h-full flex flex-col")}>
      {/* Fullscreen button */}
      <div className="flex justify-end gap-2">
        {file && !fileError && <button
          onClick={reset}
          className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase text-foreground-muted border border-border hover:text-primary hover:border-primary/40 transition-colors"
        >
          Reset
        </button>}
        <FullscreenButton />
      </div>

      <PdfDropZone
        onFile={loadFile}
        currentFile={file}
        hint="Max 200 MB"
      />

      {fileError && (
        <p className="font-mono text-[10px] text-red-500/70 border border-red-500/20 px-3 py-2 bg-red-500/5">
          {fileError}
        </p>
      )}

      {file && thumbnails.length > 0 && (
        <>
          {/* Page selector — skeleton overlay while busy or reloading thumbnails */}
          {(busy || thumbLoading) ? (
            <div className="space-y-2">
              <span className={labelCls}>Select pages to rotate</span>
              <div
                className="overflow-hidden border border-border p-2 relative"
                style={{ maxHeight: 280 }}
              >
                {/* Ghost thumbnail grid */}
                <div
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}
                >
                  {thumbnails.map((_, idx) => (
                    <div
                      key={idx}
                      className="aspect-[3/4] bg-surface-muted animate-pulse border border-border/40"
                    />
                  ))}
                </div>
                {/* Centred message over the grid */}
                <div className="absolute inset-0 flex items-center justify-center bg-surface/60 backdrop-blur-[2px]">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
                    <span className="font-mono text-[9px] text-foreground-muted/60">
                      {busy ? "Rotating pages…" : "Refreshing thumbnails…"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <PageSelector
              thumbnails={thumbnails}
              selected={selected}
              onChange={setSelected}
              label="Select pages to rotate"
              maxHeight={280}
            />
          )}

          {/* Rotation buttons — disabled while busy */}
          <div className="space-y-2">
            <span className={labelCls}>Rotation</span>
            <div className="flex gap-2">
              {([
                { label: "90° Left", val: -90 as RotAngle, icon: "↺" },
                { label: "90° Right", val: 90 as RotAngle, icon: "↻" },
                { label: "180°", val: 180 as RotAngle, icon: "↕" },
              ] as const).map(({ label, val, icon }) => (
                <button
                  key={val}
                  type="button"
                  disabled={busy}
                  onClick={() => setRotation(val)}
                  className={cn(rotBtnCls(rotation === val), busy && "opacity-30 cursor-not-allowed")}
                >
                  <span className="leading-none pb-1">{icon}</span>
                  <span className="text-[9px] uppercase tracking-widest">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions — Rotate + Download side by side */}
          <div className="flex gap-3">
            <button
              onClick={rotate}
              disabled={busy || selected.size === 0}
              className={btnPrimary}
            >
              {`Rotate ${selected.size} page${selected.size !== 1 ? "s" : ""}`}
            </button>

            {rotatedBytes && (
              <button
                disabled={busy}
                onClick={() => downloadPDF(rotatedBytes, `${stemName(file!.name)}-rotated.pdf`)}
                className={btnPrimary}
              >
                Download
              </button>
            )}
          </div>

          {error && (
            <p className="font-mono text-[10px] text-red-500/70 border border-red-500/20 px-3 py-2 bg-red-500/5">
              {error}
            </p>
          )}
        </>
      )}

      {file && thumbnails.length === 0 && thumbLoading && (
        <div className="space-y-2">
          <span className={labelCls}>Select pages to rotate</span>
          <div
            className="overflow-hidden border border-border p-2 relative"
            style={{ maxHeight: 280 }}
          >
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-[3/4] bg-surface-muted animate-pulse border border-border/40"
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-surface/60 backdrop-blur-[2px]">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
                <span className="font-mono text-[9px] text-foreground-muted/60">Loading thumbnails…</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
