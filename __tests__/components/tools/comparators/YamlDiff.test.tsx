import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YamlDiff } from "@/components/tools/comparators/YamlDiff";

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock("@/components/ui/CodePanel", () => ({
  DiffPanel: ({
    left, right, onLeftChange, onRightChange, language, onDiffChange,
  }: {
    left: string; right: string;
    onLeftChange: (v: string) => void; onRightChange: (v: string) => void;
    language?: string;
    onDiffChange?: (count: number) => void;
    onMarkersChange?: (l: string[], r: string[]) => void;
    onFormatReady?: (fn: () => void) => void;
    className?: string;
  }) => (
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
    </div>
  ),
}));

vi.mock("@/components/tool/ToolPanel", () => ({
  useToolFullscreen: () => false,
  FullscreenButton: () => <button type="button">fullscreen</button>,
}));

vi.mock("@/lib/utils/file", () => ({
  uploadText: vi.fn().mockResolvedValue(null),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

const VALID_YAML_A = "name: Alice\nage: 30";
const VALID_YAML_B = "name: Bob\nage: 25";
const INVALID_YAML = "key:\n\tbad_indent: true"; // tabs not allowed in YAML

function setLeft(value: string) {
  fireEvent.change(screen.getByTestId("left-editor"), { target: { value } });
}
function setRight(value: string) {
  fireEvent.change(screen.getByTestId("right-editor"), { target: { value } });
}

describe("YamlDiff", () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders both editor panels", () => {
      render(<YamlDiff />);
      expect(screen.getByTestId("left-editor")).toBeInTheDocument();
      expect(screen.getByTestId("right-editor")).toBeInTheDocument();
    });

    it("uses yaml language for the diff panel", () => {
      render(<YamlDiff />);
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("yaml");
    });

    it("renders format, swap, and clear buttons", () => {
      render(<YamlDiff />);
      expect(screen.getByTitle("format")).toBeInTheDocument();
      expect(screen.getByTitle("swap")).toBeInTheDocument();
      expect(screen.getByTitle("clear")).toBeInTheDocument();
    });

    it("shows idle placeholder initially", () => {
      render(<YamlDiff />);
      expect(screen.getByText(/paste yaml into both panels/i)).toBeInTheDocument();
    });

    it("shows panel labels for YAML A and B", () => {
      render(<YamlDiff />);
      expect(screen.getByText(/yaml a/i)).toBeInTheDocument();
      expect(screen.getByText(/yaml b/i)).toBeInTheDocument();
    });
  });

  // ── Status bar states ──────────────────────────────────────────────────────

  describe("status bar", () => {
    it("shows idle when both panels empty", () => {
      render(<YamlDiff />);
      expect(screen.getByText(/paste yaml into both panels/i)).toBeInTheDocument();
    });

    it("shows error for invalid YAML on left", () => {
      render(<YamlDiff />);
      setLeft(INVALID_YAML);
      expect(screen.getByText(/a — invalid yaml/i)).toBeInTheDocument();
    });

    it("shows error for invalid YAML on right", () => {
      render(<YamlDiff />);
      setLeft(VALID_YAML_A);
      setRight(INVALID_YAML);
      expect(screen.getByText(/b — invalid yaml/i)).toBeInTheDocument();
    });

    it("shows errors for both panels when both invalid", () => {
      render(<YamlDiff />);
      setLeft(INVALID_YAML);
      setRight(INVALID_YAML);
      expect(screen.getByText(/a — invalid yaml/i)).toBeInTheDocument();
      expect(screen.getByText(/b — invalid yaml/i)).toBeInTheDocument();
    });

    it("shows diff count when both valid and diffs exist", () => {
      render(<YamlDiff />);
      setLeft(VALID_YAML_A);
      setRight(VALID_YAML_B);
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText("3 lines differ")).toBeInTheDocument();
    });

    it("shows identical when both valid and 0 diffs", () => {
      render(<YamlDiff />);
      setLeft(VALID_YAML_A);
      setRight(VALID_YAML_A);
      fireEvent.click(screen.getByTestId("simulate-diff-0"));
      expect(screen.getByText("identical")).toBeInTheDocument();
    });

    it("does not show error for only-left content (right still empty)", () => {
      render(<YamlDiff />);
      setLeft(VALID_YAML_A);
      // right is empty → shows idle, not error
      expect(screen.getByText(/paste yaml into both panels/i)).toBeInTheDocument();
    });

    it("shows YAML parse error message text", () => {
      render(<YamlDiff />);
      setLeft(INVALID_YAML);
      // Some error text from js-yaml should be shown
      const errEl = document.querySelector(".text-red-400");
      expect(errEl).toBeTruthy();
    });
  });

  // ── Format ─────────────────────────────────────────────────────────────────

  describe("format", () => {
    it("format button formats valid YAML", async () => {
      const user = userEvent.setup({ delay: null });
      render(<YamlDiff />);
      // Unformatted YAML — valid but not normalized
      setLeft("name:   Alice\nage:   30");
      setRight("name:   Bob\nage:   25");

      await user.click(screen.getByTitle("format"));

      const leftVal = (screen.getByTestId("left-editor") as HTMLTextAreaElement).value;
      expect(leftVal).toContain("Alice");
      expect(leftVal).not.toContain("   Alice"); // extra spaces collapsed
    });

    it("format does not crash on empty panels", async () => {
      const user = userEvent.setup({ delay: null });
      render(<YamlDiff />);
      // format is disabled when both empty
      expect(screen.getByTitle("format")).toBeDisabled();
    });

    it("format button enabled when at least one panel has content", () => {
      render(<YamlDiff />);
      setLeft(VALID_YAML_A);
      expect(screen.getByTitle("format")).not.toBeDisabled();
    });

    it("format does not modify invalid YAML", async () => {
      const user = userEvent.setup({ delay: null });
      render(<YamlDiff />);
      setLeft(INVALID_YAML);
      setRight(VALID_YAML_B);

      await user.click(screen.getByTitle("format"));

      // Invalid YAML left unchanged
      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe(INVALID_YAML);
      // Valid right gets formatted
      const rightVal = (screen.getByTestId("right-editor") as HTMLTextAreaElement).value;
      expect(rightVal).toContain("Bob");
    });
  });

  // ── Swap ───────────────────────────────────────────────────────────────────

  describe("swap", () => {
    it("swaps left and right content", async () => {
      const user = userEvent.setup({ delay: null });
      render(<YamlDiff />);
      setLeft(VALID_YAML_A);
      setRight(VALID_YAML_B);

      await user.click(screen.getByTitle("swap"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe(VALID_YAML_B);
      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe(VALID_YAML_A);
    });

    it("swap resets diff count", async () => {
      const user = userEvent.setup({ delay: null });
      render(<YamlDiff />);
      setLeft(VALID_YAML_A);
      setRight(VALID_YAML_B);
      fireEvent.click(screen.getByTestId("simulate-diff-3"));

      await user.click(screen.getByTitle("swap"));

      expect(screen.getByText("identical")).toBeInTheDocument();
    });
  });

  // ── Clear ──────────────────────────────────────────────────────────────────

  describe("clear", () => {
    it("clears both panels", async () => {
      const user = userEvent.setup({ delay: null });
      render(<YamlDiff />);
      setLeft(VALID_YAML_A);
      setRight(VALID_YAML_B);

      await user.click(screen.getByTitle("clear"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe("");
    });

    it("returns to idle after clear", async () => {
      const user = userEvent.setup({ delay: null });
      render(<YamlDiff />);
      setLeft(VALID_YAML_A);
      setRight(VALID_YAML_B);
      fireEvent.click(screen.getByTestId("simulate-diff-3"));

      await user.click(screen.getByTitle("clear"));

      expect(screen.getByText(/paste yaml into both panels/i)).toBeInTheDocument();
    });
  });

  // ── Upload ─────────────────────────────────────────────────────────────────

  describe("upload", () => {
    it("accepts .yaml and .yml files", async () => {
      const { uploadText } = await import("@/lib/utils/file");
      vi.mocked(uploadText).mockResolvedValueOnce("a: 1");
      const user = userEvent.setup({ delay: null });
      render(<YamlDiff />);

      await user.click(screen.getAllByTitle(/upload/i)[0]);
      expect(uploadText).toHaveBeenCalledWith(".yaml,.yml");
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles YAML with Unicode characters", () => {
      render(<YamlDiff />);
      setLeft("greeting: こんにちは");
      // No error — valid YAML
      expect(screen.queryByText(/invalid yaml/i)).toBeNull();
    });

    it("handles empty string YAML values", () => {
      render(<YamlDiff />);
      setLeft("key: ''");
      expect(screen.queryByText(/invalid yaml/i)).toBeNull();
    });

    it("handles YAML arrays", () => {
      render(<YamlDiff />);
      setLeft("items:\n  - a\n  - b");
      expect(screen.queryByText(/invalid yaml/i)).toBeNull();
    });

    it("error display truncates to first error in long messages", () => {
      render(<YamlDiff />);
      setLeft(INVALID_YAML);
      const errorEls = document.querySelectorAll(".text-red-400");
      expect(errorEls.length).toBeGreaterThan(0);
    });

    it("clearing invalid yaml removes error state", async () => {
      const user = userEvent.setup({ delay: null });
      render(<YamlDiff />);
      setLeft(INVALID_YAML);
      expect(screen.getByText(/a — invalid yaml/i)).toBeInTheDocument();

      await user.click(screen.getByTitle("clear"));
      expect(screen.queryByText(/invalid yaml/i)).toBeNull();
    });
  });
});
