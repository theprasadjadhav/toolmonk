import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "c-compiler")!;
const language = LANGUAGE_BY_MONACO.get("c")!;

export const metadata = generateToolMetadata("c-compiler");

const howToSteps = [
  "Write your C code — include a <code>main()</code> function as the entry point.",
  "Add <code>#include</code> directives at the top for standard libraries like <code>stdio.h</code>, <code>stdlib.h</code>.",
  "Expand <strong>Stdin</strong> if your program uses <code>scanf()</code> or <code>fgets()</code> to read input.",
  "Click <strong>Run</strong> to compile with GCC and execute. Compile errors show with line numbers.",
];

const faqs = [
  {
    question: "Is this C compiler free?",
    answer: "Yes. The Online C Compiler is completely free with no login required.",
  },
  {
    question: "Which C standard is used?",
    answer: "GCC with default flags. C99, C11, and C17 standard features are all supported.",
  },
  {
    question: "Are standard C libraries available?",
    answer: "Yes. All standard C headers are available: stdio.h, stdlib.h, string.h, math.h, time.h, ctype.h, stdbool.h, stdint.h, and others.",
  },
  {
    question: "Can I allocate memory with malloc()?",
    answer: "Yes. Dynamic memory allocation with malloc(), calloc(), realloc(), and free() works as expected. A memory limit applies per execution.",
  },
  {
    question: "Is there a compile timeout?",
    answer: "Compilation times out after 10 seconds; execution times out after 5 seconds.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online C Compiler",
    content: `<p>This Online C Compiler compiles and runs C code directly in your browser using GCC. No local installation or Makefile is required — write your code and click Run.</p>
<p>Great for learning C programming, testing algorithms, or practising for competitive programming without setting up a local environment.</p>`,
  },
  {
    title: "Available C Standard Library Headers",
    content: `<ul>
<li><code>stdio.h</code> — printf, scanf, fgets, file I/O</li>
<li><code>stdlib.h</code> — malloc, free, atoi, rand, exit</li>
<li><code>string.h</code> — strlen, strcpy, strcat, strcmp, memset</li>
<li><code>math.h</code> — sqrt, pow, floor, ceil, sin, cos</li>
<li><code>time.h</code> — time, clock, difftime</li>
<li><code>ctype.h</code> — isalpha, isdigit, toupper, tolower</li>
</ul>`,
  },
];

export default function CCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
