import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { DeviceInfoChecker } from "@/components/tools/utility-tools/DeviceInfoChecker";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("device-info-checker");
const tool = TOOLS.find((t) => t.slug === "device-info-checker")!;

const howToSteps = [
  "Open the page — <strong>device information is gathered automatically</strong> from your browser's built-in APIs without any input required.",
  "Review the <strong>Browser</strong>, <strong>OS</strong>, <strong>Hardware</strong>, and <strong>Display</strong> sections for a full profile of your device.",
  "Use the <strong>copy button</strong> next to any row to copy that specific value to your clipboard.",
  "All data is read <strong>entirely client-side</strong> and never sent to any server.",
];

const faqs = [
  {
    question: "How is browser and OS information detected?",
    answer:
      "Information is detected from your browser's built-in device reporting capabilities. The <strong>browser name and version</strong>, <strong>operating system</strong>, and <strong>device type</strong> are identified from data your browser already shares when visiting any website.",
  },
  {
    question: "Why might memory and CPU core counts be approximate?",
    answer:
      "Browsers intentionally <strong>round and cap hardware values</strong> for privacy. Memory is reported in rounded increments (e.g. 2, 4, 8 GB) and CPU core counts may be capped at a maximum value to reduce the uniqueness of your device fingerprint.",
  },
  {
    question: "What is the Connection Type field?",
    answer:
      "The <strong>Connection Type</strong> reports your effective network connection — such as 4g, wifi, or cellular — when supported by your browser. Not all browsers implement network information reporting; 'Unknown' is shown when the data is unavailable.",
  },
  {
    question: "Is any data sent to a server?",
    answer:
      "No. All values are read from your browser's APIs directly in your browser. <strong>Nothing is transmitted</strong> to any server. The tool does not make any external network calls when reading device info.",
  },
  {
    question: "Why are some fields shown as 'Unknown'?",
    answer:
      "Some device properties are not available in all browsers. Fields like connection type, touch support, or certain hardware details may show '<strong>Unknown</strong>' when the browser does not expose that data through standard APIs.",
  },
  {
    question: "What is the Device Pixel Ratio?",
    answer:
      "The <strong>Device Pixel Ratio (DPR)</strong> is the ratio of physical screen pixels to CSS logical pixels. A DPR of 2× means one CSS pixel covers a 2×2 block of physical pixels, as seen on most modern phones and Retina displays. It determines how sharp images and text appear on high-resolution screens.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Does Device Info Checker Show?",
    content: `<p>This tool reads information about your device, browser, operating system, and display from your browser's built-in APIs and presents it in a clear, organised format. It covers <strong>browser name and version</strong>, <strong>operating system</strong>, <strong>CPU core count</strong>, <strong>available memory</strong>, <strong>screen resolution</strong>, <strong>device pixel ratio</strong>, and <strong>network connection type</strong>.</p><p>All data is collected locally in your browser — the same information that any website you visit already has access to as part of normal browser operation.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Technical support:</strong> Quickly gather your browser and OS details to share with a support team when reporting an issue.</li><li><strong>Web development:</strong> Verify how a browser reports its version, screen resolution, and pixel ratio for responsive design testing.</li><li><strong>Compatibility checks:</strong> Check whether your browser is up to date and what hardware capabilities it reports.</li><li><strong>Privacy awareness:</strong> See what device information is automatically available to any website you visit.</li></ul>`,
  },
];

export default function DeviceInfoCheckerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <DeviceInfoChecker />
    </ToolContainer>
  );
}
