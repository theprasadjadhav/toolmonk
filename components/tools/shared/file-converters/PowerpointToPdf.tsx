"use client";

import { FileConverter } from "@/components/tools/converters/file/FileConverter";
import { serverConvert } from "@/components/tools/converters/file/serverConvert";

export function PowerpointToPdf() {
  return (
    <FileConverter
      accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
      acceptLabel="PPT or PPTX"
      onConvert={async (files) => [
        await serverConvert(files[0], "pdf", "pdf", "application/pdf"),
      ]}
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
