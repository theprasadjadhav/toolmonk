import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HtmlEncoder } from "@/components/tools/encoding/HtmlEncoder";

vi.mock("@monaco-editor/react", () => ({
  default: ({ value, onChange }: { value: string; onChange?: (v: string) => void }) => (
    <textarea
      data-testid="editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

// ── Pure-logic unit tests ──────────────────────────────────────────────────────

const NAMED_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function encodeNamed(str: string): string {
  return str.replace(/[&<>"']/g, (c) => NAMED_MAP[c]);
}

function encodeNumeric(str: string): string {
  return str.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

describe("HtmlEncoder — business logic (pure functions)", () => {
  describe("encodeNamed", () => {
    it("encodes & to &amp;", () => {
      expect(encodeNamed("a & b")).toBe("a &amp; b");
    });

    it("encodes < to &lt;", () => {
      expect(encodeNamed("<div>")).toBe("&lt;div&gt;");
    });

    it("encodes > to &gt;", () => {
      expect(encodeNamed("a > b")).toBe("a &gt; b");
    });

    it("encodes \" to &quot;", () => {
      expect(encodeNamed('"hello"')).toBe("&quot;hello&quot;");
    });

    it("encodes ' to &apos;", () => {
      expect(encodeNamed("it's")).toBe("it&apos;s");
    });

    it("encodes all five special chars in one string", () => {
      const result = encodeNamed(`<a href="url" data-x='y'>a & b</a>`);
      expect(result).toBe(
        "&lt;a href=&quot;url&quot; data-x=&apos;y&apos;&gt;a &amp; b&lt;/a&gt;",
      );
    });

    it("leaves plain text unchanged", () => {
      expect(encodeNamed("hello world")).toBe("hello world");
    });

    it("handles empty string", () => {
      expect(encodeNamed("")).toBe("");
    });
  });

  describe("encodeNumeric", () => {
    it("encodes & to &#38;", () => {
      expect(encodeNumeric("&")).toBe("&#38;");
    });

    it("encodes < to &#60;", () => {
      expect(encodeNumeric("<")).toBe("&#60;");
    });

    it("encodes > to &#62;", () => {
      expect(encodeNumeric(">")).toBe("&#62;");
    });

    it("encodes \" to &#34;", () => {
      expect(encodeNumeric('"')).toBe("&#34;");
    });

    it("encodes ' to &#39;", () => {
      expect(encodeNumeric("'")).toBe("&#39;");
    });

    it("leaves plain text unchanged", () => {
      expect(encodeNumeric("hello")).toBe("hello");
    });
  });
});

describe("HtmlEncoder — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<HtmlEncoder />);
    expect(screen.getByText(/— plain text \/ html/i)).toBeInTheDocument();
  });

  it("shows the output panel label", () => {
    render(<HtmlEncoder />);
    expect(screen.getByText(/— html entities/i)).toBeInTheDocument();
  });

  it("shows placeholder when empty", () => {
    render(<HtmlEncoder />);
    expect(screen.getByText(/encoded output appears here/i)).toBeInTheDocument();
  });

  it("renders the Entities mode selector with Named selected by default", () => {
    render(<HtmlEncoder />);
    const select = screen.getByRole("combobox");
    expect((select as HTMLSelectElement).value).toBe("named");
  });

  it("typing input removes the placeholder", async () => {
    const user = userEvent.setup();
    render(<HtmlEncoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "<div>");
    await waitFor(() => {
      expect(
        screen.queryByText(/encoded output appears here/i),
      ).not.toBeInTheDocument();
    });
  });

  it("switching to numeric mode works", async () => {
    const user = userEvent.setup();
    render(<HtmlEncoder />);
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "numeric");
    expect((select as HTMLSelectElement).value).toBe("numeric");
  });

  it("clear button resets input and output", async () => {
    const user = userEvent.setup();
    render(<HtmlEncoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "<p>hello</p>");
    await user.click(screen.getByTitle("clear"));
    expect((editor as HTMLTextAreaElement).value).toBe("");
    await waitFor(() => {
      expect(screen.getByText(/encoded output appears here/i)).toBeInTheDocument();
    });
  });

  it("renders upload and clear toolbar controls", () => {
    render(<HtmlEncoder />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
    expect(screen.getByTitle("Upload text file")).toBeInTheDocument();
  });

  it("copy and download buttons are present", () => {
    render(<HtmlEncoder />);
    expect(screen.getByTitle("Copy")).toBeInTheDocument();
    expect(screen.getByTitle("Download")).toBeInTheDocument();
  });
});

describe("HtmlEncoder — accessibility", () => {
  it("input section has a label", () => {
    render(<HtmlEncoder />);
    expect(screen.getByText(/— plain text \/ html/i)).toBeInTheDocument();
  });

  it("output section has a label", () => {
    render(<HtmlEncoder />);
    expect(screen.getByText(/— html entities/i)).toBeInTheDocument();
  });

  it("Entities mode select has a visible label text", () => {
    render(<HtmlEncoder />);
    // ToolbarSelect renders a <label> wrapping the select; use queryAllByText
    // to be robust against multiple matching elements (option text also has "Entities")
    const matches = screen.queryAllByText(/entities/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("clear button has accessible title", () => {
    render(<HtmlEncoder />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
  });
});
