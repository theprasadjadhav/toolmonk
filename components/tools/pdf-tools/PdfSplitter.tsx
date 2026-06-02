"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import {
  validatePdfFile,
  loadPdfLib,
  loadPdfJs,
  renderThumbnails,
  zipAndDownload,
  downloadPDF,
  stemName,
  parsePageRanges,
  splitEveryN,
} from "@/lib/utils/pdfUtils";
import { PDFDocument } from "pdf-lib";
import { PageSelector } from "./PageSelector";
import { PdfDropZone } from "./PdfDropZone";

type Mode = "ranges" | "every-n" | "select";

const labelCls =
  "font-mono text-[9px] uppercase tracking-widest text-foreground-muted/55 block mb-1";
const inputCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2 text-foreground outline-none focus:border-foreground-muted/50 transition-colors";
const btnPrimary =
  "w-full font-mono text-[10px] uppercase tracking-widest border border-primary/40 text-primary hover:border-primary transition-colors px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed";

const modeBtnCls = (active: boolean) =>
  cn(
    "font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 border transition-colors",
    active
      ? "border-primary/40 text-primary"
      : "border-border text-foreground-muted/55 hover:border-foreground-muted hover:text-foreground-muted"
  );

export function PdfSplitter() {
  const fullscreen = useToolFullscreen();
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("ranges");
  const [rangesInput, setRangesInput] = useState("");
  const [nValue, setNValue] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

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
      setTotalPages(doc.numPages);
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

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  };

  const split = useCallback(async () => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const src = await loadPdfLib(file);
      let chunks: number[][];

      if (mode === "ranges") {
        if (!rangesInput.trim()) throw new Error("Enter at least one page range, e.g. 1-3, 4-6.");
        chunks = parsePageRanges(rangesInput, totalPages);
      } else if (mode === "every-n") {
        chunks = splitEveryN(totalPages, nValue);
      } else {
        // Free selection — each selected page → its own 1-page PDF
        if (selected.size === 0) throw new Error("Select at least one page.");
        chunks = Array.from(selected)
          .sort((a, b) => a - b)
          .map((p) => [p]);
      }

      if (chunks.length === 0) throw new Error("No pages to split.");

      const stem = stemName(file.name);
      const outputFiles: { name: string; data: Uint8Array }[] = [];

      for (let ci = 0; ci < chunks.length; ci++) {
        const pageIndices = chunks[ci];
        const outDoc = await PDFDocument.create();
        const copied = await outDoc.copyPages(src, pageIndices);
        copied.forEach((p) => outDoc.addPage(p));
        const bytes = await outDoc.save({ useObjectStreams: true });
        const firstName = pageIndices[0] + 1;
        const lastName = pageIndices[pageIndices.length - 1] + 1;
        const name =
          pageIndices.length === 1
            ? `${stem}-page${firstName}.pdf`
            : `${stem}-pages${firstName}-${lastName}.pdf`;
        outputFiles.push({ name, data: bytes });
      }

      if (outputFiles.length === 1) {
        downloadPDF(outputFiles[0].data, outputFiles[0].name);
      } else {
        await zipAndDownload(outputFiles, `${stem}-split.zip`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const isValidation =
        msg.startsWith("Enter at least") ||
        msg.startsWith("Select at least") ||
        msg.startsWith("No pages");
      setError(isValidation
        ? msg
        : "Failed to split the PDF. The file may be corrupted, password-protected, or in an unsupported format.");
    } finally {
      setBusy(false);
    }
  }, [file, mode, rangesInput, nValue, selected, totalPages]);

  const reset = () => {
    setFile(null);
    setThumbnails([]);
    setTotalPages(0);
    setSelected(new Set());
    setRangesInput("");
    setNValue(1);
    setError(null);
    setFileError(null);
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

      {/* Drop zone */}
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

      {/* Loading */}
      {thumbLoading && (
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
          <span className="font-mono text-[9px] text-foreground-muted/40">Loading thumbnails…</span>
        </div>
      )}

      {/* Config — only show once loaded */}
      {file && !thumbLoading && thumbnails.length > 0 && (
        <>
          {/* Mode selector */}
          <div className="space-y-2">
            <span className={labelCls}>Split mode</span>
            <div className="flex gap-2 flex-wrap">
              {(["ranges", "every-n", "select"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); }}
                  className={modeBtnCls(mode === m)}
                >
                  {m === "ranges" ? "Page ranges" : m === "every-n" ? "Every N pages" : "Select pages"}
                </button>
              ))}
            </div>
          </div>


          {/* Mode-specific controls */}
          {mode === "ranges" && (
            <div className="space-y-1">
              <label className={labelCls}>
                Ranges{" "}
                <span className="normal-case text-foreground-muted/35">(e.g. 1-3, 4-7, 10)</span>
              </label>
              <input
                type="text"
                value={rangesInput}
                onChange={(e) => setRangesInput(e.target.value)}
                placeholder={`e.g. 1-3, 4-${totalPages}`}
                className={inputCls}
                spellCheck={false}
              />
              <p className="font-mono text-[9px] text-foreground-muted/30">
                Each range becomes one PDF file. Total pages: {totalPages}.
              </p>
            </div>
          )}

          {mode === "every-n" && (
            <div className="space-y-1">
              <label className={labelCls}>Pages per file</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNValue((v) => Math.max(1, v - 1))}
                  disabled={nValue <= 1}
                  className="w-8 h-8 border border-border font-mono text-base text-foreground-muted hover:text-foreground disabled:opacity-20 transition-colors"
                >
                  −
                </button>
                <span className="font-mono text-base w-8 text-center tabular-nums text-foreground">
                  {nValue}
                </span>
                <button
                  type="button"
                  onClick={() => setNValue((v) => Math.min(totalPages, v + 1))}
                  disabled={nValue >= totalPages}
                  className="w-8 h-8 border border-border font-mono text-base text-foreground-muted hover:text-foreground disabled:opacity-20 transition-colors"
                >
                  +
                </button>
                <span className="font-mono text-[9px] text-foreground-muted/40">
                  → {splitEveryN(totalPages, nValue).length} file{splitEveryN(totalPages, nValue).length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {mode === "select" && (
            <div className="space-y-1">
              <p className="font-mono text-[9px] text-foreground-muted/40">
                Each selected page is extracted as its own PDF file.
              </p>
              <PageSelector
                thumbnails={thumbnails}
                selected={selected}
                onChange={setSelected}
                maxHeight={260}
              />
            </div>
          )}

          {/* Split button */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            <button
              onClick={split}
              disabled={busy}
              className={btnPrimary}
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
                  Splitting…
                </span>
              ) : (
                "Split PDF and downlaod"
              )}
            </button>

          </div>
          {error && (
            <p className="font-mono text-[10px] text-red-500/70 border border-red-500/20 px-3 py-2 bg-red-500/5">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
