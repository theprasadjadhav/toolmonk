import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompoundInterestCalculator } from "@/components/tools/calculators/CompoundInterestCalculator";

describe("CompoundInterestCalculator", () => {
  describe("business logic", () => {
    it("calculates A = P(1 + r/n)^(nt) correctly", async () => {
      // P=1000, r=10%, n=12, t=1 → A ≈ 1104.71
      const user = userEvent.setup({ delay: null });
      render(<CompoundInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        // Final Amount appears multiple times (result box + formula + table row)
        expect(screen.getAllByText(/1,104/).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows total interest separate from principal", async () => {
      const user = userEvent.setup({ delay: null });
      render(<CompoundInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        expect(screen.getByText("Total Interest")).toBeInTheDocument();
        expect(screen.getByText("Principal")).toBeInTheDocument();
      });
    });

    it("shows growth multiplier", async () => {
      const user = userEvent.setup({ delay: null });
      render(<CompoundInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        expect(screen.getByText("Growth Multiplier")).toBeInTheDocument();
      });
    });

    it("shows year-by-year growth table", async () => {
      const user = userEvent.setup({ delay: null });
      render(<CompoundInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "5");
      await waitFor(() => {
        // The label renders as "— year-by-year growth" (with em-dash prefix)
        expect(screen.getByText(/year-by-year growth/)).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error for principal <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<CompoundInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for rate > 100", async () => {
      const user = userEvent.setup({ delay: null });
      render(<CompoundInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[1], "150");
      await waitFor(() => {
        expect(screen.getByText("Max 100%")).toBeInTheDocument();
      });
    });

    it("shows error for time > 100 years", async () => {
      const user = userEvent.setup({ delay: null });
      render(<CompoundInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[2], "101");
      await waitFor(() => {
        expect(screen.getByText("Max 100 years")).toBeInTheDocument();
      });
    });

    it("shows dash when fields are empty", () => {
      render(<CompoundInterestCalculator />);
      // Multiple "—" appear (Final Amount + Principal + Total Interest + Growth Multiplier rows)
      expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("copy button", () => {
    it("copies final amount to clipboard when clicked", async () => {
      const user = userEvent.setup({ delay: null });
      render(<CompoundInterestCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1000");
      await user.type(inputs[1], "10");
      await user.type(inputs[2], "1");
      await waitFor(() => screen.getAllByText(/1,104/));
      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await user.click(copyBtn);
      // userEvent.setup() provides a virtual clipboard; verify via readText
      if (vi.isMockFunction(navigator.clipboard?.writeText)) {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      } else {
        const text = await navigator.clipboard.readText();
        expect(text).toMatch(/1,104/);
      }
    });
  });

  describe("accessibility", () => {
    it("all inputs have labels", () => {
      render(<CompoundInterestCalculator />);
      // Labels use "— principal (P)" format so match with getAllByText
      expect(screen.getAllByText(/principal/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/annual rate/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/time.*years/i).length).toBeGreaterThanOrEqual(1);
    });

    it("has a compounding frequency selector", () => {
      render(<CompoundInterestCalculator />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
