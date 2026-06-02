"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, textareaCls } from "@/lib/utils/formStyles";
import { CopyButton } from "@/components/ui/CopyButton";

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

export function RemoveDuplicateLines() {
  const [input, setInput]         = useState("");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimLines, setTrimLines]   = useState(true);
  const [copied, setCopied]         = useState(false);

  const result = useMemo(() => {
    if (!input) return { output: "", removed: 0, kept: 0 };
    const lines = input.split("\n");
    const seen  = new Set<string>();
    const kept: string[] = [];
    let removed = 0;

    for (const line of lines) {
      const processed = trimLines ? line.trim() : line;
      const key = ignoreCase ? processed.toLowerCase() : processed;
      if (seen.has(key)) {
        removed++;
      } else {
        seen.add(key);
        kept.push(processed);
      }
    }
    return { output: kept.join("\n"), removed, kept: kept.length };
  }, [input, ignoreCase, trimLines]);

  const handleCopy = useCallback(() => {
    if (!result.output) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [result.output]);

  return (
    <div className="space-y-5">

      {/* Input */}
      <div>
        <label className={labelCls}>— input lines</label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setCopied(false); }}
          placeholder="Paste your text here — duplicates will be removed…"
          rows={6}
          className={textareaCls}
        />
        {input && (
          <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">
            {input.split("\n").length} lines total
          </p>
        )}
      </div>

      {/* Options */}
      <div>
        <label className={labelCls}>— options</label>
        <div className="flex flex-wrap gap-2">
          <Toggle label="Case-insensitive" checked={ignoreCase} onChange={() => setIgnoreCase((v) => !v)} />
          <Toggle label="Trim whitespace"  checked={trimLines}  onChange={() => setTrimLines((v) => !v)}  />
        </div>
      </div>

      {/* Stats */}
      {input.trim() && (
        <div className="border border-border divide-y divide-border">
          {[
            { label: "Lines kept",    value: result.kept },
            { label: "Duplicates removed", value: result.removed },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center bg-surface">
              <span className="font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 w-44 shrink-0 border-r border-border text-foreground-muted/80">
                {label}
              </span>
              <span className="font-mono text-sm px-4 py-2.5 flex-1 text-foreground/80">
                {value.toLocaleString("en-US")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>— unique lines</label>
          {result.output && (
            <CopyButton copied={copied} onClick={handleCopy} className="py-1" />
          )}
        </div>
        <textarea
          readOnly
          value={result.output}
          placeholder="Deduplicated result will appear here…"
          rows={6}
          className={cn(textareaCls, "text-foreground/80 cursor-default")}
        />
      </div>

    </div>
  );
}
