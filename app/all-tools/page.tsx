import type { Metadata } from "next";
import { CATEGORIES, getUniqueToolCount } from "@/lib/tools/registry";
import { AllToolsPage } from "@/components/tool/AllToolsPage";

export const metadata: Metadata = {
  title: "All Tools | ToolMonk",
  description: `Browse all ${getUniqueToolCount()} free online tools across ${CATEGORIES.length} categories. Calculators, converters, dev tools, text tools, generators, image tools, and more.`,
  alternates: { canonical: "https://toolmonk.net/all-tools" },
};

export default function AllToolsRoute() {
  return <AllToolsPage />;
}
