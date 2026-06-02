import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "go-compiler")!;
const language = LANGUAGE_BY_MONACO.get("go")!;

export const metadata = generateToolMetadata("go-compiler");

const howToSteps = [
  "Write your Go code — it must start with <code>package main</code> and include a <code>func main()</code>.",
  "Use <code>fmt.Println()</code> or <code>fmt.Printf()</code> to print output.",
  "Expand <strong>Stdin</strong> to provide input for programs using <code>bufio</code> or <code>fmt.Scan()</code>.",
  "Click <strong>Run</strong> to compile and execute. Compilation errors show with line numbers.",
];

const faqs = [
  {
    question: "Is this Go compiler free?",
    answer: "Yes. The Online Go Compiler is completely free with no login required.",
  },
  {
    question: "What Go version is supported?",
    answer: "Go 1.21+. Modern Go features are available including generics (Go 1.18+), the new log/slog package, and all standard library additions.",
  },
  {
    question: "Can I use goroutines and channels?",
    answer: "Yes. Goroutines and channels are fully supported. Keep in mind the 5-second execution timeout applies to the whole program.",
  },
  {
    question: "Is the Go standard library available?",
    answer: "Yes. The full Go standard library is available: fmt, math, strings, strconv, sort, bufio, os, io, encoding/json, and all other packages.",
  },
  {
    question: "Can I import external packages?",
    answer: "No. Only the Go standard library is available. External module dependencies (go.mod) cannot be installed in the sandbox.",
  },
  {
    question: "Is there a time limit?",
    answer: "Yes — execution times out after 5 seconds. Compilation times out after 10 seconds.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online Go Compiler",
    content: `<p>This Online Go Compiler lets you write and run Go programs in the browser without installing the Go toolchain. Enter your code, click Run, and see the output in seconds.</p>
<p>The sandbox is isolated with no internet access. All Go standard library packages are available. Third-party modules are not supported.</p>`,
  },
  {
    title: "Go Standard Library Highlights",
    content: `<ul>
<li><code>fmt</code> — formatted I/O: Println, Printf, Sprintf, Scan</li>
<li><code>strings</code>, <code>strconv</code> — string manipulation and conversion</li>
<li><code>math</code>, <code>math/rand</code> — numeric operations and random numbers</li>
<li><code>sort</code> — sorting slices and custom types</li>
<li><code>bufio</code>, <code>os</code> — buffered I/O and file operations</li>
<li><code>encoding/json</code> — JSON marshal/unmarshal</li>
</ul>`,
  },
];

export default function GoCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
