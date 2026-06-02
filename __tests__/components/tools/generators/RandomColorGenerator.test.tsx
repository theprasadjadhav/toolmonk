import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RandomColorGenerator } from "@/components/tools/generators/RandomColorGenerator";
import { clearClipboard } from "@/__tests__/helpers/mocks";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const RGB_RE = /^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/;
const HSL_RE = /^hsl\(\d+, \d+%, \d+%\)$/;

beforeEach(() => {
  clearClipboard();
});

describe("RandomColorGenerator", () => {
  describe("initial render", () => {
    it("renders the generate button", () => {
      render(<RandomColorGenerator />);
      expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
    });

    it("renders format toggle buttons (hex, rgb, hsl)", () => {
      render(<RandomColorGenerator />);
      expect(screen.getByRole("button", { name: /^hex$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^rgb$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^hsl$/i })).toBeInTheDocument();
    });

    it("renders count, hue, saturation, and lightness inputs", () => {
      render(<RandomColorGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      // count + hueMin + hueMax + satMin + satMax + lightMin + lightMax = 7
      expect(spinbuttons.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe("generation — hex format (default)", () => {
    it("generates the configured count of colors", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(countInput);
      await user.type(countInput, "4");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const copyLabels = screen.getAllByText("copy");
      expect(copyLabels.length).toBe(4);
    });

    it("generates valid hex color strings", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(countInput);
      await user.type(countInput, "3");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      // All swatch buttons show a color value label; read them via their text
      // The label span is the first span inside each swatch card that isn't "copy"
      const swatchCards = document.querySelectorAll(".grid .overflow-hidden.text-left");
      expect(swatchCards.length).toBe(3);
      Array.from(swatchCards).forEach((card) => {
        const labelSpan = card.querySelector("span.font-mono");
        expect(labelSpan?.textContent).toMatch(HEX_RE);
      });
    });
  });

  describe("generation — rgb format", () => {
    it("generates valid rgb() color strings", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      await user.click(screen.getByRole("button", { name: /^rgb$/i }));
      const countInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(countInput);
      await user.type(countInput, "3");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const swatchCards = document.querySelectorAll(".grid .overflow-hidden.text-left");
      Array.from(swatchCards).forEach((card) => {
        const labelSpan = card.querySelector("span.font-mono");
        expect(labelSpan?.textContent).toMatch(RGB_RE);
      });
    });
  });

  describe("generation — hsl format", () => {
    it("generates valid hsl() color strings", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      await user.click(screen.getByRole("button", { name: /^hsl$/i }));
      const countInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(countInput);
      await user.type(countInput, "3");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const swatchCards = document.querySelectorAll(".grid .overflow-hidden.text-left");
      Array.from(swatchCards).forEach((card) => {
        const labelSpan = card.querySelector("span.font-mono");
        expect(labelSpan?.textContent).toMatch(HSL_RE);
      });
    });
  });

  describe("validation", () => {
    it("shows count error when count is below 1", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(countInput);
      await user.type(countInput, "0");
      expect(screen.getByText("Min 1")).toBeInTheDocument();
    });

    it("shows count error when count exceeds 100", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(countInput);
      await user.type(countInput, "101");
      expect(screen.getByText("Max 100")).toBeInTheDocument();
    });

    it("shows hue range error when min > max", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      // hueMin is index 1, hueMax is index 2
      await user.clear(spinbuttons[1]);
      await user.type(spinbuttons[1], "300");
      await user.clear(spinbuttons[2]);
      await user.type(spinbuttons[2], "100");
      expect(screen.getByText(/hue range 0–360, min ≤ max/i)).toBeInTheDocument();
    });

    it("shows saturation error when min > max", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      // satMin is index 3, satMax is index 4
      await user.clear(spinbuttons[3]);
      await user.type(spinbuttons[3], "90");
      await user.clear(spinbuttons[4]);
      await user.type(spinbuttons[4], "10");
      expect(screen.getByText(/saturation range 0–100, min ≤ max/i)).toBeInTheDocument();
    });

    it("shows lightness error when min > max", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      const spinbuttons = screen.getAllByRole("spinbutton");
      // lightMin is index 5, lightMax is index 6
      await user.clear(spinbuttons[5]);
      await user.type(spinbuttons[5], "80");
      await user.clear(spinbuttons[6]);
      await user.type(spinbuttons[6], "20");
      expect(screen.getByText(/lightness range 0–100, min ≤ max/i)).toBeInTheDocument();
    });

    it("disables generate button when validation fails", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(countInput);
      await user.type(countInput, "0");
      expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
    });
  });

  describe("copy functionality", () => {
    it("copies a single color value to clipboard when a swatch is clicked", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      // The swatch card is a button; find it and read the label text
      const swatchCard = document.querySelector(".overflow-hidden.text-left") as HTMLButtonElement;
      expect(swatchCard).toBeTruthy();
      const labelSpan = swatchCard.querySelector("span.font-mono");
      const colorText = labelSpan?.textContent ?? "";
      await user.click(swatchCard);
      const copied = await navigator.clipboard.readText();
      expect(copied).toBe(colorText);
    });

    it("shows copy all button and copies all colors joined by newlines", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      const countInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(countInput);
      await user.type(countInput, "3");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      const copyAllBtn = screen.getByRole("button", { name: /copy all/i });
      expect(copyAllBtn).toBeInTheDocument();
      await user.click(copyAllBtn);
      const copied = await navigator.clipboard.readText();
      expect(copied.split("\n").length).toBe(3);
    });
  });

  describe("regenerate", () => {
    it("produces colors on multiple generate clicks", async () => {
      const user = userEvent.setup();
      render(<RandomColorGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(screen.getAllByText("copy").length).toBeGreaterThan(0);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      expect(screen.getAllByText("copy").length).toBeGreaterThan(0);
    });
  });

  describe("accessibility", () => {
    it("count input has a label", () => {
      render(<RandomColorGenerator />);
      expect(screen.getByText(/— count \(1–100\)/i)).toBeInTheDocument();
    });

    it("format section has a label", () => {
      render(<RandomColorGenerator />);
      expect(screen.getByText(/— output format/i)).toBeInTheDocument();
    });

    it("hue range input has a label", () => {
      render(<RandomColorGenerator />);
      expect(screen.getByText(/— hue range \(0–360\)/i)).toBeInTheDocument();
    });
  });
});
