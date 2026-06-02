"use client";

import { FileConverter } from "./FileConverter";
import { serverConvert } from "./serverConvert";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function OdtToDocx() {
  return (
    <FileConverter
      accept=".odt,application/vnd.oasis.opendocument.text"
      acceptLabel="ODT"
      onConvert={async (files) => [
        await serverConvert(files[0], "docx", "docx", DOCX_MIME),
      ]}
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
