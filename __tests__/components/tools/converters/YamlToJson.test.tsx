import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YamlToJson } from "@/components/tools/converters/YamlToJson";

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

describe("YamlToJson", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Rendering ─────────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders input and output panels", () => {
      render(<YamlToJson />);
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
      expect(screen.getByTestId("code-output")).toBeInTheDocument();
    });

    it("renders sample and clear buttons", () => {
      render(<YamlToJson />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("shows YAML input placeholder", () => {
      render(<YamlToJson />);
      expect(screen.getByPlaceholderText("Paste YAML here…")).toBeInTheDocument();
    });

    it("shows JSON output placeholder when empty", () => {
      render(<YamlToJson />);
      expect(screen.getByPlaceholderText("JSON output appears here…")).toBeInTheDocument();
    });

    it("renders an indent selector", () => {
      render(<YamlToJson />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  // ── Conversion logic ──────────────────────────────────────────────────────────

  describe("conversion logic", () => {
    it("converts a simple YAML mapping to JSON object", () => {
      render(<YamlToJson />);
      typeInEditor("name: Alice\nage: 30");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed).toEqual({ name: "Alice", age: 30 });
    });

    it("converts a YAML list to JSON array", () => {
      render(<YamlToJson />);
      typeInEditor("- auth\n- logging\n- metrics");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed).toEqual(["auth", "logging", "metrics"]);
    });

    it("converts nested YAML to nested JSON", () => {
      render(<YamlToJson />);
      typeInEditor("server:\n  host: localhost\n  port: 8080");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed.server.host).toBe("localhost");
      expect(parsed.server.port).toBe(8080);
    });

    it("converts YAML booleans to JSON booleans", () => {
      render(<YamlToJson />);
      typeInEditor("active: true\ndeleted: false");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed.active).toBe(true);
      expect(parsed.deleted).toBe(false);
    });

    it("converts YAML null (~) to JSON null", () => {
      render(<YamlToJson />);
      typeInEditor("key: ~");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed.key).toBeNull();
    });

    it("sample button loads and produces valid JSON", async () => {
      const user = userEvent.setup();
      render(<YamlToJson />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await waitFor(() => {
        expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).not.toBe("");
      });
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed).toHaveProperty("server");
    });

    it("empty input produces empty output", () => {
      render(<YamlToJson />);
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Indent selector ───────────────────────────────────────────────────────────

  describe("indent selector", () => {
    it("switches to 4-space indent", async () => {
      const user = userEvent.setup();
      render(<YamlToJson />);
      typeInEditor("server:\n  host: localhost");
      const indentSelect = screen.getByRole("combobox") as HTMLSelectElement;
      await user.selectOptions(indentSelect, "4");
      const value = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      // 4-space indent: nested "host" key should be indented by 4
      expect(value).toMatch(/    "host"/);
    });
  });

  // ── Validation / error handling ───────────────────────────────────────────────

  describe("validation", () => {
    it("shows error for invalid YAML using tab indentation", () => {
      render(<YamlToJson />);
      // YAML disallows tabs as indentation — js-yaml throws
      typeInEditor("key:\n\tbad_indent: true");
      const errorEl = document.querySelector(".text-red-400");
      expect(errorEl).toBeTruthy();
    });

    it("clears output when input is cleared after valid conversion", () => {
      render(<YamlToJson />);
      typeInEditor("a: 1");
      typeInEditor("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });

    it("whitespace-only input produces empty output with no error", () => {
      render(<YamlToJson />);
      typeInEditor("   ");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Clear button ──────────────────────────────────────────────────────────────

  describe("clear", () => {
    it("clears input and output", async () => {
      const user = userEvent.setup();
      render(<YamlToJson />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await user.click(screen.getByRole("button", { name: /clear/i }));
      expect((screen.getByTestId("code-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles Unicode string values", () => {
      render(<YamlToJson />);
      typeInEditor("greeting: こんにちは");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed.greeting).toBe("こんにちは");
    });

    it("handles YAML multi-line block scalars", () => {
      render(<YamlToJson />);
      typeInEditor("description: |\n  line one\n  line two");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed.description).toContain("line one");
    });

    it("handles large numbers", () => {
      render(<YamlToJson />);
      typeInEditor("count: 9999999");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed.count).toBe(9999999);
    });

    it("handles deeply nested YAML", () => {
      render(<YamlToJson />);
      typeInEditor("a:\n  b:\n    c:\n      d: deep");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed.a.b.c.d).toBe("deep");
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("sample and clear buttons have accessible names", () => {
      render(<YamlToJson />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("indent select is accessible", () => {
      render(<YamlToJson />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
