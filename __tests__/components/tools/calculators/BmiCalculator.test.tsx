import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BmiCalculator } from "@/components/tools/calculators/BmiCalculator";

describe("BmiCalculator", () => {
  describe("business logic (via UI)", () => {
    it("calculates BMI ~22.0 for 70 kg / 175 cm", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      // weight input (first), height input (second in cm mode)
      await user.clear(inputs[0]);
      await user.type(inputs[0], "70");
      await user.clear(inputs[1]);
      await user.type(inputs[1], "175");
      await waitFor(() => {
        // BMI = 70 / (1.75^2) ≈ 22.9 → displayed as "22.9" in multiple places
        expect(screen.getAllByText(/22\.\d/).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows Normal weight category for BMI 22", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "70");
      await user.type(inputs[1], "175");
      await waitFor(() => {
        expect(screen.getAllByText("Normal weight").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows Underweight for BMI < 18.5", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "45");
      await user.type(inputs[1], "175");
      await waitFor(() => {
        expect(screen.getAllByText("Underweight").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows Overweight for BMI between 25 and 30", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "82");
      await user.type(inputs[1], "175");
      await waitFor(() => {
        expect(screen.getAllByText("Overweight").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows Obese for BMI >= 30", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "100");
      await user.type(inputs[1], "175");
      await waitFor(() => {
        expect(screen.getAllByText("Obese").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows healthy weight range after valid input", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "70");
      await user.type(inputs[1], "175");
      await waitFor(() => {
        expect(screen.getByText(/Healthy range for your height/i)).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error for weight above max (500 kg)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "600");
      await waitFor(() => {
        expect(screen.getByText("Max 500 kg")).toBeInTheDocument();
      });
    });

    it("shows error for height above max (300 cm)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[1], "350");
      await waitFor(() => {
        expect(screen.getByText("Max 300 cm")).toBeInTheDocument();
      });
    });

    it("shows no result with empty inputs", () => {
      render(<BmiCalculator />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("ft mode: shows error for feet > 9", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      await user.click(screen.getAllByRole("button", { name: "ft" })[0]);
      const ftInputs = screen.getAllByRole("spinbutton");
      await user.type(ftInputs[1], "10");
      await waitFor(() => {
        expect(screen.getByText("Max 9 ft")).toBeInTheDocument();
      });
    });
  });

  describe("unit toggle", () => {
    it("switches to lbs when clicking the lbs button", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      await user.click(screen.getByRole("button", { name: "lbs" }));
      expect(screen.getByPlaceholderText("154")).toBeInTheDocument();
    });

    it("switches height to ft/in when clicking ft", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      // There are two ft buttons (weight unit + height unit). Height one is second.
      const ftBtns = screen.getAllByRole("button", { name: "ft" });
      await user.click(ftBtns[0]);
      expect(screen.getByPlaceholderText("5 ft")).toBeInTheDocument();
    });

    it("calculates correctly in lbs + ft/in units", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BmiCalculator />);
      await user.click(screen.getByRole("button", { name: "lbs" }));
      const ftBtns = screen.getAllByRole("button", { name: "ft" });
      await user.click(ftBtns[0]);
      const inputs = screen.getAllByRole("spinbutton");
      // 154 lbs = 70 kg, 5ft9in ≈ 175.26 cm
      await user.type(inputs[0], "154");
      await user.type(inputs[1], "5");
      await user.type(inputs[2], "9");
      await waitFor(() => {
        // BMI ~22.7 appears in multiple places; check at least one
        expect(screen.getAllByText(/22\.\d/).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("accessibility", () => {
    it("has unit toggle buttons with accessible names", () => {
      render(<BmiCalculator />);
      expect(screen.getAllByRole("button", { name: "kg" }).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByRole("button", { name: "cm" }).length).toBeGreaterThanOrEqual(1);
    });

    it("renders reference table with BMI categories", () => {
      render(<BmiCalculator />);
      expect(screen.getByText("BMI categories")).toBeInTheDocument();
    });
  });
});
