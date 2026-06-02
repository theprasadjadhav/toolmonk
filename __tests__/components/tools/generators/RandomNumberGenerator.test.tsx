import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RandomNumberGenerator } from "@/components/tools/generators/RandomNumberGenerator";
import { clearClipboard } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("RandomNumberGenerator", () => {
  describe("initial render", () => {
    it("renders the generate button", () => {
      render(<RandomNumberGenerator />);
      expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
    });

    it("renders min, max, count, and decimal inputs", () => {
      render(<RandomNumberGenerator />);
      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThanOrEqual(4);
    });

    it("renders sort and unique toggle buttons", () => {
      render(<RandomNumberGenerator />);
      expect(screen.getByRole("button", { name: /unique numbers/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sort: off/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sort: asc/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sort: desc/i })).toBeInTheDocument();
    });
  });

  describe("generation", () => {
    it("generates a number within the min/max range", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      // Defaults: min=1, max=100, count=1
      await user.click(screen.getByRole("button", { name: /generate/i }));
      // The single result is displayed as a large text
      const resultEl = document.querySelector(".font-mono.text-4xl");
      expect(resultEl).toBeTruthy();
      const value = parseFloat(resultEl!.textContent!);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(100);
    });

    it("generates the configured count of numbers", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      // count is the third spinbutton (min, max, count, decimals)
      const countInput = spinbuttons[2];
      await user.clear(countInput);
      await user.type(countInput, "5");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      // Multiple results are shown as list items
      const rows = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      expect(rows.length).toBe(5);
    });

    it("generates numbers respecting decimal places", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      // decimals is the 4th spinbutton
      const decInput = spinbuttons[3];
      await user.clear(decInput);
      await user.type(decInput, "2");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const resultEl = document.querySelector(".font-mono.text-4xl");
      expect(resultEl).toBeTruthy();
      // Should match a decimal number pattern
      expect(resultEl!.textContent).toMatch(/^\d+\.\d{2}$/);
    });

    it("generates whole numbers with 0 decimals", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const resultEl = document.querySelector(".font-mono.text-4xl");
      expect(resultEl).toBeTruthy();
      expect(resultEl!.textContent).toMatch(/^\d+$/);
    });
  });

  describe("validation", () => {
    it("shows error when max is not greater than min", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      const [minInput, maxInput] = screen.getAllByRole("spinbutton");
      await user.clear(minInput);
      await user.type(minInput, "50");
      await user.clear(maxInput);
      await user.type(maxInput, "50");
      expect(screen.getByText("Max must be > min")).toBeInTheDocument();
    });

    it("disables generate button when max <= min", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      const [minInput, maxInput] = screen.getAllByRole("spinbutton");
      await user.clear(minInput);
      await user.type(minInput, "100");
      await user.clear(maxInput);
      await user.type(maxInput, "10");
      expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
    });

    it("shows error when count is below minimum (1)", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[2];
      await user.clear(countInput);
      await user.type(countInput, "0");
      expect(screen.getByText("Min 1")).toBeInTheDocument();
    });

    it("shows error when count exceeds 1000", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[2];
      await user.clear(countInput);
      await user.type(countInput, "1001");
      expect(screen.getByText("Max 1000")).toBeInTheDocument();
    });

    it("shows error when decimal places exceed 10", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      const decInput = screen.getAllByRole("spinbutton")[3];
      await user.clear(decInput);
      await user.type(decInput, "11");
      expect(screen.getByText("Max 10")).toBeInTheDocument();
    });

    it("shows uniqueness error when count exceeds integer pool size", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      // Toggle unique on
      await user.click(screen.getByRole("button", { name: /unique numbers/i }));
      const [minInput, maxInput] = screen.getAllByRole("spinbutton");
      await user.clear(minInput);
      await user.type(minInput, "1");
      await user.clear(maxInput);
      await user.type(maxInput, "3");
      // count = 5, but pool is only 1,2,3 = 3 integers
      const countInput = screen.getAllByRole("spinbutton")[2];
      await user.clear(countInput);
      await user.type(countInput, "5");
      expect(screen.getByText(/cannot generate 5 unique integers/i)).toBeInTheDocument();
    });
  });

  describe("sort order", () => {
    it("sort ascending orders results from smallest to largest", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      await user.click(screen.getByRole("button", { name: /sort: asc/i }));
      const countInput = screen.getAllByRole("spinbutton")[2];
      await user.clear(countInput);
      await user.type(countInput, "10");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const rows = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      const nums = Array.from(rows).map((r) => parseFloat(r.textContent!));
      for (let i = 1; i < nums.length; i++) {
        expect(nums[i]).toBeGreaterThanOrEqual(nums[i - 1]);
      }
    });

    it("sort descending orders results from largest to smallest", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      await user.click(screen.getByRole("button", { name: /sort: desc/i }));
      const countInput = screen.getAllByRole("spinbutton")[2];
      await user.clear(countInput);
      await user.type(countInput, "10");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const rows = document.querySelectorAll(
        ".border.border-border.divide-y .font-mono.text-sm",
      );
      const nums = Array.from(rows).map((r) => parseFloat(r.textContent!));
      for (let i = 1; i < nums.length; i++) {
        expect(nums[i]).toBeLessThanOrEqual(nums[i - 1]);
      }
    });
  });

  describe("copy functionality", () => {
    it("copies the result to clipboard", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await user.click(screen.getByRole("button", { name: /^copy$/i }));
      const copied = await navigator.clipboard.readText();
      expect(copied.length).toBeGreaterThan(0);
    });

    it("copies all results when multiple are generated", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[2];
      await user.clear(countInput);
      await user.type(countInput, "3");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await user.click(screen.getByRole("button", { name: /copy all/i }));
      const copied = await navigator.clipboard.readText();
      // 3 numbers separated by newlines
      expect(copied.split("\n").length).toBe(3);
    });
  });

  describe("regenerate", () => {
    it("clicking generate multiple times always produces a result", async () => {
      const user = userEvent.setup();
      render(<RandomNumberGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(document.querySelector(".font-mono.text-4xl")).toBeTruthy();
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(document.querySelector(".font-mono.text-4xl")).toBeTruthy();
    });
  });

  describe("accessibility", () => {
    it("minimum input has a label", () => {
      render(<RandomNumberGenerator />);
      expect(screen.getByText(/— minimum/i)).toBeInTheDocument();
    });

    it("maximum input has a label", () => {
      render(<RandomNumberGenerator />);
      expect(screen.getByText(/— maximum/i)).toBeInTheDocument();
    });

    it("count input has a label", () => {
      render(<RandomNumberGenerator />);
      expect(screen.getByText(/— count \(1–1000\)/i)).toBeInTheDocument();
    });
  });
});
