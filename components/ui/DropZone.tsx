"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

function UploadArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function PdfFileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

export interface DropZoneProps {
  /** Called with the FileList whenever files are chosen or dropped */
  onFiles: (files: FileList) => void;
  /** Native file input accept string, e.g. "image/*" or "application/pdf,.pdf" */
  accept?: string;
  /** Allow selecting multiple files */
  multiple?: boolean;
  /** Text shown before the underlined "browse" link. Auto-generated when omitted. */
  label?: string;
  /** Small hint below the label, e.g. "JPEG, PNG · max 50 MB" */
  hint?: string;
  /** Controls icon and auto-generated label text */
  variant?: "image" | "file" | "pdf";
  disabled?: boolean;
  className?: string;
}

/**
 * Shared drag-and-drop upload zone used across image-tools, converters, and pdf-tools.
 * Manages its own drag state internally — no need to pass drag handlers from the parent.
 */
export function DropZone({
  onFiles,
  accept,
  multiple = false,
  label,
  hint,
  variant = "file",
  disabled = false,
  className,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled && e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFiles(e.target.files);
      e.target.value = "";
    }
  };

  const defaultLabel =
    variant === "image"
      ? multiple
        ? "Drop images here, or"
        : "Drop an image here, or"
      : variant === "pdf"
      ? multiple
        ? "Drop PDFs here, or"
        : "Drop a PDF here, or"
      : multiple
      ? "Drop files here, or"
      : "Drop a file here, or";

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => !disabled && e.key === "Enter" && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-8 py-16 border-2 border-dashed transition-colors select-none",
        disabled
          ? "border-border/30 opacity-40 cursor-not-allowed"
          : dragging
          ? "border-primary/80 bg-primary/5 cursor-copy"
          : "border-border hover:border-foreground-muted/40 hover:bg-surface-muted cursor-pointer",
        className,
      )}
    >
      {variant === "pdf" ? (
        <PdfFileIcon
          className={cn(
            "w-10 h-10 transition-colors",
            dragging ? "text-primary/60" : "text-foreground-muted/30",
          )}
        />
      ) : (
        <UploadArrowIcon
          className={cn(
            "w-10 h-10 transition-colors",
            dragging ? "text-primary/60" : "text-foreground-muted/30",
          )}
        />
      )}
      <div className="text-center space-y-1">
        <p className="font-mono text-sm text-foreground-muted">
          {label ?? defaultLabel}{" "}
          <span className="text-foreground underline underline-offset-2">browse</span>
        </p>
        {hint && (
          <p className="font-mono text-xs text-foreground-muted/50">{hint}</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
