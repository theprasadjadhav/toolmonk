"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { DropZone } from "@/components/ui/DropZone";
import { formatBytes, validateImageFile } from "@/lib/utils/image";

// ── Style tokens ───────────────────────────────────────────────────────────────
const labelCls =
  "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const errCls = "font-mono text-[10px] text-red-500/70 mt-1";
const CHECKERBOARD: React.CSSProperties = {
  backgroundImage:
    "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 16px 16px",
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface FileState {
  name: string;
  mime: string;
  originalSize: number;
  dataUri: string;
}

interface CopiedMap {
  dataUri: boolean;
  raw: boolean;
  html: boolean;
  css: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function rawBase64(dataUri: string): string {
  const comma = dataUri.indexOf(",");
  return comma === -1 ? "" : dataUri.slice(comma + 1);
}

function base64Bytes(dataUri: string): number {
  const raw = rawBase64(dataUri);
  // Base64 encodes 3 bytes into 4 chars; subtract padding
  const padding = raw.endsWith("==") ? 2 : raw.endsWith("=") ? 1 : 0;
  return Math.floor((raw.length * 3) / 4) - padding;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function ImageToBase64() {
  const [fileState, setFileState] = useState<FileState | null>(null);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<CopiedMap>({
    dataUri: false,
    raw: false,
    html: false,
    css: false,
  });

  const readerRef = useRef<FileReader | null>(null);

  // ── File processing ──────────────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    const validErr = validateImageFile(file);
    if (validErr) {
      setError(validErr);
      setFileState(null);
      return;
    }
    setError("");
    setFileState(null);

    // Cancel any in-flight reader
    if (readerRef.current) {
      readerRef.current.abort();
    }

    const reader = new FileReader();
    readerRef.current = reader;

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== "string") {
        setError("Failed to read file — unexpected result type.");
        return;
      }
      setFileState({
        name: file.name,
        mime: file.type,
        originalSize: file.size,
        dataUri: result,
      });
    };

    reader.onerror = () => {
      setError("FileReader error — could not read the selected file.");
    };

    reader.readAsDataURL(file);
  }, []);

  // ── Copy ──────────────────────────────────────────────────────────────────────
  const copyTo = async (key: keyof CopiedMap, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 1500);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const reset = () => {
    setFileState(null);
    setError("");
    if (readerRef.current) readerRef.current.abort();
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const dataUri = fileState?.dataUri ?? "";
  const raw = fileState ? rawBase64(dataUri) : "";
  const htmlTag = fileState ? `<img src="${dataUri}" alt="image" />` : "";
  const cssBg = fileState ? `background-image: url('${dataUri}');` : "";
  const b64Size = fileState ? base64Bytes(dataUri) : 0;
  const isLarge = b64Size > 1024 * 1024;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Drop zone */}
      {!fileState && (
        <DropZone
          variant="image"
          accept="image/*"
          hint="JPEG, PNG, WebP, GIF, BMP, AVIF · max 50 MB"
          onFiles={(files) => { const f = files[0]; if (f) processFile(f); }}
        />
      )}

      {/* Error */}
      {error && (
        <p className={cn(errCls, "text-[11px]")}>{error}</p>
      )}

      {/* File loaded */}
      {fileState && (
        <div className="space-y-5">
          {/* Original info */}
          <div className="flex items-center gap-4 px-4 py-3 border border-border bg-surface-muted">
            <div
              className="w-14 h-14 shrink-0 overflow-hidden border border-border flex items-center justify-center"
              style={CHECKERBOARD}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUri}
                alt="Image preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs text-foreground truncate">{fileState.name}</p>
              <p className="font-mono text-[10px] text-foreground-muted/50 mt-0.5">
                {formatBytes(fileState.originalSize)}
              </p>

            </div>
            <button
              onClick={reset}
              className="ml-auto font-mono text-[11px] text-foreground-muted/80 hover:text-primary/80 transition-colors shrink-0"
            >
              ✕ change
            </button>
          </div>

          {/* Large base64 warning */}
          {isLarge && (
            <div className="px-3 py-2 border border-yellow-500/30 bg-yellow-500/5">
              <p className="font-mono text-[10px] text-yellow-500/80 leading-relaxed">
                This is a large base64 string ({formatBytes(b64Size)}). Consider
                using a URL reference instead.
              </p>
            </div>
          )}

          {/* Output sections */}
          <OutputSection
            label="Data URI"
            description="Full data URI string"
            text={dataUri}
            copied={copied.dataUri}
            onCopy={() => copyTo("dataUri", dataUri)}
          />

          <OutputSection
            label="Raw Base64"
            description="Base64 string without prefix"
            text={raw}
            copied={copied.raw}
            onCopy={() => copyTo("raw", raw)}
          />

          <OutputSection
            label="HTML img tag"
            description="Ready-to-use <img> element"
            text={htmlTag}
            copied={copied.html}
            onCopy={() => copyTo("html", htmlTag)}
          />

          <OutputSection
            label="CSS background"
            description="CSS background-image declaration"
            text={cssBg}
            copied={copied.css}
            onCopy={() => copyTo("css", cssBg)}
          />
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function OutputSection({
  label,
  description,
  text,
  copied,
  onCopy,
}: {
  label: string;
  description: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div>
          <span className={labelCls}>{label}</span>
          <span className="font-mono text-[9px] text-foreground-muted/40 -mt-1 block">
            {description}
          </span>
        </div>
        <button
          onClick={onCopy}
          className={cn(
            "font-mono text-[10px] tracking-wider px-3 py-1 border transition-colors flex-shrink-0",
            copied
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-surface text-foreground-muted hover:border-foreground-muted/40 hover:text-foreground"
          )}
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>
      <div className="font-mono text-xs bg-surface-muted border border-border px-3 py-2 max-h-28 overflow-y-auto break-all text-foreground leading-relaxed">
        {text}
      </div>
    </div>
  );
}
