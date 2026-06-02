import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RetirementCalculator } from "@/components/tools/calculators/RetirementCalculator";

describe("RetirementCalculator", () => {
  describe("component rendering", () => {
    it("renders all input fields", () => {
      render(<RetirementCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThanOrEqual(5);
    });

    it("shows dash when no data entered", () => {
      render(<RetirementCalculator />);
      // Multiple dashes appear in the component - verify at least one exists
      expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
    });

    it("shows pre-filled default values for inflation and return rate", () => {
      render(<RetirementCalculator />);
      // Default inflation = 6, default return = 10
      expect(screen.getByDisplayValue("6")).toBeInTheDocument();
      expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    });
  });

  describe("happy path", () => {
    it("calculates retirement corpus for a basic profile", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RetirementCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      // current age=30, retire=60, monthly expenses=3000
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "60");
      await user.type(inputs[2], "3000");
      // inflation and return are pre-filled with 6% and 10%
      await waitFor(() => {
        // Should show a large corpus number (the primary result heading is a large formatted number)
        const results = screen.getAllByText(/\d{1,3}(,\d{3})+/);
        expect(results.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows years to retirement", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RetirementCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "60");
      await user.type(inputs[2], "3000");
      await waitFor(() => {
        expect(screen.getByText("Years to Retirement")).toBeInTheDocument();
        expect(screen.getByText("30 years")).toBeInTheDocument();
      });
    });

    it("shows monthly expenses at retirement", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RetirementCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "60");
      await user.type(inputs[2], "3000");
      await waitFor(() => {
        expect(screen.getByText("Monthly Expenses at Retirement")).toBeInTheDocument();
      });
    });

    it("shows monthly savings needed", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RetirementCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "60");
      await user.type(inputs[2], "3000");
      await waitFor(() => {
        expect(screen.getByText("Monthly Savings Needed Now")).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error for current age below 1", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RetirementCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await waitFor(() => {
        expect(screen.getByText("Min 1")).toBeInTheDocument();
      });
    });

    it("shows error for current age above 99", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RetirementCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "100");
      await waitFor(() => {
        expect(screen.getByText("Max 99")).toBeInTheDocument();
      });
    });

    it("shows error when retirement age <= current age", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RetirementCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "40");
      await user.type(inputs[1], "35");
      await waitFor(() => {
        expect(screen.getByText(/Must be greater than current age/)).toBeInTheDocument();
      });
    });

    it("shows error for monthly expenses <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RetirementCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[2], "-100");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for inflation rate > 30%", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RetirementCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      const inflationInput = inputs[3];
      await user.clear(inflationInput);
      await user.type(inflationInput, "35");
      await waitFor(() => {
        expect(screen.getByText("Max 30%")).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("all inputs have labels", () => {
      render(<RetirementCalculator />);
      expect(screen.getByText(/current age/i)).toBeInTheDocument();
      expect(screen.getByText(/retirement age/i)).toBeInTheDocument();
      // Use getAllBy since "monthly expenses" appears in both label and row label
      expect(screen.getAllByText(/monthly expenses/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/inflation rate/i)).toBeInTheDocument();
      expect(screen.getByText(/return on investment/i)).toBeInTheDocument();
    });
  });
});
