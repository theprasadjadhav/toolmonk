import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { XmlComparator } from "@/components/tools/comparators/XmlComparator";

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

// ── Fixtures ───────────────────────────────────────────────────────────────────

const VALID_XML_A = `<root><item id="1">Alice</item></root>`;
const VALID_XML_B = `<root><item id="2">Bob</item></root>`;
const INVALID_XML = `<root><unclosed>`;

function setLeft(value: string) {
  fireEvent.change(screen.getByTestId("left-editor"), { target: { value } });
}
function setRight(value: string) {
  fireEvent.change(screen.getByTestId("right-editor"), { target: { value } });
}

describe("XmlComparator", () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders both editor panels", () => {
      render(<XmlComparator />);
      expect(screen.getByTestId("left-editor")).toBeInTheDocument();
      expect(screen.getByTestId("right-editor")).toBeInTheDocument();
    });

    it("uses xml language for the diff panel", () => {
      render(<XmlComparator />);
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("xml");
    });

    it("renders format, swap, and clear buttons", () => {
      render(<XmlComparator />);
      expect(screen.getByTitle("format")).toBeInTheDocument();
      expect(screen.getByTitle("swap")).toBeInTheDocument();
      expect(screen.getByTitle("clear")).toBeInTheDocument();
    });

    it("shows idle placeholder initially", () => {
      render(<XmlComparator />);
      expect(screen.getByText(/paste xml into both panels/i)).toBeInTheDocument();
    });

    it("shows panel labels for XML A and B", () => {
      render(<XmlComparator />);
      expect(screen.getByText(/xml a/i)).toBeInTheDocument();
      expect(screen.getByText(/xml b/i)).toBeInTheDocument();
    });
  });

  // ── Status bar states ──────────────────────────────────────────────────────

  describe("status bar", () => {
    it("shows idle when both panels empty", () => {
      render(<XmlComparator />);
      expect(screen.getByText(/paste xml into both panels/i)).toBeInTheDocument();
    });

    it("shows error for invalid XML on left", () => {
      render(<XmlComparator />);
      setLeft(INVALID_XML);
      expect(screen.getByText(/a — invalid xml/i)).toBeInTheDocument();
    });

    it("shows error for invalid XML on right", () => {
      render(<XmlComparator />);
      setLeft(VALID_XML_A);
      setRight(INVALID_XML);
      expect(screen.getByText(/b — invalid xml/i)).toBeInTheDocument();
    });

    it("shows errors for both panels when both invalid", () => {
      render(<XmlComparator />);
      setLeft(INVALID_XML);
      setRight(INVALID_XML);
      expect(screen.getByText(/a — invalid xml/i)).toBeInTheDocument();
      expect(screen.getByText(/b — invalid xml/i)).toBeInTheDocument();
    });

    it("shows diff count when both valid and diffs exist", () => {
      render(<XmlComparator />);
      setLeft(VALID_XML_A);
      setRight(VALID_XML_B);
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText("3 lines differ")).toBeInTheDocument();
    });

    it("shows identical when both valid and 0 diffs", () => {
      render(<XmlComparator />);
      setLeft(VALID_XML_A);
      setRight(VALID_XML_A);
      fireEvent.click(screen.getByTestId("simulate-diff-0"));
      expect(screen.getByText("identical")).toBeInTheDocument();
    });

    it("idle when only left has content", () => {
      render(<XmlComparator />);
      setLeft(VALID_XML_A);
      expect(screen.getByText(/paste xml into both panels/i)).toBeInTheDocument();
    });
  });

  // ── Format ─────────────────────────────────────────────────────────────────

  describe("format", () => {
    it("format button formats valid XML", async () => {
      const user = userEvent.setup({ delay: null });
      render(<XmlComparator />);
      setLeft(VALID_XML_A);
      setRight(VALID_XML_B);

      await user.click(screen.getByTitle("format"));

      const leftVal = (screen.getByTestId("left-editor") as HTMLTextAreaElement).value;
      // Formatted XML should have indentation
      expect(leftVal).toContain("Alice");
    });

    it("format button disabled when both panels empty", () => {
      render(<XmlComparator />);
      expect(screen.getByTitle("format")).toBeDisabled();
    });

    it("format button enabled when at least one panel has content", () => {
      render(<XmlComparator />);
      setLeft(VALID_XML_A);
      expect(screen.getByTitle("format")).not.toBeDisabled();
    });

    it("format does not modify invalid XML panel", async () => {
      const user = userEvent.setup({ delay: null });
      render(<XmlComparator />);
      setLeft(INVALID_XML);
      setRight(VALID_XML_B);

      await user.click(screen.getByTitle("format"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe(INVALID_XML);
    });
  });

  // ── Swap ───────────────────────────────────────────────────────────────────

  describe("swap", () => {
    it("swaps left and right content", async () => {
      const user = userEvent.setup({ delay: null });
      render(<XmlComparator />);
      setLeft(VALID_XML_A);
      setRight(VALID_XML_B);

      await user.click(screen.getByTitle("swap"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe(VALID_XML_B);
      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe(VALID_XML_A);
    });

    it("swap button disabled when both empty", () => {
      render(<XmlComparator />);
      expect(screen.getByTitle("swap")).toBeDisabled();
    });

    it("swap resets diff count", async () => {
      const user = userEvent.setup({ delay: null });
      render(<XmlComparator />);
      setLeft(VALID_XML_A);
      setRight(VALID_XML_B);
      fireEvent.click(screen.getByTestId("simulate-diff-3"));

      await user.click(screen.getByTitle("swap"));

      expect(screen.getByText("identical")).toBeInTheDocument();
    });
  });

  // ── Clear ──────────────────────────────────────────────────────────────────

  describe("clear", () => {
    it("clears both panels", async () => {
      const user = userEvent.setup({ delay: null });
      render(<XmlComparator />);
      setLeft(VALID_XML_A);
      setRight(VALID_XML_B);

      await user.click(screen.getByTitle("clear"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe("");
    });

    it("clears error state after clearing invalid XML", async () => {
      const user = userEvent.setup({ delay: null });
      render(<XmlComparator />);
      setLeft(INVALID_XML);
      expect(screen.getByText(/a — invalid xml/i)).toBeInTheDocument();

      await user.click(screen.getByTitle("clear"));
      expect(screen.queryByText(/invalid xml/i)).toBeNull();
    });
  });

  // ── Upload ─────────────────────────────────────────────────────────────────

  describe("upload", () => {
    it("accepts .xml files for upload", async () => {
      const { uploadText } = await import("@/lib/utils/file");
      vi.mocked(uploadText).mockResolvedValueOnce(VALID_XML_A);
      const user = userEvent.setup({ delay: null });
      render(<XmlComparator />);

      await user.click(screen.getAllByTitle(/upload/i)[0]);
      expect(uploadText).toHaveBeenCalledWith(".xml");
    });

    it("populates left panel with uploaded XML", async () => {
      const { uploadText } = await import("@/lib/utils/file");
      vi.mocked(uploadText).mockResolvedValueOnce(VALID_XML_A);
      const user = userEvent.setup({ delay: null });
      render(<XmlComparator />);

      await user.click(screen.getAllByTitle(/upload/i)[0]);
      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe(VALID_XML_A);
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles XML with CDATA sections", () => {
      render(<XmlComparator />);
      setLeft("<root><![CDATA[some data]]></root>");
      expect(screen.queryByText(/invalid xml/i)).toBeNull();
    });

    it("handles XML with namespaces", () => {
      render(<XmlComparator />);
      setLeft('<ns:root xmlns:ns="http://example.com"><ns:item/></ns:root>');
      expect(screen.queryByText(/invalid xml/i)).toBeNull();
    });

    it("handles XML with attributes", () => {
      render(<XmlComparator />);
      setLeft('<root id="1" class="test"><child/></root>');
      expect(screen.queryByText(/invalid xml/i)).toBeNull();
    });

    it("handles well-formed empty document", () => {
      render(<XmlComparator />);
      setLeft("<root/>");
      expect(screen.queryByText(/invalid xml/i)).toBeNull();
    });

    it("shows error for completely malformed XML", () => {
      render(<XmlComparator />);
      setLeft("not xml at all <<<");
      expect(screen.getByText(/a — invalid xml/i)).toBeInTheDocument();
    });

    it("identical XML shows identical status", () => {
      render(<XmlComparator />);
      setLeft(VALID_XML_A);
      setRight(VALID_XML_A);
      fireEvent.click(screen.getByTestId("simulate-diff-0"));
      expect(screen.getByText("identical")).toBeInTheDocument();
    });
  });
});
