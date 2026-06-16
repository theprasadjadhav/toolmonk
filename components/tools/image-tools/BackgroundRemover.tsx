"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { formatBytes, stemName, downloadBlob, validateImageFile } from "@/lib/utils/image";

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

// ── Models ─────────────────────────────────────────────────────────────────────

type ModelId = "isnet_quint8" | "isnet_fp16" | "isnet";

const MODELS: { id: ModelId; label: string; size: string }[] = [
  { id: "isnet_quint8", label: "Fast",     size: "~25 MB"  },
  { id: "isnet_fp16",   label: "Balanced", size: "~50 MB"  },
  { id: "isnet",        label: "Best",     size: "~170 MB" },
];

const MODEL_CACHE_KEYS: Record<ModelId, string> = {
  isnet_quint8: "bgr_cached_small",
  isnet_fp16:   "bgr_cached_medium",
  isnet:        "bgr_cached_large",
};

// ── Types ──────────────────────────────────────────────────────────────────────

type Phase = "idle" | "processing" | "done" | "error";
type ModalPhase = "confirm" | "downloading";
interface ProgState { label: string; pct: number }


// ── Component ──────────────────────────────────────────────────────────────────

export function BackgroundRemover() {
  const [dragging,  setDragging]  = useState(false);
  const [file,      setFile]      = useState<File | null>(null);
  const [imgSrc,    setImgSrc]    = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSrc,  setResultSrc]  = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  // Background fill
  const [bgMode,     setBgMode]     = useState<"transparent" | "color">("transparent");
  const [bgColor,    setBgColor]    = useState("#ffffff");
  const [bgHexInput, setBgHexInput] = useState("#ffffff");

  // Quality
  const [modelId, setModelId] = useState<ModelId>("isnet_fp16");
  const [cachedModels, setCachedModels] = useState<Set<ModelId>>(new Set());

  // Download modal
  const [modalPhase, setModalPhase] = useState<ModalPhase | null>(null);
  const [modalProg,  setModalProg]  = useState<ProgState | null>(null);

  const inputRef     = useRef<HTMLInputElement>(null);
  const imgSrcRef    = useRef<string | null>(null);
  const resultSrcRef = useRef<string | null>(null);

  // ── Bootstrap cache flags ─────────────────────────────────────────────────

  useEffect(() => {
    try {
      const cached = new Set<ModelId>();
      (Object.entries(MODEL_CACHE_KEYS) as [ModelId, string][]).forEach(([id, key]) => {
        if (localStorage.getItem(key) === "1") cached.add(id);
      });
      setCachedModels(cached);
    } catch {}
  }, []);

  // ── Sync resultSrc blob URL ───────────────────────────────────────────────

  useEffect(() => {
    if (resultSrcRef.current) { URL.revokeObjectURL(resultSrcRef.current); resultSrcRef.current = null; }
    if (!resultBlob) { setResultSrc(null); return; }
    const url = URL.createObjectURL(resultBlob);
    resultSrcRef.current = url;
    setResultSrc(url);
  }, [resultBlob]);

  // ── Unmount cleanup ───────────────────────────────────────────────────────

  useEffect(() => () => {
    if (imgSrcRef.current)    URL.revokeObjectURL(imgSrcRef.current);
    if (resultSrcRef.current) URL.revokeObjectURL(resultSrcRef.current);
  }, []);

  // ── File handling ─────────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    const err = validateImageFile(f);
    if (err) { setError(err); return; }
    if (imgSrcRef.current) URL.revokeObjectURL(imgSrcRef.current);
    const url = URL.createObjectURL(f);
    imgSrcRef.current = url;
    setFile(f);
    setImgSrc(url);
    setResultBlob(null);
    setPhase("idle");
    setError(null);
    setModalPhase(null);
  }, []);

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "";
  };

  // ── Core inference (runs after model is confirmed cached) ─────────────────

  const runInference = useCallback(async (activeFile: File, activeModel: ModelId) => {
    setPhase("processing");
    setResultBlob(null);

    try {
      const { removeBackground } = await import("@imgly/background-removal");

      const blob = await removeBackground(activeFile, {
        model: activeModel,
        output: { format: "image/png", quality: 1 },
      });

      setResultBlob(blob);
      setPhase("done");
    } catch (e) {
      setError("Background removal failed. Your browser may not support WebAssembly, or the model failed to initialise. Try refreshing the page.");
      setPhase("error");
    }
  }, []);

  // ── Process button ────────────────────────────────────────────────────────

  const handleProcess = useCallback(() => {
    if (!file) return;
    if (cachedModels.has(modelId)) {
      runInference(file, modelId);
    } else {
      setModalPhase("confirm");
    }
  }, [file, modelId, cachedModels, runInference]);

  // ── Modal: confirm → download → inference ────────────────────────────────

  const handleModalConfirm = useCallback(async () => {
    if (!file) return;
    setModalPhase("downloading");
    setModalProg({ label: "Starting…", pct: 0 });

    try {
      const { preload } = await import("@imgly/background-removal");

      await preload({
        model: modelId,
        progress: (key: string, current: number, total: number) => {
          if (key.startsWith("fetch:")) {
            const pct = total > 0 ? Math.round((current / total) * 100) : 0;
            setModalProg({ label: `${pct}%`, pct });
          }
        },
      });

      try {
        localStorage.setItem(MODEL_CACHE_KEYS[modelId], "1");
        setCachedModels((prev) => new Set([...prev, modelId]));
      } catch {}

      // Close modal, proceed to inference
      setModalPhase(null);
      setModalProg(null);
      runInference(file, modelId);
    } catch (e) {
      setModalPhase(null);
      setModalProg(null);
      setError("Failed to download the AI model. Check your connection and try again.");
    }
  }, [file, modelId, runInference]);

  // ── Download ──────────────────────────────────────────────────────────────

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    if (bgMode === "transparent") {
      downloadBlob(resultBlob, `${stemName(file.name)}-no-bg.png`);
      return;
    }
    const tmpUrl = URL.createObjectURL(resultBlob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(tmpUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((b) => { if (b) downloadBlob(b, `${stemName(file.name)}-no-bg.png`); }, "image/png");
    };
    img.src = tmpUrl;
  }, [resultBlob, file, bgMode, bgColor]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    if (imgSrcRef.current) URL.revokeObjectURL(imgSrcRef.current);
    imgSrcRef.current = null;
    setFile(null); setImgSrc(null); setResultBlob(null);
    setPhase("idle"); setError(null); setModalPhase(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const isRunning = phase === "processing";
  const hasDone   = phase === "done" && !!resultSrc;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Drop zone */}
      {!file && (
        <div
          role="button" tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          className={cn(
            "flex flex-col items-center gap-3 justify-center py-20 border-2 border-dashed cursor-pointer transition-colors",
            dragging ? "border-primary/80" : "border-border hover:border-foreground-muted/50 hover:bg-surface-muted",
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-foreground-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <div className="text-center space-y-1">
            <p className="font-mono text-sm text-foreground-muted">
              Drop an image here, or{" "}
              <span className="text-foreground underline underline-offset-2">browse</span>
            </p>
            <p className="font-mono text-xs text-foreground-muted/50">JPEG, PNG, WebP, GIF, BMP, AVIF — max 50 MB</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
        </div>
      )}

      {error && <p className={errCls}>{error}</p>}

      {/* ── Loaded state ──────────────────────────────────────────────────── */}
      {file && (
        <div className="space-y-5">

          {/* File info bar */}
          <div className="flex items-center gap-4 px-4 py-3 border border-border bg-surface-muted">
            <div className="w-10 h-10 shrink-0 overflow-hidden border border-border flex items-center justify-center" style={CHECKERBOARD}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {imgSrc && <img src={imgSrc} alt="" className="max-w-full max-h-full object-contain" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-foreground truncate">{file.name}</p>
              <p className="font-mono text-[10px] text-foreground-muted/50 mt-0.5">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={handleReset} disabled={isRunning}
              className="ml-auto font-mono text-[11px] text-foreground-muted/80 hover:text-primary/80 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✕ change
            </button>
          </div>

           {/* ── Side-by-side previews ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Original */}
            <div className="border border-border bg-surface space-y-0">
              <div className="px-3 py-2 border-b border-border">
                <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— original</span>
              </div>
              <div className="h-40 w-full overflow-hidden flex items-center justify-center" style={CHECKERBOARD}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc!} alt="Original" className="h-full w-full object-contain" />
              </div>
              <div className="px-3 py-2 border-t border-border space-y-0.5">
                <p className="font-mono text-[11px] text-foreground">{formatBytes(file.size)}</p>
                <p className="font-mono text-[10px] text-foreground-muted/50">{file.name}</p>
              </div>
            </div>

            {/* Result */}
            <div className="border border-border bg-surface space-y-0">
              <div className="px-3 py-2 border-b border-border">
                <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60">— result</span>
              </div>
              <div className="h-40 w-full overflow-hidden flex items-center justify-center" style={CHECKERBOARD}>
                {resultSrc ? (
                  <div style={bgMode === "color" ? { backgroundColor: bgColor } : {}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultSrc} alt="Result" className="max-h-40 max-w-full block" />
                  </div>
                ) : (
                  <p className={cn("font-mono text-[10px] text-foreground-muted/40", isRunning && "animate-pulse")}>
                    {isRunning ? "Processing…" : "not yet processed"}
                  </p>
                )}
              </div>
              <div className="px-3 py-2 border-t border-border min-h-[52px] space-y-0.5">
                {resultBlob ? (
                  <>
                    <p className="font-mono text-[11px] text-foreground">{formatBytes(resultBlob.size)}</p>
                    <p className="font-mono text-[10px] text-foreground-muted/50">
                      {bgMode === "transparent" ? "transparent PNG" : `PNG · ${bgColor}`}
                    </p>
                  </>
                ) : (
                  <p className="font-mono text-[10px] text-foreground-muted/30">—</p>
                )}
              </div>
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className={labelCls}>— quality</label>
            <div className="flex gap-2">
              {MODELS.map((m) => (
                <button key={m.id}
                  onClick={() => { setModelId(m.id); setResultBlob(null); setPhase("idle"); }}
                  disabled={isRunning}
                  className={cn(
                    "flex-1 border px-3 py-2.5 transition-colors text-center disabled:cursor-not-allowed",
                    modelId === m.id
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-foreground-muted hover:text-foreground",
                  )}
                >
                  <span className="font-mono text-[11px] block">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background fill */}
          <div>
            <label className={labelCls}>— background fill</label>
            <div className="flex gap-2">
              {(["transparent", "color"] as const).map((m) => (
                <button key={m} onClick={() => setBgMode(m)}
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 border flex-1 transition-colors",
                    bgMode === m
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-foreground-muted hover:text-foreground",
                  )}
                >
                  {m === "transparent" ? "transparent" : "solid color"}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          {bgMode === "color" && (
            <div>
              <label className={labelCls}>— fill color</label>
              <div className="flex items-center gap-2">
                <div className="relative shrink-0">
                  <div className="w-[42px] h-[42px] border border-border cursor-pointer" style={{ backgroundColor: bgColor }} />
                  <input type="color" value={bgColor}
                    onChange={(e) => { setBgColor(e.target.value); setBgHexInput(e.target.value); }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <input type="text" maxLength={7} value={bgHexInput} spellCheck={false}
                  onChange={(e) => { setBgHexInput(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setBgColor(e.target.value); }}
                  className={cn(inputCls, "flex-1")} placeholder="#ffffff" />
              </div>
            </div>
          )}

         

          {/* Process + Download buttons */}
          <div className="flex gap-2">
            <button onClick={handleProcess} disabled={isRunning}
              className={cn(
                "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
                isRunning
                  ? "border-border text-foreground-muted/40 cursor-not-allowed"
                  : "border-foreground-muted text-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {isRunning
                ? "Processing…"
                : hasDone ? "Process again" : "Remove background"}
            </button>
            {hasDone && <button onClick={handleDownload} disabled={!hasDone}
              className={cn(
                "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors transform",
                !hasDone
                  ? "border-border text-foreground-muted/40 cursor-not-allowed"
                  : "border-foreground-muted text-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              ↓ Download PNG
            </button>}
          </div>
        </div>
      )}

      {/* ── Download modal ─────────────────────────────────────────────────── */}
      {modalPhase && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget && modalPhase === "confirm") setModalPhase(null); }}
        >
          <div className="bg-surface border border-border w-full max-w-lg mx-4 p-6 space-y-5">

            {modalPhase === "confirm" && (
              <>
                {/* Header */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-foreground">One-time setup required</h3>
                  <p className="font-mono text-[11px] text-foreground-muted/70 leading-relaxed">
                    To process your images directly in your browser and keep your photos private,
                    we need to download a one-time AI processing package ({MODELS.find((m) => m.id === modelId)?.size}) for <span className="text-primary/80">{MODELS.find((m) => m.id === modelId)?.label} quality.</span>
                  </p>
                </div>

                {/* Points */}
                <div className="border border-border">
                  {[
                    { icon: "🔒", heading: "Fully private",        body: "Your photos never leave your device or get uploaded to any server." },
                    { icon: "🚫", heading: "No data stored",       body: "Nothing is collected, logged, or stored — not even temporarily." },
                    { icon: "⚡", heading: "Instant after setup",  body: "Downloaded files are cached permanently. No re-download on future visits." },
                    { icon: "📦", heading: "One-time only",        body: "This package is reused for every image you process — download once, use forever." },
                  ].map(({ icon, heading, body }) => (
                    <div key={heading} className="px-4 py-3 bg-surface-muted space-y-1">
                      <p className="font-mono text-[11px] text-foreground">{icon} {heading}</p>
                      <p className="font-mono text-[10px] text-foreground-muted/55 leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalPhase(null)}
                    className="flex-1 font-mono text-[11px] uppercase tracking-wider px-4 py-2.5 border border-border text-foreground-muted hover:text-primary hover:border-primary/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModalConfirm}
                    className="flex-1 font-mono text-[11px] uppercase tracking-wider px-4 py-2.5 border border-foreground-muted text-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  >
                    Download &amp; Continue
                  </button>
                </div>
              </>
            )}

            {modalPhase === "downloading" && (
              <>
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-foreground">Downloading…</h3>
                  <p className="font-mono text-[11px] text-foreground-muted/60">
                    Please wait while the files are saved to your browser cache.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-foreground-muted/50">
                      {modalProg?.label ?? "0%"}
                    </span>
                    <span className="font-mono text-[10px] text-foreground-muted/40">
                      {MODELS.find((m) => m.id === modelId)?.size}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-muted border border-border overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200 ease-out"
                      style={{ width: `${modalProg?.pct ?? 0}%` }}
                    />
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
