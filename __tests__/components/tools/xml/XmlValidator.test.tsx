import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { XmlValidator } from "@/components/tools/xml/XmlValidator";

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
  CodeOutput: ({ value }: { value: string }) => <pre data-testid="output">{value}</pre>,
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

describe("XmlValidator", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it("renders the editor on mount", () => {
    render(<XmlValidator />);
    expect(screen.getByTestId("editor")).toBeInTheDocument();
  });

  it("shows placeholder instruction when input is empty", () => {
    render(<XmlValidator />);
    expect(screen.getByText(/paste xml below to validate/i)).toBeInTheDocument();
  });

  // ── Valid XML ─────────────────────────────────────────────────────────────

  it("shows 'valid xml' for a simple well-formed document", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><child/></root>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("shows root tag name in valid status info", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<catalog><item/></catalog>" },
    });
    expect(screen.getByText(/root: <catalog>/i)).toBeInTheDocument();
  });

  it("shows element count in valid status info", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><a/><b/></root>" },
    });
    // 3 elements: root, a, b
    expect(screen.getByText(/3 elements/i)).toBeInTheDocument();
  });

  it("handles a self-closing root element", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root/>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles XML with attributes", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '<root id="1"><child type="a"/></root>' },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles XML with text content", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><item>Hello World</item></root>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles XML with XML declaration", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '<?xml version="1.0"?><root/>' },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles deeply nested XML (3+ levels)", () => {
    render(<XmlValidator />);
    const xml = "<a><b><c><d>deep</d></c></b></a>";
    fireEvent.change(screen.getByTestId("editor"), { target: { value: xml } });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles unicode characters in text content", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><item>&#x2764; \u4e2d\u6587</item></root>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  // ── Invalid XML ───────────────────────────────────────────────────────────

  it("shows 'invalid xml' for unclosed tag", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><child>" },
    });
    expect(screen.getByText(/invalid xml/i)).toBeInTheDocument();
  });

  it("shows 'invalid xml' for mismatched tags", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><child></wrong></root>" },
    });
    expect(screen.getByText(/invalid xml/i)).toBeInTheDocument();
  });

  it("shows 'invalid xml' for missing root element", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "not xml at all" },
    });
    expect(screen.getByText(/invalid xml/i)).toBeInTheDocument();
  });

  it("shows 'invalid xml' for unclosed attribute quote", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '<root id="unclosed>' },
    });
    expect(screen.getByText(/invalid xml/i)).toBeInTheDocument();
  });

  it("shows a specific error message (not empty) for invalid XML", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><unclosed>" },
    });
    // ErrorBanner renders the error text from parseXML
    const errorTexts = document.querySelectorAll(".text-status-err-text");
    const hasErrorText = Array.from(errorTexts).some(
      (el) => el.textContent && el.textContent.trim().length > 0
    );
    expect(hasErrorText).toBe(true);
  });

  it("shows 'invalid xml' for multiple root elements", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root1/><root2/>" },
    });
    expect(screen.getByText(/invalid xml/i)).toBeInTheDocument();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it("shows placeholder (no error) when input is only whitespace", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "   " } });
    expect(screen.getByText(/paste xml below to validate/i)).toBeInTheDocument();
  });

  it("handles a very long XML document without crashing", () => {
    render(<XmlValidator />);
    const items = Array.from({ length: 500 }, (_, i) => `<item id="${i}">value</item>`).join("");
    const xml = `<root>${items}</root>`;
    fireEvent.change(screen.getByTestId("editor"), { target: { value: xml } });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles XML with CDATA sections", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><![CDATA[<not parsed>]]></root>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  it("handles XML with comments", () => {
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root><!-- comment --><child/></root>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
  });

  // ── Copy button ───────────────────────────────────────────────────────────

  it("copy button writes input to clipboard", async () => {
    const user = userEvent.setup();
    render(<XmlValidator />);
    const xml = "<root/>";
    fireEvent.change(screen.getByTestId("editor"), { target: { value: xml } });
    await user.click(screen.getByTitle(/copy/i));
    // userEvent has its own virtual clipboard; read back to verify
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBe(xml);
  });

  it("copy button is disabled when input is empty", () => {
    render(<XmlValidator />);
    expect(screen.getByTitle(/copy/i)).toBeDisabled();
  });

  // ── Clear button ──────────────────────────────────────────────────────────

  it("clear button resets input and shows placeholder again", async () => {
    const user = userEvent.setup();
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<root/>" },
    });
    expect(screen.getByText(/valid xml/i)).toBeInTheDocument();
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.getByTestId("editor")).toHaveValue("");
    expect(screen.getByText(/paste xml below to validate/i)).toBeInTheDocument();
  });

  it("clear button removes error banner", async () => {
    const user = userEvent.setup();
    render(<XmlValidator />);
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "<unclosed>" },
    });
    expect(screen.getByText(/invalid xml/i)).toBeInTheDocument();
    await user.click(screen.getByTitle(/clear/i));
    expect(screen.queryByText(/invalid xml/i)).not.toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("editor has an accessible label", () => {
    render(<XmlValidator />);
    expect(screen.getByLabelText(/xml input/i)).toBeInTheDocument();
  });

  it("toolbar buttons have title attributes (accessible names)", () => {
    render(<XmlValidator />);
    expect(screen.getByTitle(/copy/i)).toBeInTheDocument();
    expect(screen.getByTitle(/clear/i)).toBeInTheDocument();
  });
});
