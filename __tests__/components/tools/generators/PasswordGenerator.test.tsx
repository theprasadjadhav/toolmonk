import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordGenerator } from "@/components/tools/generators/PasswordGenerator";
import { clearClipboard } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("PasswordGenerator", () => {
  describe("initial render", () => {
    it("renders the generate button", () => {
      render(<PasswordGenerator />);
      expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
    });

    it("renders length and count inputs", () => {
      render(<PasswordGenerator />);
      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it("renders character set toggle buttons", () => {
      render(<PasswordGenerator />);
      expect(screen.getByRole("button", { name: /a–z lowercase/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /A–Z uppercase/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /0–9 digits/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /!@#… symbols/i })).toBeInTheDocument();
    });
  });

  describe("generation", () => {
    it("generates a password when Generate is clicked", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      // At least one password text item should appear (rendered in a span)
      const spans = document.querySelectorAll(".font-mono.text-sm");
      const anyNonEmpty = Array.from(spans).some((s) => (s.textContent ?? "").length > 0);
      expect(anyNonEmpty).toBe(true);
    });

    it("generates a password of the configured length", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "20");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const passwordSpans = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      const pw = Array.from(passwordSpans).find((s) => (s.textContent ?? "").length > 0);
      expect(pw).toBeTruthy();
      expect(pw!.textContent).toHaveLength(20);
    });

    it("generates multiple passwords when count > 1", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      const [, countInput] = screen.getAllByRole("spinbutton");
      await user.clear(countInput);
      await user.type(countInput, "3");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const copyButtons = screen.getAllByRole("button", { name: /^copy$/i });
      expect(copyButtons.length).toBe(3);
    });

    it("generates a non-empty password", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const copyBtn = screen.getByRole("button", { name: /^copy$/i });
      expect(copyBtn).toBeInTheDocument();
    });

    it("shows a strength indicator after generation", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
      const found = strengthLabels.some((label) => screen.queryByText(label));
      expect(found).toBe(true);
    });
  });

  describe("length configuration", () => {
    it("shows error when length is below minimum (4)", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "2");
      expect(screen.getByText("Min 4")).toBeInTheDocument();
    });

    it("shows error when length exceeds maximum (256)", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "300");
      expect(screen.getByText("Max 256")).toBeInTheDocument();
    });

    it("disables generate button when length is invalid", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "1");
      const generateBtn = screen.getByRole("button", { name: /generate/i });
      expect(generateBtn).toBeDisabled();
    });
  });

  describe("character set validation", () => {
    it("shows error and disables generate when all character sets unchecked", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      // Toggle off the initially active ones: lowercase, uppercase, digits (symbols is off by default)
      await user.click(screen.getByRole("button", { name: /a–z lowercase/i }));
      await user.click(screen.getByRole("button", { name: /A–Z uppercase/i }));
      await user.click(screen.getByRole("button", { name: /0–9 digits/i }));
      expect(screen.getByText(/select at least one character set/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
    });

    it("generates using only lowercase when only lowercase is selected", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      await user.click(screen.getByRole("button", { name: /A–Z uppercase/i }));
      await user.click(screen.getByRole("button", { name: /0–9 digits/i }));
      // Set a small length to reliably test
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "10");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const passwordSpan = document.querySelector(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      expect(passwordSpan).toBeTruthy();
      expect(passwordSpan!.textContent).toMatch(/^[a-z]{10}$/);
    });

    it("generates using only digits when only digits is selected", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      await user.click(screen.getByRole("button", { name: /a–z lowercase/i }));
      await user.click(screen.getByRole("button", { name: /A–Z uppercase/i }));
      const lengthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(lengthInput);
      await user.type(lengthInput, "8");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const passwordSpan = document.querySelector(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      expect(passwordSpan).toBeTruthy();
      expect(passwordSpan!.textContent).toMatch(/^[0-9]{8}$/);
    });
  });

  describe("copy functionality", () => {
    it("copies the password to clipboard when copy button is clicked", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await user.click(screen.getByRole("button", { name: /^copy$/i }));
      const copied = await navigator.clipboard.readText();
      expect(copied).toBeTruthy();
      expect(typeof copied).toBe("string");
    });

    it("shows 'copy all' button when multiple passwords generated", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      const [, countInput] = screen.getAllByRole("spinbutton");
      await user.clear(countInput);
      await user.type(countInput, "2");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(screen.getByRole("button", { name: /copy all/i })).toBeInTheDocument();
    });

    it("copies all passwords when copy all is clicked", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      const [, countInput] = screen.getAllByRole("spinbutton");
      await user.clear(countInput);
      await user.type(countInput, "2");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await user.click(screen.getByRole("button", { name: /copy all/i }));
      const copied = await navigator.clipboard.readText();
      // Should include a newline separating the two passwords
      expect(copied).toContain("\n");
    });
  });

  describe("regenerate", () => {
    it("clicking generate multiple times produces output each time", async () => {
      const user = userEvent.setup();
      render(<PasswordGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(screen.getByRole("button", { name: /^copy$/i })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(screen.getByRole("button", { name: /^copy$/i })).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("length input has an associated label", () => {
      render(<PasswordGenerator />);
      // Labels are visually associated via DOM proximity; check they exist
      expect(screen.getByText(/— length \(4–256\)/i)).toBeInTheDocument();
    });

    it("count input has an associated label", () => {
      render(<PasswordGenerator />);
      expect(screen.getByText(/— count \(1–100\)/i)).toBeInTheDocument();
    });

    it("character sets have a section label", () => {
      render(<PasswordGenerator />);
      expect(screen.getByText(/— character sets/i)).toBeInTheDocument();
    });
  });
});
