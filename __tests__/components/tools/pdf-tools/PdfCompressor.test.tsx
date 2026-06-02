import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";

vi.mock("pdf-lib", () => ({
  PDFDocument: {
    load: vi.fn().mockResolvedValue({
      getPageCount: vi.fn().mockReturnValue(5),
      getPages: vi.fn().mockReturnValue([]),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      copyPages: vi.fn().mockResolvedValue([]),
      addPage: vi.fn(),
    }),
    create: vi.fn().mockResolvedValue({
      addPage: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      copyPages: vi.fn().mockResolvedValue([]),
    }),
  },
}));

vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 3,
      getPage: vi.fn().mockResolvedValue({
        getViewport: vi.fn().mockReturnValue({ width: 100, height: 141 }),
        render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
      }),
    }),
  }),
  GlobalWorkerOptions: { workerSrc: "" },
}));

vi.mock("@/lib/utils/pdfUtils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/pdfUtils")>();
  return {
    ...actual,
    validatePdfFile: vi.fn().mockReturnValue(null),
    loadPdfLib: vi.fn().mockResolvedValue({
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    }),
    canvasRecompressPDF: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    downloadPDF: vi.fn(),
    formatBytes: vi.fn((n: number) => `${n} B`),
    sizeDelta: vi.fn(() => "-10%"),
    stemName: vi.fn((name: string) => name.replace(/\.[^.]+$/, "")),
  };
});

function makePdfFile(name = "test.pdf") {
  return new File(["%PDF-1.4 fake"], name, { type: "application/pdf" });
}

import { PdfCompressor } from "@/components/tools/pdf-tools/PdfCompressor";

describe("PdfCompressor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the PDF drop zone", () => {
    render(<PdfCompressor />);
    expect(screen.getByText(/drop pdf here/i)).toBeInTheDocument();
  });

  it("file input only accepts PDF files", () => {
    render(<PdfCompressor />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toContain(".pdf");
  });

  it("shows compression mode selector after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByText(/lossless/i)).toBeInTheDocument();
      expect(screen.getByText(/aggressive/i)).toBeInTheDocument();
    });
  });

  it("shows Compress button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^compress$/i })).toBeInTheDocument();
    });
  });

  it("shows warning modal when switching to aggressive mode", async () => {
    const user = userEvent.setup();
    render(<PdfCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => screen.getByText(/aggressive/i));

    // Click the aggressive mode button
    const aggressiveBtn = screen.getByRole("button", { name: /aggressive/i });
    await user.click(aggressiveBtn);

    expect(screen.getByText(/lossy compression/i)).toBeInTheDocument();
  });

  it("shows compression level slider when aggressive mode is confirmed", async () => {
    const user = userEvent.setup();
    render(<PdfCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => screen.getByText(/aggressive/i));
    await user.click(screen.getByRole("button", { name: /aggressive/i }));

    // Confirm in modal
    await user.click(screen.getByRole("button", { name: /use aggressive/i }));

    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("shows Reset button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    });
  });

  it("shows result section after compression", async () => {
    const user = userEvent.setup();
    render(<PdfCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => screen.getByRole("button", { name: /^compress$/i }));

    await user.click(screen.getByRole("button", { name: /^compress$/i }));

    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument();
    });
  });

  it("shows Download button after result", async () => {
    const user = userEvent.setup();
    render(<PdfCompressor />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => screen.getByRole("button", { name: /^compress$/i }));
    await user.click(screen.getByRole("button", { name: /^compress$/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument();
    });
  });
});
