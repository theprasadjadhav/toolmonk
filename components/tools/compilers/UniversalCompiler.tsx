"use client";

import { useState } from "react";
import { ExecutorTool } from "./ExecutorTool";
import { ToolbarSelect } from "@/components/ui/Toolbar";
import { LANGUAGES, LANGUAGE_OPTIONS } from "@/lib/runners/languages";
import { CODE_TEMPLATES } from "@/lib/runners/templates";

export function UniversalCompiler() {
  const [monacoId, setMonacoId] = useState("python");

  const language = LANGUAGES.find((l) => l.monacoId === monacoId) ?? LANGUAGES[0];
  const template = CODE_TEMPLATES[monacoId] ?? { code: "", stdin: "" };

  const handleLanguageChange = (value: string) => {
    setMonacoId(value);
  };

  return (
    <ExecutorTool
      key={monacoId}
      monacoId={monacoId}
      label={language.label}
      initialCode={template.code}
      initialStdin={template.stdin ?? ""}
      toolbarLeading={
        <ToolbarSelect
          label="language"
          value={monacoId}
          onChange={handleLanguageChange}
          options={LANGUAGE_OPTIONS}
        />
      }
    />
  );
}
