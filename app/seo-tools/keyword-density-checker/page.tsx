import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { KeywordDensityChecker } from "@/components/tools/shared/text/KeywordDensityChecker";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("keyword-density-checker");
const tool = TOOLS.find((t) => t.slug === "keyword-density-checker" && t.category === "seo-tools")!;

const howToSteps = [
  "Paste your <strong>page content or article</strong> into the text area — the full body copy works best for accurate analysis.",
  "Set the <strong>minimum word length</strong> to filter out very short words that add noise to the analysis.",
  "Toggle <strong>Ignore common words</strong> to exclude articles, prepositions, and other stop words that carry little SEO value.",
  "Review the <strong>keyword frequency table</strong> sorted by occurrence count — higher density means that keyword appears more often relative to total words.",
  "Adjust your content so that your <strong>target keywords</strong> appear at an appropriate density; a range of 1–3% is considered natural for most topics.",
];

const faqs = [
  {
    question: "What is keyword density?",
    answer:
      "<strong>Keyword density</strong> is the percentage of times a specific word appears in a piece of content relative to the total word count. It is calculated as: (occurrences ÷ total words) × 100. For example, if a 500-word article uses a keyword 10 times, its density is 2%.",
  },
  {
    question: "What is the ideal keyword density?",
    answer:
      "There is no single ideal figure. A density of <strong>1–3%</strong> for a primary keyword is generally considered natural and readable. Over-optimising — repeating a keyword far more than its context warrants — is known as <strong>keyword stuffing</strong> and can trigger search engine penalties.",
  },
  {
    question: "What are stop words?",
    answer:
      "<strong>Stop words</strong> are very common words (the, a, is, for, etc.) that carry little semantic value for SEO analysis. Filtering them out gives a clearer picture of your content's actual keyword usage and the topics your writing genuinely covers.",
  },
  {
    question: "Does higher density mean better ranking?",
    answer:
      "Not necessarily. Modern search engines use <strong>semantic understanding</strong> to evaluate content quality. Natural language that covers a topic comprehensively tends to rank better than content artificially padded with repeated keywords.",
  },
  {
    question: "Should I analyse the full page or just the body text?",
    answer:
      "For the most accurate keyword density reading, paste only the <strong>main body text</strong> of the page — excluding navigation, headers, footers, and sidebar content. Including boilerplate text inflates word count and dilutes the density figures.",
  },
  {
    question: "What is a long-tail keyword?",
    answer:
      "A <strong>long-tail keyword</strong> is a multi-word phrase that is more specific than a broad head term. For example, 'best running shoes for flat feet' is long-tail compared to 'running shoes'. Long-tail phrases typically have lower search volume but higher intent and lower competition.",
  },
  {
    question: "Can keyword density analysis help with content gaps?",
    answer:
      "Yes — by checking which keywords appear frequently and which expected terms are missing, you can identify <strong>content gaps</strong>. If your article about a topic never mentions closely related terms, adding them naturally improves topical coverage.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Keyword Density?",
    content: `<p><strong>Keyword density</strong> measures how often a particular word or phrase appears in a piece of text as a percentage of the total word count. It is one of the oldest metrics in on-page SEO and is used to gauge whether a page is sufficiently focused on its target topic — or whether it has over-optimised to the point of appearing spammy.</p><p>The formula is simple: divide the number of times a keyword appears by the total word count, then multiply by 100. A 1,000-word article that uses a keyword 15 times has a density of 1.5%.</p>`,
  },
  {
    title: "Why Keyword Density Matters for SEO",
    content: `<p>While search engines have moved well beyond simple keyword counting, <strong>keyword presence</strong> in your content is still a foundational signal. A page that never mentions its target topic will not rank for it. Keyword density analysis helps you confirm that your primary and secondary terms appear frequently enough to establish topical relevance without crossing into over-optimisation.</p><p>The sweet spot for most content is a <strong>natural, readable distribution</strong> — typically 1–3% for a primary keyword — supported by related terms and synonyms that signal broad coverage of the topic.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>On-page SEO audits:</strong> Check whether existing pages adequately cover their target keywords before a site migration or content refresh.</li><li><strong>Content writing:</strong> Use density data as a guide while writing to maintain a natural balance of key terms.</li><li><strong>Competitive analysis:</strong> Analyse top-ranking competitor pages to understand how they distribute keywords.</li><li><strong>Keyword stuffing detection:</strong> Identify pages with abnormally high density figures that may be at risk of a search engine penalty.</li></ul>`,
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
