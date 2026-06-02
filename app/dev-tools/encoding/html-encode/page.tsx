import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { HtmlEncoder } from "@/components/tools/encoding/HtmlEncoder";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("html-encode");

const tool = TOOLS.find((t) => t.slug === "html-encode")!;

const howToSteps = [
  "Type or paste your <strong>HTML or plain text</strong> into the input panel on the left — any characters that are special in HTML will be encoded automatically.",
  "The <strong>HTML encoded output</strong> appears instantly in the right panel, with unsafe characters replaced by their entity equivalents.",
  "Choose <strong>Named</strong> entities (e.g. <strong>&amp;amp;</strong>) or <strong>Numeric</strong> entities (e.g. <strong>&#38;</strong>) from the toolbar, depending on your compatibility requirements.",
  "The encoder escapes the five critical HTML characters: <strong>&amp;, &lt;, &gt;, &quot;,</strong> and <strong>&#39;</strong>.",
  "Click <strong>copy</strong> to copy the encoded output to your clipboard, or <strong>clear</strong> to reset both panels.",
];

const faqs = [
  {
    question: "What is HTML encoding?",
    answer:
      "<strong>HTML encoding</strong> converts characters that have special meaning in HTML — like <strong>&lt;</strong>, <strong>&gt;</strong>, <strong>&amp;</strong>, <strong>&quot;</strong>, and <strong>'</strong> — into their HTML entity equivalents. This prevents the browser from interpreting them as markup and is essential for safely displaying <strong>user-generated content</strong> in web pages.",
  },
  {
    question: "What is the difference between named and numeric entities?",
    answer:
      "<strong>Named entities</strong> use a human-readable name (&amp;amp;, &amp;lt;, &amp;gt;) while <strong>numeric entities</strong> use the character's decimal Unicode code point (&#38;, &#60;, &#62;). Both are valid HTML. Named entities are more readable; numeric entities work even in contexts where named forms may not be recognized.",
  },
  {
    question: "When do I need HTML encoding?",
    answer:
      "You should <strong>always encode user-supplied content</strong> before inserting it into an HTML page. Any text originating from user input, API responses, or databases should be HTML-encoded before display to prevent <strong>Cross-Site Scripting (XSS) attacks</strong>, where malicious scripts are injected through unencoded content.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All <strong>encoding happens entirely in your browser</strong>. Your data never leaves your device.",
  },
  {
    question: "Which characters does this encoder escape?",
    answer:
      "The encoder escapes the five characters that are critical for HTML safety: <strong>&amp;</strong> (ampersand), <strong>&lt;</strong> (less-than), <strong>&gt;</strong> (greater-than), <strong>&quot;</strong> (double quote), and <strong>'</strong> (single quote / apostrophe). These are the characters that browsers use to parse HTML tags and attribute values.",
  },
  {
    question: "What is a Cross-Site Scripting (XSS) attack?",
    answer:
      "A <strong>Cross-Site Scripting (XSS)</strong> attack occurs when an attacker injects malicious script code into a web page through unencoded user input. When other users view the page, the injected script executes in their browser, potentially stealing session tokens, redirecting users, or accessing sensitive data. <strong>HTML encoding all user-supplied text</strong> before rendering it is the primary defense against this class of attack.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why HTML Encoding Matters for Security",
    content: `<p>When you display text from an untrusted source — such as a user comment, a search query, or an API response — in an HTML page, any <strong>&lt;</strong> or <strong>&gt;</strong> characters in that text would be interpreted by the browser as the start of an HTML tag. An attacker could exploit this to inject a <strong>&lt;script&gt;</strong> tag containing malicious code.</p>
<p><strong>HTML encoding</strong> neutralizes this threat by converting those characters into entities before the text is placed in the page. The browser then displays the entity as its literal text character rather than parsing it as markup. This simple transformation is one of the most important security practices in web development.</p>`,
  },
  {
    title: "Named vs Numeric HTML Entities",
    content: `<p>HTML entities come in two main forms. <strong>Named entities</strong> use a short descriptive identifier preceded by an ampersand and followed by a semicolon — for example, <strong>&amp;amp;</strong> for the ampersand character. They are easy to read and remember.</p>
<p><strong>Numeric entities</strong> reference a character by its Unicode code point, either in decimal (<strong>&#38;</strong>) or hexadecimal (<strong>&#x26;</strong>) form. They cover every possible Unicode character, including symbols that have no named entity form. Both types are fully supported by all browsers and produce identical results.</p>`,
  },
];

export default function HtmlEncodePage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <HtmlEncoder />
    </ToolContainer>
  );
}
