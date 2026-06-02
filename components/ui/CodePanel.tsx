"use client";

import { useState, useEffect, useRef } from "react";
import Editor, { DiffEditor, type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { cn } from "@/lib/utils/cn";

// ── Theme ─────────────────────────────────────────────────────────────────────

function defineThemes(monaco: Monaco) {
  monaco.editor.defineTheme("toolkit-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#0a0a0b",
      "editor.foreground": "#f1f1f3",
      "editorLineNumber.foreground": "#5a5a66",
      "editorLineNumber.activeForeground": "#9191a0",
      "editor.lineHighlightBackground": "#ffffff06",
      "editor.selectionBackground": "#3d3d5c80",
      "editor.inactiveSelectionBackground": "#3d3d5c40",
      "editorCursor.foreground": "#f1f1f3",
      "editorWidget.background": "#101013",
      "editorWidget.border": "#232328",
      "diffEditor.insertedTextBackground": "#4ade8025",
      "diffEditor.removedTextBackground": "#ff5c5725",
      "diffEditor.insertedLineBackground": "#4ade8015",
      "diffEditor.removedLineBackground": "#ff5c5715",
    },
  });
  monaco.editor.defineTheme("toolkit-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#fafafa",
      "editor.foreground": "#09090b",
      "editorLineNumber.foreground": "#71717a",
      "editorLineNumber.activeForeground": "#3f3f46",
      "editor.lineHighlightBackground": "#00000006",
      "diffEditor.insertedTextBackground": "#16a34a25",
      "diffEditor.removedTextBackground": "#e03e3a25",
      "diffEditor.insertedLineBackground": "#16a34a12",
      "diffEditor.removedLineBackground": "#e03e3a12",
    },
  });
}

function useEditorTheme() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return isDark ? "toolkit-dark" : "toolkit-light";
}

// ── Shared editor options ─────────────────────────────────────────────────────

const BASE_OPTIONS = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  folding: true,
  wordWrap: "off" as const,
  fontSize: 13,
  tabSize: 2,
  renderLineHighlight: "line" as const,
  scrollbar: {
    verticalScrollbarSize:8,
    horizontalScrollbarSize:8,
    vertical: "auto" as const,
    horizontal: "auto" as const,
    alwaysConsumeMouseWheel: false,
  },
  padding: { top: 16, bottom: 16 },
  contextmenu: false,
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  wordBasedSuggestions: "off" as const,
  parameterHints: { enabled: false },
  guides: { indentation: false, bracketPairs: false },
  stickyScroll: { enabled: false },
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
} as const;

// ── CodeEditor ────────────────────────────────────────────────────────────────

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
}

export function CodeEditor({ value, onChange, language = "plaintext", placeholder, className }: CodeEditorProps) {
  const theme = useEditorTheme();
  return (
    <div className={cn("border border-border overflow-hidden", className)}>
      <Editor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        language={language}
        theme={theme}
        beforeMount={defineThemes}
        options={{ ...BASE_OPTIONS, ...(placeholder ? { placeholder } : {}) }}
        height="100%"
        loading={<div className="h-full bg-surface" />}
      />
    </div>
  );
}

// ── CodeOutput ────────────────────────────────────────────────────────────────

interface CodeOutputProps {
  value: string;
  language?: string;
  placeholder?: string;
  className?: string;
  wrap?: boolean;
}

export function CodeOutput({ value, language = "plaintext", placeholder, className, wrap = false }: CodeOutputProps) {
  const theme = useEditorTheme();

  if (!value) {
    return (
      <div className={cn("flex items-center justify-center border border-border bg-surface", className)}>
        <p className="font-mono text-xs text-foreground-muted">{placeholder ?? "output appears here"}</p>
      </div>
    );
  }

  return (
    <div className={cn("border border-border overflow-hidden", className)}>
      <Editor
        value={value}
        language={language}
        theme={theme}
        beforeMount={defineThemes}
        options={{ ...BASE_OPTIONS, readOnly: true, wordWrap: wrap ? "on" : "off" }}
        height="100%"
        loading={<div className="h-full bg-surface" />}
      />
    </div>
  );
}

// ── DiffPanel ─────────────────────────────────────────────────────────────────

interface DiffPanelProps {
  left: string;
  right: string;
  onLeftChange: (v: string) => void;
  onRightChange: (v: string) => void;
  language?: string;
  className?: string;
  onDiffChange?: (count: number) => void;
  /** Called whenever Monaco's language workers update error markers for either model. */
  onMarkersChange?: (leftErrors: string[], rightErrors: string[]) => void;
  /** Called once on mount with a function that formats both panels via Monaco's built-in formatter. */
  onFormatReady?: (formatFn: () => void) => void;
}

export function DiffPanel({
  left,
  right,
  onLeftChange,
  onRightChange,
  language = "plaintext",
  className,
  onDiffChange,
  onMarkersChange,
  onFormatReady,
}: DiffPanelProps) {
  const theme = useEditorTheme();
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);

  // Stable refs for callbacks — avoids stale-closure issues without adding
  // the callbacks as effect dependencies.
  const onLeftChangeRef    = useRef(onLeftChange);
  const onRightChangeRef   = useRef(onRightChange);
  const onDiffChangeRef    = useRef(onDiffChange);
  const onMarkersChangeRef = useRef(onMarkersChange);
  // eslint-disable-next-line react-hooks/refs
  onLeftChangeRef.current    = onLeftChange;
  // eslint-disable-next-line react-hooks/refs
  onRightChangeRef.current   = onRightChange;
  // eslint-disable-next-line react-hooks/refs
  onDiffChangeRef.current    = onDiffChange;
  // eslint-disable-next-line react-hooks/refs
  onMarkersChangeRef.current = onMarkersChange;

  // Dispose the global marker listener when this panel unmounts.
  const markerListenerRef = useRef<{ dispose: () => void } | null>(null);
  useEffect(() => () => { markerListenerRef.current?.dispose(); }, []);

  // Push external changes (format, swap, clear) into the editor imperatively.
  // The getValue() guard skips setValue when the change came from the user
  // typing, which prevents cursor resets on every keystroke.
  useEffect(() => {
    const orig = diffEditorRef.current?.getOriginalEditor();
    if (orig && orig.getValue() !== left) orig.setValue(left);
  }, [left]);

  useEffect(() => {
    const mod = diffEditorRef.current?.getModifiedEditor();
    if (mod && mod.getValue() !== right) mod.setValue(right);
  }, [right]);

  const handleMount = (diffEditor: editor.IStandaloneDiffEditor, monaco: Monaco) => {
    diffEditorRef.current = diffEditor;
    diffEditor.getOriginalEditor().onDidChangeModelContent(() => {
      onLeftChangeRef.current(diffEditor.getOriginalEditor().getValue());
    });
    diffEditor.getModifiedEditor().onDidChangeModelContent(() => {
      onRightChangeRef.current(diffEditor.getModifiedEditor().getValue());
    });
    diffEditor.onDidUpdateDiff(() => {
      const changes = diffEditor.getLineChanges() ?? [];
      const count = changes.reduce((acc: number, c: editor.ILineChange) => {
        const removed = Math.max(0, c.originalEndLineNumber - c.originalStartLineNumber + 1);
        const added   = Math.max(0, c.modifiedEndLineNumber  - c.modifiedStartLineNumber  + 1);
        return acc + Math.max(removed, added);
      }, 0);
      onDiffChangeRef.current?.(count);
    });

    // Subscribe to Monaco's language-worker marker updates (JS, TS, CSS, etc.).
    // The ref check lets the parent opt in/out dynamically without remounting.
    markerListenerRef.current?.dispose();
    markerListenerRef.current = monaco.editor.onDidChangeMarkers((changedUris: Monaco["Uri"][]) => {
      if (!onMarkersChangeRef.current) return;
      const origUri = diffEditor.getOriginalEditor().getModel()?.uri;
      const modUri  = diffEditor.getModifiedEditor().getModel()?.uri;
      const origChanged = origUri && changedUris.some((u: Monaco["Uri"]) => u.toString() === origUri.toString());
      const modChanged  = modUri  && changedUris.some((u: Monaco["Uri"]) => u.toString() === modUri.toString());
      if (!origChanged && !modChanged) return;
      const toErrors = (uri: typeof origUri) =>
        uri
          ? monaco.editor.getModelMarkers({ resource: uri })
              .filter((m: editor.IMarker) => m.severity === monaco.MarkerSeverity.Error)
              .map((m: editor.IMarker) => `${m.startLineNumber}:${m.startColumn} — ${m.message}`)
          : [];
      onMarkersChangeRef.current!(toErrors(origUri), toErrors(modUri));
    });

    // Expose a "format both panels" function to the parent once the editor is ready.
    if (onFormatReady) {
      onFormatReady(() => {
        diffEditor.getOriginalEditor().getAction("editor.action.formatDocument")?.run();
        diffEditor.getModifiedEditor().getAction("editor.action.formatDocument")?.run();
      });
    }
  };

  return (
    <div className={cn("border border-border overflow-none", className)}>
      <DiffEditor
        original=""
        modified=""
        language={language}
        theme={theme}
        beforeMount={defineThemes}
        options={{
          ...BASE_OPTIONS,
          originalEditable: true,
          renderSideBySide: true,
          useInlineViewWhenSpaceIsLimited: false,
          enableSplitViewResizing: true,
        }}
        onMount={handleMount}
        height="100%"
        loading={<div className="h-full bg-surface" />}
      />
    </div>
  );
}
