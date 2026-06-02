interface SavingsDisplayProps {
  input: string;
  output: string;
}

export function SavingsDisplay({ input, output }: SavingsDisplayProps) {
  if (!output) return null;
  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = new TextEncoder().encode(output).length;
  const saving = inputBytes > 0 ? Math.round((1 - outputBytes / inputBytes) * 100) : 0;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-surface border border-border">
      <span className="font-mono text-[10px] text-foreground-muted uppercase tracking-wider">
        {inputBytes} B → {outputBytes} B
      </span>
      <span className="font-mono text-[10px] text-status-ok-text ml-auto">-{saving}% saved</span>
    </div>
  );
}
