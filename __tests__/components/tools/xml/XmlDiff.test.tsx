import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { XmlDiff } from "@/components/tools/xml/XmlDiff";

// ── CodePanel mock (replaces Monaco entirely) ────────────────────────────────
// XmlDiff imports CodeEditor and DiffPanel from @/components/ui/CodePanel.
// Mocking CodePanel directly avoids the Monaco dependency in tests.
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
        aria-label="XML A"
        onChange={(e) => onLeftChange?.(e.target.value)}
        readOnly={!onLeftChange}
      />
      <textarea
        data-testid="right-editor"
        value={right}
        aria-label="XML B"
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

describe("XmlDiff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it("renders the diff panel on mount", () => {
    render(<XmlDiff />);
    expect(screen.getByTestId("diff-panel")).toBeInTheDocument();
  });

  it("shows idle placeholder when both panels are empty", () => {
    render(<XmlDiff />);
    expect(screen.getByText(/paste xml into both panels to compare/i)).toBeInTheDocument();
  });

  it("renders XML A and XML B panel labels", () => {
    render(<XmlDiff />);
    expect(screen.getByText(/— XML A/i)).toBeInTheDocument();
    expect(screen.getByText(/— XML B/i)).toBeInTheDocument();
  });

  // ── Toolbar buttons ───────────────────────────────────────────────────────

  it("renders format, swap, and clear toolbar buttons", () => {
    render(<XmlDiff />);
    expect(screen.getByTitle(/format/i)).toBeInTheDocument();
    expect(screen.getByTitle(/swap/i)).toBeInTheDocument();
    expect(screen.getByTitle(/clear/i)).toBeInTheDocument();
  });

  it("swap button is disabled when both panels are empty", () => {
    render(<XmlDiff />);
    expect(screen.getByTitle(/swap/i)).toBeDisabled();
  });

  it("clear button is always enabled", () => {
    render(<XmlDiff />);
    expect(screen.getByTitle(/clear/i)).not.toBeDisabled();
  });

  // ── Status bar: both valid and identical ──────────────────────────────────

  it("shows 'identical' when both sides contain the same valid XML", async () => {
    render(<XmlDiff />);
    const xml = "<root/>";
    fireEvent.change(screen.getByTestId("left-editor"), { target: { value: xml } });
    fireEvent.change(screen.getByTestId("right-editor"), { target: { value: xml } });
    // diffCount is 0 (default) and both sides are valid → identical
    expect(screen.getByText(/identical/i)).toBeInTheDocument();
  });

  it("shows error label 'A — invalid xml' when left side has invalid XML", () => {
    render(<XmlDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "<unclosed" },
    });
    expect(screen.getByText(/A — invalid xml/i)).toBeInTheDocument();
  });

  it("shows error label 'B — invalid xml' when right side has invalid XML", () => {
    render(<XmlDiff />);
    fireEvent.change(screen.getByTestId("right-editor"), {
      target: { value: "<bad" },
    });
    expect(screen.getByText(/B — invalid xml/i)).toBeInTheDocument();
  });

  it("shows error messages for both sides when both have invalid XML", () => {
    render(<XmlDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "<bad" },
    });
    fireEvent.change(screen.getByTestId("right-editor"), {
      target: { value: "<also bad" },
    });
    expect(screen.getByText(/A — invalid xml/i)).toBeInTheDocument();
    expect(screen.getByText(/B — invalid xml/i)).toBeInTheDocument();
  });

  it("hides error once invalid input is corrected", () => {
    render(<XmlDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "<bad" },
    });
    expect(screen.getByText(/A — invalid xml/i)).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "<root/>" },
    });
    expect(screen.queryByText(/A — invalid xml/i)).not.toBeInTheDocument();
  });

  // ── Swap button ───────────────────────────────────────────────────────────

  it("swap button becomes enabled once either panel has content", async () => {
    render(<XmlDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "<root/>" },
    });
    expect(screen.getByTitle(/swap/i)).not.toBeDisabled();
  });

  it("swap button swaps left and right content", async () => {
    const user = userEvent.setup();
    render(<XmlDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "<a/>" },
    });
    fireEvent.change(screen.getByTestId("right-editor"), {
      target: { value: "<b/>" },
    });
    await user.click(screen.getByTitle(/swap/i));
    expect(screen.getByTestId("left-editor")).toHaveValue("<b/>");
    expect(screen.getByTestId("right-editor")).toHaveValue("<a/>");
  });

  // ── Clear resets state ────────────────────────────────────────────────────

  it("clear button resets to idle placeholder", async () => {
    const user = userEvent.setup();
    render(<XmlDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), { target: { value: "<root/>" } });
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.getByText(/paste xml into both panels to compare/i)).toBeInTheDocument();
  });

  it("clear button empties both editors", async () => {
    const user = userEvent.setup();
    render(<XmlDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), { target: { value: "<a/>" } });
    fireEvent.change(screen.getByTestId("right-editor"), { target: { value: "<b/>" } });
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.getByTestId("left-editor")).toHaveValue("");
    expect(screen.getByTestId("right-editor")).toHaveValue("");
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it("renders without crashing with deeply nested XML on left side", () => {
    render(<XmlDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "<a><b><c><d>leaf</d></c></b></a>" },
    });
    expect(screen.getByTestId("diff-panel")).toBeInTheDocument();
  });

  it("renders without crashing with unicode XML content", () => {
    render(<XmlDiff />);
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: "<root><item>\u4e2d\u6587</item></root>" },
    });
    expect(screen.getByTestId("diff-panel")).toBeInTheDocument();
  });

  it("renders without crashing with large XML", () => {
    render(<XmlDiff />);
    const items = Array.from({ length: 50 }, (_, i) => `<item>${i}</item>`).join("");
    fireEvent.change(screen.getByTestId("left-editor"), {
      target: { value: `<root>${items}</root>` },
    });
    expect(screen.getByTestId("diff-panel")).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("left editor has an accessible label", () => {
    render(<XmlDiff />);
    expect(screen.getByLabelText(/XML A/i)).toBeInTheDocument();
  });

  it("right editor has an accessible label", () => {
    render(<XmlDiff />);
    expect(screen.getByLabelText(/XML B/i)).toBeInTheDocument();
  });
});

// ── StatusBar rendering paths ─────────────────────────────────────────────────

describe("XmlDiff StatusBar rendering paths", () => {
  it("idle state shows placeholder text", () => {
    render(<XmlDiff />);
    expect(screen.getByText(/paste xml into both panels to compare/i)).toBeInTheDocument();
  });

  it("component mounts without throwing", () => {
    expect(() => render(<XmlDiff />)).not.toThrow();
  });

  it("DiffPanel is rendered inside the component", () => {
    render(<XmlDiff />);
    expect(screen.getByTestId("diff-panel")).toBeInTheDocument();
  });
});
