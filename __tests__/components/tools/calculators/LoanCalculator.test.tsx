import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoanCalculator } from "@/components/tools/calculators/LoanCalculator";

describe("LoanCalculator", () => {
  describe("business logic", () => {
    it("calculates monthly payment for standard loan", async () => {
      // P=10000, r=7.5%, 5 years → ~200.38
      const user = userEvent.setup({ delay: null });
      render(<LoanCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "10000");
      await user.type(inputs[1], "7.5");
      await user.type(inputs[2], "5");
      await waitFor(() => {
        // Monthly payment should be approx 200.38
        expect(screen.getByText(/200\.\d\d/)).toBeInTheDocument();
      });
    });

    it("calculates zero-interest loan as P/months", async () => {
      // P=12000, r=0%, 12 months → 1000/month
      const user = userEvent.setup({ delay: null });
      render(<LoanCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "12000");
      await user.type(inputs[1], "0");
      await user.type(inputs[2], "12");
      await user.click(screen.getByRole("button", { name: "months" }));
      await waitFor(() => {
        expect(screen.getByText("1,000.00")).toBeInTheDocument();
      });
    });

    it("shows total payment and total interest", async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoanCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "10000");
      await user.type(inputs[1], "7.5");
      await user.type(inputs[2], "5");
      await waitFor(() => {
        expect(screen.getByText("Total payment")).toBeInTheDocument();
        expect(screen.getByText("Total interest")).toBeInTheDocument();
      });
    });

    it("shows interest share percentage", async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoanCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "10000");
      await user.type(inputs[1], "7.5");
      await user.type(inputs[2], "5");
      await waitFor(() => {
        expect(screen.getByText("Interest share")).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error for principal <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoanCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "-500");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for rate > 100%", async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoanCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[1], "200");
      await waitFor(() => {
        expect(screen.getByText("Max 100%")).toBeInTheDocument();
      });
    });

    it("shows error for term below minimum", async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoanCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "10000");
      await user.type(inputs[1], "5");
      await user.type(inputs[2], "0");
      await waitFor(() => {
        expect(screen.getByText("Min 1 year")).toBeInTheDocument();
      });
    });

    it("shows error for term above 50 years", async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoanCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[2], "51");
      await waitFor(() => {
        expect(screen.getByText("Max 50 years")).toBeInTheDocument();
      });
    });

    it("shows dash when empty", () => {
      render(<LoanCalculator />);
      // Multiple dashes appear (monthly payment heading + row values)
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("term unit toggle", () => {
    it("switches between years and months", async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoanCalculator />);
      await user.click(screen.getByRole("button", { name: "months" }));
      expect(screen.getByText(/1–600 months/)).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("all inputs have labels", () => {
      render(<LoanCalculator />);
      expect(screen.getByText(/loan amount/i)).toBeInTheDocument();
      expect(screen.getByText(/annual interest rate/i)).toBeInTheDocument();
      expect(screen.getByText(/loan term/i)).toBeInTheDocument();
    });

    it("formula note is visible", () => {
      render(<LoanCalculator />);
      expect(screen.getByText(/M = P × r/)).toBeInTheDocument();
    });
  });
});
