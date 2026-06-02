import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { XmlMinifier } from "@/components/tools/xml/XmlMinifier";

// ── CodePanel mock ────────────────────────────────────────────────────────────
vi.mock("@/components/ui/CodePanel", () => ({
  CodeEditor: ({ value, onChange, placeholder }: { value: string; onChange?: (v: string) => void; placeholder?: string }) => (
    <textarea
      data-testid="editor"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label="XML input"
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

describe("XmlMinifier", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it("renders both editor and output panel on mount", () => {
    render(<XmlMinifier />);
    expect(screen.getByTestId("editor")).toBeInTheDocument();
    expect(screen.getByTestId("output")).toBeInTheDocument();
  });

  it("output is empty on mount", () => {
    render(<XmlMinifier />);
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("shows no error on mount", () => {
    render(<XmlMinifier />);
    expect(screen.queryByText(/invalid xml/i)).not.toBeInTheDocument();
  });

  // ── Core minification ─────────────────────────────────────────────────────

  it("minifies pretty-printed XML to a compact single line", () => {
    render(<XmlMinifier />);
    const pretty = "<root>\n  <item>value</item>\n</root>";
    fireEvent.change(screen.getByTestId("editor"), { target: { value: pretty } });
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).not.toContain("\n");
    expect(output).toBe("<root><item>value</item></root>");
  });

  it("removes whitespace between tags", () => {
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root>  <a/>  <b/>  </root>" },
    });
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toBe("<root><a/><b/></root>");
  });

  it("handles self-closing tags correctly", () => {
    render(<XmlMinifier />);
    const pretty = "<root>\n  <empty/>\n  <item/>\n</root>";
    fireEvent.change(screen.getByTestId("editor"), { target: { value: pretty } });
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toBe("<root><empty/><item/></root>");
  });

  it("preserves attributes during minification", () => {
    render(<XmlMinifier />);
    const xml = '<root>\n  <item id="1" class="a"/>\n</root>';
    fireEvent.change(screen.getByTestId("editor"), { target: { value: xml } });
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toContain('id="1"');
    expect(output).toContain('class="a"');
  });

  it("strips XML comments from output", () => {
    render(<XmlMinifier />);
    const xml = "<root><!-- this comment should be removed --><item/></root>";
    fireEvent.change(screen.getByTestId("editor"), { target: { value: xml } });
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).not.toContain("<!--");
    expect(output).toContain("<root>");
  });

  it("handles deeply nested XML (3+ levels)", () => {
    render(<XmlMinifier />);
    const pretty = "<a>\n  <b>\n    <c>\n      <d>leaf</d>\n    </c>\n  </b>\n</a>";
    fireEvent.change(screen.getByTestId("editor"), { target: { value: pretty } });
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toBe("<a><b><c><d>leaf</d></c></b></a>");
    expect(output).not.toContain("\n");
  });

  it("compact XML is returned unchanged (idempotent)", () => {
    render(<XmlMinifier />);
    const compact = "<root><item>val</item></root>";
    fireEvent.change(screen.getByTestId("editor"), { target: { value: compact } });
    expect(screen.getByTestId("output").textContent).toBe(compact);
  });

  // ── Savings display ───────────────────────────────────────────────────────

  it("shows byte savings display after valid minification", () => {
    render(<XmlMinifier />);
    const pretty = "<root>\n  <item>value</item>\n</root>";
    fireEvent.change(screen.getByTestId("editor"), { target: { value: pretty } });
    expect(screen.getByText(/B →/)).toBeInTheDocument();
  });

  it("savings display is hidden when output is empty", () => {
    render(<XmlMinifier />);
    expect(screen.queryByText(/B →/)).not.toBeInTheDocument();
  });

  // ── Invalid input ─────────────────────────────────────────────────────────

  it("shows 'invalid xml' banner for malformed XML", () => {
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><unclosed>" },
    });
    expect(screen.getByText(/invalid xml/i)).toBeInTheDocument();
  });

  it("produces no output for invalid XML", () => {
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<bad" },
    });
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("shows specific error text for invalid XML", () => {
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><child></wrong></root>" },
    });
    const errorEls = document.querySelectorAll(".text-red-400");
    const hasContent = Array.from(errorEls).some(
      (el) => el.textContent && el.textContent.trim().length > 0
    );
    expect(hasContent).toBe(true);
  });

  it("shows error for multiple root elements", () => {
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<a/><b/>" },
    });
    expect(screen.getByText(/invalid xml/i)).toBeInTheDocument();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it("handles empty input gracefully (no error, no output)", () => {
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "" } });
    expect(screen.queryByText(/invalid xml/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("handles whitespace-only input gracefully", () => {
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "   \n  " } });
    expect(screen.queryByText(/invalid xml/i)).not.toBeInTheDocument();
  });

  it("handles XML with unicode text", () => {
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root>\n  <item>\u4e2d\u6587</item>\n</root>" },
    });
    expect(screen.queryByText(/invalid xml/i)).not.toBeInTheDocument();
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).not.toContain("\n");
  });

  it("handles a very large XML document", () => {
    render(<XmlMinifier />);
    const items = Array.from({ length: 200 }, (_, i) => `<item>${i}</item>`).join("");
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: `<root>\n  ${items}\n</root>` },
    });
    expect(screen.queryByText(/invalid xml/i)).not.toBeInTheDocument();
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output.startsWith("<root>")).toBe(true);
    expect(output).not.toContain("\n");
  });

  it("handles XML with XML declaration", () => {
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '<?xml version="1.0"?>\n<root/>' },
    });
    // XML declaration is a processing instruction; minifyXML just strips whitespace
    expect(screen.queryByText(/invalid xml/i)).not.toBeInTheDocument();
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toContain("<root");
  });

  // ── Copy button ───────────────────────────────────────────────────────────

  it("copy button writes minified output to clipboard", async () => {
    const user = userEvent.setup();
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root>\n  <item/>\n</root>" },
    });
    const copyBtn = screen.getByTitle(/^copy$/i);
    await user.click(copyBtn);
    // userEvent has its own virtual clipboard; read back to verify
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBe("<root><item/></root>");
  });

  it("copy button is disabled when output is empty", () => {
    render(<XmlMinifier />);
    expect(screen.getByTitle(/^copy$/i)).toBeDisabled();
  });

  // ── Clear button ──────────────────────────────────────────────────────────

  it("clear button resets input and output", async () => {
    const user = userEvent.setup();
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root/>" },
    });
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.getByTestId("editor")).toHaveValue("");
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("clear button removes error banner", async () => {
    const user = userEvent.setup();
    render(<XmlMinifier />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<bad" },
    });
    expect(screen.getByText(/invalid xml/i)).toBeInTheDocument();
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.queryByText(/invalid xml/i)).not.toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("editor has an accessible label", () => {
    render(<XmlMinifier />);
    expect(screen.getByLabelText(/xml input/i)).toBeInTheDocument();
  });

  it("buttons have accessible title attributes", () => {
    render(<XmlMinifier />);
    expect(screen.getByTitle(/clear/i)).toBeInTheDocument();
    expect(screen.getByTitle(/^copy$/i)).toBeInTheDocument();
  });
});
