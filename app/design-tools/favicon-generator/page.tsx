import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { FaviconGenerator } from "@/components/tools/design/FaviconGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("favicon-generator");

const tool = TOOLS.find((t) => t.slug === "favicon-generator")!;

const howToSteps = [
  "Upload your <strong>source image</strong> — PNG, JPG, SVG, or WebP are supported. <strong>Square images</strong> produce the best results since favicons are displayed at equal width and height.",
  "The tool automatically generates <strong>8 standard favicon sizes</strong> from your uploaded image.",
  "<strong>Preview each size</strong> to verify the icon looks clear at small dimensions — especially at 16×16 and 32×32.",
  "Download individual sizes or click <strong>Download All</strong> to get all sizes at once.",
  "Place <strong>favicon.ico</strong> at the root of your site and reference the larger sizes in your HTML &lt;head&gt; for full browser and device coverage.",
];

const faqs = [
  {
    question: "What image formats are supported?",
    answer:
      "Any image format your browser can render: <strong>PNG, JPG, SVG, WebP, GIF</strong>. Square images produce the best results since non-square images will be cropped or letterboxed when resized to equal dimensions.",
  },
  {
    question: "What sizes are generated?",
    answer:
      "16×16 (browser tab favicon), 32×32, 48×48, 64×64, 96×96, <strong>180×180</strong> (Apple touch icon for iOS home screens), <strong>192×192</strong> (Android PWA icon), and <strong>512×512</strong> (PWA splash screen icon).",
  },
  {
    question: "Why is the 16×16 saved as favicon.ico?",
    answer:
      "Modern browsers accept a PNG file served as the favicon. For legacy compatibility, a true <strong>.ico file</strong> is needed — the ICO format supports multiple sizes in a single file. The downloaded PNG can be renamed and used directly for modern browser support.",
  },
  {
    question: "Is my image uploaded to a server?",
    answer:
      "No — everything happens <strong>entirely in your browser</strong>. Your image never leaves your device and is never sent to any server.",
  },
  {
    question: "Is this free?",
    answer: "Yes — completely free with no registration required.",
  },
  {
    question: "What HTML do I need to add for favicons?",
    answer:
      'Add these tags inside your HTML &lt;head&gt;: <strong>&lt;link rel="icon" href="/favicon.ico"&gt;</strong> for the browser tab icon, <strong>&lt;link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"&gt;</strong> for iOS home screens, and &lt;link rel="icon" sizes="192x192" href="/icon-192.png"&gt; for Android PWA icons.',
  },
  {
    question: "Why does my favicon look blurry at small sizes?",
    answer:
      "Icons become blurry at small sizes when the source image contains <strong>fine detail or thin lines</strong> that cannot render clearly at 16×16 pixels. Use a simplified, high-contrast version of your logo or brand mark specifically designed for small display sizes.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Favicons",
    content: `<p>A <strong>favicon</strong> (short for favourite icon) is the small icon that appears in browser tabs, bookmarks, and browser history entries to help users identify a website at a glance. It is one of the most visible elements of a brand's web presence — present on every page a user visits.</p><p>Modern websites need favicons in <strong>multiple sizes</strong>: small icons for browser tabs, medium icons for bookmarks and taskbar pinning, and large icons for mobile home screen shortcuts and Progressive Web App (PWA) splash screens.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>New website launch:</strong> Generate a complete favicon set before going live so your site is instantly recognisable in browser tabs.</li><li><strong>PWA setup:</strong> The 192×192 and 512×512 sizes are required for Progressive Web Apps to display correctly when installed on mobile home screens.</li><li><strong>iOS home screen icons:</strong> The 180×180 Apple touch icon is shown when a user adds your site to their iPhone or iPad home screen.</li><li><strong>Brand refresh:</strong> Update all favicon sizes simultaneously whenever your logo changes.</li></ul>`,
  },
  {
    title: "Tips for Best Results",
    content: `<ul><li>Use a <strong>square source image</strong> — non-square sources will be cropped to square before resizing.</li><li>Design or adapt your logo specifically for <strong>small sizes</strong>: simplify details, increase contrast, and consider using just an initial or symbol rather than full wordmark text.</li><li>Use a <strong>transparent background</strong> (PNG) so the icon adapts cleanly to both light and dark browser themes.</li><li>Test your 16×16 favicon in an actual browser tab before publishing — what looks fine at 512px often becomes unrecognisable at 16px.</li></ul>`,
  },
];

export default function FaviconGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <FaviconGenerator />
    </ToolContainer>
  );
}
