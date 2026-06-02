import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("data-converter");

const tool = TOOLS.find((t) => t.slug === "data-converter")!;

const howToSteps = [
  "Type any <strong>data size value</strong> into the input field at the top of the converter.",
  "Choose your <strong>source unit</strong> from the dropdown — options include bits, bytes, kilobytes, megabytes, gigabytes, terabytes, and their binary equivalents (KiB, MiB, GiB, TiB).",
  "All other data units <strong>update instantly</strong> as you type, showing the equivalent size in every unit.",
  "Click any <strong>result row</strong> to set that value and unit as the new input for further conversions.",
  "Hover over any row and click the <strong>copy icon</strong> to copy a value to your clipboard.",
];

const faqs = [
  {
    question: "What is the difference between KB and KiB?",
    answer: "<strong>1 KB (kilobyte, SI standard)</strong> = 1,000 bytes. <strong>1 KiB (kibibyte, IEC standard)</strong> = 1,024 bytes. The distinction matters because operating systems and storage manufacturers sometimes use different definitions, which can lead to apparent discrepancies between advertised and reported storage sizes.",
  },
  {
    question: "How many bytes are in a gigabyte?",
    answer: "<strong>1 GB (SI) = 1,000,000,000 bytes</strong>. <strong>1 GiB (binary) = 1,073,741,824 bytes.</strong> Hard drive manufacturers use the SI definition, while operating systems traditionally used the binary definition — which is why a \"500 GB\" drive may show as slightly less than 500 GB in an OS.",
  },
  {
    question: "How many bits are in a byte?",
    answer: "<strong>1 byte = 8 bits.</strong> Bits are the smallest unit of digital information (a single 0 or 1). Network speeds are typically measured in <strong>bits per second</strong> (Mbps, Gbps), while file sizes use bytes.",
  },
  {
    question: "What is a terabyte?",
    answer: "<strong>1 terabyte (TB) = 1,000 gigabytes = 1,000,000,000,000 bytes</strong> (SI). A 1 TB hard drive can hold roughly 250,000 photos, 500 hours of HD video, or millions of documents.",
  },
  {
    question: "Why is my 1 TB hard drive showing less than 1 TB in Windows?",
    answer: "Hard drive manufacturers advertise capacity using the <strong>decimal (SI) definition</strong> where 1 TB = 1,000,000,000,000 bytes. Windows historically reports storage in <strong>binary gibibytes</strong>, so 1 TB appears as approximately 931 GiB. Both figures represent the same physical storage.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversions happen <strong>locally in your browser</strong> — nothing is transmitted.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About Digital Storage Measurement",
    content: `<p>Digital data is measured in <strong>bits</strong> and <strong>bytes</strong>. A bit is the smallest unit — a single binary value of 0 or 1. Eight bits make one byte, which can represent a single character of text.</p>
<p>Two parallel naming systems exist: the <strong>SI (decimal) system</strong> uses prefixes like kilo- (×1,000), mega- (×1,000,000), and giga- (×1,000,000,000). The <strong>IEC (binary) system</strong> uses kibibyte, mebibyte, and gibibyte (multiples of 1,024). The difference grows larger with each prefix level — a gibibyte is about 7% larger than a gigabyte.</p>`,
  },
  {
    title: "Common Data Size Conversions",
    content: `<ul>
<li><strong>1 byte</strong> = 8 bits</li>
<li><strong>1 KB</strong> = 1,000 bytes | <strong>1 KiB</strong> = 1,024 bytes</li>
<li><strong>1 MB</strong> = 1,000,000 bytes | <strong>1 MiB</strong> ≈ 1,048,576 bytes</li>
<li><strong>1 GB</strong> = 1,000,000,000 bytes | <strong>1 GiB</strong> ≈ 1,073,741,824 bytes</li>
<li><strong>1 TB</strong> = 1,000 GB | <strong>1 TiB</strong> ≈ 1,099.5 GB</li>
</ul>`,
  },
  {
    title: "Common Use Cases",
    content: `<p>Data size conversion is essential in many everyday scenarios:</p>
<ul>
<li><strong>Storage planning</strong> — comparing file sizes against available drive or cloud storage capacity.</li>
<li><strong>Network speed</strong> — converting between megabits per second (Mbps) and megabytes per second (MB/s) to estimate download times.</li>
<li><strong>Email and upload limits</strong> — checking whether a file meets a size limit specified in KB or MB.</li>
<li><strong>Memory sizing</strong> — understanding RAM specifications listed in GiB by hardware manufacturers.</li>
</ul>`,
  },
];

export default function DataConverterPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <UnitConverter slug="data-converter" />
    </ToolContainer>
  );
}
