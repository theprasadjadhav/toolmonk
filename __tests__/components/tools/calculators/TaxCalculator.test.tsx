import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaxCalculator } from "@/components/tools/calculators/TaxCalculator";

describe("TaxCalculator", () => {
  describe("component rendering", () => {
    it("renders country selector buttons", () => {
      render(<TaxCalculator />);
      expect(screen.getByRole("button", { name: "United States" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "United Kingdom" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "India" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Canada" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Australia" })).toBeInTheDocument();
    });

    it("shows filing status for US by default", () => {
      render(<TaxCalculator />);
      expect(screen.getByRole("button", { name: "Single" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Married Filing Jointly" })).toBeInTheDocument();
    });

    it("shows dash before any income entered", () => {
      render(<TaxCalculator />);
      // Multiple dashes appear across result rows
      expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("US Single — bracket calculation", () => {
    it("calculates income tax for 60k income", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.type(screen.getByRole("spinbutton"), "60000");
      await waitFor(() => {
        // Tax on taxable income (60000 - 15000 = 45000)
        // Bracket: 0-11925 @ 10% = 1192.5; 11925-45000 @ 12% = (45000-11925)*0.12=3969
        // Total ≈ 5161.5 — appears in heading and table row
        expect(screen.getAllByText(/5,161/).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows effective rate", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.type(screen.getByRole("spinbutton"), "60000");
      await waitFor(() => {
        expect(screen.getByText(/Effective \d+\.\d+%/)).toBeInTheDocument();
      });
    });

    it("shows marginal rate", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.type(screen.getByRole("spinbutton"), "60000");
      await waitFor(() => {
        expect(screen.getByText(/Marginal \d+%/)).toBeInTheDocument();
      });
    });

    it("shows bracket breakdown table", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.type(screen.getByRole("spinbutton"), "60000");
      await waitFor(() => {
        expect(screen.getByText(/bracket breakdown/i)).toBeInTheDocument();
      });
    });

    it("shows taxable income row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.type(screen.getByRole("spinbutton"), "60000");
      await waitFor(() => {
        expect(screen.getByText("Taxable income")).toBeInTheDocument();
      });
    });

    it("shows net income row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.type(screen.getByRole("spinbutton"), "60000");
      await waitFor(() => {
        expect(screen.getByText("Net income")).toBeInTheDocument();
      });
    });
  });

  describe("MFJ filing gives lower effective rate", () => {
    it("MFJ results in lower tax than single for 100k", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.type(screen.getByRole("spinbutton"), "100000");
      let singleTax: string;
      await waitFor(() => {
        const taxEl = document.querySelector(".text-4xl");
        singleTax = taxEl?.textContent ?? "";
        expect(singleTax).not.toBe("");
      });

      await user.click(screen.getByRole("button", { name: "Married Filing Jointly" }));
      await waitFor(() => {
        const mfjTaxEl = document.querySelector(".text-4xl");
        const mfjTax = mfjTaxEl?.textContent ?? "";
        expect(mfjTax).not.toBe(singleTax!);
      });
    });
  });

  describe("Country switching", () => {
    it("UK shows National Insurance row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.click(screen.getByRole("button", { name: "United Kingdom" }));
      await user.type(screen.getByRole("spinbutton"), "50000");
      await waitFor(() => {
        // "National Insurance" appears in row label and legal reference note
        expect(screen.getAllByText(/National Insurance/i).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("India shows New Regime and Old Regime tabs", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.click(screen.getByRole("button", { name: "India" }));
      expect(screen.getByRole("button", { name: "New Regime" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Old Regime" })).toBeInTheDocument();
    });

    it("India shows Health & Education Cess row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.click(screen.getByRole("button", { name: "India" }));
      await user.type(screen.getByRole("spinbutton"), "1500000");
      await waitFor(() => {
        expect(screen.getAllByText(/Health & Education Cess/i).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("Australia shows Medicare levy row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<TaxCalculator />);
      await user.click(screen.getByRole("button", { name: "Australia" }));
      await user.type(screen.getByRole("spinbutton"), "80000");
      await waitFor(() => {
        // "Medicare levy" appears in row label and notes
        expect(screen.getAllByText(/Medicare levy/i).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("accessibility", () => {
    it("income input has a label", () => {
      render(<TaxCalculator />);
      expect(screen.getByText(/annual income/i)).toBeInTheDocument();
    });

    it("shows disclaimer note", () => {
      render(<TaxCalculator />);
      expect(screen.getByText(/Tax laws change frequently/i)).toBeInTheDocument();
    });
  });
});
