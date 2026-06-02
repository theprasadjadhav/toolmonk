/** Hello World starter templates keyed by Monaco language id */
export const CODE_TEMPLATES: Record<string, { code: string; stdin?: string }> = {
  python: {
    code: `# Online Python Compiler — ToolMonk
# Write your Python code and click Run

name = input("Enter your name: ")
print(f"Hello, {name}!")
`,
    stdin: "World",
  },

  javascript: {
    code: `// Online JavaScript Compiler — ToolMonk
// Write your JavaScript code and click Run

const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });

rl.on("line", (name) => {
  console.log(\`Hello, \${name}!\`);
  rl.close();
});
`,
    stdin: "World",
  },

  typescript: {
    code: `// Online TypeScript Compiler — ToolMonk
// Write your TypeScript code and click Run

import * as readline from "readline";

interface Person { name: string }

const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line: string) => {
  const person: Person = { name: line.trim() };
  console.log(\`Hello, \${person.name}!\`);
  rl.close();
});
`,
    stdin: "World",
  },

  java: {
    code: `// Online Java Compiler — ToolMonk
// Write your Java code and click Run

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
}
`,
    stdin: "World",
  },

  c: {
    code: `// Online C Compiler — ToolMonk
// Write your C code and click Run

#include <stdio.h>

int main() {
    char name[256];
    scanf("%255s", name);
    printf("Hello, %s!\\n", name);
    return 0;
}
`,
    stdin: "World",
  },

  cpp: {
    code: `// Online C++ Compiler — ToolMonk
// Write your C++ code and click Run

#include <iostream>
#include <string>

int main() {
    std::string name;
    std::cin >> name;
    std::cout << "Hello, " << name << "!" << std::endl;
    return 0;
}
`,
    stdin: "World",
  },

  go: {
    code: `// Online Go Compiler — ToolMonk
// Write your Go code and click Run

package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

func main() {
    reader := bufio.NewReader(os.Stdin)
    name, _ := reader.ReadString('\\n')
    name = strings.TrimSpace(name)
    fmt.Printf("Hello, %s!\\n", name)
}
`,
    stdin: "World",
  },

  shell: {
    code: `#!/bin/bash
# Online Bash Interpreter — ToolMonk
# Write your shell script and click Run

read -r name
echo "Hello, $name!"
`,
    stdin: "World",
  },

  ruby: {
    code: `# Online Ruby Interpreter — ToolMonk
# Write your Ruby code and click Run

name = gets.chomp
puts "Hello, #{name}!"
`,
    stdin: "World",
  },

  php: {
    code: `<?php
// Online PHP Compiler — ToolMonk
// Write your PHP code and click Run

$name = trim(fgets(STDIN));
echo "Hello, $name!\\n";
`,
    stdin: "World",
  },

  sql: {
    code: `-- Online SQLite Compiler — ToolMonk
-- Write your SQL queries and click Run

CREATE TABLE users (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age  INTEGER
);

INSERT INTO users (name, age) VALUES
  ('Alice', 30),
  ('Bob',   25),
  ('Carol', 35);

SELECT name, age
FROM   users
ORDER  BY age ASC;
`,
  },
};
