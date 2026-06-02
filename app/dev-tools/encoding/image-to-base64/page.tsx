import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ImageToBase64 } from "@/components/tools/shared/encoding/ImageToBase64";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("image-to-base64");
const tool = TOOLS.find((t) => t.slug === "image-to-base64" && t.category === "dev-tools")!;

const howToSteps = [
  "Drop an image file onto the upload area or click <strong>select file</strong> to choose one — supported formats include JPEG, PNG, WebP, GIF, SVG, and more.",
  "The tool instantly generates the <strong>Base64 encoding</strong> of the image entirely in your browser, with no upload to any server.",
  "Copy the output format you need: <strong>full Data URI</strong> (ready for use as a src attribute), <strong>raw Base64 string</strong>, <strong>HTML img tag</strong>, or <strong>CSS background-image</strong> declaration.",
  "Paste the copied string directly into your <strong>HTML, CSS, JSON,</strong> or any other file where you need the image embedded inline.",
];

const faqs = [
  {
    question: "What is a Base64 data URI for images?",
    answer:
      "A <strong>data URI</strong> encodes binary file data as a Base64 text string and embeds it directly inline. For images, the format is: <strong>data:image/jpeg;base64,&lt;encoded-data&gt;</strong>. You can use it as the <strong>src</strong> of an img tag or as a <strong>CSS background-image URL</strong> without needing a separate file request or hosting the image anywhere.",
  },
  {
    question: "Why is the Base64 string so long?",
    answer:
      "Base64 encoding expands binary data by approximately <strong>33%</strong> — a 100 KB image becomes roughly 133 KB as a Base64 string. For large images, this size increase can outweigh the convenience of inlining. Consider using Base64 only for <strong>small icons, logos, and decorative elements</strong>, and serve larger images as separate files.",
  },
  {
    question: "Is the image sent to a server?",
    answer:
      "No — <strong>encoding is done entirely in your browser</strong>. The image file never leaves your device. There is no upload, no network request, and no server processing involved.",
  },
  {
    question: "Is this tool free?",
    answer:
      "Yes — completely free with no registration required. You can convert as many images as you need.",
  },
  {
    question: "What image formats are supported?",
    answer:
      "Any image format your browser can read is supported, including <strong>JPEG, PNG, WebP, GIF, SVG, AVIF, BMP,</strong> and <strong>ICO</strong>. The output data URI will use the correct MIME type for the format (e.g. <strong>image/png</strong>, <strong>image/webp</strong>).",
  },
  {
    question: "Can I use a Base64 image in CSS?",
    answer:
      "Yes. The <strong>CSS background-image</strong> output format gives you a ready-to-paste CSS declaration: <strong>background-image: url('data:image/png;base64,...')</strong>. This is useful for embedding small background textures, icons, or patterns directly in a stylesheet without additional image files.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Base64 Image Data URI?",
    content: `<p>A <strong>data URI</strong> is a special URL scheme that embeds file content directly into the URL string rather than pointing to an external file. When used for images, the file's binary content is first converted to <strong>Base64 text</strong>, then prefixed with metadata about the file type.</p>
<p>The result looks like: <strong>data:image/png;base64,iVBORw0KGgo...</strong>. You can use this string anywhere a normal image URL would go — in an <strong>img src attribute, a CSS background-image,</strong> or a <strong>JSON payload</strong> — and the browser will decode and display the image without making any network request to load it.</p>`,
  },
  {
    title: "When to Use Inline Base64 Images",
    content: `<ul>
<li><strong>Small icons and logos:</strong> Icons under ~5 KB are good candidates for inlining — the Base64 overhead is small and you save a network round trip.</li>
<li><strong>Email templates:</strong> Many email clients block external image requests. Embedding images as Base64 ensures they always display.</li>
<li><strong>Offline or embedded applications:</strong> When an application must work without internet access, all assets can be bundled as Base64 data URIs.</li>
<li><strong>Avoid for large images:</strong> For photos and large graphics, the 33% size increase and inability to cache the image separately make external file references more efficient.</li>
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
