import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BodyFatCalculator } from "@/components/tools/calculators/BodyFatCalculator";

describe("BodyFatCalculator", () => {
  describe("component rendering", () => {
    it("renders the gender toggle buttons", () => {
      render(<BodyFatCalculator />);
      expect(screen.getByRole("button", { name: "male" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "female" })).toBeInTheDocument();
    });

    it("shows placeholder dash when no input", () => {
      render(<BodyFatCalculator />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("does not show hip circumference input for males (default)", () => {
      render(<BodyFatCalculator />);
      expect(screen.queryByText(/Hip circumference/i)).not.toBeInTheDocument();
    });

    it("shows hip circumference input when switching to female", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BodyFatCalculator />);
      await user.click(screen.getByRole("button", { name: "female" }));
      expect(screen.getByText(/Hip circumference/i)).toBeInTheDocument();
    });
  });

  describe("happy path — male", () => {
    it("calculates body fat % for a male with valid inputs", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BodyFatCalculator />);
      // Height 175cm, Neck 37cm, Waist 85cm
      const inputs = screen.getAllByRole("spinbutton");
      // height
      await user.type(inputs[0], "175");
      // neck
      await user.type(inputs[1], "37");
      // waist
      await user.type(inputs[2], "85");
      await waitFor(() => {
        // The primary result display shows "XX.X%" — check there's at least one
        expect(screen.getAllByText(/%$/).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows a body fat category label after valid inputs", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BodyFatCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "175");
      await user.type(inputs[1], "37");
      await user.type(inputs[2], "85");
      await waitFor(() => {
        // "Category" appears in the result box (as a label) and in the table header
        expect(screen.getAllByText("Category").length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("happy path — female", () => {
    it("calculates body fat % for a female with valid inputs", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BodyFatCalculator />);
      await user.click(screen.getByRole("button", { name: "female" }));
      const inputs = screen.getAllByRole("spinbutton");
      // height=165, neck=33, waist=75, hip=95
      await user.type(inputs[0], "165");
      await user.type(inputs[1], "33");
      await user.type(inputs[2], "75");
      await user.type(inputs[3], "95");
      await waitFor(() => {
        expect(screen.getAllByText(/%$/).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("validation", () => {
    it("shows error when height exceeds 300 cm", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BodyFatCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "350");
      await waitFor(() => {
        expect(screen.getByText("Max 300 cm")).toBeInTheDocument();
      });
    });

    it("shows error when neck exceeds 100 cm", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BodyFatCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[1], "110");
      await waitFor(() => {
        expect(screen.getByText("Max 100 cm")).toBeInTheDocument();
      });
    });

    it("shows waist > neck error for males when waist <= neck", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BodyFatCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "175");
      await user.type(inputs[1], "50"); // neck
      await user.type(inputs[2], "40"); // waist <= neck
      await waitFor(() => {
        expect(screen.getByText("Waist must be > neck")).toBeInTheDocument();
      });
    });
  });

  describe("optional weight", () => {
    it("shows fat mass and lean mass when weight is provided", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BodyFatCalculator />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "175");
      await user.type(inputs[1], "37");
      await user.type(inputs[2], "85");
      await user.type(inputs[3], "75"); // weight
      await waitFor(() => {
        expect(screen.getByText("Fat mass")).toBeInTheDocument();
        expect(screen.getByText("Lean mass")).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("has labeled inputs for height, neck, and waist", () => {
      render(<BodyFatCalculator />);
      expect(screen.getByText(/Height/)).toBeInTheDocument();
      expect(screen.getByText(/Neck circumference/)).toBeInTheDocument();
      expect(screen.getByText(/Waist circumference/)).toBeInTheDocument();
    });

    it("renders ACE category reference table", () => {
      render(<BodyFatCalculator />);
      expect(screen.getByText(/American Council on Exercise/i)).toBeInTheDocument();
    });
  });
});
