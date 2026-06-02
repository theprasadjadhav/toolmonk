import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "cpp-compiler")!;
const language = LANGUAGE_BY_MONACO.get("cpp")!;

export const metadata = generateToolMetadata("cpp-compiler");

const howToSteps = [
  "Write your C++ code — include a <code>main()</code> function as the entry point.",
  "Add <code>#include</code> directives for standard headers like <code>&lt;iostream&gt;</code>, <code>&lt;vector&gt;</code>, <code>&lt;algorithm&gt;</code>.",
  "Expand <strong>Stdin</strong> if your program reads input with <code>cin</code> or <code>getline()</code>.",
  "Click <strong>Run</strong> to compile with GCC (g++) and execute. Errors show with line numbers.",
];

const faqs = [
  {
    question: "Is this C++ compiler free?",
    answer: "Yes. The Online C++ Compiler is completely free with no login required.",
  },
  {
    question: "Which C++ standard is supported?",
    answer: "GCC with C++17 by default. C++11, C++14, and C++17 features all work — including auto, range-based for, lambdas, smart pointers, and structured bindings.",
  },
  {
    question: "Is the C++ Standard Template Library (STL) available?",
    answer: "Yes. The full STL is available: vector, map, set, unordered_map, priority_queue, sort, binary_search, and all other containers and algorithms.",
  },
  {
    question: "Can I use <bits/stdc++.h>?",
    answer: "Yes. The GCC-specific convenience header <bits/stdc++.h> is available, which includes the entire standard library in one line — common in competitive programming.",
  },
  {
    question: "Is there a compile timeout?",
    answer: "Compilation times out after 10 seconds; execution times out after 5 seconds.",
  },
  {
    question: "Can I use templates and lambda functions?",
    answer: "Yes. C++ templates, lambda functions, auto type deduction, and all modern C++ features are fully supported.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online C++ Compiler",
    content: `<p>This Online C++ Compiler compiles and runs C++ code in your browser using GCC (g++). No local compiler or IDE is needed — write your C++ code and click Run to see output immediately.</p>
<p>Ideal for competitive programming practice, learning C++ object-oriented patterns, or testing algorithms without setting up a local development environment.</p>`,
  },
  {
    title: "Available C++ Standard Library",
    content: `<ul>
<li><strong>Containers:</strong> vector, array, list, deque, set, map, unordered_map, stack, queue, priority_queue</li>
<li><strong>Algorithms:</strong> sort, binary_search, lower_bound, upper_bound, min, max, accumulate, reverse</li>
<li><strong>Smart pointers:</strong> unique_ptr, shared_ptr, weak_ptr</li>
<li><strong>Strings:</strong> std::string, std::stringstream, std::to_string</li>
<li><strong>I/O:</strong> cin, cout, cerr, getline, scanf, printf</li>
</ul>`,
  },
];

export default function CppCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
