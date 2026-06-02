import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextReverser } from "@/components/tools/text-tools/TextReverser";
import { clearClipboard, expectCopied } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("TextReverser", () => {
  describe("rendering", () => {
    it("renders input and output textareas", () => {
      render(<TextReverser />);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(2);
    });

    it("renders mode selection buttons", () => {
      render(<TextReverser />);
      expect(screen.getByRole("button", { name: /characters/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /words/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /lines/i })).toBeInTheDocument();
    });

    it("shows empty output initially", () => {
      render(<TextReverser />);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("");
    });
  });

  describe("character reversal (default mode)", () => {
    it("reverses 'hello' to 'olleh'", async () => {
      const user = userEvent.setup();
      render(<TextReverser />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("olleh");
    });

    it("reverses 'abc' to 'cba'", async () => {
      const user = userEvent.setup();
      render(<TextReverser />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "abc");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("cba");
    });

    it("reverses a sentence character by character", async () => {
      const user = userEvent.setup();
      render(<TextReverser />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello world");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("dlrow olleh");
    });
  });

  describe("word reversal mode", () => {
    it("reverses word order", async () => {
      const user = userEvent.setup();
      render(<TextReverser />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "one two three");
      await user.click(screen.getByRole("button", { name: /words/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("three two one");
    });
  });

  describe("line reversal mode", () => {
    it("reverses line order", async () => {
      const user = userEvent.setup();
      render(<TextReverser />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      // Paste multi-line text
      await user.click(inputTextarea);
      await user.paste("alpha\nbeta\ngamma");
      await user.click(screen.getByRole("button", { name: /lines/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("gamma\nbeta\nalpha");
    });
  });

  describe("live update", () => {
    it("updates output as user types", async () => {
      const user = userEvent.setup();
      render(<TextReverser />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hi");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("ih");
    });

    it("shows empty output when input is cleared", async () => {
      const user = userEvent.setup();
      render(<TextReverser />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello");
      await user.clear(inputTextarea);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("");
    });
  });

  describe("copy behavior", () => {
    it("copies reversed text to clipboard", async () => {
      const user = userEvent.setup();
      render(<TextReverser />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello");
      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await user.click(copyBtn);
      await expectCopied("olleh");
    });

    it("does not show copy button when output is empty", () => {
      render(<TextReverser />);
      expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has label for input", () => {
      render(<TextReverser />);
      expect(screen.getByText(/input text/i)).toBeInTheDocument();
    });

    it("has label for result", () => {
      render(<TextReverser />);
      expect(screen.getByText(/result/i)).toBeInTheDocument();
    });
  });
});
