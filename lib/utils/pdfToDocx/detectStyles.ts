import type { RawParagraph, ClassifiedParagraph, ClassifiedRun } from "./types";
import {
  HEADING1_SIZE_RATIO,
  HEADING2_SIZE_RATIO,
  HEADING3_SIZE_RATIO,
  MAX_HEADING_LENGTH,
  BULLET_REGEX,
  NUMBERED_REGEX,
  BULLET_CHARS,
  PTS_TO_TWIPS,
  PTS_TO_HALF_PTS,
  DEFAULT_FONT,
} from "./constants";

function sanitizeColor(color: string | undefined): string | undefined {
  if (!color || color === "000000") return undefined;
  if (/^[0-9a-fA-F]{6}$/.test(color)) return color;
  return undefined;
}

export function computeBodyFontSize(paragraphs: RawParagraph[]): number {
  const sizeFreq = new Map<number, number>();
  for (const p of paragraphs) {
    const rounded = Math.round(p.dominantFontSize * 2) / 2;
    const weight = p.text.length || 1;
    sizeFreq.set(rounded, (sizeFreq.get(rounded) ?? 0) + weight);
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

function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 3) return false;
  return letters === letters.toUpperCase();
}

function stripBullet(text: string): string {
  let stripped = text.trimStart();
  for (const char of BULLET_CHARS) {
    if (stripped.startsWith(char)) {
      stripped = stripped.slice(char.length).trimStart();
      return stripped;
    }
  }
  if (/^-\s/.test(stripped)) {
    stripped = stripped.slice(1).trimStart();
    return stripped;
  }
  return stripped;
}

function stripNumbering(text: string): string {
  return text.replace(NUMBERED_REGEX, "");
}

function buildRuns(paragraph: RawParagraph, text: string): ClassifiedRun[] {
  const lines = paragraph.lines;

  if (lines.length === 1 && lines[0].items.length > 1) {
    const runs: ClassifiedRun[] = [];
    let currentRun: ClassifiedRun | null = null;

    for (const item of lines[0].items) {
      if (!item.str.trim() && !item.str) continue;

      const runProps: ClassifiedRun = {
        text: item.str,
        bold: item.isBold || undefined,
        italic: item.isItalic || undefined,
        color: sanitizeColor(item.color),
        fontSize: Math.round(item.fontSize * PTS_TO_HALF_PTS),
        font: item.fontFamily !== DEFAULT_FONT ? item.fontFamily : undefined,
      };

      if (
        currentRun &&
        currentRun.bold === runProps.bold &&
        currentRun.italic === runProps.italic &&
        currentRun.color === runProps.color &&
        currentRun.fontSize === runProps.fontSize &&
        currentRun.font === runProps.font
      ) {
        currentRun.text += item.str;
      } else {
        if (currentRun && currentRun.text) runs.push(currentRun);
        currentRun = { ...runProps };
      }
    }
    if (currentRun && currentRun.text) runs.push(currentRun);

    if (runs.length > 0) {
      const merged = mergeAdjacentSpaces(runs);
      if (merged.length > 0) return merged;
    }
  }

  return [
    {
      text,
      bold: paragraph.dominantBold || undefined,
      italic: paragraph.dominantItalic || undefined,
      color: sanitizeColor(paragraph.dominantColor),
      fontSize: Math.round(paragraph.dominantFontSize * PTS_TO_HALF_PTS),
      font: paragraph.dominantFont !== DEFAULT_FONT ? paragraph.dominantFont : undefined,
    },
  ];
}

function mergeAdjacentSpaces(runs: ClassifiedRun[]): ClassifiedRun[] {
  const result: ClassifiedRun[] = [];
  for (const run of runs) {
    if (result.length > 0 && !result[result.length - 1].text.endsWith(" ") && !run.text.startsWith(" ")) {
      const prev = result[result.length - 1];
      if (
        prev.bold === run.bold &&
        prev.italic === run.italic &&
        prev.color === run.color &&
        prev.fontSize === run.fontSize &&
        prev.font === run.font
      ) {
        prev.text += run.text;
        continue;
      }
      prev.text += " ";
    }
    result.push(run);
  }
  return result;
}

function buildRightRuns(paragraph: RawParagraph): ClassifiedRun[] {
  if (!paragraph.rightAlignedText) return [];

  const lastLine = paragraph.lines[0];
  const rightItems = lastLine.items.filter((item) => {
    const lineCenter = (lastLine.x + lastLine.xEnd) / 2;
    return item.x > lineCenter;
  });

  if (rightItems.length === 0) {
    return [
      {
        text: paragraph.rightAlignedText,
        bold: paragraph.dominantBold || undefined,
        italic: paragraph.dominantItalic || undefined,
        color: sanitizeColor(paragraph.dominantColor),
        fontSize: Math.round(paragraph.dominantFontSize * PTS_TO_HALF_PTS),
        font: paragraph.dominantFont !== DEFAULT_FONT ? paragraph.dominantFont : undefined,
      },
    ];
  }

  const runs: ClassifiedRun[] = [];
  let currentRun: ClassifiedRun | null = null;
  for (const item of rightItems) {
    const runProps: ClassifiedRun = {
      text: item.str,
      bold: item.isBold || undefined,
      italic: item.isItalic || undefined,
      color: sanitizeColor(item.color),
      fontSize: Math.round(item.fontSize * PTS_TO_HALF_PTS),
      font: item.fontFamily !== DEFAULT_FONT ? item.fontFamily : undefined,
    };
    if (
      currentRun &&
      currentRun.bold === runProps.bold &&
      currentRun.italic === runProps.italic &&
      currentRun.color === runProps.color
    ) {
      currentRun.text += item.str;
    } else {
      if (currentRun) runs.push(currentRun);
      currentRun = { ...runProps };
    }
  }
  if (currentRun) runs.push(currentRun);
  return mergeAdjacentSpaces(runs);
}

export function detectStyles(paragraphs: RawParagraph[]): ClassifiedParagraph[] {
  if (paragraphs.length === 0) return [];

  const bodyFontSize = computeBodyFontSize(paragraphs);
  const result: ClassifiedParagraph[] = [];
  let prevPageIndex = paragraphs[0].pageIndex;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const pageBreakBefore = i > 0 && p.pageIndex !== prevPageIndex;
    prevPageIndex = p.pageIndex;

    const isBullet = BULLET_REGEX.test(p.text) || NUMBERED_REGEX.test(p.text);
    const isNumbered = NUMBERED_REGEX.test(p.text);

    if (isBullet) {
      const strippedText = isNumbered ? stripNumbering(p.text) : stripBullet(p.text);
      const bulletIndent = Math.max(0, p.leftIndent);
      const bulletLevel = Math.min(Math.floor(bulletIndent / 20), 3);

      const runs = buildRuns(p, strippedText);
      stripBulletFromRuns(runs, p.text, strippedText);

      result.push({
        type: "bullet",
        runs,
        alignment: "left",
        indentLeft: Math.round(bulletIndent * PTS_TO_TWIPS),
        hanging: Math.round(8 * PTS_TO_TWIPS),
        spacingBefore: Math.round(p.spacingBefore * PTS_TO_TWIPS),
        spacingAfter: 0,
        bulletLevel,
        hasTabStop: false,
        rightRuns: [],
        pageBreakBefore,
      });
      continue;
    }

    const isShort = p.text.length <= MAX_HEADING_LENGTH;
    const isSingleLine = p.lines.length <= 2;
    let headingLevel: 1 | 2 | 3 | 4 | undefined;

    const sizeRatio = p.dominantFontSize / bodyFontSize;

    if (isShort && isSingleLine) {
      if (sizeRatio >= HEADING1_SIZE_RATIO) {
        headingLevel = 1;
      } else if (sizeRatio >= HEADING2_SIZE_RATIO) {
        headingLevel = 2;
      } else if (sizeRatio >= HEADING3_SIZE_RATIO) {
        headingLevel = 3;
      } else if (p.dominantFontSize > bodyFontSize + 0.5) {
        headingLevel = 4;
      }
    }

    if (
      !headingLevel &&
      isShort &&
      isSingleLine &&
      isAllCaps(p.text) &&
      p.dominantFontSize >= bodyFontSize
    ) {
      headingLevel = 2;
    }

    const textForRuns = p.hasRightAlignedPart ? p.leftAlignedText : p.text;
    const runs = buildRuns(p, textForRuns);
    const rightRuns = p.hasRightAlignedPart ? buildRightRuns(p) : [];

    result.push({
      type: headingLevel ? "heading" : "body",
      headingLevel,
      runs,
      alignment: p.alignment,
      indentLeft: Math.round(p.leftIndent * PTS_TO_TWIPS),
      hanging: 0,
      spacingBefore: Math.round(p.spacingBefore * PTS_TO_TWIPS),
      spacingAfter: 0,
      bulletLevel: 0,
      hasTabStop: p.hasRightAlignedPart,
      rightRuns,
      pageBreakBefore,
    });
  }

  return result;
}

function stripBulletFromRuns(
  runs: ClassifiedRun[],
  originalText: string,
  strippedText: string
): void {
  if (runs.length === 0) return;
  const diff = originalText.trimStart().length - strippedText.length;
  if (diff <= 0) return;

  let remaining = diff;
  for (let i = 0; i < runs.length && remaining > 0; i++) {
    const trimmedStart = i === 0 ? runs[i].text.trimStart() : runs[i].text;
    const startTrimmed = runs[i].text.length - trimmedStart.length;
    remaining -= startTrimmed;

    if (remaining <= 0) {
      runs[i].text = trimmedStart;
      break;
    }

    if (trimmedStart.length <= remaining) {
      remaining -= trimmedStart.length;
      runs[i].text = "";
    } else {
      runs[i].text = trimmedStart.slice(remaining);
      remaining = 0;
    }
  }

  while (runs.length > 0 && !runs[0].text) {
    runs.shift();
  }
  if (runs.length > 0) {
    runs[0].text = runs[0].text.trimStart();
  }
}
