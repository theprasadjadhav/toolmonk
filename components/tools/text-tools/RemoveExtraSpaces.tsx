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

export function RemoveExtraSpaces() {
  const [input, setInput]             = useState("");
  const [collapseSpaces, setCollapse] = useState(true);
  const [trimLines, setTrimLines]     = useState(true);
  const [removeBlankLines, setRBL]    = useState(false);
  const [copied, setCopied]           = useState(false);

  const output = useMemo(() => {
    if (!input) return "";
    const result = input;
    const lines = result.split("\n").map((line) => {
      let l = line;
      if (trimLines)     l = l.trim();
      if (collapseSpaces) l = l.replace(/[ \t]+/g, " ");
      return l;
    });
    const filtered = removeBlankLines ? lines.filter((l) => l.trim().length > 0) : lines;
    return filtered.join("\n");
  }, [input, collapseSpaces, trimLines, removeBlankLines]);

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
          placeholder="Paste text with extra spaces, tabs, or blank lines…"
          rows={6}
          className={textareaCls}
        />
      </div>

      {/* Options */}
      <div>
        <label className={labelCls}>— clean up options</label>
        <div className="flex flex-wrap gap-2">
          <Toggle label="Collapse spaces"      checked={collapseSpaces} onChange={() => setCollapse((v) => !v)} />
          <Toggle label="Trim line edges"       checked={trimLines}      onChange={() => setTrimLines((v) => !v)} />
          <Toggle label="Remove blank lines"    checked={removeBlankLines} onChange={() => setRBL((v) => !v)}   />
        </div>
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>— cleaned result</label>
          {output && (
            <CopyButton copied={copied} onClick={handleCopy} className="py-1" />
          )}
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Cleaned text will appear here…"
          rows={6}
          className={cn(textareaCls, "text-foreground/80 cursor-default")}
        />
        {input && output && (
          <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">
            {input.length} → {output.length} characters
            {input.length - output.length > 0 && ` (−${(input.length - output.length).toLocaleString("en-US")} removed)`}
          </p>
        )}
      </div>

    </div>
  );
}
