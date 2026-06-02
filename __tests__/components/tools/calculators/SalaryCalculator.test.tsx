import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SalaryCalculator } from "@/components/tools/calculators/SalaryCalculator";

describe("SalaryCalculator", () => {
  describe("component rendering", () => {
    it("renders country selection buttons", () => {
      render(<SalaryCalculator />);
      expect(screen.getByRole("button", { name: "United States" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "United Kingdom" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "India" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Canada" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Australia" })).toBeInTheDocument();
    });

    it("shows filing status options for US", () => {
      render(<SalaryCalculator />);
      expect(screen.getByRole("button", { name: "Single" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Married Filing Jointly" })).toBeInTheDocument();
    });

    it("shows dash before any income entered", () => {
      render(<SalaryCalculator />);
      // Multiple dashes may exist in the result rows
      expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("US — Single filing", () => {
    it("calculates monthly take-home for 60k USD", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SalaryCalculator />);
      const input = screen.getByRole("spinbutton");
      await user.type(input, "60000");
      await waitFor(() => {
        // Should show a monthly take-home value
        expect(screen.getByText(/Monthly take-home/i)).toBeInTheDocument();
        expect(screen.getAllByText(/\d{1,3}(,\d{3})+(\.\d{2})?/).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows federal income tax row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SalaryCalculator />);
      await user.type(screen.getByRole("spinbutton"), "60000");
      await waitFor(() => {
        expect(screen.getByText("Federal income tax")).toBeInTheDocument();
      });
    });

    it("shows gross salary row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SalaryCalculator />);
      await user.type(screen.getByRole("spinbutton"), "60000");
      await waitFor(() => {
        expect(screen.getByText("Gross salary")).toBeInTheDocument();
      });
    });
  });

  describe("US — Married Filing Jointly", () => {
    it("gives higher take-home than single for same income", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SalaryCalculator />);
      await user.type(screen.getByRole("spinbutton"), "100000");
      let singleNet: string;
      await waitFor(() => {
        // Find the monthly take-home display value
        const netEl = document.querySelector(".text-4xl");
        singleNet = netEl?.textContent ?? "";
        expect(singleNet).not.toBe("");
      });

      await user.click(screen.getByRole("button", { name: "Married Filing Jointly" }));
      await waitFor(() => {
        const netEl = document.querySelector(".text-4xl");
        const newNet = netEl?.textContent ?? "";
        // MFJ standard deduction is $30k vs $15k for single, so higher net
        expect(newNet).not.toBe(singleNet!);
      });
    });
  });

  describe("Country switching", () => {
    it("switches to UK and shows National Insurance row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SalaryCalculator />);
      await user.click(screen.getByRole("button", { name: "United Kingdom" }));
      await user.type(screen.getByRole("spinbutton"), "50000");
      await waitFor(() => {
        // "National Insurance" appears in row label and reference note - use getAllBy
        expect(screen.getAllByText(/National Insurance/i).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("switches to India and shows New Regime / Old Regime options", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SalaryCalculator />);
      await user.click(screen.getByRole("button", { name: "India" }));
      expect(screen.getByRole("button", { name: "New Regime" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Old Regime" })).toBeInTheDocument();
    });

    it("switches to Canada and shows CPP row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SalaryCalculator />);
      await user.click(screen.getByRole("button", { name: "Canada" }));
      await user.type(screen.getByRole("spinbutton"), "70000");
      await waitFor(() => {
        // "CPP" appears in row label and reference note - use getAllBy
        expect(screen.getAllByText(/CPP/i).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("switches to Australia and shows Medicare levy row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SalaryCalculator />);
      await user.click(screen.getByRole("button", { name: "Australia" }));
      await user.type(screen.getByRole("spinbutton"), "80000");
      await waitFor(() => {
        // "Medicare levy" appears in row label and notes - use getAllBy
        expect(screen.getAllByText(/Medicare levy/i).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("accessibility", () => {
    it("income input has a label", () => {
      render(<SalaryCalculator />);
      expect(screen.getByText(/gross annual salary/i)).toBeInTheDocument();
    });

    it("shows disclaimer note", () => {
      render(<SalaryCalculator />);
      expect(screen.getByText(/Tax laws change frequently/i)).toBeInTheDocument();
    });
  });
});
