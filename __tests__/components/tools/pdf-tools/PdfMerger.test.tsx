import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";

vi.mock("pdf-lib", () => ({
  PDFDocument: {
    load: vi.fn().mockResolvedValue({
      getPageCount: vi.fn().mockReturnValue(3),
      getPages: vi.fn().mockReturnValue([{}, {}, {}]),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      copyPages: vi.fn().mockResolvedValue([{}, {}]),
      addPage: vi.fn(),
    }),
    create: vi.fn().mockResolvedValue({
      addPage: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      copyPages: vi.fn().mockResolvedValue([{}, {}]),
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
    renderThumbnails: vi.fn().mockResolvedValue(["data:image/jpeg;base64,AAAA", "data:image/jpeg;base64,BBBB"]),
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
  PageSelector: ({ thumbnails, selected, onChange }: {
    thumbnails: string[];
    selected: Set<number>;
    onChange: (s: Set<number>) => void;
  }) => (
    <div data-testid="page-selector">
      {thumbnails.map((_, i) => (
        <button key={i} onClick={() => {
          const next = new Set(selected);
          if (next.has(i)) next.delete(i); else next.add(i);
          onChange(next);
        }}>
          Page {i + 1}
        </button>
      ))}
    </div>
  ),
}));

function makePdfFile(name = "test.pdf") {
  return new File(["%PDF-1.4 fake"], name, { type: "application/pdf" });
}

import { PdfMerger } from "@/components/tools/pdf-tools/PdfMerger";

describe("PdfMerger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the PDF multi-drop zone", () => {
    render(<PdfMerger />);
    expect(screen.getByText(/drop pdfs here/i)).toBeInTheDocument();
  });

  it("file input accepts PDF files and allows multiple", () => {
    render(<PdfMerger />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toContain(".pdf");
    expect(input?.hasAttribute("multiple")).toBe(true);
  });

  it("shows uploaded file in the list after upload", async () => {
    const user = userEvent.setup();
    render(<PdfMerger />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile("document.pdf"));

    await waitFor(() => {
      expect(screen.getByText("document.pdf")).toBeInTheDocument();
    });
  });

  it("shows merge button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfMerger />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /merge/i })).toBeInTheDocument();
    });
  });

  it("shows page thumbnails after upload", async () => {
    const user = userEvent.setup();
    render(<PdfMerger />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByTestId("page-selector")).toBeInTheDocument();
    });
  });

  it("shows Clear all button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfMerger />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /clear all/i })).toBeInTheDocument();
    });
  });

  it("shows remove file button in the file list", async () => {
    const user = userEvent.setup();
    render(<PdfMerger />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile("doc.pdf"));

    await waitFor(() => screen.getByText("doc.pdf"));

    // There should be a remove button for each file
    const removeButtons = document.querySelectorAll('button[title="Remove file"]');
    expect(removeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Add more PDFs' strip after a file is loaded", async () => {
    const user = userEvent.setup();
    render(<PdfMerger />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByText(/add more pdfs/i)).toBeInTheDocument();
    });
  });
});
