import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { ImageCompressor } from "@/components/tools/image-tools/ImageCompressor";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("image-compressor");

const tool = TOOLS.find((t) => t.slug === "image-compressor")!;

const howToSteps = [
  "Drop or select a <strong>JPEG, PNG, WebP, GIF, BMP, or AVIF</strong> image — files up to 50 MB are accepted.",
  "Adjust the <strong>quality slider</strong> between 1 and 100. Lower values produce smaller files with more compression; higher values preserve more detail.",
  "Choose an <strong>output format</strong> — keep the original format or convert to JPEG, PNG, or WebP to take advantage of better compression.",
  "Optionally set a <strong>max dimension</strong> (e.g. 1920 px) to also scale down large images proportionally, reducing file size further.",
  "Click <strong>Compress</strong> to process the image, then download the result and compare the before/after file sizes.",
];

const faqs = [
  {
    question: "How is the image compressed?",
    answer:
      "<strong>JPEG and WebP</strong> images are reduced using lossy quality compression, which discards fine detail that is not easily visible to the human eye. <strong>PNG</strong> compression is lossless — the visual result is identical to the original regardless of the quality setting. All processing happens <strong>entirely in your browser</strong> — nothing is uploaded to a server.",
  },
  {
    question: "Will compressing reduce image quality?",
    answer:
      "For <strong>JPEG and WebP</strong>, lower quality settings will introduce visible artifacts at extreme levels. Settings between 70–85 typically strike a good balance between file size and visual quality. <strong>PNG compression is lossless</strong> — the image looks identical no matter the setting, only the internal file structure is optimized.",
  },
  {
    question: "What is the max dimension option?",
    answer:
      "If you set a <strong>max dimension</strong> (e.g. 1920 px), the image is proportionally scaled down so its longest side does not exceed that value. This is particularly useful for photos taken at full camera resolution, which are often far larger than needed for web display.",
  },
  {
    question: "Which format gives the smallest file size?",
    answer:
      "<strong>WebP</strong> typically achieves the best compression — often 25–35% smaller than an equivalent JPEG at the same visual quality. It is supported by all modern browsers. JPEG is the best choice for broad compatibility when WebP is not suitable.",
  },
  {
    question: "Is there a limit on how many images I can compress?",
    answer:
      "There is no artificial limit on the number of images. You can compress files <strong>one at a time</strong> with no account required. The only practical limit is your browser's available memory for very large files.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "Why Image Compression Matters",
    content: `<p>Images are typically the <strong>largest assets on a web page</strong>, often accounting for more than 50% of total page weight. Large images slow down page load times, increase mobile data usage, and hurt search engine rankings, since page speed is a confirmed ranking factor.</p>
<p>Compressing images before publishing them reduces file sizes without meaningful visible quality loss. A well-compressed image that loads in half a second delivers a <strong>better user experience</strong> than an uncompressed version that takes two seconds — and search engines reward faster pages with higher visibility.</p>`,
  },
  {
    title: "Choosing the Right Format",
    content: `<p>The image format you choose has a big impact on file size and compatibility:</p>
<ul>
<li><strong>JPEG</strong> — best for photographs and complex images with many colors. Does not support transparency. Widely compatible with all devices and browsers.</li>
<li><strong>PNG</strong> — best for graphics, logos, and images that require <strong>transparency</strong>. Lossless compression preserves exact pixel values.</li>
<li><strong>WebP</strong> — a modern format that offers better compression than both JPEG and PNG while supporting transparency and animation. Supported by all current browsers.</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>Getting the smallest file size while keeping acceptable quality requires a few considerations:</p>
<ul>
<li>Start with a <strong>quality setting of 80</strong> for most photos — it usually gives a good balance and the difference from 100 is barely visible.</li>
<li>Convert photos to <strong>WebP</strong> when possible — it is the most efficient format for the web today.</li>
<li>Use the <strong>max dimension</strong> option to resize images that are much larger than their display size. Displaying a 4000 px image in a 800 px container wastes bandwidth.</li>
<li>For logos and icons with sharp lines, use <strong>PNG or SVG</strong> rather than JPEG to avoid compression artifacts on edges.</li>
</ul>`,
  },
];

export default function ImageCompressorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <ImageCompressor />
    </ToolContainer>
  );
}
