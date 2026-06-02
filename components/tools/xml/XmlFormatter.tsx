"use client";

import { useState, useCallback } from "react";
import { parseXML, formatXML, minifyXML } from "@/lib/utils/xml";
import { CodeEditor, CodeOutput } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, ToolbarSelect, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";
import { ValidationStatus } from "@/components/ui/ValidationStatus";

type IndentSize = 2 | 4;
type Status = "idle" | "valid" | "error";

export function XmlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<IndentSize>(2);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fullscreen = useToolFullscreen();

  const format = useCallback((value: string, spaces: IndentSize) => {
    if (!value.trim()) { setOutput(""); setStatus("idle"); setError(""); return; }
    const result = parseXML(value);
    if (!result.ok) { setStatus("error"); setError(result.error); setOutput(""); return; }
    setOutput(formatXML(value, spaces));
    setStatus("valid");
    setError("");
  }, []);

  const minify = useCallback((value: string) => {
    if (!value.trim()) { setOutput(""); setStatus("idle"); setError(""); return; }
    const result = parseXML(value);
    if (!result.ok) { setStatus("error"); setError(result.error); setOutput(""); return; }
    setOutput(minifyXML(value));
    setStatus("valid");
    setError("");
  }, []);

  const handleChange = (value: string) => { setInput(value); format(value, indent); };
  const handleIndentChange = (size: IndentSize) => { setIndent(size); format(input, size); };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setInput(""); setOutput(""); setStatus("idle"); setError(""); };

  const handleUpload = async () => {
    const content = await uploadText(".xml");
    if (content !== null) { setInput(content); format(content, indent); }
  };
  const handleDownload = () => { if (output) downloadText(output, "formatted.xml", "application/xml"); };

  const lineCount = output ? output.split("\n").length : 0;

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarSelect label="Indent" value={indent} onChange={(v) => handleIndentChange(Number(v) as IndentSize)} options={[{value:2,label:"2 spaces"},{value:4,label:"4 spaces"}]} />
        <ToolbarButton icon={<Icons.Format />} label="format" onClick={() => format(input, indent)} />
        <ToolbarButton icon={<Icons.Minify />} label="minify" onClick={() => minify(input)} />
        <ToolbarRight>
          <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
          <FullscreenButton />
        </ToolbarRight>
      </Toolbar>

      {/* Status */}
      <div className="shrink-0 space-y-2">
        <ValidationStatus
          status={status}
          errorMessage={error}
          validLabel="valid xml"
          validInfo={`${lineCount} lines`}
          compact
        />
      </div>

      {/* Panels */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0")}>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload XML" onClick={handleUpload} />}>— input</PanelLabel>
          <CodeEditor value={input} onChange={handleChange} placeholder='<root><item>paste XML here</item></root>'
            className={fullscreen ? "flex-1 min-h-0" : "h-80"} language="xml" />
        </div>
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<>
            <PanelButton icon={<Icons.Copy />} title={copied ? "Copied!" : "Copy"} onClick={copy} disabled={!output} active={copied} />
            <PanelButton icon={<Icons.Download />} title="Download" onClick={handleDownload} disabled={!output} />
          </>}>— output</PanelLabel>
          <CodeOutput value={output} language="xml"
            placeholder="formatted output appears here" className={fullscreen ? "flex-1 min-h-0" : "h-80"} />
        </div>
      </div>
    </div>
  );
}
