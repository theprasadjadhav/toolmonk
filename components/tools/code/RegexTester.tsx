"use client";

import { useState, useMemo } from "react";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { textareaCls } from "@/lib/utils/formStyles";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

// ── Helpers ────────────────────────────────────────────────────────────────────

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface RegexMatch {
  value: string;
  index: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string> | null;
}

function runRegex(
  pattern: string,
  flags: string,
  text: string
): { matches: RegexMatch[]; highlighted: string; error: string } {
  if (!pattern) return { matches: [], highlighted: escHtml(text), error: "" };

  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { matches: [], highlighted: escHtml(text), error: (e as Error).message };
  }

  const matches: RegexMatch[] = [];

  if (flags.includes("g")) {
    // Global — find all matches
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({ value: m[0], index: m.index, groups: m.slice(1), namedGroups: m.groups ? { ...m.groups } : null });
      if (m[0].length === 0) re.lastIndex++;
    }
  } else {
    // No global flag — first match only
    const m = re.exec(text);
    if (m) matches.push({ value: m[0], index: m.index, groups: m.slice(1), namedGroups: m.groups ? { ...m.groups } : null });
  }

  // Build highlighted HTML
  let html = "";
  let pos = 0;
  for (const { value, index } of matches) {
    html += escHtml(text.slice(pos, index));
    html += `<mark style="background:rgba(250,204,21,0.25);outline:1px solid rgba(250,204,21,0.45)">${escHtml(value)}</mark>`;
    pos = index + value.length;
  }
  html += escHtml(text.slice(pos));

  return { matches, highlighted: html, error: "" };
}

// ── Flag config ────────────────────────────────────────────────────────────────

const FLAGS = [
  { f: "g", label: "global",       desc: "Find all matches, not just the first" },
  { f: "i", label: "ignore case",  desc: "Case-insensitive matching (A = a)" },
  { f: "m", label: "multiline",    desc: "^ and $ match start/end of each line" },
  { f: "s", label: "dot all",      desc: ". matches newlines too" },
  { f: "u", label: "unicode",      desc: "Full Unicode support, strict parsing" },
] as const;

// ── Component ──────────────────────────────────────────────────────────────────

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags,   setFlags]   = useState("g");
  const [test,    setTest]    = useState("");
  const fullscreen = useToolFullscreen();

  const { matches, highlighted, error } = useMemo(
    () => runRegex(pattern, flags, test),
    [pattern, flags, test]
  );

  const toggleFlag = (f: string) =>
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));

  const clear = () => { setPattern(""); setTest(""); setFlags("g"); };

  const handleUpload = async () => {
    const content = await uploadText(".txt");
    if (content !== null) setTest(content);
  };

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-foreground-muted uppercase tracking-wider shrink-0">Flags</span>
          {FLAGS.map(({ f, label, desc }) => (
            <button key={f} onClick={() => toggleFlag(f)} title={`${f} — ${label}: ${desc}`}
              className={cn("px-2.5 py-1 font-mono text-xs border transition-colors",
                flags.includes(f) ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground-muted hover:text-foreground")}>
              {f}
            </button>
          ))}
        </div>
        <ToolbarRight>
          <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
          <FullscreenButton />
        </ToolbarRight>
      </Toolbar>

      {/* Pattern input */}
      <div className="shrink-0 space-y-1.5">
        <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— pattern</p>
        <div className="flex items-center border border-border bg-surface">
          <span className="px-3 font-mono text-foreground-muted text-sm select-none">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="[a-z]+\d{2,}"
            spellCheck={false}
            className="flex-1 py-2.5 bg-transparent font-mono text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none"
          />
          <span className="px-3 font-mono text-foreground-muted text-sm select-none">/{flags || " "}</span>
        </div>
        {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
      </div>

      {/* Flag descriptions row (always visible, compact) */}
      <div className="shrink-0 flex flex-wrap gap-x-4 gap-y-1">
        {FLAGS.map(({ f, desc }) => (
          <span key={f} className={cn(
            "font-mono text-[10px] transition-colors",
            flags.includes(f) ? "text-foreground-muted" : "text-foreground-muted/30"
          )}>
            <span className={flags.includes(f) ? "text-primary" : ""}>{f}</span>
            {" — "}{desc}
          </span>
        ))}
      </div>

      {/* Test string + results */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0")}>
        {/* Input */}
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload test file" onClick={handleUpload} />}>— test string</PanelLabel>
          <textarea
            value={test}
            onChange={(e) => setTest(e.target.value)}
            placeholder="Paste text to test against…"
            spellCheck={false}
            className={cn(textareaCls, "resize-none", fullscreen ? "flex-1 min-h-0" : "h-72")}
          />
        </div>

        {/* Results */}
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <div className="flex items-center gap-2 shrink-0">
            <p className="font-mono text-[11px] tracking-wider text-foreground-muted uppercase">— matches</p>
            {test && !error && (
              <span className={cn(
                "font-mono text-[10px] px-2 py-0.5 border",
                matches.length > 0
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-border bg-surface text-foreground-muted"
              )}>
                {matches.length} {matches.length === 1 ? "match" : "matches"}
              </span>
            )}
            {!flags.includes("g") && matches.length > 0 && (
              <span className="font-mono text-[10px] text-foreground-muted/50">(first only — g is off)</span>
            )}
          </div>

          {/* Highlighted view */}
          {test && (
            <div
              className={cn(
                "border border-border bg-surface p-4 font-mono text-xs leading-relaxed text-foreground overflow-auto whitespace-pre-wrap break-words",
                fullscreen ? "shrink-0 max-h-40" : ""
              )}
              style={{ minHeight: "6rem", maxHeight: fullscreen ? undefined : "18rem" }}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          )}

          {/* Match list */}
          {matches.length > 0 && (
            <div className={cn("space-y-1 overflow-auto", fullscreen ? "flex-1 min-h-0" : "")} style={fullscreen ? undefined : { maxHeight: "10rem" }}>
              {matches.map((m, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2 border border-border bg-surface text-xs font-mono">
                  <span className="text-foreground-muted/50 shrink-0 w-6 text-right">{i + 1}</span>
                  <span className="text-yellow-300 flex-1 break-all">{m.value || "(empty match)"}</span>
                  {m.groups.some(Boolean) && (
                    <span className="text-foreground-muted shrink-0">[{m.groups.map((g, gi) => `$${gi+1}:${g ?? "?"}`).join(" ")}]</span>
                  )}
                  <span className="text-foreground-muted shrink-0">@{m.index}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
