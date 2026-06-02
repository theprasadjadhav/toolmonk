import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CodeSnapshot } from "@/components/tools/code/CodeSnapshot";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("code-snapshot");

const tool = TOOLS.find((t) => t.slug === "code-snapshot")!;

const howToSteps = [
  "Paste or type your code into the <strong>editor panel</strong> on the left — the tool auto-detects the language, or you can choose one manually from the language selector.",
  "Pick a <strong>syntax theme</strong> (Dracula, One Dark, GitHub, Nord, and more) and a <strong>gradient background</strong> to style the card around your code.",
  "Optionally enable <strong>line numbers</strong>, choose a window chrome style (macOS, Windows, or none), adjust <strong>padding</strong> and <strong>font size</strong>, and enter a file name to display in the title bar.",
  "The preview updates <strong>instantly</strong> as you make changes — when it looks right, click <strong>Export PNG (2×)</strong> to download a high-resolution retina image.",
];

const faqs = [
  {
    question: "What image format does Code Snapshot export?",
    answer:
      "It exports a <strong>PNG at 2× pixel density</strong> (retina quality), so the text and colours are crisp on high-DPI screens and when pasted into presentations, social posts, or documentation.",
  },
  {
    question: "Which programming languages are supported for syntax highlighting?",
    answer:
      "Code Snapshot supports <strong>19 popular languages</strong>: JavaScript, TypeScript, Python, Java, C++, C, Go, Rust, Swift, Kotlin, PHP, Ruby, Scala, CSS, HTML, JSON, YAML, Bash, and Markdown. Syntax highlighting is applied automatically based on the language you select.",
  },
  {
    question: "Is my code sent to a server?",
    answer:
      "No. All <strong>syntax highlighting and image generation</strong> happen entirely in your browser. Your code never leaves your device — there is no upload or network request involved.",
  },
  {
    question: "How do I get the best image quality?",
    answer:
      "The export uses <strong>2× pixel ratio</strong> for retina sharpness. For the clearest result, keep lines reasonably short (under 80 characters), choose a <strong>contrasting theme and background combination</strong>, and set padding to <strong>L or XL</strong> for generous whitespace around the card.",
  },
  {
    question: "Can I use the exported image for blog posts or social media?",
    answer:
      "Yes. The high-resolution PNG is ideal for sharing on social media, embedding in blog posts, adding to slide decks, or including in technical documentation. The transparent padding and gradient background give the images a polished, professional look.",
  },
  {
    question: "What does the window style option do?",
    answer:
      "The <strong>window style</strong> option adds decorative chrome around the code card — you can display macOS-style traffic-light buttons, a Windows-style title bar, or no chrome at all for a minimal look. This helps the image look like a real code editor screenshot.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Code Snapshot?",
    content: `<p>A <strong>code snapshot</strong> is a beautifully styled image of a code snippet, designed to be shared visually rather than as raw text. Instead of pasting plain code into a slide or post, you create an image that includes syntax highlighting, a decorative background, and optional window chrome — making your code look like it is displayed in a real editor.</p>
<p>Code snapshots are popular in technical blog posts, social media threads, video thumbnails, and slide presentations because they are instantly readable and visually appealing without requiring the viewer to have any special tooling.</p>`,
  },
  {
    title: "Tips for Best Results",
    content: `<ul>
<li><strong>Keep lines short:</strong> Aim for under 80 characters per line so nothing gets truncated in the exported image.</li>
<li><strong>Choose contrast carefully:</strong> Light themes (GitHub) work well on dark backgrounds; dark themes (Dracula, One Dark) stand out on light or gradient backgrounds.</li>
<li><strong>Use generous padding:</strong> The L or XL padding setting adds breathing room around the code card, making it look less cramped when shared at small sizes.</li>
<li><strong>Add a file name:</strong> Setting a file name in the title bar (e.g. <strong>app.py</strong> or <strong>config.json</strong>) gives context to the reader and makes the image feel more authentic.</li>
<li><strong>Pick the right language:</strong> Manually selecting the correct language ensures the highlight colours are applied accurately for keywords, strings, and comments.</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul>
<li><strong>Technical blog posts:</strong> Embed code images that look consistent and styled without relying on the blog platform's own code block formatting.</li>
<li><strong>Social media:</strong> Share code snippets on platforms where code blocks are not natively rendered — the image is immediately readable in any feed.</li>
<li><strong>Presentations and slide decks:</strong> Paste crisp, retina-quality code images into slides instead of screenshots or plain text boxes.</li>
<li><strong>Documentation and tutorials:</strong> Illustrate code examples with visually distinct images that draw the reader's eye to the key snippet.</li>
</ul>`,
  },
];

export default function CodeSnapshotPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <CodeSnapshot />
    </ToolContainer>
  );
}
