import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { YamlToJson } from "@/components/tools/converters/YamlToJson";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("yaml-to-json");

const tool = TOOLS.find((t) => t.slug === "yaml-to-json")!;

const howToSteps = [
  "Paste or type <strong>valid YAML</strong> into the left editor — indentation must be consistent (spaces only, no tabs).",
  "The <strong>JSON output</strong> is generated instantly. Adjust the <strong>indent size</strong> (2 or 4 spaces) using the selector above the output panel.",
  "Click <strong>Copy</strong> to copy the JSON output to your clipboard, ready to paste into your application or API.",
];

const faqs = [
  {
    question: "What YAML features are supported?",
    answer:
      "The tool supports <strong>full YAML 1.2</strong> including anchors and aliases, multi-line strings (literal block and folded), complex mapping keys, and all standard scalar types.",
  },
  {
    question: "Can I convert Kubernetes or Helm configs?",
    answer:
      "Yes. Standard <strong>Kubernetes manifests</strong> and <strong>Helm values files</strong> are valid YAML and convert cleanly to JSON. Configs using custom YAML tags beyond the standard set may not convert if the tag is not recognized.",
  },
  {
    question: "Are YAML types coerced to JSON types?",
    answer:
      "Yes — YAML <strong>true/false</strong> become JSON booleans, numeric values become JSON numbers, and YAML <strong>null</strong> maps to JSON null. Quoted values are preserved as strings regardless of their content.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All conversion happens <strong>entirely in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "Why would I convert YAML to JSON?",
    answer:
      "YAML is primarily a human-facing configuration format. Converting to <strong>JSON</strong> is useful when you need to send config data to a web API, store it in a database, or process it with tools that only accept JSON input.",
  },
  {
    question: "Can YAML use tabs for indentation?",
    answer:
      "No — the YAML specification <strong>requires spaces</strong> for indentation. Tabs are not allowed and will cause a parse error. Use 2 or 4 spaces consistently throughout the document.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is YAML?",
    content: `<p><strong>YAML</strong> is a human-friendly data serialization format that uses indentation and minimal punctuation to represent structured data. It supports the same data types as JSON — objects, arrays, strings, numbers, booleans, and null — but is far more readable for humans, especially for multi-level configuration files.</p><p>YAML is the standard format for Kubernetes manifests, Docker Compose files, GitHub Actions workflows, Ansible playbooks, and many CI/CD tools. Its support for comments (lines starting with #) is a major advantage over JSON for files that teams need to document and maintain.</p>`,
  },
  {
    title: "YAML vs. JSON — When to Convert",
    content: `<p>YAML and JSON represent the same data; choosing between them depends on the audience and the tool:</p><ul><li><strong>YAML to JSON</strong> — needed when sending YAML-sourced config data to a REST API, a database, or a tool that only reads JSON</li><li><strong>JSON to YAML</strong> — preferred when you want to store or edit configuration in a more readable format</li><li><strong>Key advantage of YAML</strong>: comments are supported, making it easier to document configuration inline</li><li><strong>Key advantage of JSON</strong>: strict syntax makes it less error-prone for machine-generated data and API payloads</li></ul>`,
  },
  {
    title: "Common Use Cases for YAML to JSON Conversion",
    content: `<p>YAML-to-JSON conversion is common in DevOps and integration workflows:</p><ul><li>Sending a <strong>Kubernetes manifest</strong> to a REST API endpoint that accepts JSON</li><li>Converting a <strong>Helm values file</strong> or Ansible variable file into JSON for logging or auditing</li><li>Passing <strong>CI/CD pipeline variables</strong> defined in YAML to a downstream service that expects JSON</li><li>Migrating configuration from a YAML-based tool to a <strong>JSON-based configuration system</strong></li></ul>`,
  },
];

export default function YamlToJsonPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <YamlToJson />
    </ToolContainer>
  );
}
