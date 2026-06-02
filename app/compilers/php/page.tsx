import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "php-compiler")!;
const language = LANGUAGE_BY_MONACO.get("php")!;

export const metadata = generateToolMetadata("php-compiler");

const howToSteps = [
  "Write your PHP code — start with <code>&lt;?php</code> at the top of the file.",
  "Use <code>echo</code> or <code>print</code> to output text.",
  "Expand <strong>Stdin</strong> to provide input for programs reading from <code>STDIN</code>.",
  "Click <strong>Run</strong>. Output appears in the results panel.",
];

const faqs = [
  {
    question: "Is this PHP compiler free?",
    answer: "Yes. The Online PHP Compiler is completely free with no login required.",
  },
  {
    question: "What PHP version is supported?",
    answer: "PHP 8.x. Modern PHP features are available including named arguments, match expressions, nullsafe operator, fibers, enums, and readonly properties.",
  },
  {
    question: "Do I need a web server?",
    answer: "No. Code runs as a PHP CLI script, not a web script. There is no web server or HTTP request context. Use echo for output instead of HTML.",
  },
  {
    question: "Are Composer packages available?",
    answer: "No. Only the PHP standard library and built-in extensions are available. Composer package installation is disabled.",
  },
  {
    question: "Can I read stdin?",
    answer: "Yes. Use fgets(STDIN) or trim(fgets(STDIN)) to read input. Expand the Stdin panel to provide values.",
  },
  {
    question: "Is there a time limit?",
    answer: "Yes — execution times out after 5 seconds.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online PHP Compiler",
    content: `<p>This Online PHP Compiler runs PHP scripts in the browser without needing XAMPP, WAMP, or a web server. Test PHP string manipulation, array functions, algorithms, and OOP patterns instantly.</p>`,
  },
  {
    title: "Available PHP Extensions",
    content: `<ul>
<li><strong>Arrays:</strong> array_map, array_filter, array_reduce, usort, array_unique</li>
<li><strong>Strings:</strong> str_replace, preg_match, preg_replace, substr, sprintf, explode, implode</li>
<li><strong>Math:</strong> abs, ceil, floor, round, sqrt, pow, rand, max, min</li>
<li><strong>JSON:</strong> json_encode, json_decode</li>
<li><strong>Date:</strong> date, strtotime, DateTime</li>
<li><strong>OOP:</strong> Classes, interfaces, traits, abstract classes, enums (PHP 8.1+)</li>
</ul>`,
  },
];

export default function PhpCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
