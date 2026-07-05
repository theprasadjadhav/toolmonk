import type { RawTextItem, PageData } from "./types";
import { OPS, NEAR_WHITE_THRESHOLD, DEFAULT_FONT } from "./constants";

interface PdfjsTextItem {
  str: string;
  dir: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
}

interface PdfjsTextStyle {
  ascent: number;
  descent: number;
  vertical: boolean;
  fontFamily: string;
}

interface PdfjsTextContent {
  items: (PdfjsTextItem | { type: string })[];
  styles: Record<string, PdfjsTextStyle>;
}

interface PdfjsOperatorList {
  fnArray: number[];
  argsArray: unknown[][];
}

const BOLD_PATTERNS = [
  /bold/i,
  /\bBd\b/,
  /-Bold/,
  /Black/i,
  /Heavy/i,
  /ExtraBold/i,
  /SemiBold/i,
  /DemiBold/i,
  /Demi/i,
  /Medium/i,
];

const ITALIC_PATTERNS = [
  /italic/i,
  /oblique/i,
  /\bIt\b/,
  /-Italic/,
  /Inclined/i,
];

const FONT_FAMILY_MAP: Record<string, string> = {
  "sans-serif": "Calibri",
  "serif": "Times New Roman",
  "monospace": "Courier New",
  "cursive": "Calibri",
  "fantasy": "Calibri",
};

function normalizeFontFamily(fontFamily: string): string {
  const lower = fontFamily.toLowerCase();
  return FONT_FAMILY_MAP[lower] ?? fontFamily;
}

function detectBold(fontName: string, fontFamily: string): boolean {
  const combined = `${fontName} ${fontFamily}`;
  return BOLD_PATTERNS.some((p) => p.test(combined));
}

function detectItalic(fontName: string, fontFamily: string): boolean {
  const combined = `${fontName} ${fontFamily}`;
  return ITALIC_PATTERNS.some((p) => p.test(combined));
}

function rgbToHex(r: number, g: number, b: number): string {
  if (!isFinite(r) || !isFinite(g) || !isFinite(b)) return "000000";
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const rr = clamp(r).toString(16).padStart(2, "0");
  const gg = clamp(g).toString(16).padStart(2, "0");
  const bb = clamp(b).toString(16).padStart(2, "0");
  return `${rr}${gg}${bb}`;
}

function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return [r, g, b];
}

function clampNearWhite(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (r + g + b > NEAR_WHITE_THRESHOLD) return "000000";
  return hex;
}

function extractDominantColor(opList: PdfjsOperatorList): string {
  const colorFreq = new Map<string, number>();
  let currentColor = "000000";

  for (let i = 0; i < opList.fnArray.length; i++) {
    const op = opList.fnArray[i];
    const args = opList.argsArray[i];
    if (!args) continue;

    switch (op) {
      case OPS.setFillRGBColor: {
        const r = Number(args[0]);
        const g = Number(args[1]);
        const b = Number(args[2]);
        if (isFinite(r) && isFinite(g) && isFinite(b)) {
          currentColor = clampNearWhite(rgbToHex(r * 255, g * 255, b * 255));
        }
        break;
      }
      case OPS.setFillGray: {
        const gray = Number(args[0]);
        if (isFinite(gray)) {
          const v = gray * 255;
          currentColor = clampNearWhite(rgbToHex(v, v, v));
        }
        break;
      }
      case OPS.setFillCMYKColor: {
        const c = Number(args[0]);
        const m = Number(args[1]);
        const y2 = Number(args[2]);
        const k = Number(args[3]);
        if (isFinite(c) && isFinite(m) && isFinite(y2) && isFinite(k)) {
          const [r, g, b] = cmykToRgb(c, m, y2, k);
          currentColor = clampNearWhite(rgbToHex(r, g, b));
        }
        break;
      }
      case OPS.showText:
      case OPS.showSpacedText:
      case OPS.nextLineShowText:
      case OPS.nextLineSetSpacingShowText:
        colorFreq.set(currentColor, (colorFreq.get(currentColor) ?? 0) + 1);
        break;
    }
  }

  let dominant = "000000";
  let maxCount = 0;
  for (const [color, count] of colorFreq) {
    if (count > maxCount && color !== "000000") {
      dominant = color;
      maxCount = count;
    }
  }
  return dominant;
}

export async function extractPageData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
  pageIndex: number
): Promise<PageData> {
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale: 1 });
  const pageWidth = viewport.width;
  const pageHeight = viewport.height;

  const textContent: PdfjsTextContent = await page.getTextContent();
  const opList: PdfjsOperatorList = await page.getOperatorList();

  const textItems = textContent.items.filter(
    (item): item is PdfjsTextItem => "str" in item && typeof item.str === "string"
  );

  const dominantColor = extractDominantColor(opList);

  const items: RawTextItem[] = [];

  for (let i = 0; i < textItems.length; i++) {
    const item = textItems[i];
    if (!item.str && !item.hasEOL) continue;

    const [a, b, , , e, f] = item.transform;
    const fontSize = Math.sqrt(a * a + b * b);

    if (fontSize < 1) continue;

    const style = textContent.styles[item.fontName];
    const fontFamily = normalizeFontFamily(style?.fontFamily || DEFAULT_FONT);

    items.push({
      str: item.str,
      x: e,
      y: f,
      fontSize,
      width: item.width,
      height: item.height || fontSize,
      fontName: item.fontName,
      fontFamily,
      isBold: detectBold(item.fontName, fontFamily),
      isItalic: detectItalic(item.fontName, fontFamily),
      color: dominantColor,
      hasEOL: item.hasEOL,
      pageIndex,
      pageHeight,
      pageWidth,
    });
  }

  page.cleanup();

  return { items, width: pageWidth, height: pageHeight, pageIndex };
}
