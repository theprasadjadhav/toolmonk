"use client";

import { useState, useCallback } from "react";
import { XMLBuilder } from "fast-xml-parser";
import { CodeEditor, CodeOutput } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

// ── Conversion ─────────────────────────────────────────────────────────────────

const builder = new XMLBuilder({
  format: true,
  indentBy: "  ",
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  suppressEmptyNode: true,
});

function convert(input: string): { output: string; error: string } {
  if (!input.trim()) return { output: "", error: "" };
  try {
    const parsed = JSON.parse(input);
    const obj = typeof parsed === "object" && !Array.isArray(parsed) && parsed !== null
      ? parsed
      : { items: { item: parsed } };
    const xml: string = builder.build(obj);
    return { output: `<?xml version="1.0" encoding="UTF-8"?>\n${xml.trimEnd()}`, error: "" };
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

const SAMPLE = `{
  "person": {
    "name": "Alice",
    "age": 30,
    "hobbies": {
      "item": ["reading", "coding"]
    },
    "address": {
      "city": "London",
      "zip": "EC1A"
    }
  }
}`;

export function JsonToXml() {
  const [input,  setInput]  = useState("");
  const [output, setOutput] = useState("");
  const [error,  setError]  = useState("");
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const run = useCallback((val: string) => {
    const result = convert(val);
    setOutput(result.output);
    setError(result.error);
  }, []);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setInput(""); setOutput(""); setError(""); };
  const sample = () => { setInput(SAMPLE); run(SAMPLE); };

  const handleUpload = async () => {
    const content = await uploadText(".json");
    if (content !== null) { setInput(content); run(content); }
  };
  const handleDownload = () => { if (output) downloadText(output, "output.xml", "application/xml"); };

  return (
    <div className={cn("space-y-4", fullscreen && "flex-1 min-h-0 flex flex-col")}>
      <Toolbar>
        <ToolbarButton icon={<Icons.Sample />} label="sample" onClick={sample} />
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight>
          <FullscreenButton />
        </ToolbarRight>
      </Toolbar>

      {error && (
        <div className="shrink-0 px-4 py-2 border border-red-500/20 bg-red-500/5 font-mono text-xs text-red-400">
          {error}
        </div>
      )}

      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0 [grid-template-rows:1fr_1fr] lg:grid-rows-1")}>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload JSON" onClick={handleUpload} />}>— json input</PanelLabel>
          <CodeEditor value={input} onChange={(v) => { setInput(v); run(v); }}
            language="json" placeholder="Paste JSON here…"
            className={fullscreen ? "flex-1 min-h-0" : "h-96"} />
        </div>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<>
            <PanelButton icon={<Icons.Copy />} title={copied ? "Copied!" : "Copy"} onClick={copy} disabled={!output} active={copied} />
            <PanelButton icon={<Icons.Download />} title="Download" onClick={handleDownload} disabled={!output} />
          </>}>— xml output</PanelLabel>
          <CodeOutput value={output} language="xml" placeholder="XML output appears here…"
            className={fullscreen ? "flex-1 min-h-0" : "h-96"} />
        </div>
      </div>
    </div>
  );
}
