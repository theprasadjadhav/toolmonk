import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RemoveExtraSpaces } from "@/components/tools/text-tools/RemoveExtraSpaces";
import { clearClipboard, expectCopied } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("RemoveExtraSpaces", () => {
  describe("rendering", () => {
    it("renders input and output textareas", () => {
      render(<RemoveExtraSpaces />);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(2);
    });

    it("renders cleanup option toggles", () => {
      render(<RemoveExtraSpaces />);
      expect(screen.getByRole("button", { name: /collapse spaces/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /trim line edges/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /remove blank lines/i })).toBeInTheDocument();
    });

    it("shows empty output when input is empty", () => {
      render(<RemoveExtraSpaces />);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("");
    });
  });

  describe("space collapsing (default on)", () => {
    it("collapses multiple spaces: 'hello   world' → 'hello world'", async () => {
      const user = userEvent.setup();
      render(<RemoveExtraSpaces />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("hello   world");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("hello world");
    });

    it("collapses tabs mixed with spaces", async () => {
      const user = userEvent.setup();
      render(<RemoveExtraSpaces />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("a\t\t b");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("a b");
    });
  });

  describe("trim line edges (default on)", () => {
    it("trims leading and trailing spaces from lines", async () => {
      const user = userEvent.setup();
      render(<RemoveExtraSpaces />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("  hello  \n  world  ");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("hello\nworld");
    });
  });

  describe("remove blank lines option", () => {
    it("removes blank lines when enabled", async () => {
      const user = userEvent.setup();
      render(<RemoveExtraSpaces />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("line one\n\nline two\n\nline three");
      await user.click(screen.getByRole("button", { name: /remove blank lines/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("line one\nline two\nline three");
    });
  });

  describe("live update", () => {
    it("updates output as user types", async () => {
      const user = userEvent.setup();
      render(<RemoveExtraSpaces />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "a  b");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("a b");
    });

    it("returns empty output when input is cleared", async () => {
      const user = userEvent.setup();
      render(<RemoveExtraSpaces />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello   world");
      await user.clear(inputTextarea);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("");
    });
  });

  describe("copy behavior", () => {
    it("copies cleaned text to clipboard", async () => {
      const user = userEvent.setup();
      render(<RemoveExtraSpaces />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("hello   world");
      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await user.click(copyBtn);
      await expectCopied("hello world");
    });

    it("does not show copy button when output is empty", () => {
      render(<RemoveExtraSpaces />);
      expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
    });
  });

  describe("character count feedback", () => {
    it("shows character reduction info after cleaning", async () => {
      const user = userEvent.setup();
      render(<RemoveExtraSpaces />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("hello   world");
      // "hello   world" (13) → "hello world" (11), 2 removed
      expect(screen.getByText(/characters/i)).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has label for input", () => {
      render(<RemoveExtraSpaces />);
      expect(screen.getByText(/input text/i)).toBeInTheDocument();
    });

    it("has label for output", () => {
      render(<RemoveExtraSpaces />);
      expect(screen.getByText(/cleaned result/i)).toBeInTheDocument();
    });
  });
});
