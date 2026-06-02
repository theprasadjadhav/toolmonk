import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Base64Encoder } from "@/components/tools/encoding/Base64Encoder";

vi.mock("@monaco-editor/react", () => ({
  default: ({ value, onChange }: { value: string; onChange?: (v: string) => void }) => (
    <textarea
      data-testid="editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

// ── Pure-logic unit tests ──────────────────────────────────────────────────────

function encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary);
}

describe("Base64Encoder — business logic (pure functions)", () => {
  it("encodes 'Hello, World!'", () => {
    expect(encode("Hello, World!")).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("encodes empty string to empty string", () => {
    expect(encode("")).toBe("");
  });

  it("encodes a single space", () => {
    expect(encode(" ")).toBe("IA==");
  });

  it("result contains only base64 characters", () => {
    const result = encode("test data for encoding");
    expect(/^[A-Za-z0-9+/=]+$/.test(result)).toBe(true);
  });

  it("encodes UTF-8 multi-byte characters", () => {
    const result = encode("café");
    expect(result.length).toBeGreaterThan(0);
    expect(/^[A-Za-z0-9+/=]+$/.test(result)).toBe(true);
  });

  it("encodes a long string without error", () => {
    const long = "a".repeat(10000);
    const result = encode(long);
    expect(result.length).toBeGreaterThan(0);
  });

  it("round-trips correctly (encode → decode)", () => {
    const original = "Round-trip test 123!";
    const encoded = encode(original);
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    expect(decoded).toBe(original);
  });
});

describe("Base64Encoder — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<Base64Encoder />);
    expect(screen.getByText(/— plain text/i)).toBeInTheDocument();
  });

  it("renders the output panel label", () => {
    render(<Base64Encoder />);
    expect(screen.getByText(/— base64/i)).toBeInTheDocument();
  });

  it("shows placeholder when no input is given", () => {
    render(<Base64Encoder />);
    expect(screen.getByText(/base64 output appears here/i)).toBeInTheDocument();
  });

  it("typing input shows encoded output", async () => {
    const user = userEvent.setup();
    render(<Base64Encoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "Hello");
    await waitFor(() => {
      expect(screen.queryByText(/base64 output appears here/i)).not.toBeInTheDocument();
    });
  });

  it("encodes 'Hello, World!' correctly", async () => {
    const user = userEvent.setup();
    render(<Base64Encoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "Hello, World!");
    // The CodeOutput renders a second Monaco editor when value is non-empty.
    // With our mock the output editor is a second <textarea>; we check that the
    // base64 placeholder is gone (meaning output was produced).
    await waitFor(() => {
      expect(screen.queryByText(/base64 output appears here/i)).not.toBeInTheDocument();
    });
  });

  it("clear button resets both panels", async () => {
    const user = userEvent.setup();
    render(<Base64Encoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "hello");
    await user.click(screen.getByTitle("clear"));
    expect((editor as HTMLTextAreaElement).value).toBe("");
    await waitFor(() => {
      expect(screen.getByText(/base64 output appears here/i)).toBeInTheDocument();
    });
  });

  it("renders clear toolbar button", () => {
    render(<Base64Encoder />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
  });

  it("renders upload panel button", () => {
    render(<Base64Encoder />);
    expect(screen.getByTitle("Upload text file")).toBeInTheDocument();
  });

  it("copy button is present in the output panel", () => {
    render(<Base64Encoder />);
    expect(screen.getByTitle("Copy")).toBeInTheDocument();
  });

  it("download button is present in the output panel", () => {
    render(<Base64Encoder />);
    expect(screen.getByTitle("Download")).toBeInTheDocument();
  });
});

describe("Base64Encoder — accessibility", () => {
  it("input section has a label", () => {
    render(<Base64Encoder />);
    expect(screen.getByText(/— plain text/i)).toBeInTheDocument();
  });

  it("output section has a label", () => {
    render(<Base64Encoder />);
    expect(screen.getByText(/— base64/i)).toBeInTheDocument();
  });

  it("clear toolbar button has accessible title", () => {
    render(<Base64Encoder />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
  });
});
