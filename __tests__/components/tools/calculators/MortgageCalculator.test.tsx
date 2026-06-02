import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MortgageCalculator } from "@/components/tools/calculators/MortgageCalculator";

describe("MortgageCalculator", () => {
  describe("business logic", () => {
    it("calculates monthly payment for a 400k home at 6.5% / 30yr", async () => {
      // Loan = 400000*80% = 320000, r=6.5%, 30yr → ~2023
      const user = userEvent.setup({ delay: null });
      render(<MortgageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      // home price
      await user.type(inputs[0], "400000");
      // down payment % already defaulted to 20
      // rate
      await user.type(inputs[2], "6.5");
      // term — clear default "30" then re-type
      const termInput = inputs[3];
      await user.clear(termInput);
      await user.type(termInput, "30");
      await waitFor(() => {
        // Monthly payment around 2023
        expect(screen.getByText(/2,0\d\d/)).toBeInTheDocument();
      });
    });

    it("shows loan amount info after price + down payment entered", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MortgageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "200000");
      await user.type(inputs[2], "5");
      await user.type(inputs[3], "15");
      await waitFor(() => {
        // "Loan amount" text appears in result row label and in the inline info paragraph
        const matches = screen.getAllByText(/Loan amount/i);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows amortization schedule after valid input", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MortgageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "300000");
      await user.type(inputs[2], "5");
      const termInput = inputs[3];
      await user.clear(termInput);
      await user.type(termInput, "10");
      await waitFor(() => {
        expect(screen.getByText(/amortization schedule/i)).toBeInTheDocument();
      });
    });

    it("show all 5 years when <= 5 year term (no expand button)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MortgageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "100000");
      await user.type(inputs[2], "5");
      const termInput = inputs[3];
      await user.clear(termInput);
      await user.type(termInput, "5");
      await waitFor(() => {
        expect(screen.queryByText(/Show all/)).not.toBeInTheDocument();
      });
    });

    it("shows 'Show all X years' button when term > 5 years", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MortgageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "300000");
      await user.type(inputs[2], "5");
      const termInput = inputs[3];
      await user.clear(termInput);
      await user.type(termInput, "30");
      await waitFor(() => {
        expect(screen.getByText(/Show all 30 years/)).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error for home price <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MortgageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for rate > 100%", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MortgageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[2], "150");
      await waitFor(() => {
        expect(screen.getByText("Max 100%")).toBeInTheDocument();
      });
    });

    it("shows error for down payment > 100%", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MortgageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.clear(inputs[1]);
      await user.type(inputs[1], "120");
      await waitFor(() => {
        expect(screen.getByText("Max 100%")).toBeInTheDocument();
      });
    });

    it("shows dash when no inputs provided", () => {
      render(<MortgageCalculator />);
      // Multiple dashes appear (monthly payment heading + result rows)
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("accessibility", () => {
    it("all inputs have labels", () => {
      render(<MortgageCalculator />);
      expect(screen.getByText(/home price/i)).toBeInTheDocument();
      expect(screen.getByText(/down payment/i)).toBeInTheDocument();
      expect(screen.getByText(/annual interest rate/i)).toBeInTheDocument();
      expect(screen.getByText(/loan term/i)).toBeInTheDocument();
    });
  });
});
