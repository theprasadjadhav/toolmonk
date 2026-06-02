"use client";

import { useState } from "react";
import { CodeEditor, CodeOutput } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, ToolbarSelect, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

type Mode = "named" | "numeric";

const NAMED_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function encodeNamed(str: string): string {
  return str.replace(/[&<>"']/g, (c) => NAMED_MAP[c]);
}

function encodeNumeric(str: string): string {
  return str.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function HtmlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("named");
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const process = (value: string, m: Mode) => {
    if (!value) { setOutput(""); return; }
    setOutput(m === "named" ? encodeNamed(value) : encodeNumeric(value));
  };

  const handleChange = (value: string) => { setInput(value); process(value, mode); };
  const handleModeChange = (m: Mode) => { setMode(m); process(input, m); };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setInput(""); setOutput(""); };

  const handleUpload = async () => {
    const content = await uploadText(".html,.txt");
    if (content !== null) { setInput(content); process(content, mode); }
  };
  const handleDownload = () => { if (output) downloadText(output, "encoded.html"); };

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      <Toolbar>
        <ToolbarSelect label="Entities" value={mode} onChange={(v) => handleModeChange(v as Mode)} options={[{value:"named",label:"Named (&amp;)"},{value:"numeric",label:"Numeric (&#38;)"}]} />
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight>
          <FullscreenButton />
        </ToolbarRight>
      </Toolbar>

      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0")}>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload text file" onClick={handleUpload} />}>— plain text / html</PanelLabel>
          <CodeEditor value={input} onChange={handleChange} language="html"
            placeholder={'<div class="example">Hello & "World"</div>'}
            className={fullscreen ? "flex-1 min-h-0" : "h-80"} />
        </div>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<><PanelButton icon={<Icons.Copy />} title={copied ? "Copied!" : "Copy"} onClick={copy} disabled={!output} active={copied} /><PanelButton icon={<Icons.Download />} title="Download" onClick={handleDownload} disabled={!output} /></>}>— html entities</PanelLabel>
          <CodeOutput value={output} placeholder="encoded output appears here"
            className={fullscreen ? "flex-1 min-h-0" : "h-80"} wrap />
        </div>
      </div>
    </div>
  );
}
