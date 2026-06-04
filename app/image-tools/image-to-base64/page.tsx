import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ImageToBase64 } from "@/components/tools/image-tools/ImageToBase64";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("image-to-base64");

const tool = TOOLS.find((t) => t.slug === "image-to-base64" && t.category === "image-tools")!;

const howToSteps = [
  "Drop or select any image file — <strong>JPEG, PNG, WebP, GIF</strong>, and other common formats are supported.",
  "The tool <strong>instantly encodes the image</strong> in your browser and displays the Base64 output — no button click required.",
  "Copy the output in whichever form you need: <strong>full Data URI</strong>, raw Base64 string, <strong>HTML img tag</strong>, or CSS background-image snippet.",
  "Paste the copied string <strong>directly into your HTML, CSS, or JSON</strong> — no separate file or URL needed.",
];

const faqs = [
  {
    question: "What is a Base64 data URI?",
    answer:
      "A <strong>data URI</strong> encodes binary file data as a Base64 ASCII string and embeds it inline. For images, the format is: <code>data:image/jpeg;base64,&lt;encoded-data&gt;</code>. You can use it as the <code>src</code> of an <code>&lt;img&gt;</code> tag or as a CSS <code>background-image</code> URL without needing a separate file request.",
  },
  {
    question: "Why is the Base64 string so long?",
    answer:
      "Base64 encoding expands binary data by approximately <strong>33%</strong> — a 100 KB image becomes roughly 133 KB as a Base64 string. For large images, consider hosting the file separately and referencing it by URL to avoid bloating your HTML or CSS files.",
  },
  {
    question: "Is the image sent to a server?",
    answer:
      "No — encoding is done <strong>entirely in your browser</strong>. The image data is read locally and never transmitted to any server.",
  },
  {
    question: "When should I use Base64 for images?",
    answer:
      "Base64 is best for <strong>very small images</strong> — icons, favicons, tiny UI elements — where eliminating an extra network request outweighs the size overhead. For larger images, loading them from a URL is almost always more efficient.",
  },
  {
    question: "What is the difference between the data URI and raw Base64?",
    answer:
      "A <strong>data URI</strong> includes the prefix (<code>data:image/png;base64,</code>) that tells the browser the file type, followed by the Base64 string. A <strong>raw Base64 string</strong> is just the encoded data without the prefix. Use the full data URI when embedding in HTML or CSS; use the raw string when passing the data to a backend or API that handles the MIME type separately.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Base64 Encoding",
    content: `<p><strong>Base64</strong> is a binary-to-text encoding scheme that converts raw binary data into a string of printable ASCII characters. It was originally developed so that binary attachments could be safely transmitted in systems that only supported plain text, such as email.</p>
<p>For images, Base64 encoding allows a picture file to be represented as a long text string. This string can be embedded anywhere that text is accepted — an HTML file, a CSS stylesheet, a JSON document, or a database field — without requiring a separate file to be hosted or downloaded.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Encoding images to Base64 is useful in several specific scenarios:</p>
<ul>
<li><strong>Inline images in HTML emails</strong> — embed images directly in the message body to ensure they display without relying on external image hosting</li>
<li><strong>Small UI elements in web apps</strong> — inline tiny icons or sprites to reduce the number of network requests on page load</li>
<li><strong>API payloads</strong> — send image data as part of a JSON request or response without multipart file uploads</li>
<li><strong>Single-file HTML documents</strong> — bundle all assets including images into one self-contained HTML file</li>
<li><strong>CSS backgrounds</strong> — embed small decorative images directly in a stylesheet</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>Base64 is a useful tool but it has trade-offs. Keep these guidelines in mind:</p>
<ul>
<li>Only use Base64 for <strong>small images under ~5 KB</strong> — larger images increase HTML/CSS file sizes significantly, which can hurt performance.</li>
<li>Base64-encoded images <strong>cannot be cached separately</strong> by the browser — every time the page is loaded, the encoded string is re-parsed. Stand-alone image files benefit from browser and CDN caching.</li>
<li>For the best web performance, compress and resize the image <strong>before encoding</strong> it to Base64 to minimize the string length.</li>
</ul>`,
  },
];

export default function ImageToBase64Page() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ImageToBase64 />
    </ToolContainer>
  );
}
