"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, textareaCls } from "@/lib/utils/formStyles";
import { CopyButton } from "@/components/ui/CopyButton";

export function UrlDecoder() {
  const [input, setInput]   = useState("");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      return { output: decodeURIComponent(input.trim()), error: "" };
    } catch {
      try {
        return { output: decodeURI(input.trim()), error: "" };
      } catch {
        return { output: "", error: "Invalid percent-encoded string" };
      }
    }
  }, [input]);

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
        <label className={labelCls}>— encoded input</label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setCopied(false); }}
          placeholder="Paste a percent-encoded URL or string…"
          rows={4}
          className={cn(textareaCls, error && "border-red-500/40")}
        />
        {error && (
          <p className="font-mono text-[10px] text-red-500/70 mt-1">{error}</p>
        )}
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>— decoded output</label>
          {output && (
            <CopyButton copied={copied} onClick={handleCopy} className="py-1" />
          )}
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Decoded result will appear here…"
          rows={4}
          className={cn(textareaCls, "text-foreground/80 cursor-default")}
        />
        {input.trim() && output && (
          <p className="font-mono text-[10px] text-foreground-muted/40 mt-1">
            {input.trim().length} → {output.length} characters
          </p>
        )}
      </div>

    </div>
  );
}
