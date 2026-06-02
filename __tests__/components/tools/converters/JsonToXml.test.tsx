import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonToXml } from "@/components/tools/converters/JsonToXml";

vi.mock("@/components/ui/CodePanel", () => ({
  CodeEditor: ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
  CodeOutput: ({ value, placeholder }: { value: string; placeholder?: string }) => (
    <textarea
      data-testid="code-output"
      readOnly
      value={value}
      placeholder={placeholder}
    />
  ),
}));

vi.mock("@/lib/utils/file", () => ({
  uploadText: vi.fn().mockResolvedValue(null),
  downloadText: vi.fn(),
}));

/** Helper: fire a change event on the code-editor textarea */
function typeInEditor(value: string) {
  const editor = screen.getByTestId("code-editor");
  fireEvent.change(editor, { target: { value } });
}

describe("JsonToXml", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Rendering ─────────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders input and output panels", () => {
      render(<JsonToXml />);
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
      expect(screen.getByTestId("code-output")).toBeInTheDocument();
    });

    it("renders sample and clear buttons", () => {
      render(<JsonToXml />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("shows JSON input placeholder", () => {
      render(<JsonToXml />);
      expect(screen.getByPlaceholderText("Paste JSON here…")).toBeInTheDocument();
    });

    it("shows XML output placeholder when empty", () => {
      render(<JsonToXml />);
      expect(screen.getByPlaceholderText("XML output appears here…")).toBeInTheDocument();
    });
  });

  // ── Conversion logic ──────────────────────────────────────────────────────────

  describe("conversion logic", () => {
    it("converts a simple JSON object to XML with XML declaration", () => {
      render(<JsonToXml />);
      typeInEditor(JSON.stringify({ name: "Alice" }));
      const xml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain("<name>");
      expect(xml).toContain("Alice");
    });

    it("wraps non-object input in items/item structure", () => {
      render(<JsonToXml />);
      typeInEditor(JSON.stringify([1, 2, 3]));
      const xml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(xml).toContain("<items>");
    });

    it("converts nested objects to nested XML elements", () => {
      render(<JsonToXml />);
      typeInEditor(JSON.stringify({ person: { name: "Alice", age: 30 } }));
      const xml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(xml).toContain("<person>");
      expect(xml).toContain("<name>");
      expect(xml).toContain("Alice");
      expect(xml).toContain("<age>");
    });

    it("sample button loads and converts to XML", async () => {
      const user = userEvent.setup();
      render(<JsonToXml />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await waitFor(() => {
        const output = screen.getByTestId("code-output");
        expect((output as HTMLTextAreaElement).value).toContain("<?xml");
      });
    });

    it("empty input produces empty output with no error", () => {
      render(<JsonToXml />);
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
      expect(document.querySelector(".text-red-400")).toBeNull();
    });
  });

  // ── Validation / error handling ───────────────────────────────────────────────

  describe("validation", () => {
    it("shows error for invalid JSON", () => {
      render(<JsonToXml />);
      typeInEditor("{ bad json:");
      const errorEl = document.querySelector(".text-red-400");
      expect(errorEl).toBeTruthy();
    });

    it("clears output when input is cleared after valid conversion", () => {
      render(<JsonToXml />);
      typeInEditor('{"a":1}');
      typeInEditor("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });

    it("whitespace-only input produces empty output with no error", () => {
      render(<JsonToXml />);
      typeInEditor("   ");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Clear button ──────────────────────────────────────────────────────────────

  describe("clear", () => {
    it("clears input and output", async () => {
      const user = userEvent.setup();
      render(<JsonToXml />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await user.click(screen.getByRole("button", { name: /clear/i }));
      expect((screen.getByTestId("code-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles deeply nested JSON", () => {
      render(<JsonToXml />);
      typeInEditor(JSON.stringify({ a: { b: { c: { d: "deep" } } } }));
      const xml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(xml).toContain("<a>");
      expect(xml).toContain("<b>");
      expect(xml).toContain("<c>");
      expect(xml).toContain("deep");
    });

    it("handles an object with a null value without throwing", () => {
      render(<JsonToXml />);
      typeInEditor(JSON.stringify({ key: null }));
      const xml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(xml).toContain("<?xml");
    });

    it("handles a string scalar value", () => {
      render(<JsonToXml />);
      typeInEditor('"hello"');
      const xml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      // String scalar gets wrapped in items/item
      expect(xml).toContain("<?xml");
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("sample and clear buttons have accessible names", () => {
      render(<JsonToXml />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });
  });
});
