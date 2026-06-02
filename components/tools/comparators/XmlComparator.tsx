"use client";

import { useState } from "react";
import { ComparatorTool } from "./ComparatorTool";
import { formatXML } from "@/lib/utils/xml";

type XmlResult = { ok: true } | { ok: false; error: string } | null;

function parseXML(text: string): XmlResult {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const err = doc.querySelector("parsererror");
  if (err) {
    // Extract human-readable message from the parsererror node
    const msg = err.textContent?.trim().split("\n")[0] ?? "Invalid XML";
    return { ok: false, error: msg };
  }
  return { ok: true };
}

export function XmlComparator() {
  const [left, setLeft]           = useState("");
  const [right, setRight]         = useState("");
  const [diffCount, setDiffCount] = useState(0);

  const leftResult  = left.trim()  ? parseXML(left)  : null;
  const rightResult = right.trim() ? parseXML(right) : null;
  const bothValid   = !!(leftResult?.ok && rightResult?.ok);
  const identical   = bothValid && diffCount === 0;

  const handleFormat = () => {
    if (left.trim() && leftResult?.ok) setLeft(formatXML(left));
    if (right.trim() && rightResult?.ok) setRight(formatXML(right));
  };

  return (
    <ComparatorTool
      language="xml"
      left={left}
      right={right}
      onLeftChange={setLeft}
      onRightChange={setRight}
      onDiffChange={setDiffCount}
      onFormat={handleFormat}
      uploadAccept=".xml"
      labelA="— XML A"
      labelB="— XML B"
      statusBar={
        <XmlStatusBar
          leftResult={leftResult}
          rightResult={rightResult}
          leftEmpty={!left.trim()}
          rightEmpty={!right.trim()}
          bothValid={bothValid}
          identical={identical}
          diffCount={diffCount}
        />
      }
    />
  );
}

interface XmlStatusBarProps {
  leftResult: XmlResult;
  rightResult: XmlResult;
  leftEmpty: boolean;
  rightEmpty: boolean;
  bothValid: boolean;
  identical: boolean;
  diffCount: number;
}

function XmlStatusBar({
  leftResult, rightResult,
  leftEmpty, rightEmpty,
  bothValid, identical, diffCount,
}: XmlStatusBarProps) {
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
              <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider block mb-1">A — invalid xml</span>
              <p className="font-mono text-xs text-red-400 leading-relaxed">{leftErr}</p>
            </div>
          )}
          {rightErr && (
            <div>
              <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider block mb-1">B — invalid xml</span>
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
      <p className="font-mono text-xs text-foreground-muted">paste XML into both panels to compare</p>
    </div>
  );
}
