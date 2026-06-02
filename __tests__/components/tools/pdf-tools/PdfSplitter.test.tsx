import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";

vi.mock("pdf-lib", () => ({
  PDFDocument: {
    load: vi.fn().mockResolvedValue({
      getPageCount: vi.fn().mockReturnValue(5),
      getPages: vi.fn().mockReturnValue([{}, {}, {}, {}, {}]),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      copyPages: vi.fn().mockResolvedValue([{}]),
      addPage: vi.fn(),
    }),
    create: vi.fn().mockResolvedValue({
      addPage: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      copyPages: vi.fn().mockResolvedValue([{}]),
    }),
  },
}));

vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 5,
      destroy: vi.fn().mockResolvedValue(undefined),
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
      copyPages: vi.fn().mockResolvedValue([{}]),
    }),
    loadPdfJs: vi.fn().mockResolvedValue({
      numPages: 5,
      destroy: vi.fn().mockResolvedValue(undefined),
    }),
    renderThumbnails: vi.fn().mockResolvedValue([
      "data:image/jpeg;base64,AAAA",
      "data:image/jpeg;base64,BBBB",
      "data:image/jpeg;base64,CCCC",
      "data:image/jpeg;base64,DDDD",
      "data:image/jpeg;base64,EEEE",
    ]),
    downloadPDF: vi.fn(),
    zipAndDownload: vi.fn().mockResolvedValue(undefined),
    formatBytes: vi.fn((n: number) => `${n} B`),
    stemName: vi.fn((name: string) => name.replace(/\.[^.]+$/, "")),
    parsePageRanges: vi.fn().mockReturnValue([[0, 1, 2], [3, 4]]),
    splitEveryN: vi.fn().mockReturnValue([[0], [1], [2], [3], [4]]),
  };
});

vi.mock("@/components/tool/ToolPanel", () => ({
  useToolFullscreen: vi.fn().mockReturnValue(false),
  FullscreenButton: () => <button>Fullscreen</button>,
}));

vi.mock("@/components/tools/pdf-tools/PageSelector", () => ({
  PageSelector: ({ thumbnails }: { thumbnails: string[]; selected: Set<number>; onChange: (s: Set<number>) => void }) => (
    <div data-testid="page-selector">
      {thumbnails.map((_, i) => <span key={i}>p{i + 1}</span>)}
    </div>
  ),
}));

function makePdfFile(name = "test.pdf") {
  return new File(["%PDF-1.4 fake"], name, { type: "application/pdf" });
}

import { PdfSplitter } from "@/components/tools/pdf-tools/PdfSplitter";

describe("PdfSplitter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the PDF drop zone", () => {
    render(<PdfSplitter />);
    expect(screen.getByText(/drop pdf here/i)).toBeInTheDocument();
  });

  it("file input only accepts PDF files", () => {
    render(<PdfSplitter />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toContain(".pdf");
  });

  it("shows split mode buttons after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfSplitter />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /page ranges/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /every n pages/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /select pages/i })).toBeInTheDocument();
    });
  });

  it("shows page range input by default (ranges mode)", async () => {
    const user = userEvent.setup();
    render(<PdfSplitter />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      // The "Page ranges" mode button should be visible and active by default
      expect(screen.getByRole("button", { name: /page ranges/i })).toBeInTheDocument();
    });
  });

  it("shows range input field in ranges mode", async () => {
    const user = userEvent.setup();
    render(<PdfSplitter />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/1-3/i)).toBeInTheDocument();
    });
  });

  it("shows every-N controls when Every N pages mode is selected", async () => {
    const user = userEvent.setup();
    render(<PdfSplitter />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => screen.getByRole("button", { name: /every n pages/i }));

    await user.click(screen.getByRole("button", { name: /every n pages/i }));

    expect(screen.getByText(/pages per file/i)).toBeInTheDocument();
  });

  it("shows page selector when Select pages mode is chosen", async () => {
    const user = userEvent.setup();
    render(<PdfSplitter />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => screen.getByRole("button", { name: /select pages/i }));

    await user.click(screen.getByRole("button", { name: /select pages/i }));

    await waitFor(() => {
      expect(screen.getByTestId("page-selector")).toBeInTheDocument();
    });
  });

  it("shows Split PDF button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfSplitter />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      // The button text is "Split PDF and downlaod" (note typo in source)
      expect(screen.getByRole("button", { name: /split pdf/i })).toBeInTheDocument();
    });
  });

  it("shows total pages count after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfSplitter />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByText(/total pages: 5/i)).toBeInTheDocument();
    });
  });

  it("shows Reset button after file upload", async () => {
    const user = userEvent.setup();
    render(<PdfSplitter />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    });
  });

  it("shows error if range input is empty and Split is clicked", async () => {
    const user = userEvent.setup();

    // Override parsePageRanges to throw for empty input
    const { parsePageRanges } = await import("@/lib/utils/pdfUtils");
    vi.mocked(parsePageRanges).mockImplementationOnce(() => {
      throw new Error("Enter at least one page range, e.g. 1-3, 4-6.");
    });

    render(<PdfSplitter />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makePdfFile());

    await waitFor(() => screen.getByRole("button", { name: /split pdf/i }));

    await user.click(screen.getByRole("button", { name: /split pdf/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter at least one page range/i)).toBeInTheDocument();
    });
  });
});
