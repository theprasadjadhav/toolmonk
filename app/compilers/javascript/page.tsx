import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "javascript-compiler")!;
const language = LANGUAGE_BY_MONACO.get("javascript")!;

export const metadata = generateToolMetadata("javascript-compiler");

const howToSteps = [
  "Write or paste your <strong>JavaScript code</strong> in the editor.",
  "Use <code>console.log()</code> to produce output — it is shown in the results panel.",
  "For programs that read input, expand <strong>Stdin</strong> and use Node.js readline.",
  "Click <strong>Run</strong> to execute. Results appear instantly.",
];

const faqs = [
  {
    question: "Is this JavaScript compiler free?",
    answer: "Yes. The Online JavaScript Compiler is completely free with no account required.",
  },
  {
    question: "Which runtime is used?",
    answer: "Node.js 18 (LTS). This means you can use all modern JavaScript features including ES2022+ syntax, async/await, destructuring, and optional chaining.",
  },
  {
    question: "Can I use npm packages?",
    answer: "No. Only Node.js built-in modules are available. Package installation is disabled for security. Built-ins include fs, path, crypto, http, readline, and all others that ship with Node.",
  },
  {
    question: "Does it run in the browser or on Node.js?",
    answer: "Your code runs on Node.js 18 in a server-side sandbox — not in the browser. Browser-specific APIs like window, document, and fetch are not available.",
  },
  {
    question: "Can I use async/await?",
    answer: "Yes. Async/await and Promises are fully supported. Top-level await is also supported.",
  },
  {
    question: "Is there a time limit?",
    answer: "Yes — execution is terminated after 5 seconds. Infinite loops or blocking code will be stopped automatically.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online JavaScript Compiler",
    content: `<p>This Online JavaScript Compiler runs your JavaScript code on Node.js 18 inside a secure sandbox. No local Node.js installation is needed — paste your code and click Run to see results immediately.</p>
<p>The sandbox has no internet access and is terminated after 5 seconds. All Node.js built-in modules are available; third-party npm packages are not.</p>`,
  },
  {
    title: "Supported JavaScript Features",
    content: `<p>Node.js 18 supports all modern JavaScript, including:</p>
<ul>
<li>ES2022+ syntax: optional chaining, nullish coalescing, logical assignment</li>
<li>Async/await, Promises, and top-level await</li>
<li>Classes, arrow functions, destructuring, template literals</li>
<li>CommonJS (<code>require()</code>) and ESM (<code>import</code>) modules</li>
<li>All Node.js built-ins: <code>fs</code>, <code>path</code>, <code>crypto</code>, <code>readline</code>, <code>buffer</code></li>
</ul>`,
  },
];

export default function JavaScriptCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
