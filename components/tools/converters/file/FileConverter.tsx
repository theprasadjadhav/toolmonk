"use client";

import { useState, useCallback, useRef } from "react";
import { useToolFullscreen } from "@/components/tool/ToolPanel";
import { cn } from "@/lib/utils/cn";
function triggerDownload(data: Uint8Array, filename: string, mime: string) {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface OutputFile {
  name: string;
  data: Uint8Array;
  mime: string;
}

type Stage = "idle" | "ready" | "loading" | "converting" | "done" | "error";

export interface FileConverterProps {
  /** Comma-separated MIME types / extensions for the file input */
  accept: string;
  /** Human label shown in drop zone (e.g. "PDF", "JPG or PNG") */
  acceptLabel: string;
  /** Allow multiple input files */
  multiple?: boolean;
  /** Extra controls rendered in the toolbar (quality slider, DPI select, …) */
  options?: React.ReactNode;
  /** Async conversion function — called with the selected File objects */
  onConvert: (files: File[]) => Promise<OutputFile[]>;
  /** Optional loading label (e.g. "Loading Aspose (~25 MB)…") */
  loadingLabel?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}

function fileExt(name: string): string {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

function mimeIcon(mime: string): string {
  if (mime.startsWith("image/")) return "img";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("word") || mime.includes("docx") || mime.includes("doc")) return "doc";
  return "file";
}

function outputMimeIcon(mime: string): string {
  if (mime.startsWith("image/")) return "img";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("word")) return "doc";
  return "file";
}

// ── Component ──────────────────────────────────────────────────────────────────

export function FileConverter({
  accept,
  acceptLabel,
  multiple = false,
  options,
  onConvert,
  loadingLabel = "Loading converter…",
}: FileConverterProps) {
  const [files, setFiles]     = useState<File[]>([]);
  const [stage, setStage]     = useState<Stage>("idle");
  const [results, setResults] = useState<OutputFile[]>([]);
  const [error, setError]     = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fullscreen = useToolFullscreen();

  // ── File selection ───────────────────────────────────────────────────────────

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    if (!arr.length) return;
    setFiles(multiple ? (prev) => [...prev, ...arr] : arr);
    setStage("ready");
    setResults([]);
    setError("");
  }, [multiple]);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (!next.length) setStage("idle");
      return next;
    });
  };

  // ── Drag & drop ──────────────────────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Conversion ───────────────────────────────────────────────────────────────

  const convert = async () => {
    if (!files.length) return;
    setStage("loading");
    setError("");
    try {
      setStage("converting");
      const output = await onConvert(files);
      setResults(output);
      setStage("done");
    } catch (e) {
      setError("Conversion failed. The file may be unsupported or corrupted.");
      setStage("error");
    }
  };

  // ── Download ─────────────────────────────────────────────────────────────────

  const download = (file: OutputFile) => triggerDownload(file.data, file.name, file.mime);

  const downloadAll = () => results.forEach((f, i) => {
    setTimeout(() => download(f), i * 150);
  });

  // ── Render ────────────────────────────────────────────────────────────────────

  const busy = stage === "loading" || stage === "converting";

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
     
      {/* Error banner */}
      {stage === "error" && (
        <div className="shrink-0 flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30">
          <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider shrink-0 mt-0.5">error</span>
          <p className="font-mono text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Drop zone — hidden after files selected */}
      {!files.length && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed cursor-pointer transition-colors select-none",
            dragging
              ? "border-primary/70 bg-primary/5 cursor-copy"
              : "border-border hover:border-foreground-muted/90"
          )}
        >
          <svg className={cn("w-9 h-9 transition-colors", dragging ? "text-primary" : "text-foreground-muted/30")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="12" y2="17" /></svg>
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted/55">
              Drop {acceptLabel} {multiple ? "files" : "file"} here or click to browse
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>
      )}

      {/* Add more files button (multi-mode only) */}
      {multiple && files.length > 0 && stage !== "done" && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>
      )}

      {/* Selected files list */}
      {files.length > 0 && stage !== "done" && (
        <div className="shrink-0 space-y-2">
          <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— selected</p>
          <div className="space-y-px">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 border border-border bg-surface"
              >
                <span className="font-mono text-[9px] text-foreground-muted/40 uppercase tracking-wider shrink-0 w-7">{mimeIcon(f.type)}</span>
                <span className="font-mono text-xs text-foreground flex-1 min-w-0 truncate">{f.name}</span>
                <span className="font-mono text-[10px] text-foreground-muted/50 shrink-0 tabular-nums">
                  {formatBytes(f.size)}
                </span>
                <span className="font-mono text-[9px] text-foreground-muted/40 shrink-0 uppercase tracking-wider">
                  {fileExt(f.name)}
                </span>
                {!busy && (
                  <button
                    onClick={() => removeFile(i)}
                    title="Remove"
                    className="w-6 h-6 flex items-center justify-center text-sm text-foreground-muted/40 hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0 ml-1 border border-transparent hover:border-border"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add more (multi-mode) */}
          {multiple && !busy && (
            <button
              onClick={() => inputRef.current?.click()}
              className="font-mono text-[11px] text-foreground-muted/50 hover:text-foreground-muted transition-colors underline underline-offset-2"
            >
              + add more files
            </button>
          )}
        </div>
      )}

      {/* Optional extra controls (quality, DPI, etc.) */}
      {options && files.length > 0 && stage !== "done" && (
        <div className="shrink-0">{options}</div>
      )}

      {/* Convert button + status */}
      {files.length > 0 && stage !== "done" && (
        <div className="shrink-0 space-y-3">
          <button
            onClick={convert}
            disabled={busy}
            className="w-full font-mono text-[10px] uppercase tracking-widest border border-primary/40 text-primary hover:border-primary transition-colors px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {busy ? "Converting…" : "Convert"}
          </button>

          {busy && (
            <div className="space-y-1.5">
              <div className="h-px bg-border overflow-hidden">
                <div className="h-full bg-foreground-muted/30 animate-pulse w-full" />
              </div>
              <p className="font-mono text-[10px] text-foreground-muted/50">
                {stage === "loading" ? loadingLabel : "processing…"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {stage === "done" && results.length > 0 && (
        <div className="shrink-0 space-y-2">
          <div className="flex items-center gap-3">
            <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— output</p>
            {results.length > 1 && (
              <button
                onClick={downloadAll}
                className="ml-auto font-mono text-[10px] uppercase tracking-widest px-3 py-1 border border-primary/40 text-primary hover:border-primary transition-colors"
              >
                Download All
              </button>
            )}
          </div>
          <div className="space-y-px">
            {results.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 border border-border bg-surface group"
              >
                <span className="font-mono text-[9px] text-foreground-muted/40 uppercase tracking-wider shrink-0 w-7">{outputMimeIcon(f.mime)}</span>
                <span className="font-mono text-xs text-foreground flex-1 min-w-0 truncate">{f.name}</span>
                <span className="font-mono text-[10px] text-foreground-muted/50 shrink-0 tabular-nums">
                  {formatBytes(f.data.byteLength)}
                </span>
                <button
                  onClick={() => download(f)}
                  className="font-mono text-[10px] uppercase tracking-widest px-3 py-1 border border-primary/40 text-primary hover:border-primary transition-colors shrink-0"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
          <p className="font-mono text-[9px] text-foreground-muted/40">
            ✓ Conversion complete.
          </p>
        </div>
      )}
    </div>
  );
}
