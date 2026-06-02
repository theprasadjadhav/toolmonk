import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { MarkdownPreview } from "@/components/tools/code/MarkdownPreview";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("markdown-preview");

const tool = TOOLS.find((t) => t.slug === "markdown-preview")!;

const howToSteps = [
  "Type or paste your <strong>Markdown text</strong> into the left editor panel — the tool supports the full GitHub Flavored Markdown spec.",
  "The <strong>rendered preview</strong> updates in real time in the right panel as you type, so you can see the formatted output instantly.",
  "Click <strong>sample</strong> to load a comprehensive demonstration of all supported formatting features — useful if you want to see what is possible.",
  "Use <strong>clear</strong> to reset the editor and start fresh.",
  "Toggle <strong>fullscreen mode</strong> for a more focused writing and preview experience without distractions.",
];

const faqs = [
  {
    question: "What Markdown features are supported?",
    answer:
      "This tool supports <strong>GitHub Flavored Markdown (GFM)</strong>: headings (# through ######), bold, italic, strikethrough, inline code, fenced code blocks, links, images, ordered and unordered lists, <strong>task lists</strong> (- [ ] / - [x]), blockquotes, tables, and horizontal rules.",
  },
  {
    question: "What is GitHub Flavored Markdown?",
    answer:
      "<strong>GitHub Flavored Markdown (GFM)</strong> is an extended version of standard Markdown that adds features like <strong>tables, task lists, strikethrough text,</strong> and automatic URL linking. It is the format used in README files, issues, pull requests, and wikis on popular code hosting platforms.",
  },
  {
    question: "Is syntax highlighting supported in code blocks?",
    answer:
      "Code blocks are rendered in a <strong>monospace font with a distinct background</strong>, making them stand out clearly from surrounding text. Language-specific color highlighting within code blocks is not applied in the preview — focus is on structure and formatting rather than code coloring.",
  },
  {
    question: "Is my content sent to a server?",
    answer:
      "No. All <strong>Markdown rendering</strong> happens entirely in your browser. Your text never leaves your device — there is no upload or network request involved.",
  },
  {
    question: "How do I create a table in Markdown?",
    answer:
      "Use pipes and hyphens to define columns and rows. Start with a header row separated by a line of dashes: <strong>| Column 1 | Column 2 |</strong> followed by <strong>| --- | --- |</strong> and then data rows. Colons in the separator row control alignment: <strong>:---</strong> for left, <strong>:---:</strong> for center, and <strong>---:</strong> for right.",
  },
  {
    question: "How do I create a task list?",
    answer:
      "Use <strong>- [ ]</strong> for an unchecked item and <strong>- [x]</strong> for a checked item. Task lists are a GitHub Flavored Markdown extension and render as interactive checkboxes in supported environments. In this preview, they appear as styled list items.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is Markdown?",
    content: `<p><strong>Markdown</strong> is a lightweight text formatting language designed to be easy to read and write in plain text while converting cleanly to formatted documents. Instead of clicking toolbar buttons, you add simple punctuation marks to indicate formatting — for example, wrapping a word in asterisks makes it <strong>bold</strong>, and starting a line with a hash symbol makes it a heading.</p>
<p>Markdown was created to feel natural when written as plain text, so a file full of Markdown is still readable even without rendering. It is widely used for documentation, README files, blog posts, notes, and collaborative writing because it is portable, version-control-friendly, and supported by hundreds of tools and platforms.</p>`,
  },
  {
    title: "Markdown Quick Reference",
    content: `<ul>
<li><strong># Heading 1</strong>, <strong>## Heading 2</strong> — headings from level 1 to 6</li>
<li><strong>**bold**</strong> or <strong>__bold__</strong> — bold text</li>
<li><strong>*italic*</strong> or <strong>_italic_</strong> — italic text</li>
<li><strong>~~strikethrough~~</strong> — crossed-out text</li>
<li><strong><code>&#96;code&#96;</code></strong> — inline code</li>
<li><strong><code>&#96;&#96;&#96;language ... &#96;&#96;&#96;</code></strong> — fenced code block</li>
<li><strong>[Link text](https://example.com)</strong> — hyperlink</li>
<li><strong>![Alt text](image.png)</strong> — image</li>
<li><strong>- item</strong> or <strong>* item</strong> — unordered list</li>
<li><strong>1. item</strong> — ordered list</li>
<li><strong>- [ ] task</strong> — unchecked task list item</li>
<li><strong>> quote</strong> — blockquote</li>
<li><strong>---</strong> — horizontal rule</li>
</ul>`,
  },
];

export default function MarkdownPreviewPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <MarkdownPreview />
    </ToolContainer>
  );
}
