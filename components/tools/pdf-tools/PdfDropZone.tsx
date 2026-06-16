"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/pdfUtils";
import { DropZone } from "@/components/ui/DropZone";

interface PdfDropZoneProps {
  onFile: (file: File) => void;
  label?: string;
  hint?: string;
  currentFile?: File | null;
  className?: string;
  disabled?: boolean;
}

export function PdfDropZone({
  onFile,
  label,
  hint,
  currentFile,
  className,
  disabled,
}: PdfDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    e.target.value = "";
  };

  if (currentFile) {
    return (
      <div className={cn("flex items-center gap-4 px-4 py-3 border border-border bg-surface-muted", className)}>
        <svg
          className="w-8 h-8 shrink-0 text-foreground-muted/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.25}
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="12" y2="17" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-foreground truncate">{currentFile.name}</p>
          <p className="font-mono text-[10px] text-foreground-muted/50 mt-0.5">
            {formatBytes(currentFile.size)}
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="ml-auto font-mono text-[11px] text-foreground-muted/80 hover:text-primary/80 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ✕ change
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <DropZone
      variant="pdf"
      accept="application/pdf,.pdf"
      label={label}
      hint={hint}
      disabled={disabled}
      className={className}
      onFiles={(files) => { const f = files[0]; if (f) onFile(f); }}
    />
  );
}

/** Multi-file drop zone for Merger — just shows add-files affordance */
export function PdfMultiDropZone({
  onFiles,
  compact = false,
}: {
  onFiles: (files: File[]) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (files.length) onFiles(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex items-center justify-center gap-3 border-2 border-dashed transition-colors cursor-pointer select-none",
        compact ? "py-4 px-4" : "py-16 px-8 flex-col",
        dragging
          ? "border-primary/80 bg-primary/5"
          : "border-border hover:border-foreground-muted/40 hover:bg-surface-muted"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
      <svg
        className={cn(
          "shrink-0 transition-colors",
          compact ? "w-5 h-5" : "w-10 h-10",
          dragging ? "text-primary/60" : "text-foreground-muted/30"
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.25}
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="13" x2="12" y2="17" />
        <line x1="10" y1="15" x2="14" y2="15" />
      </svg>
      {compact ? (
        <p className="font-mono text-xs text-foreground-muted/55">Add more PDFs</p>
      ) : (
        <p className="font-mono text-sm text-foreground-muted">
          Drop PDFs here, or{" "}
          <span className="text-foreground underline underline-offset-2">browse</span>
        </p>
      )}
    </div>
  );
}
