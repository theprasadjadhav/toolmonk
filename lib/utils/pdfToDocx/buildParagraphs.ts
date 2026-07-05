import type { Line, RawParagraph } from "./types";
import {
  PARAGRAPH_GAP_FACTOR,
  INDENT_CHANGE_THRESHOLD,
  CENTER_TOLERANCE,
  RIGHT_ALIGN_THRESHOLD,
  HEADER_FOOTER_ZONE,
  TAB_GAP_FACTOR,
  BULLET_CHARS,
  DEFAULT_FONT,
} from "./constants";

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function computeNormalLineSpacing(lines: Line[]): number {
  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].pageIndex !== lines[i - 1].pageIndex) continue;
    const gap = lines[i].y - lines[i - 1].y;
    if (gap > 0 && gap < 50) gaps.push(gap);
  }
  return gaps.length > 0 ? median(gaps) : 14;
}

function computePageMargins(
  lines: Line[],
  pageIndex: number
): { left: number; right: number; pageWidth: number } {
  const pageLines = lines.filter((l) => l.pageIndex === pageIndex);
  if (pageLines.length === 0) return { left: 72, right: 540, pageWidth: 612 };

  const pageWidth = pageLines[0].items[0]?.pageWidth ?? 612;
  const leftXs = pageLines.map((l) => l.x);
  const rightXs = pageLines.map((l) => l.xEnd);

  leftXs.sort((a, b) => a - b);
  rightXs.sort((a, b) => b - a);

  const left = leftXs[Math.floor(leftXs.length * 0.1)] ?? 72;
  const right = rightXs[Math.floor(rightXs.length * 0.1)] ?? pageWidth - 72;

  return { left, right, pageWidth };
}

function isHeaderOrFooter(
  line: Line,
  pageHeight: number,
  allLines: Line[]
): boolean {
  const topY = line.y;
  const rawY = pageHeight - topY;

  if (rawY > HEADER_FOOTER_ZONE && topY > HEADER_FOOTER_ZONE) return false;

  const sameTextOnOtherPages = allLines.filter(
    (l) =>
      l.pageIndex !== line.pageIndex &&
      l.text.trim() === line.text.trim() &&
      Math.abs(l.y - line.y) < 5
  );
  return sameTextOnOtherPages.length > 0;
}

function startsWithBullet(text: string): boolean {
  const trimmed = text.trimStart();
  for (const char of BULLET_CHARS) {
    if (trimmed.startsWith(char)) return true;
  }
  if (/^\s*-\s/.test(text)) return true;
  return false;
}

function detectLineHasRightAlignedPart(
  line: Line,
  pageRight: number
): { hasRight: boolean; leftText: string; rightText: string } {
  if (line.items.length < 2) {
    return { hasRight: false, leftText: line.text, rightText: "" };
  }

  for (let i = 1; i < line.items.length; i++) {
    const prev = line.items[i - 1];
    const curr = line.items[i];
    const gap = curr.x - (prev.x + prev.width);
    const threshold = TAB_GAP_FACTOR * prev.fontSize;

    if (gap > threshold) {
      const lastItemEnd = line.items[line.items.length - 1].x +
        line.items[line.items.length - 1].width;
      if (Math.abs(lastItemEnd - pageRight) < 20) {
        const leftItems = line.items.slice(0, i);
        const rightItems = line.items.slice(i);
        const leftText = leftItems.map((it) => it.str).join(" ").trim();
        const rightText = rightItems.map((it) => it.str).join(" ").trim();
        return { hasRight: true, leftText, rightText };
      }
    }
  }

  return { hasRight: false, leftText: line.text, rightText: "" };
}

function detectAlignment(
  lines: Line[],
  pageLeft: number,
  pageRight: number,
  pageWidth: number
): "left" | "center" | "right" {
  const pageCenter = pageWidth / 2;

  let centerCount = 0;
  let rightCount = 0;

  for (const line of lines) {
    const lineCenter = (line.x + line.xEnd) / 2;
    if (Math.abs(lineCenter - pageCenter) < CENTER_TOLERANCE) {
      centerCount++;
    }
    if (
      Math.abs(line.xEnd - pageRight) < 5 &&
      line.x > pageLeft + RIGHT_ALIGN_THRESHOLD
    ) {
      rightCount++;
    }
  }

  if (centerCount > lines.length * 0.7) return "center";
  if (rightCount > lines.length * 0.7) return "right";
  return "left";
}

export function buildParagraphs(lines: Line[]): RawParagraph[] {
  if (lines.length === 0) return [];

  const pages = new Set(lines.map((l) => l.pageIndex));
  const margins = new Map<number, { left: number; right: number; pageWidth: number }>();
  for (const p of pages) {
    margins.set(p, computePageMargins(lines, p));
  }

  const pageHeight = lines[0].items[0]?.pageHeight ?? 792;
  const filteredLines = lines.filter(
    (l) => !isHeaderOrFooter(l, pageHeight, lines)
  );

  if (filteredLines.length === 0) return [];

  const normalSpacing = computeNormalLineSpacing(filteredLines);
  const paragraphs: RawParagraph[] = [];
  let currentLines: Line[] = [filteredLines[0]];

  for (let i = 1; i < filteredLines.length; i++) {
    const prev = filteredLines[i - 1];
    const curr = filteredLines[i];
    let shouldBreak = false;

    if (curr.pageIndex !== prev.pageIndex) {
      shouldBreak = true;
    } else {
      const gap = curr.y - prev.y;

      if (gap > normalSpacing * PARAGRAPH_GAP_FACTOR) {
        shouldBreak = true;
      }

      if (
        Math.abs(curr.dominantFontSize - prev.dominantFontSize) > 2 &&
        curr.dominantFontSize > prev.dominantFontSize
      ) {
        shouldBreak = true;
      }

      if (startsWithBullet(curr.text) && !startsWithBullet(prev.text)) {
        shouldBreak = true;
      }
      if (!startsWithBullet(curr.text) && startsWithBullet(prev.text)) {
        // Only break if this isn't a continuation line (large gap or different indent)
        const isContinuation =
          gap <= normalSpacing * PARAGRAPH_GAP_FACTOR &&
          Math.abs(curr.dominantFontSize - prev.dominantFontSize) <= 1;
        if (!isContinuation) {
          shouldBreak = true;
        }
      }
      if (startsWithBullet(curr.text) && startsWithBullet(prev.text)) {
        shouldBreak = true;
      }

      const pageMargins = margins.get(curr.pageIndex)!;
      const prevIndent = prev.x - pageMargins.left;
      const currIndent = curr.x - pageMargins.left;
      if (
        Math.abs(currIndent - prevIndent) > INDENT_CHANGE_THRESHOLD &&
        !startsWithBullet(curr.text)
      ) {
        shouldBreak = true;
      }
    }

    if (shouldBreak) {
      paragraphs.push(buildParagraph(currentLines, margins, normalSpacing, filteredLines, i));
      currentLines = [curr];
    } else {
      currentLines.push(curr);
    }
  }

  paragraphs.push(
    buildParagraph(currentLines, margins, normalSpacing, filteredLines, filteredLines.length)
  );

  return paragraphs;
}

function buildParagraph(
  paraLines: Line[],
  margins: Map<number, { left: number; right: number; pageWidth: number }>,
  normalSpacing: number,
  allLines: Line[],
  currentIndex: number
): RawParagraph {
  const pageIndex = paraLines[0].pageIndex;
  const { left: pageLeft, right: pageRight, pageWidth } = margins.get(pageIndex)!;

  const firstLine = paraLines[0];
  const leftIndent = Math.max(0, firstLine.x - pageLeft);
  const firstLineIndent =
    paraLines.length > 1
      ? firstLine.x - paraLines[1].x
      : 0;

  const alignment = detectAlignment(paraLines, pageLeft, pageRight, pageWidth);

  const fontSizes = paraLines.map((l) => l.dominantFontSize);
  const dominantFontSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length;

  const boldCount = paraLines.filter((l) => l.dominantBold).length;
  const dominantBold = boldCount > paraLines.length * 0.5;

  const italicCount = paraLines.filter((l) => l.dominantItalic).length;
  const dominantItalic = italicCount > paraLines.length * 0.5;

  const colorFreq = new Map<string, number>();
  for (const l of paraLines) {
    const w = l.text.length || 1;
    colorFreq.set(l.dominantColor, (colorFreq.get(l.dominantColor) ?? 0) + w);
  }
  let dominantColor = "000000";
  let maxW = 0;
  for (const [c, w] of colorFreq) {
    if (w > maxW) {
      dominantColor = c;
      maxW = w;
    }
  }

  const fontFreq = new Map<string, number>();
  for (const l of paraLines) {
    const w = l.text.length || 1;
    fontFreq.set(l.dominantFont, (fontFreq.get(l.dominantFont) ?? 0) + w);
  }
  let dominantFont = DEFAULT_FONT;
  let maxFW = 0;
  for (const [f, w] of fontFreq) {
    if (w > maxFW) {
      dominantFont = f;
      maxFW = w;
    }
  }

  const prevLineIndex = currentIndex - paraLines.length - 1;
  let spacingBefore = 0;
  if (prevLineIndex >= 0 && allLines[prevLineIndex]?.pageIndex === pageIndex) {
    const gap = firstLine.y - allLines[prevLineIndex].y;
    const extra = gap - normalSpacing;
    if (extra > 0) spacingBefore = extra;
  }

  const { hasRight, leftText, rightText } = detectLineHasRightAlignedPart(
    firstLine,
    pageRight
  );

  const fullText = paraLines.map((l) => l.text).join(" ").trim();

  return {
    lines: paraLines,
    pageIndex,
    leftIndent,
    firstLineIndent,
    alignment,
    dominantFontSize,
    dominantBold,
    dominantItalic,
    dominantColor,
    dominantFont,
    text: fullText,
    spacingBefore,
    hasRightAlignedPart: hasRight && paraLines.length === 1,
    rightAlignedText: hasRight ? rightText : "",
    leftAlignedText: hasRight ? leftText : fullText,
  };
}
