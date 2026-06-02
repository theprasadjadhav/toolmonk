import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { MetaTagGenerator } from "@/components/tools/seo-tools/MetaTagGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("meta-tag-generator");
const tool = TOOLS.find((t) => t.slug === "meta-tag-generator")!;

const howToSteps = [
  "Enter your <strong>page title</strong> — aim for 50–60 characters so it displays fully in search results without being cut off.",
  "Write a <strong>meta description</strong> of 150–160 characters that summarises the page and encourages clicks from search results.",
  "Optionally add your <strong>canonical URL</strong>, site name, page type, Open Graph image URL, and Twitter handle to generate social sharing tags.",
  "Copy individual sections (<strong>Basic</strong>, <strong>Open Graph</strong>, <strong>Twitter Card</strong>) or click <strong>Copy All</strong> to grab all tags at once.",
  "Paste the generated tags inside the <strong>&lt;head&gt;</strong> section of your HTML or your CMS's head code field.",
];

const faqs = [
  {
    question: "Why does the title length matter?",
    answer:
      "Search engines typically display <strong>50–60 characters</strong> of a page title in results. Titles longer than 60 characters are truncated with an ellipsis, which can hurt click-through rates and cut off important keywords or brand names at the end.",
  },
  {
    question: "What are Open Graph tags?",
    answer:
      "<strong>Open Graph tags</strong> (og:*) control how your page appears when shared on Facebook, LinkedIn, and other social platforms. They define the title, description, image, and URL shown in link previews — allowing you to craft a specific social presentation separate from your main SEO title.",
  },
  {
    question: "What is a Twitter Card?",
    answer:
      "<strong>Twitter Card</strong> meta tags control how your URL appears when shared on Twitter/X. The tool automatically selects the 'summary_large_image' card type when you provide an Open Graph image URL, which displays a large image preview alongside the tweet.",
  },
  {
    question: "What is a canonical URL?",
    answer:
      "The <strong>canonical tag</strong> tells search engines which URL is the authoritative version of a page. It prevents duplicate content penalties when the same content is accessible at multiple URLs, such as with and without trailing slashes, or across HTTP and HTTPS.",
  },
  {
    question: "What is the meta robots tag?",
    answer:
      "The <strong>meta robots tag</strong> instructs search engine crawlers how to handle a page. Common values include <strong>index, follow</strong> (the default — crawl and index the page), <strong>noindex</strong> (do not include in search results), and <strong>nofollow</strong> (do not follow links on the page).",
  },
  {
    question: "Do meta keywords still matter for SEO?",
    answer:
      "No. Major search engines stopped using the <strong>meta keywords</strong> tag for ranking purposes many years ago. It is safe to omit entirely. Focus your effort on the title, description, and Open Graph tags, which still directly affect how your pages appear in search results and on social platforms.",
  },
  {
    question: "Should the Open Graph title match the page title?",
    answer:
      "Not necessarily. Your <strong>SEO title</strong> is optimised for search result click-throughs, while your <strong>Open Graph title</strong> can be written for social sharing appeal. Many publishers use a shorter, punchier social title while keeping a keyword-rich SEO title.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a Meta Tag?",
    content: `<p><strong>Meta tags</strong> are HTML elements placed inside the &lt;head&gt; section of a web page that provide structured information about the page to browsers and search engines. They are not visible to users on the page itself, but they play a critical role in how the page is described, indexed, and displayed across search results and social media platforms.</p><p>The most important meta tags for SEO are the <strong>title tag</strong>, the <strong>meta description</strong>, the <strong>canonical tag</strong>, and the <strong>robots directive</strong>. Social platforms also read <strong>Open Graph</strong> and <strong>Twitter Card</strong> tags to generate link previews.</p>`,
  },
  {
    title: "Why Meta Tags Matter for SEO",
    content: `<p>While meta tags alone do not guarantee high rankings, they are among the first things search engines read when discovering a page. A well-written <strong>title tag</strong> signals the topic of the page and encourages users to click from search results. A compelling <strong>meta description</strong> — though not a direct ranking factor — significantly influences <strong>click-through rate</strong>, which in turn affects how search engines perceive the page's relevance.</p><p>Canonical tags prevent <strong>duplicate content</strong> issues that can dilute your ranking signals across multiple similar URLs. Robots directives ensure that private, thin, or duplicate pages are excluded from search indexes.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>New page launch:</strong> Generate a complete set of tags before publishing any new page or blog post.</li><li><strong>Social media optimisation:</strong> Add Open Graph and Twitter Card tags so shared links display the right image and description on every platform.</li><li><strong>Duplicate content management:</strong> Use canonical tags to consolidate link equity when the same content is accessible at multiple URLs.</li><li><strong>CMS integration:</strong> Copy generated tags into your CMS's custom head code field without writing HTML by hand.</li></ul>`,
  },
];

export default function MetaTagGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <MetaTagGenerator />
    </ToolContainer>
  );
}
