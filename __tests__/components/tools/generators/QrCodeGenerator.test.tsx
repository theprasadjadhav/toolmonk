import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QrCodeGenerator } from "@/components/tools/generators/QrCodeGenerator";

// Mock qr-code-styling — the component dynamically imports it
// We use a shared instance tracker so we can inspect method calls
const appendSpy = vi.fn();
const updateSpy = vi.fn();
const downloadSpy = vi.fn();

vi.mock("qr-code-styling", () => {
  // Must use a real constructor function/class so `new QRCodeStyling(...)` works
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function MockQRCodeStyling(this: any, _opts: unknown) {
    this._opts = _opts;
  }
  MockQRCodeStyling.prototype.append = function (...args: unknown[]) {
    return appendSpy(...args);
  };
  MockQRCodeStyling.prototype.update = function (...args: unknown[]) {
    return updateSpy(...args);
  };
  MockQRCodeStyling.prototype.download = function (...args: unknown[]) {
    return downloadSpy(...args);
  };
  return { default: MockQRCodeStyling };
});

// Convenience alias matching original test names
const mockQrInstance = {
  get append() { return appendSpy; },
  get update() { return updateSpy; },
  get download() { return downloadSpy; },
};

beforeEach(() => {
  appendSpy.mockClear();
  updateSpy.mockClear();
  downloadSpy.mockClear();
});

describe("QrCodeGenerator", () => {
  describe("initial render", () => {
    it("renders the content text input", () => {
      render(<QrCodeGenerator />);
      // Multiple textboxes exist (content + color hex inputs) — query by placeholder
      expect(screen.getByPlaceholderText("https://example.com")).toBeInTheDocument();
    });

    it("pre-fills the content input with the default URL", () => {
      render(<QrCodeGenerator />);
      const input = screen.getByPlaceholderText("https://example.com") as HTMLInputElement;
      expect(input.value).toBe("https://example.com");
    });

    it("renders the size, margin, and error correction inputs", () => {
      render(<QrCodeGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThanOrEqual(2);
      // Error correction is a select (among multiple selects)
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });

    it("renders the preview container div", () => {
      render(<QrCodeGenerator />);
      expect(screen.getByText(/— preview/i)).toBeInTheDocument();
    });

    it("renders download PNG and SVG buttons", () => {
      render(<QrCodeGenerator />);
      expect(screen.getByRole("button", { name: /download png/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /download svg/i })).toBeInTheDocument();
    });

    it("renders preset style buttons", () => {
      render(<QrCodeGenerator />);
      expect(screen.getByRole("button", { name: /^Classic$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Dots$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Rounded$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Ocean$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Sunset$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Neon$/i })).toBeInTheDocument();
    });
  });

  describe("QRCodeStyling integration", () => {
    it("appends the QR code to the container on mount", async () => {
      render(<QrCodeGenerator />);
      await waitFor(() => {
        expect(mockQrInstance.append).toHaveBeenCalledOnce();
      });
    });

    it("calls update when the content text changes", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      // Wait for initial creation
      await waitFor(() => expect(mockQrInstance.append).toHaveBeenCalledOnce());

      const input = screen.getByPlaceholderText("https://example.com");
      await user.clear(input);
      await user.type(input, "https://new-url.com");

      await waitFor(() => {
        expect(mockQrInstance.update).toHaveBeenCalled();
        const lastCall =
          mockQrInstance.update.mock.calls[mockQrInstance.update.mock.calls.length - 1][0];
        expect(lastCall.data).toBe("https://new-url.com");
      });
    });

    it("calls update with new size when size input changes", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      await waitFor(() => expect(mockQrInstance.append).toHaveBeenCalledOnce());

      const sizeInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(sizeInput);
      await user.type(sizeInput, "400");

      await waitFor(() => {
        expect(mockQrInstance.update).toHaveBeenCalled();
        const lastCall =
          mockQrInstance.update.mock.calls[mockQrInstance.update.mock.calls.length - 1][0];
        expect(lastCall.width).toBe(400);
        expect(lastCall.height).toBe(400);
      });
    });
  });

  describe("content validation", () => {
    it("shows 'Content required' error when input is cleared", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      const input = screen.getByPlaceholderText("https://example.com");
      await user.clear(input);
      expect(screen.getByText("Content required")).toBeInTheDocument();
    });

    it("disables download buttons when content is empty", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      const input = screen.getByPlaceholderText("https://example.com");
      await user.clear(input);
      expect(screen.getByRole("button", { name: /download png/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /download svg/i })).toBeDisabled();
    });
  });

  describe("size validation", () => {
    it("shows error when size is below 50", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      const sizeInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(sizeInput);
      await user.type(sizeInput, "30");
      expect(screen.getByText("Min 50")).toBeInTheDocument();
    });

    it("shows error when size exceeds 2000", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      const sizeInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(sizeInput);
      await user.type(sizeInput, "2500");
      expect(screen.getByText("Max 2000")).toBeInTheDocument();
    });
  });

  describe("margin validation", () => {
    it("shows error when margin is negative", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      const marginInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(marginInput);
      await user.type(marginInput, "-1");
      expect(screen.getByText("Min 0")).toBeInTheDocument();
    });

    it("shows error when margin exceeds 100", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      const marginInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(marginInput);
      await user.type(marginInput, "101");
      expect(screen.getByText("Max 100")).toBeInTheDocument();
    });
  });

  describe("error correction level", () => {
    it("renders all error correction levels", () => {
      render(<QrCodeGenerator />);
      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      const errorSelect = selects.find((s) =>
        Array.from(s.options).some((o) => o.text.includes("Low") || o.text.includes("Medium")),
      )!;
      expect(errorSelect).toBeTruthy();
      const values = Array.from(errorSelect.options).map((o) => o.value);
      expect(values).toContain("L");
      expect(values).toContain("M");
      expect(values).toContain("Q");
      expect(values).toContain("H");
    });

    it("passes the selected error level to QRCodeStyling on update", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      await waitFor(() => expect(mockQrInstance.append).toHaveBeenCalledOnce());

      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      const select = selects.find((s) =>
        Array.from(s.options).some((o) => o.text.includes("Low")),
      )!;
      await user.selectOptions(select, "H");

      await waitFor(() => {
        expect(mockQrInstance.update).toHaveBeenCalled();
        const lastCall =
          mockQrInstance.update.mock.calls[mockQrInstance.update.mock.calls.length - 1][0];
        expect(lastCall.qrOptions).toMatchObject({ errorCorrectionLevel: "H" });
      });
    });
  });

  describe("style presets", () => {
    it("applies Classic preset when clicked", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      await waitFor(() => expect(mockQrInstance.append).toHaveBeenCalledOnce(), { timeout: 3000 });
      // Apply Neon first to change state away from Classic defaults
      await user.click(screen.getByRole("button", { name: /^Neon$/i }));
      await waitFor(() => {
        expect(mockQrInstance.update).toHaveBeenCalled();
      }, { timeout: 3000 });
      updateSpy.mockClear();
      // Now apply Classic — this changes bgColor back to #ffffff
      await user.click(screen.getByRole("button", { name: /^Classic$/i }));
      await waitFor(() => {
        expect(mockQrInstance.update).toHaveBeenCalled();
        const lastCall =
          mockQrInstance.update.mock.calls[mockQrInstance.update.mock.calls.length - 1][0];
        expect(lastCall.backgroundOptions).toMatchObject({ color: "#ffffff" });
      }, { timeout: 3000 });
    });

    it("applies Neon preset with dark background", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      await waitFor(() => expect(mockQrInstance.append).toHaveBeenCalledOnce(), { timeout: 3000 });
      await user.click(screen.getByRole("button", { name: /^Neon$/i }));
      await waitFor(() => {
        expect(mockQrInstance.update).toHaveBeenCalled();
        const lastCall =
          mockQrInstance.update.mock.calls[mockQrInstance.update.mock.calls.length - 1][0];
        expect(lastCall.backgroundOptions).toMatchObject({ color: "#0a0a0a" });
      }, { timeout: 3000 });
    });
  });

  describe("dot style", () => {
    it("renders the dot style select", () => {
      render(<QrCodeGenerator />);
      // There are multiple selects: dot style, corner square style, corner dot style, error correction
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(4);
    });

    it("renders the gradient toggle button", () => {
      render(<QrCodeGenerator />);
      expect(screen.getByRole("button", { name: /gradient/i })).toBeInTheDocument();
    });

    it("shows gradient controls when gradient is enabled", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      await user.click(screen.getByRole("button", { name: /^gradient$/i }));
      // Gradient rotation input should appear (has title="rotation in degrees")
      expect(screen.getByTitle(/rotation in degrees/i)).toBeInTheDocument();
    });
  });

  describe("download", () => {
    it("calls qrRef.download with png when download PNG is clicked", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      await waitFor(() => expect(mockQrInstance.append).toHaveBeenCalledOnce());
      await user.click(screen.getByRole("button", { name: /download png/i }));
      expect(mockQrInstance.download).toHaveBeenCalledWith({ name: "qrcode", extension: "png" });
    });

    it("calls qrRef.download with svg when download SVG is clicked", async () => {
      const user = userEvent.setup();
      render(<QrCodeGenerator />);
      await waitFor(() => expect(mockQrInstance.append).toHaveBeenCalledOnce());
      await user.click(screen.getByRole("button", { name: /download svg/i }));
      expect(mockQrInstance.download).toHaveBeenCalledWith({ name: "qrcode", extension: "svg" });
    });
  });

  describe("center image", () => {
    it("renders the upload image label when no center image is set", () => {
      render(<QrCodeGenerator />);
      expect(screen.getByText(/upload image/i)).toBeInTheDocument();
    });

    it("shows tip about error correction H when image is uploaded and level is not H", async () => {
      render(<QrCodeGenerator />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeTruthy();

      const file = new File(["fake-image"], "logo.png", { type: "image/png" });

      // Mock FileReader using a proper class
      const originalFileReader = global.FileReader;
      const readAsDataURLMock = vi.fn(function (this: FileReader) {
        // Simulate async onload callback
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any).onload?.({ target: { result: "data:image/png;base64,AAAA" } });
        }, 0);
      });
      vi.spyOn(global, "FileReader").mockImplementation(function (this: FileReader) {
        this.readAsDataURL = readAsDataURLMock.bind(this);
        return this;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      Object.defineProperty(fileInput, "files", {
        value: [file],
        configurable: true,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText(/set error correction to H/i)).toBeInTheDocument();
      });

      // Restore original FileReader
      global.FileReader = originalFileReader;
    });
  });

  describe("accessibility", () => {
    it("content input has a label", () => {
      render(<QrCodeGenerator />);
      expect(screen.getByText(/— content/i)).toBeInTheDocument();
    });

    it("style presets section has a label", () => {
      render(<QrCodeGenerator />);
      expect(screen.getByText(/— style presets/i)).toBeInTheDocument();
    });

    it("error correction select has a label", () => {
      render(<QrCodeGenerator />);
      expect(screen.getByText(/— error correction/i)).toBeInTheDocument();
    });
  });
});
