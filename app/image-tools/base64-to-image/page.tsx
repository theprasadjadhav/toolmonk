import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { Base64ToImage } from "@/components/tools/image-tools/Base64ToImage";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("base64-to-image");

const tool = TOOLS.find((t) => t.slug === "base64-to-image")!;

const howToSteps = [
  "Paste a <strong>Base64 string or data URI</strong> into the text area, or upload a <strong>.txt file</strong> containing the encoded data — both raw Base64 and full data URIs are accepted.",
  "The tool <strong>automatically decodes the string</strong> and displays the image in the preview panel as soon as valid data is detected.",
  "Review the <strong>decoded image details</strong> — format, dimensions, and estimated file size — to confirm the data decoded correctly.",
  "Click <strong>Download</strong> to save the image file to your device, or copy the <strong>full data URI</strong> for use elsewhere.",
];

const faqs = [
  {
    question: "Do I need to include the 'data:' prefix?",
    answer:
      "No — the tool accepts both <strong>full data URIs</strong> (data:image/png;base64,...) and <strong>raw Base64 strings</strong> without the prefix. If you paste a raw string, the tool automatically detects the image type from the first bytes of the decoded data.",
  },
  {
    question: "Which image formats are supported?",
    answer:
      "The decoder recognizes <strong>PNG, JPEG, WebP, and GIF</strong> from their internal file signatures. Other formats fall back to JPEG. As long as the Base64 data encodes a valid image, the browser can display and download it.",
  },
  {
    question: "Is the data sent to a server?",
    answer:
      "No — all decoding happens <strong>entirely in your browser</strong>. The Base64 string is processed locally and never transmitted to any server, keeping your data completely private.",
  },
  {
    question: "Why would I have a Base64-encoded image?",
    answer:
      "Base64 images often appear in <strong>API responses, configuration files, email templates, HTML source code</strong>, and database exports where binary data is stored as text. This tool lets you quickly decode and preview any such string.",
  },
  {
    question: "What if the decoded image looks corrupted?",
    answer:
      "Corruption usually means the Base64 string is <strong>incomplete or contains extra characters</strong>. Make sure you copied the entire string, including any padding characters (<code>=</code> at the end). Some sources wrap Base64 in line breaks — the tool handles most variations, but check that no characters were lost during copying.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is Base64 Encoding?",
    content: `<p><strong>Base64</strong> is a method of encoding binary data — like image files — into a sequence of printable text characters. It converts every 3 bytes of binary data into 4 ASCII characters, using only letters, numbers, and the characters <code>+</code>, <code>/</code>, and <code>=</code>.</p>
<p>Because Base64 produces plain text, it can be safely embedded in places that do not support raw binary data: <strong>HTML files, CSS stylesheets, JSON payloads, XML documents, and email messages</strong>. The trade-off is that Base64 increases the data size by about 33% compared to the original binary file.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>You are likely to encounter Base64-encoded images in several common scenarios:</p>
<ul>
<li><strong>Inline images in HTML/CSS</strong> — small icons or logos embedded directly in code to avoid extra network requests</li>
<li><strong>API and webhook payloads</strong> — services that send image data as part of a JSON response</li>
<li><strong>Email attachments</strong> — images in HTML emails are often Base64-encoded within the message body</li>
<li><strong>Database storage</strong> — images stored as text in databases or configuration files</li>
<li><strong>Development and debugging</strong> — inspecting or previewing image data returned by backend services</li>
</ul>`,
  },
  {
    title: "How It Works",
    content: `<p>When you paste a Base64 string, the tool reads the <strong>data URI prefix</strong> (if present) to determine the image format, or inspects the first decoded bytes to detect the format automatically. The encoded text is then <strong>decoded back to raw binary data</strong> in memory.</p>
<p>That binary data is handed directly to the browser's built-in image rendering engine, which displays it as a preview. When you download, the binary data is written to a file with the correct extension. The entire process runs <strong>locally in your browser</strong> — nothing is sent over the network.</p>`,
  },
];

export default function Base64ToImagePage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <Base64ToImage />
    </ToolContainer>
  );
}
