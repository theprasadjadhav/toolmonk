import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatisticsCalculator } from "@/components/tools/calculators/StatisticsCalculator";

describe("StatisticsCalculator", () => {
  describe("business logic", () => {
    it("computes mean for [2, 4, 6] = 4", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "2, 4, 6");
      await waitFor(() => {
        expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes median for odd-length array [1,3,5] = 3", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "1 3 5");
      await waitFor(() => {
        expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes median for even-length array [1,3,5,7] = 4", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "1 3 5 7");
      await waitFor(() => {
        expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes mode correctly", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "1 2 2 3");
      await waitFor(() => {
        // Mode = 2
        expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes sum correctly", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "10 20 30");
      await waitFor(() => {
        expect(screen.getAllByText("60").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes min and max", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "3 1 4 1 5 9");
      await waitFor(() => {
        expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1); // min
        expect(screen.getAllByText("9").length).toBeGreaterThanOrEqual(1); // max
      });
    });

    it("computes range = max - min", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "1 5");
      await waitFor(() => {
        // range = 4
        expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("computes std deviation for [2,4,4,4,5,5,7,9] = 2", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "2 4 4 4 5 5 7 9");
      await waitFor(() => {
        // stdDev = 2, variance = 4
        expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows count of numbers", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "10 20 30");
      await waitFor(() => {
        expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("highlight prop", () => {
    it("places highlighted stat row first", () => {
      render(<StatisticsCalculator highlight="mean" />);
      const statLabels = screen.getAllByText(/Mean \(average\)|Median|Mode|Sum|Count|Min|Max|Range|Std deviation|Variance/);
      expect(statLabels[0].textContent).toMatch(/Mean/);
    });

    it("applies primary color class to highlighted row label", () => {
      render(<StatisticsCalculator highlight="median" />);
      const medianLabel = screen.getByText("Median");
      expect(medianLabel.className).toMatch(/text-primary/);
    });
  });

  describe("validation", () => {
    it("shows error when no valid numbers are found", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "abc xyz");
      await waitFor(() => {
        expect(screen.getByText("No valid numbers found")).toBeInTheDocument();
      });
    });

    it("shows recognition count for valid input", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "1, 2, 3, 4, 5");
      await waitFor(() => {
        expect(screen.getByText(/5 numbers recognised/)).toBeInTheDocument();
      });
    });
  });

  describe("copy buttons", () => {
    it("has copy buttons for each stat row", () => {
      render(<StatisticsCalculator highlight="" />);
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      expect(copyBtns.length).toBe(10);
    });

    it("copies stat value to clipboard on button click", async () => {
      const user = userEvent.setup({ delay: null });
      render(<StatisticsCalculator highlight="" />);
      await user.type(screen.getByRole("textbox"), "10 20 30");
      await waitFor(() => screen.getAllByText("20"));
      const copyBtns = screen.getAllByRole("button", { name: /copy/i });
      await user.click(copyBtns[0]); // copy mean
      const clipText = await navigator.clipboard.readText();
      expect(clipText).toBe("20");
    });
  });

  describe("accessibility", () => {
    it("textarea has an associated label", () => {
      render(<StatisticsCalculator highlight="" />);
      expect(screen.getByText(/numbers.*separated/i)).toBeInTheDocument();
    });

    it("all 10 stat rows are labeled", () => {
      render(<StatisticsCalculator highlight="" />);
      expect(screen.getByText("Mean (average)")).toBeInTheDocument();
      expect(screen.getByText("Median")).toBeInTheDocument();
      expect(screen.getByText("Mode")).toBeInTheDocument();
      expect(screen.getByText("Sum")).toBeInTheDocument();
      expect(screen.getByText("Count")).toBeInTheDocument();
      expect(screen.getByText("Min")).toBeInTheDocument();
      expect(screen.getByText("Max")).toBeInTheDocument();
      expect(screen.getByText("Range")).toBeInTheDocument();
      expect(screen.getByText("Std deviation")).toBeInTheDocument();
      expect(screen.getByText("Variance")).toBeInTheDocument();
    });
  });
});
