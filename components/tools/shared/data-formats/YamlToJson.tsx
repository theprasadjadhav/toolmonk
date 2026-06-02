"use client";

import { useState, useCallback } from "react";
import yaml from "js-yaml";
import { CodeEditor, CodeOutput } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, ToolbarSelect, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

function convert(input: string, indent: 2 | 4): { output: string; error: string } {
  if (!input.trim()) return { output: "", error: "" };
  try {
    const parsed = yaml.load(input);
    return { output: JSON.stringify(parsed, null, indent), error: "" };
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}

const SAMPLE = `server:
  host: localhost
  port: 8080
  debug: true

database:
  url: postgres://localhost:5432/mydb
  pool:
    min: 2
    max: 10

features:
  - auth
  - logging
  - metrics`;

export function YamlToJson() {
  const [input,  setInput]  = useState("");
  const [output, setOutput] = useState("");
  const [error,  setError]  = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const run = useCallback((val: string, ind: 2 | 4) => {
    const result = convert(val, ind);
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
  const sample = () => { setInput(SAMPLE); run(SAMPLE, indent); };

  const handleUpload = async () => {
    const content = await uploadText(".yaml,.yml");
    if (content !== null) { setInput(content); run(content, indent); }
  };
  const handleDownload = () => { if (output) downloadText(output, "output.json", "application/json"); };

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      <Toolbar>
        <ToolbarButton icon={<Icons.Sample />} label="sample" onClick={sample} />
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarSelect label="Indent" value={indent} onChange={(v) => { const n = Number(v) as 2 | 4; setIndent(n); run(input, n); }} options={[{value:2,label:"2"},{value:4,label:"4"}]} />
        <ToolbarRight>
          <FullscreenButton />
        </ToolbarRight>
      </Toolbar>

      {error && (
        <div className="shrink-0 px-4 py-2 border border-red-500/20 bg-red-500/5 font-mono text-xs text-red-400">
          {error}
        </div>
      )}

      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0")}>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload YAML" onClick={handleUpload} />}>— yaml input</PanelLabel>
          <CodeEditor value={input} onChange={(v) => { setInput(v); run(v, indent); }}
            language="yaml" placeholder="Paste YAML here…"
            className={fullscreen ? "flex-1 min-h-0" : "h-96"} />
        </div>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<>
            <PanelButton icon={<Icons.Copy />} title={copied ? "Copied!" : "Copy"} onClick={copy} disabled={!output} active={copied} />
            <PanelButton icon={<Icons.Download />} title="Download" onClick={handleDownload} disabled={!output} />
          </>}>— json output</PanelLabel>
          <CodeOutput value={output} language="json" placeholder="JSON output appears here…"
            className={fullscreen ? "flex-1 min-h-0" : "h-96"} />
        </div>
      </div>
    </div>
  );
}
