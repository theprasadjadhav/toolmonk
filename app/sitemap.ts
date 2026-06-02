import type { MetadataRoute } from "next";
import { TOOLS, CATEGORIES, SUBCATEGORIES } from "@/lib/tools/registry";
import { ARTICLES } from "@/lib/blog/articles";
import { COMPARISONS } from "@/lib/comparisons/data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolmonk.net";

// Static pages that don't change with content updates
const STATIC_PAGES = [
  { path: "",          priority: 1.0,  changeFrequency: "weekly"  as const },
  { path: "/all-tools", priority: 0.9, changeFrequency: "weekly"  as const },
  { path: "/blog",      priority: 0.8, changeFrequency: "weekly"  as const },
  { path: "/about",     priority: 0.4, changeFrequency: "yearly"  as const },
  { path: "/privacy",   priority: 0.3, changeFrequency: "yearly"  as const },
  { path: "/terms",     priority: 0.3, changeFrequency: "yearly"  as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Static pages
    ...STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}${path}`,
      changeFrequency,
      priority,
    })),

    // Category pages
    ...CATEGORIES.map((cat) => ({
      url: `${BASE_URL}${cat.path}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),

    // Subcategory pages
    ...SUBCATEGORIES.map((sub) => ({
      url: `${BASE_URL}${sub.path}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    // Tool pages
    ...TOOLS.map((tool) => ({
      url: `${BASE_URL}${tool.path}`,
      changeFrequency: "monthly" as const,
      priority: tool.featured ? 0.8 : 0.6,
    })),

    // Blog articles — use publishedAt for accurate lastModified
    ...ARTICLES.map((article) => ({
      url: `${BASE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // Comparison pages — use publishedAt for accurate lastModified
    ...COMPARISONS.map((comparison) => ({
      url: `${BASE_URL}/compare/${comparison.slug}`,
      lastModified: new Date(comparison.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
