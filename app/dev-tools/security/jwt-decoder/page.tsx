import { TOOLS } from "@/lib/tools/registry";
import { generateToolMetadata } from "@/lib/seo/metadata";
import { ToolContainer } from "@/components/tool/ToolContainer";
import { JwtDecoder } from "@/components/tools/security/JwtDecoder";
import { notFound } from "next/navigation";
import type { ToolSectionItem } from "@/lib/tools/types";

export const metadata = generateToolMetadata("jwt-decoder");

const tool = TOOLS.find((t) => t.slug === "jwt-decoder")!;

const howToSteps = [
  "Paste your <strong>JWT token</strong> into the input field at the top — the token has three dot-separated parts and typically starts with <code>eyJ</code>.",
  "The <strong>header and payload</strong> are decoded and displayed as formatted JSON, making it easy to read all the claims.",
  "The <strong>token info bar</strong> shows the algorithm, issuer, subject, and expiry timestamps in a human-friendly format.",
  "If the token is <strong>expired</strong>, an 'expired' badge is shown next to the expiry time so you can identify it at a glance.",
  "Click <strong>copy</strong> on the header or payload panel to copy that section as JSON to your clipboard.",
];

const faqs = [
  {
    question: "What is a JWT?",
    answer:
      "A <strong>JSON Web Token (JWT)</strong> is a compact, URL-safe format for securely transmitting claims between parties. It consists of three Base64URL-encoded parts separated by dots: a <strong>header</strong> (algorithm and token type), a <strong>payload</strong> (claims like user ID, roles, expiry), and a <strong>signature</strong> for verification.",
  },
  {
    question: "Can this tool verify the JWT signature?",
    answer:
      "No. Verifying a JWT signature requires the <strong>secret key</strong> (for HMAC algorithms) or the <strong>public key</strong> (for RSA/ECDSA). This tool only decodes and inspects the header and payload. Never trust a decoded JWT without verifying its signature on the server side.",
  },
  {
    question: "Is it safe to paste a production JWT here?",
    answer:
      "Decoding is done <strong>entirely in your browser</strong> — no data is sent to any server. However, be cautious with tokens that contain sensitive claims in production systems. When in doubt, use a redacted or test token.",
  },
  {
    question: "What do exp, iat, and nbf mean?",
    answer:
      "These are standard JWT claims: <strong>exp</strong> (expiration time) is when the token expires, <strong>iat</strong> (issued at) is when it was created, and <strong>nbf</strong> (not before) is the earliest time the token is valid. All three are <strong>Unix timestamps</strong> (seconds since January 1, 1970).",
  },
  {
    question: "What is Base64URL encoding?",
    answer:
      "Base64URL is a variant of Base64 that replaces <code>+</code> with <code>-</code> and <code>/</code> with <code>_</code>, and removes padding characters. This makes the encoded string <strong>safe to use in URLs and HTTP headers</strong> without percent-encoding. JWTs use Base64URL for all three of their parts.",
  },
  {
    question: "What is the difference between the JWT header and payload?",
    answer:
      "The <strong>header</strong> contains metadata about the token itself — the signing algorithm (e.g. HS256, RS256) and the token type. The <strong>payload</strong> contains the actual claims — information about the user or session, such as user ID, roles, expiry time, and any custom data the issuer chose to include.",
  },
];

const sections: ToolSectionItem[] = [
  {
    title: "What is a JWT?",
    content: `<p>A <strong>JSON Web Token (JWT)</strong> is a compact, self-contained token format used to securely transmit information between parties. It is widely used for <strong>authentication and authorization</strong> in web applications — a server issues a JWT after login, and the client sends it with subsequent requests to prove identity.</p>
<p>A JWT consists of three dot-separated parts: <strong>Header</strong> (algorithm and token type), <strong>Payload</strong> (claims), and <strong>Signature</strong>. Each part is Base64URL-encoded. The signature ensures the token was not tampered with, but the header and payload are readable by anyone who has the token.</p>`,
  },
  {
    title: "JWT Structure Explained",
    content: `<p>Breaking down a JWT reveals its three components:</p>
<ul>
<li><strong>Header:</strong> Contains the signing algorithm (e.g. HS256 for HMAC-SHA256 or RS256 for RSA) and token type ("JWT")</li>
<li><strong>Payload:</strong> Contains claims — statements about the user or session. Standard claims include <code>sub</code> (subject), <code>iss</code> (issuer), <code>exp</code> (expiration), and <code>iat</code> (issued at)</li>
<li><strong>Signature:</strong> Created by signing the header and payload with a secret or private key. Verifying the signature confirms the token was not altered</li>
</ul>
<p>Remember: the payload is only encoded, not encrypted. Do not store sensitive secrets in JWT payload claims.</p>`,
  },
  {
    title: "JWT Security Best Practices",
    content: `<p>Using JWTs securely requires careful attention to a few key practices:</p>
<ul>
<li><strong>Always verify the signature</strong> on the server before trusting any claims</li>
<li><strong>Check the expiration (exp)</strong> claim — never accept expired tokens</li>
<li><strong>Use short expiry times</strong> for access tokens (minutes to hours) and refresh them as needed</li>
<li><strong>Do not store sensitive data</strong> in the payload — it is Base64-encoded, not encrypted</li>
<li><strong>Use HTTPS</strong> to transmit tokens — they can be stolen over unencrypted connections</li>
<li><strong>Validate the algorithm</strong> in the header — do not accept tokens with unexpected algorithms</li>
</ul>`,
  },
];

export default function JwtDecoderPage() {
  if (!tool) notFound();

  return (
    <ToolContainer tool={tool} howToSteps={howToSteps} faqs={faqs} sections={sections}>
      <JwtDecoder />
    </ToolContainer>
  );
}
