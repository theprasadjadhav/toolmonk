import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { makeImageFile } from "../../../helpers/mocks";

vi.mock("@/lib/utils/image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/image")>();
  return {
    ...actual,
    validateImageFile: vi.fn().mockReturnValue(null),
    formatBytes: vi.fn((n: number) => `${n} B`),
  };
});

// Mock FileReader as a proper class so `new FileReader()` works
class MockFileReader {
  onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | ArrayBuffer | null = "data:image/png;base64,AAAA";
  abort = vi.fn();
  readAsDataURL = vi.fn(function(this: MockFileReader) {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: "data:image/png;base64,AAAA" } } as unknown as ProgressEvent<FileReader>);
      }
    }, 0);
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readAsText = vi.fn(function(this: MockFileReader, _blob: Blob, _encoding?: string) {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: "data:image/png;base64,AAAA" } } as unknown as ProgressEvent<FileReader>);
      }
    }, 0);
  });
  readAsArrayBuffer = vi.fn();
  readAsBinaryString = vi.fn();
}

vi.stubGlobal("FileReader", MockFileReader);

import { ImageToBase64 } from "@/components/tools/image-tools/ImageToBase64";

describe("ImageToBase64", () => {
  beforeEach(() => {
    // clearMocks: true in vitest.config handles this
  });

  it("renders the upload drop zone", () => {
    render(<ImageToBase64 />);
    expect(screen.getByText(/drop an image here/i)).toBeInTheDocument();
  });

  it("file input accepts image files", () => {
    render(<ImageToBase64 />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.getAttribute("accept")).toBe("image/*");
  });

  it("drop zone has aria-label for accessibility", () => {
    render(<ImageToBase64 />);
    expect(screen.getByRole("button", { name: /upload image/i })).toBeInTheDocument();
  });

  it("shows data URI output section after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageToBase64 />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText("Data URI")).toBeInTheDocument();
    });
  });

  it("shows Raw Base64 output section after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageToBase64 />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText("Raw Base64")).toBeInTheDocument();
    });
  });

  it("shows HTML img tag output section after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageToBase64 />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText("HTML img tag")).toBeInTheDocument();
    });
  });

  it("shows CSS background output section after file upload", async () => {
    const user = userEvent.setup();
    render(<ImageToBase64 />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText("CSS background")).toBeInTheDocument();
    });
  });

  it("shows copy buttons for each section after upload", async () => {
    const user = userEvent.setup();
    render(<ImageToBase64 />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      const copyButtons = screen.getAllByRole("button", { name: /copy/i });
      expect(copyButtons.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("shows change button after upload", async () => {
    const user = userEvent.setup();
    render(<ImageToBase64 />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => {
      expect(screen.getByText(/✕ change/i)).toBeInTheDocument();
    });
  });

  it("clicking copy for Data URI calls clipboard.writeText", async () => {
    const user = userEvent.setup();
    render(<ImageToBase64 />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile("photo.png"));

    await waitFor(() => screen.getByText("Data URI"));

    const copyButtons = screen.getAllByRole("button", { name: /^copy$/i });
    await user.click(copyButtons[0]);

    // userEvent's virtual clipboard intercepts writeText; use readText to verify
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBeTruthy();
  });
});
