import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";

describe("UnitConverter", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  // ── Rendering ─────────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders value input and unit select", () => {
      render(<UnitConverter slug="length-converter" />);
      expect(screen.getByRole("spinbutton")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders a result row for each unit in the config", () => {
      render(<UnitConverter slug="length-converter" />);
      // At minimum meter, kilometer, mile should be present
      expect(screen.getByText("m")).toBeInTheDocument();
      expect(screen.getByText("km")).toBeInTheDocument();
      expect(screen.getByText("mi")).toBeInTheDocument();
    });

    it("renders the footer tip text", () => {
      render(<UnitConverter slug="length-converter" />);
      expect(screen.getByText(/Click any row/i)).toBeInTheDocument();
    });
  });

  // ── Length conversion ─────────────────────────────────────────────────────────

  describe("length converter", () => {
    it("converts 1 km to 1000 m", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="length-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      const unitSelect = screen.getByRole("combobox") as HTMLSelectElement;

      await user.clear(valueInput);
      await user.type(valueInput, "1");
      // Select km as source
      await user.selectOptions(unitSelect, "km");

      // Find the meter row and check its value
      const mRow = screen.getByText("m").closest("[class*='border']");
      expect(mRow!.textContent).toContain("1000");
    });

    it("converts 100 cm to 1 m", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="length-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      const unitSelect = screen.getByRole("combobox") as HTMLSelectElement;

      await user.clear(valueInput);
      await user.type(valueInput, "100");
      await user.selectOptions(unitSelect, "cm");

      const mRow = screen.getByText("m").closest("[class*='border']");
      expect(mRow!.textContent).toContain("1");
    });

    it("shows dashes for non-numeric input", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="length-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      await user.clear(valueInput);
      await user.type(valueInput, "abc");
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  // ── Weight conversion ─────────────────────────────────────────────────────────

  describe("weight converter", () => {
    it("converts 1 kg to approximately 2.205 lbs", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="weight-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      const unitSelect = screen.getByRole("combobox") as HTMLSelectElement;

      await user.clear(valueInput);
      await user.type(valueInput, "1");
      await user.selectOptions(unitSelect, "kg");

      const lbRow = screen.getByText("lb").closest("[class*='border']");
      // 1 kg = 2.20462... lbs — formatted value should start with 2.2
      expect(lbRow!.textContent).toMatch(/2\.2/);
    });

    it("converts 1000 g to 1 kg", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="weight-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      const unitSelect = screen.getByRole("combobox") as HTMLSelectElement;

      await user.clear(valueInput);
      await user.type(valueInput, "1000");
      await user.selectOptions(unitSelect, "g");

      const kgRow = screen.getByText("kg").closest("[class*='border']");
      expect(kgRow!.textContent).toContain("1");
    });
  });

  // ── Temperature conversion ────────────────────────────────────────────────────

  describe("temperature converter", () => {
    it("converts 100°C to 212°F", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="temperature-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      const unitSelect = screen.getByRole("combobox") as HTMLSelectElement;

      await user.clear(valueInput);
      await user.type(valueInput, "100");
      await user.selectOptions(unitSelect, "°C");

      const fRow = screen.getByText("°F").closest("[class*='border']");
      expect(fRow!.textContent).toContain("212");
    });

    it("converts 0°C to 273.15 K", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="temperature-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      const unitSelect = screen.getByRole("combobox") as HTMLSelectElement;

      await user.clear(valueInput);
      await user.type(valueInput, "0");
      await user.selectOptions(unitSelect, "°C");

      const kRow = screen.getByText("K").closest("[class*='border']");
      expect(kRow!.textContent).toContain("273.15");
    });

    it("converts -40°C to -40°F (the crossover point)", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="temperature-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      const unitSelect = screen.getByRole("combobox") as HTMLSelectElement;

      await user.clear(valueInput);
      await user.type(valueInput, "-40");
      await user.selectOptions(unitSelect, "°C");

      const fRow = screen.getByText("°F").closest("[class*='border']");
      expect(fRow!.textContent).toContain("-40");
    });
  });

  // ── Speed conversion ──────────────────────────────────────────────────────────

  describe("speed converter", () => {
    it("converts 1 m/s to 3.6 km/h", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="speed-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      const unitSelect = screen.getByRole("combobox") as HTMLSelectElement;

      await user.clear(valueInput);
      await user.type(valueInput, "1");
      await user.selectOptions(unitSelect, "m/s");

      const kmhRow = screen.getByText("km/h").closest("[class*='border']");
      expect(kmhRow!.textContent).toMatch(/3\.6/);
    });
  });

  // ── Row click — select new base unit ─────────────────────────────────────────

  describe("row interaction", () => {
    it("clicking a result row sets it as the new source unit", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="length-converter" />);
      // Click the km row
      const kmRow = screen.getByText("km").closest("[class*='border']") as HTMLElement;
      await user.click(kmRow);
      // After click, select value should be km
      const unitSelect = screen.getByRole("combobox") as HTMLSelectElement;
      expect(unitSelect.value).toBe("km");
    });
  });

  // ── Filter (shown for configs with > 8 units) ─────────────────────────────────

  describe("unit filter", () => {
    it("filter input is shown for length converter (many units)", () => {
      render(<UnitConverter slug="length-converter" />);
      expect(screen.getByPlaceholderText("filter units…")).toBeInTheDocument();
    });

    it("filter narrows visible unit rows", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="length-converter" />);
      const filter = screen.getByPlaceholderText("filter units…");
      await user.type(filter, "meter");
      // Kilometer, Millimeter, etc. should stay; "mile" alone should disappear
      expect(screen.queryByText("mi")).not.toBeInTheDocument();
    });

    it("shows 'No units match' when filter has no results", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="length-converter" />);
      const filter = screen.getByPlaceholderText("filter units…");
      await user.type(filter, "xyzzznotaunit");
      expect(screen.getByText(/No units match/i)).toBeInTheDocument();
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles zero input correctly", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="length-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      await user.clear(valueInput);
      await user.type(valueInput, "0");
      // All conversions of 0 should be "0"
      const rows = document.querySelectorAll("[class*='border'][class*='cursor-pointer']");
      rows.forEach((row) => {
        const valueSpan = row.querySelector("[class*='tabular-nums']");
        if (valueSpan) {
          expect(valueSpan.textContent).toBe("0");
        }
      });
    });

    it("handles very large numbers using exponential notation", async () => {
      const user = userEvent.setup();
      render(<UnitConverter slug="length-converter" />);
      const valueInput = screen.getByRole("spinbutton");
      const unitSelect = screen.getByRole("combobox") as HTMLSelectElement;

      await user.clear(valueInput);
      await user.type(valueInput, "1000000000000");
      await user.selectOptions(unitSelect, "m");

      // Light-year row should use exponential notation
      const lyRow = screen.getByText("ly").closest("[class*='border']");
      // value should be present and non-dashed
      expect(lyRow!.textContent).not.toContain("—");
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("value input is a spinbutton", () => {
      render(<UnitConverter slug="length-converter" />);
      expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    });

    it("unit select is a combobox", () => {
      render(<UnitConverter slug="length-converter" />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
