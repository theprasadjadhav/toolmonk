export type ToolCategory =
  | "calculators"
  | "converters"
  | "dev-tools"
  | "text-tools"
  | "generators"
  | "image-tools"
  | "pdf-tools"
  | "date-time-tools"
  | "seo-tools"
  | "design-tools"
  | "utility-tools"
  | "comparators"
  | "compilers";

export interface ToolMeta {
  slug: string;
  path: string;
  title: string;
  description: string;
  category: ToolCategory;
  subcategory?: string;
  keywords: string[];
  relatedSlugs: string[];
  featured?: boolean;
  icon: string;
  /** Slug of the primary entry — marks this as a shared/cross-category alias */
  aliasOf?: string;
}

export interface CategoryOverview {
  heading: string;
  body: string; // HTML
}

export interface ToolFinderRow {
  task: string;
  toolTitle: string;
  toolPath: string;
}

export interface CategoryMeta {
  slug: ToolCategory;
  path: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  overview?: CategoryOverview;
  whichTool?: ToolFinderRow[];
}

export interface SubcategoryMeta {
  slug: string;
  path: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: string;
  overview?: CategoryOverview;
  whichTool?: ToolFinderRow[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolSectionItem {
  title: string;
  content: string; // may contain basic HTML
}
