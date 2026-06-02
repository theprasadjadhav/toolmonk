import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoremIpsumGenerator } from "@/components/tools/text-tools/LoremIpsumGenerator";
import { clearClipboard, expectCopied } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("LoremIpsumGenerator", () => {
  describe("rendering", () => {
    it("renders mode selection buttons", () => {
      render(<LoremIpsumGenerator />);
      expect(screen.getByRole("button", { name: /^words$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^sentences$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^paragraphs$/i })).toBeInTheDocument();
    });

    it("renders count input with default value of 3", () => {
      render(<LoremIpsumGenerator />);
      const countInput = screen.getByRole("spinbutton");
      expect(countInput).toHaveValue(3);
    });

    it("renders a Generate button", () => {
      render(<LoremIpsumGenerator />);
      expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
    });

    it("does not show output textarea initially", () => {
      render(<LoremIpsumGenerator />);
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });

  describe("generating paragraphs (default mode)", () => {
    it("generates non-empty output after clicking Generate", async () => {
      const user = userEvent.setup();
      render(<LoremIpsumGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
      const output = screen.getByRole("textbox");
      expect((output as HTMLTextAreaElement).value.length).toBeGreaterThan(0);
    });
  });

  describe("generating words", () => {
    it("generates words when Words mode is selected", async () => {
      const user = userEvent.setup();
      render(<LoremIpsumGenerator />);
      await user.click(screen.getByRole("button", { name: /^words$/i }));
      // Set count to 5
      const countInput = screen.getByRole("spinbutton");
      await user.clear(countInput);
      await user.type(countInput, "5");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
      const output = screen.getByRole("textbox") as HTMLTextAreaElement;
      const wordCount = output.value.trim().split(/\s+/).length;
      expect(wordCount).toBe(5);
    });
  });

  describe("paragraph count control", () => {
    it("generates 1 paragraph when count is set to 1", async () => {
      const user = userEvent.setup();
      render(<LoremIpsumGenerator />);
      const countInput = screen.getByRole("spinbutton");
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
      const output = screen.getByRole("textbox") as HTMLTextAreaElement;
      // 1 paragraph = no double newline
      const paragraphs = output.value.split(/\n\n/).filter(Boolean);
      expect(paragraphs).toHaveLength(1);
    });

    it("generates 2 paragraphs when count is set to 2", async () => {
      const user = userEvent.setup();
      render(<LoremIpsumGenerator />);
      const countInput = screen.getByRole("spinbutton");
      await user.clear(countInput);
      await user.type(countInput, "2");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
      const output = screen.getByRole("textbox") as HTMLTextAreaElement;
      const paragraphs = output.value.split(/\n\n/).filter(Boolean);
      expect(paragraphs).toHaveLength(2);
    });
  });

  describe("validation", () => {
    it("disables Generate button when count is empty", async () => {
      const user = userEvent.setup();
      render(<LoremIpsumGenerator />);
      const countInput = screen.getByRole("spinbutton");
      await user.clear(countInput);
      expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
    });

    it("shows error message when count is out of range", async () => {
      const user = userEvent.setup();
      render(<LoremIpsumGenerator />);
      const countInput = screen.getByRole("spinbutton");
      await user.clear(countInput);
      await user.type(countInput, "999");
      expect(screen.getByText(/enter a number between/i)).toBeInTheDocument();
    });

    it("disables Generate button when count is out of range", async () => {
      const user = userEvent.setup();
      render(<LoremIpsumGenerator />);
      const countInput = screen.getByRole("spinbutton");
      await user.clear(countInput);
      await user.type(countInput, "999");
      expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
    });

    it("clears output when mode changes", async () => {
      const user = userEvent.setup();
      render(<LoremIpsumGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
      // Switch modes — output should clear
      await user.click(screen.getByRole("button", { name: /^words$/i }));
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });

  describe("copy behavior", () => {
    it("copies generated output to clipboard", async () => {
      const user = userEvent.setup();
      render(<LoremIpsumGenerator />);
      // Generate with 1 paragraph for predictable output check
      const countInput = screen.getByRole("spinbutton");
      await user.clear(countInput);
      await user.type(countInput, "1");
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
      const output = screen.getByRole("textbox") as HTMLTextAreaElement;
      const outputValue = output.value;

      const copyBtn = screen.getByRole("button", { name: /^copy$/i });
      await user.click(copyBtn);
      await expectCopied(outputValue);
    });

    it("shows 'copied!' after clicking copy", async () => {
      const user = userEvent.setup();
      render(<LoremIpsumGenerator />);
      await user.click(screen.getByRole("button", { name: /generate/i }));
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
      await user.click(screen.getByRole("button", { name: /^copy$/i }));
      expect(screen.getByRole("button", { name: /copied!/i })).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has label for the count input", () => {
      render(<LoremIpsumGenerator />);
      expect(screen.getByText(/number of paragraphs/i)).toBeInTheDocument();
    });

    it("has label for the generate-by section", () => {
      render(<LoremIpsumGenerator />);
      expect(screen.getByText(/generate by/i)).toBeInTheDocument();
    });
  });
});
