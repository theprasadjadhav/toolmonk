"use client";

import { FileConverter } from "@/components/tools/converters/file/FileConverter";
import { serverConvert } from "@/components/tools/converters/file/serverConvert";

export function WordToPdf() {
  return (
    <FileConverter
      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      acceptLabel="DOC or DOCX"
      onConvert={async (files) => [
        await serverConvert(files[0], "pdf", "pdf", "application/pdf"),
      ]}
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
