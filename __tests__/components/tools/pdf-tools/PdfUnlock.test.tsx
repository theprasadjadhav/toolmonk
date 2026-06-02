import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/utils/pdfUtils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/pdfUtils")>();
  return {
    ...actual,
    validatePdfFile: vi.fn().mockReturnValue(null),
    stemName: vi.fn((name: string) => name.replace(/\.[^.]+$/, "")),
  };
});

vi.mock("@/components/tool/ToolPanel", () => ({
  useToolFullscreen: vi.fn().mockReturnValue(false),
  FullscreenButton: () => <button>Fullscreen</button>,
}));

function makePdfFile(name = "test.pdf") {
  return new File(["%PDF-1.4 fake"], name, { type: "application/pdf" });
}

import { PdfUnlock } from "@/components/tools/pdf-tools/PdfUnlock";

describe("PdfUnlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () =>
        Promise.resolve(
          new Blob(["%PDF-1.4 unlocked"], { type: "application/pdf" })
        ),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the PDF drop zone", () => {
    render(<PdfUnlock />);
    expect(screen.getByText(/drop pdf here/i)).toBeInTheDocument();
  });

  it("file input only accepts PDF files", () => {
    render(<PdfUnlock />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toContain(".pdf");
  });

  it("shows password input after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfUnlock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      const pwdInput = document.querySelector('input[type="password"]');
      expect(pwdInput).toBeInTheDocument();
    });
  });

  it("password field is of type password", async () => {
    const user = userEvent.setup();
    render(<PdfUnlock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      const pwdInput = document.querySelector('input[type="password"]') as HTMLInputElement;
      expect(pwdInput?.getAttribute("type")).toBe("password");
    });
  });

  it("shows Unlock button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfUnlock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /unlock/i })).toBeInTheDocument();
    });
  });

  it("Unlock button is enabled even with empty password (password is optional)", async () => {
    const user = userEvent.setup();
    render(<PdfUnlock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      const unlockBtn = screen.getByRole("button", { name: /unlock/i });
      expect(unlockBtn).not.toBeDisabled();
    });
  });

  it("calls fetch POST to /api/pdf/unlock on submit", async () => {
    const user = userEvent.setup();
    render(<PdfUnlock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => screen.getByRole("button", { name: /unlock/i }));

    await user.click(screen.getByRole("button", { name: /unlock/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/pdf/unlock",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("shows success message after successful unlock", async () => {
    const user = userEvent.setup();
    render(<PdfUnlock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => screen.getByRole("button", { name: /unlock/i }));
    await user.click(screen.getByRole("button", { name: /unlock/i }));

    await waitFor(() => {
      expect(screen.getByText(/download started/i)).toBeInTheDocument();
    });
  });

  it("shows error message when fetch fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("Wrong password"),
    });

    const user = userEvent.setup();
    render(<PdfUnlock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => screen.getByRole("button", { name: /unlock/i }));
    await user.click(screen.getByRole("button", { name: /unlock/i }));

    await waitFor(() => {
      expect(screen.getByText(/wrong password/i)).toBeInTheDocument();
    });
  });

  it("shows Reset button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfUnlock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    });
  });

  it("submits on Enter key press in password field", async () => {
    const user = userEvent.setup();
    render(<PdfUnlock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => document.querySelector('input[type="password"]'));

    const pwdInput = document.querySelector('input[type="password"]') as HTMLElement;
    await user.type(pwdInput, "password{Enter}");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
