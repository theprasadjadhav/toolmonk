// Shared image utility — used by all image-tools components

export type OutputFormat = "original" | "jpeg" | "png" | "webp";

export interface ImageInfo {
  width: number;
  height: number;
  size: number;
  mime: string;
  name: string;
}

// ── Format helpers ─────────────────────────────────────────────────────────────

export function getOutputMime(format: OutputFormat, originalMime = "image/jpeg"): string {
  switch (format) {
    case "jpeg": return "image/jpeg";
    case "png":  return "image/png";
    case "webp": return "image/webp";
    default:     return originalMime || "image/jpeg";
  }
}

export function getOutputExtension(mime: string): string {
  switch (mime) {
    case "image/jpeg": return "jpg";
    case "image/png":  return "png";
    case "image/webp": return "webp";
    case "image/gif":  return "gif";
    case "image/bmp":  return "bmp";
    case "image/avif": return "avif";
    default:           return "jpg";
  }
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

// ── String / file helpers ──────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function stemName(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

// ── Object URL helpers ─────────────────────────────────────────────────────────

export function revokeUrl(url: string): void {
  if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ── Image loading helpers ──────────────────────────────────────────────────────

/** Resolves with natural width/height + file metadata after the image loads. */
export function getImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        mime: file.type,
        name: file.name,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image — unsupported format or corrupted file."));
    };
    img.src = url;
  });
}

/** Load an HTMLImageElement from a src URL. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

// ── Web Worker (OffscreenCanvas) ───────────────────────────────────────────────
//
// The inline worker code must be vanilla JS (no import/export) since it runs
// in a blob URL. We pass an ImageBitmap as a transferable, draw it onto an
// OffscreenCanvas, then return the compressed Blob.

const CANVAS_WORKER_CODE = /* javascript */ `
self.onmessage = async function(e) {
  var d = e.data;
  try {
    var canvas = new OffscreenCanvas(d.width, d.height);
    var ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');

    if (d.bgColor) {
      ctx.fillStyle = d.bgColor;
      ctx.fillRect(0, 0, d.width, d.height);
    }

    // sx/sy/sw/sh allow cropping the source bitmap before drawing
    var sx = (d.sx !== undefined) ? d.sx : 0;
    var sy = (d.sy !== undefined) ? d.sy : 0;
    var sw = (d.sw !== undefined) ? d.sw : d.bitmap.width;
    var sh = (d.sh !== undefined) ? d.sh : d.bitmap.height;
    ctx.drawImage(d.bitmap, sx, sy, sw, sh, 0, 0, d.width, d.height);
    d.bitmap.close();

    var blobOpts = { type: d.mime };
    if (d.mime !== 'image/png' && d.quality !== undefined) {
      blobOpts.quality = d.quality;
    }
    var blob = await canvas.convertToBlob(blobOpts);
    self.postMessage({ blob: blob });
  } catch(err) {
    self.postMessage({ error: String(err) });
  }
};
`;

let _workerBlobUrl: string | null = null;

function getWorkerUrl(): string {
  if (!_workerBlobUrl) {
    const blob = new Blob([CANVAS_WORKER_CODE], { type: "application/javascript" });
    _workerBlobUrl = URL.createObjectURL(blob);
  }
  return _workerBlobUrl;
}

export interface WorkerProcessOptions {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  mime: string;
  quality?: number; // 0–1 (ignored for PNG)
  bgColor?: string;
  // optional source crop rectangle
  sx?: number;
  sy?: number;
  sw?: number;
  sh?: number;
}

/**
 * Run canvas drawImage → convertToBlob in an OffscreenCanvas Web Worker.
 * Falls back to main-thread canvas if the worker fails.
 */
export function processWithWorker(opts: WorkerProcessOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(getWorkerUrl());
      worker.onmessage = (e) => {
        worker.terminate();
        if (e.data.error) {
          // Fallback to main thread
          mainThreadProcess(opts).then(resolve).catch(reject);
        } else {
          resolve(e.data.blob as Blob);
        }
      };
      worker.onerror = () => {
        worker.terminate();
        mainThreadProcess(opts).then(resolve).catch(reject);
      };
      // Transfer the bitmap so it isn't copied
      worker.postMessage(opts, [opts.bitmap]);
    } catch {
      // OffscreenCanvas not available — fall back
      mainThreadProcess(opts).then(resolve).catch(reject);
    }
  });
}

/** Main-thread canvas fallback (used when OffscreenCanvas worker is unavailable). */
async function mainThreadProcess(opts: WorkerProcessOptions): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = opts.width;
  canvas.height = opts.height;
  const ctx = canvas.getContext("2d")!;

  if (opts.bgColor) {
    ctx.fillStyle = opts.bgColor;
    ctx.fillRect(0, 0, opts.width, opts.height);
  }

  const sx = opts.sx ?? 0;
  const sy = opts.sy ?? 0;
  const sw = opts.sw ?? opts.bitmap.width;
  const sh = opts.sh ?? opts.bitmap.height;
  ctx.drawImage(opts.bitmap, sx, sy, sw, sh, 0, 0, opts.width, opts.height);
  opts.bitmap.close();

  return new Promise<Blob>((res, rej) => {
    const q = opts.mime === "image/png" ? undefined : (opts.quality ?? 0.92);
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("Canvas toBlob returned null"))),
      opts.mime,
      q,
    );
  });
}

// ── Validation helpers ─────────────────────────────────────────────────────────

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/avif"];

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return `File too large (${formatBytes(file.size)}). Maximum is 50 MB.`;
  if (!isImageMime(file.type)) return `Unsupported file type: ${file.type || "unknown"}. Please upload a JPEG, PNG, WebP, GIF, BMP, or AVIF image.`;
  return null;
}
