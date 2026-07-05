"use client";

import { FileConverter } from "@/components/tools/converters/file/FileConverter";
import { convertPdfToDocx } from "@/lib/utils/pdfToDocx";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function PdfToWord() {
  return (
    <FileConverter
      accept="application/pdf,.pdf"
      acceptLabel="PDF"
      onConvert={async (files) => {
        try {
          const data = await convertPdfToDocx(files[0]);
          const stem = files[0].name.replace(/\.pdf$/i, "");
          return [{ name: `${stem}.docx`, data, mime: DOCX_MIME }];
        } catch (err) {
          console.error("[PdfToWord] Conversion error:", err);
          throw err;
        }
      }}
      loadingLabel="Analyzing PDF structure…"
    />
  );
}
