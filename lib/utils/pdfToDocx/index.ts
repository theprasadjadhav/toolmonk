import { loadPdfJs } from "@/lib/utils/pdfUtils";
import { extractPageData } from "./extractText";
import { buildLines } from "./buildLines";
import { buildParagraphs } from "./buildParagraphs";
import { detectStyles } from "./detectStyles";
import { buildDocx } from "./buildDocx";
import type { PageData } from "./types";

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

  const lines = buildLines(pages);
  const paragraphs = buildParagraphs(lines);
  const classified = detectStyles(paragraphs);

  if (classified.length === 0) {
    throw new Error("Could not extract any content from this PDF.");
  }

  return buildDocx(classified);
}
