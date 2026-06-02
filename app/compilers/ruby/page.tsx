import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "ruby-compiler")!;
const language = LANGUAGE_BY_MONACO.get("ruby")!;

export const metadata = generateToolMetadata("ruby-compiler");

const howToSteps = [
  "Write your Ruby code in the editor — a hello world template is preloaded.",
  "Use <code>puts</code> or <code>print</code> to output text.",
  "Expand <strong>Stdin</strong> to provide input for programs using <code>gets</code>.",
  "Click <strong>Run</strong>. Output appears instantly in the results panel.",
];

const faqs = [
  {
    question: "Is this Ruby interpreter free?",
    answer: "Yes. The Online Ruby Interpreter is completely free with no login required.",
  },
  {
    question: "What Ruby version is supported?",
    answer: "Ruby 3.x. Modern Ruby features are available including pattern matching, endless method definitions, hash shorthand, and numbered block parameters.",
  },
  {
    question: "Are Ruby gems available?",
    answer: "No. Only the Ruby standard library is available. Gem installation is disabled. You can use built-in classes like Array, Hash, String, File, IO, JSON, and Date.",
  },
  {
    question: "Can I read input with gets?",
    answer: "Yes. Expand the Stdin panel to provide input. Each call to gets.chomp reads one line.",
  },
  {
    question: "Is there a time limit?",
    answer: "Yes — execution times out after 5 seconds.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online Ruby Interpreter",
    content: `<p>This Online Ruby Interpreter lets you write and run Ruby code in the browser without installing Ruby or IRB. Write scripts, test algorithms, and practice Ruby idioms without any setup.</p>`,
  },
  {
    title: "Ruby Standard Library Highlights",
    content: `<ul>
<li><strong>Core classes:</strong> Array, Hash, String, Integer, Float, Range, Symbol</li>
<li><strong>Enumerable:</strong> map, select, reject, reduce, each_with_object, flat_map</li>
<li><strong>String:</strong> split, gsub, match, scan, strip, chomp, start_with?</li>
<li><strong>Math:</strong> Math::sqrt, Math::PI, Integer#digits, Numeric#abs</li>
<li><strong>I/O:</strong> puts, print, p, gets, STDIN.read</li>
<li><strong>JSON:</strong> require 'json'; JSON.parse, JSON.generate</li>
</ul>`,
  },
];

export default function RubyCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
