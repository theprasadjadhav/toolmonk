import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RobotsTxtGenerator } from "@/components/tools/seo-tools/RobotsTxtGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("robots-txt-generator");
const tool = TOOLS.find((t) => t.slug === "robots-txt-generator")!;

const howToSteps = [
  "The default rule block targets <strong>all robots (*)</strong> — adjust the <strong>Disallow</strong> and <strong>Allow</strong> paths to control which sections of your site crawlers can access.",
  "Click <strong>+ add rule block</strong> to add per-crawler rules, such as Googlebot-specific overrides that differ from the global defaults.",
  "Optionally enter your <strong>sitemap URL</strong> at the bottom so crawlers can discover all your pages from a single location.",
  "Review the <strong>live preview</strong> of the generated file, then copy or download it as <strong>robots.txt</strong>.",
  "Place the file at the <strong>root of your domain</strong> — it must be accessible at https://yourdomain.com/robots.txt to be effective.",
];

const faqs = [
  {
    question: "What is robots.txt?",
    answer:
      "<strong>robots.txt</strong> is a plain-text file at the root of a website that tells search engine crawlers which pages or directories they may or may not request. It is part of the <strong>Robots Exclusion Protocol</strong> — a standard followed by all major search engines.",
  },
  {
    question: "Does Disallow block indexing?",
    answer:
      "No — <strong>Disallow</strong> prevents crawlers from fetching those URLs, but a page can still appear in search results if other sites link to it. To prevent indexing entirely, use a <strong>noindex</strong> meta tag or X-Robots-Tag response header on the page itself.",
  },
  {
    question: "What does User-agent: * mean?",
    answer:
      "The asterisk (<strong>*</strong>) is a wildcard that applies the rule block to all crawlers. You can add additional rule blocks with specific crawler names (e.g. Googlebot) to create overrides that apply only to that particular bot while the wildcard block handles everyone else.",
  },
  {
    question: "What is Crawl-delay?",
    answer:
      "<strong>Crawl-delay</strong> tells the crawler to wait N seconds between successive requests to avoid overloading your server. Note that Googlebot ignores this directive; to control Googlebot's crawl rate, use the settings in Google Search Console instead.",
  },
  {
    question: "Can robots.txt block all crawlers from the entire site?",
    answer:
      "Yes — adding <strong>Disallow: /</strong> under User-agent: * blocks all crawlers from every page. This is useful for staging or development sites that should not be indexed. Be cautious: this will prevent your entire site from appearing in search results.",
  },
  {
    question: "Should I include my sitemap in robots.txt?",
    answer:
      "Yes — including a <strong>Sitemap:</strong> directive is best practice. It points crawlers directly to your XML sitemap so they can discover all your pages efficiently, without having to crawl link by link from your homepage.",
  },
  {
    question: "Does robots.txt protect sensitive files?",
    answer:
      "No — robots.txt is a <strong>public file</strong> that anyone can read, and it is not a security mechanism. It only works with cooperating crawlers. To truly protect sensitive content, use proper server-side authentication, not robots.txt directives.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is robots.txt?",
    content: `<p>A <strong>robots.txt</strong> file is a plain-text document placed at the root of your website that communicates with search engine crawlers. It tells them which sections of your site they are permitted to access and which they should skip. This file is read before any page is crawled, making it one of the first things a search engine encounters when it visits your domain.</p><p>The file follows the <strong>Robots Exclusion Protocol</strong> — a widely respected standard supported by all major search engines including Google, Bing, and others.</p>`,
  },
  {
    title: "Why robots.txt Matters for SEO",
    content: `<p>A properly configured robots.txt helps search engines spend their <strong>crawl budget</strong> on your most important pages. Every website has a finite number of pages that a crawler will visit per day. By blocking low-value pages — such as admin areas, duplicate parameter URLs, or staging paths — you direct that budget toward your high-value content.</p><p>It also prevents private or internal pages from being accidentally indexed, and including your sitemap URL makes it easy for crawlers to discover your full page inventory in one step.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Block admin areas:</strong> Disallow /admin/, /wp-admin/, or /dashboard/ to prevent crawlers from accessing private back-end pages.</li><li><strong>Prevent duplicate content:</strong> Block URL parameter variations (e.g. ?sort=, ?ref=) that produce identical pages at different URLs.</li><li><strong>Protect staging environments:</strong> Use Disallow: / on development or staging domains so they are never indexed.</li><li><strong>Sitemap discovery:</strong> Add a Sitemap: directive so all crawlers can find your XML sitemap without needing it submitted manually.</li></ul>`,
  },
];

export default function RobotsTxtGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RobotsTxtGenerator />
    </ToolContainer>
  );
}
