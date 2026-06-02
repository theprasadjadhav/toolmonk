import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "bash-compiler")!;
const language = LANGUAGE_BY_MONACO.get("shell")!;

export const metadata = generateToolMetadata("bash-compiler");

const howToSteps = [
  "Write your Bash script — start with <code>#!/bin/bash</code> for clarity.",
  "Use <code>echo</code> or <code>printf</code> to print output.",
  "Expand <strong>Stdin</strong> to provide input for scripts using <code>read</code>.",
  "Click <strong>Run</strong> to execute. Output and errors appear in the results panel.",
];

const faqs = [
  {
    question: "Is this Bash interpreter free?",
    answer: "Yes. The Online Bash Interpreter is completely free with no login required.",
  },
  {
    question: "What Bash version is available?",
    answer: "Bash 5.x. Modern bash features are available including associative arrays, extended globbing, and process substitution.",
  },
  {
    question: "Are standard Unix tools available?",
    answer: "Yes. Common tools like grep, sed, awk, sort, uniq, wc, cut, tr, head, tail, and find are available inside the sandbox.",
  },
  {
    question: "Can I run curl or wget?",
    answer: "No. The sandbox has no internet access. curl, wget, and any network-dependent commands will fail.",
  },
  {
    question: "Can I read from stdin in my script?",
    answer: "Yes. Use the read command to read input. Expand the Stdin panel to provide input values.",
  },
  {
    question: "Is there a time limit?",
    answer: "Yes — execution times out after 5 seconds.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online Bash Interpreter",
    content: `<p>This Online Bash Interpreter lets you run shell scripts directly in the browser. Test automation scripts, one-liners, text processing pipelines, and shell functions without a terminal.</p>
<p>The sandbox includes a standard Linux environment with common Unix tools. Network access is disabled for security.</p>`,
  },
  {
    title: "Available Unix Tools",
    content: `<ul>
<li><strong>Text processing:</strong> grep, sed, awk, cut, tr, sort, uniq, wc</li>
<li><strong>File inspection:</strong> cat, head, tail, ls, find, wc -l</li>
<li><strong>Math:</strong> bc, expr, awk arithmetic</li>
<li><strong>String operations:</strong> echo, printf, parameter expansion, substring extraction</li>
<li><strong>Control flow:</strong> if/elif/else, for loops, while loops, case statements, functions</li>
</ul>`,
  },
];

export default function BashCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
