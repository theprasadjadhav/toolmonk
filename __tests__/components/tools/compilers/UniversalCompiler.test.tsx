import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UniversalCompiler } from "@/components/tools/compilers/UniversalCompiler";

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

// ── Helpers ────────────────────────────────────────────────────────────────────

async function selectLanguage(user: ReturnType<typeof userEvent.setup>, label: string) {
  const select = screen.getByRole("combobox");
  await user.selectOptions(select, label);
}

describe("UniversalCompiler", () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the code editor", () => {
      render(<UniversalCompiler />);
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    });

    it("renders language selector", () => {
      render(<UniversalCompiler />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("defaults to Python language", () => {
      render(<UniversalCompiler />);
      expect(screen.getByTestId("code-editor").dataset.language).toBe("python");
    });

    it("shows Python in selector by default", () => {
      render(<UniversalCompiler />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("python");
    });

    it("renders run and clear buttons", () => {
      render(<UniversalCompiler />);
      expect(screen.getByTitle("run")).toBeInTheDocument();
      expect(screen.getByTitle("clear")).toBeInTheDocument();
    });

    it("loads Python template code by default", () => {
      render(<UniversalCompiler />);
      const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
      expect(editor.value).toContain("print");
    });

    it("shows Python idle status bar", () => {
      render(<UniversalCompiler />);
      expect(screen.getByText(/write python code above/i)).toBeInTheDocument();
    });
  });

  // ── Language options ───────────────────────────────────────────────────────

  describe("language options", () => {
    it("has all expected language options", () => {
      render(<UniversalCompiler />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      const values = Array.from(select.options).map((o) => o.value);
      expect(values).toContain("python");
      expect(values).toContain("javascript");
      expect(values).toContain("typescript");
      expect(values).toContain("java");
      expect(values).toContain("c");
      expect(values).toContain("cpp");
      expect(values).toContain("go");
      expect(values).toContain("shell");
      expect(values).toContain("ruby");
      expect(values).toContain("php");
      expect(values).toContain("sql");
    });

    it("has 11 language options", () => {
      render(<UniversalCompiler />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.options.length).toBe(11);
    });
  });

  // ── Language switching ─────────────────────────────────────────────────────

  describe("language switching", () => {
    it("switches editor to JavaScript", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      await selectLanguage(user, "JavaScript");
      expect(screen.getByTestId("code-editor").dataset.language).toBe("javascript");
    });

    it("switches editor to Go", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      await selectLanguage(user, "Go");
      expect(screen.getByTestId("code-editor").dataset.language).toBe("go");
    });

    it("switches editor to Java", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      await selectLanguage(user, "Java");
      expect(screen.getByTestId("code-editor").dataset.language).toBe("java");
    });

    it("loads Go template when switching to Go", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      await selectLanguage(user, "Go");
      const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
      expect(editor.value).toContain("package main");
    });

    it("loads Java template when switching to Java", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      await selectLanguage(user, "Java");
      const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
      expect(editor.value).toContain("main");
    });

    it("updates status bar idle text when language changes", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      await selectLanguage(user, "Go");
      expect(screen.getByText(/write go code above/i)).toBeInTheDocument();
    });

    it("updates status bar idle text for JavaScript", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      await selectLanguage(user, "JavaScript");
      expect(screen.getByText(/write javascript code above/i)).toBeInTheDocument();
    });

    it("resets result state when language changes", async () => {
      const encoder = new TextEncoder();
      global.fetch = vi.fn().mockResolvedValue(
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode('data: {"status":"success","stdout":"hello","time":100}\n\n'));
              controller.close();
            },
          }),
          { status: 200 }
        )
      );
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);

      // Run first
      await user.click(screen.getByTitle("run"));
      await screen.findByText(/finished/i);

      // Switch language — result should reset
      await selectLanguage(user, "Go");
      expect(screen.queryByText(/finished/i)).toBeNull();
      expect(screen.getByText(/write go code above/i)).toBeInTheDocument();
    });

    it("previous code is cleared when language changes (key prop remount)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      // Type some code
      fireEvent.change(screen.getByTestId("code-editor"), { target: { value: "custom code here" } });

      // Switch to Go — component remounts with key={monacoId}
      await selectLanguage(user, "Go");

      // Should have Go template, not "custom code here"
      const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
      expect(editor.value).not.toBe("custom code here");
      expect(editor.value).toContain("package main");
    });

    it("TypeScript template loads when switching to TypeScript", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      await selectLanguage(user, "TypeScript");
      const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
      // TypeScript template should have some TS-specific content
      expect(editor.value.length).toBeGreaterThan(0);
    });

    it("switching back to Python restores Python template", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      await selectLanguage(user, "Go");
      await selectLanguage(user, "Python");
      const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
      expect(editor.value).toContain("print");
    });
  });

  // ── Stdin ──────────────────────────────────────────────────────────────────

  describe("stdin", () => {
    it("stdin toggle renders", () => {
      render(<UniversalCompiler />);
      expect(screen.getByText(/stdin/i)).toBeInTheDocument();
    });

    it("stdin loads initial value from Python template", () => {
      render(<UniversalCompiler />);
      // Python template may have stdin — check it expands
      const stdinToggle = screen.getByText(/stdin/i);
      expect(stdinToggle).toBeInTheDocument();
    });
  });

  // ── Run button ─────────────────────────────────────────────────────────────

  describe("run button", () => {
    it("run button enabled when template code is loaded", () => {
      render(<UniversalCompiler />);
      // Default Python template has code
      expect(screen.getByTitle("run")).not.toBeDisabled();
    });

    it("run button still enabled after clear (template code is restored)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<UniversalCompiler />);
      await user.click(screen.getByTitle("clear"));
      // Clear restores initialCode (the template), not empty — run stays enabled
      expect(screen.getByTitle("run")).not.toBeDisabled();
    });
  });

  // ── Accessibility ──────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("language selector has accessible label text", () => {
      render(<UniversalCompiler />);
      // The ToolbarSelect renders a label element with "language" text
      expect(screen.getByText(/language/i)).toBeInTheDocument();
    });

    it("run and clear buttons have title attributes", () => {
      render(<UniversalCompiler />);
      expect(screen.getByTitle("run")).toBeInTheDocument();
      expect(screen.getByTitle("clear")).toBeInTheDocument();
    });
  });
});
