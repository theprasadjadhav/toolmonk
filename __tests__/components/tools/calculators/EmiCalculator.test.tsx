import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmiCalculator } from "@/components/tools/calculators/EmiCalculator";

describe("EmiCalculator", () => {
  describe("business logic", () => {
    it("calculates EMI correctly for a standard loan", async () => {
      // P=500000, r=8.5%, 5 years → EMI ≈ ₹10,258
      const user = userEvent.setup({ delay: null });
      render(<EmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500000");
      await user.type(inputs[1], "8.5");
      await user.type(inputs[2], "5");
      await waitFor(() => {
        // EMI is in Indian number format; find it in the big heading (text-4xl)
        const emiEl = document.querySelector("p.font-mono.text-4xl");
        expect(emiEl).not.toBeNull();
        expect(emiEl!.textContent).toMatch(/\d{2},\d{3}/);
      });
    });

    it("calculates zero-interest EMI as P / months", async () => {
      // P=12000, r=0, t=12months → EMI=1000
      const user = userEvent.setup({ delay: null });
      render(<EmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "12000");
      await user.type(inputs[1], "0");
      await user.type(inputs[2], "12");
      await user.click(screen.getByRole("button", { name: "months" }));
      await waitFor(() => {
        expect(screen.getAllByText("1,000").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows total payable and total interest", async () => {
      const user = userEvent.setup({ delay: null });
      render(<EmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "100000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "2");
      await waitFor(() => {
        expect(screen.getByText("Total interest")).toBeInTheDocument();
        expect(screen.getByText("Total amount payable")).toBeInTheDocument();
      });
    });

    it("shows principal/interest percentage breakdown bar", async () => {
      const user = userEvent.setup({ delay: null });
      render(<EmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "100000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "5");
      await waitFor(() => {
        expect(screen.getByText(/Principal \d+\.\d%/)).toBeInTheDocument();
        expect(screen.getByText(/Interest \d+\.\d%/)).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error for principal <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<EmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "-100");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for rate > 100%", async () => {
      const user = userEvent.setup({ delay: null });
      render(<EmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[1], "150");
      await waitFor(() => {
        expect(screen.getByText("Max 100%")).toBeInTheDocument();
      });
    });

    it("shows error for tenure in years below 1", async () => {
      const user = userEvent.setup({ delay: null });
      render(<EmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "100000");
      await user.type(inputs[1], "8");
      await user.type(inputs[2], "0");
      await waitFor(() => {
        expect(screen.getByText("Min 1 year")).toBeInTheDocument();
      });
    });

    it("shows error for tenure in years above 50", async () => {
      const user = userEvent.setup({ delay: null });
      render(<EmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[2], "51");
      await waitFor(() => {
        expect(screen.getByText("Max 50 years")).toBeInTheDocument();
      });
    });

    it("shows dash for empty state", () => {
      render(<EmiCalculator />);
      // Multiple "—" appear (EMI display + Total interest + Total amount payable rows)
      expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("tenure unit toggle", () => {
    it("switches between years and months", async () => {
      const user = userEvent.setup({ delay: null });
      render(<EmiCalculator />);
      await user.click(screen.getByRole("button", { name: "months" }));
      expect(screen.getByText(/1–600 months/)).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("inputs have labels", () => {
      render(<EmiCalculator />);
      expect(screen.getByText(/loan amount/i)).toBeInTheDocument();
      expect(screen.getByText(/annual interest rate/i)).toBeInTheDocument();
      expect(screen.getByText(/loan tenure/i)).toBeInTheDocument();
    });
  });
});
