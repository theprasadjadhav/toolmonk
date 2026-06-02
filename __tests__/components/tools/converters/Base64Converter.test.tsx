import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Base64Converter } from "@/components/tools/converters/Base64Converter";

// Mock file utilities — not under test
vi.mock("@/lib/utils/file", () => ({
  uploadText: vi.fn().mockResolvedValue(null),
  downloadText: vi.fn(),
}));

describe("Base64Converter", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Rendering ────────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders two textareas", () => {
      render(<Base64Converter />);
      const areas = screen.getAllByRole("textbox");
      expect(areas.length).toBeGreaterThanOrEqual(2);
    });

    it("shows encode placeholder by default", () => {
      render(<Base64Converter />);
      expect(
        screen.getByPlaceholderText("Type or paste text to encode…")
      ).toBeInTheDocument();
    });

    it("shows base64 output placeholder by default", () => {
      render(<Base64Converter />);
      expect(
        screen.getByPlaceholderText("Base64 output appears here…")
      ).toBeInTheDocument();
    });

    it("renders encode and decode toggle buttons", () => {
      render(<Base64Converter />);
      expect(screen.getByRole("button", { name: /encode/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /decode/i })).toBeInTheDocument();
    });

    it("renders clear button", () => {
      render(<Base64Converter />);
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });
  });

  // ── Encode happy path ─────────────────────────────────────────────────────────

  describe("encode mode", () => {
    it('encodes "hello" to "aGVsbG8="', async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      const input = screen.getByPlaceholderText("Type or paste text to encode…");
      await user.type(input, "hello");
      const output = screen.getByPlaceholderText("Base64 output appears here…");
      expect(output).toHaveValue("aGVsbG8=");
    });

    it('encodes "Man" to "TWFu"', async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      const input = screen.getByPlaceholderText("Type or paste text to encode…");
      await user.type(input, "Man");
      const output = screen.getByPlaceholderText("Base64 output appears here…");
      expect(output).toHaveValue("TWFu");
    });

    it("encodes empty string to nothing", async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      const input = screen.getByPlaceholderText("Type or paste text to encode…");
      await user.type(input, "a");
      await user.clear(input);
      const output = screen.getByPlaceholderText("Base64 output appears here…");
      expect(output).toHaveValue("");
    });

    it("shows char count badge when output is non-empty", async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      const input = screen.getByPlaceholderText("Type or paste text to encode…");
      await user.type(input, "hi");
      expect(screen.getByText(/chars/i)).toBeInTheDocument();
    });

    it("handles Unicode characters", async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      const input = screen.getByPlaceholderText("Type or paste text to encode…");
      await user.type(input, "こんにちは");
      const output = screen.getByPlaceholderText("Base64 output appears here…");
      // Output must be non-empty and valid base64 characters
      expect(output).not.toHaveValue("");
      expect((output as HTMLTextAreaElement).value).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });
  });

  // ── Decode happy path ─────────────────────────────────────────────────────────

  describe("decode mode", () => {
    it('decodes "aGVsbG8=" to "hello"', async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      // Switch to decode
      await user.click(screen.getByRole("button", { name: /decode/i }));
      const input = screen.getByPlaceholderText("Paste Base64 string to decode…");
      await user.type(input, "aGVsbG8=");
      const output = screen.getByPlaceholderText("Decoded text appears here…");
      expect(output).toHaveValue("hello");
    });

    it("shows error for invalid Base64 input", async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      await user.click(screen.getByRole("button", { name: /decode/i }));
      const input = screen.getByPlaceholderText("Paste Base64 string to decode…");
      await user.type(input, "!!!not-valid-base64!!!");
      expect(
        screen.getByText(/Invalid Base64/i)
      ).toBeInTheDocument();
    });

    it("shows decode placeholders after switching mode", async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      await user.click(screen.getByRole("button", { name: /decode/i }));
      expect(
        screen.getByPlaceholderText("Paste Base64 string to decode…")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Decoded text appears here…")
      ).toBeInTheDocument();
    });
  });

  // ── Mode switching ─────────────────────────────────────────────────────────────

  describe("mode switching", () => {
    it("swaps output into input when switching modes", async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      const input = screen.getByPlaceholderText("Type or paste text to encode…");
      await user.type(input, "hello");
      // Switch to decode — the encoded value should move to input
      await user.click(screen.getByRole("button", { name: /decode/i }));
      const newInput = screen.getByPlaceholderText("Paste Base64 string to decode…");
      expect((newInput as HTMLTextAreaElement).value).toBe("aGVsbG8=");
    });
  });

  // ── Clear ─────────────────────────────────────────────────────────────────────

  describe("clear button", () => {
    it("clears input and output", async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      const input = screen.getByPlaceholderText("Type or paste text to encode…");
      await user.type(input, "hello");
      await user.click(screen.getByRole("button", { name: /clear/i }));
      expect(input).toHaveValue("");
      expect(
        screen.getByPlaceholderText("Base64 output appears here…")
      ).toHaveValue("");
    });

    it("hides char count after clearing", async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      const input = screen.getByPlaceholderText("Type or paste text to encode…");
      await user.type(input, "hello");
      await user.click(screen.getByRole("button", { name: /clear/i }));
      expect(screen.queryByText(/chars/i)).not.toBeInTheDocument();
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles a string of only spaces (whitespace input produces empty output)", async () => {
      const user = userEvent.setup();
      render(<Base64Converter />);
      const input = screen.getByPlaceholderText("Type or paste text to encode…");
      // Whitespace-only: run() guard trims first, so output stays empty
      await user.type(input, "   ");
      const output = screen.getByPlaceholderText("Base64 output appears here…");
      expect(output).toHaveValue("");
    });

    it("encodes a long string without error", () => {
      render(<Base64Converter />);
      const input = screen.getByPlaceholderText("Type or paste text to encode…");
      const long = "a".repeat(500);
      fireEvent.change(input, { target: { value: long } });
      const output = screen.getByPlaceholderText("Base64 output appears here…");
      expect((output as HTMLTextAreaElement).value.length).toBeGreaterThan(0);
      expect(screen.queryByText(/Invalid/i)).not.toBeInTheDocument();
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("encode and decode buttons have accessible names", () => {
      render(<Base64Converter />);
      expect(screen.getByRole("button", { name: /encode/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /decode/i })).toBeInTheDocument();
    });

    it("clear button has accessible name", () => {
      render(<Base64Converter />);
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });
  });
});
