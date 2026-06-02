import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FractionCalculator } from "@/components/tools/calculators/FractionCalculator";

describe("FractionCalculator", () => {
  describe("business logic", () => {
    it("adds 1/2 + 1/3 = 5/6", async () => {
      const user = userEvent.setup();
      render(<FractionCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "2");
      await user.type(inputs[2], "1");
      await user.type(inputs[3], "3");
      await waitFor(() => {
        // result numerator 5, denominator 6
        const resultBoxes = screen.getAllByText("5");
        expect(resultBoxes.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("subtracts 3/4 − 1/4 = 1/2", async () => {
      const user = userEvent.setup();
      render(<FractionCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "3");
      await user.type(inputs[1], "4");
      await user.click(screen.getByRole("button", { name: "−" }));
      await user.type(inputs[2], "1");
      await user.type(inputs[3], "4");
      await waitFor(() => {
        expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("multiplies 2/3 × 3/4 = 1/2", async () => {
      const user = userEvent.setup();
      render(<FractionCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "2");
      await user.type(inputs[1], "3");
      await user.click(screen.getByRole("button", { name: "×" }));
      await user.type(inputs[2], "3");
      await user.type(inputs[3], "4");
      await waitFor(() => {
        // result is 1/2
        expect(screen.getByText("0.5")).toBeInTheDocument();
      });
    });

    it("divides 1/2 ÷ 1/4 = 2", async () => {
      const user = userEvent.setup();
      render(<FractionCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "2");
      await user.click(screen.getByRole("button", { name: "÷" }));
      await user.type(inputs[2], "1");
      await user.type(inputs[3], "4");
      await waitFor(() => {
        // 1/2 ÷ 1/4 = 2 (whole number)
        expect(screen.getByText("200%")).toBeInTheDocument();
      });
    });

    it("shows decimal format for result", async () => {
      const user = userEvent.setup();
      render(<FractionCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "4");
      await user.type(inputs[2], "1");
      await user.type(inputs[3], "4");
      await waitFor(() => {
        expect(screen.getByText("Decimal")).toBeInTheDocument();
        expect(screen.getByText("0.5")).toBeInTheDocument();
      });
    });

    it("shows percent format for result", async () => {
      const user = userEvent.setup();
      render(<FractionCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "4");
      await user.type(inputs[2], "1");
      await user.type(inputs[3], "4");
      await waitFor(() => {
        expect(screen.getByText("Percent")).toBeInTheDocument();
      });
    });

    it("shows step-by-step breakdown", async () => {
      const user = userEvent.setup();
      render(<FractionCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "2");
      await user.type(inputs[2], "1");
      await user.type(inputs[3], "3");
      await waitFor(() => {
        expect(screen.getByText(/steps/i)).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error when denominator 1 is zero", async () => {
      const user = userEvent.setup();
      render(<FractionCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "0");
      await waitFor(() => {
        expect(screen.getByText("cannot be 0")).toBeInTheDocument();
      });
    });

    it("shows error when denominator 2 is zero", async () => {
      const user = userEvent.setup();
      render(<FractionCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "2");
      await user.type(inputs[2], "1");
      await user.type(inputs[3], "0");
      await waitFor(() => {
        expect(screen.getByText("cannot be 0")).toBeInTheDocument();
      });
    });

    it("shows division by zero error when dividing by numerator 0", async () => {
      const user = userEvent.setup();
      render(<FractionCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "2");
      await user.click(screen.getByRole("button", { name: "÷" }));
      await user.type(inputs[2], "0");
      await user.type(inputs[3], "4");
      await waitFor(() => {
        expect(screen.getByText("division by zero")).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("has operation buttons with accessible names", () => {
      render(<FractionCalculator />);
      expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "−" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "×" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "÷" })).toBeInTheDocument();
    });
  });
});
