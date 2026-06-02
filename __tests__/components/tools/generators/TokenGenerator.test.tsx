import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TokenGenerator } from "@/components/tools/generators/TokenGenerator";
import { clearClipboard } from "@/__tests__/helpers/mocks";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

beforeEach(() => {
  clearClipboard();
});

describe("TokenGenerator", () => {
  describe("initial render", () => {
    it("renders the generate button", () => {
      render(<TokenGenerator />);
      expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
    });

    it("renders token type selection buttons", () => {
      render(<TokenGenerator />);
      // Button accessible names include the description text (label + desc concatenated)
      // e.g. "UUID v48-4-4-4-12 hex format", "Hex0–9, a–f", "Base64A–Z...", "Base64 URLURL-safe...", "AlphanumericA–Z..."
      expect(screen.getByRole("button", { name: /UUID v4/i })).toBeInTheDocument();
      // Find the two Base64-related buttons by checking they exist
      const base64Btns = screen.getAllByRole("button", { name: /Base64/i });
      expect(base64Btns.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByRole("button", { name: /Base64 URL/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Alphanumeric/i })).toBeInTheDocument();
      // Hex button exists
      const hexBtns = screen.getAllByRole("button", { name: /hex/i });
      expect(hexBtns.length).toBeGreaterThanOrEqual(1);
    });

    it("renders byte length and count spinbuttons", () => {
      render(<TokenGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("UUID v4 generation", () => {
    it("generates a valid UUID v4 token", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      // UUID v4 is the default type
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const span = document.querySelector(".border.border-border.divide-y .font-mono.text-sm");
      expect(span).toBeTruthy();
      expect(span!.textContent).toMatch(UUID_RE);
    });

    it("generates multiple UUID v4 tokens when count > 1", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "3");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const spans = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      expect(spans.length).toBe(3);
      Array.from(spans).forEach((s) => {
        expect(s.textContent).toMatch(UUID_RE);
      });
    });

    it("disables the byte length input when UUID v4 is selected", () => {
      render(<TokenGenerator />);
      const bytesInput = screen.getAllByRole("spinbutton")[0];
      expect(bytesInput).toBeDisabled();
    });

    it("shows 'fixed — 16 bytes' note for UUID v4", () => {
      render(<TokenGenerator />);
      expect(screen.getByText(/fixed — 16 bytes/i)).toBeInTheDocument();
    });
  });

  describe("hex token generation", () => {
    it("generates a non-empty hex token", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      // Button name is "Hex0–9, a–f" (label + desc concatenated)
      await user.click(screen.getByRole("button", { name: /^Hex/i }));
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const span = document.querySelector(".border.border-border.divide-y .font-mono.text-sm");
      expect(span).toBeTruthy();
      expect(span!.textContent).toMatch(/^[0-9a-f]+$/i);
    });

    it("generates a hex token with length 2 * bytes", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      await user.click(screen.getByRole("button", { name: /^Hex/i }));
      const bytesInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(bytesInput);
      await user.type(bytesInput, "16");
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const span = document.querySelector(".border.border-border.divide-y .font-mono.text-sm");
      expect(span).toBeTruthy();
      expect(span!.textContent).toHaveLength(32); // 16 bytes = 32 hex chars
    });
  });

  describe("alphanumeric token generation", () => {
    it("generates an alphanumeric token", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      await user.click(screen.getByRole("button", { name: /Alphanumeric/i }));
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const span = document.querySelector(".border.border-border.divide-y .font-mono.text-sm");
      expect(span).toBeTruthy();
      expect(span!.textContent).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe("base64url token generation", () => {
    it("generates a base64url token (no +, /, or = characters)", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      await user.click(screen.getByRole("button", { name: /Base64 URL/i }));
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const span = document.querySelector(".border.border-border.divide-y .font-mono.text-sm");
      expect(span).toBeTruthy();
      expect(span!.textContent).toMatch(/^[A-Za-z0-9\-_]+$/);
    });
  });

  describe("validation", () => {
    it("shows error when bytes is below 8 for non-UUID types", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      await user.click(screen.getByRole("button", { name: /^Hex/i }));
      const bytesInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(bytesInput);
      await user.type(bytesInput, "4");
      expect(screen.getByText("Min 8 bytes")).toBeInTheDocument();
    });

    it("shows error when bytes exceeds 512", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      await user.click(screen.getByRole("button", { name: /^Hex/i }));
      const bytesInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(bytesInput);
      await user.type(bytesInput, "600");
      expect(screen.getByText("Max 512 bytes")).toBeInTheDocument();
    });

    it("shows error when count is below 1", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "0");
      expect(screen.getByText("Min 1")).toBeInTheDocument();
    });

    it("shows error when count exceeds 100", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "101");
      expect(screen.getByText("Max 100")).toBeInTheDocument();
    });

    it("disables generate when count is invalid", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "0");
      expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
    });
  });

  describe("copy functionality", () => {
    it("copies the token to clipboard when copy is clicked", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      // count=1 default
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await user.click(screen.getByRole("button", { name: /^copy$/i }));
      const copied = await navigator.clipboard.readText();
      expect(copied).toMatch(UUID_RE);
    });

    it("shows copy all button when multiple tokens are generated", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "2");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(screen.getByRole("button", { name: /copy all/i })).toBeInTheDocument();
    });

    it("copies all tokens joined by newlines", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "3");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await user.click(screen.getByRole("button", { name: /copy all/i }));
      const copied = await navigator.clipboard.readText();
      expect(copied.split("\n").length).toBe(3);
    });
  });

  describe("regenerate", () => {
    it("generates tokens on every click", async () => {
      const user = userEvent.setup();
      render(<TokenGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(
        document.querySelector(".border.border-border.divide-y .font-mono.text-sm"),
      ).toBeTruthy();
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(
        document.querySelector(".border.border-border.divide-y .font-mono.text-sm"),
      ).toBeTruthy();
    });
  });

  describe("accessibility", () => {
    it("token type section has a label", () => {
      render(<TokenGenerator />);
      expect(screen.getByText(/— token type/i)).toBeInTheDocument();
    });

    it("count input has a label", () => {
      render(<TokenGenerator />);
      expect(screen.getByText(/— count \(1–100\)/i)).toBeInTheDocument();
    });

    it("shows security notice about client-side generation", () => {
      render(<TokenGenerator />);
      expect(screen.getByText(/never sent to a server/i)).toBeInTheDocument();
    });
  });
});
