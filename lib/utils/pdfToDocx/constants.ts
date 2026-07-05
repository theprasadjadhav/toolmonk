export const HEADING1_MIN_SIZE = 24;
export const HEADING2_MIN_SIZE = 18;
export const HEADING3_MIN_SIZE = 14;

export const BULLET_CHARS = [
  "•", // •
  "▪", // ▪
  "▸", // ▸
  "◦", // ◦
  "‣", // ‣
  "●", // ●
  "○", // ○
  "■", // ■
  "–", // –
  "—", // —
];

export const BULLET_REGEX = new RegExp(
  `^\\s*[${BULLET_CHARS.join("")}\\-]\\s*`
);

export const NUMBERED_REGEX = /^\s*\d+[.)]\s+/;

export const LINE_Y_TOLERANCE_FACTOR = 0.5;
export const SPACE_GAP_FACTOR = 0.25;
export const TAB_GAP_FACTOR = 4;

export const PARAGRAPH_GAP_FACTOR = 1.5;
export const INDENT_CHANGE_THRESHOLD = 10;

export const CENTER_TOLERANCE = 10;
export const RIGHT_ALIGN_THRESHOLD = 50;

export const HEADER_FOOTER_ZONE = 50;
export const MAX_HEADING_LENGTH = 120;

export const NEAR_WHITE_THRESHOLD = 700;
export const DEFAULT_FONT = "Calibri";

export const PTS_TO_TWIPS = 20;
export const PTS_TO_HALF_PTS = 2;

export const OPS = {
  save: 10,
  restore: 11,
  showText: 44,
  showSpacedText: 45,
  nextLineShowText: 46,
  nextLineSetSpacingShowText: 47,
  setFillGray: 57,
  setFillRGBColor: 59,
  setFillCMYKColor: 61,
} as const;
