import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExecutorTool } from "@/components/tools/compilers/ExecutorTool";

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value, onChange, language,
  }: {
    value: string;
    onChange?: (v: string | undefined) => void;
    language?: string;
  }) => (
    <textarea
      data-testid="code-editor"
      data-language={language}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

vi.mock("@/components/tool/ToolPanel", () => ({
  useToolFullscreen: () => false,
  FullscreenButton: () => <button type="button">fullscreen</button>,
}));

// ── SSE helpers ────────────────────────────────────────────────────────────────

function makeSseStream(events: object[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(stream, { status: 200 });
}

function mockFetchWithEvents(events: object[]) {
  global.fetch = vi.fn().mockResolvedValue(makeSseStream(events));
}

// ── Setup / teardown ───────────────────────────────────────────────────────────

beforeEach(() => {
  // localStorage mock for getClientId()
  vi.stubGlobal("localStorage", {
    getItem: vi.fn().mockReturnValue("test-client-id"),
    setItem: vi.fn(),
  });
  vi.stubGlobal("crypto", {
    randomUUID: vi.fn().mockReturnValue("new-client-id"),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Helpers ────────────────────────────────────────────────────────────────────

function setCode(value: string) {
  fireEvent.change(screen.getByTestId("code-editor"), { target: { value } });
}

describe("ExecutorTool", () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders code editor", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    });

    it("sets correct Monaco language", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.getByTestId("code-editor").dataset.language).toBe("python");
    });

    it("renders run button", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.getByTitle("run")).toBeInTheDocument();
    });

    it("renders clear button", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.getByTitle("clear")).toBeInTheDocument();
    });

    it("renders fullscreen button", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.getByText("fullscreen")).toBeInTheDocument();
    });

    it("preloads initialCode in editor", () => {
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("hello")' />);
      expect((screen.getByTestId("code-editor") as HTMLTextAreaElement).value).toBe('print("hello")');
    });

    it("shows idle status bar initially", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.getByText(/run your python code/i)).toBeInTheDocument();
    });

    it("shows stdin toggle button", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.getByText(/stdin/i)).toBeInTheDocument();
    });

    it("stdin panel is collapsed by default when no initialStdin", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.queryByPlaceholderText(/standard input/i)).toBeNull();
    });

    it("stdin panel is expanded when initialStdin provided", () => {
      render(<ExecutorTool monacoId="python" label="Python" initialStdin="hello" />);
      expect(screen.getByPlaceholderText(/standard input/i)).toBeInTheDocument();
    });

    it("renders toolbarLeading when provided", () => {
      render(
        <ExecutorTool
          monacoId="python"
          label="Python"
          toolbarLeading={<span data-testid="leading">lang-selector</span>}
        />
      );
      expect(screen.getByTestId("leading")).toBeInTheDocument();
    });
  });

  // ── Run button state ───────────────────────────────────────────────────────

  describe("run button state", () => {
    it("run button is disabled when code is empty", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.getByTitle("run")).toBeDisabled();
    });

    it("run button enabled when code has content", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      setCode('print("hello")');
      expect(screen.getByTitle("run")).not.toBeDisabled();
    });

    it("run button disabled when whitespace-only code", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      setCode("   ");
      expect(screen.getByTitle("run")).toBeDisabled();
    });

    it("run button enabled with initialCode", () => {
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("hi")' />);
      expect(screen.getByTitle("run")).not.toBeDisabled();
    });
  });

  // ── Stdin toggle ───────────────────────────────────────────────────────────

  describe("stdin toggle", () => {
    it("clicking stdin toggle expands the stdin panel", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" />);
      await user.click(screen.getByRole("button", { name: /stdin/i }));
      expect(screen.getByPlaceholderText(/standard input/i)).toBeInTheDocument();
    });

    it("clicking stdin toggle again collapses the panel", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" />);
      await user.click(screen.getByRole("button", { name: /stdin/i }));
      await user.click(screen.getByRole("button", { name: /stdin/i }));
      expect(screen.queryByPlaceholderText(/standard input/i)).toBeNull();
    });

    it("stdin value is captured for run request", async () => {
      const user = userEvent.setup({ delay: null });
      mockFetchWithEvents([{ status: "queued" }, { status: "executing" }, { status: "success", stdout: "hello" }]);
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print(input())' />);
      await user.click(screen.getByRole("button", { name: /stdin/i }));
      fireEvent.change(screen.getByPlaceholderText(/standard input/i), { target: { value: "test-input" } });

      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
        expect(body.stdin).toBe("test-input");
      });
    });
  });

  // ── SSE status states ──────────────────────────────────────────────────────

  describe("SSE status states", () => {
    it("shows queued status", async () => {
      const encoder = new TextEncoder();
      let resolveStream!: () => void;
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: {"status":"queued"}\n\n'));
          // Don't close — keep in queued state
          new Promise<void>((res) => { resolveStream = res; }).then(() => controller.close());
        },
      });
      global.fetch = vi.fn().mockResolvedValue(new Response(stream, { status: 200 }));

      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("x")' />);
      await userEvent.setup({ delay: null }).click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText("queued…")).toBeInTheDocument();
      });
      resolveStream();
    });

    it("shows success status with time", async () => {
      mockFetchWithEvents([
        { status: "queued" },
        { status: "executing" },
        { status: "success", stdout: "hello world", time: 1240 },
      ]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("hello")' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/finished in 1\.24s/i)).toBeInTheDocument();
      });
    });

    it("shows success stdout output", async () => {
      mockFetchWithEvents([{ status: "success", stdout: "Hello, World!", time: 500 }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("x")' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText("Hello, World!")).toBeInTheDocument();
      });
    });

    it("shows runtime_error status", async () => {
      mockFetchWithEvents([
        { status: "runtime_error", stderr: "NameError: name x", exitCode: 1 },
      ]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode="print(x)" />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/runtime error.*exit 1/i)).toBeInTheDocument();
      });
    });

    it("shows runtime_error stderr", async () => {
      mockFetchWithEvents([
        { status: "runtime_error", stderr: "NameError: name 'x' is not defined", exitCode: 1 },
      ]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode="print(x)" />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/NameError/)).toBeInTheDocument();
      });
    });

    it("shows compile_error status", async () => {
      mockFetchWithEvents([
        { status: "compile_error", stderr: "error: expected ';'" },
      ]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="c" label="C" initialCode="int main() { return 0 }" />);
      await user.click(screen.getByTitle("run"));

      // Both status bar and output panel label say "compile error" — use getAllByText
      await waitFor(() => {
        expect(screen.getAllByText("compile error").length).toBeGreaterThan(0);
      });
    });

    it("shows compile_error stderr", async () => {
      mockFetchWithEvents([
        { status: "compile_error", stderr: "main.c:1:20: error: expected ';'" },
      ]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="c" label="C" initialCode="bad code" />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/main\.c:1:20/)).toBeInTheDocument();
      });
    });

    it("shows timeout status", async () => {
      mockFetchWithEvents([{ status: "timeout" }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode="while True: pass" />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/timed out after 5s/i)).toBeInTheDocument();
      });
    });

    it("shows oom_killed status", async () => {
      mockFetchWithEvents([{ status: "oom_killed" }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode="x=[0]*10**9" />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/memory limit exceeded/i)).toBeInTheDocument();
      });
    });

    it("shows rate_limited status", async () => {
      mockFetchWithEvents([{ status: "rate_limited", retryAfter: 60 }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("x")' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });
    });

    it("shows server_busy status", async () => {
      mockFetchWithEvents([{ status: "server_busy" }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("x")' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/server busy/i)).toBeInTheDocument();
      });
    });

    it("shows server_busy when fetch returns non-ok response", async () => {
      global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("x")' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/server busy/i)).toBeInTheDocument();
      });
    });

    it("shows server_busy on fetch network error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("x")' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/server busy/i)).toBeInTheDocument();
      });
    });

    it("shows empty state placeholder when idle", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.getByText(/no output yet/i)).toBeInTheDocument();
    });

    it("shows '(no output)' for success with empty stdout", async () => {
      mockFetchWithEvents([{ status: "success", stdout: "", time: 100 }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode="pass" />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText("(no output)")).toBeInTheDocument();
      });
    });
  });

  // ── SSE request payload ────────────────────────────────────────────────────

  describe("fetch request", () => {
    it("sends monacoId in request body", async () => {
      mockFetchWithEvents([{ status: "success", stdout: "ok" }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="go" label="Go" initialCode='package main\nfunc main() {}' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
        expect(body.monacoId).toBe("go");
      });
    });

    it("sends clientId in request body", async () => {
      mockFetchWithEvents([{ status: "success", stdout: "" }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("x")' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
        expect(body.clientId).toBe("test-client-id");
      });
    });

    it("sends POST to /api/execute", async () => {
      mockFetchWithEvents([{ status: "success", stdout: "" }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode="x=1" />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe("/api/execute");
        expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].method).toBe("POST");
      });
    });
  });

  // ── Clear button ───────────────────────────────────────────────────────────

  describe("clear button", () => {
    it("clears code to empty string", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("hi")' />);
      setCode("some other code");
      await user.click(screen.getByTitle("clear"));
      expect((screen.getByTestId("code-editor") as HTMLTextAreaElement).value).toBe("");
    });

    it("resets result to idle after clear", async () => {
      mockFetchWithEvents([{ status: "success", stdout: "unique-stdout-xyz" }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode="x=1" />);
      await user.click(screen.getByTitle("run"));
      await waitFor(() => expect(screen.getByText("unique-stdout-xyz")).toBeInTheDocument());

      await user.click(screen.getByTitle("clear"));
      expect(screen.getByText(/run your python code/i)).toBeInTheDocument();
      expect(screen.queryByText("unique-stdout-xyz")).toBeNull();
    });

    it("clear button disabled when code is empty and result is idle", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      expect(screen.getByTitle("clear")).toBeDisabled();
    });

    it("clear button enabled when code has content", () => {
      render(<ExecutorTool monacoId="python" label="Python" />);
      setCode("print('hi')");
      expect(screen.getByTitle("clear")).not.toBeDisabled();
    });
  });

  // ── Rate limited countdown ─────────────────────────────────────────────────

  describe("rate limited countdown", () => {
    it("shows countdown timer text when rate limited", async () => {
      mockFetchWithEvents([{ status: "rate_limited", retryAfter: 30 }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("x")' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText(/retry in \d+s/i)).toBeInTheDocument();
      });
    });

    it("run button is disabled when rate limited", async () => {
      mockFetchWithEvents([{ status: "rate_limited", retryAfter: 60 }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print("x")' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByTitle("run")).toBeDisabled();
      });
    });
  });

  // ── monacoId change resets state ───────────────────────────────────────────

  describe("monacoId change", () => {
    it("resets code and status when monacoId prop changes", async () => {
      mockFetchWithEvents([{ status: "success", stdout: "unique-stdout-xyz" }]);
      const user = userEvent.setup({ delay: null });
      const { rerender } = render(
        <ExecutorTool monacoId="python" label="Python" initialCode='print("x")' />
      );
      await user.click(screen.getByTitle("run"));
      await waitFor(() => expect(screen.getByText("unique-stdout-xyz")).toBeInTheDocument());

      rerender(<ExecutorTool monacoId="go" label="Go" initialCode="package main" />);

      expect((screen.getByTestId("code-editor") as HTMLTextAreaElement).value).toBe("package main");
      expect(screen.getByText(/run your go code/i)).toBeInTheDocument();
      expect(screen.queryByText("unique-stdout-xyz")).toBeNull();
    });
  });

  // ── Output rendering (XSS safety) ─────────────────────────────────────────

  describe("output rendering", () => {
    it("renders stdout in pre element (text content safe)", async () => {
      const xssAttempt = "<script>alert('xss')</script>";
      mockFetchWithEvents([{ status: "success", stdout: xssAttempt, time: 100 }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode='print(x)' />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        // The text should be rendered as text content in a pre
        const pre = document.querySelector("pre");
        expect(pre?.textContent).toContain("<script>");
        // No actual script element should be created
        expect(document.querySelector("script[data-xss]")).toBeNull();
      });
    });

    it("renders both stdout and stderr labels when both present", async () => {
      mockFetchWithEvents([
        { status: "runtime_error", stdout: "partial output", stderr: "error message", exitCode: 1 }
      ]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="python" label="Python" initialCode="bad" />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getByText("stdout")).toBeInTheDocument();
        expect(screen.getByText("stderr")).toBeInTheDocument();
      });
    });

    it("shows 'compile error' label for compile_error stderr", async () => {
      mockFetchWithEvents([{ status: "compile_error", stderr: "error: syntax", exitCode: 1 }]);
      const user = userEvent.setup({ delay: null });
      render(<ExecutorTool monacoId="c" label="C" initialCode="bad" />);
      await user.click(screen.getByTitle("run"));

      await waitFor(() => {
        expect(screen.getAllByText("compile error").length).toBeGreaterThan(0);
      });
    });
  });
});
