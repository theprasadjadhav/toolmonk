export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  toolSlug?: string;
  content: string;
}

export const ARTICLES: BlogArticle[] = [
  {
    slug: "how-to-calculate-bmi",
    title: "How to Calculate BMI — Body Mass Index Explained",
    description: "Learn how to calculate your Body Mass Index (BMI), understand what the numbers mean, and why BMI has limitations as a health metric.",
    category: "calculators",
    publishedAt: "2026-03-15",
    readingTime: 5,
    toolSlug: "bmi-calculator",
    content: `<p>Body Mass Index (BMI) is one of the most widely used tools for assessing whether a person has a healthy body weight for their height. Despite its limitations, it remains a useful starting point for health assessments.</p>
<h2>The BMI Formula</h2>
<p>BMI is calculated by dividing your weight in kilograms by the square of your height in metres:</p>
<p><strong>BMI = weight (kg) ÷ height² (m²)</strong></p>
<p>For example, if you weigh 70 kg and are 1.75 m tall: BMI = 70 ÷ (1.75 × 1.75) = 70 ÷ 3.0625 ≈ 22.9</p>
<h2>If You Use Imperial Units</h2>
<p>For pounds and inches, the formula adds a conversion factor:</p>
<p><strong>BMI = (weight in lbs × 703) ÷ height² (in²)</strong></p>
<h2>What the Numbers Mean</h2>
<ul>
<li><strong>Below 18.5</strong> — Underweight</li>
<li><strong>18.5 to 24.9</strong> — Normal / Healthy weight</li>
<li><strong>25.0 to 29.9</strong> — Overweight</li>
<li><strong>30.0 and above</strong> — Obese</li>
</ul>
<h2>Limitations of BMI</h2>
<p>BMI is a useful screening tool but has real limitations. It does not directly measure body fat — a muscular athlete may have a high BMI without excess fat. Older adults tend to have more body fat than younger adults at the same BMI. It also does not account for where fat is distributed on the body, which is clinically significant.</p>
<h2>When to Use BMI</h2>
<p>BMI is best used as one data point among many. Your doctor may use it alongside waist circumference, blood pressure, cholesterol levels, and other metrics to get a fuller picture of your health. If your BMI falls outside the normal range, it is worth discussing with a healthcare provider rather than drawing conclusions alone.</p>`,
  },
  {
    slug: "what-is-json",
    title: "What Is JSON? A Plain-English Guide to JSON Formatting",
    description: "JSON (JavaScript Object Notation) is the universal data format for APIs and web apps. Learn the syntax, common mistakes, and how to format and validate JSON.",
    category: "dev-tools",
    publishedAt: "2026-03-22",
    readingTime: 6,
    toolSlug: "json-formatter",
    content: `<p>JSON — JavaScript Object Notation — is the most widely used format for exchanging data between web applications. If you've worked with any web API, you've worked with JSON.</p>
<h2>JSON Syntax Basics</h2>
<p>JSON is built on two structures: objects (key-value pairs) and arrays (ordered lists).</p>
<p>A valid JSON object looks like this:</p>
<pre style="background:#1a1a1a;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;color:#e4e4e4;overflow:auto">{"name": "Alice", "age": 30, "active": true}</pre>
<p>JSON supports six value types: strings (double-quoted), numbers, booleans (true/false), null, objects, and arrays.</p>
<h2>Common JSON Mistakes</h2>
<ul>
<li><strong>Trailing commas</strong> — <code>{"key": "value",}</code> is invalid. No trailing comma after the last item.</li>
<li><strong>Single quotes</strong> — Strings must use double quotes. <code>{'key': 'value'}</code> is invalid.</li>
<li><strong>Unquoted keys</strong> — Unlike JavaScript objects, JSON keys must be quoted: <code>{"key": "value"}</code> not <code>{key: "value"}</code>.</li>
<li><strong>Comments</strong> — JSON does not support comments. Use a different config format (like JSONC or YAML) if you need them.</li>
</ul>
<h2>Pretty-Printing JSON</h2>
<p>Raw JSON from an API is often minified — all on one line with no whitespace. Pretty-printing adds indentation to make it human-readable. In JavaScript: <code>JSON.stringify(data, null, 2)</code> adds 2-space indentation.</p>
<h2>JSON vs XML</h2>
<p>JSON has largely replaced XML for web APIs because it is more compact, easier to parse in JavaScript, and more readable. XML is still common in enterprise systems, SOAP services, and document-heavy workflows. For new web applications, JSON is almost always the right choice.</p>
<h2>Validating JSON</h2>
<p>A JSON validator checks that your JSON is syntactically correct. It catches missing quotes, extra commas, mismatched brackets, and other errors that would cause a parse failure. Always validate JSON you intend to send to an API or store in a database.</p>`,
  },
  {
    slug: "strong-password-guide",
    title: "What Makes a Strong Password? A Complete Security Guide",
    description: "Learn what makes a password strong or weak, how password cracking works, and best practices for creating and managing secure passwords.",
    category: "generators",
    publishedAt: "2026-04-01",
    readingTime: 7,
    toolSlug: "password-generator",
    content: `<p>Passwords are the first line of defence for your accounts. Understanding what makes a password strong — and what makes one weak — is essential for staying secure online.</p>
<h2>Length Is the Most Important Factor</h2>
<p>A 12-character password is exponentially harder to crack than an 8-character one. At 16+ characters, most passwords become computationally infeasible to crack by brute force, regardless of the character set used.</p>
<h2>Character Sets Matter</h2>
<p>A password that uses uppercase letters, lowercase letters, numbers, and symbols has a much larger search space than one using only lowercase letters. For an 8-character password, adding symbols increases the possible combinations from roughly 200 billion to over 6 quadrillion.</p>
<h2>What Makes a Password Weak</h2>
<ul>
<li>Dictionary words — crackers test millions of common words first</li>
<li>Predictable substitutions — "p@ssw0rd" is in every cracker's list</li>
<li>Personal information — birthdates, names, pet names are guessable</li>
<li>Keyboard patterns — "qwerty", "123456", "asdfgh"</li>
<li>Short passwords — anything under 10 characters is vulnerable</li>
</ul>
<h2>The Passphrase Approach</h2>
<p>A passphrase like "correct-horse-battery-staple" is both long and memorable. Four random words give you roughly the same security as a 12-character random password, but are far easier to type and remember. This is why many security experts recommend passphrases for accounts you need to type frequently.</p>
<h2>Password Managers</h2>
<p>The single best security improvement most people can make is to use a password manager. It generates a unique, random password for every site and stores them encrypted. You only need to remember one strong master password. Popular options include Bitwarden (open source), 1Password, and KeePassXC.</p>
<h2>Never Reuse Passwords</h2>
<p>When one site suffers a data breach, attackers automatically try those credentials on hundreds of other sites — a technique called credential stuffing. If you reuse passwords, a breach at one site compromises all of them. Unique passwords per site are non-negotiable.</p>`,
  },
  {
    slug: "compound-interest-explained",
    title: "Compound Interest Explained: Formula, Examples, and Why It Matters",
    description: "Compound interest is the 'eighth wonder of the world'. Learn the formula, see real examples, and understand how it affects savings and debt.",
    category: "calculators",
    publishedAt: "2026-04-08",
    readingTime: 6,
    toolSlug: "compound-interest-calculator",
    content: `<p>Albert Einstein allegedly called compound interest the "eighth wonder of the world." Whether or not he said it, the sentiment is accurate: compounding is one of the most powerful forces in personal finance.</p>
<h2>Simple vs Compound Interest</h2>
<p>With <strong>simple interest</strong>, you earn interest only on your original principal. With <strong>compound interest</strong>, you earn interest on both your principal and on previously earned interest. Over time, this difference becomes enormous.</p>
<h2>The Formula</h2>
<p><strong>A = P (1 + r/n)^(nt)</strong></p>
<ul>
<li><strong>A</strong> — Final amount</li>
<li><strong>P</strong> — Principal (starting amount)</li>
<li><strong>r</strong> — Annual interest rate (as a decimal, e.g. 0.05 for 5%)</li>
<li><strong>n</strong> — Times interest compounds per year</li>
<li><strong>t</strong> — Time in years</li>
</ul>
<h2>A Worked Example</h2>
<p>Invest $10,000 at 7% annual interest, compounded monthly, for 20 years:</p>
<p>A = 10,000 × (1 + 0.07/12)^(12×20) = 10,000 × (1.00583)^240 ≈ <strong>$40,064</strong></p>
<p>The same money with simple interest would grow to only $24,000. Compounding added an extra $16,000.</p>
<h2>The Rule of 72</h2>
<p>Divide 72 by your annual interest rate to estimate how many years it takes to double your money. At 6%, your money doubles in 72 ÷ 6 = 12 years. At 8%, it doubles in 9 years. This is a quick mental math shortcut used by investors everywhere.</p>
<h2>Compounding Frequency</h2>
<p>More frequent compounding means slightly higher returns. Monthly compounding beats annual compounding, and daily beats monthly — but the differences shrink as frequency increases. Going from annual to monthly compounding matters; going from daily to hourly barely does.</p>
<h2>The Dark Side: Compound Debt</h2>
<p>Compound interest works against you on debt. A credit card with 20% APR compounding monthly will more than double a balance in under 4 years if you make no payments. Understanding compounding is as important for managing debt as it is for growing savings.</p>`,
  },
  {
    slug: "url-encoding-guide",
    title: "URL Encoding Explained: When and Why to Encode URLs",
    description: "URL encoding (percent encoding) converts special characters so they can be safely transmitted in URLs. Learn what it is, why it matters, and common examples.",
    category: "dev-tools",
    publishedAt: "2026-04-15",
    readingTime: 5,
    toolSlug: "url-encoder-decoder",
    content: `<p>URLs can only contain a limited set of characters. When a URL needs to include characters outside this safe set — spaces, ampersands, equals signs, non-ASCII characters — they must be encoded using a process called percent encoding, or URL encoding.</p>
<h2>How Percent Encoding Works</h2>
<p>Each character that needs encoding is replaced by a percent sign followed by two hexadecimal digits representing the character's ASCII code. A space becomes <code>%20</code>, a forward slash becomes <code>%2F</code>, and an equals sign becomes <code>%3D</code>.</p>
<h2>Common Encoded Characters</h2>
<ul>
<li>Space → <code>%20</code> (or <code>+</code> in query strings)</li>
<li>& → <code>%26</code></li>
<li>= → <code>%3D</code></li>
<li>? → <code>%3F</code></li>
<li># → <code>%23</code></li>
<li>/ → <code>%2F</code></li>
<li>@ → <code>%40</code></li>
</ul>
<h2>When Does Encoding Happen Automatically?</h2>
<p>Browsers encode most characters automatically when you type a URL with spaces or special characters. HTML forms encode form data before submission. JavaScript's <code>encodeURIComponent()</code> encodes individual values, while <code>encodeURI()</code> encodes a full URL but preserves structural characters like <code>/</code>, <code>?</code>, and <code>&</code>.</p>
<h2>Why It Matters for Developers</h2>
<p>When building APIs or constructing URLs programmatically, failing to encode user-provided values can cause broken requests or security vulnerabilities. If a user enters "name=Alice&Bob" as a query parameter value, the unencoded <code>&</code> will be interpreted as a parameter separator. Always encode values before inserting them into URLs.</p>
<h2>Decoding</h2>
<p>The reverse process, URL decoding, converts percent-encoded sequences back to their original characters. Use <code>decodeURIComponent()</code> in JavaScript, or server-side equivalents in Python (<code>urllib.parse.unquote()</code>) and other languages. Always decode on the receiving end before processing user input.</p>`,
  },
  {
    slug: "hashing-guide",
    title: "Cryptographic Hashing Explained: MD5, SHA-1, SHA-256 and More",
    description: "Hash functions convert data into a fixed-length fingerprint. Learn how hashing works, the difference between MD5, SHA-1, and SHA-256, and when to use each.",
    category: "security",
    publishedAt: "2026-04-24",
    readingTime: 7,
    toolSlug: "hash-generator",
    content: `<p>A <strong>hash function</strong> takes any input — a word, a file, an entire database dump — and produces a fixed-length string of characters called a <strong>digest</strong> or <strong>hash</strong>. No matter how large the input is, the output is always the same length. SHA-256, for example, always produces a 64-character hexadecimal string.</p>
<h2>Properties of a Good Hash Function</h2>
<ul>
<li><strong>Deterministic</strong> — the same input always produces the same output.</li>
<li><strong>One-way (preimage resistance)</strong> — given a hash, it should be computationally infeasible to find the original input.</li>
<li><strong>Collision resistance</strong> — it should be infeasible to find two different inputs that produce the same hash.</li>
<li><strong>Second preimage resistance</strong> — given an input, it should be infeasible to find a different input with the same hash.</li>
<li><strong>Avalanche effect</strong> — a tiny change in input (even one bit) produces a completely different hash.</li>
</ul>
<h2>MD5: Fast but Broken</h2>
<p>MD5 was designed in 1991 and produces a 128-bit (32-character hex) hash. It is extremely fast, which made it popular for checksums. However, <strong>MD5 is cryptographically broken</strong> — researchers demonstrated practical collision attacks as early as 2004, and by 2012 identical MD5 hashes could be produced for different files in seconds. Never use MD5 for security purposes such as password storage or digital signatures. It is acceptable only for non-security checksums like verifying a download file hasn't been corrupted in transit.</p>
<h2>SHA-1: Also Compromised</h2>
<p>SHA-1 produces a 160-bit (40-character hex) hash and was the standard for digital signatures and TLS certificates for many years. In 2017, Google's <strong>SHAttered attack</strong> demonstrated the first real-world SHA-1 collision — two different PDF files with the same SHA-1 hash. Major browsers and certificate authorities stopped accepting SHA-1 certificates in 2017. Do not use SHA-1 for any new security application.</p>
<h2>SHA-256: The Current Standard</h2>
<p>SHA-256 is part of the SHA-2 family designed by the NSA and published by NIST. It produces a 256-bit (64-character hex) hash and remains secure as of today. SHA-256 is used in <strong>Bitcoin mining</strong> (each block header is double-hashed with SHA-256), <strong>TLS 1.3 certificates</strong>, code signing, and many other security-critical systems. SHA-512 (part of the same family) offers a larger 512-bit output for additional margin.</p>
<h2>SHA-3: A Different Algorithm</h2>
<p>SHA-3 (based on the Keccak algorithm) was standardised by NIST in 2015 as a backup to SHA-2. It uses a fundamentally different internal structure called a sponge construction. SHA-3 is not faster than SHA-2 and is not yet widely deployed, but is available as an alternative if SHA-2 were somehow compromised in the future.</p>
<h2>Hashing Passwords: Use bcrypt or Argon2</h2>
<p>General-purpose hash functions like SHA-256 are designed to be <em>fast</em> — that is exactly what you do not want for passwords. An attacker with a leaked password database can test billions of SHA-256 guesses per second on modern hardware. <strong>bcrypt</strong> and <strong>Argon2</strong> are purpose-built password hashing algorithms that are <em>deliberately slow</em> and include a random <strong>salt</strong> to prevent rainbow table attacks. Always use bcrypt, Argon2, or scrypt for storing user passwords — never plain SHA-256.</p>
<h2>Practical Uses of Hashing</h2>
<ul>
<li><strong>File integrity checksums</strong> — verify a downloaded file matches the publisher's hash.</li>
<li><strong>Digital signatures</strong> — sign the hash of a document, not the document itself.</li>
<li><strong>Password storage</strong> — store bcrypt/Argon2 hashes, never plaintext.</li>
<li><strong>Git commit hashes</strong> — every Git commit is identified by a SHA-1 (legacy) or SHA-256 hash of its contents.</li>
<li><strong>Deduplication</strong> — detect duplicate files by comparing hashes.</li>
</ul>`,
  },
  {
    slug: "qr-code-guide",
    title: "QR Codes Explained: How They Work and When to Use Them",
    description: "QR codes can store URLs, text, contact info, and more. Learn how QR codes work, their error correction levels, and best practices for creating and using them.",
    category: "generators",
    publishedAt: "2026-04-25",
    readingTime: 5,
    toolSlug: "qr-code-generator",
    content: `<p>A <strong>QR code</strong> (Quick Response code) is a two-dimensional barcode that can be scanned by a smartphone camera to instantly open a URL, save a contact, connect to Wi-Fi, or perform dozens of other actions. Invented by Denso Wave in Japan in 1994 to track automotive parts, QR codes have become ubiquitous on menus, payment systems, product packaging, and event tickets.</p>
<h2>How a QR Code Is Structured</h2>
<p>Every QR code contains several distinct regions:</p>
<ul>
<li><strong>Finder patterns</strong> — the three square corner markers that help scanners locate and orient the code.</li>
<li><strong>Alignment patterns</strong> — smaller squares that help correct for distortion in larger codes.</li>
<li><strong>Timing patterns</strong> — alternating black/white strips between the finder patterns that establish the module grid.</li>
<li><strong>Data modules</strong> — the black and white squares that encode the actual data.</li>
<li><strong>Quiet zone</strong> — a mandatory white border around the entire code that separates it from surrounding content.</li>
</ul>
<h2>What Data Can a QR Code Store?</h2>
<p>QR codes support several data types: plain text, URLs, email addresses, phone numbers, SMS messages, Wi-Fi credentials (SSID + password), and vCard contact information. The most common use is encoding a URL — the scanner opens the link in the device browser immediately.</p>
<h2>Capacity and Versions</h2>
<p>QR codes come in 40 versions. <strong>Version 1</strong> is a 21×21 grid and can hold up to 41 alphanumeric characters. <strong>Version 40</strong> is a 177×177 grid and can store up to 7,089 numeric characters or 4,296 alphanumeric characters. In practice, keep your QR code data as short as possible — shorter URLs produce simpler codes that scan faster and remain readable even when printed small.</p>
<h2>Error Correction Levels</h2>
<p>QR codes include redundant data so they can be read even when partially damaged or obscured. There are four error correction levels:</p>
<ul>
<li><strong>L (Low)</strong> — recovers up to 7% data loss. Smallest code, most fragile.</li>
<li><strong>M (Medium)</strong> — recovers up to 15%. Good general-purpose default.</li>
<li><strong>Q (Quartile)</strong> — recovers up to 25%. Useful for industrial use.</li>
<li><strong>H (High)</strong> — recovers up to 30%. Largest code, most damage-tolerant — ideal when you want to embed a logo in the centre of the QR code.</li>
</ul>
<h2>Best Practices for Printing</h2>
<p>For reliable scanning, follow these guidelines: use a minimum size of <strong>2 cm × 2 cm</strong> for print, maintain strong contrast (black on white is ideal — avoid low-contrast colour combinations), always include the quiet zone border, and test scan before mass printing. For digital use, export at a sufficient resolution — at least 300×300 pixels for web and 1000×1000 pixels for print.</p>
<h2>Dynamic vs Static QR Codes</h2>
<p>A <strong>static QR code</strong> has the destination encoded directly in its pixels — it cannot be changed after creation. A <strong>dynamic QR code</strong> points to a short redirect URL; you can update the destination without reprinting the code, and track scan counts. Dynamic codes require a third-party service. For simple one-off uses, static QR codes generated locally are free, private, and sufficient.</p>`,
  },
  {
    slug: "percentage-calculations",
    title: "How to Calculate Percentages: Formulas, Examples, and Common Uses",
    description: "Percentages are used everywhere — discounts, tax, tips, grades, statistics. Learn the core formulas and how to solve any percentage problem.",
    category: "calculators",
    publishedAt: "2026-04-26",
    readingTime: 5,
    toolSlug: "percentage-calculator",
    content: `<p>Percentages appear in everyday life constantly — sales discounts, tax rates, exam scores, interest rates, statistics. The good news is that all percentage problems are variations of the same small set of formulas.</p>
<h2>The Basic Formula: P% of X</h2>
<p>To find P percent of a number X:</p>
<p><strong>Result = X × (P / 100)</strong></p>
<p>Example: What is 20% of $80? → 80 × (20 / 100) = 80 × 0.20 = <strong>$16</strong>.</p>
<h2>What Percentage Is A of B?</h2>
<p>To find what percentage one number is of another:</p>
<p><strong>Percentage = (A / B) × 100</strong></p>
<p>Example: You scored 42 out of 50 on a test. What percentage is that? → (42 / 50) × 100 = <strong>84%</strong>.</p>
<h2>Percentage Increase and Decrease</h2>
<p>To calculate how much something has changed as a percentage:</p>
<p><strong>% change = ((New − Old) / Old) × 100</strong></p>
<p>Example: A stock went from $120 to $150. Increase = (150 − 120) / 120 × 100 = <strong>+25%</strong>. If it fell to $90: (90 − 120) / 120 × 100 = <strong>−25%</strong>.</p>
<h2>Reverse Percentage: X Is P% of What?</h2>
<p>If you know the result and the percentage, find the original value:</p>
<p><strong>Original = X / (P / 100)</strong></p>
<p>Example: After a 15% discount, a jacket costs $85. What was the original price? → 85 / 0.85 = <strong>$100</strong>.</p>
<h2>Percentage Points vs Percentages</h2>
<p>This is one of the most common sources of confusion in statistics and journalism. If an interest rate rises from 5% to 7%, it has increased by <strong>2 percentage points</strong> — but it has increased by <strong>40%</strong> in relative terms (2/5 × 100 = 40%). These are different things. "Percentage points" describe an absolute difference between two percentages. "Percent" describes a relative change.</p>
<h2>Mental Math Shortcuts</h2>
<ul>
<li><strong>10% trick</strong> — move the decimal point one place left. 10% of $64 = $6.40.</li>
<li><strong>5%</strong> — find 10%, then halve it. 5% of $64 = $3.20.</li>
<li><strong>20%</strong> — find 10%, then double it. 20% of $64 = $12.80.</li>
<li><strong>25%</strong> — divide by 4. 25% of $80 = $20.</li>
<li><strong>15% tip</strong> — find 10%, add half of that. 10% of $42 = $4.20, half = $2.10, total tip = $6.30.</li>
</ul>`,
  },
  {
    slug: "css-box-shadow-guide",
    title: "CSS Box Shadow: Complete Guide with Examples",
    description: "The CSS box-shadow property adds depth and dimension to elements. Learn the syntax, values, multiple shadows, inset shadows, and design tips.",
    category: "design-tools",
    publishedAt: "2026-04-27",
    readingTime: 6,
    toolSlug: "css-box-shadow-generator",
    content: `<p>The CSS <code>box-shadow</code> property is one of the most versatile tools for adding depth and visual hierarchy to a web interface. A well-crafted shadow can make a card feel elevated, a button feel pressable, or a modal feel like it's floating above the page.</p>
<h2>The Syntax</h2>
<p><code>box-shadow: offset-x offset-y blur-radius spread-radius color;</code></p>
<ul>
<li><strong>offset-x</strong> — horizontal distance. Positive moves the shadow right, negative moves it left.</li>
<li><strong>offset-y</strong> — vertical distance. Positive moves the shadow down, negative moves it up.</li>
<li><strong>blur-radius</strong> — controls softness. 0 = hard edge, higher values = softer, more diffuse shadow.</li>
<li><strong>spread-radius</strong> — expands or shrinks the shadow. Positive grows it beyond the element, negative shrinks it.</li>
<li><strong>color</strong> — any valid CSS color value.</li>
</ul>
<h2>Inset Shadows</h2>
<p>Adding the <code>inset</code> keyword before the values draws the shadow inside the element rather than outside. This is useful for pressed-button states, inner glows, and recessed UI elements: <code>box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);</code></p>
<h2>Multiple Shadows</h2>
<p>You can layer multiple shadows by separating them with commas. This is key to achieving natural-looking depth, since real objects cast multiple overlapping shadows of different intensities:</p>
<p><code>box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.15);</code></p>
<h2>Using Transparency for Natural Shadows</h2>
<p>Hard-coded dark greys (<code>#333</code>) look unnatural on coloured backgrounds. Use <code>rgba(0, 0, 0, 0.15)</code> or <code>hsla(0, 0%, 0%, 0.15)</code> for shadows that blend naturally with any background colour. Lower opacity (0.05–0.2) for subtle UI shadows; higher opacity (0.3–0.5) for dramatic floating effects.</p>
<h2>Common Shadow Patterns</h2>
<ul>
<li><strong>Subtle card</strong>: <code>0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)</code></li>
<li><strong>Floating button</strong>: <code>0 4px 6px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.15)</code></li>
<li><strong>Modal overlay</strong>: <code>0 20px 60px rgba(0,0,0,0.3)</code></li>
<li><strong>Neumorphism</strong>: two shadows — one light (top-left), one dark (bottom-right) — create an extruded plastic effect.</li>
</ul>
<h2>Dark Mode Considerations</h2>
<p>On dark backgrounds, dark shadows are invisible. In dark mode, shadows should be darker and more opaque, or replaced with subtle light-coloured glows. Some design systems use a slight elevation in background colour instead of shadows for dark mode — a card might be <code>bg-surface</code> (#1e1e1e) on a <code>bg-secondary</code> (#141414) base, with only a faint border rather than a shadow.</p>
<h2>Performance</h2>
<p>Box shadows are rendered on the compositor thread and do not trigger layout or paint on change — making them one of the cheaper visual effects to animate. They are far less expensive than <code>filter: drop-shadow()</code> for rectangular elements. For complex shapes or images, <code>filter: drop-shadow()</code> is needed, but at a higher performance cost.</p>`,
  },
  {
    slug: "favicon-guide",
    title: "What Is a Favicon and How to Create One for Your Website",
    description: "A favicon is the small icon shown in browser tabs, bookmarks, and search results. Learn what sizes you need, formats to use, and how to add it to your website.",
    category: "design-tools",
    publishedAt: "2026-04-28",
    readingTime: 5,
    toolSlug: "favicon-generator",
    content: `<p>A <strong>favicon</strong> (short for "favourite icon") is the small image that appears in browser tabs, bookmarks bars, browser history, and in Google search results alongside your site's URL. It is often a user's first visual cue that they are on the right site, making it an important part of your brand identity — even at tiny sizes.</p>
<h2>A Brief History</h2>
<p>Favicons were introduced by Internet Explorer 5 in 1999, which automatically requested a file named <code>favicon.ico</code> from the root of every website. The <code>.ico</code> format was used because it supports multiple image sizes within a single file. Modern browsers support PNG and SVG favicons and look for size-specific declarations in the <code>&lt;head&gt;</code>.</p>
<h2>Required Sizes and Use Cases</h2>
<ul>
<li><strong>16×16 px</strong> — browser tab (the most common context).</li>
<li><strong>32×32 px</strong> — Windows taskbar shortcuts, some browser toolbars.</li>
<li><strong>48×48 px</strong> — Windows site icons.</li>
<li><strong>180×180 px</strong> — iOS home screen icon (declared as <code>apple-touch-icon</code>).</li>
<li><strong>192×192 px</strong> — Android home screen / Progressive Web App (PWA).</li>
<li><strong>512×512 px</strong> — PWA splash screen.</li>
</ul>
<h2>File Formats</h2>
<p>The <strong>ICO format</strong> remains important for legacy browser support — it can bundle multiple sizes (16, 32, 48) into a single file. <strong>PNG</strong> is the standard for most modern declarations and supports full transparency. <strong>SVG favicons</strong> are supported by modern browsers and scale perfectly to any resolution, but are not supported by Safari (as of 2025) or IE. A solid strategy is: use <code>favicon.ico</code> (multi-size) in the root for legacy support, plus size-specific PNGs for modern browsers and mobile.</p>
<h2>How to Add a Favicon in HTML</h2>
<p>Place these tags inside the <code>&lt;head&gt;</code> of your HTML:</p>
<ul>
<li><code>&lt;link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"&gt;</code></li>
<li><code>&lt;link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"&gt;</code></li>
<li><code>&lt;link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"&gt;</code></li>
<li><code>&lt;link rel="icon" href="/favicon.ico"&gt;</code> (fallback)</li>
</ul>
<h2>Designing an Effective Favicon</h2>
<p>At 16×16 pixels you have just 256 pixels to work with. The most effective favicons are radically simplified versions of a brand mark — often just an initial letter, a geometric symbol, or a bold logomark with no text. Avoid thin lines (they disappear at small sizes), complex gradients, and anything that requires more than 2–3 colours to read. Test your design by viewing it at actual 16×16 size before finalising.</p>
<h2>Common Mistakes</h2>
<ul>
<li>Forgetting the <code>apple-touch-icon</code> — iOS will use a screenshot of your page instead.</li>
<li>Not placing <code>favicon.ico</code> in the root directory — some browsers request it directly without checking the HTML.</li>
<li>Using a logo designed for large sizes without simplifying it — it becomes an unreadable smear at 16px.</li>
<li>Missing the PWA icons — if you have a <code>manifest.json</code>, make sure 192×192 and 512×512 PNGs are included.</li>
</ul>`,
  },
  {
    slug: "body-fat-percentage-guide",
    title: "Body Fat Percentage: What It Is, How to Measure It, and Healthy Ranges",
    description: "Body fat percentage measures how much of your body weight is fat. Learn the healthy ranges for men and women, measurement methods, and why it matters.",
    category: "calculators",
    publishedAt: "2026-04-29",
    readingTime: 6,
    toolSlug: "body-fat-calculator",
    content: `<p><strong>Body fat percentage</strong> is the proportion of your total body weight that is made up of fat tissue. Unlike BMI, which is calculated from height and weight alone, body fat percentage distinguishes between fat mass and lean mass (muscle, bone, organs, water) — making it a more accurate indicator of fitness and health.</p>
<h2>Why It Matters More Than BMI</h2>
<p>Two people can have the same BMI but very different body compositions. A 90 kg athlete with 12% body fat and a 90 kg sedentary person with 30% body fat have the same BMI. Body fat percentage captures this difference. Excess body fat, particularly visceral fat around the organs, is associated with increased risk of type 2 diabetes, cardiovascular disease, and metabolic syndrome.</p>
<h2>Healthy Ranges</h2>
<p>Ranges differ by sex because women require more essential fat for hormonal and reproductive function:</p>
<ul>
<li><strong>Essential fat</strong>: 2–5% (men), 10–13% (women) — below this, organ function is at risk.</li>
<li><strong>Athletic</strong>: 6–13% (men), 14–20% (women).</li>
<li><strong>Fitness</strong>: 14–17% (men), 21–24% (women).</li>
<li><strong>Acceptable</strong>: 18–24% (men), 25–31% (women).</li>
<li><strong>Obese</strong>: 25%+ (men), 32%+ (women).</li>
</ul>
<h2>Measurement Methods</h2>
<ul>
<li><strong>Skinfold calipers</strong> — measure the thickness of pinched skin at several sites; inexpensive but technique-dependent.</li>
<li><strong>Bioelectrical impedance (BIA)</strong> — most consumer body fat scales use this; convenient but varies with hydration level.</li>
<li><strong>DEXA scan</strong> — dual-energy X-ray absorptiometry; the gold standard, also measures bone density. Requires a clinic visit.</li>
<li><strong>Hydrostatic weighing</strong> — underwater weighing; highly accurate but impractical for most people.</li>
<li><strong>Navy body fat formula</strong> — estimates from neck, waist, and hip measurements; free and fairly accurate for most people.</li>
</ul>
<h2>The Navy Formula Explained</h2>
<p>The U.S. Navy body fat formula uses circumference measurements to estimate fat percentage. For men it uses neck and waist measurements; for women it adds hip measurement. The formula uses a logarithmic relationship between these measurements and body fat percentage. It is the method used in the body fat calculator tool on this site because it requires only a tape measure and is validated against more precise methods.</p>
<h2>How Diet and Exercise Affect Body Fat</h2>
<p>Body fat percentage decreases when you consume fewer calories than you burn over an extended period (a caloric deficit), prompting the body to oxidise stored fat for energy. Resistance training preserves muscle mass during a cut, which improves body composition even when the scale doesn't change dramatically. Cardiovascular exercise increases caloric expenditure and improves metabolic health markers independent of fat loss.</p>
<h2>Risks of Very Low Body Fat</h2>
<p>Dropping below essential fat levels carries serious health consequences: hormonal disruption (reduced testosterone in men, amenorrhea in women), bone density loss, impaired immune function, and cardiac risk. Competitive bodybuilders achieve very low body fat only temporarily for competition and do not maintain those levels year-round. A sustainable, healthy goal for fat loss is <strong>0.5 to 1 pound per week</strong> — faster rates tend to sacrifice muscle mass.</p>`,
  },
  {
    slug: "color-formats-guide",
    title: "CSS Color Formats Explained: HEX, RGB, HSL, and When to Use Each",
    description: "CSS supports multiple color formats — HEX, RGB, RGBA, HSL, HSLA. Learn how each works, how to convert between them, and which to use in your projects.",
    category: "design-tools",
    publishedAt: "2026-04-30",
    readingTime: 6,
    toolSlug: "color-picker",
    content: `<p>CSS gives you multiple ways to specify the same colour. <code>#FF5733</code>, <code>rgb(255, 87, 51)</code>, and <code>hsl(11, 100%, 60%)</code> all produce an identical orange-red. Understanding each format — and when to use it — helps you write cleaner, more maintainable styles.</p>
<h2>HEX Format</h2>
<p>HEX colours are written as <code>#RRGGBB</code> where each pair of characters is a hexadecimal number (00–FF) representing the intensity of red, green, and blue on a scale of 0 to 255. <code>#FF0000</code> is full red, <code>#00FF00</code> is full green, <code>#000000</code> is black, <code>#FFFFFF</code> is white. When both characters in each pair are identical, you can use the shorthand <code>#RGB</code>: <code>#FF5500</code> cannot be shortened, but <code>#FF5500</code> — wait, <code>#AABBCC</code> can be written as <code>#ABC</code>. HEX is compact and universally supported, making it the standard choice for static colours in stylesheets and design tokens.</p>
<h2>RGB and RGBA</h2>
<p><code>rgb(255, 87, 51)</code> expresses each channel as a decimal number from 0 to 255. This is often more readable than HEX when you know the approximate channel values. <strong>RGBA</strong> adds a fourth alpha channel: <code>rgba(255, 87, 51, 0.5)</code> makes the colour 50% transparent. Alpha ranges from 0 (fully transparent) to 1 (fully opaque). RGBA is the standard choice for overlays, shadows, and any colour that needs transparency.</p>
<h2>HSL Format: Designed for Humans</h2>
<p>HSL stands for <strong>Hue, Saturation, Lightness</strong>. <code>hsl(11, 100%, 60%)</code> describes a colour by its position on the colour wheel (hue: 0–360°), its vividness (saturation: 0–100%), and its lightness (lightness: 0–100%). HSL is far more intuitive for creating colour variations:</p>
<ul>
<li>Change only <strong>lightness</strong> to create tints and shades of the same colour.</li>
<li>Change only <strong>saturation</strong> to go from vivid to muted.</li>
<li>Rotate the <strong>hue</strong> by 180° to find the complementary colour.</li>
</ul>
<h2>HSLA with Alpha</h2>
<p><code>hsla(11, 100%, 60%, 0.8)</code> adds transparency to HSL, just as RGBA does for RGB. HSLA is especially useful in theme systems where you want a transparent version of a brand colour: <code>hsla(var(--brand-hue), var(--brand-sat), 60%, 0.2)</code>.</p>
<h2>Modern CSS: oklch and color-mix()</h2>
<p>CSS Color Level 4 introduced <code>oklch()</code>, a perceptually uniform colour space where equal numerical steps produce equal-looking brightness changes. It is increasingly supported in modern browsers and is recommended for design systems that need precise, accessible colour scales. <code>color-mix(in oklch, red 50%, blue)</code> blends two colours in a chosen colour space — useful for generating hover and focus states programmatically without JavaScript.</p>
<h2>Practical Recommendations</h2>
<ul>
<li>Use <strong>HEX</strong> for static colours in design tokens, configuration, and design tool exports.</li>
<li>Use <strong>RGBA</strong> for transparency effects — shadows, overlays, translucent backgrounds.</li>
<li>Use <strong>HSL / CSS variables</strong> for dynamic colour manipulation: theming, dark mode, hover states.</li>
<li>Use <strong>oklch</strong> for new design systems where perceptual uniformity matters (accessible colour palettes, data visualisation).</li>
</ul>`,
  },
  {
    slug: "what-is-base64",
    title: "What Is Base64 Encoding? A Practical Guide",
    description: "Base64 encoding converts binary data to ASCII text for safe transmission over text-based protocols. Learn how it works, when to use it, and common pitfalls.",
    category: "dev-tools",
    publishedAt: "2026-04-16",
    readingTime: 5,
    toolSlug: "base64-encoder-decoder",
    content: `<p>Base64 encoding is a method for converting binary data into a string of ASCII characters. It is used extensively on the web and in software systems whenever binary data needs to travel through a medium that only handles text — such as email, JSON payloads, or HTML attributes.</p>
<h2>How Base64 Works</h2>
<p>Base64 uses a 64-character alphabet: <strong>A–Z</strong> (26), <strong>a–z</strong> (26), <strong>0–9</strong> (10), <strong>+</strong> and <strong>/</strong> (2). Every 3 bytes (24 bits) of input are split into four 6-bit groups, and each group maps to one character in the alphabet. If the input length is not divisible by 3, <code>=</code> padding characters are appended to round out the output.</p>
<p>For example, the three ASCII bytes for "Man" (77, 97, 110) become the Base64 string <code>TWFu</code>. The process is fully reversible — decoding maps those four characters back to the original three bytes.</p>
<h2>Why Base64 Exists</h2>
<p>Protocols like <strong>SMTP</strong> (email) were designed to carry 7-bit ASCII text, not arbitrary binary. Sending a JPEG directly would corrupt the data as mail servers stripped or mangled bytes above 127. Base64 sidesteps this by representing every byte using only printable ASCII characters. Similarly, JSON has no binary type, so embedding images or files in a JSON payload requires encoding them as a Base64 string.</p>
<h2>Size Overhead</h2>
<p>Base64 is not free — it inflates data by approximately <strong>33%</strong>. Every 3 bytes become 4 characters, so a 1 MB file becomes roughly 1.37 MB when encoded. For large files transferred over a network, this overhead is significant. Base64 is appropriate for small payloads (icons, tokens, certificates); for large file transfers, use multipart form uploads or pre-signed URLs instead.</p>
<h2>What Base64 Is NOT</h2>
<ul>
<li><strong>Not encryption</strong> — Base64 is trivially reversible by anyone. Never use it to "hide" sensitive data.</li>
<li><strong>Not compression</strong> — It makes data larger, not smaller. Do not confuse it with gzip or zstd.</li>
<li><strong>Not hashing</strong> — It is a lossless, reversible encoding. Unlike a hash, the original data can always be recovered.</li>
</ul>
<h2>Common Uses</h2>
<p>Base64 appears throughout modern software. <strong>Data URIs</strong> embed images directly in HTML or CSS (<code>src="data:image/png;base64,iVBOR..."</code>), eliminating a network request for small icons. <strong>JWT tokens</strong> use Base64URL (a URL-safe variant replacing <code>+</code> with <code>-</code> and <code>/</code> with <code>_</code>) to encode their header and payload. <strong>API keys and secrets</strong> are often Base64-encoded binary values. <strong>Email attachments</strong> are Base64-encoded by MIME before transmission. When you see a long string of letters, numbers, and occasional <code>+</code>, <code>/</code>, or <code>=</code>, it is almost certainly Base64.</p>`,
  },
  {
    slug: "uuid-guide",
    title: "UUIDs Explained: Versions, Uses, and How to Generate Them",
    description: "A UUID (Universally Unique Identifier) is a 128-bit identifier designed to be unique across space and time. Learn about UUID versions and when to use them.",
    category: "generators",
    publishedAt: "2026-04-17",
    readingTime: 5,
    toolSlug: "uuid-generator",
    content: `<p>A <strong>UUID</strong> (Universally Unique Identifier) is a 128-bit label used to uniquely identify information in computer systems. It is represented as 32 hexadecimal digits grouped by hyphens into the pattern <code>xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code> — for example, <code>550e8400-e29b-41d4-a716-446655440000</code>. The design goal is that UUIDs generated independently, on separate machines, with no coordination, will never collide.</p>
<h2>UUID Version 1: Time-Based</h2>
<p>UUID v1 combines the current timestamp (in 100-nanosecond intervals since October 1582) with the MAC address of the generating machine. This guarantees uniqueness across machines and time, but it carries a <strong>privacy concern</strong>: the MAC address of the server that generated the UUID is embedded in the value, making it possible to trace a UUID back to the machine that created it. V1 is rarely chosen for new systems today.</p>
<h2>UUID Version 4: Random</h2>
<p>UUID v4 is generated from <strong>122 bits of cryptographically random data</strong> (the remaining bits encode the version and variant). It is the most widely used version. With 2<sup>122</sup> possible values — roughly 5.3 undecillion — the probability of generating a duplicate is negligible in any real-world system. You would need to generate about <strong>2.71 quintillion</strong> UUIDs before reaching a 50% chance of a single collision. Use v4 whenever you need a unique identifier and do not require a deterministic value.</p>
<h2>UUID Version 5: Name-Based (Deterministic)</h2>
<p>UUID v5 generates a UUID from a <strong>namespace UUID</strong> and a <strong>name</strong> string, using a SHA-1 hash. The same namespace + name pair always produces the same UUID. This is useful when you want a stable identifier for a known entity — for example, generating a consistent UUID for a URL or a product SKU. V3 works the same way but uses MD5 instead of SHA-1; v5 is preferred for new code.</p>
<h2>The Nil UUID</h2>
<p>The <strong>nil UUID</strong> (<code>00000000-0000-0000-0000-000000000000</code>) has all bits set to zero. It is used as a sentinel value — similar to <code>null</code> — to indicate the absence of a UUID, such as an unassigned foreign key or an uninitialised identifier field.</p>
<h2>When to Use UUIDs</h2>
<p>UUIDs shine in <strong>distributed systems</strong> where multiple services or database shards need to generate IDs independently without a central coordinator. They are safe to use as <strong>primary keys</strong> in databases exposed to clients, since they do not reveal the size or growth rate of your dataset (unlike auto-incrementing integers). They also work well in <strong>URLs</strong> for resources where you do not want sequential IDs to be guessable.</p>
<h2>UUID vs Sequential IDs</h2>
<p>Sequential integers are simpler, shorter, and faster to index — B-tree indexes love monotonically increasing values. Random UUIDs cause <strong>index fragmentation</strong> in databases because new rows insert at random positions rather than always at the end. For high-write tables, this can be a meaningful performance concern. UUID v7 (a newer standard) addresses this by embedding a sortable timestamp prefix, giving you the uniqueness of UUIDs with the index-friendliness of sequential IDs.</p>`,
  },
  {
    slug: "cron-syntax-guide",
    title: "Cron Job Syntax Explained: A Complete Guide to Scheduling",
    description: "Cron syntax lets you schedule tasks to run automatically. This guide explains every field, special characters, and common patterns with examples.",
    category: "dev-tools",
    publishedAt: "2026-04-18",
    readingTime: 6,
    toolSlug: "cron-generator",
    content: `<p>Cron is the classic Unix job scheduler. A <strong>cron job</strong> is a command or script configured to run automatically at a specified time or interval. The schedule is defined using a compact five-field expression that can represent anything from "every minute" to "the last Friday of every third month at 11:45 PM."</p>
<h2>The Five Fields</h2>
<p>A cron expression has five space-separated fields, read left to right:</p>
<ul>
<li><strong>Minute</strong> — 0–59</li>
<li><strong>Hour</strong> — 0–23</li>
<li><strong>Day of month</strong> — 1–31</li>
<li><strong>Month</strong> — 1–12 (or JAN–DEC)</li>
<li><strong>Day of week</strong> — 0–7 (0 and 7 both mean Sunday, or SUN–SAT)</li>
</ul>
<p>A <code>*</code> in any field means "every valid value for this field." So <code>* * * * *</code> runs every minute of every hour of every day.</p>
<h2>Special Characters</h2>
<ul>
<li><code>*</code> — Wildcard: matches all values</li>
<li><code>/</code> — Step: <code>*/5</code> in the minute field means "every 5 minutes"</li>
<li><code>-</code> — Range: <code>9-17</code> in the hour field means "hours 9 through 17"</li>
<li><code>,</code> — List: <code>1,15</code> in the day field means "the 1st and 15th"</li>
</ul>
<h2>Common Patterns</h2>
<ul>
<li><code>*/5 * * * *</code> — Every 5 minutes</li>
<li><code>0 9 * * *</code> — Daily at 9:00 AM</li>
<li><code>0 0 * * 1-5</code> — Weekdays (Mon–Fri) at midnight</li>
<li><code>0 12 1 * *</code> — First of every month at noon</li>
<li><code>30 18 * * 5</code> — Every Friday at 6:30 PM</li>
<li><code>0 2 * * 0</code> — Every Sunday at 2:00 AM</li>
</ul>
<h2>@Shortcuts and Special Strings</h2>
<p>Many cron implementations support human-readable shortcuts. <code>@reboot</code> runs the job once when the system starts. <code>@daily</code> (or <code>@midnight</code>) is equivalent to <code>0 0 * * *</code>. <code>@hourly</code> is <code>0 * * * *</code>, and <code>@weekly</code> is <code>0 0 * * 0</code>. These improve readability for common schedules.</p>
<h2>Timezone Considerations</h2>
<p>By default, cron runs in the <strong>system timezone</strong> of the server. This is a common source of bugs — a job scheduled for "9 AM" will run at 9 AM in whatever timezone the server is configured to, which may differ from your local time or your users' time. Always confirm your server's timezone with <code>timedatectl</code> or <code>date</code>, and document the assumed timezone in comments above your crontab entries.</p>
<h2>Managing Crontabs and Common Mistakes</h2>
<p>Edit your crontab with <code>crontab -e</code> and list it with <code>crontab -l</code>. Common mistakes include forgetting to specify the full path to scripts (cron runs with a minimal <code>PATH</code>), scheduling overlapping jobs that can run simultaneously and cause contention, and accidentally running a heavy maintenance job during peak hours. Always test a new cron job manually before scheduling it, and redirect output to a log file (<code>command >> /var/log/myjob.log 2>&1</code>) so you can debug failures.</p>`,
  },
  {
    slug: "unix-timestamp-explained",
    title: "Unix Timestamps Explained: What They Are and How to Use Them",
    description: "A Unix timestamp counts seconds since January 1, 1970 UTC. Learn why they're used, how to convert them, and what the Year 2038 problem means.",
    category: "dev-tools",
    publishedAt: "2026-04-19",
    readingTime: 5,
    toolSlug: "timestamp-converter",
    content: `<p>A <strong>Unix timestamp</strong> (also called Unix time, POSIX time, or epoch time) is a single integer that represents a moment in time as the number of seconds elapsed since <strong>00:00:00 UTC on January 1, 1970</strong> — the "Unix epoch." As of early 2026, the current Unix timestamp is approximately 1,745,000,000. It ticks up by one every second, continuously and universally.</p>
<h2>Why Unix Timestamps Are Useful</h2>
<p>The Unix timestamp's greatest strength is that it is <strong>timezone-independent</strong>. A timestamp represents the same moment in time regardless of where in the world it is read. Storing timestamps as integers also makes arithmetic trivial — the duration between two events is simply the difference of their timestamps. No calendar logic, no daylight saving adjustments, no month-length edge cases. For logging, databases, APIs, and inter-system communication, Unix timestamps are the most reliable way to represent time.</p>
<h2>Seconds vs Milliseconds</h2>
<p>The original Unix timestamp counts in <strong>seconds</strong>. However, JavaScript's <code>Date</code> object works in <strong>milliseconds</strong> — <code>Date.now()</code> returns a number roughly 1,000 times larger than the Unix second timestamp. Many APIs and databases use millisecond precision. Always check which unit a timestamp is in; an easy heuristic is that second-precision timestamps in 2026 are roughly 10 digits long, while millisecond-precision timestamps are roughly 13 digits.</p>
<h2>Converting Timestamps in Code</h2>
<ul>
<li><strong>JavaScript</strong>: <code>Math.floor(Date.now() / 1000)</code> — current Unix second timestamp</li>
<li><strong>Python</strong>: <code>import time; time.time()</code> — float seconds since epoch</li>
<li><strong>SQL (MySQL)</strong>: <code>UNIX_TIMESTAMP()</code> — current timestamp; <code>FROM_UNIXTIME(ts)</code> — human-readable datetime</li>
<li><strong>SQL (PostgreSQL)</strong>: <code>EXTRACT(EPOCH FROM NOW())</code></li>
<li><strong>Bash</strong>: <code>date +%s</code></li>
</ul>
<h2>The Year 2038 Problem</h2>
<p>Many older systems store Unix timestamps as a <strong>32-bit signed integer</strong>, which can hold values up to 2,147,483,647. That maximum value corresponds to <strong>03:14:07 UTC on January 19, 2038</strong>. After that moment, a 32-bit signed counter overflows to a large negative number, causing dates to be misinterpreted as 1901. Modern systems use 64-bit integers, which extend the range to the year 292 billion — practically infinite. The risk today lies in legacy embedded systems, old databases, and C programs compiled with 32-bit <code>time_t</code>.</p>
<h2>Common Developer Tasks</h2>
<p>Unix timestamps make common date calculations straightforward. To check if a token has expired: compare <code>token.expiry</code> against the current timestamp. To calculate a user's age in seconds: subtract their birth timestamp from the current timestamp. To find events in the last 7 days: query for timestamps greater than <code>now - (7 * 24 * 3600)</code>. Negative timestamps represent moments before the epoch — <code>-1</code> is one second before midnight on January 1, 1970, which is valid and commonly supported.</p>`,
  },
  {
    slug: "regex-beginners-guide",
    title: "Regular Expressions (Regex) for Beginners: A Practical Guide",
    description: "Regular expressions let you search, match, and replace text patterns. This beginner-friendly guide covers the most useful regex syntax with examples.",
    category: "dev-tools",
    publishedAt: "2026-04-20",
    readingTime: 8,
    toolSlug: "regex-tester",
    content: `<p>A <strong>regular expression</strong> (regex or regexp) is a sequence of characters that defines a search pattern. Regex is built into virtually every programming language and text editor and is used for validating input, searching logs, parsing structured text, and performing find-and-replace operations. Learning even basic regex gives you a powerful tool that applies everywhere.</p>
<h2>Literals and Metacharacters</h2>
<p>Most characters in a regex match themselves literally. The pattern <code>cat</code> matches the string "cat" anywhere in the input. But certain characters have special meanings and are called <strong>metacharacters</strong>: <code>. * + ? ^ $ | [ ] { } ( ) \</code>. To match a literal metacharacter, escape it with a backslash — <code>\.</code> matches a literal period, <code>\(</code> matches a literal parenthesis.</p>
<h2>Character Classes</h2>
<p>Square brackets define a <strong>character class</strong> — a set of characters where any one member counts as a match.</p>
<ul>
<li><code>[aeiou]</code> — matches any single vowel</li>
<li><code>[a-z]</code> — matches any lowercase letter</li>
<li><code>[0-9]</code> — matches any digit (equivalent to <code>\d</code>)</li>
<li><code>[^0-9]</code> — matches any character that is NOT a digit</li>
<li><code>\w</code> — word character: <code>[a-zA-Z0-9_]</code></li>
<li><code>\s</code> — whitespace: spaces, tabs, newlines</li>
<li><code>\D</code>, <code>\W</code>, <code>\S</code> — uppercase versions negate their lowercase counterparts</li>
</ul>
<h2>Quantifiers</h2>
<p>Quantifiers specify how many times the preceding element must match:</p>
<ul>
<li><code>*</code> — zero or more</li>
<li><code>+</code> — one or more</li>
<li><code>?</code> — zero or one (makes the element optional)</li>
<li><code>{n}</code> — exactly n times</li>
<li><code>{n,m}</code> — between n and m times</li>
</ul>
<p>By default, quantifiers are <strong>greedy</strong> — they match as many characters as possible. Adding <code>?</code> after a quantifier makes it <strong>lazy</strong>, matching as few as possible: <code>.*?</code> is the lazy version of <code>.*</code>.</p>
<h2>Anchors and Groups</h2>
<p><strong>Anchors</strong> assert a position rather than matching a character. <code>^</code> matches the start of a string (or line in multiline mode), and <code>$</code> matches the end. The pattern <code>^\d{5}$</code> matches a string that is exactly 5 digits and nothing else — useful for validating a US ZIP code.</p>
<p><strong>Groups</strong> are created with parentheses. <code>(abc)+</code> matches one or more repetitions of "abc". Groups also <strong>capture</strong> the matched text so you can extract it — for example, <code>(\d{4})-(\d{2})-(\d{2})</code> captures the year, month, and day from a date string as separate groups.</p>
<h2>Flags</h2>
<p>Flags modify how the entire pattern behaves. The most common are <code>i</code> (case-insensitive: <code>cat</code> also matches "Cat" and "CAT"), <code>g</code> (global: find all matches, not just the first), and <code>m</code> (multiline: <code>^</code> and <code>$</code> match the start and end of each line rather than the whole string).</p>
<h2>Practical Examples</h2>
<ul>
<li><strong>Email (simplified)</strong>: <code>^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$</code></li>
<li><strong>Phone (US)</strong>: <code>^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$</code></li>
<li><strong>Extract numbers</strong>: <code>\d+\.?\d*</code> finds integers and decimals in text</li>
<li><strong>HTML tag (basic)</strong>: <code>&lt;[^&gt;]+&gt;</code> matches any HTML tag</li>
<li><strong>Hex color</strong>: <code>#[0-9a-fA-F]{3,6}</code></li>
</ul>
<p>The best way to learn regex is to experiment. Use a regex tester with real input so you can see matches highlight in real time as you refine your pattern.</p>`,
  },
  {
    slug: "robots-txt-guide",
    title: "robots.txt Explained: How to Control Search Engine Crawlers",
    description: "The robots.txt file tells search engine crawlers which pages they can and cannot access. Learn the syntax, best practices, and common mistakes.",
    category: "seo-tools",
    publishedAt: "2026-04-21",
    readingTime: 5,
    toolSlug: "robots-txt-generator",
    content: `<p>Every website can have a file called <strong>robots.txt</strong> that instructs web crawlers (such as Googlebot, Bingbot, or any other automated agent) about which parts of the site they are allowed to access. It is always located at the root of a domain: <code>https://example.com/robots.txt</code>. Crawlers are expected to fetch and respect this file before crawling any other page.</p>
<h2>The Basic Syntax</h2>
<p>A robots.txt file consists of one or more <strong>records</strong>. Each record starts with a <code>User-agent</code> directive (identifying which crawler the rules apply to) followed by one or more <code>Allow</code> or <code>Disallow</code> directives.</p>
<ul>
<li><code>User-agent: *</code> — applies to all crawlers</li>
<li><code>User-agent: Googlebot</code> — applies only to Google's crawler</li>
<li><code>Disallow: /admin/</code> — blocks the crawler from any URL starting with /admin/</li>
<li><code>Allow: /admin/public</code> — overrides a broader Disallow for a specific path</li>
<li><code>Sitemap: https://example.com/sitemap.xml</code> — tells crawlers where to find your sitemap</li>
</ul>
<h2>Common Use Cases</h2>
<p>Most sites use robots.txt to block a handful of paths that should not appear in search results. Common examples include <code>/admin/</code> (back-office tools), <code>/search?</code> (internal search result pages, which create near-duplicate content), <code>/cart</code> and <code>/checkout</code> (e-commerce transactional pages), and <code>/staging/</code> or <code>/preview/</code> environments accidentally exposed on production domains.</p>
<h2>What robots.txt Does NOT Do</h2>
<p>It is critical to understand the limits of robots.txt. It is an <strong>advisory protocol</strong> — well-behaved crawlers respect it, but malicious bots or scrapers ignore it entirely. <code>Disallow</code> prevents a crawler from <em>accessing</em> a URL, but it does not prevent that URL from appearing in search results if other sites link to it. To prevent indexing, you need a <code>noindex</code> meta tag or HTTP header on the page itself. Also, robots.txt rules do not prevent direct user access — it is not a security mechanism.</p>
<h2>Googlebot-Specific Rules</h2>
<p>Google respects both <code>User-agent: *</code> and <code>User-agent: Googlebot</code> rules. More specific rules take precedence. Crucially, <strong>do not block Googlebot from accessing your CSS and JavaScript files</strong> — Google needs to render your pages to understand their content, and blocking these resources can cause Google to misinterpret or under-rank your pages.</p>
<h2>Testing and Common Mistakes</h2>
<p>Google Search Console's <strong>robots.txt Tester</strong> lets you paste your file and test any URL against it, showing which rule applies. The most catastrophic mistake is accidentally blocking the entire site with <code>Disallow: /</code> — this prevents Googlebot from crawling anything, causing the site to disappear from search results. Always test changes to robots.txt in Search Console before deploying. Another common mistake is thinking robots.txt is sufficient to keep pages private; use proper authentication for any genuinely sensitive content.</p>`,
  },
  {
    slug: "xml-sitemap-guide",
    title: "XML Sitemaps: The Complete Guide for Better SEO",
    description: "An XML sitemap lists your website's pages to help search engines crawl and index your content. Learn how to create one, what to include, and how to submit it.",
    category: "seo-tools",
    publishedAt: "2026-04-22",
    readingTime: 6,
    toolSlug: "sitemap-generator",
    content: `<p>An <strong>XML sitemap</strong> is a file that lists the URLs of your website and provides metadata about each page — when it was last updated, how often it changes, and its relative importance. Search engines like Google and Bing use sitemaps as a roadmap to discover and crawl your content more efficiently. While Google can find most pages by following links, a sitemap is especially valuable for large sites, new sites with few inbound links, and sites with pages that are not well interlinked.</p>
<h2>The Basic Structure</h2>
<p>An XML sitemap uses a straightforward format. The root element is <code>&lt;urlset&gt;</code>, and each URL is wrapped in a <code>&lt;url&gt;</code> element containing:</p>
<ul>
<li><code>&lt;loc&gt;</code> — the full URL (required)</li>
<li><code>&lt;lastmod&gt;</code> — last modification date in ISO 8601 format (e.g. <code>2026-04-22</code>)</li>
<li><code>&lt;changefreq&gt;</code> — hint for how often the page changes: <code>always</code>, <code>hourly</code>, <code>daily</code>, <code>weekly</code>, <code>monthly</code>, <code>yearly</code>, <code>never</code></li>
<li><code>&lt;priority&gt;</code> — relative importance from 0.0 to 1.0 (default 0.5)</li>
</ul>
<p>Note that <code>changefreq</code> and <code>priority</code> are hints, not commands — Google has stated it largely ignores them. The most useful fields are <code>loc</code> and <code>lastmod</code>.</p>
<h2>What to Include</h2>
<p>Include every <strong>canonical, indexable, publicly accessible</strong> page you want to appear in search results. This means your homepage, category pages, product or article pages, and any other important content. Only include URLs that return a 200 status code and do not have a <code>noindex</code> directive.</p>
<h2>What NOT to Include</h2>
<ul>
<li>Pages blocked by <code>robots.txt</code> — crawlers may ignore sitemap entries for blocked URLs</li>
<li>Pages with <code>noindex</code> meta tags — do not tell Google to index them via sitemap while telling it not to via the page</li>
<li>Redirect URLs — only include the final destination</li>
<li>Duplicate content pages — only include the canonical version</li>
<li>Paginated pages beyond page 1 or 2, unless each has substantial unique content</li>
</ul>
<h2>Size Limits and Sitemap Index Files</h2>
<p>A single sitemap file is limited to <strong>50,000 URLs</strong> and a maximum uncompressed size of <strong>50 MB</strong>. Large sites that exceed these limits use a <strong>sitemap index file</strong> — an XML file that lists multiple individual sitemap files, each within the limits. The sitemap index uses <code>&lt;sitemapindex&gt;</code> as the root element and <code>&lt;sitemap&gt;</code> entries pointing to each child sitemap.</p>
<h2>Submitting and Testing Your Sitemap</h2>
<p>The most effective way to submit your sitemap is via <strong>Google Search Console</strong>: navigate to Sitemaps, enter the path (e.g. <code>/sitemap.xml</code>), and click Submit. You can also reference your sitemap in <code>robots.txt</code> with the line <code>Sitemap: https://example.com/sitemap.xml</code> — crawlers will find it automatically. Search Console's URL Inspection tool lets you test individual URLs to check whether they are indexed and whether the sitemap is the discovery source. Re-submit your sitemap whenever you publish significant new content or restructure your site.</p>`,
  },
  {
    slug: "image-compression-guide",
    title: "Image Compression Explained: Reduce File Size Without Losing Quality",
    description: "Large images slow down your website and hurt Core Web Vitals. Learn how image compression works, lossy vs lossless, and the best formats to use.",
    category: "image-tools",
    publishedAt: "2026-04-23",
    readingTime: 6,
    toolSlug: "image-compressor",
    content: `<p>Images are typically the largest assets on a web page. Unoptimised images slow down page loads, hurt your <strong>Largest Contentful Paint (LCP)</strong> score — a key Core Web Vitals metric — and waste bandwidth for users on mobile data. Proper image compression is one of the highest-return performance optimisations available for most websites.</p>
<h2>Lossy vs Lossless Compression</h2>
<p><strong>Lossless compression</strong> reduces file size without discarding any image data. The original pixels can be perfectly reconstructed from the compressed file. PNG uses lossless compression, making it ideal for images that require exact fidelity: screenshots, logos with sharp edges, diagrams, and text on images.</p>
<p><strong>Lossy compression</strong> achieves much greater size reduction by permanently removing data that is imperceptible to the human eye. JPEG uses lossy compression and is the standard for photographs. WebP supports both lossy and lossless modes in a single format. Once a lossy image is saved, the discarded data is gone — repeatedly re-saving a JPEG degrades quality each time.</p>
<h2>How Lossy Compression Works</h2>
<p>JPEG compression uses a technique called <strong>Discrete Cosine Transform (DCT)</strong>. The image is divided into 8×8 pixel blocks. Each block is transformed into a frequency representation, and high-frequency details (fine textures, subtle gradients) that the human visual system is less sensitive to are quantised (rounded) more aggressively. Lower quality settings quantise more aggressively, producing smaller files but more visible artifacts — the characteristic blocky or "ringing" patterns around sharp edges in heavily compressed JPEGs.</p>
<h2>Quality Settings and the Sweet Spot</h2>
<p>For JPEG and WebP, a quality setting of <strong>75–85%</strong> typically achieves 70–85% file size reduction compared to the uncompressed original, with minimal visible quality loss for photographs. Going below 70% starts to introduce noticeable artifacts; going above 90% produces diminishing returns in quality for large increases in file size. A practical rule: export at quality 80 and compare the result visually at the intended display size — not zoomed in at 100%.</p>
<h2>Modern Formats: WebP and AVIF</h2>
<p><strong>WebP</strong>, developed by Google, produces files <strong>25–35% smaller than JPEG</strong> at equivalent visual quality and has near-universal browser support as of 2024. <strong>AVIF</strong> (based on the AV1 video codec) compresses even further — often 50% smaller than JPEG — but encoding is slower and browser support, while growing, is not yet universal. For most websites, WebP is the pragmatic choice today. Use AVIF for high-traffic hero images where the extra savings justify the encoding time.</p>
<h2>Responsive Images and Lazy Loading</h2>
<p>Serving the right image size for each device is as important as compression. A 2400px wide hero image delivered to a 375px mobile screen wastes significant bandwidth. Use the <code>srcset</code> attribute to provide multiple resolutions and let the browser choose the appropriate one. Combine this with <code>loading="lazy"</code> on images below the fold so they are not downloaded until the user scrolls near them — this directly improves initial page load time and LCP.</p>
<h2>Practical Size Targets</h2>
<ul>
<li><strong>Hero / full-width images</strong>: aim for under 200 KB in WebP</li>
<li><strong>Article body images</strong>: under 100 KB</li>
<li><strong>Thumbnails and card images</strong>: under 50 KB</li>
<li><strong>Icons and logos</strong>: use SVG where possible (infinitely scalable, often under 5 KB)</li>
</ul>
<p>These are targets, not hard limits — a complex photograph may warrant more. The guiding principle is to never serve more bytes than the content requires at the size it will actually be displayed.</p>`,
  },
  {
    slug: "what-is-typescript",
    title: "What Is TypeScript and Why Should You Use It?",
    description:
      "TypeScript adds a type system to JavaScript that catches errors before your code runs. Here is what that means in practice, what the actual benefits are, and when it is worth the extra setup.",
    category: "compilers",
    publishedAt: "2026-05-15",
    readingTime: 6,
    toolSlug: "typescript-compiler",
    content: `<p>TypeScript is a typed superset of JavaScript developed by Microsoft and open-sourced in 2012. The core idea is simple: add a type system to JavaScript without changing how it runs. TypeScript code is transpiled to plain JavaScript before execution — you never run TypeScript directly. The compiler produces <code>.js</code> files that any JavaScript runtime understands.</p>
<h2>The Type System at a Glance</h2>
<p>TypeScript lets you annotate variables, function parameters, and return values with types. These annotations exist only in the source code and are completely erased at compile time — they produce zero runtime overhead.</p>
<pre style="background:#1a1a1a;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;color:#e4e4e4;overflow:auto">function greet(name: string): string {
  return "Hello, " + name;
}

greet(42); // Error: Argument of type 'number' is not assignable to parameter of type 'string'.</pre>
<p>Without TypeScript, that error appears at runtime — or silently produces <code>"Hello, 42"</code> after JavaScript's type coercion kicks in. With TypeScript, it appears in your editor before you even run the code.</p>
<h2>Type Inference: You Don't Always Have to Annotate</h2>
<p>TypeScript infers types from context. When you write <code>const x = 5</code>, TypeScript knows <code>x</code> is a number without you writing <code>const x: number = 5</code>. Inference is surprisingly good — in practice you annotate function signatures and let TypeScript figure out most internal variable types automatically.</p>
<h2>Interfaces and Type Aliases</h2>
<p>TypeScript lets you define the shape of objects using interfaces or type aliases:</p>
<pre style="background:#1a1a1a;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;color:#e4e4e4;overflow:auto">interface User {
  id: number;
  email: string;
  role: "admin" | "viewer";
}</pre>
<p>These shapes serve as contracts. Any object passed where a <code>User</code> is expected must have all three fields with matching types. This makes function signatures self-documenting and prevents entire categories of null and undefined errors.</p>
<h2>The Practical Benefits That Actually Matter</h2>
<ul>
<li><strong>IDE autocompletion</strong>: Because the compiler knows the type of every variable, your editor can show relevant methods and properties as you type. This is the most immediate benefit — it turns your editor into live documentation.</li>
<li><strong>Safer refactoring</strong>: Rename a property and the compiler shows every place that property is used. Without TypeScript, a rename is a search-and-replace with uncertain coverage.</li>
<li><strong>Errors before deployment</strong>: Type errors surface in your editor or CI pipeline, not in production logs from user reports.</li>
</ul>
<h2>Why JavaScript Doesn't Have Types Built In</h2>
<p>JavaScript was written in 10 days in 1995 as a browser scripting language. The priority was ease of use and quick interactivity, not large-scale software engineering. By the time JavaScript became the backbone of complex applications, backward compatibility made changing the core language a delicate process. TypeScript side-steps this entirely — compile away the types, ship plain JavaScript.</p>
<h2>Common Misconceptions</h2>
<ul>
<li><strong>"TypeScript is slower"</strong> — TypeScript is the compiler; the output is identical JavaScript. Runtime performance is exactly the same.</li>
<li><strong>"TypeScript is verbose"</strong> — With type inference, you write fewer annotations than most people expect. You annotate function signatures; inference handles the rest.</li>
<li><strong>"It's only for big teams"</strong> — The IDE experience alone improves solo projects. The break-even is smaller than the reputation suggests.</li>
</ul>
<h2>Getting Started</h2>
<p>Most modern JavaScript toolchains support TypeScript out of the box. In a Next.js project: <code>npx create-next-app --typescript</code>. In a Node project: <code>npm install -D typescript @types/node && npx tsc --init</code>. The <code>tsconfig.json</code> that <code>tsc --init</code> generates is your starting configuration — the defaults are reasonable.</p>`,
  },
  {
    slug: "run-python-without-installing",
    title: "How to Run Python Code Without Installing Anything",
    description:
      "Need to run a Python script but don't want to install Python locally? Here are the real options — browser-based compilers, cloud notebooks, and hosted environments — with honest trade-offs for each.",
    category: "compilers",
    publishedAt: "2026-05-16",
    readingTime: 4,
    toolSlug: "python-compiler",
    content: `<p>Several options exist for running Python code without going through a local installation. The right choice depends on what you are trying to do — a quick logic test, a full data analysis notebook, or a persistent development environment.</p>
<h2>Option 1: A Browser-Based Python Compiler</h2>
<p>The fastest option for quick experiments is a browser-based compiler. Open the page, type your code, click Run. No account required, no package downloads. The ToolMonk Python Compiler runs Python 3 in an isolated sandbox. It supports standard input (stdin), so you can test programs that read user input. The limitation is that it runs only the Python standard library — no NumPy, pandas, or third-party packages. For logic, algorithms, string manipulation, and anything in the standard library, it is instant and friction-free.</p>
<h2>Option 2: Google Colab</h2>
<p>Google Colaboratory is a hosted Jupyter notebook environment that runs Python in Google's cloud. You sign in with a Google account, open a new notebook, and start writing code in cells. The key advantage is that hundreds of packages — NumPy, pandas, scikit-learn, TensorFlow, Matplotlib — are pre-installed. You do not install or configure anything. Colab is the standard environment for sharing data science work and following ML tutorials. Free tier runs on CPUs; GPU and TPU time requires Colab Pro. Each session resets when the runtime disconnects, so it is not suited for persistent long-running processes.</p>
<h2>Option 3: GitHub Codespaces / Gitpod</h2>
<p>If you have a GitHub account, you can open any repository in Codespaces — a full VS Code environment running in a Docker container in the cloud. You get a complete Linux development environment: a terminal, a file system, Python, and extension support. This is appropriate when you need a real file system, want to install arbitrary packages with <code>pip</code>, or need to clone and run an existing project. GitHub provides 60 free core-hours per month. Gitpod offers a similar service and works with GitLab and Bitbucket.</p>
<h2>Option 4: Python in the Browser via WebAssembly (Pyodide)</h2>
<p>Pyodide is a Python runtime compiled to WebAssembly that runs directly in your browser, with no server involved. PyScript is a framework built on top of Pyodide. These are interesting technically — your Python code executes locally in the browser tab. However, they have real limitations: packages with compiled C extensions may not be available, startup time is several seconds, and CPU-heavy code is slower than server-side Python. These are more relevant for embedding Python in web pages than for general coding experiments.</p>
<h2>When You Should Actually Install Python</h2>
<p>Browser-based options work well for learning, quick logic tests, and following tutorials. But they are not substitutes for a local installation. You cannot read or write local files, install arbitrary packages, run long-running processes, or build applications. For anything beyond experimentation, install Python locally. <code>python.org/downloads</code> has installers for Windows, macOS, and Linux. On macOS, Homebrew (<code>brew install python</code>) is a common choice. Use <code>pyenv</code> if you need to switch between Python versions for different projects.</p>`,
  },
  {
    slug: "compiled-vs-interpreted-languages",
    title: "Compiled vs Interpreted Languages: What's the Difference?",
    description:
      "When you run a Python script or compile a C program, something translates your source code into CPU instructions. How and when that translation happens is the difference between compiled and interpreted languages — and it matters for performance.",
    category: "compilers",
    publishedAt: "2026-05-18",
    readingTime: 5,
    toolSlug: "code-compiler",
    content: `<p>When you run a program, something has to translate the human-readable source code you wrote into binary instructions the CPU can execute. The question is: when does that translation happen, and how?</p>
<h2>Compiled Languages</h2>
<p>In a compiled language, a separate program called the <strong>compiler</strong> reads your entire source code and produces a new file containing machine code (or bytecode) before any of it runs. This translation step is completely separate from execution. In C, for example, <code>gcc main.c -o main</code> produces a binary you then run as <code>./main</code>. The compiler also catches syntax errors and many type errors during this step — before the program touches any real data.</p>
<p>Compilation advantages:</p>
<ul>
<li><strong>Faster execution</strong> — machine code runs directly on the CPU with no per-instruction translation overhead at runtime</li>
<li><strong>Errors caught before runtime</strong> — the compiler can flag issues statically that would otherwise crash your program with real users</li>
<li><strong>Single deployable artifact</strong> — Go and Rust produce a static binary that contains everything needed to run</li>
</ul>
<p>Examples: C, C++, Go, Rust, Swift</p>
<h2>Interpreted Languages</h2>
<p>An interpreter processes source code at runtime, translating and executing instructions as it reads them. Python and Ruby work this way. When you run <code>python script.py</code>, the interpreter reads the file, parses it, and executes it — there is no separate compilation step you need to trigger manually.</p>
<p>Interpretation advantages:</p>
<ul>
<li><strong>Faster development iteration</strong> — change the file, run it immediately. No compile step.</li>
<li><strong>More dynamic at runtime</strong> — some languages allow loading and executing new code at runtime via <code>eval</code> or dynamic imports</li>
<li><strong>More portable</strong> — the interpreter handles platform differences, so the same source runs everywhere the interpreter is installed</li>
</ul>
<p>Examples: Python, Ruby, PHP, Bash</p>
<h2>Most Modern Languages Sit in the Middle</h2>
<p>The compiled/interpreted binary is a simplification. Most real runtimes use a combination of techniques:</p>
<ul>
<li><strong>Java</strong> compiles source code to bytecode (<code>.class</code> files), then the JVM interprets that bytecode — and also JIT-compiles hot code paths to native machine code at runtime</li>
<li><strong>Python (CPython)</strong> also compiles to bytecode (<code>.pyc</code> files) transparently before interpreting — you normally never see this step</li>
<li><strong>JavaScript in V8</strong> starts by interpreting your code, identifies frequently-called ("hot") functions, and JIT-compiles them to native machine code — all transparently while your script runs</li>
<li><strong>TypeScript</strong> is transpiled (compiled) to JavaScript by the TypeScript compiler, which then runs through the JavaScript engine's own pipeline</li>
</ul>
<h2>JIT Compilation: The Best of Both Worlds</h2>
<p>Just-In-Time (JIT) compilation is the technique that powers modern JavaScript, Java, and .NET performance. The runtime profiles your code as it executes, identifies which functions are called most often, and compiles just those hot paths to native machine code while the rest continues to be interpreted. This produces performance close to fully compiled languages for the code that matters, while keeping the flexibility and quick startup of an interpreter.</p>
<h2>When the Difference Actually Matters</h2>
<p>Compiled languages (C, C++, Go, Rust) are generally 10–100× faster than interpreted languages (Python, Ruby) for <strong>CPU-bound tasks</strong> — cryptography, video encoding, physics simulation, parsing large files. For <strong>I/O-bound work</strong> — web servers waiting on database queries, file reads, or network responses — the language's execution speed is rarely the bottleneck, and the gap shrinks dramatically. A Python web server handling thousands of requests per second is limited by database latency, not CPython's interpreter.</p>`,
  },
  {
    slug: "what-is-go-used-for",
    title: "What Is Go (Golang) Used For? Real-World Applications Explained",
    description:
      "Go was built at Google to solve specific problems with large-scale software. A decade later it powers Docker, Kubernetes, Terraform, and a significant share of cloud infrastructure. Here is what makes it the right tool for those jobs.",
    category: "compilers",
    publishedAt: "2026-05-20",
    readingTime: 5,
    toolSlug: "go-compiler",
    content: `<p>Go (formally Golang) was released by Google in 2009, designed by Robert Griesemer, Rob Pike, and Ken Thompson — three people with deep roots in Unix and C. The motivation was practical frustration: building large C++ services at Google involved slow compilation, complex dependency management, and concurrency that was hard to reason about. Go was designed to fix those specific problems.</p>
<h2>Cloud Infrastructure and DevOps Tooling</h2>
<p>This is where Go has had its most visible impact. Docker, Kubernetes, Terraform, Prometheus, and Consul are all written in Go. The pattern is consistent: these are networked services with high concurrency requirements that need to compile to a single static binary (easy to package in a container) and run on Linux servers with no external runtime. A Go binary has no JVM dependency, no Python interpreter, no <code>node_modules</code> to manage. You copy one file, make it executable, and run it. This deployment simplicity is a major reason the DevOps ecosystem converged on Go.</p>
<h2>Network Services and REST APIs</h2>
<p>Go's standard library includes a production-ready HTTP server in <code>net/http</code>. Building an API server in Go requires no third-party framework — the standard library handles routing, middleware, and TLS. For teams that want more structure, Gin and Echo add minimal abstraction with minimal overhead. Go services routinely handle hundreds of thousands of requests per second on modest hardware. The goroutine model — lightweight threads managed by the Go runtime, not the OS — makes high-concurrency servers straightforward to write without the callback-heavy patterns of Node.js or the GIL-limited threading of Python.</p>
<h2>Command-Line Tools</h2>
<p>Go's single-binary compilation makes it ideal for CLI tools that you want to distribute without asking users to install a runtime. The user downloads one file, marks it executable, and runs it. This is why many widely-used CLIs are written in Go: <code>kubectl</code>, <code>gh</code> (GitHub CLI), <code>hugo</code> (static site generator), <code>golangci-lint</code>, <code>lazygit</code>. The Cobra and Kong libraries are popular for building structured CLI applications with subcommands, flag parsing, and help generation.</p>
<h2>What Go Is Not Designed For</h2>
<p>Go is a poor fit for data science and machine learning — the ecosystem simply does not exist there. Python dominates that space and Go has no equivalent of NumPy, pandas, or PyTorch. Go also lacks the zero-cost abstractions of Rust and the raw performance ceiling of C/C++, so extremely performance-critical work (game engines, embedded firmware, cryptography at the hardware level) typically stays in those languages. Go's deliberate simplicity also means code that would be elegant with macros or operator overloading is sometimes more verbose.</p>
<h2>The Language Design Philosophy</h2>
<p>Go has a deliberately small language specification. The designers believed that languages accumulate features over time, increasing complexity without proportional benefit. Go has 25 keywords. C has 32. C++ has over 90. There is exactly one way to write a for loop. <code>gofmt</code> enforces a single code style across the entire ecosystem, eliminating style debates. These choices mean that Go code written by different developers at different companies looks nearly identical — a real benefit when reading unfamiliar code in a large team or open-source project.</p>`,
  },
  {
    slug: "how-to-read-stack-trace",
    title: "How to Read a Stack Trace: Python, Java, and JavaScript Errors Explained",
    description:
      "A stack trace tells you exactly what went wrong and how the program got there. Here is how to read stack traces in Python, Java, and JavaScript — including the parts most developers skip over.",
    category: "compilers",
    publishedAt: "2026-05-22",
    readingTime: 7,
    toolSlug: "python-compiler",
    content: `<p>A stack trace is the error message your program prints when it crashes unexpectedly. It tells you what went wrong and shows the entire chain of function calls that led there. Most developers learn to scan stack traces by trial and error — this guide explains each section so you can parse them quickly the first time.</p>
<h2>What a Stack Trace Represents</h2>
<p>When function A calls function B calls function C, the runtime keeps track of that chain on the <strong>call stack</strong>. If C throws an error, the stack trace shows A → B → C and marks exactly which line in C caused the problem. Reading from the bottom of the trace up usually gets you to the relevant code fastest — the outermost call (your top-level code) is at one end; the crash site is at the other.</p>
<h2>Python Tracebacks</h2>
<p>Python calls its stack traces "tracebacks" and prints them from oldest call to newest, with the actual error on the last line:</p>
<pre style="background:#1a1a1a;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;color:#e4e4e4;overflow:auto">Traceback (most recent call last):
  File "app.py", line 12, in &lt;module&gt;
    result = process(data)
  File "app.py", line 7, in process
    return parse(item)
  File "app.py", line 3, in parse
    return int(item)
ValueError: invalid literal for int() with base 10: 'abc'</pre>
<p>How to read it:</p>
<ul>
<li>The <strong>last line</strong> is the actual error — the exception type (<code>ValueError</code>) followed by a description. Start here.</li>
<li>Each <code>File</code> block shows one step in the call chain: file name, line number, and function name.</li>
<li>The indented line below each block is the exact source code at that location.</li>
<li>"Most recent call last" means the crash site is at the <em>bottom</em>. Read upward to trace the cause.</li>
</ul>
<p>Python's built-in exception names are descriptive: <code>TypeError</code> (wrong type), <code>AttributeError</code> (attribute doesn't exist on that object), <code>KeyError</code> (key not in dict), <code>IndexError</code> (list index out of range), <code>ValueError</code> (right type, wrong value).</p>
<h2>Java Stack Traces</h2>
<p>Java prints the exception type and message first, then the call chain from innermost to outermost:</p>
<pre style="background:#1a1a1a;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;color:#e4e4e4;overflow:auto">Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "str" is null
    at com.example.StringUtil.process(StringUtil.java:14)
    at com.example.App.main(App.java:8)</pre>
<p>How to read it:</p>
<ul>
<li>The first line: exception class (<code>NullPointerException</code>) plus a description of what was being attempted when it failed.</li>
<li>Each <code>at</code> line: <code>package.ClassName.methodName(FileName.java:lineNumber)</code></li>
<li>The <strong>top</strong> <code>at</code> line is the crash site — start there, then read down to see how you got there.</li>
</ul>
<p>Java exception names communicate the cause directly: <code>NullPointerException</code> means a method was called on a null reference. <code>ArrayIndexOutOfBoundsException</code> means you accessed an index beyond the array's length. <code>ClassCastException</code> means you tried to cast an object to a type it is not. <code>StackOverflowError</code> means infinite recursion exhausted the call stack.</p>
<p>Watch for <strong>"Caused by:"</strong> chains at the bottom of Java traces. When one exception wraps another, Java prints both. The innermost "Caused by:" is typically the root cause — work backwards from there.</p>
<h2>JavaScript Stack Traces</h2>
<p>JavaScript prints the error message and the call chain from newest to oldest:</p>
<pre style="background:#1a1a1a;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;color:#e4e4e4;overflow:auto">TypeError: Cannot read properties of undefined (reading 'name')
    at getUser (app.js:15:22)
    at handleRequest (app.js:8:14)
    at Server.&lt;anonymous&gt; (app.js:3:5)</pre>
<p>How to read it:</p>
<ul>
<li>First line: error type and a description of what operation failed.</li>
<li>Each <code>at</code> line: <code>functionName (file:line:column)</code> — the column number helps with long lines.</li>
<li>The <strong>top</strong> <code>at</code> line is the crash site.</li>
<li>In browser devtools, stack trace lines are <strong>clickable</strong> — clicking any <code>at</code> line jumps directly to that file and line in the Sources panel.</li>
</ul>
<h2>Common Pitfalls</h2>
<ul>
<li><strong>Minified production code</strong>: Browser stack traces in production often point into a minified bundle with single-character variable names. Source maps link those positions back to your original source. Make sure your build system generates source maps and your error tracking service uploads them.</li>
<li><strong>Async stack traces</strong>: Errors thrown inside async callbacks used to produce truncated traces that stopped at the <code>await</code> boundary. Modern Node.js (12+) and current browsers maintain async stack traces across awaits — but older environments or obscure runtimes may still truncate them.</li>
<li><strong>The error you see is not always the one that matters</strong>: In all three languages, an error caught and rethrown elsewhere will show you the rethrow site, not the original failure. Look for "caused by" chains in Java, and check that your error handlers preserve original error context rather than discarding it.</li>
</ul>`,
  },
  {
    slug: "php-vs-python-web-development",
    title: "PHP vs Python for Web Development: An Honest Comparison",
    description:
      "PHP was built specifically for the web in 1994. Python was a general-purpose language that grew web frameworks later. That history shapes everything about how they deploy, what ecosystem you get, and which is the right choice for your project.",
    category: "compilers",
    publishedAt: "2026-05-24",
    readingTime: 6,
    toolSlug: "php-compiler",
    content: `<p>PHP and Python are both used to build web applications, but they arrived at web development from opposite directions. PHP was designed from day one to generate HTML on a server. Python was designed as a general-purpose language and grew a web ecosystem afterward. That difference shapes deployment, frameworks, and what each language is best at.</p>
<h2>PHP's Web-First Design</h2>
<p>PHP (originally "Personal Home Page," now "PHP: Hypertext Preprocessor") was created by Rasmus Lerdorf in 1994 specifically to embed dynamic content in HTML pages. PHP files mix HTML markup with server-side code; Apache or Nginx executes the PHP and returns the rendered output. The "page-at-a-time" execution model — each request spins up a fresh PHP process — makes deployment simple: copy files to the server. No daemon to manage, no port binding, no reverse proxy required for basic setups. This simplicity is a big part of why PHP powers WordPress, which runs on roughly 43% of all websites.</p>
<h2>Python's Web Ecosystem</h2>
<p>Python has three dominant web frameworks with different design philosophies:</p>
<ul>
<li><strong>Django</strong> — "batteries included." ORM, admin panel, auth system, and templating all built in. Opinionated about structure, which helps large teams stay consistent. Used by Instagram, Pinterest, and Disqus at scale.</li>
<li><strong>Flask</strong> — micro-framework. No ORM, no admin, no auth out of the box. You pick and compose your own tools. Better suited to simpler APIs or services where Django's structure would feel like overhead.</li>
<li><strong>FastAPI</strong> — the modern choice for JSON APIs. Auto-generates OpenAPI documentation from type annotations, built on async I/O (ASGI), and has performance close to Node.js for async workloads.</li>
</ul>
<p>Python's web frameworks all require deploying a persistent process (Gunicorn or Uvicorn) and a reverse proxy (Nginx). More moving parts than PHP, but this is standard practice with good tooling.</p>
<h2>Performance</h2>
<p>Modern PHP 8.x includes a JIT compiler and is meaningfully faster than PHP 7. Modern Python 3.12+ has also made significant performance improvements. Both are interpreted languages, and for typical web applications where the bottleneck is the database query, neither runtime speed is relevant. Where it matters — high-throughput APIs handling thousands of requests per second — Python's FastAPI with async I/O is competitive, though neither matches Go or Node.js for raw concurrency at scale.</p>
<h2>The Type System</h2>
<p>Both PHP and Python support optional type annotations but do not enforce them at runtime by default. PHP added union types in PHP 8.0 and enums in PHP 8.1. Python's typing module (PEP 484) has been available since 3.5, and mypy is the standard static checker. Both ecosystems have type annotation support; neither makes it mandatory. If you want compile-time type safety for web development, TypeScript with Node.js (or a compiled language like Go) is a stronger option than either.</p>
<h2>Where PHP Still Dominates</h2>
<p>WordPress, Drupal, Joomla, and Magento are all PHP. If your work involves building WordPress themes, plugins, or custom WordPress-based applications, PHP is the only sensible choice — the entire ecosystem assumes it. PHP also has the advantage that shared hosting providers support it universally; Python often requires a VPS or cloud deployment.</p>
<h2>Where Python Is Stronger</h2>
<p>If your web application needs to interact with machine learning models, process data with pandas, run computer vision pipelines, or integrate with scientific computing libraries, Python is the only practical choice. Python also dominates data-heavy API backends where the server is primarily transforming and serving processed data rather than rendering HTML pages.</p>
<h2>Which to Choose for a New Project</h2>
<p>Building a new web application from scratch with no existing constraints: Python with FastAPI or Django gives you a modern, well-maintained ecosystem with better type support and cleaner language design. Working with an existing PHP codebase or the WordPress ecosystem: PHP is the pragmatic choice. Starting web development for the first time with no prior exposure: Python's syntax is more consistent and cleaner, making it a gentler learning environment — though if your goal is specifically WordPress or shared-hosting work, PHP is where you need to end up.</p>`,
  },
];

export function getArticle(slug: string): BlogArticle | undefined {
  return ARTICLES.find(a => a.slug === slug);
}
