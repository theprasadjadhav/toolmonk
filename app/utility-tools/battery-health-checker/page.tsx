import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { BatteryHealthChecker } from "@/components/tools/utility-tools/BatteryHealthChecker";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("battery-health-checker");
const tool = TOOLS.find((t) => t.slug === "battery-health-checker")!;

const howToSteps = [
  "Open the page — <strong>battery status loads automatically</strong> if your browser supports the Battery Status API.",
  "The <strong>battery bar</strong> shows your current charge level with color-coded feedback: green for healthy charge, yellow for moderate, and red for low.",
  "<strong>Time to Full Charge</strong> is displayed when your device is plugged in; <strong>Time Remaining</strong> is shown when running on battery.",
  "Readings <strong>update automatically in real time</strong> as your battery level or charging status changes — no need to refresh.",
];

const faqs = [
  {
    question: "Which browsers support the Battery API?",
    answer:
      "The Battery Status API is currently supported in <strong>Chrome, Edge, Opera</strong>, and other Chromium-based browsers. Firefox removed support citing privacy concerns. Safari does not support it. On unsupported browsers, a clear message is shown with instructions to try a supported browser.",
  },
  {
    question: "Why is Time Remaining shown as '—'?",
    answer:
      "Some operating systems and battery drivers do not provide <strong>discharge time estimates</strong> to the browser, even when the Battery API is supported. Charging time may also show '—' immediately after plugging in before the OS computes a reliable estimate.",
  },
  {
    question: "Does this tool affect battery life?",
    answer:
      "No. The Battery Status API uses a <strong>passive event listener</strong> — the page only reacts to battery events triggered by the operating system. There is no active polling running in the background.",
  },
  {
    question: "Can this detect battery health or wear level?",
    answer:
      "No. The Battery Status API only exposes the current <strong>charge level</strong>, charging state, and estimated times. Capacity wear, cycle count, and health percentage require OS-level diagnostic tools or manufacturer utilities and are not accessible from a browser.",
  },
  {
    question: "Why does my battery percentage seem slightly off?",
    answer:
      "The percentage shown is exactly what the <strong>operating system reports</strong> to the browser. If it differs from your device's system battery indicator, the OS may be applying its own rounding or calibration. The tool does not estimate or modify the reported value.",
  },
  {
    question: "Is my battery data sent anywhere?",
    answer:
      "No. All battery readings are retrieved directly from your browser's built-in API and displayed <strong>entirely in your browser</strong>. Nothing is transmitted to any server.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Does This Tool Check?",
    content: `<p>This tool reads your device's battery status directly from your browser and displays it in a clear, visual format. It shows your current <strong>charge percentage</strong>, whether the device is charging or on battery, and estimated time remaining or time to full charge.</p><p>The data is sourced from the <strong>Battery Status API</strong>, which your operating system exposes to supported browsers. Results update automatically as your battery state changes — no manual refresh needed.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Quick status check:</strong> Get a clear, large-display view of your battery level without navigating your device's settings.</li><li><strong>Charging monitoring:</strong> Keep this page open while charging to see the estimated time to full charge update in real time.</li><li><strong>Device testing:</strong> Verify that the Battery Status API is working correctly in a specific browser during web application development.</li><li><strong>Multiple devices:</strong> Open the tool on different devices to compare battery readings side by side.</li></ul>`,
  },
];

export default function BatteryHealthCheckerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <BatteryHealthChecker />
    </ToolContainer>
  );
}
