"use client";

/**
 * Lazy-loaded client-only tool components.
 *
 * `ssr: false` must live inside a "use client" file — it cannot be used
 * directly in a Server Component (page.tsx). Import from here instead of
 * calling next/dynamic in the page file.
 */

import dynamic from "next/dynamic";

const loading = () => <div className="h-64 animate-pulse bg-surface-muted rounded-lg" />;

// PDF tools (use pdf-lib / pdfjs-dist — server-incompatible)
export const PdfMerger = dynamic(
  () => import("./pdf-tools/PdfMerger").then((m) => m.PdfMerger),
  { ssr: false, loading }
);
export const PdfCompressor = dynamic(
  () => import("./pdf-tools/PdfCompressor").then((m) => m.PdfCompressor),
  { ssr: false, loading }
);
export const PdfSplitter = dynamic(
  () => import("./pdf-tools/PdfSplitter").then((m) => m.PdfSplitter),
  { ssr: false, loading }
);
export const PdfRotate = dynamic(
  () => import("./pdf-tools/PdfRotate").then((m) => m.PdfRotate),
  { ssr: false, loading }
);
export const PdfLock = dynamic(
  () => import("./pdf-tools/PdfLock").then((m) => m.PdfLock),
  { ssr: false, loading }
);
export const PdfUnlock = dynamic(
  () => import("./pdf-tools/PdfUnlock").then((m) => m.PdfUnlock),
  { ssr: false, loading }
);
export const PdfPageNumber = dynamic(
  () => import("./pdf-tools/PdfPageNumber").then((m) => m.PdfPageNumber),
  { ssr: false, loading }
);
export const PdfHighlightExtractor = dynamic(
  () => import("./pdf-tools/PdfHighlightExtractor").then((m) => m.PdfHighlightExtractor),
  { ssr: false, loading }
);

// Image tools (uses ONNX / WebAssembly model — requires browser APIs)
export const BackgroundRemover = dynamic(
  () => import("./image-tools/BackgroundRemover").then((m) => m.BackgroundRemover),
  { ssr: false, loading }
);

// Generators (use jsbarcode / qr-code-styling — Canvas API, browser-only)
export const BarcodeGeneratorTool = dynamic(
  () => import("./generators/BarcodeGenerator").then((m) => m.BarcodeGenerator),
  { ssr: false, loading }
);
export const QrCodeGeneratorTool = dynamic(
  () => import("./generators/QrCodeGenerator").then((m) => m.QrCodeGenerator),
  { ssr: false, loading }
);

// Shared generator variants (used from image-tools routes)
export const BarcodeGeneratorShared = dynamic(
  () => import("./shared/generators/BarcodeGenerator").then((m) => m.BarcodeGenerator),
  { ssr: false, loading }
);
export const QrCodeGeneratorShared = dynamic(
  () => import("./shared/generators/QrCodeGenerator").then((m) => m.QrCodeGenerator),
  { ssr: false, loading }
);
