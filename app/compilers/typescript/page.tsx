import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "typescript-compiler")!;
const language = LANGUAGE_BY_MONACO.get("typescript")!;

export const metadata = generateToolMetadata("typescript-compiler");

const howToSteps = [
  "Write or paste your <strong>TypeScript code</strong> in the editor.",
  "Add type annotations, interfaces, and generics as needed — TypeScript compiles on the fly.",
  "Expand <strong>Stdin</strong> if your program reads standard input.",
  "Click <strong>Run</strong> to compile and execute. Type errors appear as compile errors.",
];

const faqs = [
  {
    question: "Is this TypeScript compiler free?",
    answer: "Yes. The Online TypeScript Compiler is completely free with no login required.",
  },
  {
    question: "How is TypeScript executed?",
    answer: "Code is compiled and run in a secure sandbox. No tsconfig.json is needed — just write TypeScript and click Run.",
  },
  {
    question: "What TypeScript version is supported?",
    answer: "TypeScript 5.x. All modern TypeScript features are available including satisfies, const type parameters, and decorator metadata.",
  },
  {
    question: "Are type errors shown?",
    answer: "Yes. Type errors are caught at compile time and shown as compile errors in the output panel.",
  },
  {
    question: "Can I use npm packages?",
    answer: "No. Only the TypeScript standard library and Node.js built-ins are available. Third-party packages cannot be installed.",
  },
  {
    question: "Is there a time limit?",
    answer: "Yes — execution is terminated after 5 seconds. Compilation timeout is 10 seconds.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online TypeScript Compiler",
    content: `<p>This Online TypeScript Compiler lets you write and run TypeScript code in the browser without installing Node.js, TypeScript, or configuring a build tool. Just write your code and click Run.</p>
<p>Executes in a secure sandbox with no internet access and a 5-second run timeout. Type errors are caught at compile time and shown in the output panel.</p>`,
  },
  {
    title: "Supported TypeScript Features",
    content: `<ul>
<li>All TypeScript 5.x syntax: interfaces, generics, enums, decorators</li>
<li>Strict mode type checking enabled by default</li>
<li>Template literal types, conditional types, and mapped types</li>
<li>async/await with proper type inference</li>
<li>Node.js built-in types (<code>@types/node</code> included)</li>
</ul>`,
  },
];

export default function TypeScriptCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
