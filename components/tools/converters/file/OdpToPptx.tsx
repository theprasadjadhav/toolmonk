"use client";

import { FileConverter } from "./FileConverter";
import { serverConvert } from "./serverConvert";

const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

export function OdpToPptx() {
  return (
    <FileConverter
      accept=".odp,application/vnd.oasis.opendocument.presentation"
      acceptLabel="ODP"
      onConvert={async (files) => [
        await serverConvert(files[0], "pptx", "pptx", PPTX_MIME),
      ]}
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
