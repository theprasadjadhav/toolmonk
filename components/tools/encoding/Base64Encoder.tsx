"use client";

import { useState } from "react";
import { CodeEditor, CodeOutput } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

function encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary);
}

export function Base64Encoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const process = (value: string) => {
    if (!value) { setOutput(""); setError(""); return; }
    try {
      setOutput(encode(value));
      setError("");
    } catch {
      setError("Encoding failed. Check for invalid characters.");
      setOutput("");
    }
  };

  const handleChange = (value: string) => { setInput(value); process(value); };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setInput(""); setOutput(""); setError(""); };

  const handleUpload = async () => {
    const content = await uploadText(".txt");
    if (content !== null) { setInput(content); process(content); }
  };
  const handleDownload = () => { if (output) downloadText(output, "base64.txt"); };

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      <Toolbar>
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {error && <ErrorBanner error={error} className="shrink-0" />}

      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0")}>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload text file" onClick={handleUpload} />}>— plain text</PanelLabel>
          <CodeEditor value={input} onChange={handleChange} placeholder="Enter text to encode…"
            className={fullscreen ? "flex-1 min-h-0" : "h-80"} />
        </div>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<><PanelButton icon={<Icons.Copy />} title={copied ? "Copied!" : "Copy"} onClick={copy} disabled={!output} active={copied} /><PanelButton icon={<Icons.Download />} title="Download" onClick={handleDownload} disabled={!output} /></>}>— base64</PanelLabel>
          <CodeOutput value={output} placeholder="base64 output appears here"
            className={fullscreen ? "flex-1 min-h-0" : "h-80"} wrap />
        </div>
      </div>
    </div>
  );
}
