"use client";

import { useState } from "react";
import { CodeEditor, CodeOutput } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

// Named entity map (common subset + extended)
const ENTITY_MAP: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  nbsp: "\u00A0", copy: "©", reg: "®", trade: "™",
  mdash: "—", ndash: "–", laquo: "«", raquo: "»",
  ldquo: "\u201C", rdquo: "\u201D", lsquo: "\u2018", rsquo: "\u2019",
  hellip: "…", bull: "•", euro: "€", pound: "£", yen: "¥",
  cent: "¢", deg: "°", plusmn: "±", times: "×", divide: "÷",
  frac12: "½", frac14: "¼", frac34: "¾",
};

function decodeEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => ENTITY_MAP[name.toLowerCase()] ?? match);
}

export function HtmlDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const process = (value: string) => {
    if (!value) { setOutput(""); return; }
    setOutput(decodeEntities(value));
  };

  const handleChange = (value: string) => { setInput(value); process(value); };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setInput(""); setOutput(""); };

  const handleUpload = async () => {
    const content = await uploadText(".html,.txt");
    if (content !== null) { setInput(content); process(content); }
  };
  const handleDownload = () => { if (output) downloadText(output, "decoded.txt"); };

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      <Toolbar>
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0")}>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload text file" onClick={handleUpload} />}>— html entities</PanelLabel>
          <CodeEditor value={input} onChange={handleChange}
            placeholder="Paste HTML with entities… e.g. &amp;lt;div&amp;gt;"
            className={fullscreen ? "flex-1 min-h-0" : "h-80"} />
        </div>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<><PanelButton icon={<Icons.Copy />} title={copied ? "Copied!" : "Copy"} onClick={copy} disabled={!output} active={copied} /><PanelButton icon={<Icons.Download />} title="Download" onClick={handleDownload} disabled={!output} /></>}>— decoded text</PanelLabel>
          <CodeOutput value={output} language="html" placeholder="decoded output appears here"
            className={fullscreen ? "flex-1 min-h-0" : "h-80"} wrap />
        </div>
      </div>
    </div>
  );
}
