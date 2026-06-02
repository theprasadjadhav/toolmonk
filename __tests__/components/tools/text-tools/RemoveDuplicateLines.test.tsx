import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RemoveDuplicateLines } from "@/components/tools/text-tools/RemoveDuplicateLines";
import { clearClipboard, expectCopied } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("RemoveDuplicateLines", () => {
  describe("rendering", () => {
    it("renders input and output textareas", () => {
      render(<RemoveDuplicateLines />);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(2);
    });

    it("renders option toggles", () => {
      render(<RemoveDuplicateLines />);
      expect(screen.getByRole("button", { name: /case-insensitive/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /trim whitespace/i })).toBeInTheDocument();
    });

    it("shows empty output initially", () => {
      render(<RemoveDuplicateLines />);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("");
    });
  });

  describe("duplicate removal", () => {
    it("removes exact duplicate lines", async () => {
      const user = userEvent.setup();
      render(<RemoveDuplicateLines />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("apple\nbanana\napple\norange");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("apple\nbanana\norange");
    });

    it("preserves order of first occurrence", async () => {
      const user = userEvent.setup();
      render(<RemoveDuplicateLines />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("c\na\nb\na\nc");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("c\na\nb");
    });

    it("keeps all lines when there are no duplicates", async () => {
      const user = userEvent.setup();
      render(<RemoveDuplicateLines />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("one\ntwo\nthree");
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("one\ntwo\nthree");
    });
  });

  describe("case-insensitive option", () => {
    it("removes case-variant duplicates when enabled", async () => {
      const user = userEvent.setup();
      render(<RemoveDuplicateLines />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("Apple\napple\nBANANA\nbanana");
      await user.click(screen.getByRole("button", { name: /case-insensitive/i }));
      const textareas = screen.getAllByRole("textbox");
      // With trim enabled (default), lines are trimmed; case-insensitive collapses case variants
      expect(textareas[1]).toHaveValue("Apple\nBANANA");
    });
  });

  describe("stats display", () => {
    it("shows lines kept and duplicates removed counts", async () => {
      const user = userEvent.setup();
      render(<RemoveDuplicateLines />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("foo\nfoo\nbar");
      expect(screen.getByText("Lines kept")).toBeInTheDocument();
      expect(screen.getByText("Duplicates removed")).toBeInTheDocument();
      // 2 unique lines kept, 1 removed
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("empty input", () => {
    it("shows placeholder text when input is empty", () => {
      render(<RemoveDuplicateLines />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      expect(inputTextarea).toHaveAttribute("placeholder");
      const placeholder = inputTextarea.getAttribute("placeholder");
      expect(placeholder).toMatch(/paste/i);
    });
  });

  describe("copy behavior", () => {
    it("copies deduplicated output to clipboard", async () => {
      const user = userEvent.setup();
      render(<RemoveDuplicateLines />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.click(inputTextarea);
      await user.paste("hello\nhello\nworld");
      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await user.click(copyBtn);
      await expectCopied("hello\nworld");
    });

    it("does not show copy button when output is empty", () => {
      render(<RemoveDuplicateLines />);
      expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has label for input", () => {
      render(<RemoveDuplicateLines />);
      expect(screen.getByText(/input lines/i)).toBeInTheDocument();
    });

    it("has label for output", () => {
      render(<RemoveDuplicateLines />);
      expect(screen.getByText(/unique lines/i)).toBeInTheDocument();
    });
  });
});
