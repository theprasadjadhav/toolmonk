import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UniversalCompiler } from "@/components/tools/compilers/UniversalCompiler";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "code-compiler")!;

export const metadata = generateToolMetadata("code-compiler");

const howToSteps = [
  "Select a <strong>language</strong> from the dropdown in the toolbar.",
  "Write or paste your code in the editor — a hello world template is loaded automatically.",
  "Expand <strong>Stdin</strong> if your code reads from standard input.",
  "Click <strong>Run</strong> to execute. Output appears below the editor.",
];

const faqs = [
  {
    question: "Which languages are supported?",
    answer: "Python 3, JavaScript (Node.js), TypeScript, Java, C, C++, Go, Bash, Ruby, PHP, and SQLite — 11 languages in total.",
  },
  {
    question: "Is this online code compiler free?",
    answer: "Yes. The Online Code Compiler is completely free to use with no login or registration required.",
  },
  {
    question: "Is there a time limit for execution?",
    answer: "Yes — code is terminated after 5 seconds. This prevents infinite loops from consuming shared resources.",
  },
  {
    question: "Can I use stdin?",
    answer: "Yes. Expand the Stdin panel below the editor and type your input values, one per line.",
  },
  {
    question: "Is my code stored after execution?",
    answer: "No. Code is executed in an isolated sandbox and discarded immediately. Nothing is logged or saved.",
  },
  {
    question: "Can I install external packages or libraries?",
    answer: "No. Only the standard library for each language is available. Package installation is disabled for security.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online Code Compiler",
    content: `<p>The ToolMonk Online Code Compiler lets you write and run code in 11 popular programming languages directly in your browser — no installation required.</p>
<p>Each execution runs in a secure sandbox with no internet access and a 5-second timeout, giving you real results safely.</p>`,
  },
  {
    title: "Use Cases",
    content: `<ul>
<li><strong>Learning:</strong> Try a new language without configuring a development environment</li>
<li><strong>Interview prep:</strong> Practice coding problems in your target language</li>
<li><strong>Quick testing:</strong> Verify a snippet or algorithm without opening an IDE</li>
<li><strong>Teaching:</strong> Share executable code examples with students instantly</li>
</ul>`,
  },
];

export default function CodeCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UniversalCompiler />
    </ToolContainer>
  );
}
