"use client";

import { useState } from "react";
import { ComparatorTool, DiffStatusBar } from "./ComparatorTool";

export function TextDiff() {
  const [left, setLeft]           = useState("");
  const [right, setRight]         = useState("");
  const [diffCount, setDiffCount] = useState(0);

  return (
    <ComparatorTool
      language="plaintext"
      left={left}
      right={right}
      onLeftChange={setLeft}
      onRightChange={setRight}
      onDiffChange={setDiffCount}
      statusBar={
        <DiffStatusBar
          diffCount={diffCount}
          leftEmpty={!left.trim()}
          rightEmpty={!right.trim()}
          placeholder="paste text into both panels to compare"
        />
      }
    />
  );
}
