import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { LanguageCompiler } from "@/components/tools/compilers/LanguageCompiler";
import { LANGUAGE_BY_MONACO } from "@/lib/runners/languages";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

const tool = TOOLS.find((t) => t.slug === "sqlite-compiler")!;
const language = LANGUAGE_BY_MONACO.get("sql")!;

export const metadata = generateToolMetadata("sqlite-compiler");

const howToSteps = [
  "Write your SQL queries in the editor — <code>CREATE TABLE</code>, <code>INSERT</code>, and <code>SELECT</code> are all supported.",
  "Each run starts with a fresh <strong>in-memory database</strong> — create tables and insert data at the top of your script.",
  "Use <code>SELECT</code> statements to query and display results. Output is shown as tab-separated text.",
  "Click <strong>Run</strong> to execute all statements in sequence.",
];

const faqs = [
  {
    question: "Is this SQLite compiler free?",
    answer: "Yes. The Online SQLite Compiler is completely free with no login required.",
  },
  {
    question: "What SQL dialect is supported?",
    answer: "SQLite 3.x syntax. This includes most standard SQL features: CREATE TABLE, INSERT, SELECT, UPDATE, DELETE, JOIN, subqueries, GROUP BY, ORDER BY, and window functions.",
  },
  {
    question: "Is the database persistent between runs?",
    answer: "No. Each run starts with a fresh in-memory database. You need to CREATE TABLE and INSERT data at the start of each run.",
  },
  {
    question: "Can I use JOIN and subqueries?",
    answer: "Yes. All standard SQL joins (INNER, LEFT, RIGHT, FULL OUTER, CROSS) and subqueries are supported by SQLite.",
  },
  {
    question: "Are stored procedures supported?",
    answer: "No. SQLite does not support stored procedures. You can use triggers and views, which SQLite does support.",
  },
  {
    question: "What is the difference between SQLite and MySQL/PostgreSQL?",
    answer: "SQLite is a file-based, serverless SQL database. It lacks some advanced features (stored procedures, full outer joins in older versions) but supports most standard SQL syntax. It is ideal for learning SQL and testing queries.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "About the Online SQLite Compiler",
    content: `<p>This Online SQLite Compiler lets you run SQL queries in an in-memory SQLite database directly in the browser. Create tables, insert data, and test queries without installing MySQL, PostgreSQL, or any database server.</p>
<p>Each run starts fresh — no data persists between executions. This makes it perfect for learning SQL, testing query logic, and practising for interviews.</p>`,
  },
  {
    title: "Supported SQL Features",
    content: `<ul>
<li><strong>DDL:</strong> CREATE TABLE, DROP TABLE, ALTER TABLE, CREATE INDEX, CREATE VIEW</li>
<li><strong>DML:</strong> INSERT, SELECT, UPDATE, DELETE, REPLACE</li>
<li><strong>Queries:</strong> WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET</li>
<li><strong>Joins:</strong> INNER JOIN, LEFT JOIN, CROSS JOIN</li>
<li><strong>Functions:</strong> COUNT, SUM, AVG, MIN, MAX, LENGTH, UPPER, LOWER, SUBSTR, DATE functions</li>
<li><strong>Advanced:</strong> Subqueries, CTEs (WITH clause), window functions (ROW_NUMBER, RANK, DENSE_RANK)</li>
</ul>`,
  },
];

export default function SqliteCompilerPage() {
  if (!tool) notFound();
  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <LanguageCompiler language={language} />
    </ToolContainer>
  );
}
