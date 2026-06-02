import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SyntaxDiff } from "@/components/tools/comparators/SyntaxDiff";

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock("@/components/ui/CodePanel", () => ({
  DiffPanel: ({
    left, right, onLeftChange, onRightChange, language,
    onDiffChange, onMarkersChange, onFormatReady,
  }: {
    left: string; right: string;
    onLeftChange: (v: string) => void; onRightChange: (v: string) => void;
    language?: string;
    onDiffChange?: (count: number) => void;
    onMarkersChange?: (l: string[], r: string[]) => void;
    onFormatReady?: (fn: () => void) => void;
    className?: string;
  }) => {
    // Expose a stable format trigger by calling onFormatReady with a mock fn
    React.useEffect(() => {
      if (onFormatReady) {
        onFormatReady(() => {});
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div data-testid="diff-panel" data-language={language}>
        <textarea
          data-testid="left-editor"
          value={left}
          onChange={(e) => onLeftChange(e.target.value)}
        />
        <textarea
          data-testid="right-editor"
          value={right}
          onChange={(e) => onRightChange(e.target.value)}
        />
        <button type="button" data-testid="simulate-diff-3" onClick={() => onDiffChange?.(3)}>
          sim diff 3
        </button>
        <button type="button" data-testid="simulate-diff-0" onClick={() => onDiffChange?.(0)}>
          sim diff 0
        </button>
        <button
          type="button"
          data-testid="simulate-markers-left"
          onClick={() => onMarkersChange?.(["line 1: Identifier expected"], [])}
        >
          left marker error
        </button>
        <button
          type="button"
          data-testid="simulate-markers-right"
          onClick={() => onMarkersChange?.([], ["line 2: Missing semicolon"])}
        >
          right marker error
        </button>
        <button
          type="button"
          data-testid="simulate-markers-both"
          onClick={() => onMarkersChange?.(["err A1", "err A2"], ["err B1"])}
        >
          both marker errors
        </button>
        <button
          type="button"
          data-testid="simulate-markers-clear"
          onClick={() => onMarkersChange?.([], [])}
        >
          clear markers
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/tool/ToolPanel", () => ({
  useToolFullscreen: () => false,
  FullscreenButton: () => <button type="button">fullscreen</button>,
}));

vi.mock("@/lib/utils/file", () => ({
  uploadText: vi.fn().mockResolvedValue(null),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function setLeft(value: string) {
  fireEvent.change(screen.getByTestId("left-editor"), { target: { value } });
}
function setRight(value: string) {
  fireEvent.change(screen.getByTestId("right-editor"), { target: { value } });
}

describe("SyntaxDiff", () => {
  // ── Non-marker languages (Python, Java, Go, etc.) ─────────────────────────

  describe("non-marker languages (python)", () => {
    it("renders with python language", () => {
      render(<SyntaxDiff language="python" />);
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("python");
    });

    it("shows language-specific placeholder", () => {
      render(<SyntaxDiff language="python" placeholder="paste python code here" />);
      expect(screen.getByText("paste python code here")).toBeInTheDocument();
    });

    it("uses default placeholder with language name when none provided", () => {
      render(<SyntaxDiff language="java" />);
      expect(screen.getByText(/paste java into both panels/i)).toBeInTheDocument();
    });

    it("shows diff count for non-marker language", () => {
      render(<SyntaxDiff language="python" />);
      setLeft("def hello(): pass");
      setRight("def world(): pass");
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText("3 lines differ")).toBeInTheDocument();
    });

    it("shows identical for non-marker language when 0 diffs", () => {
      render(<SyntaxDiff language="python" />);
      setLeft("a = 1");
      setRight("a = 1");
      fireEvent.click(screen.getByTestId("simulate-diff-0"));
      expect(screen.getByText("identical")).toBeInTheDocument();
    });

    it("does not show format button for python (not a FORMAT_LANGUAGE)", () => {
      render(<SyntaxDiff language="python" />);
      expect(screen.queryByTitle("format")).toBeNull();
    });

    it("does not render marker simulation buttons effect for python", () => {
      render(<SyntaxDiff language="python" />);
      // No marker errors shown even when simulated (handler is undefined)
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      // Should not show marker error UI
      expect(screen.queryByText(/syntax error/i)).toBeNull();
    });
  });

  // ── Marker languages (JavaScript, TypeScript, CSS) ────────────────────────

  describe("marker languages", () => {
    it("uses javascript language", () => {
      render(<SyntaxDiff language="javascript" />);
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("javascript");
    });

    it("shows left panel marker errors", () => {
      render(<SyntaxDiff language="javascript" />);
      setLeft("const x = ;");
      setRight("const y = 1;");
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      expect(screen.getByText(/a — 1 syntax error/i)).toBeInTheDocument();
    });

    it("shows right panel marker errors", () => {
      render(<SyntaxDiff language="javascript" />);
      setLeft("const x = 1;");
      setRight("const y = ;");
      fireEvent.click(screen.getByTestId("simulate-markers-right"));
      expect(screen.getByText(/b — 1 syntax error/i)).toBeInTheDocument();
    });

    it("shows marker errors from both panels simultaneously", () => {
      render(<SyntaxDiff language="javascript" />);
      setLeft("bad left");
      setRight("bad right");
      fireEvent.click(screen.getByTestId("simulate-markers-both"));
      expect(screen.getByText(/a — 2 syntax error/i)).toBeInTheDocument();
      expect(screen.getByText(/b — 1 syntax error/i)).toBeInTheDocument();
    });

    it("shows individual error messages", () => {
      render(<SyntaxDiff language="javascript" />);
      setLeft("bad code");
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      expect(screen.getByText("line 1: Identifier expected")).toBeInTheDocument();
    });

    it("clearing markers removes error display", () => {
      render(<SyntaxDiff language="javascript" />);
      setLeft("x");
      setRight("y");
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      expect(screen.getByText(/syntax error/i)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("simulate-markers-clear"));
      expect(screen.queryByText(/syntax error/i)).toBeNull();
    });

    it("shows diff count after markers cleared", () => {
      render(<SyntaxDiff language="javascript" />);
      setLeft("a");
      setRight("b");
      fireEvent.click(screen.getByTestId("simulate-markers-clear"));
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText("3 lines differ")).toBeInTheDocument();
    });

    it("typescript shows marker errors", () => {
      render(<SyntaxDiff language="typescript" />);
      setLeft("bad ts");
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      expect(screen.getByText(/a — 1 syntax error/i)).toBeInTheDocument();
    });

    it("css shows marker errors", () => {
      render(<SyntaxDiff language="css" />);
      setLeft("bad css");
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      expect(screen.getByText(/a — 1 syntax error/i)).toBeInTheDocument();
    });
  });

  // ── Format languages (JS, TS, CSS, HTML) ──────────────────────────────────

  describe("format button", () => {
    it("shows format button for javascript", () => {
      render(<SyntaxDiff language="javascript" />);
      expect(screen.getByTitle("format")).toBeInTheDocument();
    });

    it("shows format button for typescript", () => {
      render(<SyntaxDiff language="typescript" />);
      expect(screen.getByTitle("format")).toBeInTheDocument();
    });

    it("shows format button for css", () => {
      render(<SyntaxDiff language="css" />);
      expect(screen.getByTitle("format")).toBeInTheDocument();
    });

    it("shows format button for html", () => {
      render(<SyntaxDiff language="html" />);
      expect(screen.getByTitle("format")).toBeInTheDocument();
    });

    it("does not show format button for go", () => {
      render(<SyntaxDiff language="go" />);
      expect(screen.queryByTitle("format")).toBeNull();
    });

    it("format button disabled when both panels empty", () => {
      render(<SyntaxDiff language="javascript" />);
      expect(screen.getByTitle("format")).toBeDisabled();
    });

    it("format button enabled when left has content", () => {
      render(<SyntaxDiff language="javascript" />);
      setLeft("const x = 1;");
      expect(screen.getByTitle("format")).not.toBeDisabled();
    });
  });

  // ── Swap and clear ─────────────────────────────────────────────────────────

  describe("swap", () => {
    it("swaps left and right content", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SyntaxDiff language="python" />);
      setLeft("left code");
      setRight("right code");

      await user.click(screen.getByTitle("swap"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("right code");
      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe("left code");
    });
  });

  describe("clear", () => {
    it("clears both panels", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SyntaxDiff language="python" />);
      setLeft("some code");
      setRight("other code");

      await user.click(screen.getByTitle("clear"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Upload accept ──────────────────────────────────────────────────────────

  describe("upload", () => {
    it("uses provided uploadAccept for file type filter", async () => {
      const { uploadText } = await import("@/lib/utils/file");
      vi.mocked(uploadText).mockResolvedValueOnce("content");
      const user = userEvent.setup({ delay: null });
      render(<SyntaxDiff language="css" uploadAccept=".css" />);

      await user.click(screen.getAllByTitle(/upload/i)[0]);
      expect(uploadText).toHaveBeenCalledWith(".css");
    });
  });

  // ── Error truncation ───────────────────────────────────────────────────────

  describe("error truncation", () => {
    it("shows up to 3 errors with overflow count", () => {
      render(<SyntaxDiff language="javascript" />);
      setLeft("bad code");
      // simulate-markers-both only gives 2 errors; we need to check "+N more"
      // For 2 errors shown inline, no overflow
      fireEvent.click(screen.getByTestId("simulate-markers-both"));
      // A has 2 errors — both shown, no overflow
      expect(screen.getByText("err A1")).toBeInTheDocument();
      expect(screen.getByText("err A2")).toBeInTheDocument();
    });
  });

  // ── Plural / singular ──────────────────────────────────────────────────────

  describe("pluralization", () => {
    it("shows singular 'syntax error' for 1 error", () => {
      render(<SyntaxDiff language="javascript" />);
      setLeft("x");
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      expect(screen.getByText(/a — 1 syntax error$/i)).toBeInTheDocument();
    });

    it("shows plural 'syntax errors' for 2+ errors", () => {
      render(<SyntaxDiff language="javascript" />);
      setLeft("x");
      setRight("y");
      fireEvent.click(screen.getByTestId("simulate-markers-both"));
      expect(screen.getByText(/a — 2 syntax errors/i)).toBeInTheDocument();
    });
  });
});
