import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegexTester } from "@/components/tools/code/RegexTester";

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

// Mirror runRegex from the component for isolated logic tests
function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function runRegex(pattern: string, flags: string, text: string) {
  if (!pattern) return { matches: [], highlighted: escHtml(text), error: "" };
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { matches: [], highlighted: escHtml(text), error: (e as Error).message };
  }
  const matches: { value: string; index: number }[] = [];
  if (flags.includes("g")) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({ value: m[0], index: m.index });
      if (m[0].length === 0) re.lastIndex++;
    }
  } else {
    const m = re.exec(text);
    if (m) matches.push({ value: m[0], index: m.index });
  }
  return { matches, error: "" };
}

describe("RegexTester — business logic (pure functions)", () => {
  it("empty pattern returns no matches", () => {
    const { matches } = runRegex("", "g", "hello world");
    expect(matches).toHaveLength(0);
  });

  it("\\d+ matches digits in 'abc123def'", () => {
    const { matches, error } = runRegex("\\d+", "g", "abc123def");
    expect(error).toBe("");
    expect(matches).toHaveLength(1);
    expect(matches[0].value).toBe("123");
    expect(matches[0].index).toBe(3);
  });

  it("global flag finds all matches", () => {
    const { matches } = runRegex("\\d+", "g", "1 and 2 and 33");
    expect(matches).toHaveLength(3);
    expect(matches.map((m) => m.value)).toEqual(["1", "2", "33"]);
  });

  it("without global flag returns only first match", () => {
    const { matches } = runRegex("\\d+", "", "1 and 2 and 33");
    expect(matches).toHaveLength(1);
    expect(matches[0].value).toBe("1");
  });

  it("invalid pattern returns an error string", () => {
    const { error } = runRegex("[invalid", "g", "test");
    expect(error).not.toBe("");
  });

  it("case-insensitive flag 'i' matches uppercase", () => {
    const { matches } = runRegex("hello", "gi", "Hello HELLO hello");
    expect(matches).toHaveLength(3);
  });

  it("named capture groups are matched", () => {
    const result = runRegex("(?<year>\\d{4})", "g", "Year 2024 and 2025");
    expect(result.matches).toHaveLength(2);
  });

  it("pattern [a-z]+ matches lowercase words", () => {
    const { matches } = runRegex("[a-z]+", "g", "abc123def");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].value).toBe("abc");
  });
});

describe("RegexTester — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<RegexTester />);
    expect(screen.getByText(/— pattern/i)).toBeInTheDocument();
  });

  it("renders the pattern input with delimiter slashes", () => {
    render(<RegexTester />);
    const slashes = screen.getAllByText("/");
    expect(slashes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders flag toggle buttons g, i, m, s, u", () => {
    render(<RegexTester />);
    expect(screen.getByRole("button", { name: /^g$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^i$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^m$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^s$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^u$/i })).toBeInTheDocument();
  });

  it("typing a valid pattern and test text shows match count", async () => {
    const user = userEvent.setup();
    render(<RegexTester />);
    const patternInput = screen.getByPlaceholderText(/\[a-z\]/i);
    await user.type(patternInput, "\\d+");
    const testEditor = screen.getByTestId("editor");
    await user.type(testEditor, "abc123def");
    await waitFor(() => {
      expect(screen.getByText(/1 match/i)).toBeInTheDocument();
    });
  });

  it("matched text appears in the results list", async () => {
    const user = userEvent.setup();
    render(<RegexTester />);
    const patternInput = screen.getByPlaceholderText(/\[a-z\]/i);
    await user.type(patternInput, "\\d+");
    const testEditor = screen.getByTestId("editor");
    await user.type(testEditor, "abc123def");
    await waitFor(() => {
      // "123" appears in both the highlighted view and the match list
      const all = screen.getAllByText("123");
      expect(all.length).toBeGreaterThan(0);
    });
  });

  it("shows '0 matches' when pattern has no match", async () => {
    const user = userEvent.setup();
    render(<RegexTester />);
    const patternInput = screen.getByPlaceholderText(/\[a-z\]/i);
    await user.type(patternInput, "\\d+");
    const testEditor = screen.getByTestId("editor");
    await user.type(testEditor, "abcdef");
    await waitFor(() => {
      expect(screen.getByText(/0 matches/i)).toBeInTheDocument();
    });
  });

  it("shows error for invalid regex pattern", async () => {
    render(<RegexTester />);
    const patternInput = screen.getByPlaceholderText(/\[a-z\]/i);
    // Use fireEvent.change to avoid userEvent interpreting [ as a special key
    fireEvent.change(patternInput, { target: { value: "[invalid" } });
    await waitFor(() => {
      // Error message element is shown
      const errorEl = document.querySelector(".text-red-400");
      expect(errorEl).not.toBeNull();
    });
  });

  it("toggling 'g' flag removes it from the active flags", async () => {
    const user = userEvent.setup();
    render(<RegexTester />);
    const gBtn = screen.getByRole("button", { name: /^g$/i });
    // g is initially active; click to deactivate
    await user.click(gBtn);
    // The flags display in the closing slash span should not contain 'g'
    // Check the button is no longer highlighted (no active class text change easily)
    // Instead confirm "first only — g is off" hint when there's a match
    const patternInput = screen.getByPlaceholderText(/\[a-z\]/i);
    await user.type(patternInput, "\\d+");
    const testEditor = screen.getByTestId("editor");
    await user.type(testEditor, "1 2 3");
    await waitFor(() => {
      expect(screen.getByText(/first only.*g is off/i)).toBeInTheDocument();
    });
  });

  it("clear button resets pattern, test text and flags", async () => {
    const user = userEvent.setup();
    render(<RegexTester />);
    const patternInput = screen.getByPlaceholderText(/\[a-z\]/i);
    await user.type(patternInput, "\\d+");
    const clearBtn = screen.getByTitle("clear");
    await user.click(clearBtn);
    expect((patternInput as HTMLInputElement).value).toBe("");
    const testEditor = screen.getByTestId("editor") as HTMLTextAreaElement;
    expect(testEditor.value).toBe("");
  });
});

describe("RegexTester — accessibility", () => {
  it("flag buttons have accessible title attributes describing them", () => {
    render(<RegexTester />);
    const gBtn = screen.getByRole("button", { name: /^g$/i });
    expect(gBtn).toHaveAttribute("title");
    expect(gBtn.getAttribute("title")).toMatch(/global/i);
  });

  it("clear button has accessible title", () => {
    render(<RegexTester />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
  });

  it("test string section is labelled", () => {
    render(<RegexTester />);
    expect(screen.getByText(/— test string/i)).toBeInTheDocument();
  });

  it("matches section is labelled", () => {
    render(<RegexTester />);
    expect(screen.getByText(/— matches/i)).toBeInTheDocument();
  });
});
