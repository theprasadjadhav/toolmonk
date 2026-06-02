import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrimeCheckerCalculator } from "@/components/tools/calculators/PrimeCheckerCalculator";

describe("PrimeCheckerCalculator", () => {
  describe("prime detection", () => {
    it("identifies 2 as prime", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "2");
      await waitFor(() => {
        expect(screen.getByText("PRIME")).toBeInTheDocument();
      });
    });

    it("identifies 97 as prime", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "97");
      await waitFor(() => {
        expect(screen.getByText("PRIME")).toBeInTheDocument();
      });
    });

    it("identifies 1 as neither prime nor composite", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "1");
      await waitFor(() => {
        expect(screen.getByText(/neither prime nor composite/i)).toBeInTheDocument();
      });
    });

    it("identifies 4 as composite", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "4");
      await waitFor(() => {
        expect(screen.getByText("COMPOSITE")).toBeInTheDocument();
      });
    });

    it("identifies 100 as composite", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "100");
      await waitFor(() => {
        expect(screen.getByText("COMPOSITE")).toBeInTheDocument();
      });
    });

    it("shows ordinal index for prime number", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "2");
      await waitFor(() => {
        // 2 is the 1st prime
        expect(screen.getByText(/1st prime number/)).toBeInTheDocument();
      });
    });

    it("shows correct index for 97 (25th prime)", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "97");
      await waitFor(() => {
        expect(screen.getByText(/25th prime number/)).toBeInTheDocument();
      });
    });
  });

  describe("prime factorization", () => {
    it("shows factorization for composite number 12 = 2^2 x 3", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "12");
      await waitFor(() => {
        expect(screen.getByText(/12 = 2\^2 x 3/)).toBeInTheDocument();
      });
    });

    it("shows divisors for composite number", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "12");
      await waitFor(() => {
        expect(screen.getByText(/all divisors/i)).toBeInTheDocument();
        // divisors of 12: 1, 2, 3, 4, 6, 12
        expect(screen.getByText("1, 2, 3, 4, 6, 12")).toBeInTheDocument();
      });
    });

    it("shows 'is prime' text instead of factorization for prime", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "7");
      await waitFor(() => {
        expect(screen.getByText("7 is prime")).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error for non-positive integer", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "-5");
      await waitFor(() => {
        expect(screen.getByText(/Enter a positive integer/)).toBeInTheDocument();
      });
    });

    it("shows error for decimal input", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "3.5");
      await waitFor(() => {
        expect(screen.getByText(/Enter a positive integer/)).toBeInTheDocument();
      });
    });

    it("shows error for number above max", async () => {
      const user = userEvent.setup();
      render(<PrimeCheckerCalculator />);
      await user.type(screen.getByRole("spinbutton"), "10000001");
      await waitFor(() => {
        expect(screen.getByText(/Max 10,000,000/)).toBeInTheDocument();
      });
    });

    it("shows nothing when input is empty", () => {
      render(<PrimeCheckerCalculator />);
      expect(screen.queryByText("PRIME")).not.toBeInTheDocument();
      expect(screen.queryByText("COMPOSITE")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("input has a label", () => {
      render(<PrimeCheckerCalculator />);
      expect(screen.getByText(/positive integer/i)).toBeInTheDocument();
    });
  });
});
