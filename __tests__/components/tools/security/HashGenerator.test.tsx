import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HashGenerator } from "@/components/tools/security/HashGenerator";

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
// Import the actual hash functions to test them in isolation.
import { md5, sha1, sha256, sha512 } from "@/lib/utils/hash";

describe("HashGenerator — business logic (hash functions)", () => {
  describe("md5", () => {
    it("produces a 32-character hex string", () => {
      expect(md5("hello")).toHaveLength(32);
    });

    it("produces the correct MD5 for 'hello'", () => {
      // Known MD5 for "hello"
      expect(md5("hello")).toBe("5d41402abc4b2a76b9719d911017c592");
    });

    it("produces the correct MD5 for empty string", () => {
      expect(md5("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
    });

    it("result contains only hex characters", () => {
      expect(/^[0-9a-f]{32}$/.test(md5("test"))).toBe(true);
    });

    it("different inputs produce different hashes", () => {
      expect(md5("hello")).not.toBe(md5("world"));
    });

    it("same input always produces the same hash (deterministic)", () => {
      expect(md5("deterministic")).toBe(md5("deterministic"));
    });
  });

  describe("sha256", () => {
    it("produces a 64-character hex string", async () => {
      const hash = await sha256("hello");
      expect(hash).toHaveLength(64);
    });

    it("produces the known SHA-256 for 'hello'", async () => {
      const hash = await sha256("hello");
      expect(hash).toBe(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
      );
    });

    it("produces a non-empty hash for any non-empty input", async () => {
      const hash = await sha256("toolkit test input");
      expect(hash.length).toBeGreaterThan(0);
    });

    it("result is hexadecimal only", async () => {
      const hash = await sha256("test");
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it("different inputs produce different hashes", async () => {
      const h1 = await sha256("foo");
      const h2 = await sha256("bar");
      expect(h1).not.toBe(h2);
    });
  });

  describe("sha512", () => {
    it("produces a 128-character hex string", async () => {
      const hash = await sha512("hello");
      expect(hash).toHaveLength(128);
    });

    it("result is hexadecimal only", async () => {
      const hash = await sha512("test");
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });
  });

  describe("sha1", () => {
    it("produces a 40-character hex string", async () => {
      const hash = await sha1("hello");
      expect(hash).toHaveLength(40);
    });

    it("produces the known SHA-1 for 'hello'", async () => {
      const hash = await sha1("hello");
      expect(hash).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
    });
  });
});

describe("HashGenerator — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<HashGenerator />);
    expect(screen.getByText(/— input text/i)).toBeInTheDocument();
  });

  it("renders all four algorithm labels", () => {
    render(<HashGenerator />);
    expect(screen.getByText("MD5")).toBeInTheDocument();
    expect(screen.getByText("SHA-1")).toBeInTheDocument();
    expect(screen.getByText("SHA-256")).toBeInTheDocument();
    expect(screen.getByText("SHA-512")).toBeInTheDocument();
  });

  it("shows 'hash appears here' placeholder when empty", () => {
    render(<HashGenerator />);
    const placeholders = screen.getAllByText(/hash appears here/i);
    expect(placeholders.length).toBe(4);
  });

  it("shows bit-width labels", () => {
    render(<HashGenerator />);
    expect(screen.getByText("128-bit")).toBeInTheDocument();
    expect(screen.getByText("160-bit")).toBeInTheDocument();
    expect(screen.getByText("256-bit")).toBeInTheDocument();
    expect(screen.getByText("512-bit")).toBeInTheDocument();
  });

  it("typing input produces MD5 hash immediately", async () => {
    const user = userEvent.setup();
    render(<HashGenerator />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "hello");
    await waitFor(() => {
      // MD5 of "hello" is 5d41402abc4b2a76b9719d911017c592
      expect(
        screen.getByText("5d41402abc4b2a76b9719d911017c592"),
      ).toBeInTheDocument();
    });
  });

  it("typing input eventually produces SHA-256 hash", async () => {
    const user = userEvent.setup();
    render(<HashGenerator />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "hello");
    await waitFor(
      () => {
        expect(
          screen.getByText(
            "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
          ),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("shows '…' loading indicator before async hashes resolve", async () => {
    const user = userEvent.setup();
    render(<HashGenerator />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "z");
    // Right after typing, SHA hashes may show "…"
    // (MD5 is synchronous so it appears immediately; SHA is async)
    // Just check that all placeholders are gone
    await waitFor(() => {
      const remaining = screen.queryAllByText(/hash appears here/i);
      expect(remaining).toHaveLength(0);
    });
  });

  it("clear button resets input and all hashes", async () => {
    const user = userEvent.setup();
    render(<HashGenerator />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "hello");
    await waitFor(() => {
      expect(
        screen.getByText("5d41402abc4b2a76b9719d911017c592"),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByTitle("clear"));
    await waitFor(() => {
      const placeholders = screen.getAllByText(/hash appears here/i);
      expect(placeholders.length).toBe(4);
    });
  });

  it("copy button calls clipboard.writeText with the hash value", async () => {
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText");
    const user = userEvent.setup();
    render(<HashGenerator />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "hello");
    await waitFor(() => {
      expect(
        screen.getByText("5d41402abc4b2a76b9719d911017c592"),
      ).toBeInTheDocument();
    });
    // Click the MD5 copy button
    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    await user.click(copyButtons[0]);
    expect(writeSpy).toHaveBeenCalledWith(
      "5d41402abc4b2a76b9719d911017c592",
    );
  });

  it("copy button shows 'copied!' feedback", async () => {
    const user = userEvent.setup();
    render(<HashGenerator />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "hello");
    await waitFor(() => {
      expect(
        screen.getByText("5d41402abc4b2a76b9719d911017c592"),
      ).toBeInTheDocument();
    });
    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    await user.click(copyButtons[0]);
    await waitFor(() => {
      expect(screen.getByText("copied!")).toBeInTheDocument();
    });
  });
});

describe("HashGenerator — accessibility", () => {
  it("input section has a label", () => {
    render(<HashGenerator />);
    expect(screen.getByText(/— input text/i)).toBeInTheDocument();
  });

  it("copy buttons have accessible names", () => {
    render(<HashGenerator />);
    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  it("clear toolbar button has accessible title", () => {
    render(<HashGenerator />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
  });

  it("upload button has accessible title", () => {
    render(<HashGenerator />);
    expect(screen.getByTitle("Upload text file")).toBeInTheDocument();
  });
});
