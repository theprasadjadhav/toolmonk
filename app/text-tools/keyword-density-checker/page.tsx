import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { KeywordDensityChecker } from "@/components/tools/shared/text/KeywordDensityChecker";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("keyword-density-checker");
const tool = TOOLS.find((t) => t.slug === "keyword-density-checker" && t.category === "text-tools")!;

const howToSteps = [
  "Paste your <strong>full page content or article</strong> into the text area — include all body text you want to analyse.",
  "Set the <strong>minimum word length</strong> to filter out very short words that are unlikely to be meaningful keywords.",
  "Toggle <strong>Ignore common words</strong> to exclude articles, prepositions, and other stop words from the results table.",
  "Review the <strong>keyword table</strong> sorted by frequency — the density percentage shows how often each word appears relative to the total word count.",
  "Adjust your content so your <strong>target keywords</strong> appear at a natural, appropriate density — typically 1–3% for primary terms.",
];

const faqs = [
  {
    question: "What is keyword density?",
    answer:
      "<strong>Keyword density</strong> is the percentage of times a specific word appears in a piece of content relative to the total word count. It is calculated as: (occurrences ÷ total words) × 100. A density of 2% means the word appears twice for every 100 words.",
  },
  {
    question: "What is the ideal keyword density?",
    answer:
      "There is no single ideal number. A density of <strong>1–3%</strong> for a primary keyword is generally considered natural and effective. Over-optimising — known as <strong>keyword stuffing</strong> — can make content feel unnatural and may lead to reduced search visibility.",
  },
  {
    question: "What are stop words?",
    answer:
      "<strong>Stop words</strong> are extremely common words (the, a, is, for, and, etc.) that carry little meaning for content analysis. Filtering them out reveals the substantive keywords that define your content's topic, giving a more accurate picture of keyword usage.",
  },
  {
    question: "Does higher density mean better ranking?",
    answer:
      "Not necessarily. Modern search engines use <strong>semantic understanding</strong> to evaluate content, not simple keyword counts. Content that naturally covers a topic in depth — using related terms and answering user questions — tends to rank better than text that repeats one keyword excessively.",
  },
  {
    question: "Should I analyse the entire page or just the body text?",
    answer:
      "For the most accurate results, analyse only the <strong>body text</strong> — the main article or page copy. Including navigation menus, footers, or boilerplate text skews the results because those elements are not part of the content search engines evaluate for relevance.",
  },
  {
    question: "What is a good number of keywords to target?",
    answer:
      "Most well-optimised pages focus on <strong>one primary keyword</strong> and 3–5 related secondary keywords. Using too many distinct keywords dilutes your content focus. Ensure your primary keyword appears naturally in the title, first paragraph, and at least one heading.",
  },
  {
    question: "Can I use this tool for multi-word phrases?",
    answer:
      "This tool analyses <strong>individual words</strong> (unigrams). For multi-word phrases (bigrams or trigrams), look for patterns in the results — if two adjacent words both appear at high density, that phrase is likely prominent in your content.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Keyword Density?",
    content: `<p><strong>Keyword density</strong> measures how frequently a specific word or phrase appears in a body of text, expressed as a percentage of the total word count. It has long been used as a basic signal for understanding the primary focus of a piece of content.</p>
<p>For example, if your article contains 500 words and a target keyword appears 10 times, its density is 2%. While density alone does not determine content quality or search performance, it serves as a useful <strong>diagnostic tool</strong> — helping you identify whether a topic is over-represented (keyword stuffed) or under-represented in your content.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul>
<li><strong>SEO writers</strong> — verify that primary and secondary keywords appear naturally and at appropriate frequency throughout an article.</li>
<li><strong>Content editors</strong> — audit existing pages for over-optimisation before a site migration or content refresh.</li>
<li><strong>Marketers</strong> — ensure product page copy emphasises the right terms without sounding forced or repetitive.</li>
<li><strong>Researchers</strong> — identify the most prominent topics and themes in a document quickly.</li>
<li><strong>Students and academics</strong> — check that essays maintain a consistent focus on the assigned topic throughout the text.</li>
</ul>`,
  },
  {
    title: "Why Keyword Balance Matters",
    content: `<p>The goal of keyword analysis is <strong>balance</strong>. Content that never mentions its subject keyword misses an opportunity to signal relevance. Content that repeats the same word in every sentence feels unnatural and off-putting to real readers — which ultimately harms both engagement and credibility.</p>
<p>The best-performing content uses a <strong>primary keyword naturally</strong> in key positions (title, introduction, headings, conclusion) and supports it with <strong>related terms and synonyms</strong> throughout the body. This approach satisfies both human readers and automated content evaluation systems without resorting to mechanical repetition.</p>`,
  },
];

export default function KeywordDensityCheckerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <KeywordDensityChecker />
    </ToolContainer>
  );
}
