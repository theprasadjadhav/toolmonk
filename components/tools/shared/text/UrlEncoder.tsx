"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, textareaCls } from "@/lib/utils/formStyles";
import { CopyButton } from "@/components/ui/CopyButton";

type EncodeMode = "component" | "full";

export function UrlEncoder() {
  const [input, setInput] = useState("");
  const [mode, setMode]   = useState<EncodeMode>("component");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input) return "";
    try {
      return mode === "component"
        ? encodeURIComponent(input)
        : encodeURI(input);
    } catch {
      return "";
    }
  }, [input, mode]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const MODES: { key: EncodeMode; label: string; desc: string }[] = [
    { key: "component", label: "Component", desc: "Encodes all chars incl. :/? — for query params & values" },
    { key: "full",      label: "Full URL",  desc: "Preserves :// ? & = # — for encoding a complete URL" },
  ];

  return (
    <div className="space-y-5">

      {/* Encode mode */}
      <div>
        <label className={labelCls}>— encoding mode</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

      {/* Input */}
      <div>
        <label className={labelCls}>— input</label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setCopied(false); }}
          placeholder="Paste a URL or text to encode…"
          rows={4}
          className={textareaCls}
        />
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>— encoded output</label>
          {output && (
            <CopyButton copied={copied} onClick={handleCopy} className="py-1" />
          )}
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Encoded result will appear here…"
          rows={4}
          className={cn(textareaCls, "text-foreground/80 cursor-default")}
        />
        {input && output && (
          <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">
            {input.length} → {output.length} characters
          </p>
        )}
      </div>

    </div>
  );
}
