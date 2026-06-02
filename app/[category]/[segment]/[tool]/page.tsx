import { notFound } from "next/navigation";
import { TOOLS, getToolStaticParams } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { getToolIcon } from "@/components/icons";

interface PageProps {
  params: Promise<{ category: string; segment: string; tool: string }>;
}

export async function generateStaticParams() {
  return getToolStaticParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { tool: toolSlug } = await params;
  return generateToolMetadata(toolSlug);
}

export default async function NestedToolPage({ params }: PageProps) {
  const { category, segment: subcategorySlug, tool: toolSlug } = await params;

  const tool = TOOLS.find(
    (t) =>
      t.slug === toolSlug &&
      t.category === category &&
      t.subcategory === subcategorySlug
  );

  if (!tool) notFound();

  const defaultSteps = [
    "Enter your data or parameters in the input area above.",
    "Results are calculated automatically as you type.",
    "Copy or download your result as needed.",
  ];

  const defaultFaqs = [
    {
      question: `What is the ${tool.title}?`,
      answer: tool.description,
    },
    {
      question: `Is the ${tool.title} free to use?`,
      answer: `Yes — the ${tool.title} is completely free with no registration or download required.`,
    },
    {
      question: "Is my data secure?",
      answer:
        "All calculations and processing happen directly in your browser. No data is sent to our servers.",
    },
    {
      question: `Can I use the ${tool.title} on mobile?`,
      answer:
        "Yes, ToolMonk is fully responsive and works on smartphones, tablets, and desktop computers.",
    },
  ];

  const ToolIcon = getToolIcon(tool);

  return (
    <ToolContainer tool={tool} howToSteps={defaultSteps} faqs={defaultFaqs}>
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <span className="w-14 h-14 flex items-center justify-center text-foreground-muted" aria-hidden="true">
          {/* eslint-disable-next-line react-hooks/static-components */}
          <ToolIcon size={32} />
        </span>
        <p className="font-mono text-lg text-foreground">{tool.title}</p>
        <p className="text-sm text-foreground-muted max-w-sm leading-relaxed">
          Tool interface coming soon. Check back or{" "}
          <a
            href="https://github.com"
            className="text-primary hover:underline"
          >
            contribute on GitHub
          </a>
          .
        </p>
      </div>
    </ToolContainer>
  );
}
