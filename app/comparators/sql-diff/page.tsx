import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";
import { notFound } from "next/navigation";

const tool = TOOLS.find((t) => t.path === "/comparators/sql-diff")!;

export const metadata = generateToolMetadata("", "/comparators/sql-diff");

const howToSteps = [
  "Paste the <strong>original SQL</strong> into the left panel.",
  "Paste the <strong>modified SQL</strong> into the right panel.",
  "Changes in queries, schema definitions, and stored procedures are highlighted instantly.",
  "Use <strong>swap</strong> to reverse panels or <strong>clear</strong> to reset.",
];

const faqs = [
  {
    question: "Does it validate SQL syntax?",
    answer: "No — the tool compares SQL as text with syntax highlighting. It does not connect to a database or validate queries.",
  },
  {
    question: "Can I compare migration scripts?",
    answer: "Yes. Paste two versions of a migration script to see exactly what changed — new tables, altered columns, or modified indexes.",
  },
  {
    question: "Is my SQL sent to a server?",
    answer: "No. Comparison runs entirely in your browser.",
  },
];

export default function SqlDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs}>
      <SyntaxDiff language="sql" uploadAccept=".sql" placeholder="paste SQL into both panels to compare" />
    </ToolContainer>
  );
}
