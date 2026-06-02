import type { FAQItem } from "@/lib/tools/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolmonk.net";

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ToolMonk",
    url: BASE_URL,
    description:
      "Free online tools for developers, designers, students, and professionals.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/all-tools?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(faq.answer),
      },
    })),
  };
}

export function buildSoftwareAppSchema(tool: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.description,
    url: `${BASE_URL}${tool.path}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ToolMonk",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/icon.png`,
    },
    description: "Free online tools for developers, designers, students, and professionals.",
    sameAs: [],
  };
}

export function buildHowToSchema(toolTitle: string, steps: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use the ${toolTitle}`,
    step: steps.map((stepText, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: stepText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    })),
  };
}
