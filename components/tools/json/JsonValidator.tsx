"use client";

import { useState } from "react";
import { parseJSON } from "@/lib/utils/json";
import { CodeEditor } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export function JsonValidator() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const result = input.trim() ? parseJSON(input) : null;

  const copy = async () => {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => setInput("");

  const handleUpload = async () => {
    const c = await uploadText(".json");
    if (c !== null) setInput(c);
  };

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarButton icon={<Icons.Copy />} label="copy" feedback="copied!" showFeedback={copied} onClick={copy} disabled={!input} />
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {/* Status */}
      <div className="shrink-0">
        {result === null && (
          <div className="px-4 py-3 bg-surface border border-border">
            <p className="font-mono text-xs text-foreground-muted">paste JSON below to validate</p>
          </div>
        )}
        {result?.ok === true && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20">
            <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-mono text-sm text-green-400">valid json</span>
            <span className="font-mono text-[10px] text-foreground-muted ml-auto uppercase tracking-wider">
              {typeof result.value === "object" && result.value !== null
                ? Array.isArray(result.value)
                  ? `array · ${(result.value as unknown[]).length} items`
                  : `object · ${Object.keys(result.value as object).length} keys`
                : typeof result.value}
            </span>
          </div>
        )}
        {result?.ok === false && (
          <ErrorBanner error={result.error} label="invalid json" withIcon />
        )}
      </div>

      {/* Input */}
      <div className={cn(fullscreen ? "flex flex-col gap-2 flex-1 min-h-0" : "space-y-2")}>
        <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload JSON" onClick={handleUpload} />}>— input</PanelLabel>
        <CodeEditor value={input} onChange={setInput} placeholder='{ "validate": "your JSON here" }'
          className={fullscreen ? "flex-1 min-h-0" : "h-96"} language="json" />
      </div>
    </div>
  );
}
