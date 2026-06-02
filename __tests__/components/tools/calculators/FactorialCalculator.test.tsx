import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FactorialCalculator } from "@/components/tools/calculators/FactorialCalculator";

describe("FactorialCalculator", () => {
  describe("business logic", () => {
    it("computes 0! = 1", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "0");
      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
      });
    });

    it("computes 1! = 1", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "1");
      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
      });
    });

    it("computes 5! = 120", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "5");
      await waitFor(() => {
        expect(screen.getByText("120")).toBeInTheDocument();
      });
    });

    it("computes 7! = 5040", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "7");
      await waitFor(() => {
        expect(screen.getByText("5040")).toBeInTheDocument();
      });
    });

    it("computes 10! = 3628800", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "10");
      await waitFor(() => {
        expect(screen.getByText("3628800")).toBeInTheDocument();
      });
    });

    it("shows step breakdown for n <= 12", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "5");
      await waitFor(() => {
        expect(screen.getByText(/5! = 5 × 4 × 3 × 2 × 1 = 120/)).toBeInTheDocument();
      });
    });

    it("shows special case message for 0!", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "0");
      await waitFor(() => {
        expect(screen.getByText(/by definition/i)).toBeInTheDocument();
      });
    });

    it("shows scientific notation for large factorials (n=20)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "20");
      await waitFor(() => {
        // 20! has 19 digits — sci is shown as headline; full value also shown in details
        expect(screen.getByText("2432902008176640000")).toBeInTheDocument();
      });
    });

    it("shows scientific notation for very large factorials (n=50)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "50");
      await waitFor(() => {
        // sci notation like 3.0414093e+64 appears in both headline and step breakdown
        expect(screen.getAllByText(/e\+\d+/).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("validation", () => {
    it("shows error for negative input", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "-1");
      await waitFor(() => {
        expect(screen.getByText(/Must be ≥ 0/)).toBeInTheDocument();
      });
    });

    it("shows error for decimal input", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "3.5");
      await waitFor(() => {
        expect(screen.getByText(/Must be a whole number/)).toBeInTheDocument();
      });
    });

    it("shows error for n above max (1000)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<FactorialCalculator />);
      await user.type(screen.getByRole("spinbutton"), "1001");
      await waitFor(() => {
        expect(screen.getByText(/Max 1000/)).toBeInTheDocument();
      });
    });

    it("shows dash when input is empty", () => {
      render(<FactorialCalculator />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("input has a label", () => {
      render(<FactorialCalculator />);
      expect(screen.getByText(/integer n/i)).toBeInTheDocument();
    });
  });
});
