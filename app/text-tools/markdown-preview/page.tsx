import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { MarkdownPreview } from "@/components/tools/shared/text/MarkdownPreview";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("markdown-preview");
const tool = TOOLS.find((t) => t.slug === "markdown-preview" && t.category === "text-tools")!;

const howToSteps = [
  "Type or paste your <strong>Markdown text</strong> into the left editor panel — the preview updates in real time as you type.",
  "The <strong>rendered preview</strong> in the right panel shows exactly how your formatted output will appear.",
  "Click <strong>Sample</strong> to load a demonstration that showcases all supported formatting features including tables, task lists, and code blocks.",
  "Use <strong>Clear</strong> to reset the editor and start fresh with a blank canvas.",
  "Toggle <strong>fullscreen mode</strong> for a distraction-free writing and preview experience on larger documents.",
];

const faqs = [
  {
    question: "What Markdown features are supported?",
    answer:
      "This tool supports <strong>GitHub Flavored Markdown (GFM)</strong>: headings (H1–H6), bold, italic, strikethrough, inline code, fenced code blocks, links, images, ordered and unordered lists, task lists (- [ ] / - [x]), blockquotes, tables, and horizontal rules.",
  },
  {
    question: "What is GitHub Flavored Markdown?",
    answer:
      "<strong>GitHub Flavored Markdown (GFM)</strong> is a widely adopted Markdown specification that extends the standard format with practical features like tables, task lists, strikethrough text, and automatic URL linking. It is used in platform documentation, README files, issue trackers, wikis, and many content management systems.",
  },
  {
    question: "Is syntax highlighting supported in code blocks?",
    answer:
      "Code blocks are rendered in a <strong>monospace font</strong> with a distinct background that makes them visually stand out from prose. Language-specific colour highlighting is not applied — the focus is on accurate structural rendering rather than code colouring.",
  },
  {
    question: "Is my content sent to a server?",
    answer:
      "No — all rendering is done <strong>entirely in your browser</strong>. Your Markdown content never leaves your device. This makes the tool safe to use with sensitive or confidential documents.",
  },
  {
    question: "Can I use this to preview README files?",
    answer:
      "Yes — paste the contents of any <strong>README.md</strong> or documentation file directly into the editor. The preview will render it exactly as it would appear on a platform that supports GitHub Flavored Markdown.",
  },
  {
    question: "What is the difference between Markdown and HTML?",
    answer:
      "<strong>Markdown</strong> is a lightweight plain-text format designed to be readable as-is and convertible to HTML. It uses simple symbols like asterisks for bold and hashes for headings instead of HTML tags. The Markdown you write here is converted to HTML for the preview, but you write it in the simpler Markdown format.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Markdown?",
    content: `<p><strong>Markdown</strong> is a lightweight plain-text formatting language that lets you write structured documents using simple symbols. A single hash (#) creates a heading, double asterisks (**) make text bold, and a hyphen at the start of a line creates a list item. These conventions are easy to type and remain readable even without being rendered.</p>
<p>Markdown has become the <strong>standard format for documentation</strong>, technical writing, and content creation across the web. It is used in platform README files, wikis, note-taking apps, forums, static site generators, and countless other contexts where structured text is needed without the complexity of a full word processor.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul>
<li><strong>Developers</strong> — write and preview README files and documentation before committing them to a repository.</li>
<li><strong>Technical writers</strong> — draft structured articles, guides, and changelogs in Markdown and preview the output before publishing.</li>
<li><strong>Bloggers and content creators</strong> — compose posts in Markdown for static site generators or content management systems that accept Markdown input.</li>
<li><strong>Students and researchers</strong> — write academic notes with clean formatting that converts cleanly to HTML or PDF.</li>
<li><strong>Project managers</strong> — create formatted task lists and project notes using Markdown's native support for checklists and tables.</li>
</ul>`,
  },
  {
    title: "Markdown Quick Reference",
    content: `<p>Here are the most commonly used Markdown syntax patterns:</p>
<ul>
<li><strong>Headings</strong> — use # for H1, ## for H2, ### for H3, and so on up to H6.</li>
<li><strong>Bold</strong> — wrap text in double asterisks: **bold text**</li>
<li><strong>Italic</strong> — wrap text in single asterisks: *italic text*</li>
<li><strong>Links</strong> — use [link text](URL) format.</li>
<li><strong>Lists</strong> — start lines with - or * for unordered lists; use 1. 2. 3. for ordered lists.</li>
<li><strong>Code</strong> — wrap inline code in backticks; use triple backticks on their own lines for code blocks.</li>
<li><strong>Tables</strong> — use | to separate columns and --- to define the header row separator.</li>
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
