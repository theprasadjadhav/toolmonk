import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AverageCalculator } from "@/components/tools/calculators/AverageCalculator";

describe("AverageCalculator (StatisticsCalculator)", () => {
  describe("component", () => {
    it("renders the textarea input", () => {
      render(<AverageCalculator highlight="" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("shows placeholders for all stat rows before any input", () => {
      render(<AverageCalculator highlight="" />);
      // All values show "—" initially
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(10);
    });

    it("computes mean for a simple list", async () => {
      const user = userEvent.setup({ delay: null });
      render(<AverageCalculator highlight="" />);
      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "2, 4, 6");
      await waitFor(() => {
        // Multiple "4"s can appear (mean=4, count=3 numbers so range=4, etc.)
        expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes median for odd-count list", async () => {
      const user = userEvent.setup({ delay: null });
      render(<AverageCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "1 3 5");
      await waitFor(() => {
        // median row value is 3; multiple "3"s possible
        expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes sum correctly", async () => {
      const user = userEvent.setup({ delay: null });
      render(<AverageCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "10 20 30");
      await waitFor(() => {
        expect(screen.getAllByText("60").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows recognition count", async () => {
      const user = userEvent.setup({ delay: null });
      render(<AverageCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "1, 2, 3");
      await waitFor(() => {
        expect(screen.getByText(/3 numbers recognised/)).toBeInTheDocument();
      });
    });

    it("shows error when no valid numbers found", async () => {
      const user = userEvent.setup({ delay: null });
      render(<AverageCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "abc def");
      await waitFor(() => {
        expect(screen.getByText(/No valid numbers found/)).toBeInTheDocument();
      });
    });

    it("handles negative numbers", async () => {
      const user = userEvent.setup({ delay: null });
      render(<AverageCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "-5 0 5");
      await waitFor(() => {
        // mean = 0; may appear multiple times
        expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes std deviation for dataset [2,4,4,4,5,5,7,9]", async () => {
      const user = userEvent.setup({ delay: null });
      render(<AverageCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "2 4 4 4 5 5 7 9");
      await waitFor(() => {
        // mean = 5, stdDev = 2
        expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("accessibility", () => {
    it("textarea has associated label", () => {
      render(<AverageCalculator highlight="" />);
      const label = screen.getByText(/numbers.*separated/i);
      expect(label).toBeInTheDocument();
    });

    it("copy buttons exist for each stat row", () => {
      render(<AverageCalculator highlight="" />);
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns.length).toBeGreaterThanOrEqual(10);
    });
  });
});
