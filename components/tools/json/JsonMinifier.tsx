"use client";

import { useState } from "react";
import { parseJSON, minifyJSON } from "@/lib/utils/json";
import { CodeEditor, CodeOutput } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";
import { SavingsDisplay } from "@/components/ui/SavingsDisplay";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export function JsonMinifier() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const result = input.trim() ? parseJSON(input) : null;
  const output = result?.ok ? minifyJSON(result.value) : "";

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => setInput("");

  const handleUpload = async () => {
    const content = await uploadText(".json");
    if (content !== null) setInput(content);
  };
  const handleDownload = () => { if (output) downloadText(output, "minified.json", "application/json"); };

  return (
    <div className={cn("space-y-4", fullscreen && "flex-1 min-h-0 flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {/* Status */}
      <div className="shrink-0 space-y-2">
        {result?.ok === false && (
          <ErrorBanner error={result.error} label="error" />
        )}
        <SavingsDisplay input={input} output={output} />
      </div>

      {/* Panels */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0 [grid-template-rows:1fr_1fr] lg:grid-rows-1")}>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload JSON" onClick={handleUpload} />}>— input</PanelLabel>
          <CodeEditor value={input} onChange={setInput} placeholder='{ "minify": "your JSON here" }'
            className={fullscreen ? "flex-1 min-h-0" : "h-80"} language="json" />
        </div>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<>
            <PanelButton icon={<Icons.Copy />} title={copied ? "Copied!" : "Copy"} onClick={copy} disabled={!output} active={copied} />
            <PanelButton icon={<Icons.Download />} title="Download" onClick={handleDownload} disabled={!output} />
          </>}>— minified output</PanelLabel>
          <CodeOutput value={output} language="json" placeholder="minified output appears here"
            className={fullscreen ? "flex-1 min-h-0" : "h-80"} wrap />
        </div>
      </div>
    </div>
  );
}
