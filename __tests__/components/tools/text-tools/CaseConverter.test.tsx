import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CaseConverter } from "@/components/tools/text-tools/CaseConverter";
import { clearClipboard, expectCopied } from "@/__tests__/helpers/mocks";

beforeEach(() => {
  clearClipboard();
});

describe("CaseConverter", () => {
  describe("rendering", () => {
    it("renders input textarea and result textarea", () => {
      render(<CaseConverter />);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(2);
    });

    it("renders all eight case conversion buttons", () => {
      render(<CaseConverter />);
      expect(screen.getByRole("button", { name: /uppercase/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /lowercase/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /title case/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sentence case/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /camelcase/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /pascalcase/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /snake_case/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /kebab-case/i })).toBeInTheDocument();
    });

    it("has disabled case buttons when input is empty", () => {
      render(<CaseConverter />);
      const uppercaseBtn = screen.getByRole("button", { name: /uppercase/i });
      expect(uppercaseBtn).toBeDisabled();
    });

    it("shows empty result textarea initially", () => {
      render(<CaseConverter />);
      const textareas = screen.getAllByRole("textbox");
      const resultTextarea = textareas[1];
      expect(resultTextarea).toHaveValue("");
    });
  });

  describe("UPPERCASE conversion", () => {
    it("converts input to UPPERCASE", async () => {
      const user = userEvent.setup();
      render(<CaseConverter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello world");
      await user.click(screen.getByRole("button", { name: /uppercase/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("HELLO WORLD");
    });
  });

  describe("lowercase conversion", () => {
    it("converts input to lowercase", async () => {
      const user = userEvent.setup();
      render(<CaseConverter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "HELLO WORLD");
      await user.click(screen.getByRole("button", { name: /^lowercase$/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("hello world");
    });
  });

  describe("camelCase conversion", () => {
    it("converts 'hello world' to camelCase", async () => {
      const user = userEvent.setup();
      render(<CaseConverter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello world");
      await user.click(screen.getByRole("button", { name: /camelcase/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("helloWorld");
    });
  });

  describe("snake_case conversion", () => {
    it("converts 'hello world' to snake_case", async () => {
      const user = userEvent.setup();
      render(<CaseConverter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello world");
      await user.click(screen.getByRole("button", { name: /snake_case/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("hello_world");
    });
  });

  describe("kebab-case conversion", () => {
    it("converts 'hello world' to kebab-case", async () => {
      const user = userEvent.setup();
      render(<CaseConverter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello world");
      await user.click(screen.getByRole("button", { name: /kebab-case/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("hello-world");
    });
  });

  describe("PascalCase conversion", () => {
    it("converts 'hello world' to PascalCase", async () => {
      const user = userEvent.setup();
      render(<CaseConverter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello world");
      await user.click(screen.getByRole("button", { name: /pascalcase/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("HelloWorld");
    });
  });

  describe("Title Case conversion", () => {
    it("converts 'hello world' to Title Case", async () => {
      const user = userEvent.setup();
      render(<CaseConverter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello world");
      await user.click(screen.getByRole("button", { name: /title case/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("Hello World");
    });
  });

  describe("live update", () => {
    it("clears output when input changes after a conversion", async () => {
      const user = userEvent.setup();
      render(<CaseConverter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello");
      await user.click(screen.getByRole("button", { name: /uppercase/i }));
      const textareasBefore = screen.getAllByRole("textbox");
      expect(textareasBefore[1]).toHaveValue("HELLO");

      await user.clear(inputTextarea);
      await user.type(inputTextarea, "world");
      // Output is cleared because active is reset on input change
      const textareasAfter = screen.getAllByRole("textbox");
      expect(textareasAfter[1]).toHaveValue("");
    });

    it("re-applies conversion when a case button is clicked again", async () => {
      const user = userEvent.setup();
      render(<CaseConverter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello");
      await user.click(screen.getByRole("button", { name: /uppercase/i }));
      // Change input then pick a conversion again
      await user.clear(inputTextarea);
      await user.type(inputTextarea, "world");
      await user.click(screen.getByRole("button", { name: /uppercase/i }));
      const textareas = screen.getAllByRole("textbox");
      expect(textareas[1]).toHaveValue("WORLD");
    });
  });

  describe("copy behavior", () => {
    it("copies converted output to clipboard when copy button is clicked", async () => {
      const user = userEvent.setup();
      render(<CaseConverter />);
      const [inputTextarea] = screen.getAllByRole("textbox");
      await user.type(inputTextarea, "hello world");
      await user.click(screen.getByRole("button", { name: /uppercase/i }));

      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await user.click(copyBtn);

      await expectCopied("HELLO WORLD");
    });

    it("does not show copy button when there is no output", () => {
      render(<CaseConverter />);
      expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has label for input textarea", () => {
      render(<CaseConverter />);
      expect(screen.getByText(/input text/i)).toBeInTheDocument();
    });

    it("has label for result textarea", () => {
      render(<CaseConverter />);
      expect(screen.getByText(/result/i)).toBeInTheDocument();
    });
  });
});
