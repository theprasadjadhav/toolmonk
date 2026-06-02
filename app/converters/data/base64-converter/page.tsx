import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { Base64Converter } from "@/components/tools/converters/Base64Converter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("base64-converter");

const tool = TOOLS.find((t) => t.slug === "base64-converter")!;

const howToSteps = [
  "Select <strong>Encode</strong> to convert plain text into Base64, or <strong>Decode</strong> to convert a Base64 string back to readable text.",
  "Paste or type your input in the left panel — the <strong>output updates instantly</strong> as you type.",
  "Review the result in the right panel, then click <strong>Copy</strong> to copy it to your clipboard.",
];

const faqs = [
  {
    question: "What is Base64?",
    answer:
      "<strong>Base64</strong> is a binary-to-text encoding scheme that represents data using 64 printable ASCII characters (A–Z, a–z, 0–9, +, /). It is widely used in <strong>data URLs</strong>, email attachments, and HTTP Basic Authentication headers to safely transmit binary data over text-based channels.",
  },
  {
    question: "Does it support Unicode and special characters?",
    answer:
      "Yes. Input text is first converted to <strong>UTF-8 bytes</strong> before Base64 encoding, and decoded back through UTF-8 on the way out. This means all Unicode characters — including emoji, accented letters, and non-Latin scripts — are handled correctly.",
  },
  {
    question: "What is the size increase from encoding?",
    answer:
      "Base64-encoded output is approximately <strong>33% larger</strong> than the original byte count. This overhead is the trade-off for representing binary data as printable text.",
  },
  {
    question: "Is data sent to a server?",
    answer:
      "No. All encoding and decoding happens <strong>entirely in your browser</strong>. Your text never leaves your device.",
  },
  {
    question: "What is Base64 used for in practice?",
    answer:
      "Common uses include <strong>embedding images</strong> directly in HTML or CSS as data URIs, encoding binary attachments in emails, passing credentials in HTTP headers, and storing small binary assets inside JSON or XML documents.",
  },
  {
    question: "What is URL-safe Base64?",
    answer:
      "<strong>URL-safe Base64</strong> replaces the + and / characters with - and _ so the encoded string can be used directly in URLs and filenames without percent-encoding. The tool outputs standard Base64; you can manually swap the characters if URL-safe output is required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is Base64?",
    content: `<p><strong>Base64</strong> is an encoding method that converts binary data — such as images, files, or raw bytes — into a string of plain text characters. The name comes from the 64-character alphabet it uses: the 26 uppercase letters, 26 lowercase letters, 10 digits, plus + and /.</p><p>Because Base64 produces only printable ASCII characters, it is safe to embed inside formats that cannot carry raw binary data, such as HTML attributes, JSON strings, email bodies, and HTTP headers. The trade-off is a roughly 33% increase in size.</p>`,
  },
  {
    title: "When to Use Base64",
    content: `<p>Use Base64 encoding when you need to <strong>embed binary data inside a text-based format</strong>. Common scenarios include:</p><ul><li>Embedding small images or fonts directly in HTML or CSS to eliminate extra HTTP requests</li><li>Passing file contents through an API that only accepts JSON or plain text</li><li>Encoding credentials for HTTP Basic Authentication</li><li>Storing binary blobs in databases that only support text columns</li></ul><p>For large files, prefer uploading the file directly rather than encoding it — the size overhead and memory cost of Base64 become significant above a few hundred kilobytes.</p>`,
  },
  {
    title: "How Base64 Encoding Works",
    content: `<p>The encoder reads your input 3 bytes at a time and converts each group into 4 Base64 characters. If the input length is not a multiple of 3, one or two <strong>padding characters (=)</strong> are added at the end to complete the final group. Decoding reverses this process: every 4 characters become 3 bytes, and padding characters are stripped.</p><p>Because each Base64 character carries 6 bits (2⁶ = 64), three bytes (24 bits) map cleanly to four characters (4 × 6 = 24 bits), which explains both the encoding and the predictable size increase.</p>`,
  },
];

export default function Base64ConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <Base64Converter />
    </ToolContainer>
  );
}
