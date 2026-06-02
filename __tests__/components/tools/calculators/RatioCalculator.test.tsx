import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatioCalculator } from "@/components/tools/calculators/RatioCalculator";

describe("RatioCalculator", () => {
  describe("mode: simplify", () => {
    it("simplifies 6:4 to 3:2", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RatioCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "6");
      await user.type(inputs[1], "4");
      await waitFor(() => {
        expect(screen.getByText("3 : 2")).toBeInTheDocument();
      });
    });

    it("simplifies 10:5 to 2:1", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RatioCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "10");
      await user.type(inputs[1], "5");
      await waitFor(() => {
        expect(screen.getByText("2 : 1")).toBeInTheDocument();
      });
    });

    it("shows decimal form", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RatioCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "3");
      await user.type(inputs[1], "2");
      await waitFor(() => {
        expect(screen.getByText("Decimal form")).toBeInTheDocument();
        expect(screen.getAllByText("1.5").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows unit ratio", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RatioCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "3");
      await user.type(inputs[1], "6");
      await waitFor(() => {
        expect(screen.getByText("Unit ratio")).toBeInTheDocument();
        // "1 : 2" appears as unit ratio value
        expect(screen.getAllByText("1 : 2").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows error when A <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RatioCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "0");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });

    it("shows error when B <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RatioCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "5");
      await user.type(inputs[1], "-2");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });
  });

  describe("mode: proportion", () => {
    it("solves A:B = C:D for unknown D", async () => {
      // 2:3 = 4:? → D = 6
      const user = userEvent.setup({ delay: null });
      render(<RatioCalculator />);
      await user.click(screen.getByRole("button", { name: "Proportion" }));
      const inputs = screen.getAllByRole("spinbutton");
      // A, B, C are known; D is unknown by default
      await user.type(inputs[0], "2"); // A
      await user.type(inputs[1], "3"); // B
      await user.type(inputs[2], "4"); // C
      // D is read-only (unknown)
      await waitFor(() => {
        expect(screen.getAllByDisplayValue("6").length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("mode: scale", () => {
    it("scales ratio 2:3 by factor 4 = 8:12", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RatioCalculator />);
      await user.click(screen.getByRole("button", { name: "Scale" }));
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "2");
      await user.type(inputs[1], "3");
      await user.type(inputs[2], "4");
      await waitFor(() => {
        expect(screen.getByText("8")).toBeInTheDocument();
        expect(screen.getByText("12")).toBeInTheDocument();
      });
    });

    it("shows error when scale ratio A <= 0", async () => {
      const user = userEvent.setup({ delay: null });
      render(<RatioCalculator />);
      await user.click(screen.getByRole("button", { name: "Scale" }));
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "-1");
      await waitFor(() => {
        expect(screen.getByText("Must be > 0")).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("has mode tab buttons", () => {
      render(<RatioCalculator />);
      expect(screen.getByRole("button", { name: "Simplify" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Proportion" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Scale" })).toBeInTheDocument();
    });
  });
});
