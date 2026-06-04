import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonToYaml } from "@/components/tools/converters/JsonToYaml";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("json-to-yaml");

const tool = TOOLS.find((t) => t.slug === "json-to-yaml" && t.category === "converters")!;

const howToSteps = [
  "Paste or type <strong>valid JSON</strong> into the left editor — click <strong>Sample</strong> to load a configuration example and see the expected format.",
  "The <strong>YAML output</strong> is generated instantly with clean 2-space indentation, ready for use in any configuration file.",
  "Click <strong>Copy</strong> to copy the YAML output to your clipboard, then paste it into your config file or CI/CD pipeline.",
];

const faqs = [
  {
    question: "What YAML version is produced?",
    answer:
      "The tool produces <strong>YAML 1.2 compatible output</strong> using 2-space indentation. This is the most widely supported YAML version and is compatible with Kubernetes, Docker Compose, GitHub Actions, and most modern tools.",
  },
  {
    question: "Are all JSON types supported?",
    answer:
      "Yes — JSON <strong>objects</strong>, <strong>arrays</strong>, <strong>strings</strong>, <strong>numbers</strong>, <strong>booleans</strong>, and <strong>null</strong> all convert to their natural YAML equivalents with no data loss.",
  },
  {
    question: "Can I use this for Kubernetes or Docker Compose configs?",
    answer:
      "Yes. The output is standard YAML suitable for <strong>any configuration file</strong>, including Kubernetes manifests, Docker Compose files, GitHub Actions workflows, Ansible playbooks, and more.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All conversion happens <strong>entirely in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "Why is YAML preferred for configuration files?",
    answer:
      "YAML is <strong>more readable</strong> than JSON for configuration because it does not require braces, brackets, or quotes around most values. Its indentation-based structure is easy to scan visually, and it supports comments — which JSON does not.",
  },
  {
    question: "What is the difference between JSON and YAML?",
    answer:
      "Both formats represent the same structured data. <strong>JSON</strong> is more explicit (uses braces, brackets, and quotes) and is the standard for APIs. <strong>YAML</strong> is more concise and supports comments, making it preferred for configuration files that humans read and edit frequently.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is YAML?",
    content: `<p><strong>YAML</strong> (which stands for "YAML Ain't Markup Language") is a human-friendly data serialization format. It represents the same data structures as JSON — objects, arrays, strings, numbers, booleans, and null — but uses indentation and minimal punctuation instead of braces and brackets.</p><p>YAML is the configuration language of choice for many popular tools: Kubernetes manifests, Docker Compose files, GitHub Actions workflows, Ansible playbooks, and many CI/CD pipelines all use YAML. Its clean syntax and support for comments make it far easier to maintain than JSON for files that people edit regularly.</p>`,
  },
  {
    title: "When to Use JSON vs. YAML",
    content: `<p>Choose the format based on how the data will be used:</p><ul><li><strong>Use JSON</strong> for API payloads, data exchange between systems, and anywhere the consumer is a program that does not need to read the raw file</li><li><strong>Use YAML</strong> for configuration files that developers and operators read and edit — the cleaner syntax reduces errors and the ability to add comments aids documentation</li><li><strong>Convert JSON to YAML</strong> when you receive API data that you want to store as a config file, or when a tool requires YAML input but your source data is in JSON</li></ul>`,
  },
  {
    title: "Common Use Cases for JSON to YAML Conversion",
    content: `<p>JSON-to-YAML conversion comes up regularly in DevOps and development workflows:</p><ul><li>Converting a <strong>JSON API response</strong> into a YAML configuration file for a service</li><li>Translating <strong>package or dependency metadata</strong> from JSON into a YAML-based config</li><li>Creating <strong>Kubernetes resource definitions</strong> from a programmatically generated JSON structure</li><li>Preparing <strong>CI/CD pipeline configs</strong> (GitHub Actions, GitLab CI) from a JSON template</li></ul>`,
  },
];

export default function JsonToYamlPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <JsonToYaml />
    </ToolContainer>
  );
}
