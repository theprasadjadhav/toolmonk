"use client";

import { useState, useRef } from "react";
import { useToolFullscreen } from "@/components/tool/ToolPanel";
import { cn } from "@/lib/utils/cn";
import { serverConvert, serverConvertPdfToJpg } from "./serverConvert";
import type { OutputFile } from "./FileConverter";

// ── MIME constants ────────────────────────────────────────────────────────────

const PDF  = "application/pdf";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const ODT  = "application/vnd.oasis.opendocument.text";
const PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const ODP  = "application/vnd.oasis.opendocument.presentation";
const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const ODS  = "application/vnd.oasis.opendocument.spreadsheet";

// ── Conversion map ────────────────────────────────────────────────────────────

type Via = "server" | "canvas";
interface ConvTarget { format: string; label: string; sub: string; ext: string; mime: string; via: Via }

const sv = (format: string, label: string, sub: string, ext: string, mime: string): ConvTarget =>
  ({ format, label, sub, ext, mime, via: "server" });
const cv = (format: string, label: string, sub: string, ext: string, mime: string): ConvTarget =>
  ({ format, label, sub, ext, mime, via: "canvas" });

const OUTPUTS: Record<string, ConvTarget[]> = {
  ".doc":  [sv("pdf","PDF","","pdf",PDF), sv("docx","DOCX","","docx",DOCX), sv("odt","ODT","","odt",ODT)],
  ".docx": [sv("pdf","PDF","","pdf",PDF), sv("odt","ODT","","odt",ODT)],
  ".odt":  [sv("pdf","PDF","","pdf",PDF), sv("docx","DOCX","","docx",DOCX)],
  ".ppt":  [sv("pdf","PDF","","pdf",PDF), sv("pptx","PPTX","","pptx",PPTX), sv("odp","ODP","","odp",ODP)],
  ".pptx": [sv("pdf","PDF","","pdf",PDF), sv("odp","ODP","","odp",ODP)],
  ".odp":  [sv("pdf","PDF","","pdf",PDF), sv("pptx","PPTX","","pptx",PPTX)],
  ".xls":  [sv("pdf","PDF","","pdf",PDF), sv("xlsx","XLSX","","xlsx",XLSX), sv("ods","ODS","","ods",ODS)],
  ".xlsx": [sv("pdf","PDF","","pdf",PDF), sv("ods","ODS","","ods",ODS)],
  ".ods":  [sv("pdf","PDF","","pdf",PDF), sv("xlsx","XLSX","","xlsx",XLSX)],
  ".pdf":  [sv("docx","DOCX","","docx",DOCX), sv("jpg","JPG","","jpg","image/jpeg")],
  ".jpg":  [sv("pdf","PDF","","pdf",PDF), cv("png","PNG","","png","image/png"), cv("webp","WebP","","webp","image/webp")],
  ".jpeg": [sv("pdf","PDF","","pdf",PDF), cv("png","PNG","","png","image/png"), cv("webp","WebP","","webp","image/webp")],
  ".png":  [sv("pdf","PDF","","pdf",PDF), cv("jpg","JPG","","jpg","image/jpeg"), cv("webp","WebP","","webp","image/webp")],
  ".webp": [sv("pdf","PDF","","pdf",PDF), cv("jpg","JPG","","jpg","image/jpeg"), cv("png","PNG","","png","image/png")],
  ".bmp":  [sv("pdf","PDF","","pdf",PDF), cv("jpg","JPG","","jpg","image/jpeg"), cv("png","PNG","","png","image/png")],
  ".tiff": [sv("pdf","PDF","","pdf",PDF)],
  ".tif":  [sv("pdf","PDF","","pdf",PDF)],
};

// ── Flat format list (same for both rows) ─────────────────────────────────────

// Each format: ext used for input selection, outFormat used for output lookup (null = can't be output)
const FORMATS: { ext: string; label: string; outFormat: string | null; groupEnd?: boolean }[] = [
  { ext: ".doc",  label: "DOC",  outFormat: null        },
  { ext: ".docx", label: "DOCX", outFormat: "docx"      },
  { ext: ".odt",  label: "ODT",  outFormat: "odt", groupEnd: true },
  { ext: ".ppt",  label: "PPT",  outFormat: null        },
  { ext: ".pptx", label: "PPTX", outFormat: "pptx"      },
  { ext: ".odp",  label: "ODP",  outFormat: "odp", groupEnd: true },
  { ext: ".xls",  label: "XLS",  outFormat: null        },
  { ext: ".xlsx", label: "XLSX", outFormat: "xlsx"      },
  { ext: ".ods",  label: "ODS",  outFormat: "ods", groupEnd: true },
  { ext: ".pdf",  label: "PDF",  outFormat: "pdf", groupEnd: true },
  { ext: ".jpg",  label: "JPG",  outFormat: "jpg"       },
  { ext: ".png",  label: "PNG",  outFormat: "png"       },
  { ext: ".webp", label: "WebP", outFormat: "webp"      },
  { ext: ".bmp",  label: "BMP",  outFormat: null        },
  { ext: ".tiff", label: "TIFF", outFormat: null        },
];

const ALL_INPUT_EXTS = FORMATS.map((f) => f.ext).join(",");
const DPI_OPTS = ["72", "96", "150", "300"] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}

function getExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

async function canvasConvert(file: File, mime: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      if (mime === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Conversion failed")); return; }
          blob.arrayBuffer().then((b) => resolve(new Uint8Array(b))).catch(reject);
        },
        mime, mime === "image/jpeg" ? 0.92 : undefined,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

function triggerDownload(data: Uint8Array, name: string, mime: string) {
  const url = URL.createObjectURL(new Blob([data.buffer as ArrayBuffer], { type: mime }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MasterFileConverter() {
  const [inputExt, setInputExt] = useState<string | null>(null);
  const [target,   setTarget]   = useState<ConvTarget | null>(null);
  const [file,     setFile]     = useState<File | null>(null);
  const [stage,    setStage]    = useState<"idle" | "converting" | "done" | "error">("idle");
  const [results,  setResults]  = useState<OutputFile[]>([]);
  const [error,    setError]    = useState("");
  const [convErr,  setConvErr]  = useState("");
  const [dragging, setDragging] = useState(false);
  const [dpi,      setDpi]      = useState("150");
  const inputRef = useRef<HTMLInputElement>(null);
  const fullscreen = useToolFullscreen();

  const busy = stage === "converting";
  const outputOpts = inputExt ? (OUTPUTS[inputExt] ?? []) : [];

  // ── Handlers ───────────────────────────────────────────────────────────────

  const selectInput = (ext: string) => {
    setInputExt(ext);
    if (target && !OUTPUTS[ext]?.find((o) => o.format === target.format)) setTarget(null);
    setConvErr("");
    setStage("idle"); setResults([]); setError("");
  };

  const acceptFile = (f: File) => {
    const raw = getExt(f.name);
    const ext = raw === ".jpeg" ? ".jpg" : raw;
    if (!OUTPUTS[ext]) {
      setError(`Unsupported file type '${raw || "(unknown)"}'`);
      setStage("error");
      return;
    }
    setInputExt(ext);
    if (target && !OUTPUTS[ext]?.find((o) => o.format === target.format)) setTarget(null);
    setFile(f);
    setConvErr("");
    setStage("idle"); setResults([]); setError("");
  };

  const clear = () => {
    setInputExt(null); setTarget(null); setFile(null);
    setStage("idle"); setResults([]); setError(""); setConvErr("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) acceptFile(f);
  };

  const convert = async () => {
    if (!file) return;
    if (!target) { setConvErr("Select an output format before converting."); return; }
    setConvErr(""); setStage("converting"); setError("");
    try {
      let out: OutputFile[];
      if (target.via === "canvas") {
        const data = await canvasConvert(file, target.mime);
        out = [{ name: file.name.replace(/\.[^.]+$/, "") + "." + target.ext, data, mime: target.mime }];
      } else if (target.format === "jpg") {
        out = await serverConvertPdfToJpg(file, parseInt(dpi, 10));
      } else {
        out = [await serverConvert(file, target.format, target.ext, target.mime)];
      }
      setResults(out); setStage("done");
    } catch (e) {
      setError("Conversion failed. The file may be in an unsupported format or too large to process.");
      setStage("error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const showForm = stage !== "done";

  // Shared chip renderer
  const renderChips = (mode: "from" | "to") => (
    <div className="flex flex-wrap items-center gap-1.5">
      {FORMATS.map((f) => {
        const isFrom = mode === "from";
        const selected = isFrom ? inputExt === f.ext : (target !== null && f.outFormat === target.format);
        let available: boolean;
        let convTarget: ConvTarget | undefined;

        if (isFrom) {
          available = true;
        } else {
          convTarget = f.outFormat ? outputOpts.find((o) => o.format === f.outFormat) : undefined;
          available = !!convTarget;
        }

        const chip = (
          <button
            key={f.ext + mode}
            disabled={busy || (!isFrom && !available)}
            onClick={() => {
              if (isFrom) selectInput(f.ext);
              else if (convTarget) { setTarget(convTarget); setConvErr(""); }
            }}
            className={cn(
              "px-2.5 py-1 border font-mono text-[11px] font-semibold transition-all select-none",
              selected
                ? "border-primary/50 text-primary bg-primary/10"
                : available
                  ? "border-border text-foreground-muted hover:border-foreground-muted/60 hover:text-foreground cursor-pointer"
                  : "border-border/20 text-foreground-muted/15 cursor-not-allowed",
              busy && available && !selected && "opacity-40 cursor-not-allowed",
            )}
          >
            {f.label}
          </button>
        );
        return chip;
      })}
    </div>
  );

  return (
    <div className={cn("space-y-4", fullscreen && "flex-1 min-h-0 flex flex-col")}>
     

      {/* ── Format rows ────────────────────────────────────────────────── */}
      {showForm && (
        <div className="space-y-3 shrink-0">

          {/* FROM row */}
          <div className="flex items-start gap-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted/40 pt-1.5 shrink-0 w-7 text-right">
              from
            </span>
            {renderChips("from")}
          </div>

          {/* Thin divider */}
          <div className="ml-10 h-px bg-border" />

          {/* TO row */}
          <div className="flex items-start gap-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted/40 pt-1.5 shrink-0 w-7 text-right">
              to
            </span>
            {renderChips("to")}
          </div>
          <div className="ml-10 h-px bg-border" />

          {/* DPI picker (PDF → JPG only) */}
          {target?.format === "jpg" && !busy && (
           <div className="flex items-start gap-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted/40 pt-1 shrink-0 w-7 text-right">dpi</span>
              <div className="flex gap-1">
                {DPI_OPTS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDpi(d)}
                    className={cn(
                      "px-2 py-0.5 border font-mono text-[10px] font-medium transition-all",
                      dpi === d
                        ? "border-primary/50 text-primary bg-primary/10"
                        : "border-border text-foreground-muted hover:text-foreground",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Drop zone ──────────────────────────────────────────────────── */}
      {showForm && !file && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "shrink-0 flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed cursor-pointer transition-colors select-none",
            dragging
              ? "border-primary/70 bg-primary/5 cursor-copy"
              : "border-border hover:border-foreground-muted/90",
          )}
        >
          <svg className={cn("w-9 h-9 transition-colors", dragging ? "text-primary" : "text-foreground-muted/30")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="12" y2="17" /></svg>
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted/55">
              {inputExt
                ? `Drop ${inputExt.replace(".", "").toUpperCase()} file here or click to browse`
                : "Drop any file here or click to browse"}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={inputExt === ".jpg" ? ".jpg,.jpeg" : (inputExt ?? ALL_INPUT_EXTS)}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); }}
          />
        </div>
      )}

      {/* ── File row ───────────────────────────────────────────────────── */}
      {showForm && file && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border border-border bg-surface">
          <span className="font-mono text-xs text-foreground flex-1 min-w-0 truncate">{file.name}</span>
          <span className="font-mono text-[10px] text-foreground-muted/50 tabular-nums shrink-0">{fmtBytes(file.size)}</span>
          <span className="font-mono text-[9px] text-foreground-muted/40 uppercase tracking-wider shrink-0">
            {getExt(file.name).slice(1)}
          </span>
          {!busy && (
            <button
              onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="w-6 h-6 flex items-center justify-center text-sm text-foreground-muted/40 hover:text-foreground border border-transparent hover:border-border hover:bg-foreground/5 transition-colors shrink-0"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* ── Convert button ─────────────────────────────────────────────── */}
      {showForm && file && (
        <div className="shrink-0 space-y-2">
          <button
            onClick={convert}
            disabled={busy}
            className="w-full font-mono text-[10px] uppercase tracking-widest border border-primary/40 text-primary hover:border-primary transition-colors px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {busy ? "Converting…" : "Convert"}
          </button>

          {convErr && (
            <p className="font-mono text-[11px] text-amber-500">{convErr}</p>
          )}

          {busy && (
            <div className="space-y-1.5">
              <div className="h-px bg-border overflow-hidden">
                <div className="h-full bg-foreground-muted/30 animate-pulse w-full" />
              </div>
              <p className="font-mono text-[10px] text-foreground-muted/50">processing…</p>
            </div>
          )}
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {stage === "error" && error && (
        <div className="shrink-0 flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30">
          <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider shrink-0 mt-0.5">error</span>
          <p className="font-mono text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {stage === "done" && results.length > 0 && (
        <div className="shrink-0 space-y-2">
          <div className="flex items-center gap-3">
            <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— output</p>
            {results.length > 1 && (
              <button
                onClick={() => results.forEach((r, i) => setTimeout(() => triggerDownload(r.data, r.name, r.mime), i * 150))}
                className="ml-auto font-mono text-[10px] uppercase tracking-widest px-3 py-1 border border-primary/40 text-primary hover:border-primary transition-colors"
              >
                Download All
              </button>
            )}
            <button
              onClick={clear}
              className={cn("font-mono text-[10px] uppercase tracking-widest px-3 py-1 border border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors", results.length <= 1 && "ml-auto")}
            >
              Reset
            </button>
          </div>
          <div className="space-y-px">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 border border-border bg-surface">
                <span className="font-mono text-xs text-foreground flex-1 min-w-0 truncate">{r.name}</span>
                <span className="font-mono text-[10px] text-foreground-muted/50 shrink-0 tabular-nums">{fmtBytes(r.data.byteLength)}</span>
                <button
                  onClick={() => triggerDownload(r.data, r.name, r.mime)}
                  className="font-mono text-[10px] uppercase tracking-widest px-3 py-1 border border-primary/40 text-primary hover:border-primary transition-colors shrink-0"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
