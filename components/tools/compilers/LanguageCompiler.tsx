"use client";

import { ExecutorTool } from "./ExecutorTool";
import { CODE_TEMPLATES } from "@/lib/runners/templates";
import type { Language } from "@/lib/runners/languages";

interface LanguageCompilerProps {
  language: Language;
}

export function LanguageCompiler({ language }: LanguageCompilerProps) {
  const template = CODE_TEMPLATES[language.monacoId] ?? { code: "", stdin: "" };

  return (
    <ExecutorTool
      monacoId={language.monacoId}
      label={language.label}
      initialCode={template.code}
      initialStdin={template.stdin ?? ""}
    />
  );
}
