import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { BackgroundRemover } from "@/components/tools/lazy-client";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("background-remover");

const tool = TOOLS.find((t) => t.slug === "background-remover")!;

const howToSteps = [
  "Drop or select an image in <strong>JPEG, PNG, or WebP format</strong> — the tool accepts most common photo and graphic file types.",
  "Choose a <strong>background fill</strong>: leave the background transparent for use on websites or in designs, or pick a solid color to replace the original background.",
  "Click <strong>Remove Background</strong> — a detection model runs entirely in your browser and isolates the subject from the background automatically.",
  "Use the <strong>before/after toggle</strong> to compare the original image with the processed result and verify the cutout quality.",
  "Click <strong>Download PNG</strong> to save the result. PNG is used because it supports transparency, preserving any see-through areas in the output.",
];

const faqs = [
  {
    question: "Does this work entirely in my browser?",
    answer:
      "Yes — the background removal runs entirely in your browser. Your image is <strong>never uploaded to any server</strong>, so your files stay completely private.",
  },
  {
    question: "Why is the first run slow?",
    answer:
      "The first time you use this tool, a <strong>detection model (~25 MB)</strong> is downloaded and cached in your browser. Every subsequent use is near-instant because the model loads directly from your browser's local cache — no network request needed.",
  },
  {
    question: "What output format is used?",
    answer:
      "The result is always a <strong>PNG file</strong>, which supports transparency. If you chose a solid background color, that color is composited into the PNG at download time. PNG is the only widely supported format that preserves transparent areas.",
  },
  {
    question: "Can I change the background color after processing?",
    answer:
      "Yes — the <strong>transparent result is kept in memory</strong> after processing. You can switch between transparent and any solid color and re-download without rerunning the detection step.",
  },
  {
    question: "What kinds of images work best?",
    answer:
      "<strong>Photos with a clear subject</strong> — people, products, animals, and objects against distinct backgrounds — give the best results. Images with very complex edges, fine hair, or subjects that blend closely with the background may require a little manual cleanup.",
  },
  {
    question: "Can I use the result for commercial purposes?",
    answer:
      "The tool produces the output from your own image, so you retain the rights to the result. Always ensure you have the rights to the <strong>original image</strong> you upload before using the output commercially.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes — completely free with no registration required.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "How Background Removal Works",
    content: `<p>Background removal works by analyzing every pixel in an image and classifying it as either <strong>foreground</strong> (the subject) or <strong>background</strong>. The tool uses a trained detection model that has learned to recognize the edges, colors, and shapes that define common subjects like people, animals, and products.</p>
<p>The result is a <strong>mask</strong> — a map that marks which pixels belong to the subject. That mask is then applied to the original image, making background pixels transparent and keeping subject pixels intact. Because this all runs in your browser, no image data ever leaves your device.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Background removal is one of the most frequently needed image editing tasks. Common uses include:</p>
<ul>
<li><strong>Product photography</strong> — place products on a white or transparent background for online stores</li>
<li><strong>Profile photos</strong> — remove distracting backgrounds for headshots and avatars</li>
<li><strong>Marketing materials</strong> — drop subjects onto branded backgrounds in presentations or social media graphics</li>
<li><strong>Design work</strong> — isolate elements to layer them into composite images</li>
<li><strong>ID photos</strong> — apply the required plain-color background for passports or documents</li>
</ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<p>To get the cleanest cutout possible, keep these guidelines in mind:</p>
<ul>
<li>Use images where the <strong>subject is well-lit and clearly separated</strong> from the background in terms of color or brightness.</li>
<li><strong>Higher resolution images</strong> produce finer edge detail — avoid heavily compressed or blurry photos.</li>
<li>Fine details like <strong>hair or fur</strong> are harder to isolate perfectly; start with a clear, sharp photo for best edge quality.</li>
<li>After downloading, open the PNG in a design tool to touch up any edges that were not captured cleanly.</li>
</ul>`,
  },
];

export default function BackgroundRemoverPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <BackgroundRemover />
    </ToolContainer>
  );
}
