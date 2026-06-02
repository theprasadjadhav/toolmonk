import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalorieCalculator } from "@/components/tools/calculators/CalorieCalculator";

describe("CalorieCalculator", () => {
  describe("component rendering", () => {
    it("renders gender toggle buttons", () => {
      render(<CalorieCalculator />);
      expect(screen.getByRole("button", { name: "male" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "female" })).toBeInTheDocument();
    });

    it("renders activity level select", () => {
      render(<CalorieCalculator />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders age, weight and height inputs", () => {
      render(<CalorieCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThanOrEqual(3);
    });

    it("shows dashes initially for all result rows", () => {
      render(<CalorieCalculator />);
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("happy path — male", () => {
    it("calculates BMR and TDEE for a typical male profile", async () => {
      const user = userEvent.setup();
      render(<CalorieCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      // age=30, weight=70kg, height=175cm
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "70");
      await user.type(inputs[2], "175");
      await waitFor(() => {
        // BMR for male 30yr, 70kg, 175cm = 10*70+6.25*175-5*30+5 = 700+1093.75-150+5 = 1648.75 ≈ 1649
        expect(screen.getByText(/1,6\d\d kcal/)).toBeInTheDocument();
      });
    });

    it("shows maintenance, weight loss and weight gain rows", async () => {
      const user = userEvent.setup();
      render(<CalorieCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "70");
      await user.type(inputs[2], "175");
      await waitFor(() => {
        expect(screen.getByText("Maintenance")).toBeInTheDocument();
        expect(screen.getByText("Weight loss")).toBeInTheDocument();
        expect(screen.getByText("Weight gain")).toBeInTheDocument();
      });
    });
  });

  describe("happy path — female", () => {
    it("calculates BMR for female (lower than male for same params)", async () => {
      const user = userEvent.setup();
      render(<CalorieCalculator />);
      await user.click(screen.getByRole("button", { name: "female" }));
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "70");
      await user.type(inputs[2], "175");
      await waitFor(() => {
        // Female BMR = same formula but -161 instead of +5 → 166 less
        // 1648.75 - 166 = 1482.75 ≈ 1483
        expect(screen.getByText(/1,4\d\d kcal/)).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error for age below 1", async () => {
      const user = userEvent.setup();
      render(<CalorieCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await waitFor(() => {
        expect(screen.getByText("Min 1 year")).toBeInTheDocument();
      });
    });

    it("shows error for age above 120", async () => {
      const user = userEvent.setup();
      render(<CalorieCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "150");
      await waitFor(() => {
        expect(screen.getByText("Max 120 years")).toBeInTheDocument();
      });
    });

    it("shows error for weight <= 0", async () => {
      const user = userEvent.setup();
      render(<CalorieCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "-5");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error for height above 300 cm", async () => {
      const user = userEvent.setup();
      render(<CalorieCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "70");
      await user.type(inputs[2], "301");
      await waitFor(() => {
        expect(screen.getByText("Max 300 cm")).toBeInTheDocument();
      });
    });
  });

  describe("activity level", () => {
    it("changing activity level updates TDEE", async () => {
      const user = userEvent.setup();
      render(<CalorieCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "70");
      await user.type(inputs[2], "175");

      let firstTdee: string | undefined;
      await waitFor(() => {
        // Get the maintenance kcal value
        const maintenanceRow = screen.getByText("Maintenance");
        firstTdee = maintenanceRow.closest("div")?.nextElementSibling?.textContent ?? undefined;
      });

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "4"); // Extra active (index 4)

      await waitFor(() => {
        const maintenanceRow = screen.getByText("Maintenance");
        const newTdee = maintenanceRow.closest("div")?.nextElementSibling?.textContent;
        expect(newTdee).not.toBe(firstTdee);
      });
    });
  });

  describe("accessibility", () => {
    it("age input has a label", () => {
      render(<CalorieCalculator />);
      expect(screen.getByText(/Age.*years/i)).toBeInTheDocument();
    });

    it("activity level has a label", () => {
      render(<CalorieCalculator />);
      expect(screen.getByText(/Activity level/i)).toBeInTheDocument();
    });
  });
});
