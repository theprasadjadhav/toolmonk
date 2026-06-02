"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, textareaCls } from "@/lib/utils/formStyles";
import { CopyButton } from "@/components/ui/CopyButton";

type ReverseMode = "chars" | "words" | "lines";

const MODES: { key: ReverseMode; label: string; desc: string }[] = [
  { key: "chars", label: "Characters", desc: "Reverse every character in the full text" },
  { key: "words", label: "Words",      desc: "Reverse the order of words" },
  { key: "lines", label: "Lines",      desc: "Reverse the order of lines" },
];

export function TextReverser() {
  const [input, setInput] = useState("");
  const [mode, setMode]   = useState<ReverseMode>("chars");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input) return "";
    switch (mode) {
      case "chars": return input.split("").reverse().join("");
      case "words": return input.split(/\s+/).reverse().join(" ");
      case "lines": return input.split("\n").reverse().join("\n");
    }
  }, [input, mode]);

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
          onChange={(e) => { setInput(e.target.value); setCopied(false); }}
          placeholder="Paste or type your text here…"
          rows={5}
          className={textareaCls}
        />
      </div>

      {/* Mode */}
      <div>
        <label className={labelCls}>— reverse by</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                "font-mono text-left px-3 py-2.5 border transition-colors",
                mode === m.key
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:text-foreground",
              )}
            >
              <span className="text-[11px] block">{m.label}</span>
              <span className="text-[10px] text-foreground-muted/50 block mt-0.5">{m.desc}</span>
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
          placeholder="Reversed text will appear here…"
          rows={5}
          className={cn(textareaCls, "text-foreground/80 cursor-default")}
        />
      </div>

    </div>
  );
}
