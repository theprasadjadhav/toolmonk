"use client";

import { FileConverter } from "@/components/tools/converters/file/FileConverter";
import { serverConvert } from "@/components/tools/converters/file/serverConvert";

export function ImageToPdf() {
  return (
    <FileConverter
      accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff,.jpg,.jpeg,.png,.webp,.bmp,.tiff"
      acceptLabel="JPG, PNG, WebP, or BMP"
      multiple
      onConvert={async (files) =>
        Promise.all(
          files.map((f) => serverConvert(f, "pdf", "pdf", "application/pdf")),
        )
      }
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
