import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TextCounter } from "@/components/tools/text-tools/TextCounter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("line-counter");
const tool = TOOLS.find((t) => t.slug === "line-counter")!;

const howToSteps = [
  "Paste or type your text into the <strong>input area</strong> — any file content, list, or document works.",
  "The <strong>total line count</strong> is highlighted prominently at the top of the results panel, updating in real time.",
  "<strong>Empty line count</strong> and <strong>unique line count</strong> are also displayed so you can spot blank lines and duplicates at a glance.",
  "Use the <strong>copy button</strong> next to any individual value to copy that stat to your clipboard.",
];

const faqs = [
  {
    question: "What counts as a line?",
    answer:
      "Each <strong>newline character</strong> starts a new line. A document with no newlines contains exactly one line. An empty document shows one empty line. This matches the behaviour of most text editors and operating systems.",
  },
  {
    question: "What is an empty line?",
    answer:
      "A line is counted as <strong>empty</strong> if it contains only whitespace (spaces or tabs) or nothing at all. Empty lines are common in code files between function blocks, and in prose documents between paragraphs.",
  },
  {
    question: "How are unique lines counted?",
    answer:
      "<strong>Unique lines</strong> are counted after trimming leading and trailing whitespace from each line. Two lines that differ only in surrounding spaces are treated as identical, so the unique count reflects truly distinct content lines.",
  },
  {
    question: "Is this useful for code files?",
    answer:
      "Yes — paste any source file to quickly see <strong>total lines of code</strong>, the number of blank lines between blocks, and how many lines are repeated (which can indicate copy-paste duplication or redundant entries).",
  },
  {
    question: "Does it work with Windows-style line endings?",
    answer:
      "Yes — both Unix-style line endings (LF) and Windows-style line endings (CRLF) are handled correctly. The carriage return character is stripped before counting so you get accurate results regardless of the source file format.",
  },
  {
    question: "Can I use this to count rows in a CSV or spreadsheet export?",
    answer:
      "Yes — each row in a <strong>CSV file</strong> or spreadsheet export occupies its own line. Paste the content and the total line count gives you the row count, including any header row.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Common Use Cases for Line Counting",
    content: `<ul>
<li><strong>Developers</strong> — count lines of code in a file or paste to track size and complexity, or verify that a generated output contains the expected number of entries.</li>
<li><strong>Data analysts</strong> — count rows in a pasted CSV or plain-text dataset before importing it into a spreadsheet or database.</li>
<li><strong>Writers and editors</strong> — count lines in poetry, scripts, or formatted lists where line count matters as much as word count.</li>
<li><strong>System administrators</strong> — count entries in a log snippet or configuration list to verify completeness.</li>
<li><strong>Students</strong> — check that an assignment formatted with a specific number of lines meets submission requirements.</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>For the most accurate count, paste your text directly without adding or removing newlines manually. If you are counting lines in a code file, <strong>copy the file contents in full</strong> — including any blank lines between functions or sections, as those are intentional and should be counted.</p>
<p>If you need to <strong>remove duplicate lines</strong> after counting, use the Remove Duplicate Lines tool to clean your list. If your count is higher than expected due to trailing blank lines at the end of a pasted block, use the Remove Extra Spaces tool with the blank line removal option to tidy the input first.</p>`,
  },
];

export default function LineCounterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TextCounter highlight="lines" />
    </ToolContainer>
  );
}
