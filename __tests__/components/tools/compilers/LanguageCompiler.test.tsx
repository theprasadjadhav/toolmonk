import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import type { Language } from "@/lib/runners/languages";

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value, onChange, language,
  }: {
    value: string;
    onChange?: (v: string | undefined) => void;
    language?: string;
  }) => (
    <textarea
      data-testid="code-editor"
      data-language={language}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

vi.mock("@/components/tool/ToolPanel", () => ({
  useToolFullscreen: () => false,
  FullscreenButton: () => <button type="button">fullscreen</button>,
}));

// ── Fixtures ───────────────────────────────────────────────────────────────────

const pythonLang: Language = {
  monacoId: "python",
  runtime: "python",
  version: "*",
  fileExt: "py",
  label: "Python",
  versionLabel: "Python 3",
};

const goLang: Language = {
  monacoId: "go",
  runtime: "go",
  version: "*",
  fileExt: "go",
  label: "Go",
  versionLabel: "Go 1.21+",
};

const javaLang: Language = {
  monacoId: "java",
  runtime: "java",
  version: "*",
  fileExt: "java",
  label: "Java",
  versionLabel: "Java 17",
};

describe("LanguageCompiler", () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the code editor", () => {
      render(<LanguageCompiler language={pythonLang} />);
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    });

    it("passes the correct Monaco language id", () => {
      render(<LanguageCompiler language={pythonLang} />);
      expect(screen.getByTestId("code-editor").dataset.language).toBe("python");
    });

    it("passes go Monaco language id", () => {
      render(<LanguageCompiler language={goLang} />);
      expect(screen.getByTestId("code-editor").dataset.language).toBe("go");
    });

    it("passes java Monaco language id", () => {
      render(<LanguageCompiler language={javaLang} />);
      expect(screen.getByTestId("code-editor").dataset.language).toBe("java");
    });

    it("renders run button", () => {
      render(<LanguageCompiler language={pythonLang} />);
      expect(screen.getByTitle("run")).toBeInTheDocument();
    });

    it("renders clear button", () => {
      render(<LanguageCompiler language={pythonLang} />);
      expect(screen.getByTitle("clear")).toBeInTheDocument();
    });

    it("renders stdin toggle", () => {
      render(<LanguageCompiler language={pythonLang} />);
      expect(screen.getByText(/stdin/i)).toBeInTheDocument();
    });
  });

  // ── Template loading ───────────────────────────────────────────────────────

  describe("template loading", () => {
    it("loads Python hello world template", () => {
      render(<LanguageCompiler language={pythonLang} />);
      const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
      // Python template should have some code (print statement)
      expect(editor.value).toContain("print");
    });

    it("loads Go template with package main", () => {
      render(<LanguageCompiler language={goLang} />);
      const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
      expect(editor.value).toContain("package main");
    });

    it("loads Java template with main method", () => {
      render(<LanguageCompiler language={javaLang} />);
      const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
      expect(editor.value).toContain("main");
    });

    it("falls back to empty code for unknown language", () => {
      const unknownLang: Language = {
        monacoId: "unknown-lang-xyz",
        runtime: "unknown",
        version: "*",
        fileExt: "txt",
        label: "Unknown",
        versionLabel: "Unknown",
      };
      render(<LanguageCompiler language={unknownLang} />);
      const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
      expect(editor.value).toBe("");
    });
  });

  // ── Status bar ─────────────────────────────────────────────────────────────

  describe("status bar", () => {
    it("shows idle status with language label", () => {
      render(<LanguageCompiler language={pythonLang} />);
      expect(screen.getByText(/run your python code/i)).toBeInTheDocument();
    });

    it("shows idle status with Go label", () => {
      render(<LanguageCompiler language={goLang} />);
      expect(screen.getByText(/run your go code/i)).toBeInTheDocument();
    });
  });

  // ── No language selector ───────────────────────────────────────────────────

  describe("no language selector", () => {
    it("does not render a language dropdown", () => {
      render(<LanguageCompiler language={pythonLang} />);
      // LanguageCompiler is fixed to one language — no combobox
      expect(screen.queryByRole("combobox")).toBeNull();
    });
  });

  // ── All supported languages render correctly ───────────────────────────────

  describe("all supported languages", () => {
    const languages: Language[] = [
      { monacoId: "python", runtime: "python", version: "*", fileExt: "py", label: "Python", versionLabel: "Python 3" },
      { monacoId: "javascript", runtime: "javascript", version: "*", fileExt: "js", label: "JavaScript", versionLabel: "Node 18" },
      { monacoId: "typescript", runtime: "typescript", version: "*", fileExt: "ts", label: "TypeScript", versionLabel: "TS 5" },
      { monacoId: "java", runtime: "java", version: "*", fileExt: "java", label: "Java", versionLabel: "Java 17" },
      { monacoId: "c", runtime: "c", version: "*", fileExt: "c", label: "C", versionLabel: "C17" },
      { monacoId: "cpp", runtime: "c++", version: "*", fileExt: "cpp", label: "C++", versionLabel: "C++17" },
      { monacoId: "go", runtime: "go", version: "*", fileExt: "go", label: "Go", versionLabel: "Go 1.21+" },
      { monacoId: "shell", runtime: "bash", version: "*", fileExt: "sh", label: "Bash", versionLabel: "Bash 5" },
      { monacoId: "ruby", runtime: "ruby", version: "*", fileExt: "rb", label: "Ruby", versionLabel: "Ruby 3" },
      { monacoId: "php", runtime: "php", version: "*", fileExt: "php", label: "PHP", versionLabel: "PHP 8" },
      { monacoId: "sql", runtime: "sqlite3", version: "*", fileExt: "sql", label: "SQLite", versionLabel: "SQLite 3" },
    ];

    for (const lang of languages) {
      it(`renders without crashing for ${lang.label}`, () => {
        const { unmount } = render(<LanguageCompiler language={lang} />);
        expect(screen.getByTestId("code-editor").dataset.language).toBe(lang.monacoId);
        unmount();
      });
    }
  });
});
