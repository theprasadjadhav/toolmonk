"use client";

import { FileConverter } from "@/components/tools/converters/file/FileConverter";
import { serverConvert } from "@/components/tools/converters/file/serverConvert";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function PdfToWord() {
  return (
    <FileConverter
      accept="application/pdf,.pdf"
      acceptLabel="PDF"
      onConvert={async (files) => [
        await serverConvert(files[0], "docx", "docx", DOCX_MIME),
      ]}
      loadingLabel="Converting PDF to Word…"
    />
  );
}
