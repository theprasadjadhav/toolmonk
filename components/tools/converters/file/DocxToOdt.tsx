"use client";

import { FileConverter } from "./FileConverter";
import { serverConvert } from "./serverConvert";

const ODT_MIME = "application/vnd.oasis.opendocument.text";

export function DocxToOdt() {
  return (
    <FileConverter
      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      acceptLabel="DOC or DOCX"
      onConvert={async (files) => [
        await serverConvert(files[0], "odt", "odt", ODT_MIME),
      ]}
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
