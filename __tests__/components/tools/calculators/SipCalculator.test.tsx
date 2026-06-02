import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SipCalculator } from "@/components/tools/calculators/SipCalculator";

describe("SipCalculator", () => {
  describe("business logic", () => {
    it("calculates SIP corpus: 500/mo, 12%/yr, 1yr", async () => {
      // r = 12/12/100 = 0.01, months=12
      // FV = 500 * ((1.01^12 - 1) / 0.01) * 1.01 ≈ 6404.66
      const user = userEvent.setup({ delay: null });
      render(<SipCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500");
      await user.type(inputs[1], "12");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        // Corpus is ~6404.66, appears multiple times (summary + table row)
        expect(screen.getAllByText(/6,4\d\d/).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows total invested correctly", async () => {
      // 500/mo * 12 months = 6000
      const user = userEvent.setup({ delay: null });
      render(<SipCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500");
      await user.type(inputs[1], "12");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        expect(screen.getByText("Total Invested")).toBeInTheDocument();
        // "6,000" may appear multiple times (summary row + year table row)
        expect(screen.getAllByText("6,000").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows estimated returns", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SipCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500");
      await user.type(inputs[1], "12");
      await user.type(inputs[2], "1");
      await waitFor(() => {
        expect(screen.getByText("Estimated Returns")).toBeInTheDocument();
      });
    });

    it("shows year-by-year corpus growth table", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SipCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500");
      await user.type(inputs[1], "12");
      await user.type(inputs[2], "3");
      await waitFor(() => {
        expect(screen.getByText(/year-by-year corpus growth/)).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error for monthly investment <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SipCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for rate > 100%", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SipCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[1], "200");
      await waitFor(() => {
        expect(screen.getByText("Max 100%")).toBeInTheDocument();
      });
    });

    it("shows error for years below 1", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SipCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[2], "0");
      await waitFor(() => {
        expect(screen.getByText("Min 1 year")).toBeInTheDocument();
      });
    });

    it("shows error for years above 50", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SipCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[2], "51");
      await waitFor(() => {
        expect(screen.getByText("Max 50 years")).toBeInTheDocument();
      });
    });

    it("shows dash when empty", () => {
      render(<SipCalculator />);
      // Multiple dashes appear in empty state result rows
      expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("copy button", () => {
    it("copies corpus value to clipboard", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SipCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500");
      await user.type(inputs[1], "12");
      await user.type(inputs[2], "1");
      await waitFor(() => screen.getAllByText(/6,4\d\d/));
      await user.click(screen.getByRole("button", { name: /copy/i }));
      // Verify clipboard received a value
      const clipText = await navigator.clipboard.readText();
      expect(clipText).toMatch(/6,4\d\d/);
    });
  });

  describe("accessibility", () => {
    it("all inputs have labels", () => {
      render(<SipCalculator />);
      expect(screen.getByText(/monthly investment/i)).toBeInTheDocument();
      expect(screen.getByText(/annual return/i)).toBeInTheDocument();
      expect(screen.getByText(/investment period/i)).toBeInTheDocument();
    });
  });
});
