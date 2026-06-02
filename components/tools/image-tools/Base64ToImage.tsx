"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { formatBytes, downloadBlob } from "@/lib/utils/image";

// ── Style tokens ───────────────────────────────────────────────────────────────
const labelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const inputCls =
  "w-full font-mono text-base bg-surface-muted border border-border px-3 py-2.5 text-foreground outline-none focus:border-foreground-muted";
const errCls = "font-mono text-[10px] text-red-500/70 mt-1";

// ── Types ──────────────────────────────────────────────────────────────────────
interface DecodeResult {
  dataUri: string;
  mime: string;
  decodedBytes: number;
  width: number;
  height: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const BASE64_RE = /^[A-Za-z0-9+/\s]+=*\s*$/;

function detectMime(b64: string): string {
  try {
    const head = atob(b64.substring(0, 16));
    if (head.startsWith("\x89PNG")) return "image/png";
    if (head.startsWith("\xff\xd8\xff")) return "image/jpeg";
    if (head.startsWith("RIFF") && head.includes("WEBP")) return "image/webp";
    if (head.startsWith("GIF8")) return "image/gif";
  } catch {
    // ignore — fall through to default
  }
  return "image/jpeg";
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case "image/png":  return "png";
    case "image/webp": return "webp";
    case "image/gif":  return "gif";
    default:           return "jpg";
  }
}

/**
 * Parse a raw textarea value into a data URI.
 * Returns { dataUri, rawBase64, mime } or throws with a user-facing message.
 */
function parseInput(input: string): { dataUri: string; rawBase64: string; mime: string } {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("EMPTY");

  if (trimmed.startsWith("data:")) {
    const comma = trimmed.indexOf(",");
    if (comma === -1) throw new Error("Invalid data URI — missing comma separator.");
    const meta = trimmed.slice(5, comma);          // "image/png;base64"
    const mime = meta.split(";")[0] ?? "image/jpeg";
    const rawBase64 = trimmed.slice(comma + 1).replace(/\s+/g, "");
    // Validate it can be decoded
    atob(rawBase64);
    return { dataUri: trimmed, rawBase64, mime };
  }

  // Try as raw base64 (strip whitespace first)
  const stripped = trimmed.replace(/\s+/g, "");
  if (!BASE64_RE.test(trimmed)) {
    throw new Error("Invalid base64 string — unexpected characters detected.");
  }
  // Validate
  atob(stripped);
  const mime = detectMime(stripped);
  const dataUri = `data:${mime};base64,${stripped}`;
  return { dataUri, rawBase64: stripped, mime };
}

/** Measure an image from a data URI, returns { width, height, decodedBytes }. */
function measureImage(dataUri: string): Promise<{ width: number; height: number; decodedBytes: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Estimate decoded byte size from raw base64 length
      const comma = dataUri.indexOf(",");
      const raw = comma === -1 ? "" : dataUri.slice(comma + 1);
      const padding = raw.endsWith("==") ? 2 : raw.endsWith("=") ? 1 : 0;
      const bytes = Math.floor((raw.length * 3) / 4) - padding;
      resolve({ width: img.naturalWidth, height: img.naturalHeight, decodedBytes: bytes });
    };
    img.onerror = () => reject(new Error("Could not decode image from base64."));
    img.src = dataUri;
  });
}

// ── Component ──────────────────────────────────────────────────────────────────
export function Base64ToImage() {
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [error, setError] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const [copiedUri, setCopiedUri] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const txtReaderRef = useRef<FileReader | null>(null);

  // ── Decode on input change (debounced 300ms) ──────────────────────────────
  const decode = useCallback(async (raw: string) => {
    if (!raw.trim()) {
      setResult(null);
      setError("");
      setWarning("");
      return;
    }

    // Large-string warning (>10MB of text in the textarea)
    if (raw.length > 10 * 1024 * 1024) {
      setWarning("This is a very large base64 string. Processing may be slow.");
    } else {
      setWarning("");
    }

    let parsed: { dataUri: string; rawBase64: string; mime: string };
    try {
      parsed = parseInput(raw);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === "EMPTY") {
        setResult(null);
        setError("");
      } else {
        setError(msg);
        setResult(null);
      }
      return;
    }

    try {
      const { width, height, decodedBytes } = await measureImage(parsed.dataUri);
      setResult({
        dataUri: parsed.dataUri,
        mime: parsed.mime,
        decodedBytes,
        width,
        height,
      });
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => decode(inputValue), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, decode]);

  // ── Upload .txt ───────────────────────────────────────────────────────────
  const handleUploadTxt = () => fileInputRef.current?.click();

  const onTxtFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (txtReaderRef.current) txtReaderRef.current.abort();
    const reader = new FileReader();
    txtReaderRef.current = reader;
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === "string") setInputValue(text);
    };
    reader.onerror = () => setError("Could not read the text file.");
    reader.readAsText(file);
  };

  // ── Copy data URI ─────────────────────────────────────────────────────────
  const copyDataUri = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.dataUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 1500);
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const download = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      // Convert dataUri → Blob
      const res = await fetch(result.dataUri);
      const blob = await res.blob();
      const ext = mimeToExt(result.mime);
      downloadBlob(blob, `decoded-image.${ext}`);
    } finally {
      setDownloading(false);
    }
  };

  // ── Clear ─────────────────────────────────────────────────────────────────
  const clear = () => {
    setInputValue("");
    setResult(null);
    setError("");
    setWarning("");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Textarea header row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className={labelCls}>Base64 string or data URI</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUploadTxt}
              className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border border-border bg-surface text-foreground-muted hover:border-primary/40 hover:text-primary transition-colors"
            >
             ↑ <span className="hidden sm:inline">upload</span>
            </button>
            {inputValue && (
              <button
                onClick={clear}
                className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border border-border bg-surface text-foreground-muted hover:border-primary/40 hover:text-primary transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Paste a base64 string or data URI here (e.g. data:image/png;base64,iVBOR... or raw base64)…"
          spellCheck={false}
          rows={6}
          className={cn(
            inputCls,
            "resize-y min-h-[8rem] text-sm leading-relaxed"
          )}
        />

        {/* Hidden file input for .txt upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="sr-only"
          onChange={onTxtFileChange}
        />

        {/* Length indicator */}
        {inputValue.length > 0 && (
          <p className="font-mono text-[9px] text-foreground-muted/40 mt-1 text-right">
            {inputValue.length.toLocaleString()} chars
          </p>
        )}
      </div>

      {/* Warning */}
      {warning && (
        <div className="px-3 py-2 border border-yellow-500/30 bg-yellow-500/5">
          <p className="font-mono text-[10px] text-yellow-500/80">{warning}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className={cn(errCls, "text-[11px]")}>{error}</p>
      )}

      {/* Decoded result */}
      {result && (
        <div className="space-y-4">
          {/* Preview */}
          <div>
            <span className={labelCls}>Decoded image</span>
            <div className="border border-border bg-surface-muted p-3 flex items-center justify-center max-h-64 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.dataUri}
                alt="Decoded"
                className="max-h-56 max-w-full object-contain"
              />
            </div>
          </div>

          {/* Image metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetaCell label="Format" value={result.mime.replace("image/", "").toUpperCase()} />
            <MetaCell label="Dimensions" value={`${result.width} × ${result.height}`} />
            <MetaCell label="Decoded size" value={formatBytes(result.decodedBytes)} />
            <MetaCell label="Base64 length" value={`${inputValue.replace(/\s+/g, "").length.toLocaleString()} chars`} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={download}
              disabled={downloading}
              className={cn(
                "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
                downloading
                  ? "border-border text-foreground-muted cursor-wait"
                  : "border-foreground-muted text-foreground hover:text-primary hover:border-primary/40",
              )}
            >
              {downloading ? "preparing…" : `Download .${mimeToExt(result.mime)}`}
            </button>

            <button
              onClick={copyDataUri}
              className={cn(
                "w-full font-mono text-[11px] uppercase tracking-wider px-4 py-3 border transition-colors",
                copiedUri
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-foreground-muted text-foreground hover:text-primary hover:border-primary/40",
              )}
            >
              {copiedUri ? "copied!" : "copy data uri"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────────
function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-muted border border-border px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-wider text-foreground-muted/50 mb-0.5">
        {label}
      </p>
      <p className="font-mono text-xs text-foreground">{value}</p>
    </div>
  );
}
