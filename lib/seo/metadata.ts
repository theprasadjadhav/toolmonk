import type { Metadata } from "next";
import {
  TOOLS,
  CATEGORIES,
  SUBCATEGORIES,
} from "@/lib/tools/registry";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolmonk.net";

const SITE_NAME = "ToolMonk";

export function generateToolMetadata(slug: string, path?: string): Metadata {
  const tool = path ? TOOLS.find((t) => t.path === path) : TOOLS.find((t) => t.slug === slug);
  if (!tool) return {};

  const title = `${tool.title} — Free Online Tool`;
  const url = `${BASE_URL}${tool.path}`;

  return {
    title,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title,
      description: tool.description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: tool.description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateCategoryMetadata(categorySlug: string): Metadata {
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) return {};

  const title = `${category.title} — Free Online Tools`;
  const url = `${BASE_URL}${category.path}`;

  return {
    title,
    description: category.description,
    openGraph: {
      title,
      description: category.description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: category.description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateSubcategoryMetadata(
  categorySlug: string,
  subcategorySlug: string
): Metadata {
  const subcategory = SUBCATEGORIES.find(
    (s) => s.slug === subcategorySlug && s.category === categorySlug
  );
  if (!subcategory) return {};

  const title = `${subcategory.title} — Free Online Tools`;
  const url = `${BASE_URL}${subcategory.path}`;

  return {
    title,
    description: subcategory.description,
    openGraph: {
      title,
      description: subcategory.description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: subcategory.description,
    },
    alternates: {
      canonical: url,
    },
  };
}
