import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { InternetSpeedTest } from "@/components/tools/utility-tools/InternetSpeedTest";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("internet-speed-test");
const tool = TOOLS.find((t) => t.slug === "internet-speed-test")!;

const howToSteps = [
  "Click <strong>Start Speed Test</strong> to begin — no setup, plug-ins, or accounts required.",
  "The test runs automatically, measuring <strong>latency</strong> first, then <strong>download</strong> and <strong>upload speed</strong> in sequence.",
  "<strong>Results update live</strong> as each measurement phase completes — you can see progress in real time.",
  "Click <strong>Test Again</strong> to run a fresh measurement and compare results across different times of day or network conditions.",
];

const faqs = [
  {
    question: "How is download speed measured?",
    answer:
      "The test downloads data from nearby servers and measures the transfer rate. <strong>Bandwidth is reported at the 90th percentile</strong> of measured points to give a realistic sustained speed rather than a momentary peak burst.",
  },
  {
    question: "What is latency (ping)?",
    answer:
      "<strong>Latency</strong> is the round-trip time for a small request to reach the server and return. It is measured before any data transfer as 'unloaded latency'. Lower is better — values under <strong>20ms are excellent</strong>, under 80ms are good, and above 150ms may be noticeable in real-time applications.",
  },
  {
    question: "What is jitter?",
    answer:
      "<strong>Jitter</strong> measures the variation in latency between successive requests. High jitter (above 20ms) causes stuttering in video calls and online games even when the average latency is otherwise acceptable.",
  },
  {
    question: "What does packet loss mean?",
    answer:
      "<strong>Packet loss</strong> is the percentage of data packets that fail to reach their destination. Any packet loss above 0% is noticeable in real-time applications. Values above 1% significantly degrade connection quality for video calls and gaming.",
  },
  {
    question: "Why might my results differ from other speed tests?",
    answer:
      "Speed tests measure your connection to a <strong>specific server location</strong>. Your ISP may route traffic differently to different networks, so results can vary. Time of day, network congestion, and the number of devices sharing your connection also affect results.",
  },
  {
    question: "What is a good internet speed?",
    answer:
      "For <strong>general browsing and streaming</strong>, 25 Mbps download is sufficient. For <strong>4K streaming and video calls</strong>, 50–100 Mbps is recommended. For households with multiple users all streaming and gaming simultaneously, <strong>200+ Mbps</strong> ensures everyone has a smooth experience.",
  },
  {
    question: "Why is my upload speed lower than download?",
    answer:
      "Most home internet connections are <strong>asymmetric</strong> — they provide much faster download speeds than upload speeds. This is because typical household internet usage involves downloading far more data (videos, pages, files) than uploading. Symmetric connections with equal upload and download speeds are more common on business plans.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is an Internet Speed Test?",
    content: `<p>An internet speed test measures the <strong>performance of your current connection</strong> to the internet. It reports three key metrics: <strong>download speed</strong> (how fast data arrives at your device), <strong>upload speed</strong> (how fast your device sends data out), and <strong>latency</strong> (the round-trip delay between your device and the server).</p><p>These measurements reflect your connection quality at that moment in time. Results can vary depending on network congestion, the number of active devices on your connection, and proximity to the test server.</p>`,
  },
  {
    title: "Understanding Your Results",
    content: `<p><strong>Download speed</strong> is most relevant for streaming, browsing, and downloading files. <strong>Upload speed</strong> matters most for video calls, live streaming, and sending large files. <strong>Latency (ping)</strong> is critical for real-time applications — online gaming and video conferencing are far more sensitive to high latency than to lower download speed.</p><p><strong>Jitter</strong> — the variation in latency — causes choppy video calls and stuttering in games even when average ping is acceptable. Aim for jitter below 20ms for smooth real-time performance.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Troubleshooting slow connections:</strong> Run a speed test to determine whether slow performance is a network issue or a problem with a specific service.</li><li><strong>ISP verification:</strong> Check whether you are receiving the speeds your internet plan promises, especially after installation or service changes.</li><li><strong>Remote work setup:</strong> Verify that upload speed and latency meet the requirements for video conferencing and cloud-based work.</li><li><strong>Before and after comparisons:</strong> Test before and after changing routers, cables, or ISP plans to measure the real impact of the change.</li></ul>`,
  },
];

export default function InternetSpeedTestPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <InternetSpeedTest />
    </ToolContainer>
  );
}
