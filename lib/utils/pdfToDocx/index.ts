import { loadPdfJs } from "@/lib/utils/pdfUtils";
import { extractPageData } from "./extractText";
import { buildLines } from "./buildLines";
import { buildParagraphs } from "./buildParagraphs";
import { detectStyles } from "./detectStyles";
import { buildDocx } from "./buildDocx";
import type { PageData } from "./types";

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
  const paragraphs = buildParagraphs(lines);
  const classified = detectStyles(paragraphs);

  if (classified.length === 0) {
    throw new Error("Could not extract any content from this PDF.");
  }

  return buildDocx(classified);
}
