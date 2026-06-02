"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, textareaCls } from "@/lib/utils/formStyles";
import { CopyButton } from "@/components/ui/CopyButton";

// ── Case transforms ────────────────────────────────────────────────────────────

function toUpperCase(s: string) { return s.toUpperCase(); }
function toLowerCase(s: string) { return s.toLowerCase(); }
function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function toSentenceCase(s: string) {
  return s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}
function toCamelCase(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}
function toPascalCase(s: string) {
  const camel = toCamelCase(s);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}
function toSnakeCase(s: string) {
  return s
    .replace(/\W+/g, " ")
    .trim()
    .split(/\s+/)
    .join("_")
    .toLowerCase();
}
function toKebabCase(s: string) {
  return s
    .replace(/\W+/g, " ")
    .trim()
    .split(/\s+/)
    .join("-")
    .toLowerCase();
}

const CASES: { key: string; label: string; fn: (s: string) => string }[] = [
  { key: "upper",    label: "UPPERCASE",    fn: toUpperCase },
  { key: "lower",    label: "lowercase",    fn: toLowerCase },
  { key: "title",    label: "Title Case",   fn: toTitleCase },
  { key: "sentence", label: "Sentence case",fn: toSentenceCase },
  { key: "camel",    label: "camelCase",    fn: toCamelCase },
  { key: "pascal",   label: "PascalCase",   fn: toPascalCase },
  { key: "snake",    label: "snake_case",   fn: toSnakeCase },
  { key: "kebab",    label: "kebab-case",   fn: toKebabCase },
];

export function CaseConverter() {
  const [input, setInput] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const output = active
    ? CASES.find((c) => c.key === active)!.fn(input)
    : "";

  const handleCase = useCallback((key: string) => {
    setActive(key);
    setCopied(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div className="space-y-5">

      {/* Input */}
      <div>
        <label className={labelCls}>— input text</label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setActive(null); setCopied(false); }}
          placeholder="Paste or type your text here…"
          rows={5}
          className={textareaCls}
        />
      </div>

      {/* Case buttons */}
      <div>
        <label className={labelCls}>— convert to</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CASES.map((c) => (
            <button
              key={c.key}
              onClick={() => handleCase(c.key)}
              disabled={!input.trim()}
              className={cn(
                "font-mono text-[11px] px-3 py-2.5 border transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                active === c.key
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>— result</label>
          {output && (
            <CopyButton copied={copied} onClick={handleCopy} className="py-1" />
          )}
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Result will appear here…"
          rows={5}
          className={cn(textareaCls, "text-foreground/80 cursor-default")}
        />
      </div>

    </div>
  );
}
