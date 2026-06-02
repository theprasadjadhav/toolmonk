"use client";

import { useState, useEffect } from "react";
import * as yaml from "js-yaml";
import { formatXML } from "@/lib/utils/xml";
import { ComparatorTool, DiffStatusBar, MarkerStatusBar } from "./ComparatorTool";
import { ToolbarSelect } from "@/components/ui/Toolbar";

const LANGUAGE_OPTIONS = [
  { value: "plaintext",   label: "Plain Text" },
  { value: "json",        label: "JSON" },
  { value: "yaml",        label: "YAML" },
  { value: "xml",         label: "XML" },
  { value: "html",        label: "HTML" },
  { value: "css",         label: "CSS" },
  { value: "javascript",  label: "JavaScript" },
  { value: "typescript",  label: "TypeScript" },
  { value: "python",      label: "Python" },
  { value: "java",        label: "Java" },
  { value: "c",           label: "C" },
  { value: "cpp",         label: "C++" },
  { value: "go",          label: "Go" },
  { value: "rust",        label: "Rust" },
  { value: "swift",       label: "Swift" },
  { value: "kotlin",      label: "Kotlin" },
  { value: "ruby",        label: "Ruby" },
  { value: "php",         label: "PHP" },
  { value: "bash",        label: "Bash / Shell" },
  { value: "sql",         label: "SQL" },
  { value: "markdown",    label: "Markdown" },
  { value: "dockerfile",  label: "Dockerfile" },
];

// Languages with manual client-side validation (JSON.parse / js-yaml / DOMParser)
const VALIDATABLE = new Set(["json", "yaml", "xml"]);
// Languages where Monaco's built-in language workers produce error markers
const MARKER_LANGUAGES = new Set(["javascript", "typescript", "css"]);
// Languages with Monaco built-in formatters (superset of MARKER_LANGUAGES)
const FORMAT_LANGUAGES = new Set(["javascript", "typescript", "css", "html"]);

type ParseResult = { ok: true } | { ok: false; error: string } | null;

function validateContent(language: string, text: string): ParseResult {
  if (!text.trim()) return null;
  switch (language) {
    case "json":
      try { JSON.parse(text); return { ok: true }; }
      catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" }; }
    case "yaml":
      try { yaml.load(text); return { ok: true }; }
      catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Invalid YAML" }; }
    case "xml": {
      const doc = new DOMParser().parseFromString(text, "text/xml");
      const err = doc.querySelector("parsererror");
      if (err) return { ok: false, error: err.textContent?.trim().split("\n")[0] ?? "Invalid XML" };
      return { ok: true };
    }
    default:
      return { ok: true };
  }
}

function formatContent(language: string, text: string): string | null {
  try {
    if (language === "json") return JSON.stringify(JSON.parse(text), null, 2);
    if (language === "yaml") {
      const parsed = yaml.load(text);
      return yaml.dump(parsed as object, { indent: 2, lineWidth: -1 });
    }
    if (language === "xml") return formatXML(text);
  } catch { /* ignore */ }
  return null;
}

export function MasterComparator() {
  const [left, setLeft]                     = useState("");
  const [right, setRight]                   = useState("");
  const [diffCount, setDiffCount]           = useState(0);
  const [language, setLanguage]             = useState("plaintext");
  const [leftMarkerErrors, setLeftMarkers]  = useState<string[]>([]);
  const [rightMarkerErrors, setRightMarkers] = useState<string[]>([]);

  const selected       = LANGUAGE_OPTIONS.find((o) => o.value === language);
  const isValidatable  = VALIDATABLE.has(language);
  const isMarkerLang   = MARKER_LANGUAGES.has(language);
  const isFormatLang   = FORMAT_LANGUAGES.has(language);
  const hasFormat      = language === "json" || language === "yaml" || language === "xml";

  // Clear marker errors when switching away from a marker language.
  useEffect(() => {
    setLeftMarkers([]);
    setRightMarkers([]);
  }, [language]);

  const leftResult  = isValidatable ? validateContent(language, left)  : null;
  const rightResult = isValidatable ? validateContent(language, right) : null;

  const handleFormat = hasFormat ? () => {
    const fmtLeft  = left.trim()  ? formatContent(language, left)  : null;
    const fmtRight = right.trim() ? formatContent(language, right) : null;
    if (fmtLeft  !== null) setLeft(fmtLeft);
    if (fmtRight !== null) setRight(fmtRight);
  } : undefined;

  const handleMarkersChange = isMarkerLang
    ? (l: string[], r: string[]) => { setLeftMarkers(l); setRightMarkers(r); }
    : undefined;

  const statusBar = isValidatable ? (
    <ValidationStatusBar
      language={language}
      langLabel={selected?.label ?? language}
      leftResult={leftResult}
      rightResult={rightResult}
      leftEmpty={!left.trim()}
      rightEmpty={!right.trim()}
      diffCount={diffCount}
    />
  ) : isMarkerLang ? (
    <MarkerStatusBar
      langLabel={selected?.label ?? language}
      leftErrors={leftMarkerErrors}
      rightErrors={rightMarkerErrors}
      leftEmpty={!left.trim()}
      rightEmpty={!right.trim()}
      diffCount={diffCount}
    />
  ) : (
    <DiffStatusBar
      diffCount={diffCount}
      leftEmpty={!left.trim()}
      rightEmpty={!right.trim()}
      placeholder={`paste ${selected?.label ?? "content"} into both panels to compare`}
    />
  );

  return (
    <ComparatorTool
      language={language}
      left={left}
      right={right}
      onLeftChange={setLeft}
      onRightChange={setRight}
      onDiffChange={setDiffCount}
      onFormat={handleFormat}
      onMarkersChange={handleMarkersChange}
      showMonacoFormat={isFormatLang}
      toolbarLeading={
        <ToolbarSelect
          label="language"
          value={language}
          onChange={(lang) => { setLanguage(lang); setDiffCount(0); }}
          options={LANGUAGE_OPTIONS}
        />
      }
      statusBar={statusBar}
    />
  );
}

// ── Validation status bar for JSON / YAML / XML ────────────────────────────────

interface ValidationStatusBarProps {
  language: string;
  langLabel: string;
  leftResult: ParseResult;
  rightResult: ParseResult;
  leftEmpty: boolean;
  rightEmpty: boolean;
  diffCount: number;
}

function ValidationStatusBar({
  langLabel,
  leftResult, rightResult,
  leftEmpty, rightEmpty,
  diffCount,
}: ValidationStatusBarProps) {
  const leftErr  = !leftEmpty  && leftResult?.ok  === false ? leftResult.error  : null;
  const rightErr = !rightEmpty && rightResult?.ok === false ? rightResult.error : null;
  const bothValid = !leftEmpty && !rightEmpty && leftResult?.ok === true && rightResult?.ok === true;
  const identical = bothValid && diffCount === 0;
  const langLower = langLabel.toLowerCase();

  if (leftErr || rightErr) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30">
        <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <div className="space-y-2">
          {leftErr && (
            <div>
              <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider block mb-1">
                A — invalid {langLower}
              </span>
              <p className="font-mono text-xs text-red-400 leading-relaxed">{leftErr}</p>
            </div>
          )}
          {rightErr && (
            <div>
              <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider block mb-1">
                B — invalid {langLower}
              </span>
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
      <p className="font-mono text-xs text-foreground-muted">
        paste {langLabel} into both panels to compare
      </p>
    </div>
  );
}
