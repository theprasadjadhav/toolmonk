import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExponentCalculator } from "@/components/tools/calculators/ExponentCalculator";

describe("ExponentCalculator", () => {
  describe("business logic", () => {
    it("computes 2^10 = 1024", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExponentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "2");
      await user.type(inputs[1], "10");
      await waitFor(() => {
        // "1024" appears in headline span and possibly in <pre> full decimal
        expect(screen.getAllByText("1024").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes 3^0 = 1", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExponentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "3");
      await user.type(inputs[1], "0");
      await waitFor(() => {
        // "1" appears in headline and possibly full decimal
        expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes 10^3 = 1000", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExponentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "10");
      await user.type(inputs[1], "3");
      await waitFor(() => {
        expect(screen.getAllByText("1000").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes negative base: (-2)^3 = -8", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExponentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "-2");
      await user.type(inputs[1], "3");
      await waitFor(() => {
        expect(screen.getAllByText("-8").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes fractional exponent: 4^0.5 = 2", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExponentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "4");
      await user.type(inputs[1], "0.5");
      await waitFor(() => {
        expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows full decimal for small integers", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExponentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "2");
      await user.type(inputs[1], "8");
      await waitFor(() => {
        expect(screen.getAllByText("256").length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("validation", () => {
    it("shows error when 0 is raised to a negative exponent", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExponentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await user.type(inputs[1], "-1");
      await waitFor(() => {
        expect(screen.getByText(/cannot be raised to a negative exponent/i)).toBeInTheDocument();
      });
    });

    it("shows error for negative base with fractional exponent", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExponentCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "-2");
      await user.type(inputs[1], "0.5");
      await waitFor(() => {
        expect(screen.getByText(/complex numbers/i)).toBeInTheDocument();
      });
    });

    it("shows no result when inputs are empty", () => {
      render(<ExponentCalculator />);
      // With no inputs, no "=" sign in the visual expression area
      expect(screen.queryByText("=")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has labels for base and exponent inputs", () => {
      render(<ExponentCalculator />);
      expect(screen.getByText(/base/i)).toBeInTheDocument();
      expect(screen.getByText(/exponent/i)).toBeInTheDocument();
    });
  });
});
