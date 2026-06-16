"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { validatePdfFile, stemName } from "@/lib/utils/pdfUtils";
import { PdfDropZone } from "./PdfDropZone";

const labelCls =
  "font-mono text-[9px] uppercase tracking-widest text-foreground-muted/55 block mb-1.5";
const inputCls =
  "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted/50 transition-colors";
const btnPrimary =
  "w-full font-mono text-[10px] uppercase tracking-widest border border-primary/40 text-primary hover:border-primary transition-colors px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed";

export function PdfUnlock() {
  const fullscreen = useToolFullscreen();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const loadFile = useCallback((f: File) => {
    const err = validatePdfFile(f);
    if (err) { setFileError(err); return; }
    setFileError(null);
    setFile(f);
    setError(null);
    setOutputSize(null);
    setDone(false);
  }, []);

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  };

  const unlock = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setOutputSize(null);
    setDone(false);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("password", password);

      const res = await fetch("/api/pdf/unlock", { method: "POST", body: form });

      if (!res.ok) {
        setError(await res.text());
        return;
      }

      const blob = await res.blob();
      setOutputSize(blob.size);
      setDone(true);

      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `${stemName(file.name)}-unlocked.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      setError("Request failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }, [file, password]);

  const reset = () => {
    setFile(null);
    setPassword("");
    setError(null);
    setOutputSize(null);
    setDone(false);
    setFileError(null);
  };

  return (
    <div className={cn("space-y-6", fullscreen && "h-full flex flex-col")}>
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
        hint="Max 50 MB"
      />

      {fileError && (
        <p className="font-mono text-[10px] text-red-500/70 border border-red-500/20 px-3 py-2 bg-red-500/5">
          {fileError}
        </p>
      )}

      {file && !fileError && (
        <div className="space-y-5">
          {/* Password field */}
          <div>
            <label className={labelCls}>
              Password{" "}
              <span className="normal-case text-foreground-muted/35">(leave blank if none required)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !busy) unlock(); }}
              placeholder="Enter PDF password…"
              autoComplete="current-password"
              className={inputCls}
            />
          </div>

          {/* Info note */}
          <div className="border border-border/50 px-3 py-2 bg-surface-muted/50">
            <p className="font-mono text-[9px] text-foreground-muted/45 leading-relaxed">
              Processed server-side. Text and formatting are fully preserved in the
              output. Your file is deleted from the server immediately after the unlocked PDF is
              sent back.
            </p>
          </div>

          {/* Action */}
          <button onClick={unlock} disabled={busy} className={btnPrimary}>
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
                Unlocking…
              </span>
            ) : "Unlock & Download PDF"}
          </button>

          {done && outputSize !== null && !error && (
            <p className="font-mono text-[9px] text-foreground-muted/50 text-right">
              Download started · {(outputSize / 1024).toFixed(1)} KB
            </p>
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
