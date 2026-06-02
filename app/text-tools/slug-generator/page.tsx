import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SlugGenerator } from "@/components/tools/text-tools/SlugGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("slug-generator");
const tool = TOOLS.find((t) => t.slug === "slug-generator")!;

const howToSteps = [
  "Type or paste your <strong>title or phrase</strong> into the input field — the slug is generated instantly as you type.",
  "The <strong>URL-friendly slug</strong> appears below the input, with all invalid characters removed and spaces replaced.",
  "Choose between a <strong>hyphen ( - ) or underscore ( _ )</strong> as the word separator using the option buttons.",
  "Click <strong>Copy</strong> to copy the generated slug to your clipboard, ready to paste into your CMS, URL field, or code.",
];

const faqs = [
  {
    question: "What characters are kept in the slug?",
    answer:
      "Only <strong>lowercase letters (a–z)</strong>, <strong>digits (0–9)</strong>, and the chosen separator are kept. Accented and special characters are converted to their closest ASCII equivalents (e.g. é → e, ñ → n), and all remaining characters are removed.",
  },
  {
    question: "Which separator should I use?",
    answer:
      "Use <strong>hyphens</strong> for URLs and web addresses — they are the format recommended by major search engines and the W3C web standard. Use <strong>underscores</strong> for database field names, file names in certain systems, and identifiers in scripting languages that use snake_case.",
  },
  {
    question: "Are consecutive separators collapsed?",
    answer:
      "Yes — multiple spaces, hyphens, or underscores in a row are <strong>collapsed into a single separator</strong> in the output. This prevents ugly double-dashes or double-underscores appearing in the final slug.",
  },
  {
    question: "What is a URL slug?",
    answer:
      "A <strong>URL slug</strong> is the human-readable portion at the end of a web address that identifies a specific page. For example, in the URL '/blog/best-chocolate-cake-recipe', the slug is 'best-chocolate-cake-recipe'. Clean slugs improve readability and help search engines understand page content.",
  },
  {
    question: "Does slug format affect SEO?",
    answer:
      "Yes — <strong>descriptive, keyword-rich slugs</strong> that use hyphens to separate words are preferred. They signal page content to search engines, appear in search result URLs, and are more likely to be clicked by users. Avoid slugs with numbers-only, dates, or auto-generated IDs where a descriptive slug is possible.",
  },
  {
    question: "Can I generate slugs for non-English titles?",
    answer:
      "Yes — accented characters from Latin-based languages (French, Spanish, German, Portuguese, etc.) are automatically converted to their <strong>ASCII equivalents</strong> before generating the slug. Characters from non-Latin scripts are removed, so the slug remains URL-safe.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a URL Slug?",
    content: `<p>A <strong>URL slug</strong> is the final segment of a web address that identifies a specific page in a human-readable format. In the address 'example.com/blog/how-to-bake-bread', the slug is 'how-to-bake-bread'. It is typically derived from the page's title or main keyword and uses only lowercase letters, digits, and hyphens.</p>
<p>Slugs matter because they appear in <strong>browser address bars</strong>, shared links, search result URLs, and bookmarks. A well-crafted slug communicates the page topic at a glance and reinforces the page's keyword relevance to both readers and search engines.</p>`,
  },
  {
    title: "Why Slug Format Matters for SEO",
    content: `<p>Search engines use the words in a URL slug as one of many signals to understand page content. A slug like 'best-running-shoes-for-beginners' clearly communicates the topic, while a slug like 'post-4827' tells search engines nothing useful. <strong>Descriptive slugs with target keywords</strong> contribute to relevance and can improve click-through rates in search results because users can read them and know what to expect from the page before clicking.</p>
<p>Keep slugs <strong>short and focused</strong> — include the core keyword phrase and omit filler words (a, the, and, for) where they add no meaning. Shorter slugs are easier to share, easier to remember, and less likely to be truncated in search result displays.</p>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>Start from your <strong>page title</strong> and let the generator create a base slug, then review it for length and relevance. Remove any filler words manually if needed — for instance, 'The Best Guide to Home Brewing Coffee' can become 'home-brewing-coffee-guide' for a cleaner URL.</p>
<p>Avoid changing slugs on <strong>published pages</strong> unless absolutely necessary — changing a URL breaks existing links and requires setting up redirects. Create the best slug before publishing and keep it stable. For new content, use this tool as part of your publishing checklist to ensure every page has a clean, descriptive, SEO-friendly URL from day one.</p>`,
  },
];

export default function SlugGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <SlugGenerator />
    </ToolContainer>
  );
}
