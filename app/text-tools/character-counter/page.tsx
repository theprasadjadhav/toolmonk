import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TextCounter } from "@/components/tools/text-tools/TextCounter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("character-counter");
const tool = TOOLS.find((t) => t.slug === "character-counter")!;

const howToSteps = [
  "Paste or type your text into the <strong>input area</strong> — the counter starts working the moment you begin typing.",
  "The <strong>character count</strong> (with and without spaces) is highlighted prominently at the top of the results panel.",
  "Scroll down to see <strong>word count, line count, sentence count, paragraph count</strong>, and estimated reading time all at a glance.",
  "Use the <strong>copy button</strong> next to any individual stat to copy that value to your clipboard.",
];

const faqs = [
  {
    question: "Does the character count include spaces?",
    answer:
      "Yes — the <strong>Characters</strong> row counts every character including spaces, tabs, and newlines. The <strong>Chars (no spaces)</strong> row shows the count with all whitespace removed, which is useful when a platform's limit excludes spaces.",
  },
  {
    question: "Why do platforms have different character limits?",
    answer:
      "Different platforms count characters in different ways. Some count individual letters, others count encoding units. This tool counts characters in a way that matches the limits used by most social media platforms, SMS standards, and meta tag guidelines.",
  },
  {
    question: "Is there a maximum text length?",
    answer:
      "There is no enforced limit. Very large pastes (millions of characters) may slow down the browser tab slightly, but typical documents, articles, and social posts process instantly.",
  },
  {
    question: "How is reading time calculated?",
    answer:
      "<strong>Reading time</strong> is estimated using an average adult reading speed. The result is displayed in minutes and seconds, rounded to the nearest half-minute. It is a useful guide for blog posts, articles, and presentations.",
  },
  {
    question: "What counts as a sentence?",
    answer:
      "Sentences are counted by detecting <strong>sentence-ending punctuation</strong> — full stops, exclamation marks, and question marks. Abbreviations and decimals may slightly affect the count in edge cases.",
  },
  {
    question: "Can I use this to check meta descriptions and title tags?",
    answer:
      "Yes — paste your <strong>meta description</strong> or <strong>title tag</strong> text and check the character count. Search engines typically display title tags up to around 60 characters and meta descriptions up to around 155 characters.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Character Count Matters",
    content: `<p>Character limits govern almost every piece of content published online. <strong>Social media posts</strong>, <strong>SMS messages</strong>, <strong>meta titles</strong>, <strong>meta descriptions</strong>, and <strong>ad copy</strong> all have strict limits. Exceeding them results in truncation, rejected submissions, or poor display in search results.</p>
<p>Knowing your character count also helps with <strong>print design</strong> — brochures, business cards, and banners have fixed physical dimensions where text must fit precisely. Writers use character counts alongside word counts to meet publisher submission guidelines and estimate reading time accurately.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul>
<li><strong>SEO professionals</strong> — verify meta title and meta description lengths before publishing to avoid truncation in search results.</li>
<li><strong>Social media managers</strong> — count characters in posts, captions, and bios to stay within platform limits.</li>
<li><strong>Writers and editors</strong> — track word count and reading time to meet article length targets.</li>
<li><strong>Marketers</strong> — measure ad copy and email subject lines against character restrictions.</li>
<li><strong>Developers</strong> — validate database field lengths before inserting user-submitted content.</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>If you are writing for a specific platform, check its official character limit documentation — limits can change and may differ by post type (e.g. a regular post vs. a bio). Use the <strong>Chars (no spaces)</strong> stat when a platform specifies its limit excludes spaces.</p>
<p>For <strong>reading time estimates</strong>, the tool uses a conservative average speed. Technical or academic content is typically read more slowly — factor that in when estimating reading time for complex material. For precise paragraph counts, ensure your text uses consistent blank-line spacing between paragraphs.</p>`,
  },
];

export default function CharacterCounterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TextCounter highlight="chars" />
    </ToolContainer>
  );
}
