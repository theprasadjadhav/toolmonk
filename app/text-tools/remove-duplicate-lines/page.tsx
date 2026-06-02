import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RemoveDuplicateLines } from "@/components/tools/text-tools/RemoveDuplicateLines";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("remove-duplicate-lines");
const tool = TOOLS.find((t) => t.slug === "remove-duplicate-lines")!;

const howToSteps = [
  "Paste your text or list into the <strong>input area</strong> — one item or line of content per line.",
  "Toggle <strong>Case-insensitive</strong> if you want lines like 'Apple' and 'apple' to be treated as duplicates of each other.",
  "Toggle <strong>Trim whitespace</strong> to ignore leading and trailing spaces when comparing lines, so '  foo  ' and 'foo' are treated as the same.",
  "The <strong>unique lines</strong> and the <strong>count of removed duplicates</strong> are shown instantly in the results panel.",
  "Click <strong>Copy</strong> to copy the deduplicated result to your clipboard.",
];

const faqs = [
  {
    question: "Does the order of lines change?",
    answer:
      "No — the <strong>first occurrence</strong> of each line is kept in its original position. Only subsequent duplicates are removed. Your list order is preserved, just without the repeated entries.",
  },
  {
    question: "What counts as a duplicate?",
    answer:
      "Two lines are duplicates if their text is <strong>identical</strong> after applying the chosen options — case normalisation if enabled, and whitespace trimming if enabled. Without those options, comparison is exact and case-sensitive.",
  },
  {
    question: "Are blank lines removed?",
    answer:
      "Blank lines are deduplicated like any other line — only the <strong>first blank line</strong> is kept and subsequent blank lines are removed. If you want to remove all blank lines entirely, use the Remove Extra Spaces tool with the 'Remove blank lines' option.",
  },
  {
    question: "Can I use this on large lists?",
    answer:
      "Yes — the tool handles <strong>large lists</strong> with thousands of lines efficiently. There is no enforced size limit, though very large pastes may take a moment to process in the browser.",
  },
  {
    question: "What is the most common use case for this tool?",
    answer:
      "The most common uses are cleaning up <strong>email lists</strong>, removing repeated entries from exported data, deduplicating keyword lists for SEO campaigns, and tidying up code-generated lists that contain repeated values.",
  },
  {
    question: "Will it remove lines that are similar but not identical?",
    answer:
      "No — only <strong>exact duplicates</strong> are removed (subject to the case and whitespace options you choose). Lines that are similar but differ in even one character are kept as separate entries.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Removing Duplicates Matters",
    content: `<p>Duplicate lines in a dataset or list cause a range of problems. In <strong>email marketing</strong>, duplicate addresses lead to sending the same message multiple times to the same recipient, which damages sender reputation and subscriber trust. In <strong>SEO keyword lists</strong>, duplicates inflate the apparent size of the list and waste time during analysis. In <strong>data pipelines</strong>, duplicate records skew counts and aggregations.</p>
<p>Manually scanning a long list for duplicates is error-prone and time-consuming. Automated deduplication ensures <strong>every entry is unique</strong> in seconds, regardless of list length.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul>
<li><strong>Email marketers</strong> — deduplicate subscriber lists before sending campaigns to avoid repeat sends and bounce penalties.</li>
<li><strong>SEO professionals</strong> — clean keyword lists exported from multiple tools, removing terms that appear in more than one source.</li>
<li><strong>Data analysts</strong> — remove repeated rows from pasted spreadsheet data before importing into analysis tools.</li>
<li><strong>Developers</strong> — deduplicate entries in configuration files, log outputs, or generated lists.</li>
<li><strong>Writers and researchers</strong> — clean bibliographies or reference lists that accumulated duplicates during research.</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>Before deduplicating, consider whether <strong>case sensitivity matters</strong> for your data. Email addresses are case-insensitive, so enabling the case-insensitive option ensures 'User@Example.com' and 'user@example.com' are treated as the same address. Domain names and URLs are also case-insensitive and benefit from this option.</p>
<p>For data exported from spreadsheets, enable <strong>Trim whitespace</strong> as well — spreadsheet exports sometimes add invisible leading or trailing spaces to cell values, which would otherwise prevent identical entries from being detected as duplicates.</p>`,
  },
];

export default function RemoveDuplicateLinesPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RemoveDuplicateLines />
    </ToolContainer>
  );
}
