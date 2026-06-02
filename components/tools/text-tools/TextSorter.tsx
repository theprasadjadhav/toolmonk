"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, textareaCls } from "@/lib/utils/formStyles";
import { CopyButton } from "@/components/ui/CopyButton";

type SortMode = "alpha-asc" | "alpha-desc" | "len-asc" | "len-desc";

const MODES: { key: SortMode; label: string }[] = [
  { key: "alpha-asc",  label: "A → Z" },
  { key: "alpha-desc", label: "Z → A" },
  { key: "len-asc",    label: "Short → Long" },
  { key: "len-desc",   label: "Long → Short" },
];

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "font-mono text-[10px] px-3 py-2 border transition-colors",
        checked
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-foreground-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function TextSorter() {
  const [input, setInput]         = useState("");
  const [mode, setMode]           = useState<SortMode>("alpha-asc");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimLines, setTrimLines]   = useState(true);
  const [copied, setCopied]         = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    let lines = input.split("\n");
    if (trimLines) lines = lines.map((l) => l.trim());

    const cmp = (a: string, b: string) => {
      const ka = ignoreCase ? a.toLowerCase() : a;
      const kb = ignoreCase ? b.toLowerCase() : b;
      return ka.localeCompare(kb);
    };

    switch (mode) {
      case "alpha-asc":  return [...lines].sort((a, b) =>  cmp(a, b)).join("\n");
      case "alpha-desc": return [...lines].sort((a, b) => -cmp(a, b)).join("\n");
      case "len-asc":    return [...lines].sort((a, b) => a.length - b.length || cmp(a, b)).join("\n");
      case "len-desc":   return [...lines].sort((a, b) => b.length - a.length || cmp(a, b)).join("\n");
    }
  }, [input, mode, ignoreCase, trimLines]);

  const lineCount = input ? input.split("\n").length : 0;

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
        <label className={labelCls}>— lines to sort</label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setCopied(false); }}
          placeholder="Paste your lines here — one item per line…"
          rows={6}
          className={textareaCls}
        />
        {lineCount > 0 && (
          <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">
            {lineCount} line{lineCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Sort mode */}
      <div>
        <label className={labelCls}>— sort order</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                "font-mono text-[11px] px-3 py-2.5 border transition-colors",
                mode === m.key
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <label className={labelCls}>— options</label>
        <div className="flex flex-wrap gap-2">
          <Toggle label="Ignore case"       checked={ignoreCase} onChange={() => setIgnoreCase((v) => !v)} />
          <Toggle label="Trim whitespace"   checked={trimLines}  onChange={() => setTrimLines((v) => !v)}  />
        </div>
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>— sorted result</label>
          {output && (
            <CopyButton copied={copied} onClick={handleCopy} className="py-1" />
          )}
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Sorted lines will appear here…"
          rows={6}
          className={cn(textareaCls, "text-foreground/80 cursor-default")}
        />
      </div>

    </div>
  );
}
