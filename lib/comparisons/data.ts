export interface ComparisonItem {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  optionA: {
    name: string;
    summary: string;
    pros: string[];
    cons: string[];
  };
  optionB: {
    name: string;
    summary: string;
    pros: string[];
    cons: string[];
  };
  comparisonTable: Array<{
    aspect: string;
    a: string;
    b: string;
  }>;
  verdict: string;
  relatedToolSlugs: string[];
}

export const COMPARISONS: ComparisonItem[] = [
  {
    slug: "md5-vs-sha256",
    title: "MD5 vs SHA-256 — Which Hash Function Should You Use?",
    description:
      "MD5 and SHA-256 are both cryptographic hash functions, but they serve very different purposes today. Here's how to choose.",
    publishedAt: "2026-04-01",
    optionA: {
      name: "MD5",
      summary:
        "MD5 (Message Digest Algorithm 5) produces a 128-bit hash and is extremely fast. It was once widely used for security, but known collision vulnerabilities have made it unsuitable for cryptographic purposes. It still sees use for non-security checksums.",
      pros: [
        "Very fast to compute",
        "Widely supported across languages and tools",
        "Short, readable 32-character hex output",
        "Adequate for non-security file checksums",
      ],
      cons: [
        "Cryptographically broken — collision attacks are practical",
        "Not suitable for passwords, signatures, or certificates",
        "128-bit output is small by modern standards",
        "Should not be trusted for integrity verification in adversarial contexts",
      ],
    },
    optionB: {
      name: "SHA-256",
      summary:
        "SHA-256 is part of the SHA-2 family and produces a 256-bit hash. It is the current standard for security-sensitive hashing, used in TLS certificates, code signing, and password storage (via PBKDF2, bcrypt, etc.).",
      pros: [
        "Cryptographically secure — no known practical collision attacks",
        "256-bit output provides strong collision resistance",
        "Industry standard for certificates, blockchains, and code signing",
        "Part of the well-audited SHA-2 family",
      ],
      cons: [
        "Slower than MD5 (though still fast on modern hardware)",
        "Longer 64-character hex output",
        "Overkill for simple non-security checksums",
      ],
    },
    comparisonTable: [
      { aspect: "Output size", a: "128 bits (32 hex chars)", b: "256 bits (64 hex chars)" },
      { aspect: "Speed", a: "Very fast", b: "Fast (slightly slower than MD5)" },
      { aspect: "Collision resistance", a: "Broken — collisions are practical", b: "Strong — no known practical collisions" },
      { aspect: "Security status", a: "Cryptographically broken", b: "Secure and actively recommended" },
      { aspect: "Best use case", a: "Non-security checksums only", b: "Passwords, signatures, certificates, integrity" },
    ],
    verdict:
      "Use SHA-256 for anything security-sensitive — passwords, digital signatures, file integrity in adversarial environments, or certificate generation. Use MD5 only when you need a fast, non-security checksum (e.g. deduplicating files on a trusted local disk) and performance matters more than security.",
    relatedToolSlugs: ["hash-generator"],
  },
  {
    slug: "json-vs-xml",
    title: "JSON vs XML — Which Data Format Should You Use?",
    description:
      "JSON and XML are both widely used data interchange formats. JSON dominates modern web APIs, but XML still holds ground in enterprise and document-centric systems. Here is how to choose.",
    publishedAt: "2026-04-05",
    optionA: {
      name: "JSON",
      summary:
        "JSON (JavaScript Object Notation) is a lightweight, text-based format that maps directly to JavaScript data structures. It has become the default format for web APIs, configuration files, and data storage in modern applications.",
      pros: [
        "Compact and less verbose than XML",
        "Native to JavaScript — no parsing library needed in the browser",
        "Human-readable and easy to write by hand",
        "Widely supported across all modern languages and frameworks",
      ],
      cons: [
        "No support for comments",
        "No attributes — everything is a key-value pair or array",
        "No built-in namespace support",
        "Schema validation (JSON Schema) less mature than XML Schema (XSD)",
      ],
    },
    optionB: {
      name: "XML",
      summary:
        "XML (Extensible Markup Language) is a verbose, document-centric format with deep roots in enterprise software. It supports attributes, namespaces, comments, and a mature ecosystem of standards including XSD, XSLT, and XPath.",
      pros: [
        "Supports attributes and mixed content models",
        "Mature schema validation via XSD",
        "Supports comments and processing instructions",
        "XSLT allows powerful document transformations",
        "Required for SOAP web services and many enterprise systems",
      ],
      cons: [
        "Verbose — significantly larger payloads than equivalent JSON",
        "Harder to read and write by hand",
        "Slower to parse in JavaScript environments",
        "Overkill for simple data exchange",
      ],
    },
    comparisonTable: [
      { aspect: "Readability", a: "High — minimal syntax overhead", b: "Medium — verbose tag structure" },
      { aspect: "File size", a: "Compact", b: "30–50% larger on average" },
      { aspect: "Browser support", a: "Native — JSON.parse() built-in", b: "Requires DOMParser or external library" },
      { aspect: "Schema validation", a: "JSON Schema (widely used, evolving)", b: "XSD (mature and feature-rich)" },
      { aspect: "Comment support", a: "No", b: "Yes" },
      { aspect: "Typical use case", a: "REST APIs, config files, NoSQL databases", b: "SOAP, enterprise integrations, document storage" },
    ],
    verdict:
      "Use JSON for web APIs, new microservices, and any project where you control both ends of the data exchange. Use XML when you're integrating with enterprise systems that require it, working with SOAP services, or need features like document namespaces, comments, or XSLT transformations.",
    relatedToolSlugs: ["json-formatter", "xml-formatter", "json-to-xml", "xml-to-json"],
  },
  {
    slug: "bmi-vs-body-fat",
    title: "BMI vs Body Fat Percentage — Which Health Metric Is More Accurate?",
    description:
      "BMI is quick and easy but measures weight, not fat. Body fat percentage measures actual fat but requires tools. Here's which metric to use and when.",
    publishedAt: "2026-04-08",
    optionA: {
      name: "BMI",
      summary:
        "Body Mass Index (BMI) is calculated from height and weight alone. It is simple, free, and requires no equipment. It correlates with health risks at the population level, but cannot distinguish between fat and muscle, and does not account for fat distribution.",
      pros: [
        "Requires only height and weight — no equipment needed",
        "Fast and free to calculate",
        "Useful for large-scale population health screening",
        "Well-studied correlation with disease risk at population level",
      ],
      cons: [
        "Does not measure body fat directly",
        "Overestimates risk in muscular individuals",
        "Underestimates risk in people with low muscle mass",
        "Does not account for fat distribution (visceral vs subcutaneous)",
        "Less accurate for older adults and certain ethnic groups",
      ],
    },
    optionB: {
      name: "Body Fat Percentage",
      summary:
        "Body fat percentage measures the proportion of your body weight that is fat. It can be estimated via skinfold calipers, bioelectrical impedance scales, or accurately measured with DEXA scans. It directly captures what BMI approximates.",
      pros: [
        "Directly measures fat, not just weight",
        "Distinguishes between fat mass and lean muscle mass",
        "More clinically meaningful for fitness and health goals",
        "Better at identifying 'skinny fat' (normal weight, high fat)",
      ],
      cons: [
        "Requires measurement tools (calipers, scale, or DEXA scan)",
        "Consumer devices have meaningful measurement error",
        "DEXA (most accurate) is expensive and requires a clinic",
        "Less standardised reference ranges than BMI",
      ],
    },
    comparisonTable: [
      { aspect: "What it measures", a: "Weight relative to height", b: "Actual fat mass as % of total body weight" },
      { aspect: "Equipment needed", a: "None — just height and weight", b: "Calipers, bioimpedance scale, or DEXA scan" },
      { aspect: "Accuracy", a: "Moderate (population-level proxy)", b: "High (especially with DEXA)" },
      { aspect: "Best for", a: "Quick screening, general population health", b: "Fitness goals, clinical assessment, athletes" },
      { aspect: "Limitations", a: "Cannot distinguish fat from muscle", b: "Measurement error with consumer tools" },
    ],
    verdict:
      "Use BMI as a quick, free screening tool to flag potential weight-related health concerns. For a more accurate picture of your health and fitness — especially if you exercise regularly, are older, or fall near the border of a BMI category — body fat percentage gives a much clearer view of what is actually happening in your body.",
    relatedToolSlugs: ["bmi-calculator", "body-fat-calculator"],
  },
  {
    slug: "simple-vs-compound-interest",
    title: "Simple Interest vs Compound Interest — Key Differences Explained",
    description:
      "Simple interest grows linearly on the principal. Compound interest grows exponentially by earning interest on interest. The difference matters enormously over time.",
    publishedAt: "2026-04-12",
    optionA: {
      name: "Simple Interest",
      summary:
        "Simple interest is calculated only on the original principal. The formula is I = P × r × t. Growth is linear — the same amount of interest is earned each period, regardless of how long the money has been invested.",
      pros: [
        "Easy to calculate and understand",
        "Predictable, linear growth",
        "Common in short-term personal loans and car loans",
        "Better for borrowers — interest does not accumulate on unpaid interest",
      ],
      cons: [
        "Grows more slowly than compound interest",
        "Less advantageous for long-term investing",
        "Does not reward leaving money invested longer (no compounding effect)",
      ],
    },
    optionB: {
      name: "Compound Interest",
      summary:
        "Compound interest is calculated on the principal plus all previously accumulated interest. The formula is A = P(1 + r/n)^(nt). Growth is exponential — early gains build on themselves, creating a snowball effect over time.",
      pros: [
        "Exponential growth — dramatically more powerful over long periods",
        "Rewards leaving money invested (time is the key variable)",
        "Standard for savings accounts, investments, and retirement accounts",
        "The basis of long-term wealth building",
      ],
      cons: [
        "More complex to calculate",
        "Works against borrowers — unpaid interest accrues interest",
        "Benefits are minimal over very short time periods",
        "Credit card debt and certain loans use compounding against consumers",
      ],
    },
    comparisonTable: [
      { aspect: "Formula", a: "I = P × r × t", b: "A = P(1 + r/n)^(nt)" },
      { aspect: "Growth type", a: "Linear", b: "Exponential" },
      { aspect: "Better for borrowers", a: "Yes — interest does not compound", b: "No — interest grows on interest" },
      { aspect: "Better for investors", a: "No — slower growth", b: "Yes — maximises long-term returns" },
      { aspect: "Common use cases", a: "Personal loans, car loans, bonds", b: "Savings accounts, investments, mortgages, credit cards" },
      { aspect: "$1,000 at 5% for 5 years", a: "$250 interest → $1,250 total", b: "$276 interest → $1,276 total (annual compounding)" },
    ],
    verdict:
      "As a borrower, simple interest costs less because your debt does not compound. As an investor or saver, compound interest grows your wealth significantly faster — especially over decades. The earlier you start investing in a compounding account, the greater the effect. Time is the most powerful variable in compound interest.",
    relatedToolSlugs: ["simple-interest-calculator", "compound-interest-calculator"],
  },
  {
    slug: "png-vs-jpg",
    title: "PNG vs JPG — Which Image Format Should You Use?",
    description:
      "PNG uses lossless compression and supports transparency. JPG uses lossy compression for smaller files. Choosing the right format affects file size, quality, and compatibility.",
    publishedAt: "2026-04-15",
    optionA: {
      name: "PNG",
      summary:
        "PNG (Portable Network Graphics) uses lossless compression — no quality is lost when saving. It supports full alpha channel transparency, making it ideal for logos, icons, screenshots, and UI elements where crispness and transparency matter.",
      pros: [
        "Lossless — no quality degradation on save or re-save",
        "Full alpha channel transparency support",
        "Sharp edges and text render perfectly",
        "Ideal for screenshots, logos, and graphics",
      ],
      cons: [
        "Larger file sizes than JPG for photographic content",
        "Not ideal for photos with complex colour gradients",
        "Larger files mean slower page loads if not optimised",
      ],
    },
    optionB: {
      name: "JPG / JPEG",
      summary:
        "JPG (Joint Photographic Experts Group) uses lossy compression that discards some image data to achieve smaller file sizes. It is the standard for photographs and images with complex colour gradients where small quality trade-offs are acceptable.",
      pros: [
        "Much smaller file sizes than PNG for photos",
        "Adjustable quality/size trade-off",
        "Universal browser and device support",
        "Ideal for photographs and complex imagery",
      ],
      cons: [
        "Lossy — quality degrades slightly each time you save",
        "No transparency support",
        "Compression artefacts visible at low quality settings",
        "Text and sharp edges can look blurry",
      ],
    },
    comparisonTable: [
      { aspect: "Compression", a: "Lossless", b: "Lossy" },
      { aspect: "Transparency", a: "Yes (alpha channel)", b: "No" },
      { aspect: "File size (photos)", a: "Large", b: "Small (5–10× smaller)" },
      { aspect: "Best for", a: "Logos, icons, screenshots, UI elements", b: "Photos, complex images, web content" },
      { aspect: "Quality loss on re-save", a: "None", b: "Yes — degrades with each save cycle" },
      { aspect: "Browser support", a: "Universal", b: "Universal" },
    ],
    verdict:
      "Use PNG for graphics, logos, icons, and screenshots where transparency or pixel-perfect sharpness matters. Use JPG for photographs and images where smaller file size is a priority and minor quality loss is acceptable. When in doubt for web use: JPG for photos, PNG for everything else.",
    relatedToolSlugs: ["image-compressor", "image-resizer"],
  },
];

export function getComparison(slug: string): ComparisonItem | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}
