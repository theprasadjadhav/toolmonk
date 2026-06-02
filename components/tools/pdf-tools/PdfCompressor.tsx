"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import {
  validatePdfFile,
  loadPdfLib,
  canvasRecompressPDF,
  downloadPDF,
  formatBytes,
  sizeDelta,
  stemName,
} from "@/lib/utils/pdfUtils";
import { PdfDropZone } from "./PdfDropZone";

const labelCls =
  "font-mono text-[9px] uppercase tracking-widest text-foreground-muted/55 block mb-1";
const btnPrimary =
  "w-full font-mono text-[10px] uppercase tracking-widest border border-primary/40 text-primary hover:border-primary transition-colors px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed";

type Mode = "lossless" | "aggressive";

interface LevelConfig {
  label: string;
  scale: number;
  quality: number;
  qualityDesc: string;
  /** Approximate relative size vs Minimum level (1.0 = same as Minimum, 0.1 = 10% of Minimum) */
  relativeSize: number;
}

const LEVELS: LevelConfig[] = [
  { label: "Minimum", scale: 4.00, quality: 0.95, qualityDesc: "Sharp, near-lossless JPEG", relativeSize: 1.00 },
  { label: "Low", scale: 3.50, quality: 0.85, qualityDesc: "Clear , high quality JPEG", relativeSize: 0.50 },
  { label: "Medium", scale: 3.00, quality: 0.70, qualityDesc: "Good, moderate compression", relativeSize: 0.22 },
  { label: "High", scale: 2.50, quality: 0.50, qualityDesc: "Soft, heavy compression", relativeSize: 0.09 },
  { label: "Maximum", scale: 2.00, quality: 0.28, qualityDesc: "Blurry, max compression", relativeSize: 0.04 },
];

interface Result {
  bytes: Uint8Array;
  size: number;
  mode: Mode;
}

export function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("lossless");
  const [levelIdx, setLevelIdx] = useState(2); // Medium default
  const levelIdxRef = useRef(2);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const loadFile = (f: File) => {
    const err = validatePdfFile(f);
    if (err) { setFileError(err); return; }
    setFileError(null);
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  };

  // Plain async — no useCallback so every call always reads the latest state
  const runCompress = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(null);

    try {
      let bytes: Uint8Array;
      if (mode === "lossless") {
        const doc = await loadPdfLib(file);
        bytes = await doc.save({ useObjectStreams: true });
      } else {
        // Read from ref — guaranteed to be the latest value even across async boundaries
        const cfg = LEVELS[levelIdxRef.current];
        bytes = await canvasRecompressPDF(file, cfg.scale, cfg.quality, (cur, tot) =>
          setProgress({ current: cur, total: tot })
        );
      }
      setResult({ bytes, size: bytes.length, mode });
    } catch {
      setError("Compression failed — the PDF may be corrupt or encrypted.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  // Show warning when switching TO aggressive; just switch otherwise
  const handleModeSelect = (m: Mode) => {
    if (m === "aggressive" && mode !== "aggressive") {
      setShowWarning(true);
    } else {
      setMode(m);
      setResult(null);
    }
  };

  const download = () => {
    if (!result || !file) return;
    downloadPDF(result.bytes, `${stemName(file.name)}-compressed.pdf`);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setFileError(null);
    setProgress(null);
  };

  const inputSize = file?.size ?? 0;
  const levelCfg = LEVELS[levelIdx];


  return (
    <div className={"space-y-6"}>

      {file && !fileError && <div className="flex justify-end gap-2">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase text-foreground-muted border border-border hover:text-primary hover:border-primary/40 transition-colors"
        >
          Reset
        </button>
      </div>
      }
      {/* Warning modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4">
          <div className="bg-surface border border-border w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <h3 className="font-mono text-sm text-foreground uppercase tracking-widest">
                  Lossy compression
                </h3>
                <p className="font-mono text-[10px] text-foreground-muted/70 mt-2 leading-relaxed">
                  Aggressive mode re-renders every page as a JPEG image. Text will no longer be selectable or searchable, and images may lose quality.
                </p>
                <p className="font-mono text-[10px] text-foreground-muted/50 mt-1.5">
                  This cannot be undone on the output file.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setMode("aggressive"); setShowWarning(false); }}
                className="font-mono text-[10px] uppercase tracking-widest border border-primary/40 text-primary hover:border-primary px-4 py-2 transition-colors"
              >
                Use Aggressive
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="font-mono text-[10px] uppercase tracking-widest border border-border text-foreground-muted/60 hover:border-foreground-muted hover:text-foreground px-4 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

      {file && !fileError && (
        <div className="space-y-5">

          {/* Mode selector */}
          <div className="space-y-2">
            <span className={labelCls}>Compression mode</span>
            <div className="grid grid-cols-2 gap-2">
              {(["lossless", "aggressive"] as Mode[]).map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleModeSelect(m)}
                    className={cn(
                      "border p-3 text-left transition-colors space-y-1",
                      active
                        ? "border-primary border-primary/40"
                        : "border-border hover:border-foreground-muted/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "font-mono text-[10px] uppercase tracking-widest",
                        active ? "text-primary" : "text-foreground-muted"
                      )}>
                        {m === "lossless" ? "Lossless" : "Aggressive"}
                      </p>
                      {m === "lossless" ? (
                        <span className="font-mono text-[8px] text-accent/70 border border-accent/30 px-1.5 py-0.5">
                          Recommended
                        </span>
                      ) : (
                        <span className="font-mono text-[8px] text-blue-500/80 border border-blue-500/30 px-1.5 py-0.5">
                          Lossy
                        </span>
                      )}
                    </div>

                    <p className="font-mono text-[8px] text-foreground-muted/50 leading-relaxed">
                      {m === "lossless"
                        ? "Rewrites structure using object streams. Text and images unchanged."
                        : "Re-renders pages as JPEG. Text becomes non-selectable."}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compression level slider — aggressive only */}
          {mode === "aggressive" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={labelCls}>Compression level</span>
                <span className="font-mono text-[9px] text-primary">
                  {levelCfg.label}
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={0}
                max={LEVELS.length - 1}
                step={1}
                value={levelIdx}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  levelIdxRef.current = n;
                  setLevelIdx(n);
                }}
                className="w-full accent-[var(--color-primary)] cursor-pointer"
              />

              {/* Level labels */}
              <div className="flex justify-between">
                {LEVELS.map((l, i) => (
                  <span
                    key={l.label}
                    className={cn(
                      "font-mono text-[7px] uppercase",
                      i === levelIdx ? "text-primary" : "text-foreground-muted/30"
                    )}
                  >
                    {l.label}
                  </span>
                ))}
              </div>


            </div>
          )}

          {/* Lossless estimate note */}
          {mode === "lossless" && (
            <div className="border border-border bg-surface-muted px-4 py-3 flex items-center justify-between gap-4">
              <p className="font-mono text-[9px] text-foreground-muted/55">
                Savings vary by PDF. Typically 5–30% for unoptimized files; near zero for already-optimized PDFs.
              </p>
              <span className="font-mono text-[8px] text-accent shrink-0">Instant</span>
            </div>
          )}

          {/* Progress bar */}
          {busy && progress !== null && (
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="font-mono text-[9px] text-foreground-muted/50">Re-rendering pages…</span>
                <span className="font-mono text-[9px] text-foreground-muted/50 tabular-nums">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full h-1 bg-surface-elevated border border-border">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Compress button */}
          {!result && (
            <button
              onClick={runCompress}
              disabled={busy}
              className={cn(btnPrimary, "w-full py-3")}
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
                  Compressing…
                </span>
              ) : (
                `Compress`
              )}
            </button>
          )}

          {/* Result */}
          {result && !busy && (
            <div className="border border-border bg-surface-muted p-4 space-y-3">
              <span className={labelCls}>Result</span>
              <div className="grid grid-cols-3 divide-x divide-border border border-border">
                {[
                  { label: "Original", val: formatBytes(inputSize) },
                  { label: "Compressed", val: formatBytes(result.size) },
                  {
                    label: "Saved",
                    val: sizeDelta(inputSize, result.size),
                    accent: result.size < inputSize,
                  },
                ].map(({ label, val, accent }) => (
                  <div key={label} className="py-3 text-center">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-foreground-muted/40 block mb-1">
                      {label}
                    </span>
                    <span className={cn(
                      "font-mono text-base tabular-nums block",
                      accent ? "text-accent" : "text-foreground"
                    )}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              {result.size >= inputSize && (
                <p className="font-mono text-[9px] text-foreground-muted/50">
                  The PDF is already well-optimized — no significant reduction possible with this method.
                </p>
              )}
              <div className="w-full flex gap-3 pt-1">

                <button onClick={runCompress} className={btnPrimary}>
                  Compress again
                </button>
                <button onClick={download} className={btnPrimary}>
                  Download
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="font-mono text-[10px] text-red-500/70 border border-red-500/20 px-3 py-2 bg-red-500/5">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
