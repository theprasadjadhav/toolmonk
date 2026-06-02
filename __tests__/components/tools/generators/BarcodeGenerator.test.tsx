import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BarcodeGenerator } from "@/components/tools/generators/BarcodeGenerator";

// Mock jsbarcode — the component dynamically imports it
vi.mock("jsbarcode", () => ({
  default: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

/** Get the barcode value text input (first textbox = the value input, not the color text inputs) */
function getValueInput() {
  return screen.getByPlaceholderText("Hello World 123") as HTMLInputElement;
}

describe("BarcodeGenerator", () => {
  describe("initial render", () => {
    it("renders the barcode format select", () => {
      render(<BarcodeGenerator />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders the value text input", () => {
      render(<BarcodeGenerator />);
      // Multiple textboxes exist (value input + 2 color hex inputs) — query by placeholder
      expect(screen.getByPlaceholderText("Hello World 123")).toBeInTheDocument();
    });

    it("pre-fills value with the default placeholder for Code 128", () => {
      render(<BarcodeGenerator />);
      const input = getValueInput();
      expect(input.value).toBe("Hello World 123");
    });

    it("renders an SVG element for the barcode preview", () => {
      render(<BarcodeGenerator />);
      expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("renders the download SVG button", () => {
      render(<BarcodeGenerator />);
      expect(screen.getByRole("button", { name: /download svg/i })).toBeInTheDocument();
    });

    it("renders bar width and height number inputs", () => {
      render(<BarcodeGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("format selection", () => {
    it("renders all barcode format options", () => {
      render(<BarcodeGenerator />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.value);
      expect(options).toContain("CODE128");
      expect(options).toContain("CODE39");
      expect(options).toContain("EAN13");
      expect(options).toContain("EAN8");
      expect(options).toContain("UPC");
      expect(options).toContain("ITF14");
      expect(options).toContain("MSI");
      expect(options).toContain("pharmacode");
    });

    it("updates the value input when format changes", async () => {
      const user = userEvent.setup();
      render(<BarcodeGenerator />);
      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "EAN13");
      // After selecting EAN13, the value is reset to the EAN13 placeholder
      const input = screen.getByPlaceholderText("012345678901") as HTMLInputElement;
      expect(input.value).toBe("012345678901");
    });
  });

  describe("value input", () => {
    it("updates the value when typed in", async () => {
      const user = userEvent.setup();
      render(<BarcodeGenerator />);
      const input = getValueInput();
      await user.clear(input);
      await user.type(input, "NEW123");
      expect(input.value).toBe("NEW123");
    });

    it("shows 'Value required' error when value is cleared", async () => {
      const user = userEvent.setup();
      render(<BarcodeGenerator />);
      const input = getValueInput();
      await user.clear(input);
      expect(screen.getByText("Value required")).toBeInTheDocument();
    });

    it("disables the download button when value is empty", async () => {
      const user = userEvent.setup();
      render(<BarcodeGenerator />);
      const input = getValueInput();
      await user.clear(input);
      expect(screen.getByRole("button", { name: /download svg/i })).toBeDisabled();
    });
  });

  describe("bar width and height validation", () => {
    it("shows error when bar width is below 1", async () => {
      const user = userEvent.setup();
      render(<BarcodeGenerator />);
      const widthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(widthInput);
      await user.type(widthInput, "0");
      expect(screen.getByText("Min 1")).toBeInTheDocument();
    });

    it("shows error when bar width exceeds 10", async () => {
      const user = userEvent.setup();
      render(<BarcodeGenerator />);
      const widthInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(widthInput);
      await user.type(widthInput, "11");
      expect(screen.getByText("Max 10")).toBeInTheDocument();
    });

    it("shows error when height is below 10", async () => {
      const user = userEvent.setup();
      render(<BarcodeGenerator />);
      const heightInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(heightInput);
      await user.type(heightInput, "5");
      expect(screen.getByText("Min 10")).toBeInTheDocument();
    });

    it("shows error when height exceeds 500", async () => {
      const user = userEvent.setup();
      render(<BarcodeGenerator />);
      const heightInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(heightInput);
      await user.type(heightInput, "600");
      expect(screen.getByText("Max 500")).toBeInTheDocument();
    });
  });

  describe("JsBarcode integration", () => {
    it("calls JsBarcode with the current value after mount", async () => {
      const JsBarcode = (await import("jsbarcode")).default;
      render(<BarcodeGenerator />);
      await waitFor(() => {
        expect(JsBarcode).toHaveBeenCalled();
      });
      const callArgs = (JsBarcode as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[1]).toBe("Hello World 123");
      expect(callArgs[2]).toMatchObject({ format: "CODE128" });
    });

    it("calls JsBarcode with updated value when input changes", async () => {
      const user = userEvent.setup();
      const JsBarcode = (await import("jsbarcode")).default;
      render(<BarcodeGenerator />);
      const input = getValueInput();
      await user.clear(input);
      await user.type(input, "ABC");
      await waitFor(() => {
        const calls = (JsBarcode as ReturnType<typeof vi.fn>).mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[1]).toBe("ABC");
      });
    });

    it("does not call JsBarcode when the value is empty", async () => {
      const user = userEvent.setup();
      const JsBarcode = (await import("jsbarcode")).default;
      render(<BarcodeGenerator />);
      const input = getValueInput();
      await user.clear(input);
      // After clear, wait briefly then check
      await waitFor(() => {
        const calls = (JsBarcode as ReturnType<typeof vi.fn>).mock.calls;
        // All calls should have been made before clearing
        calls.forEach((call) => {
          expect(call[1]).not.toBe("");
        });
      });
    });
  });

  describe("show text toggle", () => {
    it("renders the show text below barcode toggle", () => {
      render(<BarcodeGenerator />);
      expect(screen.getByRole("button", { name: /show text below barcode/i })).toBeInTheDocument();
    });

    it("toggles displayValue state when clicked", async () => {
      const user = userEvent.setup();
      render(<BarcodeGenerator />);
      const toggle = screen.getByRole("button", { name: /show text below barcode/i });
      // Starts active (displayValue=true shown by checkmark prefix)
      expect(toggle.textContent).toContain("✓");
      await user.click(toggle);
      expect(toggle.textContent).not.toContain("✓");
    });
  });

  describe("color inputs", () => {
    it("renders bar color and background color inputs", () => {
      render(<BarcodeGenerator />);
      // Two color-type inputs (bar color and background)
      const colorInputs = document.querySelectorAll('input[type="color"]');
      expect(colorInputs.length).toBe(2);
    });
  });

  describe("accessibility", () => {
    it("format select has a label", () => {
      render(<BarcodeGenerator />);
      expect(screen.getByText(/— barcode format/i)).toBeInTheDocument();
    });

    it("value input has a label", () => {
      render(<BarcodeGenerator />);
      expect(screen.getByText(/— value/i)).toBeInTheDocument();
    });

    it("preview section has a label", () => {
      render(<BarcodeGenerator />);
      expect(screen.getByText(/— preview/i)).toBeInTheDocument();
    });
  });
});
