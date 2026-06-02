import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PercentageCalculator } from "@/components/tools/calculators/PercentageCalculator";

describe("PercentageCalculator", () => {
  describe("mode: what-is (default)", () => {
    it("computes 15% of 200 = 30", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PercentageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "15");
      await user.type(inputs[1], "200");
      await waitFor(() => {
        expect(screen.getByText("30")).toBeInTheDocument();
      });
    });

    it("computes 0% of any number = 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PercentageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await user.type(inputs[1], "500");
      await waitFor(() => {
        expect(screen.getByText("0")).toBeInTheDocument();
      });
    });

    it("computes 100% of 250 = 250", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PercentageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "100");
      await user.type(inputs[1], "250");
      await waitFor(() => {
        expect(screen.getByText("250")).toBeInTheDocument();
      });
    });

    it("shows formula string", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PercentageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "10");
      await user.type(inputs[1], "100");
      await waitFor(() => {
        expect(screen.getByText(/÷ 100 = 10/)).toBeInTheDocument();
      });
    });
  });

  describe("mode: is-what", () => {
    it("computes 30 is what % of 200 = 15%", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PercentageCalculator />);
      await user.click(screen.getByRole("button", { name: /X is what/i }));
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "30");
      await user.type(inputs[1], "200");
      await waitFor(() => {
        expect(screen.getByText("15%")).toBeInTheDocument();
      });
    });

    it("shows error when total is 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PercentageCalculator />);
      await user.click(screen.getByRole("button", { name: /X is what/i }));
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "10");
      await user.type(inputs[1], "0");
      await waitFor(() => {
        expect(screen.getByText(/Cannot divide by zero/)).toBeInTheDocument();
      });
    });
  });

  describe("mode: change", () => {
    it("computes % change from 100 to 150 = 50% increase", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PercentageCalculator />);
      await user.click(screen.getByRole("button", { name: /% change/i }));
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "100");
      await user.type(inputs[1], "150");
      await waitFor(() => {
        expect(screen.getByText(/50%.*increase/)).toBeInTheDocument();
      });
    });

    it("computes % decrease from 200 to 100 = 50% decrease", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PercentageCalculator />);
      await user.click(screen.getByRole("button", { name: /% change/i }));
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "200");
      await user.type(inputs[1], "100");
      await waitFor(() => {
        expect(screen.getByText(/50%.*decrease/)).toBeInTheDocument();
      });
    });

    it("shows error when starting value is 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PercentageCalculator />);
      await user.click(screen.getByRole("button", { name: /% change/i }));
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await user.type(inputs[1], "50");
      await waitFor(() => {
        expect(screen.getByText(/Starting value cannot be zero/)).toBeInTheDocument();
      });
    });
  });

  describe("copy button", () => {
    it("copies result to clipboard", async () => {
      const user = userEvent.setup({ delay: null });
      render(<PercentageCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "10");
      await user.type(inputs[1], "100");
      await waitFor(() => screen.getByText("10"));
      await user.click(screen.getByRole("button", { name: /copy/i }));
      // userEvent installs its own virtual clipboard; verify via readText()
      const text = await navigator.clipboard.readText();
      expect(text).toBe("10");
    });
  });

  describe("accessibility", () => {
    it("mode buttons have descriptive labels", () => {
      render(<PercentageCalculator />);
      expect(screen.getByRole("button", { name: /What is X%/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /X is what/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /% change/i })).toBeInTheDocument();
    });

    it("shows dash initially", () => {
      render(<PercentageCalculator />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });
});
