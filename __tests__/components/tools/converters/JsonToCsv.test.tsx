import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonToCsv } from "@/components/tools/converters/JsonToCsv";

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

describe("JsonToCsv", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Rendering ─────────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders input and output panels", () => {
      render(<JsonToCsv />);
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
      expect(screen.getByTestId("code-output")).toBeInTheDocument();
    });

    it("renders sample and clear buttons", () => {
      render(<JsonToCsv />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("shows JSON input placeholder", () => {
      render(<JsonToCsv />);
      expect(screen.getByPlaceholderText("Paste a JSON array here…")).toBeInTheDocument();
    });

    it("shows CSV output placeholder when empty", () => {
      render(<JsonToCsv />);
      expect(screen.getByPlaceholderText("CSV output appears here…")).toBeInTheDocument();
    });

    it("renders 'Flatten nested' checkbox", () => {
      render(<JsonToCsv />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });
  });

  // ── Conversion logic ──────────────────────────────────────────────────────────

  describe("conversion logic", () => {
    it("converts a JSON array to CSV", () => {
      render(<JsonToCsv />);
      typeInEditor(JSON.stringify([{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]));
      const csv = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(csv).toContain("name,age");
      expect(csv).toContain("Alice,30");
      expect(csv).toContain("Bob,25");
    });

    it("converts a single JSON object to CSV", () => {
      render(<JsonToCsv />);
      typeInEditor(JSON.stringify({ name: "Carol", age: 35 }));
      const csv = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(csv).toContain("name,age");
      expect(csv).toContain("Carol,35");
    });

    it("flattens nested objects when flatten is enabled (default)", () => {
      render(<JsonToCsv />);
      typeInEditor(JSON.stringify([{ name: "Alice", address: { city: "London" } }]));
      const csv = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      // Flattened key: address.city
      expect(csv).toContain("address.city");
      expect(csv).toContain("London");
    });

    it("does not flatten when checkbox is unchecked", async () => {
      const user = userEvent.setup();
      render(<JsonToCsv />);
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox); // uncheck flatten
      typeInEditor(JSON.stringify([{ name: "Alice", address: { city: "London" } }]));
      const csv = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      // Unflattened: should NOT have "address.city"
      expect(csv).not.toContain("address.city");
    });

    it("sample button fills input and produces CSV output", async () => {
      const user = userEvent.setup();
      render(<JsonToCsv />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await waitFor(() => {
        const output = screen.getByTestId("code-output");
        expect((output as HTMLTextAreaElement).value).not.toBe("");
      });
      const output = screen.getByTestId("code-output");
      expect((output as HTMLTextAreaElement).value).toContain("name");
    });

    it("shows row count badge after successful conversion", async () => {
      const user = userEvent.setup();
      render(<JsonToCsv />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await waitFor(() => {
        expect(screen.getByText(/rows/i)).toBeInTheDocument();
      });
    });
  });

  // ── Validation / error handling ───────────────────────────────────────────────

  describe("validation", () => {
    it("shows error for invalid JSON input", () => {
      render(<JsonToCsv />);
      typeInEditor("{ not valid json");
      // An error message should appear in the DOM
      const errorEl = document.querySelector(".text-red-400");
      expect(errorEl).toBeTruthy();
    });

    it("shows no output for blank input", () => {
      render(<JsonToCsv />);
      const output = screen.getByTestId("code-output");
      expect((output as HTMLTextAreaElement).value).toBe("");
    });

    it("clears output when input is cleared", () => {
      render(<JsonToCsv />);
      typeInEditor('[{"a":1}]');
      typeInEditor("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Clear button ──────────────────────────────────────────────────────────────

  describe("clear", () => {
    it("clears input and output", async () => {
      const user = userEvent.setup();
      render(<JsonToCsv />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await user.click(screen.getByRole("button", { name: /clear/i }));
      expect((screen.getByTestId("code-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles an empty JSON array — no output", () => {
      render(<JsonToCsv />);
      typeInEditor("[]");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });

    it("handles primitive values wrapped in a value column", () => {
      render(<JsonToCsv />);
      typeInEditor(JSON.stringify([1, 2, 3]));
      const csv = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(csv).toContain("value");
    });

    it("handles Unicode in string fields", () => {
      render(<JsonToCsv />);
      typeInEditor(JSON.stringify([{ name: "日本語" }]));
      const csv = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(csv).toContain("日本語");
    });

    it("handles a large array without error", () => {
      render(<JsonToCsv />);
      const rows = Array.from({ length: 100 }, (_, i) => ({ id: i, val: i * 2 }));
      typeInEditor(JSON.stringify(rows));
      const csv = (screen.getByTestId("code-output") as HTMLTextAreaElement).value;
      expect(csv.split("\n").length).toBeGreaterThanOrEqual(100);
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("sample and clear buttons have accessible names", () => {
      render(<JsonToCsv />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("flatten checkbox is present", () => {
      render(<JsonToCsv />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });
  });
});
