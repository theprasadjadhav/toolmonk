"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { cn } from "@/lib/utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

type HColor = "yellow" | "green" | "blue" | "pink";
type Tool = "highlight" | "erase";

interface HRect {
  x: number; // left edge in PDF units (x=0 at left)
  y: number; // bottom edge in PDF units (y=0 at bottom of page)
  w: number;
  h: number;
}

interface Highlight {
  id: string;
  page: number; // 0-based
  rect: HRect;
  color: HColor;
  text: string;
}

interface Session {
  id: string;
  name: string;
  pdfBytes: ArrayBuffer;
  highlights: Highlight[];
  undoStack: Highlight[][];
  redoStack: Highlight[][];
  pages: number;
  savedAt: number;
}

interface NItem {
  str: string;
  pdfX: number; // left in PDF units
  pdfY: number; // bottom in PDF units (Y=0 at bottom)
  pdfW: number;
  pdfH: number; // row height
  fontSize: number; // declared font size in PDF units (≈ points)
  fontName: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// CSS mix-blend-mode:multiply is applied to the canvas elements themselves,
// so we draw solid/opaque colors and the browser blends them with the PDF below.
// White PDF areas become the highlight color; dark text remains dark — real highlighter look.
const COLORS: Record<HColor, { canvas: string; label: string; swatch: string; docx: string }> = {
  yellow: { canvas: "rgb(255, 230, 50)",  label: "Yellow", swatch: "#FFD500", docx: "yellow" },
  green:  { canvas: "rgb(140, 255, 140)", label: "Green",  swatch: "#22C55E", docx: "green"  },
  blue:   { canvas: "rgb(140, 210, 255)", label: "Blue",   swatch: "#3B82F6", docx: "cyan"   },
  pink:   { canvas: "rgb(255, 160, 230)", label: "Pink",   swatch: "#EC4899", docx: "magenta"},
};

const PDF_EXPORT_COLOR: Record<HColor, [number, number, number]> = {
  yellow: [1.0, 0.92, 0.0],
  green:  [0.13, 0.77, 0.37],
  blue:   [0.23, 0.51, 0.96],
  pink:   [0.93, 0.28, 0.60],
};

const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

// Custom eraser cursor — white body with dark border, hotspot at bottom-left erasing edge
const ERASER_CURSOR = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><path d='M3 16 L8 4 L17 8 L12 16 Z' fill='white' stroke='%23444' stroke-width='1.4' stroke-linejoin='round'/><line x1='8' y1='4' x2='17' y2='8' stroke='%23aaa' stroke-width='1.2' stroke-linecap='round'/><line x1='3' y1='17.5' x2='17' y2='17.5' stroke='%23999' stroke-width='0.8'/></svg>") 3 16, default`;
const DB_NAME = "pdf-highlighter";
const STORE = "sessions";
// Fixed key — only one session is ever stored at a time
const SESSION_KEY = "current";

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (e.oldVersion === 0) {
        // Fresh install
        db.createObjectStore(STORE, { keyPath: "id" });
      } else if (e.oldVersion < 2) {
        // v1→v2: migrate UUID-keyed sessions to single SESSION_KEY
        const store = (e.target as IDBOpenDBRequest).transaction!.objectStore(STORE);
        const getAllReq = store.getAll();
        getAllReq.onsuccess = () => {
          const sessions: Session[] = getAllReq.result ?? [];
          store.clear();
          if (sessions.length > 0) {
            const latest = sessions.sort((a, b) => b.savedAt - a.savedAt)[0];
            store.put({ ...latest, id: SESSION_KEY });
          }
        };
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function dbSave(session: Session): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    // Always overwrite the single slot — SESSION_KEY is the keyPath value
    tx.objectStore(STORE).put({ ...session, id: SESSION_KEY });
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

async function dbLoad(): Promise<Session | null> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(SESSION_KEY);
    req.onsuccess = () => res(req.result ?? null);
    req.onerror = () => rej(req.error);
  });
}

// ─── Text processing ──────────────────────────────────────────────────────────

/**
 * Single-character strings that PDF fonts commonly mis-encode as bullet glyphs.
 * Fraction characters (¾ ¼ ½) appear in many word-processor-generated PDFs
 * because their custom symbol font maps a bullet glyph to those code points.
 */
const BULLET_GLYPHS = new Set(['¾', '¼', '½']);

function normalizeItems(rawItems: unknown[]): NItem[] {
  return (rawItems as Array<{
    str: string;
    transform: number[];
    width: number;
    height: number;
    fontName?: string;
  }>)
    .map((item) => {
      let str = item.str.replace(/\uFFFD/g, "");
      // Normalise single-char bullet mis-encodings
      if (BULLET_GLYPHS.has(str.trim()) && str.trim().length <= 2) str = "•";
      const fontSize = Math.max(Math.abs(item.transform[3]) || 0, item.height || 0);
      return {
        str,
        pdfX: item.transform[4],
        pdfY: item.transform[5],
        pdfW: item.width,
        pdfH: Math.max(fontSize, 6),
        fontSize,
        fontName: item.fontName ?? "",
      };
    })
    .filter((item) => item.str.trim().length > 0);
}

/**
 * Returns true if a text item should be included in the extracted text for a
 * given highlight rectangle.
 *
 * Uses intersection-area / item-area ≥ 40%.  A single threshold handles every
 * problematic case uniformly:
 *
 *  - Line at the vertical edge of a highlight (e.g. 15% vertical overlap ×
 *    100% horizontal = 15% area) → excluded.
 *  - Word at the horizontal edge (e.g. 30% horizontal × 100% vertical = 30%)
 *    → excluded.  Need to cover >40% of the word to count.
 *  - Small trailing punctuation (period ≈ 3 PDF units wide): if the highlight
 *    covers 2 of those 3 units = 67% → included.
 *  - Zero-width glyph (some decorative symbols): fall back to vertical-only.
 */
function itemHits(item: NItem, rect: HRect): boolean {
  const ix1 = Math.max(item.pdfX, rect.x);
  const iy1 = Math.max(item.pdfY, rect.y);
  const ix2 = Math.min(item.pdfX + item.pdfW, rect.x + rect.w);
  const iy2 = Math.min(item.pdfY + item.pdfH, rect.y + rect.h);

  if (ix2 <= ix1 || iy2 <= iy1) return false; // no overlap

  const itemArea = item.pdfW * item.pdfH;
  if (itemArea <= 0) {
    // Zero-width glyph: vertical coverage only
    return (iy2 - iy1) / item.pdfH >= 0.4;
  }

  return ((ix2 - ix1) * (iy2 - iy1)) / itemArea >= 0.4;
}

function groupRows(items: NItem[]): NItem[][] {
  // Sort top-to-bottom (descending pdfY), then left-to-right
  const sorted = [...items].sort((a, b) => {
    const dy = b.pdfY - a.pdfY;
    if (Math.abs(dy) > (a.pdfH + b.pdfH) / 4) return dy;
    return a.pdfX - b.pdfX;
  });

  const rows: NItem[][] = [];
  for (const item of sorted) {
    const last = rows[rows.length - 1];
    if (!last) { rows.push([item]); continue; }
    const ref = last[0];
    const avgH = (item.pdfH + ref.pdfH) / 2;
    if (Math.abs(item.pdfY - ref.pdfY) <= avgH * 0.55) {
      last.push(item);
    } else {
      rows.push([item]);
    }
  }
  rows.forEach((row) => row.sort((a, b) => a.pdfX - b.pdfX));
  return rows;
}

/** Returns the X midpoint of a column gap that appears in ≥25% of rows, or null. */
function detectColumnBoundary(rows: NItem[][]): number | null {
  const BUCKET = 15;
  const counts = new Map<number, number>();

  for (const row of rows) {
    if (row.length < 2) continue;
    for (let i = 1; i < row.length; i++) {
      const gap = row[i].pdfX - (row[i - 1].pdfX + row[i - 1].pdfW);
      if (gap > 18) {
        const mid = Math.round(((row[i - 1].pdfX + row[i - 1].pdfW + row[i].pdfX) / 2) / BUCKET) * BUCKET;
        counts.set(mid, (counts.get(mid) ?? 0) + 1);
      }
    }
  }

  const minCount = Math.max(2, Math.floor(rows.length * 0.25));
  let best: number | null = null;
  let bestN = 0;
  for (const [mid, n] of counts) {
    if (n >= minCount && n > bestN) { bestN = n; best = mid; }
  }
  return best;
}

/**
 * Detect table: consistent multi-item rows with aligned X positions AND a
 * small number of distinct columns.
 *
 * Key guard: if the median row has > 6 items it is almost certainly justified
 * prose (which can have 10–20 words per line with a consistent left margin),
 * not a tabular layout.  Without this guard, `detectTable` would misidentify
 * every justified paragraph as a table.
 */
function detectTable(rows: NItem[][]): boolean {
  const multi = rows.filter((r) => r.length >= 2);
  if (multi.length < 2) return false;

  const counts = [...multi.map((r) => r.length)].sort((a, b) => a - b);
  const medianCount = counts[Math.floor(counts.length / 2)];

  // Prose paragraphs have many words per line; real tables have ≤6 columns
  if (medianCount > 6) return false;

  const consistent = counts.filter((c) => Math.abs(c - medianCount) <= 1).length;
  if (consistent < multi.length * 0.65) return false;

  // Verify column-start X positions are stable (low variance)
  const firstXs = multi.map((r) => r[0].pdfX);
  const mean = firstXs.reduce((a, b) => a + b, 0) / firstXs.length;
  const stdDev = Math.sqrt(firstXs.reduce((s, x) => s + (x - mean) ** 2, 0) / firstXs.length);
  if (stdDev >= 12) return false;

  // Verify real column gaps exist — inter-column spacing should be wider than
  // normal word spacing.  If the average gap is negligible, it's prose words.
  const allGaps: number[] = [];
  for (const row of multi) {
    for (let i = 1; i < row.length; i++) {
      allGaps.push(row[i].pdfX - (row[i - 1].pdfX + row[i - 1].pdfW));
    }
  }
  const avgGap = allGaps.length
    ? allGaps.reduce((a, b) => a + b, 0) / allGaps.length
    : 0;
  // Require an average inter-column gap of at least 10 PDF units (~3.5mm)
  return avgGap >= 10;
}

function formatTable(rows: NItem[][]): string {
  const maxCols = Math.max(...rows.map((r) => r.length));
  const cells = rows.map((row) => {
    const sorted = [...row].sort((a, b) => a.pdfX - b.pdfX).map((i) => i.str.trim());
    while (sorted.length < maxCols) sorted.push("");
    return sorted;
  });

  const widths = Array.from({ length: maxCols }, (_, ci) =>
    Math.max(...cells.map((row) => (row[ci] ?? "").length), 3)
  );
  const lines = cells.map(
    (row) => "| " + row.map((c, i) => c.padEnd(widths[i])).join(" | ") + " |"
  );
  if (lines.length > 1) {
    const sep = "| " + widths.map((w) => "-".repeat(w)).join(" | ") + " |";
    lines.splice(1, 0, sep);
  }
  return lines.join("\n");
}

function rowsToParagraphs(rows: NItem[][]): string {
  if (rows.length === 0) return "";
  const paras: string[] = [];
  let cur: string[] = [];
  let prevBottom = rows[0][0].pdfY + rows[0][0].pdfH;
  let prevH = rows[0][0].pdfH;

  for (const row of rows) {
    if (row.length === 0) continue;
    const avgFontSize = row.reduce((s, i) => s + i.fontSize, 0) / row.length;
    // Rows with font size ≥ 12pt are treated as headings (section/chapter titles).
    // Body text in most documents is 9–11pt; headings are 12pt+.
    const isHeading = avgFontSize >= 12;
    const gap = prevBottom - row[0].pdfY;
    // Flush current paragraph before a heading, or when line spacing exceeds normal
    if (cur.length > 0 && (gap > prevH * 0.9 || isHeading)) {
      paras.push(cur.join(" "));
      cur = [];
    }
    const lineText = row.map((i) => i.str).join(" ").trim();
    if (isHeading) {
      paras.push(`## ${lineText}`);
    } else {
      cur.push(lineText);
    }
    prevBottom = row[0].pdfY;
    prevH = row[0].pdfH;
  }
  if (cur.length > 0) paras.push(cur.join(" "));
  return paras.join("\n\n");
}

function smartExtract(items: NItem[], rect: HRect): string {
  const hit = items.filter((i) => itemHits(i, rect));
  if (hit.length === 0) return "";

  const rows = groupRows(hit);
  const col = detectColumnBoundary(rows);

  if (col !== null) {
    const left = rows
      .map((r) => r.filter((i) => i.pdfX + i.pdfW / 2 < col))
      .filter((r) => r.length > 0);
    const right = rows
      .map((r) => r.filter((i) => i.pdfX + i.pdfW / 2 >= col))
      .filter((r) => r.length > 0);
    return [rowsToParagraphs(left), rowsToParagraphs(right)].filter(Boolean).join("\n\n");
  }

  if (detectTable(rows)) return formatTable(rows);
  return rowsToParagraphs(rows);
}

// ─── Coordinate helpers ───────────────────────────────────────────────────────

function cssToHRect(cssX: number, cssY: number, cssW: number, cssH: number, zoom: number, pageH: number): HRect {
  return {
    x: cssX / zoom,
    y: pageH - (cssY + cssH) / zoom,
    w: cssW / zoom,
    h: cssH / zoom,
  };
}

function hRectToCss(r: HRect, zoom: number, pageH: number) {
  return {
    x: r.x * zoom,
    y: (pageH - r.y - r.h) * zoom,
    w: r.w * zoom,
    h: r.h * zoom,
  };
}

// ─── Export utilities ─────────────────────────────────────────────────────────

function dlBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function stem(name: string) {
  return name.replace(/\.pdf$/i, "");
}

function wrapText(text: string, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur.length + w.length + 1 > max && cur) { lines.push(cur); cur = w; }
    else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * Bake the highlights into the original PDF as transparent colored rectangles.
 * Uses the same coordinate space as pdfjs (y=0 at bottom) which pdf-lib also uses,
 * so HRect values map directly without conversion.
 */
async function exportAnnotatedPdf(highlights: Highlight[], pdfBytes: ArrayBuffer, fileName: string) {
  const { PDFDocument, rgb } = await import("pdf-lib");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let doc: any;
  try {
    doc = await PDFDocument.load(pdfBytes.slice(0));
  } catch {
    // Some PDFs report as encrypted but can still be loaded with the flag
    doc = await PDFDocument.load(pdfBytes.slice(0), { ignoreEncryption: true });
  }
  for (const h of highlights) {
    const page = doc.getPage(h.page);
    const [r, g, b] = PDF_EXPORT_COLOR[h.color];
    page.drawRectangle({ x: h.rect.x, y: h.rect.y, width: h.rect.w, height: h.rect.h, color: rgb(r, g, b), opacity: 0.35 });
  }
  const bytes = await doc.save();
  dlBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), `${stem(fileName)}-highlighted.pdf`);
}

function exportTxt(highlights: Highlight[], fileName: string, showPageNumbers: boolean) {
  const byPage = new Map<number, Highlight[]>();
  for (const h of highlights) {
    if (!byPage.has(h.page)) byPage.set(h.page, []);
    byPage.get(h.page)!.push(h);
  }

  const lines: string[] = [
    `Extracted Highlights — ${fileName}`,
    `Exported on ${new Date().toLocaleDateString()}`,
    "",
  ];
  const pages = [...byPage.keys()].sort((a, b) => a - b);
  for (const pg of pages) {
    if (showPageNumbers) lines.push(`─── Page ${pg + 1} ───`, "");
    for (const h of byPage.get(pg)!) {
      lines.push(h.text, "");
    }
  }
  dlBlob(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }), `${stem(fileName)}-highlights.txt`);
}

async function exportDocx(highlights: Highlight[], fileName: string, showPageNumbers: boolean) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

  const byPage = new Map<number, Highlight[]>();
  for (const h of highlights) {
    if (!byPage.has(h.page)) byPage.set(h.page, []);
    byPage.get(h.page)!.push(h);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children: any[] = [
    new Paragraph({ text: `Extracted Highlights — ${fileName}`, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: `Exported on ${new Date().toLocaleDateString()}` }),
    new Paragraph({ text: "" }),
  ];

  const pages = [...byPage.keys()].sort((a, b) => a - b);
  for (const pg of pages) {
    if (showPageNumbers) {
      children.push(new Paragraph({ text: `Page ${pg + 1}`, heading: HeadingLevel.HEADING_2 }));
    }
    for (const h of byPage.get(pg)!) {
      const paras = h.text.split("\n\n");
      for (const para of paras) {
        if (para.startsWith("## ")) {
          // Heading row detected — render as HEADING_3 (below page-level HEADING_2)
          children.push(new Paragraph({ text: para.slice(3), heading: HeadingLevel.HEADING_3 }));
        } else {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: para.replace(/\n/g, " "),
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  highlight: COLORS[h.color].docx as any,
                }),
              ],
              spacing: { after: 160 },
            })
          );
        }
      }
      children.push(new Paragraph({ text: "" }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  dlBlob(blob, `${stem(fileName)}-highlights.docx`);
}

/** pdf-lib uses WinAnsi (Windows-1252). Strip characters outside that range. */
function sanitizeWinAnsi(str: string): string {
  return Array.from(str)
    .map((c) => {
      const code = c.codePointAt(0) ?? 0;
      if (code === 0xFFFD)           return "";   // replacement char
      if (code < 0x20)               return " ";  // control chars
      if (code > 0xFF)               return " ";  // outside Latin-1
      return c;
    })
    .join("")
    .replace(/ {2,}/g, " ")
    .trim();
}

async function exportPdf(highlights: Highlight[], fileName: string, showPageNumbers: boolean) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const byPage = new Map<number, Highlight[]>();
  for (const h of highlights) {
    if (!byPage.has(h.page)) byPage.set(h.page, []);
    byPage.get(h.page)!.push(h);
  }

  let page = doc.addPage([612, 792]);
  let y = 742;

  const write = (text: string, x: number, size: number, f = font, clr = rgb(0, 0, 0)) => {
    const safe = sanitizeWinAnsi(text);
    if (!safe) return;
    if (y < 60) { page = doc.addPage([612, 792]); y = 742; }
    page.drawText(safe, { x, y, size, font: f, color: clr });
    y -= size * 1.45;
  };

  write(fileName, 50, 14, bold);
  write(`Exported on ${new Date().toLocaleDateString()}`, 50, 10, font, rgb(0.5, 0.5, 0.5));
  y -= 8;

  const pages = [...byPage.keys()].sort((a, b) => a - b);
  for (const pg of pages) {
    if (y < 100) { page = doc.addPage([612, 792]); y = 742; }
    y -= 4;
    if (showPageNumbers) write(`Page ${pg + 1}`, 50, 11, bold, rgb(0.3, 0.3, 0.3));

    for (const h of byPage.get(pg)!) {
      // Lines prefixed with "## " are headings; use "##" (no space) as internal sentinel
      const allLines = h.text.split("\n").flatMap((l) =>
        l.startsWith("## ")
          ? wrapText(l.slice(3), 78).map((t) => `##${t}`)
          : wrapText(l, 78)
      );
      const blockH = allLines.reduce((s, l) => s + (l.startsWith("##") ? 17 : 13.5), 0) + 10;

      if (y - blockH < 60) { page = doc.addPage([612, 792]); y = 742; }

      const [r, g, b2] = PDF_EXPORT_COLOR[h.color];
      page.drawRectangle({ x: 46, y: y - blockH + 4, width: 520, height: blockH, color: rgb(r, g, b2), opacity: 0.28 });

      for (const line of allLines) {
        const isHd = line.startsWith("##");
        const safeLine = sanitizeWinAnsi(isHd ? line.slice(2) : line);
        if (!safeLine) continue;
        if (y < 60) { page = doc.addPage([612, 792]); y = 742; }
        if (isHd) {
          page.drawText(safeLine, { x: 52, y, size: 12, font: bold, color: rgb(0, 0, 0) });
          y -= 17;
        } else {
          page.drawText(safeLine, { x: 52, y, size: 10, font, color: rgb(0, 0, 0) });
          y -= 13.5;
        }
      }
      y -= 6;
    }
    y -= 6;
  }

  const bytes = await doc.save();
  dlBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), `${stem(fileName)}-highlights.pdf`);
}

// ─── PdfPage ─────────────────────────────────────────────────────────────────

interface PdfPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfDoc: any;
  pageIndex: number;
  zoom: number;
  highlights: Highlight[]; // pre-filtered to this page
  tool: Tool;
  color: HColor;
  onAdd: (h: Highlight) => void;
  onErase: (id: string) => void;
}

const PdfPage = memo(function PdfPage({
  pdfDoc,
  pageIndex,
  zoom,
  highlights,
  tool,
  color,
  onAdd,
  onErase,
}: PdfPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLCanvasElement>(null);
  const hlRef  = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<HTMLCanvasElement>(null);

  const dimsRef        = useRef<{ pdfW: number; pdfH: number } | null>(null);
  const isRenderedRef  = useRef(false);
  const renderTaskRef  = useRef<{ cancel: () => void } | null>(null);
  const textRef        = useRef<NItem[] | null>(null);
  const rafRef         = useRef(0);
  const zoomRef        = useRef(zoom);
  const hoverIdRef     = useRef<string | null>(null);
  const eraseActiveRef = useRef(false); // true while pointer held in erase mode

  // drawing state in ref — avoids React re-renders on every pointermove
  const dragRef = useRef({ active: false, x0: 0, y0: 0, x1: 0, y1: 0 });

  // ── render PDF page ──────────────────────────────────────────────────────
  const renderPage = useCallback(async () => {
    const pdfCanvas = pdfRef.current;
    const hlCanvas  = hlRef.current;
    const drawCanvas = drawRef.current;
    if (!pdfCanvas || !hlCanvas || !drawCanvas || !pdfDoc) return;

    renderTaskRef.current?.cancel();
    renderTaskRef.current = null;

    try {
      const page = await pdfDoc.getPage(pageIndex + 1);
      const dpr = window.devicePixelRatio || 1;
      const vp  = page.getViewport({ scale: zoomRef.current });

      const cssW = vp.width;
      const cssH = vp.height;

      [pdfCanvas, hlCanvas, drawCanvas].forEach((c) => {
        c.width  = Math.floor(cssW * dpr);
        c.height = Math.floor(cssH * dpr);
        c.style.width  = `${cssW}px`;
        c.style.height = `${cssH}px`;
      });

      dimsRef.current = {
        pdfW: page.getViewport({ scale: 1 }).width,
        pdfH: page.getViewport({ scale: 1 }).height,
      };

      const renderVp = page.getViewport({ scale: zoomRef.current * dpr });
      const ctx = pdfCanvas.getContext("2d")!;
      const task = page.render({ canvasContext: ctx, viewport: renderVp });
      renderTaskRef.current = task;
      await task.promise;
      renderTaskRef.current = null;
      isRenderedRef.current = true;

      // draw any existing highlights after PDF renders
      redrawHighlights(highlights, hoverIdRef.current);
    } catch {
      // render cancelled — normal during zoom changes
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pageIndex]);

  // ── intersection observer: lazy render ──────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !isRenderedRef.current) renderPage(); },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [renderPage]);

  // ── zoom change: re-render ───────────────────────────────────────────────
  useEffect(() => {
    if (zoom === zoomRef.current) return;
    zoomRef.current = zoom;
    isRenderedRef.current = false;
    if (containerRef.current) renderPage();
  }, [zoom, renderPage]);

  // ── redraw highlights when prop changes ──────────────────────────────────
  function redrawHighlights(hlList: Highlight[], hoverId: string | null) {
    const canvas = hlRef.current;
    const dims   = dimsRef.current;
    if (!canvas || !dims) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx  = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    // CSS mix-blend-mode:multiply handles the blending with the PDF layer below.
    // Draw solid fills here; browser composites them as multiply onto the PDF.

    for (const h of hlList) {
      const css = hRectToCss(h.rect, zoomRef.current, dims.pdfH);
      if (h.id === hoverId && tool === "erase") {
        // Dim the hovered highlight to signal it will be erased
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = COLORS[h.color].canvas;
        ctx.fillRect(css.x, css.y, css.w, css.h);
        ctx.globalAlpha = 1;
        // Red dashed border drawn outside multiply blend via ctx reset is complex —
        // instead just dim it; the cursor change to "no-drop" signals erasure
      } else {
        ctx.fillStyle = COLORS[h.color].canvas;
        ctx.fillRect(css.x, css.y, css.w, css.h);
      }
    }
    ctx.restore();
  }

  useEffect(() => {
    redrawHighlights(highlights, hoverIdRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlights, zoom]);

  // ── live drawing on draw canvas ──────────────────────────────────────────
  function paintDraw() {
    const canvas = drawRef.current;
    const dims   = dimsRef.current;
    const d      = dragRef.current;
    if (!canvas || !dims || !d.active) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx  = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    // CSS mix-blend-mode:multiply on the canvas element handles blending
    ctx.fillStyle = COLORS[color].canvas;
    const x = Math.min(d.x0, d.x1);
    const y = Math.min(d.y0, d.y1);
    const w = Math.abs(d.x1 - d.x0);
    const h = Math.abs(d.y1 - d.y0);
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  // ── pointer handlers ─────────────────────────────────────────────────────
  function canvasPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = canvasPoint(e);

    if (tool === "erase") {
      eraseActiveRef.current = true;
      const dims = dimsRef.current;
      if (!dims) return;
      const z = zoomRef.current;
      const pdfX = x / z;
      const pdfY = dims.pdfH - y / z;
      const found = [...highlights].reverse().find(
        (h) => pdfX >= h.rect.x && pdfX <= h.rect.x + h.rect.w && pdfY >= h.rect.y && pdfY <= h.rect.y + h.rect.h
      );
      if (found) onErase(found.id);
      return;
    }

    dragRef.current = { active: true, x0: x, y0: y, x1: x, y1: y };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const { x, y } = canvasPoint(e);

    if (tool === "erase") {
      const dims = dimsRef.current;
      if (!dims) return;
      const z = zoomRef.current;
      const pdfX = x / z;
      const pdfY = dims.pdfH - y / z;
      const found = [...highlights].reverse().find(
        (h) => pdfX >= h.rect.x && pdfX <= h.rect.x + h.rect.w && pdfY >= h.rect.y && pdfY <= h.rect.y + h.rect.h
      );
      const newId = found?.id ?? null;
      // Drag-to-erase: if pointer is held, erase whatever we pass over
      if (eraseActiveRef.current && found) {
        onErase(found.id);
        return;
      }
      if (newId !== hoverIdRef.current) {
        hoverIdRef.current = newId;
        redrawHighlights(highlights, newId);
      }
      return;
    }

    if (!dragRef.current.active) return;
    dragRef.current.x1 = x;
    dragRef.current.y1 = y;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(paintDraw);
  }

  async function handlePointerUp() {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;

    // clear draw canvas
    const dCanvas = drawRef.current;
    if (dCanvas) {
      const ctx = dCanvas.getContext("2d")!;
      ctx.clearRect(0, 0, dCanvas.width, dCanvas.height);
    }

    const dims = dimsRef.current;
    if (!dims) return;

    const cssX = Math.min(d.x0, d.x1);
    const cssY = Math.min(d.y0, d.y1);
    const cssW = Math.abs(d.x1 - d.x0);
    const cssH = Math.abs(d.y1 - d.y0);

    if (cssW < 4 || cssH < 4) return; // too small

    const drawnRect = cssToHRect(cssX, cssY, cssW, cssH, zoomRef.current, dims.pdfH);

    // lazily load text content
    if (!textRef.current) {
      try {
        const page = await pdfDoc.getPage(pageIndex + 1);
        const tc = await page.getTextContent();
        textRef.current = normalizeItems(tc.items);
      } catch {
        textRef.current = [];
      }
    }

    // Skip highlights over images/diagrams — no selectable text
    const hitItems = textRef.current.filter((i) => itemHits(i, drawnRect));
    if (hitItems.length === 0) return;

    // Snap visual rect to the exact bounding box of matched text items so the
    // highlight aligns with actual text lines rather than the drawn rectangle.
    const snappedRect: HRect = {
      x: Math.min(...hitItems.map((i) => i.pdfX)),
      y: Math.min(...hitItems.map((i) => i.pdfY)),
      w: Math.max(...hitItems.map((i) => i.pdfX + i.pdfW)) - Math.min(...hitItems.map((i) => i.pdfX)),
      h: Math.max(...hitItems.map((i) => i.pdfY + i.pdfH)) - Math.min(...hitItems.map((i) => i.pdfY)),
    };

    const text = smartExtract(textRef.current, drawnRect);

    onAdd({
      id: crypto.randomUUID(),
      page: pageIndex,
      rect: snappedRect,
      color,
      text,
    });
  }

  // ── placeholder while not yet rendered ──────────────────────────────────
  const cssW = dimsRef.current ? dimsRef.current.pdfW * zoom : 612 * zoom;
  const cssH = dimsRef.current ? dimsRef.current.pdfH * zoom : 792 * zoom;

  return (
    <div ref={containerRef} className="relative mx-auto" style={{ width: cssW, height: cssH }}>
      {!isRenderedRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-muted animate-pulse rounded" />
      )}
      <canvas ref={pdfRef} className="absolute inset-0 rounded" style={{ willChange: "transform" }} />
      <canvas
        ref={hlRef}
        className="absolute inset-0 rounded pointer-events-none"
        style={{ willChange: "transform", mixBlendMode: "multiply" }}
      />
      <canvas
        ref={drawRef}
        className="absolute inset-0 rounded"
        style={{
          cursor: tool === "highlight" ? "crosshair" : ERASER_CURSOR,
          touchAction: "none",
          willChange: "transform",
          mixBlendMode: "multiply",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => { eraseActiveRef.current = false; handlePointerUp(); }}
        onPointerCancel={() => { dragRef.current.active = false; eraseActiveRef.current = false; }}
      />
    </div>
  );
});

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface ToolbarProps {
  tool: Tool;
  color: HColor;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  highlightCount: number;
  saveStatus: "idle" | "saving" | "saved";
  fileName: string;
  fullscreen: boolean;
  onTool: (t: Tool) => void;
  onColor: (c: HColor) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  onExport: () => void;
  onFullscreen: () => void;
  onReset: () => void;
}

function Toolbar({
  tool, color, zoom, canUndo, canRedo, highlightCount,
  saveStatus, fileName, fullscreen,
  onTool, onColor, onZoomIn, onZoomOut,
  onUndo, onRedo, onClearAll, onExport, onFullscreen, onReset,
}: ToolbarProps) {
  const utilBtn = "flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase text-foreground-muted border border-border hover:text-primary hover:border-primary/40 transition-colors shrink-0";
  const activeCls = "border-primary/40 bg-primary/10 text-primary";
  const idleCls   = "border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted/50";
  const iconBtn   = "w-7 h-7 flex items-center justify-center border border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-mono text-[11px] shrink-0";
  const vdiv      = <div className="w-px h-4 bg-border/60 mx-1 shrink-0" aria-hidden />;

  return (
    <div className="sticky top-0 z-10 bg-surface border-b border-border select-none">

      {/* ── Header: filename · save · Reset · Fullscreen (single row) ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/40 min-w-0">

        {/* Filename */}
        <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 truncate flex-1 min-w-0">
          {stem(fileName)}
        </span>

        {/* Save status */}
        {saveStatus !== "idle" && (
          <span className={cn(
            "font-mono text-[10px] flex items-center gap-1 shrink-0 whitespace-nowrap",
            saveStatus === "saved" ? "text-green-500" : "text-foreground-muted"
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full bg-current inline-block shrink-0",
              saveStatus === "saving" && "animate-pulse"
            )} />
            {saveStatus === "saved" ? "saved" : "saving…"}
          </span>
        )}

        {/* Reset */}
        <button onClick={onReset} title="Open a different PDF" className={utilBtn}>
          <svg className="sm:hidden w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2.5 8a5.5 5.5 0 1 0 1-3.2" strokeLinecap="round" /><polyline points="2.5 2 2.5 5.5 6 5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Fullscreen */}
        <button onClick={onFullscreen} title={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"} className={utilBtn}>
          {fullscreen ? (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M4.5 1v3H1.5M8.5 1v3h3M8.5 12v-3h3M4.5 12v-3h-3" />
              </svg>
              <span className="hidden sm:inline">minimize</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M1 4.5V1.5H4M9 1.5h3v3M12 8.5v3H9M4 11.5H1v-3" />
              </svg>
              <span className="hidden sm:inline">fullscreen</span>
            </>
          )}
        </button>
      </div>

      {/* ── Tools row ──
           < md  : CSS grid 2-col — controls left (2 sub-rows stacked), Export right (spans both)
           md+   : flex single row, Export pushed to far right
      ── */}
      <div className="
        grid grid-cols-[1fr_auto] gap-x-2 gap-y-1.5
        md:flex md:flex-row md:items-center md:gap-1.5
        px-3 py-2
      ">

        {/* Sub-row 1 — H/E toggle + color swatches */}
        <div className="col-start-1 row-start-1 flex items-center gap-1.5">
          {/* Tool toggle */}
          <div className="flex items-center border border-border overflow-hidden shrink-0">
            <button
              className={cn("flex items-center gap-1 px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase transition-colors", tool === "highlight" ? activeCls : idleCls)}
              onClick={() => onTool("highlight")}
              title="Highlight (H)"
            >
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path d="M9.5 1l4 4-7 7H3v-3.5l6.5-7.5z" />
              </svg>
              <span className="hidden md:inline">Highlight</span>
            </button>
            <div className="w-px self-stretch bg-border" />
            <button
              className={cn("flex items-center gap-1 px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase transition-colors", tool === "erase" ? activeCls : idleCls)}
              onClick={() => onTool("erase")}
              title="Erase (E)"
            >
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 13L7 3l7 3.5L9 14H4z" strokeLinejoin="round"/>
                <line x1="7" y1="3" x2="14" y2="6.5" strokeLinecap="round"/>
                <line x1="2" y1="15" x2="14" y2="15" strokeLinecap="round" strokeOpacity="0.5"/>
              </svg>
              <span className="hidden md:inline">Erase</span>
            </button>
          </div>

          {vdiv}

          {/* Color swatches — slightly larger below md for tap targets */}
          <div className="flex items-center gap-1.5 shrink-0">
            {(Object.keys(COLORS) as HColor[]).map((c) => (
              <button
                key={c}
                title={COLORS[c].label}
                onClick={() => { onTool("highlight"); onColor(c); }}
                className={cn(
                  "w-5 h-5 md:w-4 md:h-4 rounded-full border-2 transition-all shrink-0",
                  color === c && tool === "highlight"
                    ? "border-foreground scale-110 shadow-sm"
                    : "border-transparent hover:scale-105 hover:border-foreground/40"
                )}
                style={{ background: COLORS[c].swatch }}
              />
            ))}
          </div>
        </div>

        {/* Sub-row 2 — undo/redo · clear · zoom */}
        {/* md:contents: div disappears in flex mode, children become direct flex items */}
        <div className="col-start-1 row-start-2 flex items-center gap-1.5 md:contents">
          {/* separator from sub-row 1 — only visible in md+ flex row */}
          <div className="hidden md:block w-px h-4 bg-border/60 mx-0.5 shrink-0" aria-hidden />

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button className={iconBtn} onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">↩</button>
            <button className={iconBtn} onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">↪</button>
          </div>

          {vdiv}

          {/* Clear */}
          <button
            className={cn(iconBtn, "w-auto px-2 gap-1")}
            onClick={onClearAll}
            disabled={highlightCount === 0}
            title="Clear all highlights"
          >
            <svg className="md:hidden w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M3 4h10M5 4V2.5h6V4M4.5 4l.5 9.5h6l.5-9.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden md:inline font-mono text-[10px] uppercase tracking-wider">Clear</span>
          </button>

          {vdiv}

          {/* Zoom */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button className={iconBtn} onClick={onZoomOut} title="Zoom out (−)">−</button>
            <span className="font-mono text-[11px] text-foreground-muted w-10 text-center tabular-nums select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button className={iconBtn} onClick={onZoomIn} title="Zoom in (+)">+</button>
          </div>
        </div>

        {/* Export — col 2 spans both sub-rows on mobile; ml-auto inline on md+ */}
        <button
          onClick={onExport}
          disabled={highlightCount === 0}
          className={cn(
            "col-start-2 row-start-1 row-span-2",
            "md:col-auto md:row-auto md:ml-auto",
            "flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5",
            "min-w-[3rem] md:min-w-0 px-3 py-1 border font-mono text-[11px] tracking-wider uppercase transition-colors",
            highlightCount > 0
              ? "border-primary bg-primary text-white hover:bg-primary/90 hover:border-primary/90"
              : "border-border text-foreground-muted cursor-not-allowed opacity-50"
          )}
          title={highlightCount === 0 ? "Add highlights first" : "Export highlights"}
        >
          <svg className="w-4 h-4 md:w-3 md:h-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2v8m0 0L5 7m3 3l3-3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12v1.5h12V12" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] md:text-[11px] tracking-wider">Export</span>
        </button>
      </div>
    </div>
  );
}

// ─── ExportModal ──────────────────────────────────────────────────────────────

interface ExportModalProps {
  highlights: Highlight[];
  fileName: string;
  pdfBytes: ArrayBuffer | null;
  onClose: () => void;
}

function ExportModal({ highlights, fileName, pdfBytes, onClose }: ExportModalProps) {
  type Mode = "full-pdf" | "highlights-only";
  type ExtractFmt = "txt" | "docx" | "pdf" | "print";

  const [mode, setMode] = useState<Mode>("full-pdf");
  const [format, setFormat] = useState<ExtractFmt>("docx");
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setBusy(true);
    try {
      if (mode === "full-pdf") {
        if (pdfBytes) await exportAnnotatedPdf(highlights, pdfBytes, fileName);
      } else {
        if (format === "txt")   exportTxt(highlights, fileName, showPageNumbers);
        if (format === "docx")  await exportDocx(highlights, fileName, showPageNumbers);
        if (format === "pdf")   await exportPdf(highlights, fileName, showPageNumbers);
        if (format === "print") {
          const byPage = new Map<number, Highlight[]>();
          for (const h of [...highlights].sort((a, b) => a.page - b.page || b.rect.y - a.rect.y)) {
            if (!byPage.has(h.page)) byPage.set(h.page, []);
            byPage.get(h.page)!.push(h);
          }
          const text = [...byPage.entries()]
            .sort(([a], [b]) => a - b)
            .map(([pg, hls]) => {
              const header = showPageNumbers ? `Page ${pg + 1}\n${"─".repeat(30)}\n` : "";
              return `${header}${hls.map((h) => h.text).join("\n\n")}`;
            })
            .join("\n\n");
          const w = window.open("", "_blank");
          if (w) {
            w.document.write(`<pre style="font-family:serif;font-size:14px;line-height:1.6;padding:2rem;max-width:720px;margin:auto">${text.replace(/</g, "&lt;")}</pre>`);
            w.document.close();
            w.print();
          }
        }
      }
      onClose();
    } finally {
      setBusy(false);
    }
  }

  const extractFormats: { id: ExtractFmt; label: string; desc: string }[] = [
    { id: "docx",  label: "Word Document (.docx)", desc: "Highlight colors preserved in Word / Google Docs" },
    { id: "pdf",   label: "Highlights PDF (.pdf)",  desc: "New PDF with only the highlighted passages" },
    { id: "txt",   label: "Plain Text (.txt)",      desc: "Clean text, great for pasting into notes" },
    { id: "print", label: "Print / Save as PDF",    desc: "Opens browser print dialog" },
  ];

  const canDownload = mode === "full-pdf" ? !!pdfBytes : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Export</h3>
          <p className="text-xs text-foreground-muted mt-0.5">
            {highlights.length} highlight{highlights.length !== 1 ? "s" : ""} across{" "}
            {new Set(highlights.map((h) => h.page)).size} page{new Set(highlights.map((h) => h.page)).size !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Options */}
        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Option 1 */}
          <label className={cn(
            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
            mode === "full-pdf" ? "border-primary/40 bg-primary/5" : "border-border hover:border-foreground-muted/30"
          )}>
            <input type="radio" name="export-mode" value="full-pdf" checked={mode === "full-pdf"}
              onChange={() => setMode("full-pdf")} className="mt-0.5 accent-[var(--color-primary)]" />
            <span>
              <span className="block text-sm font-medium text-foreground">Download full PDF</span>
              <span className="block text-xs text-foreground-muted mt-0.5">Original PDF with highlights baked in — all pages, layout preserved</span>
              {!pdfBytes && <span className="block text-xs text-foreground-muted/50 mt-1">PDF not available</span>}
            </span>
          </label>

          {/* Option 2 */}
          <label className={cn(
            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
            mode === "highlights-only" ? "border-primary/40 bg-primary/5" : "border-border hover:border-foreground-muted/30"
          )}>
            <input type="radio" name="export-mode" value="highlights-only" checked={mode === "highlights-only"}
              onChange={() => setMode("highlights-only")} className="mt-0.5 accent-[var(--color-primary)]" />
            <span className="flex-1">
              <span className="block text-sm font-medium text-foreground">Download highlighted text only</span>
              <span className="block text-xs text-foreground-muted mt-0.5">Export only the passages you highlighted</span>
            </span>
          </label>

          {/* Format picker — only when highlights-only selected */}
          {mode === "highlights-only" && (
            <div className="ml-6 flex flex-col gap-2">
              <div className="flex flex-col gap-1.5">
                {extractFormats.map((f) => (
                  <label key={f.id} className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md border cursor-pointer transition-colors text-xs",
                    format === f.id ? "border-primary/40 bg-primary/5 text-foreground" : "border-border text-foreground-muted hover:border-foreground-muted/30 hover:text-foreground"
                  )}>
                    <input type="radio" name="export-format" value={f.id} checked={format === f.id}
                      onChange={() => setFormat(f.id)} className="accent-[var(--color-primary)]" />
                    <span>
                      <span className="font-medium">{f.label}</span>
                      <span className="block text-[11px] opacity-70 mt-0.5">{f.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
              <label className="flex items-center gap-2 px-1 cursor-pointer select-none mt-0.5">
                <input type="checkbox" checked={showPageNumbers} onChange={(e) => setShowPageNumbers(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[var(--color-primary)] cursor-pointer" />
                <span className="text-xs text-foreground-muted">Include page numbers</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-5 pb-5 flex gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose}
            className="flex-1 py-2 rounded-md border border-border text-xs text-foreground-muted hover:text-foreground hover:border-foreground-muted/40 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleDownload} disabled={busy || !canDownload}
            className={cn(
              "flex-1 py-2 rounded-md border text-xs font-medium transition-colors",
              canDownload && !busy
                ? "border-primary bg-primary text-white hover:bg-primary/90"
                : "border-border text-foreground-muted opacity-50 cursor-not-allowed"
            )}>
            {busy ? "…" : format === "print" && mode === "highlights-only" ? "Print" : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PdfHighlighter (main export) ────────────────────────────────────────────

export function PdfHighlighter() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc]     = useState<any | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [fileName, setFileName] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phase, setPhase]       = useState<"upload" | "checking" | "active">("upload");
  const [errMsg, setErrMsg]     = useState<string | null>(null);

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [undoStack, setUndoStack]   = useState<Highlight[][]>([]);
  const [redoStack, setRedoStack]   = useState<Highlight[][]>([]);

  const [tool,  setTool]  = useState<Tool>("highlight");
  const [color, setColor] = useState<HColor>("yellow");
  const [zoom,  setZoom]  = useState(1.0);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showExport, setShowExport] = useState(false);
  const [resumeSession, setResumeSession] = useState<Session | null>(null);

  const pdfBytesRef  = useRef<ArrayBuffer | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ── load saved session on mount ────────────────────────────────────────
  useEffect(() => {
    dbLoad()
      .then((session) => {
        // Only offer resume when there are highlights worth coming back to
        if (session && session.highlights.length > 0) setResumeSession(session);
      })
      .catch(() => {});
  }, []);

  // ── fullscreen effects ─────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  // ── keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "h" && !e.ctrlKey && !e.metaKey) setTool("highlight");
      if (e.key === "e" && !e.ctrlKey && !e.metaKey) setTool("erase");
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoStack, redoStack, highlights, sessionId, fileName, numPages]);

  // ── auto-save ──────────────────────────────────────────────────────────
  function scheduleSave(
    id: string, name: string, pages: number,
    hls: Highlight[], bytes: ArrayBuffer,
    undos: Highlight[][], redos: Highlight[][]
  ) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(async () => {
      try {
        await dbSave({ id, name, pdfBytes: bytes, highlights: hls, undoStack: undos, redoStack: redos, pages, savedAt: Date.now() });
        setSaveStatus("saved");
      } catch { setSaveStatus("idle"); }
    }, 350);
  }

  // ── undo / redo ────────────────────────────────────────────────────────
  // All state mutations compute the next snapshot explicitly so the undo/redo
  // stacks can be persisted atomically alongside the highlights in the same
  // scheduleSave call — no stale-closure risk.

  function undo() {
    if (undoStack.length === 0) return;
    const prev     = undoStack[undoStack.length - 1];
    const newUndos = undoStack.slice(0, -1);
    const newRedos = [...redoStack, highlights];
    setHighlights(prev);
    setUndoStack(newUndos);
    setRedoStack(newRedos);
    if (sessionId && pdfBytesRef.current && fileName)
      scheduleSave(sessionId, fileName, numPages, prev, pdfBytesRef.current, newUndos, newRedos);
  }

  function redo() {
    if (redoStack.length === 0) return;
    const next     = redoStack[redoStack.length - 1];
    const newUndos = [...undoStack, highlights];
    const newRedos = redoStack.slice(0, -1);
    setHighlights(next);
    setUndoStack(newUndos);
    setRedoStack(newRedos);
    if (sessionId && pdfBytesRef.current && fileName)
      scheduleSave(sessionId, fileName, numPages, next, pdfBytesRef.current, newUndos, newRedos);
  }

  // ── highlight add / erase ──────────────────────────────────────────────
  // Use current highlights/undoStack directly (not functional setState) so the
  // new stacks are available synchronously for the scheduleSave call.
  const handleAdd = useCallback((h: Highlight) => {
    const next     = [...highlights, h];
    const newUndos = [...undoStack, highlights];
    const newRedos: Highlight[][] = [];
    setHighlights(next);
    setUndoStack(newUndos);
    setRedoStack(newRedos);
    if (sessionId && pdfBytesRef.current && fileName)
      scheduleSave(sessionId, fileName, numPages, next, pdfBytesRef.current, newUndos, newRedos);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, fileName, numPages, highlights, undoStack]);

  const handleErase = useCallback((id: string) => {
    const next     = highlights.filter((h) => h.id !== id);
    const newUndos = [...undoStack, highlights];
    const newRedos: Highlight[][] = [];
    setHighlights(next);
    setUndoStack(newUndos);
    setRedoStack(newRedos);
    if (sessionId && pdfBytesRef.current && fileName)
      scheduleSave(sessionId, fileName, numPages, next, pdfBytesRef.current, newUndos, newRedos);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, fileName, numPages, highlights, undoStack]);

  function clearAll() {
    const newUndos = [...undoStack, highlights];
    const newRedos: Highlight[][] = [];
    setHighlights([]);
    setUndoStack(newUndos);
    setRedoStack(newRedos);
    if (sessionId && pdfBytesRef.current && fileName)
      scheduleSave(sessionId, fileName, numPages, [], pdfBytesRef.current, newUndos, newRedos);
  }

  // ── zoom ──────────────────────────────────────────────────────────────
  function zoomIn()  { setZoom((z) => ZOOM_LEVELS[Math.min(ZOOM_LEVELS.indexOf(z) + 1, ZOOM_LEVELS.length - 1)]); }
  function zoomOut() { setZoom((z) => ZOOM_LEVELS[Math.max(ZOOM_LEVELS.indexOf(z) - 1, 0)]); }

  // ── load PDF ──────────────────────────────────────────────────────────
  async function loadPdf(
    bytes: ArrayBuffer,
    name: string,
    savedHighlights: Highlight[] = [],
    savedUndoStack: Highlight[][] = [],
    savedRedoStack: Highlight[][] = []
  ) {
    setPhase("checking");
    setErrMsg(null);

    try {
      // Lazy-load pdfjs to avoid SSR crash
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const doc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;

      // Check for selectable text (sample up to 4 pages)
      let totalItems = 0;
      const check = Math.min(4, doc.numPages);
      for (let i = 1; i <= check; i++) {
        const pg = await doc.getPage(i);
        const tc = await pg.getTextContent();
        totalItems += tc.items.length;
      }

      if (totalItems < 8) {
        setErrMsg("This PDF doesn't contain selectable text — it's likely a scanned image. Text highlighting requires a PDF with selectable text.");
        setPhase("upload");
        return;
      }

      const sid = crypto.randomUUID();
      pdfBytesRef.current = bytes;
      setSessionId(sid);
      setFileName(name);
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setHighlights(savedHighlights);
      setUndoStack(savedUndoStack);
      setRedoStack(savedRedoStack);
      setPhase("active");

      await dbSave({ id: sid, name, pdfBytes: bytes, highlights: savedHighlights, undoStack: savedUndoStack, redoStack: savedRedoStack, pages: doc.numPages, savedAt: Date.now() });
      setSaveStatus("saved");
    } catch (e) {
      setErrMsg(`Failed to load PDF: ${e instanceof Error ? e.message : "unknown error"}`);
      setPhase("upload");
    }
  }

  // ── resume session ────────────────────────────────────────────────────
  async function resumeSavedSession(session: Session) {
    setResumeSession(null);
    // `?? []` handles sessions saved before undo/redo persistence was added
    await loadPdf(session.pdfBytes, session.name, session.highlights, session.undoStack ?? [], session.redoStack ?? []);
  }

  // ── upload handling ──────────────────────────────────────────────────
  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrMsg("Please upload a PDF file.");
      return;
    }
    setResumeSession(null);
    const bytes = await file.arrayBuffer();
    await loadPdf(bytes, file.name);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // ── open different PDF ──────────────────────────────────────────────────
  function doOpenDifferent() {
    setConfirmOpen(false);
    setPdfDoc(null);
    setPhase("upload");
    setHighlights([]);
    setUndoStack([]);
    setRedoStack([]);
    setFullscreen(false);
  }

  function handleOpenDifferent() {
    // If the user has highlights, ask before abandoning (session is saved in DB,
    // but opening a new PDF will overwrite it with only one slot available).
    if (highlights.length > 0) {
      setConfirmOpen(true);
    } else {
      doOpenDifferent();
    }
  }

  // ── per-page highlights (memoized) ───────────────────────────────────
  const pageHighlights = useMemo(() => {
    const map = new Map<number, Highlight[]>();
    for (const h of highlights) {
      if (!map.has(h.page)) map.set(h.page, []);
      map.get(h.page)!.push(h);
    }
    return map;
  }, [highlights]);

  // ─────────────────────────────────────────────────────────────────────

  if (phase === "upload" || phase === "checking") {
    return (
      <div className="w-full space-y-4">
        {/* Resume banner */}
        {resumeSession && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-primary/30 bg-primary/5 text-sm">
            <span className="text-foreground">
              <span className="font-medium">Resume session:</span>{" "}
              <span className="text-foreground-muted">{resumeSession.name}</span>
              {resumeSession.highlights.length > 0 && (
                <span className="ml-1 text-foreground-muted">· {resumeSession.highlights.length} highlight{resumeSession.highlights.length !== 1 ? "s" : ""}</span>
              )}
            </span>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => resumeSavedSession(resumeSession)}
                className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Resume
              </button>
              <button
                onClick={() => setResumeSession(null)}
                className="px-3 py-1.5 text-xs font-medium border border-border rounded-md text-foreground-muted hover:text-foreground transition-colors"
              >
                New
              </button>
            </div>
          </div>
        )}

        {/* Drop zone */}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed transition-colors cursor-pointer",
            isDragging
              ? "border-primary/70 bg-primary/5 cursor-copy"
              : "border-border hover:border-foreground-muted/90"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (phase !== "checking") document.getElementById("pdf-hl-input")?.click();
          }}
        >
          <svg
            className={cn("w-9 h-9 transition-colors", isDragging ? "text-primary" : "text-foreground-muted/30")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.25}
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="12" y2="17" />
          </svg>
          {phase === "checking" ? (
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted/55 animate-pulse">
              Checking for selectable text…
            </p>
          ) : (
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted/55">
                Drop PDF here or click to browse
              </p>
              <p className="font-mono text-[9px] text-foreground-muted/30 mt-1">
                Selectable text required — scanned PDFs won&apos;t work
              </p>
            </div>
          )}
          <input
            id="pdf-hl-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {/* Error */}
        {errMsg && (
          <div className="flex gap-2 rounded-lg border border-status-err-border bg-status-err-bg px-4 py-3 text-sm text-status-err-text">
            <span className="flex-shrink-0">⚠</span>
            <span>{errMsg}</span>
          </div>
        )}

        {/* Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Highlight */}
          <div className="border border-border p-3 flex gap-3 items-start">
            <svg className="w-4 h-4 text-foreground-muted flex-shrink-0 mt-px" viewBox="0 0 16 16" fill="currentColor">
              <path d="M9.5 1l4 4-7 7H3v-3.5l6.5-7.5z" />
            </svg>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground">{`Highlight text`}</p>
              <p className="text-xs text-foreground-muted mt-0.5">Draw over text with multiple colors. Undo/redo at any time.</p>
            </div>
          </div>
          {/* Auto-save */}
          <div className="border border-border p-3 flex gap-3 items-start">
            <svg className="w-4 h-4 text-foreground-muted flex-shrink-0 mt-px" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 2h9l3 3v9H2V2z" strokeLinejoin="round" />
              <path d="M5 2v4h6V2M5 10h6" strokeLinecap="round" />
            </svg>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground">{`Auto-saved locally`}</p>
              <p className="text-xs text-foreground-muted mt-0.5">Sessions persist in your browser. Resume where you left off.</p>
            </div>
          </div>
          {/* Export */}
          <div className="border border-border p-3 flex gap-3 items-start">
            <svg className="w-4 h-4 text-foreground-muted flex-shrink-0 mt-px" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v8m0 0L5 7m3 3l3-3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round" />
            </svg>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground">{`Export DOCX / PDF / TXT`}</p>
              <p className="text-xs text-foreground-muted mt-0.5">Extract only the highlighted passages in the format you need.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── active viewer ─────────────────────────────────────────────────────

  return (
    <div
      className={cn("w-full flex flex-col", fullscreen && "fixed inset-x-0 top-14 bottom-0 z-40 bg-surface")}
      style={{ userSelect: "none" }}
    >
      <Toolbar
        tool={tool}
        color={color}
        zoom={zoom}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        highlightCount={highlights.length}
        saveStatus={saveStatus}
        fileName={fileName}
        fullscreen={fullscreen}
        onTool={setTool}
        onColor={(c) => setColor(c)}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onUndo={undo}
        onRedo={redo}
        onClearAll={clearAll}
        onExport={() => setShowExport(true)}
        onFullscreen={() => setFullscreen((v) => !v)}
        onReset={handleOpenDifferent}
      />

      {/* PDF pages */}
      <div
        className="flex-1 overflow-y-auto bg-surface-muted"
        style={fullscreen ? { minHeight: 0 } : { minHeight: 480, maxHeight: "70vh" }}
      >
        <div className="flex flex-col items-center gap-6 py-6 px-4">
          {Array.from({ length: numPages }, (_, i) => (
            <PdfPage
              key={i}
              pdfDoc={pdfDoc}
              pageIndex={i}
              zoom={zoom}
              highlights={pageHighlights.get(i) ?? []}
              tool={tool}
              color={color}
              onAdd={handleAdd}
              onErase={handleErase}
            />
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-4 py-2 border-t border-border text-[11px] font-mono text-foreground-muted bg-surface">
        <div className="flex items-center gap-2 shrink-0">
          <span>{numPages} page{numPages !== 1 ? "s" : ""}</span>
          <span className="text-border">·</span>
          <span>{highlights.length} highlight{highlights.length !== 1 ? "s" : ""}</span>
          {highlights.length > 0 && (
            <>
              <span className="text-border">·</span>
              <span>{new Set(highlights.map((h) => h.page)).size} page{new Set(highlights.map((h) => h.page)).size !== 1 ? "s" : ""} annotated</span>
            </>
          )}
        </div>
        <span className="hidden md:block flex-1" />
        <span className="hidden md:block text-foreground-muted/50">H — highlight · E — erase · Ctrl+Z — undo</span>
        <span className="md:hidden text-foreground-muted/40 text-[10px]">H · E · Ctrl+Z</span>
      </div>

      {showExport && (
        <ExportModal
          highlights={highlights}
          fileName={fileName}
          pdfBytes={pdfBytesRef.current}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Confirm: replace saved session before opening a new PDF */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setConfirmOpen(false)}>
          <div
            className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-semibold text-foreground text-sm">Open a different PDF?</h3>
              <p className="text-xs text-foreground-muted mt-1.5">
                You have <span className="text-foreground font-medium">{highlights.length} highlight{highlights.length !== 1 ? "s" : ""}</span> in the current session.
                Only one PDF session can be saved at a time — opening a new PDF will replace it.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={doOpenDifferent}
                className="flex-1 py-2 text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Open new PDF
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirmOpen(false); }}
                className="flex-1 py-2 text-xs border border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted/40 transition-colors"
              >
                Stay here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
