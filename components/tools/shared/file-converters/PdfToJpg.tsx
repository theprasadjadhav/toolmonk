"use client";

import { useState } from "react";
import { FileConverter } from "@/components/tools/converters/file/FileConverter";
import { serverConvertPdfToJpg } from "@/components/tools/converters/file/serverConvert";
import { ToolbarSelect } from "@/components/ui/Toolbar";

const DPI_OPTIONS = [
  { value: "72",  label: "72 DPI  (screen)" },
  { value: "96",  label: "96 DPI  (standard)" },
  { value: "150", label: "150 DPI (good)" },
  { value: "300", label: "300 DPI (print)" },
];

export function PdfToJpg() {
  const [dpi, setDpi] = useState("150");

  return (
    <FileConverter
      accept="application/pdf,.pdf"
      acceptLabel="PDF"
      options={
        <ToolbarSelect
          label="dpi"
          value={dpi}
          onChange={setDpi}
          options={DPI_OPTIONS}
        />
      }
      onConvert={(files) => serverConvertPdfToJpg(files[0], parseInt(dpi, 10))}
      loadingLabel="Converting via LibreOffice…"
    />
  );
}
