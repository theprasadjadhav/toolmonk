import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RandomStringGenerator } from "@/components/tools/generators/RandomStringGenerator";
import { clearClipboard } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("RandomStringGenerator", () => {
  describe("initial render", () => {
    it("renders the generate button", () => {
      render(<RandomStringGenerator />);
      expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
    });

    it("renders length and count number inputs", () => {
      render(<RandomStringGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThanOrEqual(2);
    });

    it("renders charset toggle buttons", () => {
      render(<RandomStringGenerator />);
      expect(screen.getByRole("button", { name: /a–z lowercase/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /A–Z uppercase/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /0–9 digits/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /!@#… symbols/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /0–9, a–f hex/i })).toBeInTheDocument();
    });

    it("renders a custom characters text input", () => {
      render(<RandomStringGenerator />);
      expect(screen.getByPlaceholderText(/e\.g\. ABC123/i)).toBeInTheDocument();
    });
  });

  describe("generation", () => {
    it("generates strings after clicking Generate", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      // Results appear in the list
      const copyBtns = screen.getAllByRole("button", { name: /^copy$/i });
      expect(copyBtns.length).toBeGreaterThan(0);
    });

    it("generates strings of the configured length", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "10");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const resultSpans = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      const first = Array.from(resultSpans).find((s) => (s.textContent ?? "").trim().length > 0);
      expect(first).toBeTruthy();
      expect(first!.textContent!.trim()).toHaveLength(10);
    });

    it("generates the configured count of strings", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "4");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const copyBtns = screen.getAllByRole("button", { name: /^copy$/i });
      expect(copyBtns.length).toBe(4);
    });

    it("generates hex-only strings when only hex charset is enabled", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      // Disable defaults (lowercase, digits are enabled by default)
      await user.click(screen.getByRole("button", { name: /a–z lowercase/i }));
      await user.click(screen.getByRole("button", { name: /0–9 digits/i }));
      // Enable hex
      await user.click(screen.getByRole("button", { name: /0–9, a–f hex/i }));
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "8");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const resultSpans = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      const first = Array.from(resultSpans).find((s) => (s.textContent ?? "").trim().length > 0);
      expect(first).toBeTruthy();
      expect(first!.textContent!.trim()).toMatch(/^[0-9a-f]{8}$/);
    });

    it("uses custom characters when provided", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      // Disable all default charsets
      await user.click(screen.getByRole("button", { name: /a–z lowercase/i }));
      await user.click(screen.getByRole("button", { name: /0–9 digits/i }));
      // Add custom chars
      const customInput = screen.getByPlaceholderText(/e\.g\. ABC123/i);
      await user.clear(customInput);
      await user.type(customInput, "XYZ");
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "6");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const resultSpans = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      const first = Array.from(resultSpans).find((s) => (s.textContent ?? "").trim().length > 0);
      expect(first).toBeTruthy();
      expect(first!.textContent!.trim()).toMatch(/^[XYZ]{6}$/);
    });
  });

  describe("validation", () => {
    it("shows error when length is below 1", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "0");
      expect(screen.getByText("Min 1")).toBeInTheDocument();
    });

    it("shows error when length exceeds 512", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "600");
      expect(screen.getByText("Max 512")).toBeInTheDocument();
    });

    it("shows error when count exceeds 100", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "101");
      expect(screen.getByText("Max 100")).toBeInTheDocument();
    });

    it("shows error and disables generate when no charset is selected", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      // Disable all active defaults
      await user.click(screen.getByRole("button", { name: /a–z lowercase/i }));
      await user.click(screen.getByRole("button", { name: /0–9 digits/i }));
      expect(
        screen.getByText(/select at least one character set or enter custom characters/i),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
    });

    it("allows generation when charset is empty but custom chars are provided", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      await user.click(screen.getByRole("button", { name: /a–z lowercase/i }));
      await user.click(screen.getByRole("button", { name: /0–9 digits/i }));
      const customInput = screen.getByPlaceholderText(/e\.g\. ABC123/i);
      await user.type(customInput, "AB");
      expect(screen.getByRole("button", { name: /generate/i })).not.toBeDisabled();
    });
  });

  describe("copy functionality", () => {
    it("copies a single string to clipboard", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await user.click(screen.getByRole("button", { name: /^copy$/i }));
      const copied = await navigator.clipboard.readText();
      expect(typeof copied).toBe("string");
      expect(copied.length).toBeGreaterThan(0);
    });

    it("shows copy all button when multiple strings are generated", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(countInput);
      await user.type(countInput, "3");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(screen.getByRole("button", { name: /copy all/i })).toBeInTheDocument();
    });

    it("copies all strings joined by newlines when copy all is clicked", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
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
    it("produces results on multiple clicks", async () => {
      const user = userEvent.setup();
      render(<RandomStringGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      let btns = screen.getAllByRole("button", { name: /^copy$/i });
      expect(btns.length).toBeGreaterThan(0);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      btns = screen.getAllByRole("button", { name: /^copy$/i });
      expect(btns.length).toBeGreaterThan(0);
    });
  });

  describe("accessibility", () => {
    it("length input has a label", () => {
      render(<RandomStringGenerator />);
      expect(screen.getByText(/— length \(1–512\)/i)).toBeInTheDocument();
    });

    it("count input has a label", () => {
      render(<RandomStringGenerator />);
      expect(screen.getByText(/— count \(1–100\)/i)).toBeInTheDocument();
    });

    it("character sets section has a label", () => {
      render(<RandomStringGenerator />);
      expect(screen.getByText(/— character sets/i)).toBeInTheDocument();
    });
  });
});
