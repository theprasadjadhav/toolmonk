import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { XmlToJson } from "@/components/tools/converters/XmlToJson";

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

const SIMPLE_XML = `<person><name>Alice</name><age>30</age></person>`;
const REPEATED_XML = `<?xml version="1.0"?><root><item>one</item><item>two</item></root>`;

describe("XmlToJson", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Rendering ─────────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders input and output panels", () => {
      render(<XmlToJson />);
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
      expect(screen.getByTestId("code-output")).toBeInTheDocument();
    });

    it("renders sample and clear buttons", () => {
      render(<XmlToJson />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("shows XML input placeholder", () => {
      render(<XmlToJson />);
      expect(screen.getByPlaceholderText("Paste XML here…")).toBeInTheDocument();
    });

    it("shows JSON output placeholder when empty", () => {
      render(<XmlToJson />);
      expect(screen.getByPlaceholderText("JSON output appears here…")).toBeInTheDocument();
    });

    it("renders an indent selector", () => {
      render(<XmlToJson />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  // ── Conversion logic ──────────────────────────────────────────────────────────

  describe("conversion logic", () => {
    it("converts simple XML to JSON object", () => {
      render(<XmlToJson />);
      typeInEditor(SIMPLE_XML);
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      // isArray config wraps every non-attribute node in an array
      expect(parsed).toHaveProperty("person");
      // person is an array — get the first element
      const person = Array.isArray(parsed.person) ? parsed.person[0] : parsed.person;
      expect(person).toHaveProperty("name");
    });

    it("parses repeated tags into arrays", () => {
      render(<XmlToJson />);
      typeInEditor(REPEATED_XML);
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      // isArray config wraps all nodes in arrays; root and item are both arrays
      const root = Array.isArray(parsed.root) ? parsed.root[0] : parsed.root;
      expect(root).toBeTruthy();
      expect(Array.isArray(root.item)).toBe(true);
      expect(root.item).toContain("one");
      expect(root.item).toContain("two");
    });

    it("sample button loads and converts to valid JSON", async () => {
      const user = userEvent.setup();
      render(<XmlToJson />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await waitFor(() => {
        expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).not.toBe("");
      });
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      // isArray config: person is an array
      expect(parsed).toHaveProperty("person");
      const person = Array.isArray(parsed.person) ? parsed.person[0] : parsed.person;
      expect(person).toBeTruthy();
    });

    it("empty input produces empty output with no error", () => {
      render(<XmlToJson />);
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
      expect(document.querySelector(".text-red-400")).toBeNull();
    });

    it("whitespace-only input produces empty output", () => {
      render(<XmlToJson />);
      typeInEditor("   ");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Indent selector ───────────────────────────────────────────────────────────

  describe("indent selector", () => {
    it("switches output to 4-space indent when selected", async () => {
      const user = userEvent.setup();
      render(<XmlToJson />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await waitFor(() => {
        expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).not.toBe("");
      });
      const indentSelect = screen.getByRole("combobox") as HTMLSelectElement;
      await user.selectOptions(indentSelect, "4");
      const value = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      // 4-space indent: nested lines start with 4 spaces
      expect(value).toMatch(/    /);
    });
  });

  // ── Validation / error handling ───────────────────────────────────────────────

  describe("validation", () => {
    it("clears output when input is cleared after successful conversion", () => {
      render(<XmlToJson />);
      typeInEditor(SIMPLE_XML);
      typeInEditor("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });

    it("renders without crashing on malformed XML", () => {
      // fast-xml-parser is tolerant; just ensure the component doesn't throw
      render(<XmlToJson />);
      expect(() => typeInEditor("<root><unclosed")).not.toThrow();
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    });
  });

  // ── Clear button ──────────────────────────────────────────────────────────────

  describe("clear", () => {
    it("clears input and output", async () => {
      const user = userEvent.setup();
      render(<XmlToJson />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await user.click(screen.getByRole("button", { name: /clear/i }));
      expect((screen.getByTestId("code-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles an XML declaration with a self-closing root", () => {
      render(<XmlToJson />);
      typeInEditor('<?xml version="1.0"?><root/>');
      const output = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(output).not.toBe("");
    });

    it("handles deeply nested XML", () => {
      render(<XmlToJson />);
      typeInEditor("<a><b><c><d>deep</d></c></b></a>");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed).toHaveProperty("a");
    });

    it("handles XML with numeric content (parseTagValue: true)", () => {
      render(<XmlToJson />);
      typeInEditor("<data><value>42</value></data>");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      // isArray wraps all nodes: data is an array, value within data[0] is also an array
      const data = Array.isArray(parsed.data) ? parsed.data[0] : parsed.data;
      expect(data).toBeTruthy();
      const value = Array.isArray(data.value) ? data.value[0] : data.value;
      // parseTagValue converts numeric text to numbers
      expect(value).toBe(42);
    });

    it("handles XML with Unicode content", () => {
      render(<XmlToJson />);
      typeInEditor("<greeting>こんにちは</greeting>");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      // isArray wraps the greeting node in an array
      const greeting = Array.isArray(parsed.greeting) ? parsed.greeting[0] : parsed.greeting;
      expect(greeting).toBe("こんにちは");
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("sample and clear buttons have accessible names", () => {
      render(<XmlToJson />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("indent select is accessible as a combobox", () => {
      render(<XmlToJson />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
