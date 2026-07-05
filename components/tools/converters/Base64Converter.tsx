"use client";

import { useState } from "react";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, ToolbarToggleGroup, ToolbarBadge, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

type Mode = "encode" | "decode";

function encodeB64(text: string): { output: string; error: string } {
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return { output: btoa(binary), error: "" };
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}

function decodeB64(text: string): { output: string; error: string } {
  try {
    const binary = atob(text.trim().replace(/\s+/g, ""));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return { output: new TextDecoder().decode(bytes), error: "" };
  } catch {
    return { output: "", error: "Invalid Base64 — check your input." };
  }
}

export function Base64Converter() {
  const [mode,   setMode]   = useState<Mode>("encode");
  const [input,  setInput]  = useState("");
  const [output, setOutput] = useState("");
  const [error,  setError]  = useState("");
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const run = (val: string, m: Mode) => {
    if (!val.trim()) { setOutput(""); setError(""); return; }
    const result = m === "encode" ? encodeB64(val) : decodeB64(val);
    setOutput(result.output);
    setError(result.error);
  };

  const handleInput = (val: string) => { setInput(val); run(val, mode); };

  const switchMode = (m: Mode) => {
    setMode(m);
    // Swap: move output → input
    if (output) { setInput(output); run(output, m); }
    else { run(input, m); }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setInput(""); setOutput(""); setError(""); };

  const handleUpload = async () => {
    const c = await uploadText("*");
    if (c !== null) { setInput(c); run(c, mode); }
  };
  const handleDownload = () => {
    if (!output) return;
    downloadText(output, `${mode === "encode" ? "encoded" : "decoded"}.txt`);
  };

  const charCount = output.length;

  return (
    <div className={cn("space-y-4", fullscreen && "flex-1 min-h-0 flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarToggleGroup value={mode} onChange={switchMode} options={[{value:"encode",label:"encode"},{value:"decode",label:"decode"}]} />
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight>
          {charCount > 0 && <ToolbarBadge>{charCount} chars</ToolbarBadge>}
          <FullscreenButton />
        </ToolbarRight>
      </Toolbar>

      {error && (
        <div className="shrink-0 px-4 py-2 border border-red-500/20 bg-red-500/5 font-mono text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Panels */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0 [grid-template-rows:1fr_1fr] lg:grid-rows-1")}>
        {/* Input */}
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload file" onClick={handleUpload} />}>
            — {mode === "encode" ? "plain text" : "base64 string"}
          </PanelLabel>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={mode === "encode" ? "Type or paste text to encode…" : "Paste Base64 string to decode…"}
            spellCheck={false}
            className={cn(
              "w-full px-4 py-3 border border-border bg-surface font-mono text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:border-foreground-muted transition-colors resize-none",
              fullscreen ? "flex-1 min-h-0" : "h-72"
            )}
          />
        </div>

        {/* Output */}
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<>
            <PanelButton icon={<Icons.Copy />} title={copied ? "Copied!" : "Copy"} onClick={copy} disabled={!output} active={copied} />
            <PanelButton icon={<Icons.Download />} title="Download" onClick={handleDownload} disabled={!output} />
          </>}>
            — {mode === "encode" ? "base64 output" : "decoded text"}
          </PanelLabel>
          <textarea
            value={output}
            readOnly
            placeholder={mode === "encode" ? "Base64 output appears here…" : "Decoded text appears here…"}
            spellCheck={false}
            className={cn(
              "w-full px-4 py-3 border border-border bg-surface-muted font-mono text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none resize-none",
              fullscreen ? "flex-1 min-h-0" : "h-72"
            )}
          />
        </div>
      </div>
    </div>
  );
}
