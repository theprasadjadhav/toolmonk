import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InvestmentCalculator } from "@/components/tools/calculators/InvestmentCalculator";

describe("InvestmentCalculator", () => {
  describe("business logic", () => {
    it("calculates FV = PV*(1+r)^n correctly", async () => {
      // PV=1000, r=10%, n=1 → FV=1100
      const user = userEvent.setup({ delay: null });
      render(<InvestmentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        // Future Value heading shows 1,100; also year 1 row shows 1,100
        const matches = screen.getAllByText("1,100");
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows total gain", async () => {
      const user = userEvent.setup({ delay: null });
      render(<InvestmentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        // "Total Gain" appears in the result table row and in growth table header
        const matches = screen.getAllByText("Total Gain");
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows gain percentage", async () => {
      const user = userEvent.setup({ delay: null });
      render(<InvestmentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        const matches = screen.getAllByText("Total Gain %");
        expect(matches.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/10%/)).toBeInTheDocument();
      });
    });

    it("shows year-by-year growth table", async () => {
      const user = userEvent.setup({ delay: null });
      render(<InvestmentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "5");
      await waitFor(() => {
        // Label text is "— year-by-year growth" where — is rendered separately
        // Use a regex to match the combined text
        expect(screen.getByText(/year-by-year growth/)).toBeInTheDocument();
      });
    });

    it("doubles money at 100% for 1 year", async () => {
      const user = userEvent.setup({ delay: null });
      render(<InvestmentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500");
      await user.type(inputs[1], "100");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        const matches = screen.getAllByText("1,000");
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("validation", () => {
    it("shows error for initial investment <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<InvestmentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for rate > 100%", async () => {
      const user = userEvent.setup({ delay: null });
      render(<InvestmentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[1], "101");
      await waitFor(() => {
        expect(screen.getByText("Max 100%")).toBeInTheDocument();
      });
    });

    it("shows error for years below 1", async () => {
      const user = userEvent.setup({ delay: null });
      render(<InvestmentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[2], "0");
      await waitFor(() => {
        expect(screen.getByText("Min 1 year")).toBeInTheDocument();
      });
    });

    it("shows dash when fields are empty", () => {
      render(<InvestmentCalculator />);
      // Multiple dashes appear (FV heading + 3 row values); at least one present
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("copy button", () => {
    it("copies future value to clipboard", async () => {
      const user = userEvent.setup({ delay: null });
      render(<InvestmentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "1");
      await waitFor(() => screen.getAllByText("1,100"));
      await user.click(screen.getByRole("button", { name: /copy/i }));
      // userEvent installs its own clipboard; verify via readText()
      const text = await navigator.clipboard.readText();
      expect(text).toBe("1,100");
    });
  });

  describe("accessibility", () => {
    it("all inputs have labels", () => {
      render(<InvestmentCalculator />);
      // Use getAllByText to handle multiple matches
      const initialLabels = screen.getAllByText(/initial investment/i);
      expect(initialLabels.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/annual return rate/i)).toBeInTheDocument();
      expect(screen.getByText(/investment period/i)).toBeInTheDocument();
    });
  });
});
