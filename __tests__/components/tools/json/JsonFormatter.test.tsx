import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonFormatter } from "@/components/tools/json/JsonFormatter";

// ── CodePanel mock ────────────────────────────────────────────────────────────
vi.mock("@/components/ui/CodePanel", () => ({
  CodeEditor: ({ value, onChange, placeholder }: { value: string; onChange?: (v: string) => void; placeholder?: string }) => (
    <textarea
      data-testid="editor"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label="JSON input"
    />
  ),
  CodeOutput: ({ value }: { value: string }) => (
    <pre data-testid="output">{value}</pre>
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

describe("JsonFormatter", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it("renders both input editor and output area on mount", () => {
    render(<JsonFormatter />);
    expect(screen.getByTestId("editor")).toBeInTheDocument();
    expect(screen.getByTestId("output")).toBeInTheDocument();
  });

  it("output area is empty on mount", () => {
    render(<JsonFormatter />);
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("shows no validation status on mount (idle)", () => {
    render(<JsonFormatter />);
    expect(screen.queryByText(/valid json/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // ── Formatting on input change ────────────────────────────────────────────

  it("formats compact JSON into pretty-printed output with 2-space indent", () => {
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"a":1,"b":2}' },
    });
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toContain('"a": 1');
    expect(output).toContain('"b": 2');
    expect(output).toMatch(/^\{/);
  });

  it("shows 'valid json' status after successful formatting", () => {
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"key":"value"}' },
    });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  it("reports line count in valid info", () => {
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"a":1,"b":2}' },
    });
    // formatted output has multiple lines; line count is shown
    expect(screen.getByText(/\d+ lines/i)).toBeInTheDocument();
  });

  it("shows error status for invalid JSON input", () => {
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "{bad}" },
    });
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it("clears output when input is invalid", () => {
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"a":1}' },
    });
    expect(screen.getByTestId("output").textContent).not.toBe("");

    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "{bad" },
    });
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("resets to idle when input is cleared to empty", () => {
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"a":1}' },
    });
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "" } });
    expect(screen.queryByText(/valid json/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // ── Indent selector ───────────────────────────────────────────────────────

  it("re-formats with 4-space indent when selector is changed", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"a":1}' },
    });
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "4");
    const output = screen.getByTestId("output").textContent ?? "";
    // 4 spaces indent
    expect(output).toMatch(/\n {4}/);
  });

  // ── Toolbar format / minify buttons ──────────────────────────────────────

  it("format button re-formats already-valid input", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"x":99}' },
    });
    const formatBtn = screen.getByTitle(/format/i);
    await user.click(formatBtn);
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toContain('"x": 99');
  });

  it("minify button produces compact single-line output", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    const pretty = '{\n  "a": 1,\n  "b": 2\n}';
    fireEvent.change(screen.getByTestId("editor"), { target: { value: pretty } });
    const minifyBtn = screen.getByTitle(/minify/i);
    await user.click(minifyBtn);
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toBe('{"a":1,"b":2}');
  });

  // ── Copy button ───────────────────────────────────────────────────────────

  it("copy button writes formatted output to clipboard", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"a":1}' },
    });
    const copyBtn = screen.getByTitle(/^copy$/i);
    await user.click(copyBtn);
    // userEvent has its own virtual clipboard; read back to verify
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toContain('"a": 1');
  });

  // ── Clear button ──────────────────────────────────────────────────────────

  it("clear button resets input, output, and status", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"a":1}' },
    });
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.getByTestId("editor")).toHaveValue("");
    expect(screen.getByTestId("output").textContent).toBe("");
    expect(screen.queryByText(/valid json/i)).not.toBeInTheDocument();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it("handles null value", () => {
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "null" } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
    expect(screen.getByTestId("output").textContent).toBe("null");
  });

  it("handles empty array", () => {
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "[]" } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  it("handles empty object", () => {
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "{}" } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  it("handles deeply nested structures", () => {
    render(<JsonFormatter />);
    const deep = JSON.stringify({ a: { b: { c: { d: "value" } } } });
    fireEvent.change(screen.getByTestId("editor"), { target: { value: deep } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toContain('"d": "value"');
  });

  it("handles unicode characters in keys and values", () => {
    render(<JsonFormatter />);
    const json = '{"emoji":"\\u2764","lang":"\\u4e2d\\u6587"}';
    fireEvent.change(screen.getByTestId("editor"), { target: { value: json } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  it("handles a very long string value", () => {
    render(<JsonFormatter />);
    const json = JSON.stringify({ data: "x".repeat(10000) });
    fireEvent.change(screen.getByTestId("editor"), { target: { value: json } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  it("rejects JSON with // comments", () => {
    render(<JsonFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"a":1} // comment' },
    });
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("editor textarea has an accessible label", () => {
    render(<JsonFormatter />);
    expect(screen.getByLabelText(/json input/i)).toBeInTheDocument();
  });

  it("toolbar buttons have accessible title attributes", () => {
    render(<JsonFormatter />);
    expect(screen.getByTitle(/format/i)).toBeInTheDocument();
    expect(screen.getByTitle(/minify/i)).toBeInTheDocument();
    expect(screen.getByTitle(/clear/i)).toBeInTheDocument();
  });
});
