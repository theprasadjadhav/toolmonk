import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PermCombCalculator } from "@/components/tools/calculators/PermCombCalculator";

describe("PermCombCalculator — permutation mode", () => {
  describe("business logic", () => {
    it("computes P(5, 2) = 20", async () => {
      const user = userEvent.setup();
      render(<PermCombCalculator mode="permutation" />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "5");
      await user.type(inputs[1], "2");
      await waitFor(() => {
        expect(screen.getByText("20")).toBeInTheDocument();
      });
    });

    it("computes P(10, 3) = 720", async () => {
      const user = userEvent.setup();
      render(<PermCombCalculator mode="permutation" />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "10");
      await user.type(inputs[1], "3");
      await waitFor(() => {
        expect(screen.getByText("720")).toBeInTheDocument();
      });
    });

    it("computes P(n, 0) = 1 for any n", async () => {
      const user = userEvent.setup();
      render(<PermCombCalculator mode="permutation" />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "7");
      await user.type(inputs[1], "0");
      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
      });
    });

    it("computes P(n, n) = n!", async () => {
      const user = userEvent.setup();
      render(<PermCombCalculator mode="permutation" />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "4");
      await user.type(inputs[1], "4");
      await waitFor(() => {
        expect(screen.getByText("24")).toBeInTheDocument(); // 4! = 24
      });
    });

    it("shows step lines", async () => {
      const user = userEvent.setup();
      render(<PermCombCalculator mode="permutation" />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "5");
      await user.type(inputs[1], "2");
      await waitFor(() => {
        expect(screen.getByText(/P\(n, r\) = n! \/ \(n − r\)!/)).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error when r > n", async () => {
      const user = userEvent.setup();
      render(<PermCombCalculator mode="permutation" />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "3");
      await user.type(inputs[1], "5");
      await waitFor(() => {
        expect(screen.getByText(/r cannot be greater than n/)).toBeInTheDocument();
      });
    });

    it("shows error for negative r", async () => {
      const user = userEvent.setup();
      render(<PermCombCalculator mode="permutation" />);
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "5");
      await user.type(inputs[1], "-1");
      await waitFor(() => {
        expect(screen.getByText(/n and r must be non-negative/)).toBeInTheDocument();
      });
    });

    it("shows dash when empty", () => {
      render(<PermCombCalculator mode="permutation" />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });
});

describe("PermCombCalculator — combination mode", () => {
  it("computes C(5, 2) = 10", async () => {
    const user = userEvent.setup();
    render(<PermCombCalculator mode="combination" />);
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "5");
    await user.type(inputs[1], "2");
    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument();
    });
  });

  it("computes C(10, 3) = 120", async () => {
    const user = userEvent.setup();
    render(<PermCombCalculator mode="combination" />);
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "10");
    await user.type(inputs[1], "3");
    await waitFor(() => {
      expect(screen.getByText("120")).toBeInTheDocument();
    });
  });

  it("computes C(n, 0) = 1", async () => {
    const user = userEvent.setup();
    render(<PermCombCalculator mode="combination" />);
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "8");
    await user.type(inputs[1], "0");
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("C(n, r) == C(n, n-r) symmetry", async () => {
    const user = userEvent.setup();
    render(<PermCombCalculator mode="combination" />);
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "6");
    await user.type(inputs[1], "2");
    await waitFor(() => {
      expect(screen.getByText("15")).toBeInTheDocument(); // C(6,2)=C(6,4)=15
    });
  });

  it("shows Combinations in heading", () => {
    render(<PermCombCalculator mode="combination" />);
    expect(screen.getByText(/Combinations/)).toBeInTheDocument();
  });

  describe("accessibility", () => {
    it("has labels for n and r inputs", () => {
      render(<PermCombCalculator mode="combination" />);
      expect(screen.getByText(/n \(total items/i)).toBeInTheDocument();
      expect(screen.getByText(/r \(items chosen\)/i)).toBeInTheDocument();
    });
  });
});
