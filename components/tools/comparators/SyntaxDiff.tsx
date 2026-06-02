"use client";

import { useState } from "react";
import { ComparatorTool, DiffStatusBar, MarkerStatusBar } from "./ComparatorTool";

// Languages where Monaco's built-in workers produce error markers
const MARKER_LANGUAGES = new Set(["javascript", "typescript", "css"]);
// Languages with Monaco built-in formatters (superset of MARKER_LANGUAGES)
const FORMAT_LANGUAGES = new Set(["javascript", "typescript", "css", "html"]);

interface SyntaxDiffProps {
  /** Monaco language identifier, e.g. "css", "java", "python". */
  language: string;
  /** File accept string for the upload button, e.g. ".css". */
  uploadAccept?: string;
  /** Placeholder shown in the status bar when both panels are empty. */
  placeholder?: string;
}

export function SyntaxDiff({ language, uploadAccept, placeholder }: SyntaxDiffProps) {
  const [left, setLeft]                      = useState("");
  const [right, setRight]                    = useState("");
  const [diffCount, setDiffCount]            = useState(0);
  const [leftMarkerErrors, setLeftMarkers]   = useState<string[]>([]);
  const [rightMarkerErrors, setRightMarkers] = useState<string[]>([]);

  const isMarkerLang = MARKER_LANGUAGES.has(language);
  const isFormatLang = FORMAT_LANGUAGES.has(language);

  const handleMarkersChange = isMarkerLang
    ? (l: string[], r: string[]) => { setLeftMarkers(l); setRightMarkers(r); }
    : undefined;

  const statusBar = isMarkerLang ? (
    <MarkerStatusBar
      langLabel={language}
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
      placeholder={placeholder ?? `paste ${language} into both panels to compare`}
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
      onMarkersChange={handleMarkersChange}
      showMonacoFormat={isFormatLang}
      uploadAccept={uploadAccept}
      statusBar={statusBar}
    />
  );
}
