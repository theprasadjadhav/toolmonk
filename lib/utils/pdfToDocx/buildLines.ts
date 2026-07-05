import type { RawTextItem, Line, PageData } from "./types";
import {
  LINE_Y_TOLERANCE_FACTOR,
  SPACE_GAP_FACTOR,
  DEFAULT_FONT,
} from "./constants";

function mode<T>(arr: T[]): T {
  const freq = new Map<T, number>();
  for (const v of arr) freq.set(v, (freq.get(v) ?? 0) + 1);
  let best = arr[0];
  let bestCount = 0;
  for (const [val, count] of freq) {
    if (count > bestCount) {
      best = val;
      bestCount = count;
    }
  }
  return best;
}

function weightedMode(items: RawTextItem[], key: "isBold" | "isItalic"): boolean {
  let trueWeight = 0;
  let falseWeight = 0;
  for (const item of items) {
    const w = item.str.length || 1;
    if (item[key]) trueWeight += w;
    else falseWeight += w;
  }
  return trueWeight > falseWeight;
}

function weightedModeString(items: RawTextItem[], key: "color" | "fontFamily"): string {
  const freq = new Map<string, number>();
  for (const item of items) {
    const w = item.str.length || 1;
    const val = item[key];
    freq.set(val, (freq.get(val) ?? 0) + w);
  }
  let best = DEFAULT_FONT;
  let bestWeight = 0;
  for (const [val, weight] of freq) {
    if (weight > bestWeight) {
      best = val;
      bestWeight = weight;
    }
  }
  return best;
}

function buildLineText(items: RawTextItem[]): string {
  if (items.length === 0) return "";

  let text = items[0].str;
  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1];
    const curr = items[i];
    const gap = curr.x - (prev.x + prev.width);
    const threshold = SPACE_GAP_FACTOR * prev.fontSize;

    if (gap > threshold && !prev.str.endsWith(" ") && !curr.str.startsWith(" ")) {
      text += " ";
    }
    text += curr.str;
  }
  return text;
}

function splitByFontSize(items: RawTextItem[]): RawTextItem[][] {
  if (items.length <= 1) return [items];

  const sizes = items.map((i) => i.fontSize);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);

  // Only split if there's a significant font size difference (>20%)
  if (maxSize / minSize < 1.2) return [items];

  // Find the split point: where font size changes significantly
  const groups: RawTextItem[][] = [];
  let current: RawTextItem[] = [items[0]];

  for (let i = 1; i < items.length; i++) {
    const prevSize = current[current.length - 1].fontSize;
    const currSize = items[i].fontSize;
    const ratio = Math.max(prevSize, currSize) / Math.min(prevSize, currSize);

    if (ratio >= 1.2) {
      groups.push(current);
      current = [items[i]];
    } else {
      current.push(items[i]);
    }
  }
  groups.push(current);

  return groups;
}

export function buildLines(pages: PageData[]): Line[] {
  const allLines: Line[] = [];

  for (const page of pages) {
    const { items, height, pageIndex } = page;
    if (items.length === 0) continue;

    const flipped = items.map((item) => ({
      ...item,
      y: height - item.y,
    }));

    flipped.sort((a, b) => a.y - b.y || a.x - b.x);

    const lineGroups: RawTextItem[][] = [];
    let currentGroup: RawTextItem[] = [flipped[0]];

    for (let i = 1; i < flipped.length; i++) {
      const curr = flipped[i];
      const prev = currentGroup[currentGroup.length - 1];
      const tolerance =
        LINE_Y_TOLERANCE_FACTOR * Math.min(curr.fontSize, prev.fontSize);

      if (Math.abs(curr.y - prev.y) <= tolerance) {
        currentGroup.push(curr);
      } else {
        lineGroups.push(currentGroup);
        currentGroup = [curr];
      }
    }
    lineGroups.push(currentGroup);

    for (const group of lineGroups) {
      group.sort((a, b) => a.x - b.x);

      // Split line if it contains items with significantly different font sizes
      const subGroups = splitByFontSize(group);

      for (const subGroup of subGroups) {
        const fontSizes = subGroup.map((item) => item.fontSize);
        const dominantFontSize = mode(fontSizes);

        const line: Line = {
          items: subGroup,
          y: subGroup.reduce((sum, item) => sum + item.y, 0) / subGroup.length,
          x: subGroup[0].x,
          xEnd: subGroup[subGroup.length - 1].x + subGroup[subGroup.length - 1].width,
          pageIndex,
          dominantFontSize,
          dominantBold: weightedMode(subGroup, "isBold"),
          dominantItalic: weightedMode(subGroup, "isItalic"),
          dominantColor: weightedModeString(subGroup, "color"),
          dominantFont: weightedModeString(subGroup, "fontFamily"),
          text: buildLineText(subGroup),
        };

        if (line.text.trim()) {
          allLines.push(line);
        }
      }
    }
  }

  return allLines;
}
