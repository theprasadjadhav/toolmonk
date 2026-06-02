import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CsvToJson } from "@/components/tools/converters/CsvToJson";

// Monaco Editor is heavy — replace with a simple textarea pair
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

describe("CsvToJson", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Rendering ─────────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders input and output panels", () => {
      render(<CsvToJson />);
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
      expect(screen.getByTestId("code-output")).toBeInTheDocument();
    });

    it("renders sample and clear toolbar buttons", () => {
      render(<CsvToJson />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("shows csv input placeholder", () => {
      render(<CsvToJson />);
      expect(screen.getByPlaceholderText("Paste CSV data here…")).toBeInTheDocument();
    });

    it("shows JSON output placeholder when empty", () => {
      render(<CsvToJson />);
      expect(screen.getByPlaceholderText("JSON output appears here…")).toBeInTheDocument();
    });

    it("renders delimiter and indent selects", () => {
      render(<CsvToJson />);
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it("renders 'First row is header' checkbox", () => {
      render(<CsvToJson />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });
  });

  // ── Conversion logic ──────────────────────────────────────────────────────────

  describe("conversion logic", () => {
    it("converts simple CSV to JSON array", () => {
      render(<CsvToJson />);
      typeInEditor("name,age\nAlice,30\nBob,25");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed).toEqual([
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ]);
    });

    it("handles CSV with boolean values (dynamicTyping)", () => {
      render(<CsvToJson />);
      typeInEditor("name,active\nAlice,true\nBob,false");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed[0].active).toBe(true);
      expect(parsed[1].active).toBe(false);
    });

    it("produces an array of arrays when header checkbox is unchecked", async () => {
      const user = userEvent.setup();
      render(<CsvToJson />);
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      typeInEditor("Alice,30\nBob,25");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(Array.isArray(parsed[0])).toBe(true);
    });

    it("sample button fills input and produces valid JSON", async () => {
      const user = userEvent.setup();
      render(<CsvToJson />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await waitFor(() => {
        expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).not.toBe("");
      });
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it("shows row count badge after conversion", async () => {
      const user = userEvent.setup();
      render(<CsvToJson />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await waitFor(() => {
        expect(screen.getByText(/rows/i)).toBeInTheDocument();
      });
    });
  });

  // ── Validation / error handling ───────────────────────────────────────────────

  describe("validation", () => {
    it("shows no error and empty output for blank input", () => {
      render(<CsvToJson />);
      expect(document.querySelector(".text-red-400")).toBeNull();
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });

    it("clears error and output when input is cleared", () => {
      render(<CsvToJson />);
      typeInEditor("a,b\n1,2");
      typeInEditor("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Clear button ──────────────────────────────────────────────────────────────

  describe("clear", () => {
    it("clears input and output", async () => {
      const user = userEvent.setup();
      render(<CsvToJson />);
      await user.click(screen.getByRole("button", { name: /sample/i }));
      await user.click(screen.getByRole("button", { name: /clear/i }));
      expect((screen.getByTestId("code-editor") as HTMLTextAreaElement).value).toBe("");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles a single-column CSV", () => {
      render(<CsvToJson />);
      typeInEditor("name\nAlice\nBob");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual({ name: "Alice" });
    });

    it("handles numeric-only columns (dynamicTyping)", () => {
      render(<CsvToJson />);
      typeInEditor("x,y\n1,2\n3,4");
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(typeof parsed[0].x).toBe("number");
    });

    it("handles many rows without error", () => {
      render(<CsvToJson />);
      const rows = ["id,val", ...Array.from({ length: 100 }, (_, i) => `${i},${i * 2}`)].join("\n");
      typeInEditor(rows);
      const parsed = JSON.parse((screen.getByTestId("code-output") as HTMLTextAreaElement).value);
      expect(parsed).toHaveLength(100);
    });

    it("handles whitespace-only input as empty", () => {
      render(<CsvToJson />);
      typeInEditor("   ");
      expect((screen.getByTestId("code-output") as HTMLTextAreaElement).value).toBe("");
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("sample and clear buttons have accessible names", () => {
      render(<CsvToJson />);
      expect(screen.getByRole("button", { name: /sample/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("header checkbox is present", () => {
      render(<CsvToJson />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });
  });
});
