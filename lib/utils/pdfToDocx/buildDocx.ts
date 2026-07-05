import {
  Document,
  Paragraph,
  TextRun,
  Tab,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
  TabStopType,
  TabStopPosition,
  Packer,
} from "docx";
import type { ClassifiedParagraph, ClassifiedRun, DocumentGeometry } from "./types";

const PTS_TO_TWIPS = 20;

const HEADING_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
};

const ALIGNMENT_MAP: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
};

function isValidHexColor(color: string | undefined): boolean {
  if (!color) return false;
  return /^[0-9a-fA-F]{6}$/.test(color);
}

function buildTextRun(run: ClassifiedRun): TextRun {
  return new TextRun({
    text: run.text,
    bold: run.bold,
    italics: run.italic,
    color: isValidHexColor(run.color) ? run.color : undefined,
    size: run.fontSize,
    font: run.font,
  });
}

function buildParagraphChildren(
  classified: ClassifiedParagraph
): (TextRun | Tab)[] {
  const children: (TextRun | Tab)[] = [];
  const forceHeadingBold = classified.type === "heading";

  for (const run of classified.runs) {
    if (run.text) {
      const r = forceHeadingBold ? { ...run, bold: true } : run;
      children.push(buildTextRun(r));
    }
  }

  if (classified.hasTabStop && classified.rightRuns.length > 0) {
    children.push(new Tab());
    for (const run of classified.rightRuns) {
      if (run.text) children.push(buildTextRun(run));
    }
  }

  return children;
}

function buildParagraph(classified: ClassifiedParagraph): Paragraph {
  const children = buildParagraphChildren(classified);

  if (classified.type === "heading" && classified.headingLevel) {
    return new Paragraph({
      heading: HEADING_MAP[classified.headingLevel],
      children,
      alignment: ALIGNMENT_MAP[classified.alignment] ?? AlignmentType.LEFT,
      spacing: {
        before: classified.spacingBefore || undefined,
        after: classified.spacingAfter || undefined,
      },
      pageBreakBefore: classified.pageBreakBefore || undefined,
      tabStops: classified.hasTabStop
        ? [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }]
        : undefined,
    });
  }

  if (classified.type === "bullet") {
    return new Paragraph({
      numbering: {
        reference: "bullets",
        level: classified.bulletLevel,
      },
      children,
      spacing: {
        before: classified.spacingBefore || undefined,
        after: classified.spacingAfter || undefined,
      },
      pageBreakBefore: classified.pageBreakBefore || undefined,
    });
  }

  return new Paragraph({
    children,
    alignment: ALIGNMENT_MAP[classified.alignment] ?? AlignmentType.LEFT,
    indent: classified.indentLeft
      ? {
          left: classified.indentLeft,
          hanging: classified.hanging || undefined,
        }
      : undefined,
    spacing: {
      before: classified.spacingBefore || undefined,
      after: classified.spacingAfter || undefined,
    },
    pageBreakBefore: classified.pageBreakBefore || undefined,
    tabStops: classified.hasTabStop
      ? [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }]
      : undefined,
  });
}

export async function buildDocx(
  paragraphs: ClassifiedParagraph[],
  geometry: DocumentGeometry
): Promise<Uint8Array> {
  const docParagraphs = paragraphs.map(buildParagraph);

  const bulletIndentTwips = Math.round(geometry.bulletIndentPts * PTS_TO_TWIPS);
  const bulletHanging = Math.round(8 * PTS_TO_TWIPS);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: bulletIndentTwips,
                    hanging: bulletHanging,
                  },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.BULLET,
              text: "◦",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: bulletIndentTwips * 2,
                    hanging: bulletHanging,
                  },
                },
              },
            },
            {
              level: 2,
              format: LevelFormat.BULLET,
              text: "–",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: bulletIndentTwips * 3,
                    hanging: bulletHanging,
                  },
                },
              },
            },
            {
              level: 3,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: bulletIndentTwips * 4,
                    hanging: bulletHanging,
                  },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: Math.round(geometry.marginTopPts * PTS_TO_TWIPS),
              bottom: Math.round(geometry.marginBottomPts * PTS_TO_TWIPS),
              left: Math.round(geometry.marginLeftPts * PTS_TO_TWIPS),
              right: Math.round(geometry.marginRightPts * PTS_TO_TWIPS),
            },
          },
        },
        children: docParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return new Uint8Array(await blob.arrayBuffer());
}
