"use client";

import { FileConverter } from "./FileConverter";
import { serverConvert } from "./serverConvert";

const ODS_MIME = "application/vnd.oasis.opendocument.spreadsheet";

export function XlsxToOds() {
  return (
    <FileConverter
      accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      acceptLabel="XLS or XLSX"
      onConvert={async (files) => [
        await serverConvert(files[0], "ods", "ods", ODS_MIME),
      ]}
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
