import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MasterComparator } from "@/components/tools/comparators/MasterComparator";

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
    // Re-fire when onFormatReady transitions from undefined → function
    // Using !!onFormatReady as dep avoids infinite loops from inline fn refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => { onFormatReady?.(() => {}); }, [!!onFormatReady]);

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
          onClick={() => onMarkersChange?.(["Identifier expected"], [])}
        >
          left markers
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

async function selectLanguage(user: ReturnType<typeof userEvent.setup>, label: string) {
  const select = screen.getByRole("combobox");
  await user.selectOptions(select, label);
}

describe("MasterComparator", () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders both editor panels", () => {
      render(<MasterComparator />);
      expect(screen.getByTestId("left-editor")).toBeInTheDocument();
      expect(screen.getByTestId("right-editor")).toBeInTheDocument();
    });

    it("renders language selector", () => {
      render(<MasterComparator />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("defaults to plaintext language", () => {
      render(<MasterComparator />);
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("plaintext");
    });

    it("shows idle placeholder initially", () => {
      render(<MasterComparator />);
      expect(screen.getByText(/paste plain text into both panels/i)).toBeInTheDocument();
    });

    it("renders swap and clear buttons", () => {
      render(<MasterComparator />);
      expect(screen.getByTitle("swap")).toBeInTheDocument();
      expect(screen.getByTitle("clear")).toBeInTheDocument();
    });

    it("does not show format button for plaintext", () => {
      render(<MasterComparator />);
      expect(screen.queryByTitle("format")).toBeNull();
    });
  });

  // ── Language switching ─────────────────────────────────────────────────────

  describe("language switching", () => {
    it("switches to json language", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JSON");
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("json");
    });

    it("switches to yaml language", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "YAML");
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("yaml");
    });

    it("switches to xml language", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "XML");
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("xml");
    });

    it("switches to javascript language", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JavaScript");
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("javascript");
    });

    it("language switch updates status bar placeholder", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "YAML");
      expect(screen.getByText(/paste yaml into both panels/i)).toBeInTheDocument();
    });

    it("language switch updates status bar for JSON", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JSON");
      expect(screen.getByText(/paste json into both panels/i)).toBeInTheDocument();
    });

    it("language switch resets diff count to 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      setLeft("x");
      setRight("y");
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText("3 lines differ")).toBeInTheDocument();

      await selectLanguage(user, "JSON");
      // After language switch, setDiffCount(0) is called — "3 lines differ" gone
      // (panels have invalid JSON so validation error shows instead)
      expect(screen.queryByText("3 lines differ")).toBeNull();
    });

    it("shows format button after switching to JSON", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JSON");
      expect(screen.getByTitle("format")).toBeInTheDocument();
    });

    it("shows format button for YAML", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "YAML");
      expect(screen.getByTitle("format")).toBeInTheDocument();
    });

    it("shows format button for XML", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "XML");
      expect(screen.getByTitle("format")).toBeInTheDocument();
    });

    it("shows format button for CSS (Monaco format)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "CSS");
      expect(screen.getByTitle("format")).toBeInTheDocument();
    });

    it("hides format button for Python", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "Python");
      expect(screen.queryByTitle("format")).toBeNull();
    });
  });

  // ── JSON validation ────────────────────────────────────────────────────────

  describe("JSON validation", () => {
    it("shows error for invalid JSON on left", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JSON");
      setLeft("{bad json}");
      expect(screen.getByText(/a — invalid json/i)).toBeInTheDocument();
    });

    it("shows error for invalid JSON on right", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JSON");
      setLeft('{"a":1}');
      setRight("{bad}");
      expect(screen.getByText(/b — invalid json/i)).toBeInTheDocument();
    });

    it("shows identical when both JSON are identical", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JSON");
      setLeft('{"a":1}');
      setRight('{"a":1}');
      fireEvent.click(screen.getByTestId("simulate-diff-0"));
      expect(screen.getByText("identical")).toBeInTheDocument();
    });

    it("shows diff count when valid JSON differs", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JSON");
      setLeft('{"a":1}');
      setRight('{"b":2}');
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText("3 lines differ")).toBeInTheDocument();
    });

    it("formats JSON", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JSON");
      setLeft('{"a":1,"b":2}');
      setRight('{"c":3}');

      await user.click(screen.getByTitle("format"));

      const leftVal = (screen.getByTestId("left-editor") as HTMLTextAreaElement).value;
      expect(leftVal).toContain('"a"');
      // Should be pretty-printed
      expect(leftVal).toContain("\n");
    });
  });

  // ── YAML validation ────────────────────────────────────────────────────────

  describe("YAML validation", () => {
    it("shows error for invalid YAML", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "YAML");
      setLeft("key:\n\tbad_indent: true");
      expect(screen.getByText(/a — invalid yaml/i)).toBeInTheDocument();
    });

    it("valid YAML with diff shows count", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "YAML");
      setLeft("name: Alice");
      setRight("name: Bob");
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText("3 lines differ")).toBeInTheDocument();
    });
  });

  // ── XML validation ─────────────────────────────────────────────────────────

  describe("XML validation", () => {
    it("shows error for invalid XML", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "XML");
      setLeft("<root><unclosed>");
      expect(screen.getByText(/a — invalid xml/i)).toBeInTheDocument();
    });

    it("valid XML shows identical status", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "XML");
      setLeft("<root/>");
      setRight("<root/>");
      fireEvent.click(screen.getByTestId("simulate-diff-0"));
      expect(screen.getByText("identical")).toBeInTheDocument();
    });
  });

  // ── Marker languages (JS, TS, CSS) ────────────────────────────────────────

  describe("marker languages", () => {
    it("shows marker errors for JavaScript", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JavaScript");
      setLeft("bad code");
      setRight("more code");
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      expect(screen.getByText(/a — 1 syntax error/i)).toBeInTheDocument();
    });

    it("clears marker errors when switching language", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JavaScript");
      setLeft("bad code");
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      expect(screen.getByText(/syntax error/i)).toBeInTheDocument();

      // Switch to Python — markers should clear
      await selectLanguage(user, "Python");
      expect(screen.queryByText(/syntax error/i)).toBeNull();
    });

    it("TypeScript shows marker errors", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "TypeScript");
      setLeft("x");
      setRight("y");
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      expect(screen.getByText(/a — 1 syntax error/i)).toBeInTheDocument();
    });

    it("CSS shows marker errors", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "CSS");
      setLeft("bad css");
      setRight("more bad");
      fireEvent.click(screen.getByTestId("simulate-markers-left"));
      expect(screen.getByText(/a — 1 syntax error/i)).toBeInTheDocument();
    });
  });

  // ── Plain text / generic languages ────────────────────────────────────────

  describe("plain text and generic languages", () => {
    it("shows diff count for plain text", () => {
      render(<MasterComparator />);
      setLeft("a");
      setRight("b");
      fireEvent.click(screen.getByTestId("simulate-diff-3"));
      expect(screen.getByText("3 lines differ")).toBeInTheDocument();
    });

    it("shows identical for plain text", () => {
      render(<MasterComparator />);
      setLeft("same");
      setRight("same");
      fireEvent.click(screen.getByTestId("simulate-diff-0"));
      expect(screen.getByText("identical")).toBeInTheDocument();
    });

    it("handles Go language (no validation)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "Go");
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("go");
    });

    it("handles Rust language", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "Rust");
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("rust");
    });

    it("handles SQL language", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "SQL");
      expect(screen.getByTestId("diff-panel").dataset.language).toBe("sql");
    });
  });

  // ── Swap & clear ───────────────────────────────────────────────────────────

  describe("swap", () => {
    it("swaps content between panels", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      setLeft("left");
      setRight("right");

      await user.click(screen.getByTitle("swap"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("right");
      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe("left");
    });

    it("swap preserves current language", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      await selectLanguage(user, "JSON");
      setLeft("a");
      setRight("b");

      await user.click(screen.getByTitle("swap"));

      expect(screen.getByTestId("diff-panel").dataset.language).toBe("json");
    });
  });

  describe("clear", () => {
    it("clears both panels", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MasterComparator />);
      setLeft("content");
      setRight("content");

      await user.click(screen.getByTitle("clear"));

      expect((screen.getByTestId("left-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("right-editor") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Language options coverage ──────────────────────────────────────────────

  describe("language options", () => {
    it("has all expected language options", () => {
      render(<MasterComparator />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      const values = Array.from(select.options).map((o) => o.value);
      expect(values).toContain("plaintext");
      expect(values).toContain("json");
      expect(values).toContain("yaml");
      expect(values).toContain("xml");
      expect(values).toContain("javascript");
      expect(values).toContain("typescript");
      expect(values).toContain("css");
      expect(values).toContain("python");
      expect(values).toContain("java");
      expect(values).toContain("go");
    });

    it("has Dockerfile in language list", () => {
      render(<MasterComparator />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      const values = Array.from(select.options).map((o) => o.value);
      expect(values).toContain("dockerfile");
    });
  });
});
