import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TextReverser } from "@/components/tools/text-tools/TextReverser";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("text-reverser");
const tool = TOOLS.find((t) => t.slug === "text-reverser")!;

const howToSteps = [
  "Paste or type your text into the <strong>input area</strong> — any length of text is accepted.",
  "Choose a <strong>reverse mode</strong>: Characters (mirror the entire string), Words (flip word order), or Lines (flip line order).",
  "The <strong>reversed text</strong> appears instantly in the result area as soon as you select a mode.",
  "Click <strong>Copy</strong> to copy the reversed result to your clipboard.",
];

const faqs = [
  {
    question: "What does 'Reverse by characters' do?",
    answer:
      "Every character in the entire text is reversed so the <strong>last character becomes first</strong>. This is the classic mirror-image string reversal — 'Hello' becomes 'olleH'. It is the most complete reversal option.",
  },
  {
    question: "What does 'Reverse by words' do?",
    answer:
      "The <strong>order of words</strong> is reversed while each individual word stays intact. 'Hello world foo' becomes 'foo world Hello'. This is useful for inverting sentence structures or reordering lists without scrambling the words themselves.",
  },
  {
    question: "What does 'Reverse by lines' do?",
    answer:
      "The <strong>order of lines</strong> is reversed — the last line becomes first, and the first line becomes last. The content of each individual line is unchanged. This is useful for flipping the order of a numbered list, a log file, or a multi-line dataset.",
  },
  {
    question: "What are common uses for text reversal?",
    answer:
      "Text reversal is used for <strong>puzzles and word games</strong>, creating <strong>mirror-text effects</strong> in creative design, testing input validation in forms and applications, and reversing the order of a list or set of lines for data processing purposes.",
  },
  {
    question: "Does it handle multi-line text?",
    answer:
      "Yes — all three modes work on <strong>multi-line text</strong>. Character mode reverses the entire block including newlines; Word mode reverses all words across all lines; Line mode reverses the sequence of lines as discrete units.",
  },
  {
    question: "Are spaces and punctuation preserved?",
    answer:
      "Yes — <strong>spaces, punctuation, and special characters</strong> are treated as regular characters and are reversed or repositioned along with the rest of the text, depending on the mode chosen.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Common Use Cases for Text Reversal",
    content: `<ul>
<li><strong>Puzzle and game creators</strong> — reverse words or sentences to create word puzzles, hidden messages, or challenge content for educational games.</li>
<li><strong>Creative designers</strong> — generate mirror text for artistic titles, typographic effects, or decorative text elements in graphics and presentations.</li>
<li><strong>Developers and testers</strong> — reverse strings to test text rendering in applications, check for palindromes, or validate that a system handles right-to-left and unusual character sequences correctly.</li>
<li><strong>Data processors</strong> — reverse the order of lines in a log file or dataset to see the most recent entries first, or to flip a sorted list.</li>
<li><strong>Writers</strong> — experiment with reversed sentence structures for stylistic effect in poetry or experimental prose.</li>
</ul>`,
  },
  {
    title: "Understanding the Three Reversal Modes",
    content: `<p><strong>Character reversal</strong> is the most complete transformation — every character including spaces and punctuation is mirrored. The result reads backwards at the character level, which is what most people think of as "reversed text".</p>
<p><strong>Word reversal</strong> keeps each word intact but flips their sequence. This is useful when you want to invert a sentence's structure without making individual words unreadable. <strong>Line reversal</strong> treats each line as an atomic unit and flips their order, which is ideal for reversing ordered lists, chronological logs, or numbered sequences without touching the content of each line.</p>`,
  },
];

export default function TextReverserPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TextReverser />
    </ToolContainer>
  );
}
