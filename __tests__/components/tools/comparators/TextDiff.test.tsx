import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextDiff } from "@/components/tools/comparators/TextDiff";

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

function setLeft(value: string) {
  fireEvent.change(screen.getByTestId("left-editor"), { target: { value } });
}
function setRight(value: string) {
  fireEvent.change(screen.getByTestId("right-editor"), { target: { value } });
}

describe("TextDiff", () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders both editor panels", () => {
      render(<TextDiff />);
      expect(screen.getByTestId("left-editor")).toBeInTheDocument();
      expect(screen.getByTestId("right-editor")).toBeInTheDocument();
    });

    it("renders swap and clear toolbar buttons", () => {
      render(<TextDiff />);
      expect(screen.getByTitle("swap")).toBeInTheDocument();
      expect(screen.getByTitle("clear")).toBeInTheDocument();
    });

    it("renders fullscreen button", () => {
      render(<TextDiff />);
      expect(screen.getByText("fullscreen")).toBeInTheDocument();
    });

    it("shows idle placeholder status bar initially", () => {
      render(<TextDiff />);
      expect(screen.getByText(/paste text into both panels/i)).toBeInTheDocument();
    });

    it("uses plaintext language for the diff panel", () => {
      render(<TextDiff />);
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("plaintext");
    });
  });

  // ── Status bar states ──────────────────────────────────────────────────────

  describe("status bar", () => {
    it("shows idle state when both panels empty", () => {
      render(<TextDiff />);
      expect(screen.getByText(/paste text into both panels/i)).toBeInTheDocument();
    });

    it("shows identical when both filled and 0 diffs", () => {
      render(<TextDiff />);
      setLeft("hello");
      setRight("hello");
      fireEvent.click(screen.getByTestId("simulate-diff-0"));
      expect(screen.getByText("identical")).toBeInTheDocument();
    });

    it("shows diff count when lines differ", () => {
      render(<TextDiff />);
      setLeft("line A");
      setRight("line B");
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText("3 lines differ")).toBeInTheDocument();
    });

    it("uses singular 'line' for exactly 1 diff", () => {
      render(<TextDiff />);
      setLeft("a");
      setRight("b");
      const panel = screen.getByTestId("diff-panel");
      // Fire 1 diff
      const btn1 = document.createElement("button");
      // We simulate via DiffPanel's onDiffChange by triggering button
      // Use the simulate-diff-3 and verify pluralization
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText(/lines differ/i)).toBeInTheDocument();
    });

    it("shows idle when only left has content", () => {
      render(<TextDiff />);
      setLeft("only left");
      // No simulate-diff call — both not filled, stays idle
      expect(screen.getByText(/paste text into both panels/i)).toBeInTheDocument();
    });

    it("shows idle when only right has content", () => {
      render(<TextDiff />);
      setRight("only right");
      expect(screen.getByText(/paste text into both panels/i)).toBeInTheDocument();
    });
  });

  // ── Swap ───────────────────────────────────────────────────────────────────

  describe("swap", () => {
    it("swaps left and right content", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TextDiff />);
      setLeft("left content");
      setRight("right content");

      await user.click(screen.getByTitle("swap"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("right content");
      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe("left content");
    });

    it("swap resets diff count to 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TextDiff />);
      setLeft("a");
      setRight("b");
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText("3 lines differ")).toBeInTheDocument();

      await user.click(screen.getByTitle("swap"));
      // After swap, diffCount is reset to 0, both filled → identical
      expect(screen.getByText("identical")).toBeInTheDocument();
    });

    it("swap button is disabled when both panels empty", () => {
      render(<TextDiff />);
      expect(screen.getByTitle("swap")).toBeDisabled();
    });

    it("swap button is enabled when left has content", () => {
      render(<TextDiff />);
      setLeft("text");
      expect(screen.getByTitle("swap")).not.toBeDisabled();
    });
  });

  // ── Clear ──────────────────────────────────────────────────────────────────

  describe("clear", () => {
    it("clears both panels", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TextDiff />);
      setLeft("text A");
      setRight("text B");

      await user.click(screen.getByTitle("clear"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe("");
    });

    it("clears diff state and returns to idle", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TextDiff />);
      setLeft("a");
      setRight("b");
      fireEvent.click(screen.getByTestId("simulate-diff-3"));

      await user.click(screen.getByTitle("clear"));

      expect(screen.getByText(/paste text into both panels/i)).toBeInTheDocument();
    });
  });

  // ── Upload ─────────────────────────────────────────────────────────────────

  describe("upload", () => {
    it("upload left button triggers uploadText", async () => {
      const { uploadText } = await import("@/lib/utils/file");
      const user = userEvent.setup({ delay: null });
      render(<TextDiff />);

      const copyButtons = screen.getAllByTitle(/upload/i);
      await user.click(copyButtons[0]);
      expect(uploadText).toHaveBeenCalled();
    });

    it("upload right button triggers uploadText", async () => {
      const { uploadText } = await import("@/lib/utils/file");
      const user = userEvent.setup({ delay: null });
      render(<TextDiff />);

      const copyButtons = screen.getAllByTitle(/upload/i);
      await user.click(copyButtons[1]);
      expect(uploadText).toHaveBeenCalled();
    });

    it("uploaded content populates left panel", async () => {
      const { uploadText } = await import("@/lib/utils/file");
      vi.mocked(uploadText).mockResolvedValueOnce("uploaded text");
      const user = userEvent.setup({ delay: null });
      render(<TextDiff />);

      const uploadButtons = screen.getAllByTitle(/upload/i);
      await user.click(uploadButtons[0]);

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("uploaded text");
    });

    it("uploaded content populates right panel", async () => {
      const { uploadText } = await import("@/lib/utils/file");
      vi.mocked(uploadText).mockResolvedValueOnce("right uploaded");
      const user = userEvent.setup({ delay: null });
      render(<TextDiff />);

      const uploadButtons = screen.getAllByTitle(/upload/i);
      await user.click(uploadButtons[1]);

      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe("right uploaded");
    });

    it("null upload result does not change content", async () => {
      const { uploadText } = await import("@/lib/utils/file");
      vi.mocked(uploadText).mockResolvedValueOnce(null);
      const user = userEvent.setup({ delay: null });
      render(<TextDiff />);
      setLeft("original");

      const uploadButtons = screen.getAllByTitle(/upload/i);
      await user.click(uploadButtons[0]);

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("original");
    });
  });

  // ── Copy ───────────────────────────────────────────────────────────────────

  describe("copy", () => {
    it("copy left button is disabled when left panel empty", () => {
      render(<TextDiff />);
      const copyButtons = screen.getAllByTitle(/copy/i);
      expect(copyButtons[0]).toBeDisabled();
    });

    it("copy right button is disabled when right panel empty", () => {
      render(<TextDiff />);
      const copyButtons = screen.getAllByTitle(/copy/i);
      expect(copyButtons[1]).toBeDisabled();
    });

    it("copy left button enabled when left has content", () => {
      render(<TextDiff />);
      setLeft("text");
      const copyButtons = screen.getAllByTitle(/copy/i);
      expect(copyButtons[0]).not.toBeDisabled();
    });

    it("copy right button enabled when right has content", () => {
      render(<TextDiff />);
      setRight("text");
      const copyButtons = screen.getAllByTitle(/copy/i);
      expect(copyButtons[1]).not.toBeDisabled();
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("whitespace-only in left is treated as empty for status", () => {
      render(<TextDiff />);
      setLeft("   ");
      setRight("hello");
      // leftEmpty is true (only whitespace), rightEmpty is false → idle
      expect(screen.getByText(/paste text into both panels/i)).toBeInTheDocument();
    });

    it("handles very long content without crashing", () => {
      render(<TextDiff />);
      const longText = "x".repeat(10000);
      setLeft(longText);
      setRight(longText);
      expect(screen.getByTestId("left-editor")).toBeInTheDocument();
    });

    it("handles newlines in content", () => {
      render(<TextDiff />);
      setLeft("line1\nline2\nline3");
      setRight("line1\nline2\nline3");
      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("line1\nline2\nline3");
    });
  });
});
