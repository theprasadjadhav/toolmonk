"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/pdfUtils";

interface PdfDropZoneProps {
  onFile: (file: File) => void;
  dragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  label?: string;
  hint?: string;
  currentFile?: File | null;
  className?: string;
  disabled?: boolean;
}

export function PdfDropZone({
  onFile,
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
  label = "Drop PDF here or click to browse",
  hint,
  currentFile,
  className,
  disabled,
}: PdfDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed transition-colors",
        disabled
          ? "border-border/30 cursor-not-allowed opacity-40"
          : dragging
          ? "border-primary/70 bg-primary/5 cursor-copy"
          : currentFile
          ? "border-border hover:border-foreground-muted/90 cursor-pointer"
          : "border-border hover:border-foreground-muted/90 cursor-pointer",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* PDF icon */}
      <svg
        className={cn(
          "w-9 h-9 transition-colors",
          dragging ? "text-primary" : "text-foreground-muted/30"
        )}
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

      {currentFile ? (
        <div className="text-center">
          <p className="font-mono text-xs text-foreground truncate max-w-[220px]">
            {currentFile.name}
          </p>
          <p className="font-mono text-[9px] text-foreground-muted/45 mt-0.5">
            {formatBytes(currentFile.size)} — click to replace
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted/55">
            {label}
          </p>
          {hint && (
            <p className="font-mono text-[9px] text-foreground-muted/30 mt-1">
              {hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Multi-file drop zone for Merger — just shows add-files affordance */
export function PdfMultiDropZone({
  onFiles,
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
  compact = false,
}: {
  onFiles: (files: File[]) => void;
  dragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex items-center justify-center gap-3 border-2 border-dashed transition-colors cursor-pointer",
        compact ? "py-4 px-4" : "py-10 px-6 flex-col",
        dragging
          ? "border-primary/70 bg-primary/5"
          : "border-border hover:border-foreground-muted/90"
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
          compact ? "w-5 h-5" : "w-9 h-9",
          dragging ? "text-primary" : "text-foreground-muted/30"
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
      <p
        className={cn(
          "font-mono uppercase tracking-widest text-foreground-muted/55",
          compact ? "text-[9px]" : "text-[10px]"
        )}
      >
        {compact ? "Add more PDFs" : "Drop PDFs here or click to browse"}
      </p>
    </div>
  );
}
