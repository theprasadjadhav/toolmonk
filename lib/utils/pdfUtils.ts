// lib/utils/pdfUtils.ts — Shared utilities for all PDF tools
// Uses pdfjs-dist for rendering and pdf-lib for manipulation.
//
// pdfjs-dist uses browser-only globals (DOMMatrix, Canvas) at module load time.
// To prevent SSR crashes, it is never imported at the top level — instead every
// function that needs it calls getPdfJs(), which lazy-loads it the first time it
// is called (always in the browser, after a user interaction).

import type * as PdfjsType from "pdfjs-dist";
import { PDFDocument, degrees } from "pdf-lib";
import JSZip from "jszip";

export { PDFDocument, degrees };
export type { PDFDocumentProxy } from "pdfjs-dist";

// ─── pdfjs lazy loader ────────────────────────────────────────────────────────

type PdfjsModule = typeof PdfjsType;
let _pdfjs: PdfjsModule | null = null;

async function getPdfJs(): Promise<PdfjsModule> {
  if (_pdfjs) return _pdfjs;
  _pdfjs = await import("pdfjs-dist");
  // Set worker URL once on first load (CDN matches the installed version)
  if (!_pdfjs.GlobalWorkerOptions.workerSrc) {
    _pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${_pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  return _pdfjs;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validatePdfFile(file: File): string | null {
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Please select a PDF file.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > 200 * 1024 * 1024) return "File exceeds the 200 MB limit.";
  return null;
}

// ─── Loading ──────────────────────────────────────────────────────────────────

export async function loadPdfJs(
  file: File,
  password?: string
): Promise<PdfjsType.PDFDocumentProxy> {
  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const params: { data: Uint8Array; password?: string } = { data };
  if (password !== undefined) params.password = password;
  return pdfjs.getDocument(params).promise;
}

export async function loadPdfLib(
  file: File,
  options?: { ignoreEncryption?: boolean }
): Promise<PDFDocument> {
  const data = await file.arrayBuffer();
  return PDFDocument.load(data, { ignoreEncryption: options?.ignoreEncryption ?? false });
}

// ─── Rendering ────────────────────────────────────────────────────────────────

export async function renderPageToCanvas(
  doc: PdfjsType.PDFDocumentProxy,
  pageNum: number, // 1-indexed
  targetWidth: number
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / viewport.width;
  const scaled = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(scaled.width);
  canvas.height = Math.round(scaled.height);

  await page.render({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvasContext: canvas.getContext("2d") as any,
    canvas,
    viewport: scaled,
  }).promise;
  page.cleanup();
  return canvas;
}

/** Renders all pages to JPEG data-URLs for thumbnails. */
export async function renderThumbnails(
  file: File,
  thumbWidth = 120,
  onProgress?: (current: number, total: number) => void,
  password?: string
): Promise<string[]> {
  const doc = await loadPdfJs(file, password);
  const thumbs: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const canvas = await renderPageToCanvas(doc, i, thumbWidth);
    thumbs.push(canvas.toDataURL("image/jpeg", 0.72));
    onProgress?.(i, doc.numPages);
  }
  await doc.destroy();
  return thumbs;
}

/**
 * Re-renders each page of a PDF (loaded from bytes) and returns thumbnails.
 * Used to refresh thumbnails after in-memory modifications (e.g. after rotate).
 */
export async function renderThumbnailsFromBytes(
  bytes: Uint8Array,
  thumbWidth = 120,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const pdfjs = await getPdfJs();
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const thumbs: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const canvas = await renderPageToCanvas(doc, i, thumbWidth);
    thumbs.push(canvas.toDataURL("image/jpeg", 0.72));
    onProgress?.(i, doc.numPages);
  }
  await doc.destroy();
  return thumbs;
}

// ─── Download ─────────────────────────────────────────────────────────────────

export function downloadPDF(data: Uint8Array, filename: string): void {
  const name = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  const blob = new Blob([data.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function zipAndDownload(
  files: { name: string; data: Uint8Array }[],
  zipName: string
): Promise<void> {
  const zip = new JSZip();
  for (const { name, data } of files) {
    zip.file(name.endsWith(".pdf") ? name : `${name}.pdf`, data);
  }
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  const name = zipName.endsWith(".zip") ? zipName : `${zipName}.zip`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function stemName(filename: string): string {
  return filename.replace(/\.pdf$/i, "");
}

export function sizeDelta(before: number, after: number): string {
  if (before === 0) return "";
  const pct = ((before - after) / before) * 100;
  return pct >= 0 ? `-${pct.toFixed(1)}%` : `+${Math.abs(pct).toFixed(1)}%`;
}

// ─── Page range helpers ───────────────────────────────────────────────────────

/** Parses "1-3, 5, 7-9" into 0-indexed page arrays per chunk. */
export function parsePageRanges(
  input: string,
  totalPages: number
): number[][] {
  const parts = input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) throw new Error("Enter at least one page range.");
  const chunks: number[][] = [];
  for (const part of parts) {
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new Error(`Invalid range: "${part}"`);
    const start = parseInt(m[1]);
    const end = m[2] ? parseInt(m[2]) : start;
    if (start < 1 || start > totalPages)
      throw new Error(`Page ${start} is out of range (1–${totalPages}).`);
    if (end < start || end > totalPages)
      throw new Error(`Range end ${end} is out of range (1–${totalPages}).`);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p - 1);
    chunks.push(pages);
  }
  return chunks;
}

/** Splits 0…(totalPages-1) into groups of n. */
export function splitEveryN(totalPages: number, n: number): number[][] {
  if (n < 1) throw new Error("N must be at least 1.");
  if (n > totalPages)
    throw new Error(`N must not exceed total pages (${totalPages}).`);
  const chunks: number[][] = [];
  for (let i = 0; i < totalPages; i += n) {
    chunks.push(
      Array.from({ length: Math.min(n, totalPages - i) }, (_, k) => i + k)
    );
  }
  return chunks;
}

// ─── Tier-2 Compressor ────────────────────────────────────────────────────────

/**
 * Re-renders each page of a PDF as JPEG and rebuilds as an image-only PDF.
 *
 * `maxWidth` is the target output pixel width. Scale is computed per-page as
 * `maxWidth / pageWidth` so the output resolution is consistent regardless of
 * page dimensions. Scale is capped at 2.5× native to prevent upscaling small
 * pages (which inflates the file rather than compressing it).
 *
 * Size guard: if the recompressed bytes are larger than the original, the
 * original bytes are returned unchanged — the output is always ≤ input size.
 */
export async function canvasRecompressPDF(
  file: File,
  maxWidth = 1200,
  jpegQuality = 0.68,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const pdfjs = await getPdfJs();
  const srcBytes = new Uint8Array(await file.arrayBuffer());
  const srcDoc = await pdfjs.getDocument({ data: srcBytes }).promise;
  const outDoc = await PDFDocument.create();

  for (let i = 1; i <= srcDoc.numPages; i++) {
    const page = await srcDoc.getPage(i);
    const origVp = page.getViewport({ scale: 1 });
    // Cap at 2.5× to avoid upscaling pages that are already small
    const scale = Math.min(maxWidth / origVp.width, 2.5);
    const vp = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    await page.render({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvasContext: canvas.getContext("2d") as any,
      canvas,
      viewport: vp,
    }).promise;
    page.cleanup();

    const dataUrl = canvas.toDataURL("image/jpeg", jpegQuality);
    const b64 = dataUrl.split(",")[1];
    const jpegBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const jpegImg = await outDoc.embedJpg(jpegBytes);

    const pdfPage = outDoc.addPage([origVp.width, origVp.height]);
    pdfPage.drawImage(jpegImg, { x: 0, y: 0, width: origVp.width, height: origVp.height });

    onProgress?.(i, srcDoc.numPages);
  }

  await srcDoc.destroy();
  const outBytes = await outDoc.save({ useObjectStreams: true });

  // Size guard: never return a file larger than the original
  return outBytes.length < srcBytes.length ? outBytes : srcBytes;
}
