import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScientificCalculator } from "@/components/tools/calculators/ScientificCalculator";

// Mock mathjs to avoid heavy dependencies in the test environment
vi.mock("mathjs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("mathjs")>();
  return {
    ...actual,
    evaluate: vi.fn((expr: string) => {
      // Simple eval for basic arithmetic test cases
      try {
        return eval(expr.replace(/\^/g, "**"));
      } catch {
        throw new Error("Invalid expression");
      }
    }),
  };
});

// Helper: get the expression display span (current input line)
function getExprSpan() {
  return document.querySelector('[class*="text-base"][class*="font-mono"]') as HTMLElement | null;
}

// Helper: get the result display span (large result line)
function getResultSpan() {
  // The result span has font-light and leading-none
  return document.querySelector('[class*="font-light"][class*="tracking-tight"]') as HTMLElement | null;
}

describe("ScientificCalculator", () => {
  describe("basic arithmetic", () => {
    it("renders the calculator with number buttons", () => {
      render(<ScientificCalculator />);
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "=" })).toBeInTheDocument();
    });

    it("clears display when C is pressed", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ScientificCalculator />);
      await user.click(screen.getByRole("button", { name: "5" }));
      // Expression span should show "5"
      await waitFor(() => {
        const exprSpan = getExprSpan();
        expect(exprSpan?.textContent?.trim()).toBe("5");
      });
      await user.click(screen.getByRole("button", { name: "C" }));
      // Expression span should be cleared
      await waitFor(() => {
        const exprSpan = getExprSpan();
        expect(exprSpan?.textContent?.trim()).toBe("");
      });
    });

    it("builds an expression by clicking buttons", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ScientificCalculator />);
      await user.click(screen.getByRole("button", { name: "3" }));
      await user.click(screen.getByRole("button", { name: "+" }));
      await user.click(screen.getByRole("button", { name: "4" }));
      // Expression line should show "3+4"
      await waitFor(() => {
        const exprSpan = getExprSpan();
        expect(exprSpan?.textContent).toMatch(/3\+4/);
      });
    });

    it("evaluates expression when = is pressed", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ScientificCalculator />);
      await user.click(screen.getByRole("button", { name: "2" }));
      await user.click(screen.getByRole("button", { name: "+" }));
      await user.click(screen.getByRole("button", { name: "3" }));
      await user.click(screen.getByRole("button", { name: "=" }));
      await waitFor(() => {
        const resultSpan = getResultSpan();
        expect(resultSpan?.textContent?.trim()).toBe("5");
      });
    });

    it("DEL removes last character", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ScientificCalculator />);
      await user.click(screen.getByRole("button", { name: "1" }));
      await user.click(screen.getByRole("button", { name: "2" }));
      await user.click(screen.getByRole("button", { name: "3" }));
      await user.click(screen.getByRole("button", { name: "DEL" }));
      await waitFor(() => {
        const exprSpan = getExprSpan();
        expect(exprSpan?.textContent?.trim()).toBe("12");
      });
    });
  });

  describe("DEG/RAD toggle", () => {
    it("shows DEG by default", () => {
      render(<ScientificCalculator />);
      expect(screen.getByRole("button", { name: "DEG" })).toBeInTheDocument();
    });

    it("toggles to RAD when DEG button is clicked", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ScientificCalculator />);
      await user.click(screen.getByRole("button", { name: "DEG" }));
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "RAD" })).toBeInTheDocument();
      });
    });
  });

  describe("function buttons", () => {
    it("appends sin( when sin button is clicked", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ScientificCalculator />);
      await user.click(screen.getByRole("button", { name: "sin" }));
      await waitFor(() => {
        const exprSpan = getExprSpan();
        expect(exprSpan?.textContent).toMatch(/sin\(/);
      });
    });

    it("appends sqrt( when √ button is clicked", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ScientificCalculator />);
      await user.click(screen.getByRole("button", { name: "√" }));
      await waitFor(() => {
        const exprSpan = getExprSpan();
        expect(exprSpan?.textContent).toMatch(/√\(/);
      });
    });

    it("appends π when π button is clicked", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ScientificCalculator />);
      await user.click(screen.getByRole("button", { name: "π" }));
      await waitFor(() => {
        const exprSpan = getExprSpan();
        expect(exprSpan?.textContent).toMatch(/π/);
      });
    });
  });

  describe("keyboard input", () => {
    it("responds to number key presses", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ScientificCalculator />);
      // Focus the document (not an input)
      await user.keyboard("7");
      await waitFor(() => {
        const exprSpan = getExprSpan();
        expect(exprSpan?.textContent?.trim()).toBe("7");
      });
    });

    it("evaluates on Enter key", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ScientificCalculator />);
      await user.keyboard("6+4");
      await user.keyboard("{Enter}");
      await waitFor(() => {
        const resultSpan = getResultSpan();
        expect(resultSpan?.textContent?.trim()).toBe("10");
      });
    });
  });

  describe("accessibility", () => {
    it("all keypad buttons are rendered", () => {
      render(<ScientificCalculator />);
      const buttons = screen.getAllByRole("button");
      // Should have 35+ buttons (5 rows × 5 cols = 35 plus DEG/RAD mode)
      expect(buttons.length).toBeGreaterThanOrEqual(35);
    });
  });
});
