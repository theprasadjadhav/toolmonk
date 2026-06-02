import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TextDiff } from "@/components/tools/comparators/TextDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/text-diff")!;

export const metadata = generateToolMetadata("", "/comparators/text-diff");

const howToSteps = [
  "Paste your <strong>original text</strong> into the left panel (A) — this is the baseline.",
  "Paste the <strong>modified text</strong> into the right panel (B) — this is the updated version.",
  "Lines added in B appear in <strong>green</strong>; lines removed from A appear in <strong>red</strong>.",
  "Use <strong>swap</strong> to reverse A and B if needed, or <strong>clear</strong> to reset both panels.",
];

const faqs = [
  {
    question: "How does the text diff work?",
    answer: "The diff compares the two panels line by line using Monaco Editor's built-in diff engine. Added lines are highlighted green, removed lines red. Lines with partial changes show both the old (red) and new (green) content at the same position.",
  },
  {
    question: "Is whitespace included in the comparison?",
    answer: "Yes, by default whitespace differences are included. If two lines differ only in trailing spaces or indentation they will still be flagged as different.",
  },
  {
    question: "Is my text sent to a server?",
    answer: "No. All comparison happens entirely in your browser. Nothing you paste is transmitted.",
  },
  {
    question: "Can I compare files by uploading them?",
    answer: "Yes. Each panel has an upload button. Click it to load a local text file directly into the editor.",
  },
  {
    question: "What does 'identical' mean in the status bar?",
    answer: "Both panels contain the same content, character for character. No differences were found.",
  },
];

export default function TextDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <TextDiff />
    </ToolContainer>
  );
}
