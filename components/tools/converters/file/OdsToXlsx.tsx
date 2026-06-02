"use client";

import { FileConverter } from "./FileConverter";
import { serverConvert } from "./serverConvert";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function OdsToXlsx() {
  return (
    <FileConverter
      accept=".ods,application/vnd.oasis.opendocument.spreadsheet"
      acceptLabel="ODS"
      onConvert={async (files) => [
        await serverConvert(files[0], "xlsx", "xlsx", XLSX_MIME),
      ]}
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
