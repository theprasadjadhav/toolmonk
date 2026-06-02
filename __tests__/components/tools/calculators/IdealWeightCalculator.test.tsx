import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IdealWeightCalculator } from "@/components/tools/calculators/IdealWeightCalculator";

describe("IdealWeightCalculator", () => {
  describe("business logic", () => {
    it("calculates average ideal weight for a male at 175 cm", async () => {
      const user = userEvent.setup({ delay: null });
      render(<IdealWeightCalculator />);
      await user.type(screen.getByRole("spinbutton"), "175");
      await waitFor(() => {
        // Multiple kg values appear (avg + 4 formulas); at least one present
        const kgMatches = screen.getAllByText(/\d+\.\d kg/);
        expect(kgMatches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows all four formula results (Devine, Robinson, Miller, Hamwi)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<IdealWeightCalculator />);
      await user.type(screen.getByRole("spinbutton"), "175");
      await waitFor(() => {
        expect(screen.getByText("Devine")).toBeInTheDocument();
        expect(screen.getByText("Robinson")).toBeInTheDocument();
        expect(screen.getByText("Miller")).toBeInTheDocument();
        expect(screen.getByText("Hamwi")).toBeInTheDocument();
      });
    });

    it("shows result in both kg and lbs", async () => {
      const user = userEvent.setup({ delay: null });
      render(<IdealWeightCalculator />);
      await user.type(screen.getByRole("spinbutton"), "175");
      await waitFor(() => {
        const lbsMatches = screen.getAllByText(/lbs/);
        expect(lbsMatches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows different values for female gender", async () => {
      const user = userEvent.setup({ delay: null });
      render(<IdealWeightCalculator />);
      await user.type(screen.getByRole("spinbutton"), "175");

      let maleAvgText: string;
      await waitFor(() => {
        // The average result paragraph has the pattern "XX.X kg"
        const avgEl = screen.getAllByText(/\d+\.\d kg/)[0];
        maleAvgText = avgEl.textContent!;
      });

      await user.click(screen.getByRole("button", { name: "female" }));
      await waitFor(() => {
        const avgEl = screen.getAllByText(/\d+\.\d kg/)[0];
        expect(avgEl.textContent).not.toBe(maleAvgText!);
      });
    });
  });

  describe("validation", () => {
    it("shows error for height > 300 cm", async () => {
      const user = userEvent.setup({ delay: null });
      render(<IdealWeightCalculator />);
      await user.type(screen.getByRole("spinbutton"), "301");
      await waitFor(() => {
        expect(screen.getByText("Max 300 cm")).toBeInTheDocument();
      });
    });

    it("shows error for height <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<IdealWeightCalculator />);
      await user.type(screen.getByRole("spinbutton"), "0");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows dash when no height entered", () => {
      render(<IdealWeightCalculator />);
      // Multiple dashes appear in formula table rows; at least one present
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("unit toggle", () => {
    it("can switch height to ft/in mode", async () => {
      const user = userEvent.setup({ delay: null });
      render(<IdealWeightCalculator />);
      await user.click(screen.getByRole("button", { name: "ft" }));
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "5");
      await user.type(inputs[1], "9");
      await waitFor(() => {
        const kgMatches = screen.getAllByText(/\d+\.\d kg/);
        expect(kgMatches.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("accessibility", () => {
    it("has gender toggle buttons", () => {
      render(<IdealWeightCalculator />);
      expect(screen.getByRole("button", { name: "male" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "female" })).toBeInTheDocument();
    });

    it("shows formula reference section", async () => {
      const user = userEvent.setup({ delay: null });
      render(<IdealWeightCalculator />);
      await user.type(screen.getByRole("spinbutton"), "175");
      await waitFor(() => {
        // Label text is "— formulas (male)"
        expect(screen.getByText(/formulas.*male/i)).toBeInTheDocument();
      });
    });
  });
});
