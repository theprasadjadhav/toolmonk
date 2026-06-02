import { NextRequest, NextResponse } from "next/server";

// Sanitize and validate domain input
function cleanDomain(raw: string): string | null {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*/,  "")
    .replace(/^www\./, "");
  if (!/^[a-z0-9][a-z0-9._-]*\.[a-z]{2,}$/.test(cleaned)) return null;
  if (cleaned.length > 253) return null;
  return cleaned;
}

// Pull a named event date from the RDAP events array
function eventDate(events: { eventAction: string; eventDate: string }[], action: string): string | null {
  return events.find((e) => e.eventAction === action)?.eventDate ?? null;
}

// Pull registrar name from RDAP entities
function registrarName(entities: unknown[]): string {
  if (!Array.isArray(entities)) return "Unknown";
  const reg = entities.find(
    (e: unknown) =>
      Array.isArray((e as { roles?: unknown }).roles) &&
      (e as { roles: string[] }).roles.includes("registrar"),
  ) as { vcardArray?: unknown; handle?: string } | undefined;
  if (!reg) return "Unknown";
  const vcard = reg.vcardArray;
  if (Array.isArray(vcard) && Array.isArray(vcard[1])) {
    const fn = (vcard[1] as unknown[]).find(
      (v) => Array.isArray(v) && (v as unknown[])[0] === "fn",
    ) as unknown[] | undefined;
    if (fn && typeof fn[3] === "string") return fn[3];
  }
  return reg.handle ?? "Unknown";
}

export async function GET(req: NextRequest) {
  const domain = cleanDomain(req.nextUrl.searchParams.get("domain") ?? "");
  if (!domain) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { Accept: "application/rdap+json, application/json" },
      redirect: "follow",
      // 8-second server-side timeout
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) {
      return NextResponse.json({ error: "Domain not found in RDAP. It may be unregistered or use an unsupported TLD." }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: `RDAP lookup failed (${res.status})` }, { status: 502 });
    }

    const data = await res.json() as {
      events?: { eventAction: string; eventDate: string }[];
      entities?: unknown[];
    };

    const events = data.events ?? [];
    const registrationDate = eventDate(events, "registration");
    const expirationDate   = eventDate(events, "expiration");
    const lastChangedDate  = eventDate(events, "last changed");

    return NextResponse.json({
      domain,
      registrationDate,
      expirationDate,
      lastChangedDate,
      registrar: registrarName(data.entities ?? []),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const isTimeout = msg.includes("timeout") || msg.includes("abort");
    return NextResponse.json(
      { error: isTimeout ? "Request timed out. The RDAP server did not respond in time." : "Failed to fetch domain information." },
      { status: 502 },
    );
  }
}
