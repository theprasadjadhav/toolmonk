import { loadPdfJs } from "@/lib/utils/pdfUtils";
import { extractPageData } from "./extractText";
import { buildLines } from "./buildLines";
import { buildParagraphs } from "./buildParagraphs";
import { detectStyles } from "./detectStyles";
import { buildDocx } from "./buildDocx";
import type { PageData, DocumentGeometry } from "./types";

function inferBodyFontSize(pages: PageData[]): number {
  const sizeFreq = new Map<number, number>();
  for (const page of pages) {
    for (const item of page.items) {
      const rounded = Math.round(item.fontSize * 2) / 2;
      const weight = item.str.length || 1;
      sizeFreq.set(rounded, (sizeFreq.get(rounded) ?? 0) + weight);
    }
  }
  let best = 10;
  let bestWeight = 0;
  for (const [size, weight] of sizeFreq) {
    if (weight > bestWeight) {
      best = size;
      bestWeight = weight;
    }
  }
  return best;
}

function inferDominantColor(pages: PageData[]): string {
  const freq = new Map<string, number>();
  for (const page of pages) {
    for (const item of page.items) {
      if (item.color && item.color !== "000000") {
        const w = item.str.length || 1;
        freq.set(item.color, (freq.get(item.color) ?? 0) + w);
      }
    }
  }
  let best = "000000";
  let bestW = 0;
  for (const [c, w] of freq) {
    if (w > bestW) { best = c; bestW = w; }
  }
  return best;
}

function inferDominantFont(pages: PageData[]): string {
  const freq = new Map<string, number>();
  for (const page of pages) {
    for (const item of page.items) {
      const w = item.str.length || 1;
      freq.set(item.fontFamily, (freq.get(item.fontFamily) ?? 0) + w);
    }
  }
  let best = "Calibri";
  let bestW = 0;
  for (const [f, w] of freq) {
    if (w > bestW) { best = f; bestW = w; }
  }
  return best;
}

function inferGeometry(pages: PageData[], lines: ReturnType<typeof buildLines>): DocumentGeometry {
  const firstPage = pages[0];
  const pageWidthPts = firstPage.width;
  const pageHeightPts = firstPage.height;

  // Compute margins from actual text positions
  const page0Lines = lines.filter((l) => l.pageIndex === 0);
  const allXs = page0Lines.map((l) => l.x);
  const allXEnds = page0Lines.map((l) => l.xEnd);
  const allYs = page0Lines.map((l) => l.y);

  allXs.sort((a, b) => a - b);
  allXEnds.sort((a, b) => b - a);
  allYs.sort((a, b) => a - b);

  // Use 10th percentile for margins (ignore outliers like centered titles)
  const marginLeftPts = allXs.length > 2 ? allXs[Math.floor(allXs.length * 0.1)] : 72;
  const marginRightPts = allXEnds.length > 2 ? pageWidthPts - allXEnds[Math.floor(allXEnds.length * 0.1)] : 72;
  const marginTopPts = allYs.length > 0 ? allYs[0] : 72;
  const marginBottomPts = allYs.length > 0 ? pageHeightPts - allYs[allYs.length - 1] : 72;

  const bodyFontSize = inferBodyFontSize(pages);
  const bodyColor = inferDominantColor(pages);
  const bodyFont = inferDominantFont(pages);

  // Infer bullet indent from actual bullet positions
  const bulletLines = lines.filter((l) => {
    const t = l.text.trimStart();
    return t.startsWith("•") || t.startsWith("▪") || /^-\s/.test(t);
  });
  const bulletIndentPts = bulletLines.length > 0
    ? bulletLines.reduce((sum, l) => sum + l.x, 0) / bulletLines.length - marginLeftPts
    : 18;

  return {
    pageWidthPts,
    pageHeightPts,
    marginLeftPts: Math.max(marginLeftPts, 36),
    marginRightPts: Math.max(marginRightPts, 36),
    marginTopPts: Math.max(marginTopPts, 36),
    marginBottomPts: Math.max(marginBottomPts, 36),
    bodyFontSize,
    bodyColor,
    bodyFont,
    bulletIndentPts: Math.max(bulletIndentPts, 10),
  };
}

export async function convertPdfToDocx(file: File): Promise<Uint8Array> {
  const doc = await loadPdfJs(file);

  if (doc.numPages === 0) {
    await doc.destroy();
    throw new Error("The PDF has no pages.");
  }

  const pages: PageData[] = [];

  for (let i = 0; i < doc.numPages; i++) {
    const pageData = await extractPageData(doc, i);
    pages.push(pageData);
  }

  await doc.destroy();

  const totalItems = pages.reduce((sum, p) => sum + p.items.length, 0);
  if (totalItems === 0) {
    throw new Error(
      "This PDF contains only images — no extractable text was found. Try an OCR tool first."
    );
  }

  // Infer bold from font size: items larger than body text are treated as bold
  const bodySize = inferBodyFontSize(pages);
  for (const page of pages) {
    for (const item of page.items) {
      if (!item.isBold && item.fontSize > bodySize * 1.1) {
        item.isBold = true;
      }
    }
  }

  const lines = buildLines(pages);
  const geometry = inferGeometry(pages, lines);
  const paragraphs = buildParagraphs(lines);
  const classified = detectStyles(paragraphs);

  if (classified.length === 0) {
    throw new Error("Could not extract any content from this PDF.");
  }

  return buildDocx(classified, geometry);
}
