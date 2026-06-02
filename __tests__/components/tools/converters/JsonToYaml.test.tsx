import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonToYaml } from "@/components/tools/converters/JsonToYaml";

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

describe("JsonToYaml", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Rendering ─────────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders input and output panels", () => {
      render(<JsonToYaml />);
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
      expect(screen.getByTestId("code-output")).toBeInTheDocument();
    });

    it("renders sample and clear buttons", () => {
      render(<JsonToYaml />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("shows JSON input placeholder", () => {
      render(<JsonToYaml />);
      expect(screen.getByPlaceholderText("Paste JSON here…")).toBeInTheDocument();
    });

    it("shows YAML output placeholder when empty", () => {
      render(<JsonToYaml />);
      expect(screen.getByPlaceholderText("YAML output appears here…")).toBeInTheDocument();
    });
  });

  // ── Conversion logic ──────────────────────────────────────────────────────────

  describe("conversion logic", () => {
    it("converts a simple JSON object to YAML", () => {
      render(<JsonToYaml />);
      typeInEditor(JSON.stringify({ name: "Alice", age: 30 }));
      const yaml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(yaml).toContain("name: Alice");
      expect(yaml).toContain("age: 30");
    });

    it("converts a JSON array to YAML list", () => {
      render(<JsonToYaml />);
      typeInEditor(JSON.stringify(["auth", "logging", "metrics"]));
      const yaml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(yaml).toContain("- auth");
      expect(yaml).toContain("- logging");
    });

    it("converts nested JSON to indented YAML", () => {
      render(<JsonToYaml />);
      typeInEditor(JSON.stringify({ server: { host: "localhost", port: 8080 } }));
      const yaml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(yaml).toContain("server:");
      expect(yaml).toContain("host: localhost");
      expect(yaml).toContain("port: 8080");
    });

    it("converts boolean values to YAML booleans", () => {
      render(<JsonToYaml />);
      typeInEditor(JSON.stringify({ active: true, deleted: false }));
      const yaml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(yaml).toContain("active: true");
      expect(yaml).toContain("deleted: false");
    });

    it("converts null values", () => {
      render(<JsonToYaml />);
      typeInEditor(JSON.stringify({ key: null }));
      const yaml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(yaml).toContain("key:");
    });

    it("sample button loads and produces valid YAML", async () => {
      const user = userEvent.setup();
      render(<JsonToYaml />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await waitFor(() => {
        const output = screen.getByTestId("code-output");
        expect((output as HTMLTextAreaElement).value).not.toBe("");
      });
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toContain("server:");
    });

    it("empty input produces empty output", () => {
      render(<JsonToYaml />);
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Validation / error handling ───────────────────────────────────────────────

  describe("validation", () => {
    it("shows error for invalid JSON", () => {
      render(<JsonToYaml />);
      typeInEditor("{broken json");
      const errorEl = document.querySelector(".text-red-400");
      expect(errorEl).toBeTruthy();
    });

    it("output is cleared when input becomes empty", () => {
      render(<JsonToYaml />);
      typeInEditor('{"a":1}');
      typeInEditor("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Clear button ──────────────────────────────────────────────────────────────

  describe("clear", () => {
    it("clears input and output when clear is clicked", async () => {
      const user = userEvent.setup();
      render(<JsonToYaml />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await user.click(screen.getByRole("button", { name: /clear/i }));
      expect((screen.getByTestId("code-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles deeply nested JSON without error", () => {
      render(<JsonToYaml />);
      typeInEditor(JSON.stringify({ l1: { l2: { l3: { l4: "deep" } } } }));
      const yaml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(yaml).toContain("l4: deep");
    });

    it("handles Unicode string values", () => {
      render(<JsonToYaml />);
      typeInEditor(JSON.stringify({ greeting: "こんにちは" }));
      const yaml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(yaml).toContain("こんにちは");
    });

    it("handles large numbers", () => {
      render(<JsonToYaml />);
      typeInEditor(JSON.stringify({ big: 9999999999 }));
      const yaml = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(yaml).toContain("9999999999");
    });

    it("handles whitespace-only input as empty", () => {
      render(<JsonToYaml />);
      typeInEditor("   ");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("sample and clear buttons have accessible names", () => {
      render(<JsonToYaml />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });
  });
});
