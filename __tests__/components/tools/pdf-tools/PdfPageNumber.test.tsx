import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";

vi.mock("pdf-lib", () => ({
  PDFDocument: {
    load: vi.fn().mockResolvedValue({
      getPage: vi.fn().mockReturnValue({
        getSize: vi.fn().mockReturnValue({ width: 595, height: 842 }),
        drawText: vi.fn(),
      }),
      getPageCount: vi.fn().mockReturnValue(3),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      embedFont: vi.fn().mockResolvedValue({
        widthOfTextAtSize: vi.fn().mockReturnValue(20),
      }),
    }),
  },
  StandardFonts: { Helvetica: "Helvetica" },
  rgb: vi.fn().mockReturnValue({}),
}));

vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 3,
      destroy: vi.fn().mockResolvedValue(undefined),
      getPage: vi.fn().mockResolvedValue({
        getViewport: vi.fn().mockReturnValue({ width: 595, height: 842 }),
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
      getPage: vi.fn().mockReturnValue({
        getSize: vi.fn().mockReturnValue({ width: 595, height: 842 }),
        drawText: vi.fn(),
      }),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      embedFont: vi.fn().mockResolvedValue({
        widthOfTextAtSize: vi.fn().mockReturnValue(20),
      }),
    }),
    loadPdfJs: vi.fn().mockResolvedValue({
      numPages: 3,
      destroy: vi.fn().mockResolvedValue(undefined),
    }),
    renderThumbnails: vi.fn().mockResolvedValue([
      "data:image/jpeg;base64,AAAA",
      "data:image/jpeg;base64,BBBB",
      "data:image/jpeg;base64,CCCC",
    ]),
    renderPageToCanvas: vi.fn().mockResolvedValue({
      width: 595,
      height: 842,
      getContext: vi.fn().mockReturnValue({
        fillStyle: "",
        font: "",
        textBaseline: "",
        fillText: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 20 }),
      }),
      toDataURL: vi.fn().mockReturnValue("data:image/jpeg;base64,PREVIEW"),
    }),
    downloadPDF: vi.fn(),
    formatBytes: vi.fn((n: number) => `${n} B`),
    stemName: vi.fn((name: string) => name.replace(/\.[^.]+$/, "")),
  };
});

vi.mock("@/components/tool/ToolPanel", () => ({
  useToolFullscreen: vi.fn().mockReturnValue(false),
  FullscreenButton: () => <button>Fullscreen</button>,
}));

vi.mock("@/components/tools/pdf-tools/PageSelector", () => ({
  PageSelector: ({ thumbnails, label }: { thumbnails: string[]; selected: Set<number>; onChange: (s: Set<number>) => void; label?: string }) => (
    <div data-testid="page-selector">
      <span>{label}</span>
      {thumbnails.map((_, i) => <span key={i}>Page {i + 1}</span>)}
    </div>
  ),
}));

function makePdfFile(name = "test.pdf") {
  return new File(["%PDF-1.4 fake"], name, { type: "application/pdf" });
}

import { PdfPageNumber } from "@/components/tools/pdf-tools/PdfPageNumber";

describe("PdfPageNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the PDF drop zone", () => {
    render(<PdfPageNumber />);
    expect(screen.getByText(/drop pdf here/i)).toBeInTheDocument();
  });

  it("file input only accepts PDF files", () => {
    render(<PdfPageNumber />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toContain(".pdf");
  });

  it("shows position selector after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfPageNumber />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      // Position buttons: TL, TC, TR, BL, BC, BR
      expect(screen.getByRole("button", { name: "TC" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "BC" })).toBeInTheDocument();
    });
  });

  it("shows start number input after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfPageNumber />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByText(/start number/i)).toBeInTheDocument();
    });
  });

  it("shows font size input after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfPageNumber />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByText(/font size/i)).toBeInTheDocument();
    });
  });

  it("shows prefix and suffix inputs", async () => {
    const user = userEvent.setup();
    render(<PdfPageNumber />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      // The prefix placeholder is "e.g. Page " and suffix is "e.g.  of 10"
      expect(screen.getByPlaceholderText(/e\.g\. Page/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e\.g\..*of/i)).toBeInTheDocument();
    });
  });

  it("shows color picker input", async () => {
    const user = userEvent.setup();
    render(<PdfPageNumber />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      const colorInput = document.querySelector('input[type="color"]');
      expect(colorInput).toBeInTheDocument();
    });
  });

  it("shows Add page numbers button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfPageNumber />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /add page numbers/i })).toBeInTheDocument();
    });
  });

  it("shows page selector with thumbnails", async () => {
    const user = userEvent.setup();
    render(<PdfPageNumber />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByTestId("page-selector")).toBeInTheDocument();
    });
  });

  it("shows Reset button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfPageNumber />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    });
  });
});
