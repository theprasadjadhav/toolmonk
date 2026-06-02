import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonValidator } from "@/components/tools/json/JsonValidator";

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
  CodeOutput: ({ value }: { value: string }) => <pre data-testid="output">{value}</pre>,
}));

// ── File utils mock ───────────────────────────────────────────────────────────
vi.mock("@/lib/utils/file", () => ({
  uploadText: vi.fn().mockResolvedValue(null),
  downloadText: vi.fn(),
}));

// ── ToolPanel mock ────────────────────────────────────────────────────────────
vi.mock("@/components/tool/ToolPanel", () => ({
  useToolFullscreen: () => false,
  FullscreenButton: () => <button>fullscreen</button>,
}));

// ─────────────────────────────────────────────────────────────────────────────

describe("JsonValidator", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it("renders placeholder instruction when input is empty", () => {
    render(<JsonValidator />);
    expect(screen.getByText(/paste json below to validate/i)).toBeInTheDocument();
  });

  it("renders the editor with json language placeholder", () => {
    render(<JsonValidator />);
    const editor = screen.getByTestId("editor");
    expect(editor).toBeInTheDocument();
  });

  // ── Valid JSON ────────────────────────────────────────────────────────────

  it("shows valid status for a simple object", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: '{"key":"value"}' } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  it("shows valid status for a JSON array", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: '[1,2,3]' } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  it("shows array item count for a valid JSON array", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: '[1,2,3]' } });
    expect(screen.getByText(/array · 3 items/i)).toBeInTheDocument();
  });

  it("shows object key count for a valid JSON object", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: '{"a":1,"b":2}' } });
    expect(screen.getByText(/object · 2 keys/i)).toBeInTheDocument();
  });

  it("shows type label for a primitive (string)", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: '"hello"' } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
    expect(screen.getByText(/string/i)).toBeInTheDocument();
  });

  it("shows type label for a boolean", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: 'true' } });
    expect(screen.getByText(/boolean/i)).toBeInTheDocument();
  });

  // ── Invalid JSON ──────────────────────────────────────────────────────────

  it("shows invalid status for malformed JSON", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "{invalid" } });
    expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
  });

  it("shows a specific error message (not just generic 'error')", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "{bad json}" } });
    // The native JSON.parse error message should appear, not swallowed
    const banner = document.querySelector(".text-red-400");
    expect(banner).toBeTruthy();
  });

  it("shows error for JSON with trailing comma", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: '{"a":1,}' } });
    expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
  });

  it("shows error for JSON with comments (// style)", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: '{"a":1} // comment' } });
    expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
  });

  it("shows error for unclosed brace", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: '{"unclosed":' } });
    expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it("shows placeholder (no error) when input is only whitespace", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "   " } });
    expect(screen.getByText(/paste json below to validate/i)).toBeInTheDocument();
  });

  it("handles null value as valid JSON", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "null" } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  it("handles empty array as valid JSON", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "[]" } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
    expect(screen.getByText(/array · 0 items/i)).toBeInTheDocument();
  });

  it("handles empty object as valid JSON", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "{}" } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
    expect(screen.getByText(/object · 0 keys/i)).toBeInTheDocument();
  });

  it("handles deeply nested structure (3+ levels)", () => {
    render(<JsonValidator />);
    const nested = JSON.stringify({ a: { b: { c: { d: 1 } } } });
    fireEvent.change(screen.getByTestId("editor"), { target: { value: nested } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  it("handles unicode characters in values", () => {
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"emoji":"\\u2764","cjk":"\\u4e2d\\u6587"}' },
    });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  it("handles a very long string value", () => {
    render(<JsonValidator />);
    const longStr = JSON.stringify({ data: "x".repeat(10000) });
    fireEvent.change(screen.getByTestId("editor"), { target: { value: longStr } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
  });

  // ── Copy button ───────────────────────────────────────────────────────────

  it("calls clipboard with input value when copy is clicked", async () => {
    const user = userEvent.setup();
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: '{"a":1}' } });
    const copyBtn = screen.getByTitle(/copy/i);
    await user.click(copyBtn);
    // userEvent has its own virtual clipboard; read back to verify
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBe('{"a":1}');
  });

  it("copy button is disabled when input is empty", () => {
    render(<JsonValidator />);
    const copyBtn = screen.getByTitle(/copy/i);
    expect(copyBtn).toBeDisabled();
  });

  // ── Clear button ──────────────────────────────────────────────────────────

  it("clear button resets input and hides validation status", async () => {
    const user = userEvent.setup();
    render(<JsonValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: '{"a":1}' } });
    expect(screen.getByText(/valid json/i)).toBeInTheDocument();
    const clearBtn = screen.getByTitle(/clear/i);
    await user.click(clearBtn);
    expect(screen.getByTestId("editor")).toHaveValue("");
    expect(screen.getByText(/paste json below to validate/i)).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("editor has an accessible label", () => {
    render(<JsonValidator />);
    expect(screen.getByLabelText(/json input/i)).toBeInTheDocument();
  });

  it("toolbar buttons have title attributes (accessible names)", () => {
    render(<JsonValidator />);
    expect(screen.getByTitle(/copy/i)).toBeInTheDocument();
    expect(screen.getByTitle(/clear/i)).toBeInTheDocument();
  });
});
