import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TextCounter } from "@/components/tools/text-tools/TextCounter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("word-counter");
const tool = TOOLS.find((t) => t.slug === "word-counter")!;

const howToSteps = [
  "Paste or type your text into the <strong>input area</strong> — counting starts instantly as you type or paste.",
  "The <strong>word count</strong> is highlighted prominently, alongside character count, sentence count, paragraph count, and more.",
  "Use the <strong>copy button</strong> next to any individual stat to copy that specific value to your clipboard.",
];

const faqs = [
  {
    question: "How are words counted?",
    answer:
      "Words are counted by splitting on <strong>whitespace</strong> — spaces, tabs, and newlines. Any contiguous run of non-whitespace characters counts as one word. This matches the counting method used by most professional word processors.",
  },
  {
    question: "What is reading time based on?",
    answer:
      "<strong>Reading time</strong> is estimated at an average reading speed suitable for standard prose content. The result is shown in minutes and seconds and is a useful planning guide for blog posts, articles, presentations, and video scripts.",
  },
  {
    question: "Are special characters counted as words?",
    answer:
      "Punctuation <strong>attached to a word</strong> (e.g. a trailing comma or period) is counted as part of that word. A standalone punctuation mark surrounded by spaces counts as its own word. This matches how most standard word counting tools behave.",
  },
  {
    question: "Can I paste from a word processor or document?",
    answer:
      "Yes — copy your text from any source and paste it directly. <strong>Formatting is ignored</strong>; only the raw text is analysed. This means bold, italic, font size, and other visual styling have no effect on the count.",
  },
  {
    question: "What counts as a paragraph?",
    answer:
      "<strong>Paragraphs</strong> are counted by detecting one or more consecutive blank lines between blocks of text. Single line breaks within a block are treated as part of the same paragraph. This matches standard prose formatting conventions.",
  },
  {
    question: "Is there a word count limit?",
    answer:
      "There is no enforced limit. The tool works well with <strong>short social media posts</strong>, standard blog articles, and longer documents such as essays or reports. Very large pastes (entire books) may slow the browser slightly.",
  },
  {
    question: "Can I use this to meet a word count requirement?",
    answer:
      "Yes — this is one of the most common use cases. Students, writers, and content creators use the word counter to <strong>verify they have met a minimum word count</strong> or stayed within a maximum before submitting or publishing their work.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Word Count Matters",
    content: `<p><strong>Word count</strong> is one of the most universally required measurements in writing. Academic submissions have strict minimum and maximum limits. Blog posts and articles are guided by <strong>recommended lengths</strong> based on topic depth and audience expectations — a product description needs far fewer words than an in-depth guide. Social media captions, email subject lines, and ad copy have platform-specific word or character constraints.</p>
<p>Beyond platform requirements, word count is also a useful <strong>self-editing signal</strong>. If a first draft is significantly over the target, it needs tightening. If it is significantly under, key points may be underdeveloped. Tracking word count throughout the writing process helps maintain appropriate depth and pacing.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul>
<li><strong>Students</strong> — verify essays, reports, and assignments meet the required word count before submission.</li>
<li><strong>Writers and authors</strong> — track daily writing progress, meet manuscript word count targets, and gauge chapter or section length.</li>
<li><strong>Bloggers and content creators</strong> — ensure articles are long enough for comprehensive coverage without padding them unnecessarily.</li>
<li><strong>SEO professionals</strong> — verify that page content meets recommended length guidelines for competitive topics.</li>
<li><strong>Marketers and copywriters</strong> — count words in ad copy, email subject lines, and social media posts to stay within platform limits.</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>For <strong>academic submissions</strong>, check your institution's specific counting rules — some count footnotes, headings, and captions; others exclude them. Paste only the relevant section of your document to get a count that matches what your institution will measure.</p>
<p>For <strong>SEO content</strong>, use the word count alongside the reading time estimate to gauge whether your article will hold a reader's attention for the intended duration. A 1,500-word article takes around 7–8 minutes to read — longer than most short-form content but appropriate for an in-depth guide. Adjust your content length to match the depth of the topic and the typical reading habits of your target audience.</p>`,
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
