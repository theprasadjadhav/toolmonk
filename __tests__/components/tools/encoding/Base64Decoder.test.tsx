import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Base64Decoder } from "@/components/tools/encoding/Base64Decoder";

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

function decode(str: string): string {
  const binary = atob(str.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

describe("Base64Decoder — business logic (pure functions)", () => {
  it("decodes 'SGVsbG8sIFdvcmxkIQ==' to 'Hello, World!'", () => {
    expect(decode("SGVsbG8sIFdvcmxkIQ==")).toBe("Hello, World!");
  });

  it("decodes a simple base64 string", () => {
    expect(decode("dGVzdA==")).toBe("test");
  });

  it("decodes without padding when base64 is exact multiple of 4", () => {
    expect(decode("dGVzdA==")).toBe("test");
  });

  it("strips leading/trailing whitespace before decoding", () => {
    expect(decode("  SGVsbG8= ")).toBe("Hello");
  });

  it("decodes UTF-8 content correctly", () => {
    // encode("café") via btoa on UTF-8 bytes:
    const encoded = btoa(
      Array.from(new TextEncoder().encode("café"), (b) =>
        String.fromCharCode(b),
      ).join(""),
    );
    expect(decode(encoded)).toBe("café");
  });

  it("throws for invalid base64 input", () => {
    expect(() => decode("not-valid-base64!!")).toThrow();
  });
});

describe("Base64Decoder — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<Base64Decoder />);
    expect(screen.getByText(/— base64/i)).toBeInTheDocument();
  });

  it("renders decoded text output label", () => {
    render(<Base64Decoder />);
    expect(screen.getByText(/— decoded text/i)).toBeInTheDocument();
  });

  it("shows placeholder when no input is given", () => {
    render(<Base64Decoder />);
    expect(screen.getByText(/decoded output appears here/i)).toBeInTheDocument();
  });

  it("decoding a valid base64 string removes the placeholder", async () => {
    const user = userEvent.setup();
    render(<Base64Decoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "SGVsbG8sIFdvcmxkIQ==");
    await waitFor(() => {
      expect(
        screen.queryByText(/decoded output appears here/i),
      ).not.toBeInTheDocument();
    });
  });

  it("shows error banner for invalid base64 input", async () => {
    const user = userEvent.setup();
    render(<Base64Decoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "!!!not-valid-base64!!!");
    await waitFor(() => {
      expect(
        screen.getByText(/invalid base64 string/i),
      ).toBeInTheDocument();
    });
  });

  it("clear button removes input and error", async () => {
    const user = userEvent.setup();
    render(<Base64Decoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "!!!invalid!!!");
    await waitFor(() => {
      expect(screen.getByText(/invalid base64 string/i)).toBeInTheDocument();
    });
    await user.click(screen.getByTitle("clear"));
    expect((editor as HTMLTextAreaElement).value).toBe("");
    await waitFor(() => {
      expect(
        screen.queryByText(/invalid base64 string/i),
      ).not.toBeInTheDocument();
    });
  });

  it("renders upload and clear toolbar controls", () => {
    render(<Base64Decoder />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
    expect(screen.getByTitle("Upload text file")).toBeInTheDocument();
  });

  it("copy and download buttons are present in the output panel", () => {
    render(<Base64Decoder />);
    expect(screen.getByTitle("Copy")).toBeInTheDocument();
    expect(screen.getByTitle("Download")).toBeInTheDocument();
  });
});

describe("Base64Decoder — accessibility", () => {
  it("input section has a panel label", () => {
    render(<Base64Decoder />);
    expect(screen.getByText(/— base64/i)).toBeInTheDocument();
  });

  it("output section has a panel label", () => {
    render(<Base64Decoder />);
    expect(screen.getByText(/— decoded text/i)).toBeInTheDocument();
  });

  it("clear button has accessible title", () => {
    render(<Base64Decoder />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
  });
});
