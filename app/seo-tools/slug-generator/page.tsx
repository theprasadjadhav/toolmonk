import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SlugGenerator } from "@/components/tools/shared/text/SlugGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("slug-generator");
const tool = TOOLS.find((t) => t.slug === "slug-generator" && t.category === "seo-tools")!;

const howToSteps = [
  "Type or paste your <strong>title or phrase</strong> into the input field — any text works, including titles with special characters, accents, or spaces.",
  "The <strong>URL-friendly slug</strong> is generated instantly in the output field below as you type.",
  "Choose between <strong>hyphen ( - )</strong> or <strong>underscore ( _ )</strong> as the word separator depending on your intended use.",
  "Click <strong>Copy</strong> to copy the finished slug to your clipboard, ready to use in a URL or file name.",
];

const faqs = [
  {
    question: "What characters are kept in the slug?",
    answer:
      "Only <strong>lowercase letters</strong> (a–z), <strong>digits</strong> (0–9), and the chosen separator are kept. Accented characters are converted to their ASCII equivalents (e.g. é → e, ñ → n), and all other special characters are removed.",
  },
  {
    question: "Which separator should I use?",
    answer:
      "Use <strong>hyphens</strong> for URLs and web addresses — they are the recommended standard for readable, SEO-friendly URLs. Use <strong>underscores</strong> for database field names, file names, and code identifiers where hyphens are not permitted.",
  },
  {
    question: "Are consecutive separators collapsed?",
    answer:
      "Yes — multiple spaces, hyphens, or underscores in a row are automatically collapsed into a <strong>single separator</strong> in the output, keeping the slug clean and compact.",
  },
  {
    question: "Why should URLs use lowercase?",
    answer:
      "URLs are case-sensitive on most web servers. Using all-lowercase slugs prevents <strong>duplicate content</strong> issues where /My-Page and /my-page could be treated as two different URLs by search engines. Lowercase is also a widely adopted URL convention.",
  },
  {
    question: "Does slug choice affect SEO?",
    answer:
      "Yes — including your <strong>target keyword</strong> in the URL slug is a recognised on-page SEO signal. Keep slugs short, descriptive, and keyword-focused. Avoid adding dates, stop words, or extraneous numbers unless they are meaningful to the content.",
  },
  {
    question: "What happens to numbers in a slug?",
    answer:
      "Numbers are preserved exactly as entered. For example, 'Top 10 Tips' becomes <strong>top-10-tips</strong>. This is useful for listicles, year references, and product codes that need to appear in the URL.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a URL Slug?",
    content: `<p>A <strong>URL slug</strong> is the human-readable part of a web address that identifies a specific page. It is the portion of the URL that comes after the domain name — for example, in <em>example.com/blog/seo-tips-for-beginners</em>, the slug is <strong>seo-tips-for-beginners</strong>.</p><p>A good slug is short, descriptive, and uses only lowercase letters, digits, and hyphens. It should give both users and search engines a clear idea of what the page is about before they even visit it.</p>`,
  },
  {
    title: "Why URL Slugs Matter for SEO",
    content: `<p>Including your <strong>target keyword</strong> in a URL slug is a well-established on-page SEO practice. Search engines read the URL as a relevance signal, and users see the URL in search results before clicking — a descriptive slug builds trust and improves <strong>click-through rates</strong>.</p><p>Short, keyword-focused slugs also age better than slugs containing dates or categories that may change over time. Keeping slugs stable avoids broken links and preserves the <strong>link equity</strong> accumulated by inbound links over time.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Blog posts:</strong> Convert article titles into clean, keyword-rich URL slugs before publishing.</li><li><strong>Product pages:</strong> Generate consistent slugs for product names that may contain symbols, special characters, or brand marks.</li><li><strong>CMS entries:</strong> Many content management systems auto-generate slugs, but manual control lets you keep them concise and targeted.</li><li><strong>File naming:</strong> Use underscore-separated slugs for downloadable files, images, and database column names.</li></ul>`,
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
