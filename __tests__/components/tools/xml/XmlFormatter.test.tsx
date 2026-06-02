import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { XmlFormatter } from "@/components/tools/xml/XmlFormatter";

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

describe("XmlFormatter", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it("renders both editor and output panel on mount", () => {
    render(<XmlFormatter />);
    expect(screen.getByTestId("editor")).toBeInTheDocument();
    expect(screen.getByTestId("output")).toBeInTheDocument();
  });

  it("output is empty on mount", () => {
    render(<XmlFormatter />);
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("shows no validation status on mount", () => {
    render(<XmlFormatter />);
    expect(screen.queryByText(/valid xml/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // ── Formatting on input change ────────────────────────────────────────────

  it("formats compact XML to multi-line indented output (2 spaces)", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><child/></root>" },
    });
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toContain("\n");
    expect(output).toContain("<root>");
    expect(output).toContain("<child/>");
  });

  it("shows 'valid xml' status after formatting valid XML", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><item>text</item></root>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("shows line count after formatting", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><a/><b/></root>" },
    });
    expect(screen.getByText(/\d+ lines/i)).toBeInTheDocument();
  });

  it("indents child elements relative to parent", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><child/></root>" },
    });
    const output = screen.getByTestId("output").textContent ?? "";
    // child should be indented (2 spaces default)
    expect(output).toMatch(/  <child\/>/);
  });

  it("shows error status for invalid XML input", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><unclosed>" },
    });
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it("clears output when input is invalid", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root/>" },
    });
    expect(screen.getByTestId("output").textContent).not.toBe("");
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<unclosed" },
    });
    expect(screen.getByTestId("output").textContent).toBe("");
  });

  it("resets to idle when input is cleared to empty", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "<root/>" } });
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "" } });
    expect(screen.queryByText(/valid xml/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // ── Indent selector ───────────────────────────────────────────────────────

  it("re-formats with 4-space indent when selector is changed", async () => {
    const user = userEvent.setup();
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><child/></root>" },
    });
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "4");
    const output = screen.getByTestId("output").textContent ?? "";
    // 4-space indent: "    <child/>"
    expect(output).toMatch(/ {4}<child\/>/);
  });

  // ── Toolbar format / minify buttons ──────────────────────────────────────

  it("format button re-formats valid input", async () => {
    const user = userEvent.setup();
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><item>x</item></root>" },
    });
    await user.click(screen.getByTitle(/format/i));
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toContain("<root>");
    expect(output).toContain("<item>");
  });

  it("minify button produces compact single-line output", async () => {
    const user = userEvent.setup();
    render(<XmlFormatter />);
    const pretty = "<root>\n  <item>value</item>\n</root>";
    fireEvent.change(screen.getByTestId("editor"), { target: { value: pretty } });
    await user.click(screen.getByTitle(/minify/i));
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).not.toContain("\n");
    expect(output).toContain("<root>");
    expect(output).toContain("<item>value</item>");
  });

  // ── Copy button ───────────────────────────────────────────────────────────

  it("copy button writes formatted output to clipboard", async () => {
    const user = userEvent.setup();
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root/>" },
    });
    const copyBtn = screen.getByTitle(/^copy$/i);
    await user.click(copyBtn);
    // userEvent has its own virtual clipboard; read back to verify
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toContain("<root");
  });

  // ── Clear button ──────────────────────────────────────────────────────────

  it("clear button resets input, output, and status", async () => {
    const user = userEvent.setup();
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "<root/>" } });
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.getByTestId("editor")).toHaveValue("");
    expect(screen.getByTestId("output").textContent).toBe("");
    expect(screen.queryByText(/valid xml/i)).not.toBeInTheDocument();
  });

  it("clear button removes error message", async () => {
    const user = userEvent.setup();
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<bad" },
    });
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it("handles self-closing tags", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><empty/></root>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles XML with attributes", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '<root><item id="1" name="test"/></root>' },
    });
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toContain('id="1"');
  });

  it("handles deeply nested XML (3+ levels)", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<a><b><c><d>leaf</d></c></b></a>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
    const output = screen.getByTestId("output").textContent ?? "";
    expect(output).toContain("leaf");
  });

  it("handles XML with XML declaration", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '<?xml version="1.0" encoding="UTF-8"?><root/>' },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles XML with CDATA sections", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><![CDATA[some data]]></root>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles XML with comments", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><!-- comment --><child/></root>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles unicode text content", () => {
    render(<XmlFormatter />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><item>\u4e2d\u6587</item></root>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles a very large XML document", () => {
    render(<XmlFormatter />);
    const items = Array.from({ length: 200 }, (_, i) => `<item>${i}</item>`).join("");
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: `<root>${items}</root>` },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("editor has an accessible label", () => {
    render(<XmlFormatter />);
    expect(screen.getByLabelText(/xml input/i)).toBeInTheDocument();
  });

  it("toolbar buttons have accessible title attributes", () => {
    render(<XmlFormatter />);
    expect(screen.getByTitle(/format/i)).toBeInTheDocument();
    expect(screen.getByTitle(/minify/i)).toBeInTheDocument();
    expect(screen.getByTitle(/clear/i)).toBeInTheDocument();
  });
});
