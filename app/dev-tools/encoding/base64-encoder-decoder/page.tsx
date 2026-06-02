import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { Base64Converter } from "@/components/tools/converters/Base64Converter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("base64-encoder-decoder");

const tool = TOOLS.find((t) => t.slug === "base64-encoder-decoder")!;

const howToSteps = [
  "Select <strong>encode</strong> mode to convert plain text into Base64, or <strong>decode</strong> mode to convert Base64 back into readable text.",
  "Type or paste your input into the <strong>left panel</strong> — the tool accepts any text including Unicode characters and emoji.",
  "The <strong>result appears instantly</strong> in the right output panel as you type.",
  "Click <strong>copy</strong> to copy the output to your clipboard with one click.",
  "Use <strong>clear</strong> to reset both panels and start over.",
];

const faqs = [
  {
    question: "What is Base64?",
    answer:
      "<strong>Base64</strong> is a binary-to-text encoding scheme that represents binary data using only <strong>64 printable ASCII characters</strong> (A–Z, a–z, 0–9, +, /). It is commonly used to safely transmit binary data — such as images, files, or binary tokens — over text-based protocols like email or HTTP that might not handle raw binary safely.",
  },
  {
    question: "Does this support Unicode and emoji?",
    answer:
      "Yes. The encoder first converts your text to <strong>UTF-8 bytes</strong> before applying Base64, so all Unicode characters including emoji, accented letters, and non-Latin scripts are handled correctly. The decoder reverses this process.",
  },
  {
    question: "Is my data sent to a server?",
    answer:
      "No. All <strong>encoding and decoding happens entirely in your browser</strong>. Your data never leaves your device — there is no upload or network request involved.",
  },
  {
    question: "What is the difference between standard Base64 and URL-safe Base64?",
    answer:
      "Standard Base64 uses <strong>+</strong> and <strong>/</strong> characters, which have special meanings in URLs. <strong>URL-safe Base64</strong> replaces + with <strong>-</strong> and / with <strong>_</strong> so the output can be used safely inside URLs, filenames, and HTTP query parameters without additional escaping.",
  },
  {
    question: "Why does Base64 output end with = or == signs?",
    answer:
      "Base64 encodes data in groups of 3 bytes at a time. If the input length is not a multiple of 3, <strong>padding characters (=)</strong> are added to complete the final group. One = means one padding byte was added; two == means two. The padding ensures the encoded string length is always a multiple of 4 characters.",
  },
  {
    question: "What are common uses for Base64 encoding?",
    answer:
      "Base64 is used to <strong>embed images inline in HTML or CSS</strong> as data URIs, to encode binary attachments in emails, to transmit binary data in JSON payloads, to store small files in databases as text, and to encode credentials in HTTP Basic Authentication headers.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is Base64 Encoding?",
    content: `<p><strong>Base64</strong> is a way to represent binary data — bytes that can have any value from 0 to 255 — using only a safe set of 64 printable text characters. The name comes from the fact that the encoding uses exactly 64 distinct symbols: the 26 uppercase letters, 26 lowercase letters, 10 digits, and the characters + and /.</p>
<p>The need for Base64 arose because many older systems and protocols were designed to handle <strong>plain text only</strong>. Sending raw binary data through them could corrupt the content if certain byte values were misinterpreted as control characters. By converting binary to a safe text representation first, data can travel reliably through email servers, URLs, XML documents, and HTTP headers.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul>
<li><strong>Inline images:</strong> Embedding small images directly in HTML or CSS as data URIs (<strong>data:image/png;base64,...</strong>) eliminates a separate network request.</li>
<li><strong>Email attachments:</strong> File attachments in email are Base64-encoded so binary files can travel through text-based mail servers safely.</li>
<li><strong>API authentication:</strong> HTTP Basic Authentication sends credentials as a Base64-encoded string in the Authorization header.</li>
<li><strong>JSON payloads:</strong> Binary data (like file contents or cryptographic keys) is Base64-encoded before being placed inside JSON, which only supports text.</li>
<li><strong>Tokens and secrets:</strong> Many authentication tokens and cryptographic keys are distributed in Base64 format for safe storage and transport.</li>
</ul>`,
  },
];

export default function Base64EncoderDecoderPage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <Base64Converter />
    </ToolContainer>
  );
}
