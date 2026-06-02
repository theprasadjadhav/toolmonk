import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonMinifier } from "@/components/tools/json/JsonMinifier";

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

describe("JsonMinifier", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it("renders both editor and output panel on mount", () => {
    render(<JsonMinifier />);
    expect(screen.getByTestId("editor")).toBeInTheDocument();
    expect(screen.getByTestId("output")).toBeInTheDocument();
  });

  it("output is empty on mount", () => {
    render(<JsonMinifier />);
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("shows no error on mount", () => {
    render(<JsonMinifier />);
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // ── Core minification ─────────────────────────────────────────────────────

  it("minifies pretty-printed JSON to a compact single line", () => {
    render(<JsonMinifier />);
    const pretty = '{\n  "a": 1,\n  "b": 2\n}';
    fireEvent.change(screen.getByTestId("editor"), { target: { value: pretty } });
    expect(screen.getByTestId("output").textContent).toBe('{"a":1,"b":2}');
  });

  it("removes all unnecessary whitespace and newlines", () => {
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{ "key" : "value" }' },
    });
    const out = screen.getByTestId("output").textContent ?? "";
    expect(out).toBe('{"key":"value"}');
    expect(out).not.toContain("\n");
    expect(out).not.toContain("  ");
  });

  it("minifies a compact object with no change (idempotent)", () => {
    render(<JsonMinifier />);
    const compact = '{"a":1,"b":2}';
    fireEvent.change(screen.getByTestId("editor"), { target: { value: compact } });
    expect(screen.getByTestId("output").textContent).toBe(compact);
  });

  it("minifies an array correctly", () => {
    render(<JsonMinifier />);
    const pretty = '[\n  1,\n  2,\n  3\n]';
    fireEvent.change(screen.getByTestId("editor"), { target: { value: pretty } });
    expect(screen.getByTestId("output").textContent).toBe("[1,2,3]");
  });

  it("minifies deeply nested structures", () => {
    render(<JsonMinifier />);
    const nested = '{\n  "a": {\n    "b": {\n      "c": 1\n    }\n  }\n}';
    fireEvent.change(screen.getByTestId("editor"), { target: { value: nested } });
    expect(screen.getByTestId("output").textContent).toBe('{"a":{"b":{"c":1}}}');
  });

  // ── Savings display ───────────────────────────────────────────────────────

  it("shows byte savings display after valid minification", () => {
    render(<JsonMinifier />);
    const pretty = '{\n  "key": "value"\n}';
    fireEvent.change(screen.getByTestId("editor"), { target: { value: pretty } });
    // SavingsDisplay shows "X B → Y B"
    expect(screen.getByText(/B →/)).toBeInTheDocument();
  });

  it("savings display is hidden when output is empty", () => {
    render(<JsonMinifier />);
    expect(screen.queryByText(/B →/)).not.toBeInTheDocument();
  });

  // ── Invalid input ─────────────────────────────────────────────────────────

  it("shows error banner for invalid JSON", () => {
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "{bad}" } });
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it("shows specific error text from JSON.parse", () => {
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "{" } });
    // ErrorBanner renders the raw error message
    const errorEl = document.querySelector(".text-red-400");
    expect(errorEl).toBeTruthy();
    expect(errorEl!.textContent).not.toBe("");
  });

  it("produces no output for invalid JSON", () => {
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "{bad}" } });
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("shows error for JSON with trailing comma", () => {
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"a":1,}' },
    });
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it("handles empty input gracefully (no error, no output)", () => {
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "" } });
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("handles whitespace-only input gracefully", () => {
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "   " } });
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it("handles null value", () => {
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "null" } });
    expect(screen.getByTestId("output").textContent).toBe("null");
  });

  it("handles empty array", () => {
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "[]" } });
    expect(screen.getByTestId("output").textContent).toBe("[]");
  });

  it("handles empty object", () => {
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "{}" } });
    expect(screen.getByTestId("output").textContent).toBe("{}");
  });

  it("handles unicode characters in values", () => {
    render(<JsonMinifier />);
    const json = '{ "emoji": "\\u2764" }';
    fireEvent.change(screen.getByTestId("editor"), { target: { value: json } });
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    const out = screen.getByTestId("output").textContent ?? "";
    expect(out).not.toContain(" ");
    expect(out.startsWith("{")).toBe(true);
  });

  it("handles a very long string value", () => {
    render(<JsonMinifier />);
    const json = JSON.stringify({ data: "x".repeat(10000) });
    fireEvent.change(screen.getByTestId("editor"), { target: { value: json } });
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("output").textContent).not.toBe("");
  });

  // ── Copy button ───────────────────────────────────────────────────────────

  it("copy button writes minified output to clipboard", async () => {
    const user = userEvent.setup();
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{ "a": 1 }' },
    });
    const copyBtn = screen.getByTitle(/^copy$/i);
    await user.click(copyBtn);
    // userEvent has its own virtual clipboard; read back to verify
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBe('{"a":1}');
  });

  it("copy button is disabled when output is empty", () => {
    render(<JsonMinifier />);
    expect(screen.getByTitle(/^copy$/i)).toBeDisabled();
  });

  // ── Clear button ──────────────────────────────────────────────────────────

  it("clear button resets input and output", async () => {
    const user = userEvent.setup();
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '{"a":1}' },
    });
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.getByTestId("editor")).toHaveValue("");
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("clear button removes error banner", async () => {
    const user = userEvent.setup();
    render(<JsonMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "{bad}" } });
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("editor has an accessible label", () => {
    render(<JsonMinifier />);
    expect(screen.getByLabelText(/json input/i)).toBeInTheDocument();
  });

  it("buttons have accessible title attributes", () => {
    render(<JsonMinifier />);
    expect(screen.getByTitle(/clear/i)).toBeInTheDocument();
    expect(screen.getByTitle(/^copy$/i)).toBeInTheDocument();
  });
});
