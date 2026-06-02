import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { RegexTester } from "@/components/tools/code/RegexTester";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("regex-tester");

const tool = TOOLS.find((t) => t.slug === "regex-tester")!;

const howToSteps = [
  "Enter your <strong>regular expression pattern</strong> in the pattern input field at the top — do not include the surrounding slashes.",
  "Toggle the <strong>flags</strong> (g, i, m, s, u) using the flag buttons in the toolbar to control how the pattern is applied.",
  "Type or paste the <strong>test string</strong> you want to match against in the text panel below.",
  "<strong>Matches are highlighted in yellow</strong> directly in the preview area so you can see what the pattern captures at a glance.",
  "Each <strong>match is listed</strong> below with its exact value and character position in the source text, making it easy to verify capture groups.",
];

const faqs = [
  {
    question: "What regex syntax does this tool use?",
    answer:
      "This tool uses the <strong>ECMAScript regular expression</strong> standard — the same engine built into modern browsers. It supports character classes (<strong>[a-z]</strong>), quantifiers (<strong>*</strong>, <strong>+</strong>, <strong>?</strong>, <strong>{n,m}</strong>), groups (<strong>(...)</strong>), non-capturing groups (<strong>(?:...)</strong>), lookahead (<strong>(?=...)</strong>, <strong>(?!...)</strong>), lookbehind (<strong>(?&lt;=...)</strong>, <strong>(?&lt;!...)</strong>), and named capture groups (<strong>(?&lt;name&gt;...)</strong>).",
  },
  {
    question: "What do the flag buttons do?",
    answer:
      "<strong>g</strong> = global (find all matches, not just the first). <strong>i</strong> = case-insensitive. <strong>m</strong> = multiline (^ and $ match line boundaries, not just string start/end). <strong>s</strong> = dotAll (the dot <strong>.</strong> matches newline characters). <strong>u</strong> = unicode (enables full Unicode support and stricter pattern parsing).",
  },
  {
    question: "Why is the global flag always on?",
    answer:
      "The <strong>global flag (g)</strong> is enabled by default to find all matches in the text rather than stopping at the first. This gives a complete picture of where the pattern occurs. You can toggle it off if you only want to check whether the pattern matches at all.",
  },
  {
    question: "Is my text sent to a server?",
    answer:
      "No. All <strong>pattern matching</strong> happens entirely in your browser. Your regular expression and test text never leave your device.",
  },
  {
    question: "How do I match a literal dot or special character?",
    answer:
      "Special characters in regex (<strong>. * + ? ^ $ { } [ ] | ( ) \\</strong>) must be <strong>escaped with a backslash</strong> to match them literally. For example, to match a period, use <strong>\\.</strong> — without the backslash, a dot matches any character.",
  },
  {
    question: "What is a capture group and how do I use it?",
    answer:
      "A <strong>capture group</strong> is a part of the pattern enclosed in parentheses that extracts a portion of the match. For example, the pattern <strong>(\\d{4})-(\\d{2})-(\\d{2})</strong> matches a date and captures the year, month, and day as separate groups. The match list in this tool shows each captured group alongside the full match.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Regular Expression?",
    content: `<p>A <strong>regular expression</strong> (often shortened to <strong>regex</strong> or <strong>regexp</strong>) is a sequence of characters that defines a search pattern. Instead of looking for an exact string, a regex can describe a class of possible strings — for example, "any sequence of digits", "a valid email address", or "a word that starts with a capital letter".</p>
<p>Regular expressions are used across software development for tasks like <strong>searching text, validating input, extracting data,</strong> and <strong>replacing patterns</strong>. They are supported natively in virtually every programming language and in many text editors and command-line tools.</p>`,
  },
  {
    title: "Common Regex Patterns",
    content: `<ul>
<li><strong>\\d+</strong> — one or more digits</li>
<li><strong>\\w+</strong> — one or more word characters (letters, digits, underscore)</li>
<li><strong>\\s+</strong> — one or more whitespace characters</li>
<li><strong>[a-zA-Z]+</strong> — one or more letters (any case)</li>
<li><strong>^start</strong> — matches "start" at the beginning of a string or line</li>
<li><strong>end$</strong> — matches "end" at the end of a string or line</li>
<li><strong>\\b\\w+\\b</strong> — matches a complete word</li>
<li><strong>[^aeiou]</strong> — any character that is NOT a vowel</li>
<li><strong>(foo|bar)</strong> — matches either "foo" or "bar"</li>
<li><strong>\\d{3}-\\d{4}</strong> — a phone number segment like 555-1234</li>
</ul>`,
  },
  {
    title: "Tips for Writing Better Patterns",
    content: `<ul>
<li><strong>Start simple and build up:</strong> Begin with the most specific part of your pattern and gradually add surrounding context rather than writing the whole expression at once.</li>
<li><strong>Use non-greedy quantifiers when needed:</strong> By default, quantifiers like <strong>*</strong> and <strong>+</strong> match as much as possible. Add a <strong>?</strong> after them (e.g. <strong>.*?</strong>) to match as little as possible.</li>
<li><strong>Anchor your patterns:</strong> Use <strong>^</strong> and <strong>$</strong> when the pattern should match the entire string to avoid partial matches.</li>
<li><strong>Escape special characters:</strong> Remember that <strong>. ( ) [ ] { } * + ? ^ $ | \\</strong> all have special meanings — prefix them with <strong>\\</strong> to match them literally.</li>
<li><strong>Test with edge cases:</strong> Try empty strings, strings with only spaces, and strings that should not match to ensure your pattern rejects what it should.</li>
</ul>`,
  },
];

export default function RegexTesterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <RegexTester />
    </ToolContainer>
  );
}
