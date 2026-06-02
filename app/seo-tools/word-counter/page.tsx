import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TextCounter } from "@/components/tools/shared/text/TextCounter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("word-counter");
const tool = TOOLS.find((t) => t.slug === "word-counter" && t.category === "seo-tools")!;

const howToSteps = [
  "Paste or type your <strong>text</strong> into the input area — any content works, from a single sentence to a full article.",
  "<strong>Word count</strong> is highlighted instantly alongside characters, sentences, paragraphs, and estimated reading time — all updating as you type.",
  "Use the <strong>copy button</strong> next to any statistic to copy that individual value to your clipboard.",
];

const faqs = [
  {
    question: "How are words counted?",
    answer:
      "Words are counted by splitting on <strong>whitespace</strong> — spaces, tabs, and newlines. Any contiguous run of non-whitespace characters counts as one word, including hyphenated words and contractions.",
  },
  {
    question: "What is reading time based on?",
    answer:
      "Reading time is estimated using an average reading speed of <strong>200 words per minute</strong> — a conservative estimate suitable for dense or technical content. Lighter copy is typically read faster.",
  },
  {
    question: "Are special characters counted as words?",
    answer:
      "Punctuation <strong>attached to a word</strong> (such as a trailing period or comma) is counted as part of that word. A standalone punctuation mark surrounded by spaces counts as a separate word.",
  },
  {
    question: "Can I paste from a document or rich text editor?",
    answer:
      "Yes — copy your text from any source and paste it directly. <strong>Formatting is stripped</strong>; only the raw text content is analysed, so heading styles, bold, and links do not affect the counts.",
  },
  {
    question: "Why does word count matter for SEO?",
    answer:
      "While there is no minimum word count that guarantees rankings, <strong>content length</strong> correlates with search performance for many topics. Longer, comprehensive content tends to cover more related terms and answer more user questions. Aim for a length that fully addresses the topic rather than hitting an arbitrary number.",
  },
  {
    question: "What is a good word count for a blog post?",
    answer:
      "For informational blog posts, <strong>1,500–2,500 words</strong> is a common target for competitive topics. Short-form posts of 500–800 words work for news, updates, or narrow topics. In-depth guides and pillar pages often exceed 3,000 words. The right length depends on what competitor pages covering the same topic typically provide.",
  },
  {
    question: "How is the character count calculated?",
    answer:
      "The <strong>character count with spaces</strong> includes every character including spaces. The <strong>character count without spaces</strong> counts only non-space characters. Both counts treat standard letters, digits, and punctuation as individual characters.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Word Count Matters for SEO",
    content: `<p>Content length is one of many factors that influence how well a page performs in search results. While there is no magic word count, <strong>comprehensive content</strong> that thoroughly covers a topic tends to rank better than thin pages that only skim the surface.</p><p>Longer content typically includes more related terms, answers more questions, and earns more backlinks — all of which contribute to <strong>topical authority</strong>. Use word count as a guide to gauge whether your content is as thorough as top-ranking competitors on the same topic.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Blog writing:</strong> Check article length against target word counts before publishing.</li><li><strong>Meta descriptions and titles:</strong> Use the character count to ensure meta text fits within display limits.</li><li><strong>Academic writing:</strong> Verify that essays and reports meet minimum or maximum word requirements.</li><li><strong>Social media:</strong> Check character counts for platforms with strict posting limits.</li><li><strong>Content audits:</strong> Identify thin pages on your site that may benefit from expansion.</li></ul>`,
  },
];

export default function WordCounterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TextCounter highlight="words" />
    </ToolContainer>
  );
}
