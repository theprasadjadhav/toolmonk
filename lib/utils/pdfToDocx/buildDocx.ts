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
  convertInchesToTwip,
} from "docx";
import type { ClassifiedParagraph, ClassifiedRun } from "./types";

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

function buildTextRun(run: ClassifiedRun): TextRun {
  return new TextRun({
    text: run.text,
    bold: run.bold,
    italics: run.italic,
    color: run.color,
    size: run.fontSize,
    font: run.font,
  });
}

function buildParagraphChildren(
  classified: ClassifiedParagraph
): (TextRun | Tab)[] {
  const children: (TextRun | Tab)[] = [];

  for (const run of classified.runs) {
    if (run.text) children.push(buildTextRun(run));
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
  paragraphs: ClassifiedParagraph[]
): Promise<Uint8Array> {
  const docParagraphs = paragraphs.map(buildParagraph);

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
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.25),
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
                    left: convertInchesToTwip(1.0),
                    hanging: convertInchesToTwip(0.25),
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
                    left: convertInchesToTwip(1.5),
                    hanging: convertInchesToTwip(0.25),
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
                    left: convertInchesToTwip(2.0),
                    hanging: convertInchesToTwip(0.25),
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
              top: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.5),
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
