import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextSorter } from "@/components/tools/text-tools/TextSorter";
import { clearClipboard, expectCopied } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("TextSorter", () => {
  describe("rendering", () => {
    it("renders input and output textareas", () => {
      render(<TextSorter />);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(2);
    });

    it("renders sort mode buttons", () => {
      render(<TextSorter />);
      expect(screen.getByRole("button", { name: /A → Z/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Z → A/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Short → Long/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Long → Short/i })).toBeInTheDocument();
    });

    it("renders option toggles", () => {
      render(<TextSorter />);
      expect(screen.getByRole("button", { name: /ignore case/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /trim whitespace/i })).toBeInTheDocument();
    });
  });

  describe("alphabetical ascending sort (A → Z, default)", () => {
    it("sorts lines alphabetically ascending", async () => {
      const user = userEvent.setup();
      render(<TextSorter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("cherry\napple\nbanana");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("apple\nbanana\ncherry");
    });
  });

  describe("alphabetical descending sort (Z → A)", () => {
    it("sorts lines alphabetically descending", async () => {
      const user = userEvent.setup();
      render(<TextSorter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("apple\ncherry\nbanana");
      await user.click(screen.getByRole("button", { name: /Z → A/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("cherry\nbanana\napple");
    });
  });

  describe("length sort (Short → Long)", () => {
    it("sorts lines by length ascending", async () => {
      const user = userEvent.setup();
      render(<TextSorter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("longest line here\nhi\nmedium");
      await user.click(screen.getByRole("button", { name: /Short → Long/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("hi\nmedium\nlongest line here");
    });
  });

  describe("length sort (Long → Short)", () => {
    it("sorts lines by length descending", async () => {
      const user = userEvent.setup();
      render(<TextSorter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("hi\nmedium\nlongest line here");
      await user.click(screen.getByRole("button", { name: /Long → Short/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("longest line here\nmedium\nhi");
    });
  });

  describe("ignore case option", () => {
    it("sorts case-insensitively when enabled", async () => {
      const user = userEvent.setup();
      render(<TextSorter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("Banana\napple\nCherry");
      await user.click(screen.getByRole("button", { name: /ignore case/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("apple\nBanana\nCherry");
    });
  });

  describe("live update", () => {
    it("updates sorted output immediately as user types", async () => {
      const user = userEvent.setup();
      render(<TextSorter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("z\na");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("a\nz");
    });

    it("shows empty output when input is cleared", async () => {
      const user = userEvent.setup();
      render(<TextSorter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("banana\napple");
      await user.clear(inputTextarea);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("");
    });
  });

  describe("copy behavior", () => {
    it("copies sorted output to clipboard", async () => {
      const user = userEvent.setup();
      render(<TextSorter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("cherry\napple\nbanana");
      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await user.click(copyBtn);
      await expectCopied("apple\nbanana\ncherry");
    });

    it("does not show copy button when output is empty", () => {
      render(<TextSorter />);
      expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
    });
  });

  describe("line count feedback", () => {
    it("shows line count after input", async () => {
      const user = userEvent.setup();
      render(<TextSorter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("a\nb\nc");
      expect(screen.getByText(/3 lines/i)).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has label for input", () => {
      render(<TextSorter />);
      expect(screen.getByText(/lines to sort/i)).toBeInTheDocument();
    });

    it("has label for output", () => {
      render(<TextSorter />);
      expect(screen.getByText(/sorted result/i)).toBeInTheDocument();
    });
  });
});
