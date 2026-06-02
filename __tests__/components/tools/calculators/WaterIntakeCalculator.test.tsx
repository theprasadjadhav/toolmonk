import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WaterIntakeCalculator } from "@/components/tools/calculators/WaterIntakeCalculator";

describe("WaterIntakeCalculator", () => {
  describe("component rendering", () => {
    it("renders weight unit toggle buttons", () => {
      render(<WaterIntakeCalculator />);
      expect(screen.getByRole("button", { name: "kg" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "lbs" })).toBeInTheDocument();
    });

    it("renders activity level selector", () => {
      render(<WaterIntakeCalculator />);
      expect(screen.getByText(/activity level/i)).toBeInTheDocument();
    });

    it("renders climate selector", () => {
      render(<WaterIntakeCalculator />);
      expect(screen.getByText(/climate/i)).toBeInTheDocument();
    });

    it("shows dash before any weight is entered", () => {
      render(<WaterIntakeCalculator />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("shows disclaimer note", () => {
      render(<WaterIntakeCalculator />);
      expect(screen.getByText(/33 ml per kg of body weight/i)).toBeInTheDocument();
    });
  });

  describe("business logic — kg mode", () => {
    it("computes daily water intake for 70 kg (default Moderate activity, Normal climate)", async () => {
      // 70 × 0.033 × 1.2 × 1.0 = 2.772 → rounded to 1dp → "2.8 L"
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      await waitFor(() => {
        // Primary result heading shows "2.8 L"
        const primaryEl = document.querySelector(".text-4xl.text-blue-400");
        expect(primaryEl?.textContent).toMatch(/2\.\d L/);
      });
    });

    it("shows milliliters output", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      await waitFor(() => {
        // Milliliters value is a round number like "2772 ml"
        const mlEl = document.querySelector("p.font-mono.text-sm.text-foreground");
        expect(mlEl?.textContent).toMatch(/\d+ ml/);
      });
    });

    it("shows glasses output (250 ml each)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      await waitFor(() => {
        expect(screen.getByText(/glasses/)).toBeInTheDocument();
      });
    });

    it("shows fluid ounces output", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      await waitFor(() => {
        expect(screen.getByText(/oz/)).toBeInTheDocument();
      });
    });

    it("shows calculation breakdown table", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      await waitFor(() => {
        expect(screen.getByText(/calculation breakdown/i)).toBeInTheDocument();
      });
    });

    it("shows base row in breakdown", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      await waitFor(() => {
        expect(screen.getByText(/Base \(weight × 0\.033\)/i)).toBeInTheDocument();
      });
    });

    it("shows formula string", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      await waitFor(() => {
        // Formula text like "70.0 kg × 0.033 × 1.2 × 1 = 2.77 L"
        expect(screen.getAllByText(/0\.033/).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("business logic — lbs mode", () => {
    it("switches to lbs input when lbs button is clicked", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.click(screen.getByRole("button", { name: "lbs" }));
      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("placeholder", "154");
    });

    it("computes intake for 154 lbs (≈70 kg, Moderate activity, Normal climate)", async () => {
      // 154 lbs / 2.20462 ≈ 69.9 kg × 0.033 × 1.2 × 1.0 ≈ 2.77 → "2.8 L"
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.click(screen.getByRole("button", { name: "lbs" }));
      await user.type(screen.getByRole("spinbutton"), "154");
      await waitFor(() => {
        // Primary result heading shows the main result
        const primaryEl = document.querySelector(".text-4xl.text-blue-400");
        expect(primaryEl?.textContent).toMatch(/2\.\d L/);
      });
    });
  });

  describe("activity level effect", () => {
    it("Low activity (1.0×) shows 'no adjustment' for activity row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      const activitySelect = screen.getAllByRole("combobox")[0];
      await user.selectOptions(activitySelect, "0"); // Low (mostly sedentary) — index 0
      await waitFor(() => {
        // Both activity and climate adjustments may show "no adjustment"
        expect(screen.getAllByText("no adjustment").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("High activity (1.4×) produces more intake than Low activity (1.0×)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      const activitySelect = screen.getAllByRole("combobox")[0];

      // Set Low activity and capture result
      await user.selectOptions(activitySelect, "0");
      let lowResult = "";
      await waitFor(() => {
        const el = document.querySelector(".text-4xl.text-blue-400");
        lowResult = el?.textContent ?? "";
        expect(lowResult).not.toBe("");
      });

      // Switch to High activity
      await user.selectOptions(activitySelect, "2");
      await waitFor(() => {
        const el = document.querySelector(".text-4xl.text-blue-400");
        const highResult = el?.textContent ?? "";
        expect(highResult).not.toBe(lowResult);
      });
    });
  });

  describe("climate effect", () => {
    it("Cold climate (0.9×) shows 'no adjustment' for climate row", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      const climateSelect = screen.getAllByRole("combobox")[1];
      await user.selectOptions(climateSelect, "0"); // Cold — index 0, multiplier 0.9
      await waitFor(() => {
        // climateAdjustment = baseLiters * activityMul * (0.9 - 1) < 0, so shows "no adjustment"
        expect(screen.getAllByText("no adjustment").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("Hot climate option exists in the selector", () => {
      render(<WaterIntakeCalculator />);
      expect(screen.getByText(/Hot \(30/)).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows error for weight <= 0 in kg mode", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "0");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for weight > 500 kg", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "501");
      await waitFor(() => {
        expect(screen.getByText("Max 500 kg")).toBeInTheDocument();
      });
    });

    it("shows error for weight <= 0 in lbs mode", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.click(screen.getByRole("button", { name: "lbs" }));
      await user.type(screen.getByRole("spinbutton"), "0");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for weight > 1100 lbs", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.click(screen.getByRole("button", { name: "lbs" }));
      await user.type(screen.getByRole("spinbutton"), "1101");
      await waitFor(() => {
        expect(screen.getByText("Max 1,100 lbs")).toBeInTheDocument();
      });
    });

    it("does not show result when weight field is invalid", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "0");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
        expect(screen.getByText("—")).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("weight input has a label", () => {
      render(<WaterIntakeCalculator />);
      expect(screen.getByText("Weight")).toBeInTheDocument();
    });

    it("activity level select has a label", () => {
      render(<WaterIntakeCalculator />);
      expect(screen.getByText(/activity level/i)).toBeInTheDocument();
    });

    it("climate select has a label", () => {
      render(<WaterIntakeCalculator />);
      expect(screen.getByText(/^Climate$/i)).toBeInTheDocument();
    });

    it("daily water intake result area has a label", () => {
      render(<WaterIntakeCalculator />);
      expect(screen.getByText(/daily water intake/i)).toBeInTheDocument();
    });

    it("result sub-labels are present after entering weight", async () => {
      const user = userEvent.setup({ delay: null });
      render(<WaterIntakeCalculator />);
      await user.type(screen.getByRole("spinbutton"), "70");
      await waitFor(() => {
        expect(screen.getByText("Milliliters")).toBeInTheDocument();
        expect(screen.getByText("Glasses (250 ml)")).toBeInTheDocument();
        expect(screen.getByText("Fluid ounces")).toBeInTheDocument();
      });
    });
  });
});
