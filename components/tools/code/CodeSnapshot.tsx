"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";
import scala from "highlight.js/lib/languages/scala";
import { cn } from "@/lib/utils/cn";

// ── Register languages ────────────────────────────────────────────────────────
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", c);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("php", php);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("scala", scala);

// ── Types ─────────────────────────────────────────────────────────────────────
interface ThemeConfig {
  background: string; foreground: string;
  keyword: string; string: string; comment: string;
  number: string; func: string; classType: string;
  builtin: string; operator: string; attribute: string;
  regexp: string; literal: string; meta: string;
  addition: string; deletion: string;
}
interface Theme { id: string; name: string; dark: boolean; config: ThemeConfig; }
interface Background { id: string; name: string; style: string; }

// ── Themes ────────────────────────────────────────────────────────────────────
const THEMES: Theme[] = [
  {
    id: "one-dark", name: "One Dark", dark: true,
    config: {
      background: "#282c34", foreground: "#abb2bf",
      keyword: "#c678dd", string: "#98c379", comment: "#5c6370",
      number: "#d19a66", func: "#61afef", classType: "#e5c07b",
      builtin: "#56b6c2", operator: "#56b6c2", attribute: "#e06c75",
      regexp: "#98c379", literal: "#d19a66", meta: "#c678dd",
      addition: "#98c379", deletion: "#e06c75",
    },
  },
  {
    id: "dracula", name: "Dracula", dark: true,
    config: {
      background: "#282a36", foreground: "#f8f8f2",
      keyword: "#ff79c6", string: "#f1fa8c", comment: "#6272a4",
      number: "#bd93f9", func: "#50fa7b", classType: "#8be9fd",
      builtin: "#8be9fd", operator: "#ff79c6", attribute: "#50fa7b",
      regexp: "#f1fa8c", literal: "#bd93f9", meta: "#ff79c6",
      addition: "#50fa7b", deletion: "#ff5555",
    },
  },
  {
    id: "github-dark", name: "GitHub Dark", dark: true,
    config: {
      background: "#0d1117", foreground: "#c9d1d9",
      keyword: "#ff7b72", string: "#a5d6ff", comment: "#8b949e",
      number: "#79c0ff", func: "#d2a8ff", classType: "#ffa657",
      builtin: "#79c0ff", operator: "#ff7b72", attribute: "#a5d6ff",
      regexp: "#a5d6ff", literal: "#79c0ff", meta: "#e3b341",
      addition: "#56d364", deletion: "#ff7b72",
    },
  },
  {
    id: "github-light", name: "GitHub Light", dark: false,
    config: {
      background: "#ffffff", foreground: "#24292e",
      keyword: "#d73a49", string: "#032f62", comment: "#6a737d",
      number: "#005cc5", func: "#6f42c1", classType: "#e36209",
      builtin: "#005cc5", operator: "#d73a49", attribute: "#22863a",
      regexp: "#032f62", literal: "#005cc5", meta: "#e36209",
      addition: "#22863a", deletion: "#d73a49",
    },
  },
  {
    id: "nord", name: "Nord", dark: true,
    config: {
      background: "#2e3440", foreground: "#d8dee9",
      keyword: "#81a1c1", string: "#a3be8c", comment: "#616e88",
      number: "#b48ead", func: "#88c0d0", classType: "#8fbcbb",
      builtin: "#88c0d0", operator: "#81a1c1", attribute: "#a3be8c",
      regexp: "#ebcb8b", literal: "#b48ead", meta: "#d08770",
      addition: "#a3be8c", deletion: "#bf616a",
    },
  },
  {
    id: "monokai", name: "Monokai", dark: true,
    config: {
      background: "#272822", foreground: "#f8f8f2",
      keyword: "#f92672", string: "#e6db74", comment: "#75715e",
      number: "#ae81ff", func: "#a6e22e", classType: "#a6e22e",
      builtin: "#66d9ef", operator: "#f92672", attribute: "#a6e22e",
      regexp: "#f92672", literal: "#ae81ff", meta: "#f92672",
      addition: "#a6e22e", deletion: "#f92672",
    },
  },
  {
    id: "ayu-dark", name: "Ayu Dark", dark: true,
    config: {
      background: "#0d1018", foreground: "#b3b1ad",
      keyword: "#ff8f40", string: "#aad94c", comment: "#626a73",
      number: "#e6b450", func: "#ffd173", classType: "#39bae6",
      builtin: "#39bae6", operator: "#f29668", attribute: "#aad94c",
      regexp: "#95e6cb", literal: "#d2a6ff", meta: "#f07178",
      addition: "#aad94c", deletion: "#f07178",
    },
  },
  {
    id: "solarized", name: "Solarized", dark: false,
    config: {
      background: "#fdf6e3", foreground: "#657b83",
      keyword: "#859900", string: "#2aa198", comment: "#93a1a1",
      number: "#d33682", func: "#268bd2", classType: "#b58900",
      builtin: "#268bd2", operator: "#cb4b16", attribute: "#268bd2",
      regexp: "#2aa198", literal: "#d33682", meta: "#cb4b16",
      addition: "#859900", deletion: "#dc322f",
    },
  },
];

// Dark ↔ Light pairing for toggle
const TOGGLE_PAIR: Record<string, string> = {
  "one-dark": "github-light",
  "dracula": "solarized",
  "github-dark": "github-light",
  "nord": "github-light",
  "monokai": "solarized",
  "ayu-dark": "github-light",
  "github-light": "one-dark",
  "solarized": "dracula",
};

// ── Backgrounds ───────────────────────────────────────────────────────────────
const BACKGROUNDS: Background[] = [
  { id: "sunset", name: "Sunset", style: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)" },
  { id: "ocean", name: "Ocean", style: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)" },
  { id: "forest", name: "Forest", style: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)" },
  { id: "candy", name: "Candy", style: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)" },
  { id: "night", name: "Night", style: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" },
  { id: "amethyst", name: "Amethyst", style: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" },
  { id: "gold", name: "Gold", style: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" },
  { id: "arctic", name: "Arctic", style: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)" },
  { id: "rose", name: "Rose", style: "linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)" },
  { id: "space", name: "Space", style: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
];

const LANGUAGES = [
  { id: "javascript", name: "JavaScript" }, { id: "typescript", name: "TypeScript" },
  { id: "python", name: "Python" }, { id: "java", name: "Java" },
  { id: "cpp", name: "C++" }, { id: "c", name: "C" },
  { id: "go", name: "Go" }, { id: "rust", name: "Rust" },
  { id: "swift", name: "Swift" }, { id: "kotlin", name: "Kotlin" },
  { id: "php", name: "PHP" }, { id: "ruby", name: "Ruby" },
  { id: "scala", name: "Scala" }, { id: "css", name: "CSS" },
  { id: "html", name: "HTML" }, { id: "json", name: "JSON" },
  { id: "yaml", name: "YAML" }, { id: "bash", name: "Bash" },
  { id: "markdown", name: "Markdown" },
];

const PADDING_OPTIONS = [
  { id: "xs", label: "XS", value: 16 },
  { id: "sm", label: "S", value: 28 },
  { id: "md", label: "M", value: 40 },
  { id: "lg", label: "L", value: 56 },
  { id: "xl", label: "XL", value: 72 },
  { id: "xxl", label: "XXL", value: 96 },
  { id: "3xl", label: "3XL", value: 128 },
];

const FONT_SIZES = [12, 13, 14, 15, 16];

// ── Theme CSS ─────────────────────────────────────────────────────────────────
function buildThemeCSS(scope: string, c: ThemeConfig): string {
  return `
    ${scope} .hljs                    { color: ${c.foreground}; }
    ${scope} .hljs-keyword            { color: ${c.keyword}; }
    ${scope} .hljs-operator           { color: ${c.operator}; }
    ${scope} .hljs-string             { color: ${c.string}; }
    ${scope} .hljs-comment            { color: ${c.comment}; font-style: italic; }
    ${scope} .hljs-number             { color: ${c.number}; }
    ${scope} .hljs-literal            { color: ${c.literal}; }
    ${scope} .hljs-title              { color: ${c.func}; }
    ${scope} .hljs-title.class_       { color: ${c.classType}; }
    ${scope} .hljs-title.function_    { color: ${c.func}; }
    ${scope} .hljs-function           { color: ${c.func}; }
    ${scope} .hljs-built_in           { color: ${c.builtin}; }
    ${scope} .hljs-variable           { color: ${c.foreground}; }
    ${scope} .hljs-variable.language_ { color: ${c.keyword}; }
    ${scope} .hljs-attr               { color: ${c.attribute}; }
    ${scope} .hljs-attribute          { color: ${c.attribute}; }
    ${scope} .hljs-name               { color: ${c.func}; }
    ${scope} .hljs-tag                { color: ${c.keyword}; }
    ${scope} .hljs-type               { color: ${c.classType}; }
    ${scope} .hljs-class              { color: ${c.classType}; }
    ${scope} .hljs-punctuation        { color: ${c.foreground}99; }
    ${scope} .hljs-symbol             { color: ${c.number}; }
    ${scope} .hljs-meta               { color: ${c.meta}; }
    ${scope} .hljs-meta .hljs-string  { color: ${c.string}; }
    ${scope} .hljs-section            { color: ${c.func}; font-weight: 600; }
    ${scope} .hljs-subst              { color: ${c.foreground}; }
    ${scope} .hljs-regexp             { color: ${c.regexp}; }
    ${scope} .hljs-selector-class     { color: ${c.func}; }
    ${scope} .hljs-selector-id        { color: ${c.number}; }
    ${scope} .hljs-property           { color: ${c.attribute}; }
    ${scope} .hljs-params             { color: ${c.foreground}; }
    ${scope} .hljs-addition           { color: ${c.addition}; background: ${c.addition}22; }
    ${scope} .hljs-deletion           { color: ${c.deletion}; background: ${c.deletion}22; }
    ${scope} .hljs-link               { color: ${c.string}; text-decoration: underline; }
    ${scope} .hljs-emphasis           { font-style: italic; }
    ${scope} .hljs-strong             { font-weight: 700; }
  `;
}

// ── Default code ──────────────────────────────────────────────────────────────
const DEFAULT_CODE = `async function fetchUser(id: string) {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error("Not found");
  return res.json() as Promise<User>;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}`;

const MONO = '"JetBrains Mono", ui-monospace, "Cascadia Mono", "Fira Mono", Menlo, Consolas, monospace';

// ── Control style constants (match project design language) ──────────────────
const labelCls = "font-mono text-[10px] uppercase tracking-wider text-foreground-muted/60 mb-1 block";
const ctrlSelectCls = "w-full font-mono text-sm bg-surface-muted border border-border px-3 py-2 text-foreground outline-none focus:border-foreground-muted";
const ctrlBtnCls = "font-mono text-[10px] px-3 py-1.5 border border-border text-foreground-muted hover:text-foreground transition-colors";
const ctrlBtnActiveCls = "border-primary/40 bg-primary/10 text-primary";

// ── Component ─────────────────────────────────────────────────────────────────
export function CodeSnapshot() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("typescript");
  const [themeId, setThemeId] = useState("one-dark");
  const [bgId, setBgId] = useState("sunset");
  const [showBg, setShowBg] = useState(true);
  const [paddingId, setPaddingId] = useState("md");
  const [fontSize, setFontSize] = useState(14);
  const [lineNums, setLineNums] = useState(false);
  const [fileName, setFileName] = useState("snippet.ts");
  const [winStyle, setWinStyle] = useState<"mac" | "windows" | "none">("mac");
  const [rounded, setRounded] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const bg = BACKGROUNDS.find((b) => b.id === bgId) ?? BACKGROUNDS[0];
  const padding = PADDING_OPTIONS.find((p) => p.id === paddingId)?.value ?? 40;

  // ── Syntax highlight ────────────────────────────────────────────────────────
  const highlighted = useMemo(() => {
    if (!code.trim()) return "";
    try {
      return hljs.highlight(code, { language, ignoreIllegals: true }).value;
    } catch {
      return hljs.highlightAuto(code).value;
    }
  }, [code, language]);

  // ── Sync textarea height to rendered pre ────────────────────────────────────
  useEffect(() => {
    if (!preRef.current || !textareaRef.current) return;
    const h = preRef.current.scrollHeight;
    textareaRef.current.style.height = h + "px";
  }, [highlighted, fontSize]);

  // ── Fullscreen keyboard ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  // ── Dark/Light toggle ────────────────────────────────────────────────────────
  const toggleDarkLight = useCallback(() => {
    setThemeId((prev) => TOGGLE_PAIR[prev] ?? (theme.dark ? "github-light" : "one-dark"));
  }, [theme.dark]);

  // ── Export ───────────────────────────────────────────────────────────────────
  const exportPng = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    // blur textarea to hide caret in capture
    textareaRef.current?.blur();
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(canvasRef.current, { pixelRatio: 2, cacheBust: true, skipFonts: true });
      const a = document.createElement("a");
      a.download = `${(fileName || "snippet").replace(/\.[^.]+$/, "")}-snapshot.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [fileName]);

  // ── Theme CSS + radius overrides (scoped) ────────────────────────────────────
  // Uses element+class selectors (specificity 0,1,1) to beat the global
  // `* { border-radius: 0 !important }` reset (specificity 0,0,0).
  const themeCSS = useMemo(() => {
    const base = buildThemeCSS(".cs-scope", theme.config);
    const outerRStr = rounded ? "20px" : "0px";
    const innerRStr = rounded ? "16px" : "0px";
    return base + `
      div.cs-outer           { border-radius: ${outerRStr} !important; }
      div.cs-scope           { border-radius: ${outerRStr} !important; }
      div.cs-scope .cs-card  { border-radius: ${innerRStr} !important; }
      div.cs-scope .cs-circle{ border-radius: 50%         !important; }
    `;
  }, [theme, rounded]);

  const cardShadow = theme.dark
    ? "0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)"
    : "0 32px 80px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.12)";

  const outerR = rounded ? 20 : 0;
  const innerR = rounded ? 16 : 0;

  // Checkerboard masking layer — shown behind the canvas when bg is off
  const checkerBg: React.CSSProperties = {
    backgroundImage: [
      "linear-gradient(45deg,rgba(180,180,180,.08) 25%,transparent 25%)",
      "linear-gradient(-45deg,rgba(180,180,180,.08) 25%,transparent 25%)",
      "linear-gradient(45deg,transparent 75%,rgba(180,180,180,.08) 75%)",
      "linear-gradient(-45deg,transparent 75%,rgba(180,180,180,.08) 75%)",
    ].join(","),
    backgroundSize: "14px 14px",
    backgroundPosition: "0 0, 0 7px, 7px -7px, -7px 0",
    backgroundColor: "#0d0d0d",
  };

  // ── Rendered preview card (shared between normal and fullscreen) ─────────────
  const previewCard = (
    // Outer visual frame — clips to rounded corners; holds checkerboard bg
    <div
      className="cs-outer relative w-full overflow-hidden"
      style={{ borderRadius: outerR }}
    >
      {/* Masking layer — always behind; visible through transparent canvas */}
      <div className="absolute inset-0" style={checkerBg} />

      {/* Export canvas — gradient when bg on, transparent when off */}
      <div
        ref={canvasRef}
        className="cs-scope relative w-full flex items-center justify-center"
        style={{
          background: showBg ? bg.style : "transparent",
          padding: padding,
          transition: "background 0.2s, padding 0.15s",
          borderRadius: outerR,
        }}
      >
        {/* Code card */}
        <div
          className="cs-card w-full"
          style={{
            background: theme.config.background,
            overflow: "hidden",
            boxShadow: cardShadow,
            borderRadius: innerR,
          }}
        >
          {/* Window header — macOS */}
          {winStyle === "mac" && (
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: `1px solid ${theme.config.foreground}14` }}
            >
              {/* Traffic lights — round */}
              <span className="w-3 h-3 cs-circle flex-shrink-0" style={{ background: "#ff5f57" }} />
              <span className="w-3 h-3 cs-circle flex-shrink-0" style={{ background: "#febc2e" }} />
              <span className="w-3 h-3 cs-circle flex-shrink-0" style={{ background: "#28c840" }} />
              {/* Editable filename */}
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="ml-2 bg-transparent border-none outline-none font-mono text-xs min-w-0 flex-1"
                style={{
                  color: theme.config.foreground,
                  opacity: 0.5,
                  fontFamily: MONO,
                  caretColor: theme.config.foreground,
                }}
                placeholder="filename.ts"
              />
            </div>
          )}

          {/* Window header — Windows */}
          {winStyle === "windows" && (
            <div
              className="flex items-center px-3 py-2"
              style={{ borderBottom: `1px solid ${theme.config.foreground}14` }}
            >
              {/* Editable filename — left aligned */}
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-transparent border-none outline-none font-mono text-xs min-w-0 flex-1"
                style={{
                  color: theme.config.foreground,
                  opacity: 0.5,
                  fontFamily: MONO,
                  caretColor: theme.config.foreground,
                }}
                placeholder="filename.ts"
              />
              {/* Windows-style control buttons — square */}
              <div className="flex items-center gap-0 flex-shrink-0 ml-2">
                <span
                  className="flex items-center justify-center w-[30px] h-[22px] text-[12px] leading-none"
                  style={{ color: theme.config.foreground, opacity: 0.45 }}
                >─</span>
                <span
                  className="flex items-center justify-center w-[30px] h-[22px] text-[10px] leading-none"
                  style={{ color: theme.config.foreground, opacity: 0.45, borderColor: `${theme.config.foreground}30` }}
                >□</span>
                <span
                  className="flex items-center justify-center w-[30px] h-[22px] text-[12px] leading-none"
                  style={{ color: theme.config.foreground, opacity: 0.45 }}
                >✕</span>
              </div>
            </div>
          )}

          {/* Code body */}
          <div className="flex overflow-x-auto" style={{ padding: "18px 22px" }}>
            {/* Line numbers */}
            {lineNums && (
              <div
                className="select-none shrink-0 pr-5 text-right"
                style={{
                  fontFamily: MONO, fontSize, lineHeight: 1.65,
                  color: theme.config.foreground, opacity: 0.2,
                  userSelect: "none", pointerEvents: "none",
                }}
              >
                {code.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
            )}

            {/* Highlighted code + transparent textarea overlay */}
            <div className="flex-1 min-w-0 relative">
              <pre
                ref={preRef}
                className="m-0 p-0"
                style={{
                  fontFamily: MONO, fontSize, lineHeight: 1.65,
                  background: "transparent", whiteSpace: "pre",
                  pointerEvents: "none",
                }}
              >
                <code
                  className={`hljs language-${language}`}
                  dangerouslySetInnerHTML={{ __html: highlighted || "" }}
                  style={{ background: "transparent", padding: 0, fontFamily: "inherit", fontSize: "inherit" }}
                />
              </pre>

              {/* Transparent textarea for editing */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="absolute inset-0 w-full resize-none border-0 outline-none overflow-hidden"
                style={{
                  fontFamily: MONO, fontSize, lineHeight: 1.65,
                  background: "transparent",
                  color: "transparent",
                  caretColor: theme.config.foreground,
                  padding: 0, margin: 0,
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Injected theme CSS */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

      {/* ── Fullscreen overlay ────────────────────────────────────────────────── */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#000000cc" }}>
          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            <div className="w-full max-w-4xl">{previewCard}</div>
          </div>
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 font-mono text-[11px] uppercase tracking-wider text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 transition-colors"
          >
            ✕ Exit (Esc)
          </button>
        </div>
      )}

      {/* ── Preview ──────────────────────────────────────────────────────────── */}
      <div className="relative group">
        {!fullscreen && previewCard}

        {/* Fullscreen button overlay */}
        {!fullscreen && (
          <button
            onClick={() => setFullscreen(true)}
            title="Fullscreen"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] uppercase tracking-wider px-2.5 py-1.5 border border-white/30 text-white/70 hover:text-white hover:border-white/60 bg-black/30 backdrop-blur-sm"
          >
            ⛶
          </button>
        )}
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────────── */}
      <div className="border border-border bg-surface p-4 space-y-4">

        {/* Language + Theme */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>— language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={ctrlSelectCls}>
              {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>— theme</label>
            <select value={themeId} onChange={(e) => setThemeId(e.target.value)} className={ctrlSelectCls}>
              {THEMES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Window + Padding + Font size */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>— window</label>
            <select value={winStyle} onChange={(e) => setWinStyle(e.target.value as "mac" | "windows" | "none")} className={ctrlSelectCls}>
              <option value="mac">macOS</option>
              <option value="windows">Windows</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>— padding</label>
            <select value={paddingId} onChange={(e) => setPaddingId(e.target.value)} className={ctrlSelectCls}>
              {PADDING_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>— font size</label>
            <select value={String(fontSize)} onChange={(e) => setFontSize(Number(e.target.value))} className={ctrlSelectCls}>
              {FONT_SIZES.map((s) => <option key={s} value={String(s)}>{s}px</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row justify-evenly">
          {/* Options */}
          <div>
            <span className={labelCls}>— options</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={toggleDarkLight} className={cn(ctrlBtnCls, theme.dark && ctrlBtnActiveCls)}>
                {theme.dark ? "✓ " : ""}Dark mode
              </button>
              <button type="button" onClick={() => setShowBg((v) => !v)} className={cn(ctrlBtnCls, showBg && ctrlBtnActiveCls)}>
                {showBg ? "✓ " : ""}background
              </button>
              <button type="button" onClick={() => setRounded((v) => !v)} className={cn(ctrlBtnCls, rounded && ctrlBtnActiveCls)}>
                {rounded ? "✓ " : ""}rounded
              </button>
              <button type="button" onClick={() => setLineNums((v) => !v)} className={cn(ctrlBtnCls, lineNums && ctrlBtnActiveCls)}>
                {lineNums ? "✓ " : ""}line numbers
              </button>
            </div>
          </div>

          {/* Background swatches */}
          <div>
            <span className={labelCls}>— background</span>
            <div className="flex flex-wrap gap-2">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  title={b.name}
                  onClick={() => { setBgId(b.id); setShowBg(true); }}
                  className={cn(
                    "w-6 h-6 flex-shrink-0",
                    bgId === b.id && showBg
                      ? "ring-2 ring-offset-1 ring-foreground ring-offset-surface scale-110"
                      : "opacity-60 hover:opacity-100 hover:scale-110",
                  )}
                  style={{ background: b.style, borderRadius: 3 }}
                />
              ))}
            </div>
          </div>

        </div>
        {/* Export */}
        <div className="flex  border-t border-border pt-3">
          <button
            type="button"
            onClick={exportPng}
            disabled={exporting || !code.trim()}
            className={cn(
              "w-full font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 border transition-colors",
              exporting || !code.trim()
                ? "border-border text-foreground-muted/30 cursor-not-allowed"
                : "border-primary/60 text-primary hover:bg-primary/8",
            )}
          >
            {exporting ? "Exporting…" : "↓ Export PNG"}
          </button>
        </div>

      </div>
    </div>
  );
}
