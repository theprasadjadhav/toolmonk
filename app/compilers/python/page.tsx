import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "python-compiler")!;
const language = LANGUAGE_BY_MONACO.get("python")!;

export const metadata = generateToolMetadata("python-compiler");

const howToSteps = [
  "Write or paste your <strong>Python code</strong> in the editor — a hello world template is preloaded.",
  "Expand <strong>Stdin</strong> if your program reads input with <code>input()</code> — enter one value per line.",
  "Click <strong>Run</strong>. Output from <code>print()</code> appears in the results panel.",
  "If your code has a syntax error, the error message is shown with the line number.",
];

const faqs = [
  {
    question: "Is this Python compiler free?",
    answer: "Yes. The Online Python Compiler is completely free — no login, no signup, no install required.",
  },
  {
    question: "What Python version is supported?",
    answer: "Python 3.",
  },
  {
    question: "Can I use NumPy, pandas, or other libraries?",
    answer: "No. Only the Python standard library is available. Package installation is disabled for security. For library-dependent code, use a local environment or Google Colab.",
  },
  {
    question: "Does it support input()?",
    answer: "Yes. Expand the Stdin panel and type your input values, one per line. Each call to input() reads one line.",
  },
  {
    question: "Is there a time limit?",
    answer: "Yes — execution is terminated after 5 seconds. Code with infinite loops will be stopped automatically.",
  },
  {
    question: "Is my code saved or logged?",
    answer: "No. Code is executed in an isolated sandbox and discarded immediately after the run completes.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online Python Compiler",
    content: `<p>This Online Python Compiler lets you write and execute Python 3 code directly in your browser. No installation of Python, pip, or any IDE is required — just write your code and click Run.</p>
<p>Execution runs in a secure sandbox. Your code has no internet access and is stopped after 5 seconds.</p>`,
  },
  {
    title: "Python Standard Library",
    content: `<p>The full Python standard library is available, including:</p>
<ul>
<li><code>math</code>, <code>random</code>, <code>statistics</code> — numeric operations</li>
<li><code>datetime</code>, <code>time</code>, <code>calendar</code> — date and time</li>
<li><code>json</code>, <code>csv</code>, <code>re</code> — data formats and text processing</li>
<li><code>collections</code>, <code>itertools</code>, <code>functools</code> — data structures and functional tools</li>
<li><code>os</code>, <code>sys</code>, <code>io</code> — system access (read-only within the sandbox)</li>
</ul>`,
  },
  {
    title: "Common Python Examples",
    content: `<p>Things you can test with this compiler:</p>
<ul>
<li>List comprehensions, generators, and lambda functions</li>
<li>Object-oriented programming — classes, inheritance, dunder methods</li>
<li>Recursion, dynamic programming, and algorithm practice</li>
<li>String formatting with f-strings and <code>.format()</code></li>
<li>Reading from stdin with <code>input()</code> for interactive programs</li>
</ul>`,
  },
];

export default function PythonCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
