import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JsonValidator } from "@/components/tools/json/JsonValidator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("json-validator");

const tool = TOOLS.find((t) => t.slug === "json-validator")!;

const howToSteps = [
  "Paste your <strong>JSON</strong> into the input field — the validator accepts any JSON value: object, array, string, number, or boolean.",
  "The validator <strong>checks your JSON instantly as you type</strong>, with no need to press a button.",
  "A <strong>green banner</strong> confirms valid JSON and shows the root structure type (object or array) and the number of top-level keys or items.",
  "A <strong>red banner</strong> shows the exact syntax error message — including the position of the error — so you can locate and fix it quickly.",
];

const faqs = [
  {
    question: "What does a JSON Validator do?",
    answer:
      "It checks whether your JSON string follows the correct syntax. It tells you immediately if there is a <strong>missing bracket</strong>, <strong>incorrect quote</strong>, <strong>trailing comma</strong>, or any other syntax issue — and shows the exact location of the error.",
  },
  {
    question: "What information is shown for valid JSON?",
    answer:
      "For valid JSON, the tool shows whether the root is an <strong>object or array</strong>, and the number of top-level keys or items. This gives you a quick structural summary without needing to read the entire document.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. Validation runs <strong>entirely in your browser</strong>. Nothing is transmitted — your data stays on your device.",
  },
  {
    question: "What are the most common JSON syntax errors?",
    answer:
      "The most frequent mistakes are: <strong>trailing commas</strong> after the last item in an object or array, <strong>single quotes</strong> instead of double quotes around strings or keys, <strong>unquoted keys</strong>, and <strong>missing closing brackets</strong> or braces.",
  },
  {
    question: "Is valid JSON always well-formed?",
    answer:
      "Yes. <strong>Valid JSON</strong> means the document conforms to the JSON specification — correct syntax, proper quoting, no trailing commas. This tool checks structural validity. It does not validate against a schema (for example, whether required fields are present).",
  },
  {
    question: "Can I validate JSON that starts with an array?",
    answer:
      "Yes. A JSON document can be an <strong>array at the root level</strong>, not just an object. Both <code>[1, 2, 3]</code> and <code>{\"key\": \"value\"}</code> are valid top-level JSON values.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is JSON?",
    content: `<p><strong>JSON (JavaScript Object Notation)</strong> is a lightweight, human-readable data format widely used for representing structured information. It is the standard format for data exchange between web services, APIs, and configuration files.</p>
<p>JSON has a strict syntax: <strong>keys must be double-quoted strings</strong>, values must be one of six types (string, number, boolean, null, object, array), and trailing commas are not permitted. A validator immediately surfaces any deviation from these rules.</p>`,
  },
  {
    title: "Common JSON Syntax Errors",
    content: `<p>Understanding common JSON errors saves debugging time:</p>
<ul>
<li><strong>Trailing comma:</strong> A comma after the last item — <code>[1, 2, 3,]</code> — is not allowed in JSON</li>
<li><strong>Single quotes:</strong> JSON requires double quotes for all strings — <code>{'key': 'value'}</code> is invalid</li>
<li><strong>Unquoted keys:</strong> Object keys must always be quoted — <code>{key: "value"}</code> is invalid</li>
<li><strong>Missing comma:</strong> Items in objects and arrays must be separated by commas</li>
<li><strong>Unclosed brackets:</strong> Every opening <code>{</code> or <code>[</code> must have a matching closing delimiter</li>
</ul>`,
  },
];

export default function JsonValidatorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <JsonValidator />
    </ToolContainer>
  );
}
