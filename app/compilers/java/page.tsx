import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "java-compiler")!;
const language = LANGUAGE_BY_MONACO.get("java")!;

export const metadata = generateToolMetadata("java-compiler");

const howToSteps = [
  "Write your Java code — the entry point must be a <code>public static void main(String[] args)</code> method in a class named <strong>Main</strong>.",
  "Use <code>System.out.println()</code> to print output.",
  "Expand <strong>Stdin</strong> and use <code>Scanner</code> or <code>BufferedReader</code> to read input.",
  "Click <strong>Run</strong>. Compilation errors appear in the output panel with line numbers.",
];

const faqs = [
  {
    question: "Is this Java compiler free?",
    answer: "Yes. The Online Java Compiler is completely free with no login required.",
  },
  {
    question: "What Java version is supported?",
    answer: "Java 21. All modern Java features are available including records, sealed classes, pattern matching, text blocks, and virtual threads.",
  },
  {
    question: "Does my class need to be named Main?",
    answer: "Yes. The entry class must be named Main with a public static void main(String[] args) method. This is a sandbox requirement.",
  },
  {
    question: "Can I define multiple classes?",
    answer: "Yes. You can define multiple classes in a single file. Only inner classes (non-public) and the Main class (public) are supported in a single-file compilation.",
  },
  {
    question: "Are Java standard libraries available?",
    answer: "Yes. The full Java SE standard library is available — java.util, java.io, java.lang, java.math, and all others.",
  },
  {
    question: "Is there a compile timeout?",
    answer: "Yes — compilation has a 10-second timeout and execution has a 5-second timeout.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online Java Compiler",
    content: `<p>This Online Java Compiler compiles and runs Java 21 code in your browser. No local Java installation or IDE is required. Write your code, click Run, and see output immediately.</p>
<p>The sandbox runs each execution in an isolated process with no internet access, preventing security issues while delivering real compilation and runtime results.</p>`,
  },
  {
    title: "Java 21 Features",
    content: `<ul>
<li><strong>Records:</strong> Compact immutable data classes with auto-generated equals, hashCode, toString</li>
<li><strong>Sealed classes:</strong> Restrict which classes can extend or implement a type</li>
<li><strong>Pattern matching:</strong> instanceof patterns and switch expressions</li>
<li><strong>Text blocks:</strong> Multi-line string literals with automatic indentation trimming</li>
<li><strong>Virtual threads:</strong> Lightweight threads via Project Loom (Java 21)</li>
</ul>`,
  },
];

export default function JavaCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
