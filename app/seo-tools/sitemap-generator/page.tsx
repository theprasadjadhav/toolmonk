import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SitemapGenerator } from "@/components/tools/seo-tools/SitemapGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("sitemap-generator");
const tool = TOOLS.find((t) => t.slug === "sitemap-generator")!;

const howToSteps = [
  "Enter one <strong>URL per line</strong> in the input area — each URL must start with http:// or https:// to be valid.",
  "Set the <strong>change frequency</strong> to indicate how often the pages typically change (daily, weekly, monthly, etc.).",
  "Set a <strong>priority</strong> between 0.1 and 1.0, where 1.0 marks your most important pages such as the homepage.",
  "Toggle <strong>Include &lt;lastmod&gt;</strong> to append today's date to each URL entry, signalling when the page was last updated.",
  "Review the <strong>XML preview</strong>, then copy or download the sitemap.xml file.",
  "Submit the sitemap URL to <strong>Google Search Console</strong> and other webmaster tools so search engines can index your pages promptly.",
];

const faqs = [
  {
    question: "What is an XML sitemap?",
    answer:
      "An <strong>XML sitemap</strong> is a structured file that lists all the URLs on your website along with metadata such as last modified date, change frequency, and relative priority. It helps search engines discover and crawl your pages more efficiently — especially useful for large sites or pages without many internal links pointing to them.",
  },
  {
    question: "How many URLs can a sitemap contain?",
    answer:
      "A single sitemap file can contain up to <strong>50,000 URLs</strong> and must be no larger than 50 MB uncompressed. For larger sites, use a <strong>sitemap index file</strong> that references multiple individual sitemaps, allowing you to scale to millions of URLs.",
  },
  {
    question: "What should the priority values be?",
    answer:
      "Priority is <strong>relative</strong> — it only signals importance compared to other pages on your own site, not against other websites. The homepage and key landing pages typically receive 1.0 or 0.9. Regular articles might be 0.6–0.7. Less important pages or pagination 0.3–0.5.",
  },
  {
    question: "Does the change frequency affect crawl rate?",
    answer:
      "Search engines treat <strong>changefreq</strong> as a hint, not a directive. They may crawl more or less frequently than specified based on their own freshness signals. Still, setting it accurately reflects your publishing rhythm and provides a useful signal.",
  },
  {
    question: "Should I include every URL on my site?",
    answer:
      "Only include URLs that you want indexed and that return a <strong>200 OK</strong> status. Exclude redirects, 404 pages, URLs blocked by robots.txt, and pages with a noindex meta tag. Including low-quality or blocked URLs wastes crawl budget.",
  },
  {
    question: "What is a sitemap index file?",
    answer:
      "A <strong>sitemap index</strong> is a sitemap that points to other sitemaps rather than individual URLs. It allows websites with more than 50,000 pages to split their URL inventory across multiple sitemap files while still submitting a single URL to webmaster tools.",
  },
  {
    question: "How do I submit a sitemap to search engines?",
    answer:
      "The most reliable method is to submit through <strong>Google Search Console</strong> and <strong>Bing Webmaster Tools</strong> by entering the sitemap URL directly. You can also reference the sitemap in your robots.txt file using a Sitemap: directive so any crawler that reads the file can find it automatically.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is an XML Sitemap?",
    content: `<p>An <strong>XML sitemap</strong> is a file that provides a structured list of all the pages on your website along with optional metadata: the date each page was last modified, how frequently the content changes, and the relative priority of each page compared to others on your site.</p><p>Search engines use sitemaps to supplement their normal link-following crawl. Pages that are buried deep in your site structure or have few internal links pointing to them are more likely to be discovered and indexed when a sitemap is present.</p>`,
  },
  {
    title: "Why Sitemaps Matter for SEO",
    content: `<p>Even a well-structured website benefits from a sitemap. Search engines have a finite <strong>crawl budget</strong> for each domain — a limit on how many pages they will fetch in a given period. A sitemap helps ensure that budget is spent on your important content pages rather than on crawl paths that lead nowhere useful.</p><p>For new websites, sitemaps are especially valuable because they help search engines discover pages that have not yet accumulated any inbound links. Submitting your sitemap to <strong>Google Search Console</strong> can accelerate initial indexing significantly.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>New website launch:</strong> Submit a sitemap immediately after launch so search engines can discover all your pages without waiting for links to accumulate.</li><li><strong>Large e-commerce sites:</strong> Ensure product and category pages with few internal links are indexed promptly.</li><li><strong>Blog or news sites:</strong> Update the sitemap regularly so new articles are crawled and indexed quickly after publication.</li><li><strong>Site migrations:</strong> After restructuring URLs, submit an updated sitemap to guide crawlers to the new locations.</li></ul>`,
  },
];

export default function SitemapGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <SitemapGenerator />
    </ToolContainer>
  );
}
