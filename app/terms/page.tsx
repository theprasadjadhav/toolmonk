import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — ToolMonk",
  description: "ToolMonk terms of service. Free to use, no warranty.",
  alternates: { canonical: "https://toolmonk.net/terms" },
};

export default function TermsPage() {
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
                  terms
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-6">
          — Legal
        </p>
        <h1 className="text-2xl font-mono text-foreground mb-3">Terms of Service</h1>
        <p className="font-mono text-[11px] tracking-wider text-foreground-muted mb-12">
          Last updated April 2026
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Use of service</h2>
        <p className="text-foreground-muted leading-relaxed">
          ToolMonk is free to use for personal and commercial purposes. No account or registration
          is required.
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">How your data is handled</h2>
        <p className="text-foreground-muted leading-relaxed mb-5">
          Most tools work entirely within your browser — your input never leaves your device. A
          small number of tools (File Converter, PDF Lock, PDF Unlock, Domain Age Checker) need
          to send data to our server to complete their operation. By using those tools you agree
          to your input being sent to our server. The following commitments apply:
        </p>
        <ul className="space-y-2.5 text-foreground-muted">
          {[
            "Uploaded files are deleted from our server immediately after the result is returned to you.",
            "We do not read, store, or share the contents of any uploaded file or input.",
            "No tool input or output is saved to any database.",
            "All data is transmitted securely.",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed">
              <span className="font-mono text-primary shrink-0 mt-0.5">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">No warranty</h2>
        <p className="text-foreground-muted leading-relaxed">
          Tools are provided &ldquo;as is&rdquo; without warranty of any kind. We do not guarantee
          the accuracy of calculations or outputs. Always verify critical results independently
          before acting on them.
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Prohibited use</h2>
        <p className="text-foreground-muted leading-relaxed mb-4">
          You may not use ToolMonk to:
        </p>
        <ul className="space-y-2 text-foreground-muted leading-relaxed">
          {[
            "Process or distribute illegal content.",
            "Attempt to hack, reverse-engineer, or disrupt the service.",
            "Scrape the site in ways that degrade performance for other users.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="text-border select-none font-mono mt-0.5">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Intellectual property</h2>
        <p className="text-foreground-muted leading-relaxed">
          ToolMonk&apos;s code and content are proprietary. Tool outputs — generated passwords,
          calculations, formatted text, converted files, and similar results — are yours to use
          freely with no restrictions.
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Limitation of liability</h2>
        <p className="text-foreground-muted leading-relaxed">
          ToolMonk is not liable for any direct, indirect, incidental, or consequential damages
          arising from your use of or inability to use the service.
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Changes</h2>
        <p className="text-foreground-muted leading-relaxed">
          We may modify these terms at any time. Continued use of ToolMonk after changes are posted
          constitutes acceptance of the updated terms.
        </p>

        <h2 className="text-lg font-mono text-foreground mt-10 mb-4">Contact</h2>
        <p className="text-foreground-muted leading-relaxed">
          Legal questions? Contact us at{" "}
          <a
            href="mailto:legal@toolmonk.net"
            className="text-foreground hover:text-primary transition-colors font-mono text-sm"
          >
            legal@toolmonk.net
          </a>
          .
        </p>
      </div>
    </div>
  );
}
