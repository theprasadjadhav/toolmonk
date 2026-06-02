export interface Language {
  /** Monaco language identifier */
  monacoId: string;
  /** Runner language name (matches server.js LANGUAGES key) */
  runtime: string;
  /** Runner version string — "*" = latest */
  version: string;
  /** File extension for the source file */
  fileExt: string;
  /** Human-readable label */
  label: string;
  /** Version shown in UI / FAQs */
  versionLabel: string;
}

export const LANGUAGES: Language[] = [
  { monacoId: "python",      runtime: "python",     version: "*", fileExt: "py",   label: "Python",     versionLabel: "Python 3" },
  { monacoId: "javascript",  runtime: "javascript", version: "*", fileExt: "js",   label: "JavaScript", versionLabel: "Node.js 20" },
  { monacoId: "typescript",  runtime: "typescript", version: "*", fileExt: "ts",   label: "TypeScript", versionLabel: "TypeScript 5" },
  { monacoId: "java",        runtime: "java",       version: "*", fileExt: "java", label: "Java",       versionLabel: "Java 21" },
  { monacoId: "c",           runtime: "c",          version: "*", fileExt: "c",    label: "C",          versionLabel: "C (GCC 13)" },
  { monacoId: "cpp",         runtime: "c++",        version: "*", fileExt: "cpp",  label: "C++",        versionLabel: "C++ (GCC 13)" },
  { monacoId: "go",          runtime: "go",         version: "*", fileExt: "go",   label: "Go",         versionLabel: "Go 1.22" },
  { monacoId: "shell",       runtime: "bash",       version: "*", fileExt: "sh",   label: "Bash",       versionLabel: "Bash 5" },
  { monacoId: "ruby",        runtime: "ruby",       version: "*", fileExt: "rb",   label: "Ruby",       versionLabel: "Ruby 3" },
  { monacoId: "php",         runtime: "php",        version: "*", fileExt: "php",  label: "PHP",        versionLabel: "PHP 8" },
  { monacoId: "sql",         runtime: "sqlite3",    version: "*", fileExt: "sql",  label: "SQLite",     versionLabel: "SQLite 3" },
];

/** Lookup by runner runtime name */
export const LANGUAGE_BY_RUNTIME = new Map(
  LANGUAGES.map((l) => [l.runtime, l])
);

/** Lookup by Monaco language id */
export const LANGUAGE_BY_MONACO = new Map(
  LANGUAGES.map((l) => [l.monacoId, l])
);

/** Set of allowed runtime names (used for allowlist validation) */
export const ALLOWED_RUNTIMES = new Set(LANGUAGES.map((l) => l.runtime));

/** Options for the language selector dropdown */
export const LANGUAGE_OPTIONS = LANGUAGES.map((l) => ({
  value: l.monacoId,
  label: l.label,
}));
