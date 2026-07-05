"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { CodeEditor, CodeOutput } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, ToolbarSelect, ToolbarCheckbox, ToolbarBadge, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

// ── Helpers ────────────────────────────────────────────────────────────────────

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  return Object.entries(obj).reduce<Record<string, unknown>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(acc, flattenObject(v as Record<string, unknown>, key));
    } else {
      acc[key] = v;
    }
    return acc;
  }, {});
}

// ── Conversion ─────────────────────────────────────────────────────────────────

function convert(
  input: string,
  delimiter: string,
  flatten: boolean
): { output: string; error: string; rows: number } {
  if (!input.trim()) return { output: "", error: "", rows: 0 };
  const d = delimiter === "\\t" ? "\t" : delimiter;
  try {
    const parsed = JSON.parse(input);
    const arr: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
    if (arr.length === 0) return { output: "", error: "", rows: 0 };

    const rows = arr.map((item) => {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        return flatten ? flattenObject(item as Record<string, unknown>) : (item as Record<string, unknown>);
      }
      return { value: item };
    });

    const csv = Papa.unparse(rows, { delimiter: d, newline: "\n" });
    return { output: csv, error: "", rows: rows.length };
  } catch (e) {
    return { output: "", error: (e as Error).message, rows: 0 };
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

const SAMPLE = `[
  { "name": "Alice", "age": 30, "city": "London", "active": true },
  { "name": "Bob",   "age": 25, "city": "Paris",  "active": false },
  { "name": "Carol", "age": 35, "city": "Berlin", "active": true }
]`;

export function JsonToCsv() {
  const [input,     setInput]     = useState("");
  const [output,    setOutput]    = useState("");
  const [error,     setError]     = useState("");
  const [rowCount,  setRowCount]  = useState(0);
  const [delimiter, setDelimiter] = useState(",");
  const [flatten,   setFlatten]   = useState(true);
  const [copied,    setCopied]    = useState(false);
  const fullscreen = useToolFullscreen();

  const run = useCallback((val: string, delim: string, flat: boolean) => {
    const result = convert(val, delim, flat);
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
  const sample = () => { setInput(SAMPLE); run(SAMPLE, delimiter, flatten); };

  const handleUpload = async () => {
    const content = await uploadText(".json");
    if (content !== null) { setInput(content); run(content, delimiter, flatten); }
  };
  const handleDownload = () => { if (output) downloadText(output, "output.csv", "text/csv"); };

  return (
    <div className={cn("space-y-4", fullscreen && "flex-1 min-h-0 flex flex-col")}>
      <Toolbar>
        <ToolbarButton icon={<Icons.Sample />} label="sample" onClick={sample} />
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarSelect label="Delimiter" value={delimiter} onChange={(v) => { setDelimiter(v); run(input, v, flatten); }} options={[{value:",",label:", (comma)"},{value:";",label:"; (semicolon)"},{value:"\t",label:"⇥ (tab)"},{value:"|",label:"| (pipe)"}]} />
        <ToolbarCheckbox label="Flatten nested" checked={flatten} onChange={(c) => { setFlatten(c); run(input, delimiter, c); }} />
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
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload JSON" onClick={handleUpload} />}>— json input</PanelLabel>
          <CodeEditor value={input} onChange={(v) => { setInput(v); run(v, delimiter, flatten); }}
            language="json" placeholder="Paste a JSON array here…"
            className={fullscreen ? "flex-1 min-h-0" : "h-96"} />
        </div>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<>
            <PanelButton icon={<Icons.Copy />} title={copied ? "Copied!" : "Copy"} onClick={copy} disabled={!output} active={copied} />
            <PanelButton icon={<Icons.Download />} title="Download" onClick={handleDownload} disabled={!output} />
          </>}>— csv output</PanelLabel>
          <CodeOutput value={output} language="plaintext" placeholder="CSV output appears here…"
            className={fullscreen ? "flex-1 min-h-0" : "h-96"} />
        </div>
      </div>
    </div>
  );
}
