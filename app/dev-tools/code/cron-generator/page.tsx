import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { CronGenerator } from "@/components/tools/code/CronGenerator";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("cron-generator");

const tool = TOOLS.find((t) => t.slug === "cron-generator")!;

const howToSteps = [
  "Select a <strong>preset schedule</strong> (every minute, hourly, daily, weekly, monthly) to quickly start from a common pattern.",
  "Edit the <strong>cron expression</strong> directly in the input field, or use the individual field controls to adjust <strong>minute, hour, day, month, and weekday</strong> values separately.",
  "The <strong>human-readable description</strong> updates instantly as you type, so you can confirm the schedule means what you intend.",
  "The <strong>next 8 scheduled run times</strong> are shown at the bottom based on your browser's local clock — review them to verify the pattern is correct.",
  "Click <strong>copy</strong> to copy the final cron expression to your clipboard, ready to paste into your server config or scheduler.",
];

const faqs = [
  {
    question: "What is a cron expression?",
    answer:
      "A <strong>cron expression</strong> is a compact string of 5 fields separated by spaces that defines a recurring schedule: <strong>minute</strong> (0–59), <strong>hour</strong> (0–23), <strong>day of month</strong> (1–31), <strong>month</strong> (1–12), and <strong>day of week</strong> (0–6, where 0 = Sunday). Special characters include <strong>*</strong> (any value), <strong>*/n</strong> (every n units), ranges like <strong>1-5</strong>, and lists like <strong>1,3,5</strong>.",
  },
  {
    question: "What special characters are supported?",
    answer:
      "<strong>*</strong> = every value. <strong>*/n</strong> = every n units (e.g. */5 = every 5 minutes). <strong>n-m</strong> = a range (e.g. 9-17 = hours 9 through 17). <strong>n,m</strong> = a list (e.g. 1,15 = the 1st and 15th). Combinations like <strong>0-30/5</strong> (every 5 units within the range 0–30) are also supported.",
  },
  {
    question: "Which cron implementations does this support?",
    answer:
      "This tool uses <strong>standard 5-field POSIX/Unix cron syntax</strong> compatible with crontab, scheduled task runners, and most Linux cron daemons. It does not support the 6-field format that includes a seconds field.",
  },
  {
    question: "Why might the next scheduled runs look unexpected?",
    answer:
      "Cron schedules run in the <strong>server's local timezone</strong>, not the viewer's. Additionally, the <strong>day-of-month and day-of-week fields are combined with OR logic</strong> in most implementations — if either condition matches, the job runs. This tool uses your browser's local time for the next-run preview.",
  },
  {
    question: "How do I run a task every 15 minutes?",
    answer:
      "Set the <strong>minute field</strong> to <strong>*/15</strong> and all other fields to *. The resulting expression is <strong>*/15 * * * *</strong>, which runs the task at minute 0, 15, 30, and 45 of every hour.",
  },
  {
    question: "How do I schedule a task on weekdays only?",
    answer:
      "Set the <strong>day-of-week field</strong> to <strong>1-5</strong> (Monday through Friday) and leave the other fields as needed. For example, <strong>0 9 * * 1-5</strong> runs a task at 9:00 AM on every weekday.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What Is a Cron Expression?",
    content: `<p>A <strong>cron expression</strong> is a short text string used to define a recurring schedule for automated tasks. It originated in Unix-like operating systems, where a background service called <strong>cron</strong> would read these expressions and trigger jobs at the specified times — such as running a backup every night at midnight or sending a report every Monday morning.</p>
<p>The expression has five fields: <strong>minute, hour, day of month, month,</strong> and <strong>day of week</strong>. Each field can contain a specific number, a wildcard (*) meaning "every", a range, a list, or a step value. Today, cron syntax is used far beyond Unix servers — it appears in cloud schedulers, CI/CD pipelines, and task automation tools across all platforms.</p>`,
  },
  {
    title: "Common Cron Schedule Examples",
    content: `<ul>
<li><strong>* * * * *</strong> — every minute</li>
<li><strong>0 * * * *</strong> — at the start of every hour</li>
<li><strong>0 0 * * *</strong> — once daily at midnight</li>
<li><strong>0 9 * * 1-5</strong> — weekdays at 9:00 AM</li>
<li><strong>0 0 * * 0</strong> — every Sunday at midnight</li>
<li><strong>*/15 * * * *</strong> — every 15 minutes</li>
<li><strong>0 0 1 * *</strong> — first day of each month at midnight</li>
<li><strong>0 8-18 * * 1-5</strong> — every hour from 8 AM to 6 PM on weekdays</li>
</ul>
<p>Use these as a starting point and adjust the fields to match your exact requirements.</p>`,
  },
  {
    title: "Tips for Writing Reliable Schedules",
    content: `<ul>
<li><strong>Always verify the next run times:</strong> Use the preview panel to confirm the first several scheduled runs match your expectation before deploying.</li>
<li><strong>Account for timezones:</strong> Cron runs in the server's local time. If your server is in UTC but your users are elsewhere, adjust the hour field accordingly.</li>
<li><strong>Avoid scheduling at midnight on the 1st:</strong> Many systems have heavy load at <strong>0 0 1 * *</strong>. Consider offsetting by a few minutes (e.g. <strong>5 0 1 * *</strong>).</li>
<li><strong>Use step values for frequent tasks:</strong> <strong>*/5</strong> in the minute field is cleaner and more reliable than listing every fifth minute explicitly.</li>
</ul>`,
  },
];

export default function CronGeneratorPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <CronGenerator />
    </ToolContainer>
  );
}
