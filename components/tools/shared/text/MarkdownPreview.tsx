"use client";

import { useState, useEffect } from "react";
import { marked } from "marked";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { textareaCls } from "@/lib/utils/formStyles";
import { Toolbar, ToolbarButton, ToolbarRight, Icons, PanelLabel, PanelButton } from "@/components/ui/Toolbar";
import { uploadText, downloadText } from "@/lib/utils/file";
import { cn } from "@/lib/utils/cn";

// Configure marked for GFM
marked.setOptions({ gfm: true, breaks: true });

const SAMPLE = `# Markdown Preview

A live preview of **GitHub Flavored Markdown**.

## Features

- **Bold**, *italic*, ~~strikethrough~~
- Inline \`code\` and fenced blocks
- [Links](https://example.com) and images
- Tables, task lists, blockquotes

## Code

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Name    | Type   | Required |
|---------|--------|----------|
| title   | string | yes      |
| count   | number | no       |

## Task List

- [x] Create the tool
- [x] Add GFM support
- [ ] Ship it

> Blockquote — use markdown as documentation, notes, or any structured text.
`;

export function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE);
  const [html,  setHtml]  = useState("");
  const fullscreen = useToolFullscreen();

  useEffect(() => {
    const result = marked.parse(input);
    if (result instanceof Promise) {
      result.then(setHtml);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHtml(result);
    }
  }, [input]);

  const clear = () => setInput("");

  const handleUpload = async () => {
    const content = await uploadText(".md,.txt");
    if (content !== null) setInput(content);
  };
  const handleDownload = () => { if (html) downloadText(html, "preview.html", "text/html"); };

  return (
    <div className={cn("space-y-4", fullscreen && "h-full flex flex-col")}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarButton icon={<Icons.Sample />} label="sample" onClick={() => setInput(SAMPLE)} />
        <ToolbarButton icon={<Icons.Clear />} label="clear" onClick={clear} />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {/* Panels */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", fullscreen && "flex-1 min-h-0")}>
        {/* Editor */}
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Upload />} title="Upload file" onClick={handleUpload} />}>— markdown</PanelLabel>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type Markdown here…"
            spellCheck={false}
            className={cn(textareaCls, "resize-none", fullscreen ? "flex-1 min-h-0" : "h-[32rem]")}
          />
        </div>

        {/* Preview */}
        <div className={cn(fullscreen ? "flex flex-col gap-2 min-h-0" : "space-y-2")}>
          <PanelLabel actions={<PanelButton icon={<Icons.Download />} title="Download HTML" onClick={handleDownload} disabled={!html} />}>— preview</PanelLabel>
          <div className={cn(
            "border border-border bg-surface overflow-auto p-6",
            fullscreen ? "flex-1 min-h-0" : "h-[32rem]"
          )}>
            {html ? (
              <div className="md-prose" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className="font-mono text-xs text-foreground-muted">preview appears here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
