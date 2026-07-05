"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import {
  validatePdfFile,
  loadPdfLib,
  renderThumbnails,
  downloadPDF,
  formatBytes,
  stemName,
} from "@/lib/utils/pdfUtils";
import { PDFDocument } from "pdf-lib";
import { PageSelector } from "./PageSelector";
import { PdfMultiDropZone } from "./PdfDropZone";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MergeFile {
  id: string;
  file: File;
  thumbnails: string[];
  selected: Set<number>;
  thumbLoading: boolean;
  error: string | null;
}

// ─── Label / btn helpers ──────────────────────────────────────────────────────

const labelCls =
  "font-mono text-[9px] uppercase tracking-widest text-foreground-muted/55 block mb-1";
const errCls = "font-mono text-[10px] text-red-500/70";
const btnPrimary =
  "flex-1 font-mono text-[10px] uppercase tracking-widest border border-primary/40 text-primary hover:border-primary transition-colors px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed";
const btnGhost =
  "font-mono text-[9px] uppercase tracking-widest border border-border text-foreground-muted hover:text-primary hover:border-primary/40 transition-colors px-3 py-1.5";

// ─── Component ────────────────────────────────────────────────────────────────

export function PdfMerger() {
  const fullscreen = useToolFullscreen();
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag reorder state
  const dragFromIdx = useRef<number | null>(null);

  // ── File loading ──────────────────────────────────────────────────────────

  const loadFiles = useCallback(async (incoming: File[]) => {
    const toAdd: MergeFile[] = incoming.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      thumbnails: [],
      selected: new Set<number>(),
      thumbLoading: true,
      error: null,
    }));

    setFiles((prev) => [...prev, ...toAdd]);
    setError(null);

    for (const mf of toAdd) {
      const err = validatePdfFile(mf.file);
      if (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === mf.id ? { ...f, thumbLoading: false, error: err } : f
          )
        );
        continue;
      }
      try {
        const thumbs = await renderThumbnails(mf.file, 80);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === mf.id
              ? {
                  ...f,
                  thumbnails: thumbs,
                  selected: new Set(thumbs.map((_, i) => i)),
                  thumbLoading: false,
                }
              : f
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === mf.id
              ? {
                  ...f,
                  thumbLoading: false,
                  error: "Could not read PDF — it may be corrupt or password-protected.",
                }
              : f
          )
        );
      }
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (dropped.length) loadFiles(dropped);
  };

  // ── Reorder via drag-and-drop ─────────────────────────────────────────────

  const onItemDragStart = (idx: number) => {
    dragFromIdx.current = idx;
  };

  const onItemDrop = (toIdx: number) => {
    const fromIdx = dragFromIdx.current;
    if (fromIdx === null || fromIdx === toIdx) return;
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    dragFromIdx.current = null;
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setError(null);
  };

  const updateSelected = (id: string, selected: Set<number>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected } : f))
    );
  };

  // ── Merge ─────────────────────────────────────────────────────────────────

  const merge = useCallback(async () => {
    const valid = files.filter((f) => !f.error && f.thumbnails.length > 0);
    if (valid.length < 1) {
      setError("Add at least one valid PDF.");
      return;
    }
    const hasPages = valid.some((f) => f.selected.size > 0);
    if (!hasPages) {
      setError("Select at least one page to merge.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const merged = await PDFDocument.create();

      for (const mf of valid) {
        if (mf.selected.size === 0) continue;
        const src = await loadPdfLib(mf.file);
        const pageIndices = Array.from(mf.selected).sort((a, b) => a - b);
        const copied = await merged.copyPages(src, pageIndices);
        copied.forEach((p) => merged.addPage(p));
      }

      const bytes = await merged.save({ useObjectStreams: true });
      downloadPDF(
        bytes,
        `merged-${valid.map((f) => stemName(f.file.name)).join("-").slice(0, 40)}.pdf`
      );
    } catch {
      setError("Merge failed — one or more PDFs may be corrupt or encrypted.");
    } finally {
      setBusy(false);
    }
  }, [files]);

  const reset = () => {
    setFiles([]);
    setError(null);
  };

  const totalSelectedPages = files.reduce((n, f) => n + f.selected.size, 0);
  const hasFiles = files.length > 0;

  return (
    <div className={cn("space-y-6", fullscreen && "flex-1 min-h-0 flex flex-col")}>
      {/* Fullscreen button */}
      <div className="flex justify-end gap-2">
        <FullscreenButton />
      </div>

      {/* Drop zone — compact when files exist */}
      {!hasFiles ? (
        <PdfMultiDropZone
          onFiles={loadFiles}
          dragging={dragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      ) : (
        <PdfMultiDropZone
          onFiles={loadFiles}
          dragging={dragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          compact
        />
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={labelCls}>
              {files.length} file{files.length !== 1 ? "s" : ""} — drag to reorder
            </span>
            <button onClick={reset} className={btnGhost}>
              Clear all
            </button>
          </div>

          {files.map((mf, idx) => (
            <div
              key={mf.id}
              draggable
              onDragStart={() => onItemDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onItemDrop(idx)}
              className="border border-border bg-surface-muted"
            >
              {/* File header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
                {/* Drag handle */}
                <svg
                  className="w-3 h-3 text-foreground-muted/30 shrink-0 cursor-grab"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <circle cx="3" cy="3" r="1" />
                  <circle cx="9" cy="3" r="1" />
                  <circle cx="3" cy="6" r="1" />
                  <circle cx="9" cy="6" r="1" />
                  <circle cx="3" cy="9" r="1" />
                  <circle cx="9" cy="9" r="1" />
                </svg>
                <span className="font-mono text-[9px] text-foreground-muted/35 shrink-0 w-5 text-right">
                  {idx + 1}.
                </span>
                <span className="font-mono text-xs text-foreground truncate flex-1">
                  {mf.file.name}
                </span>
                <span className="font-mono text-[9px] text-foreground-muted/35 shrink-0">
                  {formatBytes(mf.file.size)}
                </span>
                <button
                  onClick={() => removeFile(mf.id)}
                  title="Remove file"
                  className="shrink-0 text-foreground-muted/30 hover:text-primary transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails / loading / error */}
              <div className="p-3">
                {mf.error ? (
                  <p className={errCls}>{mf.error}</p>
                ) : mf.thumbLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
                    <span className="font-mono text-[9px] text-foreground-muted/40">Loading thumbnails…</span>
                  </div>
                ) : (
                  <PageSelector
                    thumbnails={mf.thumbnails}
                    selected={mf.selected}
                    onChange={(s) => updateSelected(mf.id, s)}
                    maxHeight={180}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      {hasFiles && (
        <div className="flex  items-center gap-3 flex-wrap pt-1">
          <button
            onClick={merge}
            disabled={busy || totalSelectedPages === 0}
            className={btnPrimary}
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
                Merging…
              </span>
            ) : (
              `Merge ${totalSelectedPages} page${totalSelectedPages !== 1 ? "s" : ""} and download`
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="font-mono text-[10px] text-red-500/70 border border-red-500/20 px-3 py-2 bg-red-500/5">
          {error}
        </p>
      )}
    </div>
  );
}
