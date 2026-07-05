"use client";

import { useState } from "react";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { textareaCls } from "@/lib/utils/formStyles";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

function decode(str: string): string {
  const binary = atob(str.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function Base64Decoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const process = (value: string) => {
    if (!value.trim()) { setOutput(""); setError(""); return; }
    try {
      setOutput(decode(value));
      setError("");
    } catch {
      setError("Invalid Base64 string. Make sure the input is valid Base64.");
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
  const handleDownload = () => { if (output) downloadText(output, "decoded.txt"); };

  return (
    <div className={cn("space-y-4", fullscreen && "flex-1 min-h-0 flex flex-col")}>
      <Toolbar>
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {error && <ErrorBanner error={error} className="shrink-0" />}

      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0 [grid-template-rows:1fr_1fr] lg:grid-rows-1")}>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload text file" onClick={handleUpload} />}>— base64</PanelLabel>
          <textarea
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Paste Base64 string here…"
            spellCheck={false}
            className={cn(textareaCls, "resize-none", fullscreen ? "flex-1 min-h-0" : "h-80")}
          />
        </div>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<><PanelButton icon={<Icons.Copy />} title={copied ? "Copied!" : "Copy"} onClick={copy} disabled={!output} active={copied} /><PanelButton icon={<Icons.Download />} title="Download" onClick={handleDownload} disabled={!output} /></>}>— decoded text</PanelLabel>
          <div className={cn("border border-border bg-surface font-mono text-xs overflow-auto", fullscreen ? "flex-1 min-h-0" : "h-80")}>
            {output ? (
              <pre className="p-4 whitespace-pre-wrap break-words text-foreground m-0 leading-relaxed">{output}</pre>
            ) : (
              <div className="flex items-center justify-center h-full min-h-20">
                <p className="text-foreground-muted">decoded output appears here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
