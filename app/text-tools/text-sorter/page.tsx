import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TextSorter } from "@/components/tools/text-tools/TextSorter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("text-sorter");
const tool = TOOLS.find((t) => t.slug === "text-sorter")!;

const howToSteps = [
  "Paste your <strong>list of text</strong> into the input area — place each item on its own line.",
  "Choose a <strong>sort order</strong>: A→Z (ascending alphabetical), Z→A (descending alphabetical), Short→Long (by length), or Long→Short (by length).",
  "Toggle <strong>Ignore case</strong> to sort without regard to capitalisation, so 'apple' and 'Apple' are treated equally.",
  "Toggle <strong>Trim whitespace</strong> to strip leading and trailing spaces from each line before sorting, ensuring clean comparisons.",
  "Click <strong>Copy</strong> to copy the fully sorted result to your clipboard.",
];

const faqs = [
  {
    question: "Does sorting affect the original text?",
    answer:
      "The input is <strong>never modified</strong> — sorting only affects the output shown in the result area. You can freely change the sort order or options without losing your original input.",
  },
  {
    question: "How does alphabetical sorting handle numbers?",
    answer:
      "Numbers are sorted <strong>lexicographically</strong> (character by character) by default, so '10' appears before '2' because '1' comes before '2' in character order. For a purely numeric sort, consider zero-padding numbers (e.g. '02' instead of '2') before sorting.",
  },
  {
    question: "Can I sort a list from a spreadsheet?",
    answer:
      "Yes — copy a <strong>column from any spreadsheet</strong> and paste it into the tool. Each cell lands on its own line, ready to sort alphabetically or by length. This is faster than sorting within the spreadsheet when you only need a quick one-off sort.",
  },
  {
    question: "Does 'Sort by length' count spaces?",
    answer:
      "Length is measured on the <strong>raw line content</strong>, including spaces unless the Trim whitespace option is enabled. Enable trimming if you want length to reflect only the visible characters in each item.",
  },
  {
    question: "Can I sort lists with thousands of entries?",
    answer:
      "Yes — the tool handles <strong>large lists</strong> with thousands of lines efficiently. There is no enforced limit on the number of lines, though very large inputs may take a brief moment to process.",
  },
  {
    question: "Will sorting remove any entries from my list?",
    answer:
      "No — sorting only <strong>reorders lines</strong>. Every line in your input appears in the output. If you want to also remove duplicates, run the output through the Remove Duplicate Lines tool afterwards.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Common Use Cases for Text Sorting",
    content: `<ul>
<li><strong>Writers and editors</strong> — alphabetise reference lists, glossaries, bibliographies, or any index that needs to be in A→Z order for easy lookup.</li>
<li><strong>SEO professionals</strong> — sort keyword lists alphabetically before reviewing or importing them into a campaign, making it easier to spot duplicates and group related terms.</li>
<li><strong>Developers</strong> — sort configuration entries, import statements, or enumeration values to enforce a consistent code style.</li>
<li><strong>Data analysts</strong> — quickly sort exported text lists before processing, checking, or importing them into another tool.</li>
<li><strong>Teachers and students</strong> — sort vocabulary lists, name lists, or answer sets for organised study materials.</li>
</ul>`,
  },
  {
    title: "Alphabetical vs. Length Sorting",
    content: `<p><strong>Alphabetical sorting</strong> (A→Z or Z→A) is the most common use case — it organises lists into a familiar order that makes items easy to find by eye or by reference. It is the standard for indexes, glossaries, and reference lists.</p>
<p><strong>Length sorting</strong> (Short→Long or Long→Short) is useful for different reasons. Sorting by shortest-first is common in <strong>command-line tool outputs</strong> and ranked keyword lists where concise terms are preferred. Sorting by longest-first can help identify unusually long entries that may need to be shortened or reviewed, such as overly long titles or descriptions in a content audit.</p>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>For the most accurate <strong>alphabetical sort</strong>, enable both Ignore case and Trim whitespace. This prevents 'Apple' and 'apple' from being sorted separately and ensures invisible padding around entries doesn't affect their sort position. These two options together produce the clean, consistent results you'd expect from a well-organised index.</p>
<p>If your list contains entries with <strong>leading numbers or symbols</strong> (such as '1. First item'), the sort will place numbers before letters, which may not be the order you want. Strip the numbering first using a text editor, sort the list, then re-apply numbering if needed.</p>`,
  },
];

export default function TextSorterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TextSorter />
    </ToolContainer>
  );
}
