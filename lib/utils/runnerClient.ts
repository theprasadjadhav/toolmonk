/** Typed HTTP client for the ToolMonk code runner */

export interface RunnerExecuteRequest {
  language: string;
  version: string;
  files: { name?: string; content: string }[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

export interface RunnerRunResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: string | null;
  output: string;
}

export interface RunnerExecuteResponse {
  language: string;
  version: string;
  run: RunnerRunResult;
  compile?: RunnerRunResult;
  message?: string; // present on error
}

export interface ExecuteOptions {
  language: string;
  version?: string;
  code: string;
  fileExt?: string;
  stdin?: string;
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: string | null;
  /** True if the process was killed (OOM or signal) */
  killed: boolean;
  /** Combined compile output — stdout+stderr (tsc writes to stdout; javac/gcc/go write to stderr) */
  compileStderr?: string;
  /** True when the compile step ran and returned a non-zero exit code */
  compileFailed?: boolean;
}

// Set via RUNNER_URL env var in k8s/deployment.yaml.
// Falls back to localhost for local development (make sure the runner is running on port 2000).
const RUNNER_URL = process.env.RUNNER_URL ?? "http://localhost:2000";

export async function runnerExecute(opts: ExecuteOptions): Promise<ExecuteResult> {
  const { language, version = "*", code, fileExt = "txt", stdin = "" } = opts;

  const body: RunnerExecuteRequest = {
    language,
    version,
    files: [{ name: `main.${fileExt}`, content: code }],
    stdin,
    compile_timeout: 10_000,
    run_timeout: 5_000,
    run_memory_limit: 134_217_728, // 128 MB
  };

  const res = await fetch(`${RUNNER_URL}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Runner HTTP ${res.status}: ${text}`);
  }

  const data: RunnerExecuteResponse = await res.json();
  const run = data.run;
  const compile = data.compile;

  return {
    stdout: run.stdout,
    stderr: run.stderr,
    exitCode: run.code,
    signal: run.signal,
    killed: run.signal !== null,
    // Combine stdout+stderr: tsc writes errors to stdout, javac/gcc/go write to stderr.
    // Using both ensures compile errors are captured regardless of language.
    compileStderr: compile ? ((compile.stdout + compile.stderr).trim() || undefined) : undefined,
    compileFailed: compile ? compile.code !== 0 : false,
  };
}
