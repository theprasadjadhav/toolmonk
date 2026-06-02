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

export function PdfLock() {
  const fullscreen = useToolFullscreen();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [userPwd, setUserPwd] = useState("");
  const [ownerPwd, setOwnerPwd] = useState("");
  const [allowPrint, setAllowPrint] = useState(true);
  const [allowCopy, setAllowCopy] = useState(false);
  const [allowModify, setAllowModify] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);

  const loadFile = useCallback((f: File) => {
    const err = validatePdfFile(f);
    if (err) { setFileError(err); return; }
    setFileError(null);
    setFile(f);
    setOutputSize(null);
    setError(null);
  }, []);

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  };

  const lock = useCallback(async () => {
    if (!file) return;
    if (!userPwd.trim()) { setError("Enter a password."); return; }

    setBusy(true);
    setError(null);
    setOutputSize(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("userPassword", userPwd);
      form.append("ownerPassword", ownerPwd);
      form.append("allowPrint",  String(allowPrint));
      form.append("allowCopy",   String(allowCopy));
      form.append("allowModify", String(allowModify));

      const res = await fetch("/api/pdf/lock", { method: "POST", body: form });

      if (!res.ok) {
        setError(await res.text());
        return;
      }

      const blob = await res.blob();
      setOutputSize(blob.size);

      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `${stemName(file.name)}-locked.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }, [file, userPwd, ownerPwd, allowPrint, allowCopy, allowModify]);

  const reset = () => {
    setFile(null);
    setFileError(null);
    setUserPwd("");
    setOwnerPwd("");
    setAllowPrint(true);
    setAllowCopy(false);
    setAllowModify(false);
    setError(null);
    setOutputSize(null);
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
          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                User password{" "}
                <span className="normal-case text-foreground-muted/35">(required to open)</span>
              </label>
              <input
                type="password"
                value={userPwd}
                onChange={(e) => setUserPwd(e.target.value)}
                placeholder="Enter password…"
                autoComplete="new-password"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Owner password{" "}
                <span className="normal-case text-foreground-muted/35">(optional, for permissions)</span>
              </label>
              <input
                type="password"
                value={ownerPwd}
                onChange={(e) => setOwnerPwd(e.target.value)}
                placeholder="Leave blank to use user password"
                autoComplete="new-password"
                className={inputCls}
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <span className={labelCls}>Permissions</span>
            <div className="space-y-2">
              {[
                { key: "print"  as const, label: "Allow printing",                val: allowPrint,  set: setAllowPrint  },
                { key: "copy"   as const, label: "Allow copying text & images",    val: allowCopy,   set: setAllowCopy   },
                { key: "modify" as const, label: "Allow modifying the document",   val: allowModify, set: setAllowModify },
              ].map(({ key, label, val, set }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => set((v) => !v)}
                    className={cn(
                      "w-4 h-4 border flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                      val ? "border-primary bg-primary" : "border-foreground-muted/30"
                    )}
                  >
                    {val && (
                      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth={2}>
                        <polyline points="1.5,5 4,7.5 8.5,2.5" />
                      </svg>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-foreground-muted/70 group-hover:text-foreground transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Info note */}
          <div className="border border-border/50 px-3 py-2 bg-surface-muted/50">
            <p className="font-mono text-[9px] text-foreground-muted/45 leading-relaxed">
              Encryption uses AES-256, processed server-side. Your PDF is deleted
              immediately after the encrypted file is sent back.
            </p>
          </div>

          {/* Action */}
          <button onClick={lock} disabled={busy || !userPwd.trim()} className={btnPrimary}>
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 border border-primary/60 border-t-transparent animate-spin" />
                Encrypting…
              </span>
            ) : "Lock PDF & DOWNLOAD"}
          </button>

          {outputSize !== null && !error && (
            <p className="font-mono text-[9px] text-foreground-muted/50 text-right">
              Output: {(outputSize / 1024).toFixed(1)} KB
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
