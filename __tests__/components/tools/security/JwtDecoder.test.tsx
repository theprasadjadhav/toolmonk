import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JwtDecoder } from "@/components/tools/security/JwtDecoder";

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange?: (v: string) => void;
    options?: { placeholder?: string };
  }) => (
    <textarea
      data-testid="editor"
      value={value ?? ""}
      placeholder={options?.placeholder ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

// ── Test fixtures ──────────────────────────────────────────────────────────────

// Standard jwt.io example token
const VALID_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
  "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// JWT with exp in the past (expired)
// header: {alg: HS256, typ: JWT}
// payload: {sub: "1", exp: 1}
const EXPIRED_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxIiwiZXhwIjoxfQ." +
  "fakeSignature";

// ── Pure-logic unit tests ──────────────────────────────────────────────────────

function b64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "===".slice(0, (4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function decodeJwt(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("A JWT must have exactly three dot-separated parts.");
  const header  = JSON.parse(b64urlDecode(parts[0]));
  const payload = JSON.parse(b64urlDecode(parts[1]));
  return { header, payload, signature: parts[2] };
}

describe("JwtDecoder — business logic (pure functions)", () => {
  describe("b64urlDecode", () => {
    it("decodes a standard base64url string", () => {
      // "hello" in base64url = "aGVsbG8"
      expect(b64urlDecode("aGVsbG8")).toBe("hello");
    });

    it("handles strings with + and / substitutions", () => {
      // base64 "+" becomes "-" and "/" becomes "_" in base64url
      const result = b64urlDecode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
      expect(result).toBe('{"alg":"HS256","typ":"JWT"}');
    });

    it("adds correct padding for strings not divisible by 4", () => {
      expect(() => b64urlDecode("aGVs")).not.toThrow();
    });
  });

  describe("decodeJwt", () => {
    it("decodes header correctly", () => {
      const { header } = decodeJwt(VALID_JWT);
      expect(header.alg).toBe("HS256");
      expect(header.typ).toBe("JWT");
    });

    it("decodes payload correctly", () => {
      const { payload } = decodeJwt(VALID_JWT);
      expect(payload.sub).toBe("1234567890");
      expect(payload.name).toBe("John Doe");
      expect(payload.iat).toBe(1516239022);
    });

    it("preserves the signature string", () => {
      const { signature } = decodeJwt(VALID_JWT);
      expect(signature).toBe("SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
    });

    it("throws for a token with fewer than 3 parts", () => {
      expect(() => decodeJwt("onlyone")).toThrow(
        "A JWT must have exactly three dot-separated parts.",
      );
    });

    it("throws for a token with more than 3 parts", () => {
      expect(() => decodeJwt("a.b.c.d")).toThrow();
    });

    it("handles whitespace around the token", () => {
      const { header } = decodeJwt("  " + VALID_JWT + "  ");
      expect(header.alg).toBe("HS256");
    });

    it("decodes expired JWT payload exp field", () => {
      const { payload } = decodeJwt(EXPIRED_JWT);
      expect(payload.exp).toBe(1);
    });
  });
});

describe("JwtDecoder — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<JwtDecoder />);
    expect(screen.getByText(/— jwt token/i)).toBeInTheDocument();
  });

  it("renders the JWT input editor area", () => {
    render(<JwtDecoder />);
    // The mock renders a <textarea data-testid="editor">
    expect(screen.getByTestId("editor")).toBeInTheDocument();
  });

  it("decodes a valid JWT and shows header panel", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, VALID_JWT);
    await waitFor(() => {
      expect(screen.getByText(/— header/i)).toBeInTheDocument();
    });
  });

  it("decodes a valid JWT and shows payload panel", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, VALID_JWT);
    await waitFor(() => {
      expect(screen.getByText(/— payload/i)).toBeInTheDocument();
    });
  });

  it("shows the algorithm in the info bar (HS256)", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, VALID_JWT);
    await waitFor(() => {
      expect(screen.getByText("HS256")).toBeInTheDocument();
    });
  });

  it("shows the sub claim in the info bar", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, VALID_JWT);
    await waitFor(() => {
      expect(screen.getByText("1234567890")).toBeInTheDocument();
    });
  });

  it("shows the signature section", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, VALID_JWT);
    await waitFor(() => {
      expect(
        screen.getByText(/— signature.*base64url/i),
      ).toBeInTheDocument();
    });
  });

  it("shows 'expired' badge for an expired JWT", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, EXPIRED_JWT);
    await waitFor(() => {
      expect(screen.getByText(/expired/i)).toBeInTheDocument();
    });
  });

  it("shows 'valid' badge for a non-expired JWT with exp claim", async () => {
    // Create a JWT with exp far in the future
    const futurePayload = btoa(
      JSON.stringify({ sub: "1", exp: Math.floor(Date.now() / 1000) + 86400 }),
    ).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    const futureJwt = `${header}.${futurePayload}.fakesig`;

    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, futureJwt);
    await waitFor(() => {
      expect(screen.getByText(/^valid$/i)).toBeInTheDocument();
    });
  });

  it("shows error banner for an invalid JWT", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "not.a.valid.jwt.here");
    await waitFor(() => {
      // The ErrorBanner renders the error message
      const errors = document.querySelectorAll(".text-status-err-text");
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it("shows error for a single-part string", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, "justonepart");
    await waitFor(() => {
      expect(
        screen.getByText(/exactly three dot-separated parts/i),
      ).toBeInTheDocument();
    });
  });

  it("clear button resets everything", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, VALID_JWT);
    await waitFor(() => {
      expect(screen.getByText(/— header/i)).toBeInTheDocument();
    });
    await user.click(screen.getByTitle("clear"));
    await waitFor(() => {
      expect(screen.queryByText(/— header/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/— payload/i)).not.toBeInTheDocument();
    });
  });

  it("empty input shows no decoded panels", () => {
    render(<JwtDecoder />);
    expect(screen.queryByText(/— header/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/— payload/i)).not.toBeInTheDocument();
  });
});

describe("JwtDecoder — accessibility", () => {
  it("JWT input section has a label", () => {
    render(<JwtDecoder />);
    expect(screen.getByText(/— jwt token/i)).toBeInTheDocument();
  });

  it("clear button has accessible title", () => {
    render(<JwtDecoder />);
    expect(screen.getByTitle("clear")).toBeInTheDocument();
  });

  it("upload button has accessible title", () => {
    render(<JwtDecoder />);
    expect(screen.getByTitle("Upload JWT file")).toBeInTheDocument();
  });

  it("copy header button has accessible title when decoded", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, VALID_JWT);
    await waitFor(() => {
      expect(screen.getByTitle("Copy header")).toBeInTheDocument();
    });
  });

  it("copy payload button has accessible title when decoded", async () => {
    const user = userEvent.setup();
    render(<JwtDecoder />);
    const editor = screen.getByTestId("editor");
    await user.type(editor, VALID_JWT);
    await waitFor(() => {
      expect(screen.getByTitle("Copy payload")).toBeInTheDocument();
    });
  });
});
