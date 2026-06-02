import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrencyConverter } from "@/components/tools/converters/CurrencyConverter";
import { mockFetch } from "../../../helpers/mocks";

// Minimal exchange-rate response — USD base, EUR 0.92, GBP 0.79, JPY 150
const MOCK_RATES = {
  result: "success",
  time_last_update_utc: "Wed, 23 Apr 2026 00:02:12 +0000",
  rates: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150,
    CNY: 7.24,
    CHF: 0.9,
    CAD: 1.36,
    AUD: 1.52,
  },
};

describe("CurrencyConverter", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
    mockFetch(MOCK_RATES);
  });

  // ── Rendering ─────────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("shows loading state initially", () => {
      render(<CurrencyConverter />);
      expect(screen.getByText(/loading exchange rates/i)).toBeInTheDocument();
    });

    it("renders amount input", async () => {
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    });

    it("renders base currency select", async () => {
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("renders a results table after loading", async () => {
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      // Each currency row is clickable; at least EUR should appear
      expect(screen.getByText("EUR")).toBeInTheDocument();
      expect(screen.getByText("GBP")).toBeInTheDocument();
    });
  });

  // ── Conversion logic ──────────────────────────────────────────────────────────

  describe("conversion logic", () => {
    it("converts 1 USD to EUR correctly", async () => {
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      // 1 USD * (0.92 EUR/USD) = 0.92 EUR
      // The row for EUR should show 0.92
      const eurRow = screen.getByText("EUR").closest("[class*='border']");
      expect(eurRow).toBeTruthy();
      expect(eurRow!.textContent).toMatch(/0\.92/);
    });

    it("converts 1 USD to JPY correctly", async () => {
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      const jpyRow = screen.getByText("JPY").closest("[class*='border']");
      expect(jpyRow!.textContent).toMatch(/150/);
    });

    it("updates results when amount changes", async () => {
      const user = userEvent.setup();
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      const amountInput = screen.getByRole("spinbutton");
      await user.clear(amountInput);
      await user.type(amountInput, "2");
      // 2 USD → EUR = 1.84
      const eurRow = screen.getByText("EUR").closest("[class*='border']");
      expect(eurRow!.textContent).toMatch(/1\.84/);
    });

    it("shows dashes for non-numeric amount", async () => {
      const user = userEvent.setup();
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      const amountInput = screen.getByRole("spinbutton");
      await user.clear(amountInput);
      await user.type(amountInput, "abc");
      // All rows should show — for invalid
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThan(0);
    });

    it("clicking a currency row makes it the base currency", async () => {
      const user = userEvent.setup();
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      const eurRow = screen.getByText("EUR").closest("[class*='border']") as HTMLElement;
      await user.click(eurRow);
      // After clicking EUR row, the base select should show EUR
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("EUR");
    });
  });

  // ── Search filter ─────────────────────────────────────────────────────────────

  describe("currency search filter", () => {
    it("filters visible currencies by code", async () => {
      const user = userEvent.setup();
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      const filter = screen.getByPlaceholderText("filter currencies…");
      await user.type(filter, "EUR");
      expect(screen.getByText("EUR")).toBeInTheDocument();
      // GBP should be hidden
      expect(screen.queryByText("GBP")).not.toBeInTheDocument();
    });

    it("shows 'No currencies match' when filter has no results", async () => {
      const user = userEvent.setup();
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      const filter = screen.getByPlaceholderText("filter currencies…");
      await user.type(filter, "ZZZNOMATCH");
      expect(screen.getByText(/No currencies match/i)).toBeInTheDocument();
    });
  });

  // ── Error state ───────────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("shows error banner when fetch fails", async () => {
      mockFetch({}, false); // ok = false
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      expect(
        screen.getByText(/could not load exchange rates/i)
      ).toBeInTheDocument();
    });

    it("shows error banner when API returns non-success result", async () => {
      mockFetch({ result: "error" });
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      expect(
        screen.getByText(/exchange rate service returned an error/i)
      ).toBeInTheDocument();
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("amount input is accessible (spin button role)", async () => {
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    });

    it("base currency select is accessible", async () => {
      render(<CurrencyConverter />);
      await waitFor(() =>
        expect(screen.queryByText(/loading exchange rates/i)).not.toBeInTheDocument()
      );
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
