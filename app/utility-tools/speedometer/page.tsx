import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { Speedometer } from "@/components/tools/utility-tools/Speedometer";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("speedometer");
const tool = TOOLS.find((t) => t.slug === "speedometer")!;

const howToSteps = [
  "Click <strong>Start GPS</strong> and allow <strong>location permission</strong> when prompted by your browser — this is required to calculate speed from position changes.",
  "Move your device — the <strong>needle and speed readout</strong> update in real time as your speed changes.",
  "Toggle between <strong>km/h and mph</strong> using the unit buttons to display speed in your preferred unit.",
  "<strong>Maximum speed</strong> for the current session is tracked automatically and displayed alongside the live reading.",
  "Click <strong>Stop GPS</strong> to end the session and stop battery usage when you are finished.",
];

const faqs = [
  {
    question: "Why does it show 0 when I'm stationary?",
    answer:
      "GPS speed is derived from <strong>position changes over time</strong>. When you are not moving, the speed is correctly reported as 0. Small non-zero values while stationary are <strong>GPS noise</strong> caused by minor satellite signal fluctuations and are normal.",
  },
  {
    question: "How accurate is the GPS speed?",
    answer:
      "Most modern devices report GPS speed accurate to within <strong>0.2–0.5 km/h</strong> when moving in a straight line in open air. Accuracy degrades in tunnels, indoors, or near tall buildings where satellite signals are weak. The <strong>Accuracy</strong> field shows the current position accuracy in metres.",
  },
  {
    question: "Does this work indoors?",
    answer:
      "GPS requires <strong>clear sky visibility</strong> for the best signal. Indoors, the device may lose satellite lock entirely and report unavailable or inaccurate readings. For reliable vehicle speed measurement, keep your device near a window with sky visibility.",
  },
  {
    question: "Why is location permission required?",
    answer:
      "Speed is calculated from <strong>GPS position data</strong>, which browsers access through the Geolocation API. This API requires explicit user permission. Your location data is processed entirely in your browser and <strong>never sent to any server</strong>.",
  },
  {
    question: "Does the speedometer drain battery faster?",
    answer:
      "GPS is one of the most <strong>battery-intensive</strong> features on a mobile device. Using this tool for extended periods will consume battery power faster than normal. Always click <strong>Stop GPS</strong> when you are done to release the GPS lock and preserve battery life.",
  },
  {
    question: "Can I use this in a car?",
    answer:
      "Yes — this tool can display your current vehicle speed when your phone has a clear GPS signal. However, it is intended for reference only. <strong>Never interact with your phone while driving</strong>. Mount your device securely and view the reading only when stationary.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a GPS Speedometer?",
    content: `<p>A GPS speedometer uses your device's built-in location sensor to calculate your current speed based on how quickly your position changes over time. Unlike a vehicle's mechanical or electronic speedometer, which reads from the wheel or drive shaft, a <strong>GPS-based speed reading</strong> is derived from satellite positioning and is accurate regardless of vehicle type.</p><p>This tool uses your browser's <strong>Geolocation API</strong> to access GPS data with your permission. Speed is calculated in real time and displayed as a live needle readout with a running maximum for the session.</p>`,
  },
  {
    title: "Common Use Cases",
    content: `<ul><li><strong>Cycling and running:</strong> Track your current pace and top speed during outdoor exercise without a dedicated sports device.</li><li><strong>Vehicle reference:</strong> Use as a secondary speed reference when your vehicle's speedometer needs calibration verification.</li><li><strong>Hiking:</strong> Monitor walking speed on trails to estimate time to destination based on current pace.</li><li><strong>Watercraft:</strong> Track speed on boats and kayaks where a GPS-based reading is more practical than a mechanical speedo.</li></ul>`,
  },
];

export default function SpeedometerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <Speedometer />
    </ToolContainer>
  );
}
