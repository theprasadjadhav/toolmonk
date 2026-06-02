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

import { PdfLock } from "@/components/tools/pdf-tools/PdfLock";

describe("PdfLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["%PDF-1.4 locked"], { type: "application/pdf" })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the PDF drop zone", () => {
    render(<PdfLock />);
    expect(screen.getByText(/drop pdf here/i)).toBeInTheDocument();
  });

  it("file input only accepts PDF files", () => {
    render(<PdfLock />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toContain(".pdf");
  });

  it("shows password inputs after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfLock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      const pwdInputs = document.querySelectorAll('input[type="password"]');
      expect(pwdInputs.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("Lock button is disabled when password is empty", async () => {
    const user = userEvent.setup();
    render(<PdfLock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      const lockBtn = screen.getByRole("button", { name: /lock pdf/i });
      expect(lockBtn).toBeDisabled();
    });
  });

  it("Lock button is enabled after entering password", async () => {
    const user = userEvent.setup();
    render(<PdfLock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => document.querySelector('input[type="password"]'));

    const pwdInputs = document.querySelectorAll('input[type="password"]');
    await user.type(pwdInputs[0] as HTMLElement, "secret");

    const lockBtn = screen.getByRole("button", { name: /lock pdf/i });
    expect(lockBtn).not.toBeDisabled();
  });

  it("shows permissions checkboxes", async () => {
    const user = userEvent.setup();
    render(<PdfLock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByText(/allow printing/i)).toBeInTheDocument();
      expect(screen.getByText(/allow copying/i)).toBeInTheDocument();
      expect(screen.getByText(/allow modif/i)).toBeInTheDocument();
    });
  });

  it("shows user password and owner password labels", async () => {
    const user = userEvent.setup();
    render(<PdfLock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByText(/user password/i)).toBeInTheDocument();
      expect(screen.getByText(/owner password/i)).toBeInTheDocument();
    });
  });

  it("calls fetch with POST to /api/pdf/lock after clicking Lock", async () => {
    const user = userEvent.setup();
    render(<PdfLock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => document.querySelector('input[type="password"]'));

    const pwdInputs = document.querySelectorAll('input[type="password"]');
    await user.type(pwdInputs[0] as HTMLElement, "mypassword");

    await user.click(screen.getByRole("button", { name: /lock pdf/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/pdf/lock",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("shows Reset button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfLock />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    });
  });
});
