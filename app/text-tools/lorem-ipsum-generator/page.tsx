import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LoremIpsumGenerator } from "@/components/tools/text-tools/LoremIpsumGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("lorem-ipsum-generator");
const tool = TOOLS.find((t) => t.slug === "lorem-ipsum-generator")!;

const howToSteps = [
  "Choose whether to generate by <strong>Words</strong>, <strong>Sentences</strong>, or <strong>Paragraphs</strong> using the format selector.",
  "Enter the <strong>desired count</strong> in the number field — for example, 3 paragraphs or 50 words.",
  "Click <strong>Generate</strong> to produce a fresh block of placeholder text immediately.",
  "Click <strong>Copy</strong> to copy the entire output to your clipboard, ready to paste into your design or document.",
  "Click <strong>Generate again</strong> at any time to produce a new random variation with different word and sentence patterns.",
];

const faqs = [
  {
    question: "What is Lorem Ipsum?",
    answer:
      "<strong>Lorem Ipsum</strong> is scrambled Latin text derived from Cicero's philosophical work 'de Finibus Bonorum et Malorum', written around 45 BC. It has been used as standard <strong>placeholder text</strong> in typesetting and design since the 1500s because its natural-looking distribution of letters and varying word lengths closely mimics real readable text.",
  },
  {
    question: "How many paragraphs can I generate?",
    answer:
      "You can generate up to <strong>20 paragraphs</strong> at once. For longer placeholder content, generate in batches and paste them together. The word and sentence modes let you generate very specific amounts for tight layout requirements.",
  },
  {
    question: "Is the generated text the same every time?",
    answer:
      "No — each click on <strong>Generate</strong> produces a new random variation drawn from the Lorem Ipsum word corpus. This means repeated generation gives you unique blocks, useful when you need multiple distinct placeholder sections in a layout.",
  },
  {
    question: "Why use placeholder text instead of real content?",
    answer:
      "<strong>Placeholder text</strong> lets designers, developers, and content teams focus on layout, typography, and visual hierarchy without being distracted by the meaning of the content. Real text can inadvertently influence design decisions — Lorem Ipsum keeps the focus on the structure rather than the message.",
  },
  {
    question: "Can I use Lorem Ipsum in a live website?",
    answer:
      "Lorem Ipsum is intended for <strong>prototyping and design mockups only</strong>. It should always be replaced with real content before a site goes live. Publishing Lorem Ipsum on a production page may appear unprofessional and could confuse visitors.",
  },
  {
    question: "What is the difference between generating by words vs. sentences vs. paragraphs?",
    answer:
      "<strong>Words</strong> gives you a precise character-light block — useful for button labels, captions, or short copy fields. <strong>Sentences</strong> gives you complete grammatical units — good for testing single lines of text. <strong>Paragraphs</strong> gives you full multi-sentence blocks — ideal for testing body copy layout and line spacing.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Lorem Ipsum?",
    content: `<p><strong>Lorem Ipsum</strong> is the industry-standard placeholder text used by designers and publishers for centuries. The text originates from a Latin philosophical treatise and has been scrambled into its familiar form to produce passages that look convincingly like natural text without having a readable meaning in any modern language.</p>
<p>The reason it has endured so long is practical: its <strong>realistic character and word length distribution</strong> means it fills a layout almost exactly as real content would. Using meaningful text during design would draw attention to the words rather than the design itself, whereas Lorem Ipsum keeps the visual focus where it belongs.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul>
<li><strong>Web designers</strong> — fill wireframes and mockups with realistic text to demonstrate layout, typography, and spacing before copy is written.</li>
<li><strong>Print designers</strong> — populate brochures, magazine layouts, and book templates to check that text fits within allotted space.</li>
<li><strong>Developers</strong> — seed databases and UI components with realistic-looking text data during development and testing.</li>
<li><strong>Content strategists</strong> — use placeholder text in content briefs and page templates to communicate intended text length to copywriters.</li>
<li><strong>Presentation designers</strong> — fill slide templates with dummy body text to evaluate font choices and text-to-white-space ratios.</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>When testing a <strong>multi-column layout</strong>, generate several paragraphs and distribute them across columns to ensure the layout handles uneven text distribution gracefully. For <strong>responsive design testing</strong>, generate a longer block and preview it at different screen widths to confirm text wrapping behaves as intended.</p>
<p>If you need placeholder text for a specific word count target — for example, to test a 300-word article template — use the <strong>Words mode</strong> and enter the exact number. This is far more reliable than copying a paragraph and manually trimming it to length.</p>`,
  },
];

export default function LoremIpsumGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LoremIpsumGenerator />
    </ToolContainer>
  );
}
