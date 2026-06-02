import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CaseConverter } from "@/components/tools/text-tools/CaseConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("case-converter");
const tool = TOOLS.find((t) => t.slug === "case-converter")!;

const howToSteps = [
  "Paste or type your text into the <strong>input area</strong> — any length of text is accepted.",
  "Click any <strong>case button</strong> — UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, or kebab-case — to convert instantly.",
  "The <strong>converted text</strong> appears immediately in the result area below the buttons.",
  "Click <strong>Copy</strong> to copy the converted result to your clipboard, ready to paste anywhere.",
];

const faqs = [
  {
    question: "What is camelCase?",
    answer:
      "<strong>camelCase</strong> removes spaces and capitalises the first letter of each word after the first, so 'hello world' becomes 'helloWorld'. It is the standard naming convention for variables and functions in many programming environments.",
  },
  {
    question: "What is PascalCase?",
    answer:
      "<strong>PascalCase</strong> is like camelCase but the very first letter is also capitalised, so 'hello world' becomes 'HelloWorld'. It is the standard convention for class names, component names, and type definitions in many languages.",
  },
  {
    question: "What is snake_case?",
    answer:
      "<strong>snake_case</strong> replaces spaces with underscores and lowercases every letter, producing 'hello_world'. It is widely used in configuration files, database column names, and scripting environments.",
  },
  {
    question: "What is kebab-case?",
    answer:
      "<strong>kebab-case</strong> replaces spaces with hyphens and lowercases everything, producing 'hello-world'. It is used for <strong>URL slugs</strong>, CSS class names, HTML data attributes, and file names in web projects.",
  },
  {
    question: "How does Sentence case work?",
    answer:
      "<strong>Sentence case</strong> lowercases the entire text, then capitalises the first letter after each sentence-ending punctuation mark (. ! ?). It produces natural-reading prose capitalisation for paragraphs and headings.",
  },
  {
    question: "Can I convert very long text?",
    answer:
      "Yes — there is no character limit enforced by the tool. You can paste entire articles, code files, or long documents and convert them in one click.",
  },
  {
    question: "Does the tool preserve punctuation?",
    answer:
      "Punctuation is preserved in all modes. Only the <strong>capitalisation</strong> or <strong>spacing format</strong> of alphabetic characters changes. Special characters, numbers, and symbols pass through unchanged.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Consistent Text Case Matters",
    content: `<p><strong>Text case consistency</strong> is critical in both writing and technical work. In written content, inconsistent capitalisation looks unprofessional and can confuse readers. In code and data, naming conventions like camelCase or snake_case are enforced by team style guides and linters — mixing them causes errors and makes code harder to maintain.</p>
<p>For <strong>SEO and web publishing</strong>, proper Title Case in headlines improves readability and click-through rates. Consistent slug formats (kebab-case) ensure URLs are clean and indexable. Taking a few seconds to standardise case across your content or codebase pays dividends in clarity and credibility.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul>
<li><strong>Writers and editors</strong> — quickly fix inconsistent capitalisation in headlines, subheadings, or pasted content from multiple sources.</li>
<li><strong>Content creators</strong> — convert blog post titles to proper Title Case before publishing.</li>
<li><strong>Developers</strong> — convert human-readable labels to camelCase or PascalCase variable names without typing them out manually.</li>
<li><strong>Database administrators</strong> — convert column descriptions to snake_case for schema definitions.</li>
<li><strong>Web designers</strong> — generate kebab-case CSS class names from plain English descriptions.</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p><strong>Title Case</strong> capitalises every word, which is correct for most English headlines. However, style guides like AP or Chicago recommend keeping short prepositions (of, in, to) lowercase — review the output manually for formal publications.</p>
<p>When converting to <strong>camelCase or snake_case</strong>, the tool splits on spaces and common punctuation. If your input uses unusual delimiters, clean it up first with the Remove Extra Spaces tool for the best output. For bulk conversions, paste all your items at once — the tool handles multi-line input by treating each line independently when converting to slug-friendly formats.</p>`,
  },
];

export default function CaseConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <CaseConverter />
    </ToolContainer>
  );
}
