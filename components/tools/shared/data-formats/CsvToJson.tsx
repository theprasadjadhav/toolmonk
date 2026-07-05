"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { CodeEditor, CodeOutput } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, ToolbarSelect, ToolbarCheckbox, ToolbarBadge, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

// ── Conversion ─────────────────────────────────────────────────────────────────

function convert(
  input: string,
  delimiter: string,
  hasHeader: boolean,
  indent: 2 | 4
): { output: string; error: string; rows: number } {
  if (!input.trim()) return { output: "", error: "", rows: 0 };
  const delim = delimiter === "\\t" ? "\t" : delimiter;
  try {
    const result = Papa.parse(input.trim(), {
      delimiter: delim,
      header: hasHeader,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    if (result.errors.length > 0 && result.data.length === 0) {
      return { output: "", error: result.errors[0].message, rows: 0 };
    }
    return {
      output: JSON.stringify(result.data, null, indent),
      error: "",
      rows: result.data.length,
    };
  } catch (e) {
    return { output: "", error: (e as Error).message, rows: 0 };
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

const SAMPLE = `name,age,city,active
Alice,30,London,true
Bob,25,Paris,false
Carol,35,Berlin,true
Dave,28,Tokyo,true`;

export function CsvToJson() {
  const [input,     setInput]     = useState("");
  const [output,    setOutput]    = useState("");
  const [error,     setError]     = useState("");
  const [rowCount,  setRowCount]  = useState(0);
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeader, setHasHeader] = useState(true);
  const [indent,    setIndent]    = useState<2 | 4>(2);
  const [copied,    setCopied]    = useState(false);
  const fullscreen = useToolFullscreen();

  const run = useCallback((val: string, delim: string, header: boolean, ind: 2 | 4) => {
    const result = convert(val, delim, header, ind);
    setOutput(result.output);
    setError(result.error);
    setRowCount(result.rows);
  }, []);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setInput(""); setOutput(""); setError(""); setRowCount(0); };
  const sample = () => { setInput(SAMPLE); run(SAMPLE, delimiter, hasHeader, indent); };

  const handleUpload = async () => {
    const content = await uploadText(".csv");
    if (content !== null) { setInput(content); run(content, delimiter, hasHeader, indent); }
  };
  const handleDownload = () => { if (output) downloadText(output, "output.json", "application/json"); };

  return (
    <div className={cn("space-y-4", fullscreen && "flex-1 min-h-0 flex flex-col")}>
      <Toolbar>
        <ToolbarButton icon={<Icons.Sample />} label="sample" onClick={sample} />
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarSelect label="Delimiter" value={delimiter} onChange={(v) => { setDelimiter(v); run(input, v, hasHeader, indent); }} options={[{value:",",label:", (comma)"},{value:";",label:"; (semicolon)"},{value:"\t",label:"⇥ (tab)"},{value:"|",label:"| (pipe)"}]} />
        <ToolbarSelect label="Indent" value={indent} onChange={(v) => { const n = Number(v) as 2|4; setIndent(n); run(input, delimiter, hasHeader, n); }} options={[{value:2,label:"2"},{value:4,label:"4"}]} />
        <ToolbarCheckbox label="First row is header" checked={hasHeader} onChange={(c) => { setHasHeader(c); run(input, delimiter, c, indent); }} />
        <ToolbarRight>
          {rowCount > 0 && <ToolbarBadge>{rowCount} rows</ToolbarBadge>}
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
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload CSV" onClick={handleUpload} />}>— csv input</PanelLabel>
          <CodeEditor value={input} onChange={(v) => { setInput(v); run(v, delimiter, hasHeader, indent); }}
            language="plaintext" placeholder="Paste CSV data here…"
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
