import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RemoveExtraSpaces } from "@/components/tools/text-tools/RemoveExtraSpaces";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("remove-extra-spaces");
const tool = TOOLS.find((t) => t.slug === "remove-extra-spaces")!;

const howToSteps = [
  "Paste your text into the <strong>input area</strong> — the tool accepts any amount of text including large documents.",
  "Choose which <strong>clean-up operations</strong> to apply: collapse multiple spaces, trim line edges, or remove blank lines — you can enable any combination.",
  "The <strong>cleaned result</strong> appears instantly alongside a character count comparison showing how much whitespace was removed.",
  "Click <strong>Copy</strong> to copy the cleaned text to your clipboard.",
];

const faqs = [
  {
    question: "What does 'Collapse spaces' do?",
    answer:
      "<strong>Collapse spaces</strong> replaces multiple consecutive spaces or tabs on the same line with a single space. This is useful for fixing text copied from PDFs, web pages, or documents where extra spaces have been introduced by the source formatting.",
  },
  {
    question: "What does 'Trim line edges' do?",
    answer:
      "<strong>Trim line edges</strong> removes leading and trailing spaces from each individual line, while leaving spaces between words on that line untouched. This is commonly needed when pasting content from spreadsheets or logs that add invisible padding to each row.",
  },
  {
    question: "What does 'Remove blank lines' do?",
    answer:
      "Any line that contains only <strong>whitespace or nothing at all</strong> is deleted from the output. This is applied after trimming if both options are enabled, ensuring that lines which only contained spaces are also removed.",
  },
  {
    question: "Does this change the actual words in my text?",
    answer:
      "No — only <strong>whitespace characters</strong> (spaces, tabs, and blank lines) are affected. Every word and punctuation mark in your original text is preserved exactly as written.",
  },
  {
    question: "Why does copied text often have extra spaces?",
    answer:
      "Extra spaces commonly appear when text is copied from <strong>PDFs</strong> (where column layouts add spaces between words), <strong>HTML pages</strong> (where the source code contains extra whitespace for readability), or <strong>spreadsheets</strong> (where cells may have padding). This tool cleans all of those cases.",
  },
  {
    question: "Can I use this before running other text tools?",
    answer:
      "Yes — removing extra spaces is often a useful <strong>first step</strong> before using other tools like the Word Counter, Keyword Density Checker, or Remove Duplicate Lines. Clean input produces more accurate results from any analysis tool.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Extra Spaces Cause Problems",
    content: `<p>Extra whitespace is one of the most common sources of data quality issues in text. When text is copied from <strong>PDF documents</strong>, the column-based layout often inserts spaces between characters or words that don't belong. When scraped from websites, HTML formatting can leave double spaces, non-breaking spaces, and tab characters scattered throughout the text.</p>
<p>These invisible characters cause problems in <strong>databases</strong> (where 'Smith ' and 'Smith' are treated as different values), in <strong>search and comparison operations</strong> (where an exact match fails due to a trailing space), and in <strong>published content</strong> (where double spaces between words look unprofessional).</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul>
<li><strong>Writers and editors</strong> — clean text pasted from multiple sources before finalising a document, removing inconsistent spacing introduced by different editors or copy-paste operations.</li>
<li><strong>Data analysts</strong> — normalise text fields before importing into a database or spreadsheet to prevent duplicate records caused by whitespace differences.</li>
<li><strong>Developers</strong> — clean user-submitted text or imported content before storing it or passing it to other processing steps.</li>
<li><strong>SEO professionals</strong> — tidy scraped content or exported reports before analysis, ensuring word counts and keyword densities are accurate.</li>
<li><strong>Customer support teams</strong> — clean text from tickets or forms that arrive with erratic formatting from mobile or web inputs.</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>For most use cases, enabling all three options together gives the cleanest result: <strong>collapse spaces</strong> handles multiple spaces within lines, <strong>trim line edges</strong> removes leading and trailing padding, and <strong>remove blank lines</strong> eliminates empty rows. Run all three in one pass for the most thorough clean.</p>
<p>If you are cleaning content for a platform that uses <strong>blank lines to separate paragraphs</strong> (such as Markdown or plain-text email), leave the 'Remove blank lines' option disabled so intentional paragraph breaks are preserved. Use only the collapse and trim options in that case.</p>`,
  },
];

export default function RemoveExtraSpacesPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RemoveExtraSpaces />
    </ToolContainer>
  );
}
