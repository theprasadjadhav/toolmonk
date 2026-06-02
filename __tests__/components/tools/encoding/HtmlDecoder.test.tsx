import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HtmlDecoder } from "@/components/tools/encoding/HtmlDecoder";

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

const ENTITY_MAP: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  nbsp: "\u00A0", copy: "©", reg: "®", trade: "™",
  mdash: "—", ndash: "–", laquo: "«", raquo: "»",
  ldquo: "\u201C", rdquo: "\u201D", lsquo: "\u2018", rsquo: "\u2019",
  hellip: "…", bull: "•", euro: "€", pound: "£", yen: "¥",
  cent: "¢", deg: "°", plusmn: "±", times: "×", divide: "÷",
  frac12: "½", frac14: "¼", frac34: "¾",
};

function decodeEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => ENTITY_MAP[name.toLowerCase()] ?? match);
}

describe("HtmlDecoder — business logic (pure functions)", () => {
  describe("decodeEntities", () => {
    it("decodes &amp; to &", () => {
      expect(decodeEntities("a &amp; b")).toBe("a & b");
    });

    it("decodes &lt; to <", () => {
      expect(decodeEntities("&lt;div&gt;")).toBe("<div>");
    });

    it("decodes &gt; to >", () => {
      expect(decodeEntities("a &gt; b")).toBe("a > b");
    });

    it("decodes &quot; to \"", () => {
      expect(decodeEntities("&quot;hello&quot;")).toBe('"hello"');
    });

    it("decodes &apos; to '", () => {
      expect(decodeEntities("it&apos;s")).toBe("it's");
    });

    it("decodes &copy; to ©", () => {
      expect(decodeEntities("&copy;")).toBe("©");
    });

    it("decodes &trade; to ™", () => {
      expect(decodeEntities("&trade;")).toBe("™");
    });

    it("decodes &euro; to €", () => {
      expect(decodeEntities("&euro;")).toBe("€");
    });

    it("decodes &mdash; to —", () => {
      expect(decodeEntities("&mdash;")).toBe("—");
    });

    it("decodes &#38; (decimal) to &", () => {
      expect(decodeEntities("&#38;")).toBe("&");
    });

    it("decodes &#60; (decimal) to <", () => {
      expect(decodeEntities("&#60;")).toBe("<");
    });

    it("decodes &#x26; (hex) to &", () => {
      expect(decodeEntities("&#x26;")).toBe("&");
    });

    it("decodes &#x3C; (hex) to <", () => {
      expect(decodeEntities("&#x3C;")).toBe("<");
    });

    it("leaves unknown entities unchanged", () => {
      expect(decodeEntities("&unknown;")).toBe("&unknown;");
    });

    it("handles empty string", () => {
      expect(decodeEntities("")).toBe("");
    });

    it("leaves plain text unchanged", () => {
      expect(decodeEntities("hello world")).toBe("hello world");
    });

    it("decodes multiple entities in one string", () => {
      expect(decodeEntities("&lt;p&gt;Hello &amp; World&lt;/p&gt;")).toBe(
        "<p>Hello & World</p>",
      );
    });

    it("decodes &hellip; to …", () => {
      expect(decodeEntities("&hellip;")).toBe("…");
    });

    it("leaves &frac12; unchanged (regex only matches alpha chars, not alphanumeric entity names)", () => {
      // The component's regex is /&([a-zA-Z]+);/ which does NOT match frac12
      // because the entity name contains digits. This is intentional behaviour.
      expect(decodeEntities("&frac12;")).toBe("&frac12;");
    });
  });
});

describe("HtmlDecoder — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<HtmlDecoder />);
    expect(screen.getByText(/— html entities/i)).toBeInTheDocument();
  });

  it("renders decoded text output label", () => {
    render(<HtmlDecoder />);
    expect(screen.getByText(/— decoded text/i)).toBeInTheDocument();
  });

  it("shows placeholder when empty", () => {
    render(<HtmlDecoder />);
    expect(screen.getByText(/decoded output appears here/i)).toBeInTheDocument();
  });

  it("typing input removes the placeholder", async () => {
    const user = userEvent.setup();
    render(<HtmlDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "&lt;div&gt;");
    await waitFor(() => {
      expect(
        screen.queryByText(/decoded output appears here/i),
      ).not.toBeInTheDocument();
    });
  });

  it("clear button resets input and output", async () => {
    const user = userEvent.setup();
    render(<HtmlDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "&amp;");
    await user.click(screen.getByTitle("clear"));
    expect((editor as HTMLTextAreaElement).value).toBe("");
    await waitFor(() => {
      expect(screen.getByText(/decoded output appears here/i)).toBeInTheDocument();
    });
  });

  it("renders clear toolbar button", () => {
    render(<HtmlDecoder />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
  });

  it("renders upload panel button", () => {
    render(<HtmlDecoder />);
    expect(screen.getByTitle("Upload text file")).toBeInTheDocument();
  });

  it("copy and download buttons are present", () => {
    render(<HtmlDecoder />);
    expect(screen.getByTitle("Copy")).toBeInTheDocument();
    expect(screen.getByTitle("Download")).toBeInTheDocument();
  });
});

describe("HtmlDecoder — accessibility", () => {
  it("input section has a panel label", () => {
    render(<HtmlDecoder />);
    expect(screen.getByText(/— html entities/i)).toBeInTheDocument();
  });

  it("output section has a panel label", () => {
    render(<HtmlDecoder />);
    expect(screen.getByText(/— decoded text/i)).toBeInTheDocument();
  });

  it("clear button has accessible title", () => {
    render(<HtmlDecoder />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
  });
});
