"use client";

import { useState } from "react";
import { DiffPanel } from "@/components/ui/CodePanel";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText } from "@/lib/utils/file";
import { useCopyState } from "@/lib/hooks/useCopyState";
import { cn } from "@/lib/utils/cn";

interface ComparatorToolProps {
  language: string;
  left: string;
  right: string;
  onLeftChange: (v: string) => void;
  onRightChange: (v: string) => void;
  onDiffChange?: (count: number) => void;
  /** If provided, a Format button appears in the toolbar. */
  onFormat?: () => void;
  labelA?: string;
  labelB?: string;
  /** File accept string for upload buttons, e.g. ".json". Defaults to "*". */
  uploadAccept?: string;
  /** The status bar content — caller owns validation/diff-count display. */
  statusBar: React.ReactNode;
  /** Optional toolbar items injected before Swap (e.g., a ToolbarSelect). */
  toolbarLeading?: React.ReactNode;
  /** Forwarded to DiffPanel — called when Monaco language-worker errors change. */
  onMarkersChange?: (leftErrors: string[], rightErrors: string[]) => void;
  /** When true, shows a Format button that uses Monaco's built-in formatter (JS/TS/CSS). */
  showMonacoFormat?: boolean;
}

export function ComparatorTool({
  language,
  left,
  right,
  onLeftChange,
  onRightChange,
  onDiffChange,
  onFormat,
  labelA = "— A",
  labelB = "— B",
  uploadAccept = "*",
  statusBar,
  toolbarLeading,
  onMarkersChange,
  showMonacoFormat,
}: ComparatorToolProps) {
  const fullscreen = useToolFullscreen();
  const { copied, copy } = useCopyState();
  const [monacoFormat, setMonacoFormat] = useState<(() => void) | null>(null);

  const swap = () => {
    const tmp = left;
    onLeftChange(right);
    onRightChange(tmp);
    onDiffChange?.(0);
  };

  const clear = () => {
    onLeftChange("");
    onRightChange("");
    onDiffChange?.(0);
  };

  const handleUploadLeft = async () => {
    const c = await uploadText(uploadAccept);
    if (c !== null) onLeftChange(c);
  };

  const handleUploadRight = async () => {
    const c = await uploadText(uploadAccept);
    if (c !== null) onRightChange(c);
  };

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        {toolbarLeading}
        {(onFormat || (showMonacoFormat && monacoFormat)) && (
          <ToolbarButton
            icon={<Icons.Format />}
            label="format"
            onClick={onFormat ?? monacoFormat ?? undefined}
            disabled={!left.trim() && !right.trim()}
          />
        )}
        <ToolbarButton icon={<Icons.Swap />} label="swap" onClick={swap} disabled={!left && !right} />
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {/* Status bar */}
      <div className="shrink-0">{statusBar}</div>

      {/* Panel labels */}
      <div className="grid grid-cols-2 shrink-0 gap-14 px-4">
        <PanelLabel
          actions={
            <>
              <PanelButton
                icon={<Icons.Copy />}
                title={`Copy ${labelA}`}
                onClick={() => copy("left", left)}
                disabled={!left.trim()}
                active={copied === "left"}
              />
              <PanelButton icon={<Icons.Upload />} title={`Upload ${labelA}`} onClick={handleUploadLeft} />
            </>
          }
        >
          {labelA}
        </PanelLabel>
        <PanelLabel
          actions={
            <>
              <PanelButton
                icon={<Icons.Copy />}
                title={`Copy ${labelB}`}
                onClick={() => copy("right", right)}
                disabled={!right.trim()}
                active={copied === "right"}
              />
              <PanelButton icon={<Icons.Upload />} title={`Upload ${labelB}`} onClick={handleUploadRight} />
            </>
          }
        >
          {labelB}
        </PanelLabel>
      </div>

      {/* Diff editor */}
      <DiffPanel
        left={left}
        right={right}
        onLeftChange={onLeftChange}
        onRightChange={onRightChange}
        language={language}
        onDiffChange={onDiffChange}
        onMarkersChange={onMarkersChange}
        onFormatReady={showMonacoFormat ? (fn) => setMonacoFormat(() => fn) : undefined}
        className={fullscreen ? "flex-1 min-h-0" : "h-[30rem]"}
      />
    </div>
  );
}

// ── Shared status bar states ───────────────────────────────────────────────────

interface DiffStatusBarProps {
  diffCount: number;
  leftEmpty: boolean;
  rightEmpty: boolean;
  placeholder?: string;
}

export function DiffStatusBar({ diffCount, leftEmpty, rightEmpty, placeholder }: DiffStatusBarProps) {
  const bothEmpty = leftEmpty && rightEmpty;
  const identical = !bothEmpty && !leftEmpty && !rightEmpty && diffCount === 0;
  const hasDiff = !bothEmpty && diffCount > 0;

  if (hasDiff) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30">
        <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="font-mono text-sm text-red-400">
          {diffCount} line{diffCount !== 1 ? "s" : ""} differ
        </span>
      </div>
    );
  }

  if (identical) {
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
      <p className="font-mono text-xs text-foreground-muted">
        {placeholder ?? "paste content into both panels to compare"}
      </p>
    </div>
  );
}

// ── Marker status bar (JS / TS / CSS — Monaco language-worker errors) ──────────

interface MarkerStatusBarProps {
  leftErrors: string[];
  rightErrors: string[];
  leftEmpty: boolean;
  rightEmpty: boolean;
  diffCount: number;
  langLabel: string;
}

export function MarkerStatusBar({
  leftErrors, rightErrors,
  leftEmpty, rightEmpty,
  diffCount, langLabel,
}: MarkerStatusBarProps) {
  const hasErrors   = leftErrors.length > 0 || rightErrors.length > 0;
  const bothFilled  = !leftEmpty && !rightEmpty;
  const identical   = bothFilled && !hasErrors && diffCount === 0;
  const hasDiff     = bothFilled && !hasErrors && diffCount > 0;

  if (hasErrors) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30">
        <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <div className="space-y-2">
          {leftErrors.length > 0 && (
            <div>
              <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider block mb-1">
                A — {leftErrors.length} syntax error{leftErrors.length !== 1 ? "s" : ""}
              </span>
              <div className="space-y-0.5">
                {leftErrors.slice(0, 3).map((e, i) => (
                  <p key={i} className="font-mono text-xs text-red-400 leading-relaxed">{e}</p>
                ))}
                {leftErrors.length > 3 && (
                  <p className="font-mono text-xs text-red-400/60">+{leftErrors.length - 3} more</p>
                )}
              </div>
            </div>
          )}
          {rightErrors.length > 0 && (
            <div>
              <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider block mb-1">
                B — {rightErrors.length} syntax error{rightErrors.length !== 1 ? "s" : ""}
              </span>
              <div className="space-y-0.5">
                {rightErrors.slice(0, 3).map((e, i) => (
                  <p key={i} className="font-mono text-xs text-red-400 leading-relaxed">{e}</p>
                ))}
                {rightErrors.length > 3 && (
                  <p className="font-mono text-xs text-red-400/60">+{rightErrors.length - 3} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (hasDiff) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30">
        <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="font-mono text-sm text-red-400">
          {diffCount} line{diffCount !== 1 ? "s" : ""} differ
        </span>
      </div>
    );
  }

  if (identical) {
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
      <p className="font-mono text-xs text-foreground-muted">
        paste {langLabel} into both panels to compare
      </p>
    </div>
  );
}
