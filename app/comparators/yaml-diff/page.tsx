import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { YamlDiff } from "@/components/tools/comparators/YamlDiff";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.path === "/comparators/yaml-diff")!;

export const metadata = generateToolMetadata("", "/comparators/yaml-diff");

const howToSteps = [
  "Paste your <strong>original YAML</strong> into the left panel (YAML A).",
  "Paste the <strong>modified YAML</strong> into the right panel (YAML B).",
  "If either input has a syntax error, the status bar shows the exact error from the YAML parser.",
  "Use <strong>format</strong> to normalize both inputs (consistent key ordering and indentation) before comparing.",
  "Added lines appear in <strong>green</strong>, removed lines in <strong>red</strong>.",
];

const faqs = [
  {
    question: "What YAML parser is used for validation?",
    answer: "The tool uses js-yaml, a well-maintained JavaScript YAML parser. It validates both inputs and reports the exact error message and line number if the YAML is malformed.",
  },
  {
    question: "What happens if one input is invalid YAML?",
    answer: "The status bar shows the exact parse error for that panel. The diff continues to run but the error is prominently shown above the editor so you know the comparison may not reflect the intended structure.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All parsing and comparison happens entirely in your browser. Your YAML never leaves your device.",
  },
  {
    question: "Can I compare Kubernetes manifests?",
    answer: "Yes. Kubernetes manifests are YAML. Paste two versions of a manifest to spot changes in resource specs, labels, or configuration.",
  },
  {
    question: "Does format preserve comments?",
    answer: "No. The format button re-serialises the parsed YAML structure, which strips comments. Use format only when you want to normalise the structure for a cleaner diff.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "When to Use YAML Diff",
    content: `<p>YAML is widely used for configuration files — Kubernetes manifests, CI/CD pipelines, Docker Compose, Ansible playbooks, and more. Comparing two versions of a YAML config is a common task when reviewing infrastructure changes.</p>
<p>A dedicated YAML diff gives you <strong>syntax validation</strong> before the comparison runs, so you know both inputs are structurally valid. The Monaco editor provides YAML syntax highlighting, making it easy to read nested structures in both panels.</p>`,
  },
];

export default function YamlDiffPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <YamlDiff />
    </ToolContainer>
  );
}
