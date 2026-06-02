"use client";

import { FileConverter } from "./FileConverter";
import { serverConvert } from "./serverConvert";

const ODP_MIME = "application/vnd.oasis.opendocument.presentation";

export function PptxToOdp() {
  return (
    <FileConverter
      accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
      acceptLabel="PPT or PPTX"
      onConvert={async (files) => [
        await serverConvert(files[0], "odp", "odp", ODP_MIME),
      ]}
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
