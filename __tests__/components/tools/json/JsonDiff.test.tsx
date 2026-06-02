import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonDiff } from "@/components/tools/json/JsonDiff";

// ── CodePanel mock (replaces Monaco entirely) ────────────────────────────────
// JsonDiff imports CodeEditor and DiffPanel from @/components/ui/CodePanel.
// Mocking CodePanel directly avoids the Monaco dependency in tests and lets us
// wire onLeftChange / onRightChange properly through controlled textareas.
vi.mock("@/components/ui/CodePanel", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CodeEditor: ({ value, onChange, placeholder }: any) => (
    <textarea
      data-testid="editor"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CodeOutput: ({ value }: any) => <pre data-testid="output">{value}</pre>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DiffPanel: ({ left, right, onLeftChange, onRightChange }: any) => (
    <div data-testid="diff-panel">
      <textarea
        data-testid="left-editor"
        value={left}
        aria-label="JSON A"
        onChange={(e) => onLeftChange?.(e.target.value)}
        readOnly={!onLeftChange}
      />
      <textarea
        data-testid="right-editor"
        value={right}
        aria-label="JSON B"
        onChange={(e) => onRightChange?.(e.target.value)}
        readOnly={!onRightChange}
      />
    </div>
  ),
}));

vi.mock("@/lib/utils/file", () => ({
  uploadText: vi.fn().mockResolvedValue(null),
  downloadText: vi.fn(),
}));

vi.mock("@/components/tool/ToolPanel", () => ({
  useToolFullscreen: () => false,
  FullscreenButton: () => <button>fullscreen</button>,
}));

// ─────────────────────────────────────────────────────────────────────────────

describe("JsonDiff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it("renders the diff panel on mount", () => {
    render(<JsonDiff />);
    expect(screen.getByTestId("diff-panel")).toBeInTheDocument();
  });

  it("shows idle placeholder when both panels are empty", () => {
    render(<JsonDiff />);
    expect(screen.getByText(/paste json into both panels to compare/i)).toBeInTheDocument();
  });

  it("renders JSON A and JSON B panel labels", () => {
    render(<JsonDiff />);
    expect(screen.getByText(/— JSON A/i)).toBeInTheDocument();
    expect(screen.getByText(/— JSON B/i)).toBeInTheDocument();
  });

  // ── Toolbar buttons ───────────────────────────────────────────────────────

  it("renders toolbar buttons with accessible names", () => {
    render(<JsonDiff />);
    expect(screen.getByTitle(/format/i)).toBeInTheDocument();
    expect(screen.getByTitle(/swap/i)).toBeInTheDocument();
    expect(screen.getByTitle(/clear/i)).toBeInTheDocument();
  });

  it("clear button is always enabled", () => {
    render(<JsonDiff />);
    expect(screen.getByTitle(/clear/i)).not.toBeDisabled();
  });

  it("swap button is disabled when both panels are empty", () => {
    render(<JsonDiff />);
    expect(screen.getByTitle(/swap/i)).toBeDisabled();
  });

  // ── Status bar: identical ─────────────────────────────────────────────────

  it("shows 'identical' when both sides contain the same valid JSON and diffCount is 0", () => {
    render(<JsonDiff />);
    const json = '{"a":1}';
    fireEvent.change(screen.getByTestId("left-editor"), { target: { value: json } });
    fireEvent.change(screen.getByTestId("right-editor"), { target: { value: json } });
    // diffCount defaults to 0 and both sides are valid → identical
    expect(screen.getByText(/identical/i)).toBeInTheDocument();
  });

  // ── Status bar: errors ────────────────────────────────────────────────────

  it("shows 'A — invalid json' when left side has invalid JSON", () => {
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "{bad json" },
    });
    expect(screen.getByText(/A — invalid json/i)).toBeInTheDocument();
  });

  it("shows 'B — invalid json' when right side has invalid JSON", () => {
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("right-editor"), {
      target: { value: "{bad" },
    });
    expect(screen.getByText(/B — invalid json/i)).toBeInTheDocument();
  });

  it("shows error labels for both sides when both have invalid JSON", () => {
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "{bad" },
    });
    fireEvent.change(screen.getByTestId("right-editor"), {
      target: { value: "{also bad" },
    });
    expect(screen.getByText(/A — invalid json/i)).toBeInTheDocument();
    expect(screen.getByText(/B — invalid json/i)).toBeInTheDocument();
  });

  it("hides error once invalid input is corrected", () => {
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "{bad" },
    });
    expect(screen.getByText(/A — invalid json/i)).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: '{"a":1}' },
    });
    expect(screen.queryByText(/A — invalid json/i)).not.toBeInTheDocument();
  });

  // ── Swap button ───────────────────────────────────────────────────────────

  it("swap button becomes enabled once either panel has content", () => {
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: '{"a":1}' },
    });
    expect(screen.getByTitle(/swap/i)).not.toBeDisabled();
  });

  it("swap button swaps left and right content", async () => {
    const user = userEvent.setup();
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), { target: { value: '{"a":1}' } });
    fireEvent.change(screen.getByTestId("right-editor"), { target: { value: '{"b":2}' } });
    await user.click(screen.getByTitle(/swap/i));
    expect(screen.getByTestId("left-editor")).toHaveValue('{"b":2}');
    expect(screen.getByTestId("right-editor")).toHaveValue('{"a":1}');
  });

  // ── Clear resets state ────────────────────────────────────────────────────

  it("clear button resets to idle placeholder", async () => {
    const user = userEvent.setup();
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: '{"a":1}' },
    });
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.getByText(/paste json into both panels to compare/i)).toBeInTheDocument();
  });

  it("clear button empties both editors", async () => {
    const user = userEvent.setup();
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), { target: { value: '{"a":1}' } });
    fireEvent.change(screen.getByTestId("right-editor"), { target: { value: '{"b":2}' } });
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.getByTestId("left-editor")).toHaveValue("");
    expect(screen.getByTestId("right-editor")).toHaveValue("");
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it("handles null value on left side", () => {
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), { target: { value: "null" } });
    expect(screen.queryByText(/A — invalid json/i)).not.toBeInTheDocument();
  });

  it("handles empty array on right side", () => {
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("right-editor"), { target: { value: "[]" } });
    expect(screen.queryByText(/B — invalid json/i)).not.toBeInTheDocument();
  });

  it("handles deeply nested JSON without crashing", () => {
    render(<JsonDiff />);
    const deep = JSON.stringify({ a: { b: { c: { d: 1 } } } });
    fireEvent.change(screen.getByTestId("left-editor"), { target: { value: deep } });
    expect(screen.getByTestId("diff-panel")).toBeInTheDocument();
  });

  it("handles unicode characters in values", () => {
    render(<JsonDiff />);
    const json = '{"emoji":"\\u2764"}';
    fireEvent.change(screen.getByTestId("left-editor"), { target: { value: json } });
    expect(screen.queryByText(/A — invalid json/i)).not.toBeInTheDocument();
  });

  it("handles a very long string value without crashing", () => {
    render(<JsonDiff />);
    const json = JSON.stringify({ data: "x".repeat(5000) });
    fireEvent.change(screen.getByTestId("left-editor"), { target: { value: json } });
    expect(screen.getByTestId("diff-panel")).toBeInTheDocument();
  });

  it("shows error for JSON with comments", () => {
    render(<JsonDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: '{"a":1} // comment' },
    });
    expect(screen.getByText(/A — invalid json/i)).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("left editor has an accessible label", () => {
    render(<JsonDiff />);
    expect(screen.getByLabelText(/JSON A/i)).toBeInTheDocument();
  });

  it("right editor has an accessible label", () => {
    render(<JsonDiff />);
    expect(screen.getByLabelText(/JSON B/i)).toBeInTheDocument();
  });
});

// ── StatusBar rendering paths ─────────────────────────────────────────────────

describe("JsonDiff StatusBar rendering paths", () => {
  it("idle state shows placeholder text", () => {
    render(<JsonDiff />);
    expect(screen.getByText(/paste json into both panels to compare/i)).toBeInTheDocument();
  });

  it("component mounts without throwing errors", () => {
    expect(() => render(<JsonDiff />)).not.toThrow();
  });

  it("DiffPanel is rendered inside the component", () => {
    render(<JsonDiff />);
    expect(screen.getByTestId("diff-panel")).toBeInTheDocument();
  });
});
