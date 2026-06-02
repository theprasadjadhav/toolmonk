import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProbabilityCalculator } from "@/components/tools/calculators/ProbabilityCalculator";

describe("ProbabilityCalculator", () => {
  describe("mode: basic (Favorable / Total)", () => {
    it("computes P = 3/10 = 0.3", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProbabilityCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "3");
      await user.type(inputs[1], "10");
      await waitFor(() => {
        expect(screen.getByText("0.3")).toBeInTheDocument();
        expect(screen.getByText("30%")).toBeInTheDocument();
        expect(screen.getByText("3 / 10")).toBeInTheDocument();
      });
    });

    it("computes P = 1/2 = 0.5", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProbabilityCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "2");
      await waitFor(() => {
        expect(screen.getByText("0.5")).toBeInTheDocument();
      });
    });

    it("shows formula", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProbabilityCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "3");
      await user.type(inputs[1], "10");
      await waitFor(() => {
        expect(screen.getByText(/3 ÷ 10 = 0.3/)).toBeInTheDocument();
      });
    });

    it("shows error when favorable > total", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProbabilityCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "11");
      await user.type(inputs[1], "10");
      await waitFor(() => {
        expect(screen.getByText(/Cannot exceed total outcomes/)).toBeInTheDocument();
      });
    });

    it("shows error when total is 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProbabilityCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "1");
      await user.type(inputs[1], "0");
      await waitFor(() => {
        expect(screen.getByText(/Must be > 0/)).toBeInTheDocument();
      });
    });
  });

  describe("mode: complement", () => {
    it("computes P(not A) = 1 - 0.3 = 0.7", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProbabilityCalculator />);
      await user.click(screen.getByRole("button", { name: /Complement/i }));
      const input = screen.getByRole("textbox");
      await user.type(input, "0.3");
      await waitFor(() => {
        // pNotA row shows "0.7 (70%)" and formula shows "1 − 0.3 = 0.7"
        // Multiple elements match /0.7/ — assert at least one is present
        const matches = screen.getAllByText(/0\.7/);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("accepts percentage input (30%)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProbabilityCalculator />);
      await user.click(screen.getByRole("button", { name: /Complement/i }));
      const input = screen.getByRole("textbox");
      await user.type(input, "30%");
      await waitFor(() => {
        const matches = screen.getAllByText(/0\.7/);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("mode: combined (A and B)", () => {
    it("computes P(A and B) = 0.5 * 0.4 = 0.2", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProbabilityCalculator />);
      await user.click(screen.getByRole("button", { name: /A and B/i }));
      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "0.5");
      await user.type(inputs[1], "0.4");
      await waitFor(() => {
        // P(A and B) row shows "0.2 (20%)" — use regex to match
        expect(screen.getByText(/0\.2.*20%/)).toBeInTheDocument();
      });
    });

    it("shows formula for combined probability", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProbabilityCalculator />);
      await user.click(screen.getByRole("button", { name: /A and B/i }));
      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "0.5");
      await user.type(inputs[1], "0.4");
      await waitFor(() => {
        expect(screen.getByText(/0.5 × 0.4 = 0.2/)).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("mode buttons have proper labels", () => {
      render(<ProbabilityCalculator />);
      expect(screen.getByRole("button", { name: /Favorable \/ Total/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Complement/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /A and B/i })).toBeInTheDocument();
    });

    it("shows dashes initially", () => {
      render(<ProbabilityCalculator />);
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });
});
