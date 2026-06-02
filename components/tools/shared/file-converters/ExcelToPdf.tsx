"use client";

import { FileConverter } from "@/components/tools/converters/file/FileConverter";
import { serverConvert } from "@/components/tools/converters/file/serverConvert";

export function ExcelToPdf() {
  return (
    <FileConverter
      accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      acceptLabel="XLS or XLSX"
      onConvert={async (files) => [
        await serverConvert(files[0], "pdf", "pdf", "application/pdf"),
      ]}
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
