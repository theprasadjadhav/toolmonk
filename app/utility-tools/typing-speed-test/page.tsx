import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { TypingSpeedTest } from "@/components/tools/utility-tools/TypingSpeedTest";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("typing-speed-test");
const tool = TOOLS.find((t) => t.slug === "typing-speed-test" && t.category === "utility-tools")!;

const howToSteps = [
  "Choose your <strong>duration</strong> (15 s, 30 s, 60 s, or 120 s) and <strong>difficulty</strong> (Easy, Medium, or Hard). Optionally enable <strong>@ punctuation</strong> to practice commas and sentence endings, or <strong># numbers</strong> to include figures inline.",
  "Start typing immediately — no click needed. The timer begins the moment you press your first key.",
  "Type the passage as accurately and quickly as you can. Correct characters turn bright, mistakes highlight in red. The large countdown and live WPM update in real time.",
  "When the timer ends (or you finish the passage) your <strong>WPM, accuracy, raw WPM, and grade</strong> appear instantly. Hit <strong>Try Again</strong> to retest the same passage or <strong>New Test</strong> for a fresh one.",
];

const faqs = [
  {
    question: "What does WPM mean and how is it calculated?",
    answer:
      "<strong>WPM (words per minute)</strong> is the standard measure of typing speed. One 'word' is defined as five keystrokes — spaces included — so the formula is: <code>(correct characters ÷ 5) ÷ minutes elapsed</code>. Using a fixed five-character unit makes comparisons fair regardless of whether you type short or long words. Only correctly typed characters count toward your WPM score.",
  },
  {
    question: "What is the difference between WPM and Raw WPM?",
    answer:
      "<strong>Raw WPM</strong> counts every keystroke regardless of correctness — it shows your peak theoretical speed. <strong>WPM</strong> (corrected) only counts characters you typed right. The gap between the two tells you exactly how much your errors are costing you. Closing that gap by reducing mistakes usually raises your effective score more than typing faster.",
  },
  {
    question: "How do the difficulty levels differ?",
    answer:
      "All three levels use a proportional <strong>blend of vocabulary tiers</strong>, not a single word pool. <strong>Easy</strong> is ~72% common short words (the, and, a, in) with ~28% medium words — feels like casual reading. <strong>Medium</strong> mixes ~22% common, ~58% prose vocabulary, and ~20% complex words — professional writing. <strong>Hard</strong> uses ~10% common, ~22% prose, and ~68% technical terms — dense, like engineering documentation, but common glue words keep it typeable.",
  },
  {
    question: "What do the @ punctuation and # numbers options do?",
    answer:
      "<strong>@ punctuation</strong> restructures the passage into real sentences: the first word is capitalised, commas appear before conjunctions (and, but, because, however…), and each sentence closes with a period, question mark, or exclamation mark — exactly how punctuation appears in real documents. <strong># numbers</strong> inserts contextual figures (round counts, percentages like 50%, decimals like 3.14, years like 2024) at natural intervals. Both options regenerate the passage immediately when toggled.",
  },
  {
    question: "What is a good typing speed?",
    answer:
      "The average adult types at <strong>40–50 WPM</strong>. Professional typists typically reach <strong>70–90 WPM</strong>, and competitive speed typists regularly exceed <strong>120 WPM</strong>. For most office and knowledge-work roles, 60 WPM with 95%+ accuracy is a solid target. This tool grades results S (≥100 WPM, ≥95% accuracy), A (≥80 / ≥90%), B (≥60 / ≥85%), C (≥40%), and D below that.",
  },
  {
    question: "Can I use this on mobile?",
    answer:
      "Yes — tap anywhere on the passage area to bring up the on-screen keyboard, then start typing. The tool is fully responsive: the stats bar switches to a two-column layout on small screens and the passage text scales down for readability. On-screen keyboards are naturally slower than physical ones, so lower mobile scores are expected.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "How WPM Is Calculated",
    content: `<p><strong>WPM (words per minute)</strong> is the universal standard for measuring typing speed. Rather than counting actual words, one 'word' is defined as five keystrokes — including spaces — so the formula is:</p>
<p><code>WPM = (correct characters ÷ 5) ÷ minutes</code></p>
<p>Using a fixed five-character unit makes the metric language-agnostic and consistent across different texts and difficulty levels. <strong>Only correct keystrokes</strong> contribute to your WPM, so accuracy directly affects your score. The tool also shows <strong>Raw WPM</strong> — the speed you would have if every keystroke were correct — letting you see exactly how much errors are dragging down your effective score.</p>`,
  },
  {
    title: "How Difficulty and Passage Generation Work",
    content: `<p>Each passage is assembled from three vocabulary tiers: <strong>common glue words</strong> (the, and, a, in…), <strong>everyday prose words</strong> (practice, between, because, result…), and <strong>complex technical terms</strong> (asynchronous, infrastructure, cryptographic…). The difficulty setting shifts the proportion:</p>
<ul>
<li><strong>Easy</strong> — 72% common / 28% prose / 0% technical: reads like everyday conversation.</li>
<li><strong>Medium</strong> — 22% common / 58% prose / 20% technical: reads like a professional article.</li>
<li><strong>Hard</strong> — 10% common / 22% prose / 68% technical: reads like engineering documentation.</li>
</ul>
<p>Even Hard passages include common glue words between the technical terms, because that is how real technical writing works. Enabling <strong>@ punctuation</strong> builds genuine sentence structure — capitalised first words, commas before conjunctions, and sentence-ending punctuation — rather than scattering marks randomly. Enabling <strong># numbers</strong> inserts figures (percentages, decimals, years, round counts) at natural intervals.</p>`,
  },
  {
    title: "Tips to Improve Your Typing Speed",
    content: `<ul>
<li><strong>Fix accuracy before chasing speed.</strong> The WPM formula only counts correct characters, so a 95% accurate typist at 60 WPM outscores a 80% accurate typist at 70 WPM. Practise at a comfortable pace until errors are rare, then gradually push faster.</li>
<li><strong>Learn touch typing.</strong> Assigning each finger a fixed home-row zone and never looking at the keyboard is the single biggest speed unlock. Two-finger typists hit a hard ceiling around 40–50 WPM; ten-finger technique removes it entirely.</li>
<li><strong>Use all difficulty levels.</strong> Easy builds rhythm and confidence with common words. Medium develops fluency with prose vocabulary. Hard with punctuation and numbers enabled is the closest simulation to real-world typing in documents, emails, and code.</li>
<li><strong>Compare WPM to Raw WPM.</strong> A large gap means errors are your bottleneck — slow down slightly. A small gap means your fingers are moving at roughly your true ceiling — push the pace.</li>
<li><strong>Short daily sessions beat long occasional ones.</strong> Ten to fifteen minutes of focused practice every day builds muscle memory faster than an hour once a week.</li>
</ul>`,
  },
];

export default function TypingSpeedTestPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <TypingSpeedTest />
    </ToolContainer>
  );
}
