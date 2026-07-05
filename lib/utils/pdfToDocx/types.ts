export interface RawTextItem {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  width: number;
  height: number;
  fontName: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  color: string;
  hasEOL: boolean;
  pageIndex: number;
  pageHeight: number;
  pageWidth: number;
}

export interface Line {
  items: RawTextItem[];
  y: number;
  x: number;
  xEnd: number;
  pageIndex: number;
  dominantFontSize: number;
  dominantBold: boolean;
  dominantItalic: boolean;
  dominantColor: string;
  dominantFont: string;
  text: string;
}

export interface RawParagraph {
  lines: Line[];
  pageIndex: number;
  leftIndent: number;
  firstLineIndent: number;
  alignment: "left" | "center" | "right";
  dominantFontSize: number;
  dominantBold: boolean;
  dominantItalic: boolean;
  dominantColor: string;
  dominantFont: string;
  text: string;
  spacingBefore: number;
  hasRightAlignedPart: boolean;
  rightAlignedText: string;
  leftAlignedText: string;
}

export interface ClassifiedRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontSize?: number;
  font?: string;
}

export interface ClassifiedParagraph {
  type: "heading" | "bullet" | "body";
  headingLevel?: 1 | 2 | 3 | 4;
  runs: ClassifiedRun[];
  alignment: "left" | "center" | "right";
  indentLeft: number;
  hanging: number;
  spacingBefore: number;
  spacingAfter: number;
  bulletLevel: number;
  hasTabStop: boolean;
  rightRuns: ClassifiedRun[];
  pageBreakBefore: boolean;
}

export interface PageData {
  items: RawTextItem[];
  width: number;
  height: number;
  pageIndex: number;
}

export interface DocumentGeometry {
  pageWidthPts: number;
  pageHeightPts: number;
  marginLeftPts: number;
  marginRightPts: number;
  marginTopPts: number;
  marginBottomPts: number;
  bodyFontSize: number;
  bodyColor: string;
  bodyFont: string;
  bulletIndentPts: number;
}
