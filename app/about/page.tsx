import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ToolMonk — Free Online Tools for Everyone",
  description:
    "ToolMonk is a free utility suite offering 210+ online tools for developers, designers, students, and professionals. Includes online compilers, comparators, calculators, converters, and more. No signup required.",
  alternates: { canonical: "https://toolmonk.net/about" },
};

const SERVER_TOOLS = [
  {
    name: "Online Compilers",
    path: "/compilers/code",
    reason:
      "Code execution requires a server. The code you write is sent to a secure isolated sandbox, executed, and the output is returned to you. Your code is discarded immediately — it is never stored, logged, or read by anyone.",
  },
  {
    name: "File Converter",
    path: "/dev-tools/file-converter",
    reason:
      "Document conversion requires server processing. Your file is sent securely, converted, and deleted from our server immediately once the result is returned to you.",
  },
  {
    name: "Domain Age Checker",
    path: "/seo-tools/domain-age-checker",
    reason:
      "Looks up domain registration information via a public registry. Only the domain name you enter is sent — no personal data, no file upload. Nothing is stored.",
  },
  {
    name: "PDF Lock",
    path: "/pdf-tools/pdf-lock",
    reason:
      "Password-protecting a PDF requires server processing. Your file is sent securely, encrypted, and deleted from our server immediately once the protected PDF is returned.",
  },
  {
    name: "PDF Unlock",
    path: "/pdf-tools/pdf-unlock",
    reason:
      "Removing PDF password protection requires server processing. Your file is sent securely, processed, and deleted from our server immediately once the unlocked PDF is returned.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border py-4 px-4">
        <div className="mx-auto w-full max-w-7xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-foreground-muted">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  home
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-border select-none">/</span>
                <span className="text-foreground font-medium" aria-current="page">
                  about
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-6">
          — About
        </p>
        <h1 className="text-2xl font-mono text-foreground mb-12">
          About ToolMonk
        </h1>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Mission</h2>
        <p className="text-foreground-muted leading-relaxed">
          ToolMonk is built on one simple belief: useful tools should be free, fast, and accessible
          to everyone. No paywalls, no accounts, no tracking.
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">What we offer</h2>
        <p className="text-foreground-muted leading-relaxed">
          210+ tools across 12 categories — calculators, converters, developer utilities, generators,
          design tools, SEO tools, PDF tools, text tools, date &amp; time tools, image tools,{" "}
          <Link href="/comparators" className="text-foreground hover:text-primary transition-colors">comparators</Link>{" "}
          for diffing and comparing code or text side-by-side, and{" "}
          <Link href="/compilers/code" className="text-foreground hover:text-primary transition-colors">online compilers</Link>{" "}
          that let you write and run code in 11 languages directly in your browser.
          The vast majority run entirely in your browser with zero server involvement.
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">How tools work</h2>
        <p className="text-foreground-muted leading-relaxed mb-6">
          <strong className="text-foreground font-mono">Almost every tool is fully browser-based.</strong>{" "}
          Your input — text, numbers, images, files — never leaves your device. Everything happens
          directly in your browser with no upload and no server involved.
        </p>

        {/* Server-processed exceptions */}
        <div className="border border-border p-5 space-y-4">
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-foreground-muted">
            — tools that contact our server (5 exceptions)
          </p>
          <p className="text-sm text-foreground-muted leading-relaxed">
            A small number of tools need to send your data to our server because the operation
            cannot be performed in a browser. In every case, your data is{" "}
            <strong className="text-foreground">deleted immediately</strong> after the result is
            returned. We do not store, log, or inspect any uploaded content.
          </p>
          <ul className="space-y-4 pt-1">
            {SERVER_TOOLS.map(({ name, path, reason }) => (
              <li key={path} className="flex gap-4">
                <span className="font-mono text-primary mt-0.5 shrink-0 text-[11px]">—</span>
                <div>
                  <Link
                    href={path}
                    className="font-mono text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {name}
                  </Link>
                  <p className="text-sm text-foreground-muted leading-relaxed mt-1">{reason}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Our principles</h2>
        <ul className="space-y-4">
          {[
            {
              label: "Privacy first",
              body: "No user data is stored. For browser-based tools, your inputs never leave your device. For server-processed tools, files are deleted immediately after conversion.",
            },
            {
              label: "Zero friction",
              body: "No signup, no limits. Open a tool and start using it immediately.",
            },
            {
              label: "Always free",
              body: "There is no premium tier. Every tool is free for everyone, forever.",
            },
            {
              label: "Fast",
              body: "Browser-based tools produce results instantly — there is no waiting for a server response.",
            },
          ].map(({ label, body }) => (
            <li key={label} className="flex gap-4">
              <span className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase mt-1 shrink-0 w-28">
                {label}
              </span>
              <p className="text-foreground-muted leading-relaxed">{body}</p>
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Contact</h2>
        <p className="text-foreground-muted leading-relaxed">
          Have a suggestion or found a bug? We&apos;d love to hear from you. Reach out at{" "}
          <a
            href="mailto:hello@toolmonk.net"
            className="text-foreground hover:text-primary transition-colors font-mono text-sm"
          >
            hello@toolmonk.net
          </a>
          .
        </p>
      </div>
    </div>
  );
}
