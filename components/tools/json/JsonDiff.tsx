"use client";

import { useState } from "react";
import { parseJSON, formatJSON } from "@/lib/utils/json";
import { DiffPanel } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

export function JsonDiff() {
  const [left, setLeft]         = useState("");
  const [right, setRight]       = useState("");
  const [diffCount, setDiffCount] = useState(0);
  const fullscreen               = useToolFullscreen();

  const leftResult  = left.trim()  ? parseJSON(left)  : null;
  const rightResult = right.trim() ? parseJSON(right) : null;
  const bothValid   = !!(leftResult?.ok && rightResult?.ok);
  const identical   = bothValid && diffCount === 0;

  const format = () => {
    if (leftResult?.ok)  setLeft(formatJSON(leftResult.value, 2));
    if (rightResult?.ok) setRight(formatJSON(rightResult.value, 2));
  };

  const swap  = () => { setLeft(right); setRight(left); setDiffCount(0); };
  const clear = () => { setLeft(""); setRight(""); setDiffCount(0); };

  const handleUploadLeft  = async () => { const c = await uploadText(".json"); if (c !== null) setLeft(c); };
  const handleUploadRight = async () => { const c = await uploadText(".json"); if (c !== null) setRight(c); };

  return (
    <div className={cn("space-y-4", fullscreen && "flex-1 min-h-0 flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarButton icon={<Icons.Format />} label="format" onClick={format} disabled={!leftResult?.ok && !rightResult?.ok} />
        <ToolbarButton icon={<Icons.Swap />} label="swap" onClick={swap} disabled={!left && !right} />
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {/* Status bar */}
      <div className="shrink-0">
        <StatusBar
          leftResult={leftResult} rightResult={rightResult}
          leftEmpty={!left.trim()} rightEmpty={!right.trim()}
          identical={identical} diffCount={diffCount} bothValid={bothValid}
        />
      </div>

      {/* Labels */}
      <div className="grid grid-cols-2 shrink-0 gap-14 px-4">
        <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload JSON" onClick={handleUploadLeft} />}>— JSON A</PanelLabel>
        <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload JSON" onClick={handleUploadRight} />}>— JSON B</PanelLabel>
      </div>

      {/* Diff editor */}
      <DiffPanel
        left={left}
        right={right}
        onLeftChange={setLeft}
        onRightChange={setRight}
        language="json"
        onDiffChange={setDiffCount}
        className={fullscreen ? "flex-1 min-h-0" : "h-[30rem]"}
      />
    </div>
  );
}

type ParseResult = { ok: true; value: unknown } | { ok: false; error: string } | null;

interface StatusBarProps {
  leftResult: ParseResult; rightResult: ParseResult;
  leftEmpty: boolean; rightEmpty: boolean;
  bothValid: boolean; identical: boolean; diffCount: number;
}

function StatusBar({ leftResult, rightResult, leftEmpty, rightEmpty, bothValid, identical, diffCount }: StatusBarProps) {
  const leftErr  = !leftEmpty  && leftResult?.ok  === false ? leftResult.error  : null;
  const rightErr = !rightEmpty && rightResult?.ok === false ? rightResult.error : null;

  if (leftErr || rightErr) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30">
        <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <div className="space-y-2">
          {leftErr && (
            <div>
              <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider block mb-1">A — invalid json</span>
              <p className="font-mono text-xs text-red-400 leading-relaxed">{leftErr}</p>
            </div>
          )}
          {rightErr && (
            <div>
              <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider block mb-1">B — invalid json</span>
              <p className="font-mono text-xs text-red-400 leading-relaxed">{rightErr}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (bothValid && !identical) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30">
        <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="font-mono text-sm text-red-400">{diffCount} line{diffCount !== 1 ? "s" : ""} differ</span>
      </div>
    );
  }

  if (bothValid && identical) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20">
        <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-mono text-sm text-green-400">identical</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-surface border border-border">
      <p className="font-mono text-xs text-foreground-muted">paste JSON into both panels to compare</p>
    </div>
  );
}
