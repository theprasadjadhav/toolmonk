"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, secondaryBtnCls } from "@/lib/utils/formStyles";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TZEntry {
  iana: string;
  city: string;
  region: string;
  country: string;   // empty string if unknown
  aliases: string[]; // extra searchable terms (country cities, abbreviations, etc.)
  abbr: string;      // e.g. "IST", "WIB", "JST"
  utcOffset: string; // e.g. "UTC+5:30"
  offsetMins: number;
}

// ── Enrichment: country + searchable aliases for major timezones ──────────────

const ENRICHMENT: Record<string, { country: string; aliases: string[] }> = {
  "UTC": { country: "", aliases: ["coordinated universal time", "zulu", "gmt", "greenwich", "universal"] },

  // USA
  "America/New_York":      { country: "USA", aliases: ["eastern", "nyc", "boston", "miami", "florida", "atlanta", "washington dc", "dc", "philadelphia", "charlotte", "baltimore", "pittsburgh", "cleveland", "detroit", "indianapolis", "raleigh", "richmond", "virginia", "ohio", "michigan", "new jersey", "est", "edt"] },
  "America/Chicago":       { country: "USA", aliases: ["central", "houston", "texas", "dallas", "austin", "chicago", "san antonio", "minneapolis", "minnesota", "milwaukee", "kansas city", "st louis", "saint louis", "new orleans", "louisiana", "nashville", "tennessee", "memphis", "oklahoma", "des moines", "omaha", "cst", "cdt"] },
  "America/Denver":        { country: "USA", aliases: ["mountain", "denver", "colorado", "salt lake city", "utah", "albuquerque", "new mexico", "boise", "idaho", "wyoming", "montana", "mst", "mdt"] },
  "America/Los_Angeles":   { country: "USA", aliases: ["pacific", "california", "san francisco", "san diego", "los angeles", "la", "seattle", "washington state", "portland", "oregon", "las vegas", "nevada", "sacramento", "silicon valley", "bay area", "pst", "pdt"] },
  "America/Phoenix":       { country: "USA", aliases: ["arizona", "phoenix", "tucson", "mesa", "scottsdale", "mst"] },
  "America/Anchorage":     { country: "USA", aliases: ["alaska", "juneau", "fairbanks", "akst", "akdt"] },
  "Pacific/Honolulu":      { country: "USA", aliases: ["hawaii", "honolulu", "oahu", "maui", "hst"] },

  // Canada
  "America/Toronto":       { country: "Canada", aliases: ["toronto", "ontario", "ottawa", "hamilton", "mississauga", "est", "edt", "eastern canada"] },
  "America/Vancouver":     { country: "Canada", aliases: ["vancouver", "british columbia", "bc", "victoria", "pst", "pdt"] },
  "America/Edmonton":      { country: "Canada", aliases: ["edmonton", "alberta", "calgary", "mst", "mdt"] },
  "America/Winnipeg":      { country: "Canada", aliases: ["winnipeg", "manitoba", "cst", "cdt"] },
  "America/Halifax":       { country: "Canada", aliases: ["halifax", "nova scotia", "new brunswick", "atlantic canada", "ast", "adt"] },
  "America/St_Johns":      { country: "Canada", aliases: ["st johns", "newfoundland", "nst", "ndt"] },

  // Latin America
  "America/Sao_Paulo":               { country: "Brazil", aliases: ["sao paulo", "rio de janeiro", "brasilia", "belo horizonte", "fortaleza", "curitiba", "brazil", "brt", "brst"] },
  "America/Argentina/Buenos_Aires":  { country: "Argentina", aliases: ["buenos aires", "argentina", "cordoba", "rosario", "art"] },
  "America/Santiago":                { country: "Chile", aliases: ["santiago", "chile", "valparaiso", "clt", "clst"] },
  "America/Mexico_City":             { country: "Mexico", aliases: ["mexico city", "guadalajara", "monterrey", "puebla", "tijuana", "mexico", "cst", "cdt"] },
  "America/Bogota":                  { country: "Colombia", aliases: ["bogota", "bogotá", "colombia", "medellin", "cali", "barranquilla", "cot"] },
  "America/Lima":                    { country: "Peru", aliases: ["lima", "peru", "pet"] },
  "America/Caracas":                 { country: "Venezuela", aliases: ["caracas", "venezuela", "maracaibo", "vet"] },
  "America/La_Paz":                  { country: "Bolivia", aliases: ["la paz", "bolivia", "bot"] },
  "America/Asuncion":                { country: "Paraguay", aliases: ["asuncion", "paraguay", "pyt", "pyst"] },
  "America/Montevideo":              { country: "Uruguay", aliases: ["montevideo", "uruguay", "uyt"] },
  "America/Guayaquil":               { country: "Ecuador", aliases: ["guayaquil", "quito", "ecuador", "ect"] },

  // Europe
  "Europe/London":    { country: "UK", aliases: ["london", "united kingdom", "england", "britain", "scotland", "wales", "manchester", "birmingham", "glasgow", "edinburgh", "cardiff", "belfast", "ireland", "dublin", "reykjavik", "iceland", "gmt", "bst", "lisbon", "portugal"] },
  "Europe/Paris":     { country: "France", aliases: ["paris", "france", "lyon", "marseille", "nice", "toulouse", "bordeaux", "amsterdam", "netherlands", "rotterdam", "brussels", "belgium", "madrid", "spain", "barcelona", "seville", "valencia", "rome", "milan", "italy", "naples", "florence", "venice", "berlin", "germany", "munich", "frankfurt", "hamburg", "cologne", "vienna", "austria", "graz", "prague", "czech", "brno", "warsaw", "poland", "krakow", "stockholm", "sweden", "gothenburg", "oslo", "norway", "bergen", "copenhagen", "denmark", "zurich", "switzerland", "geneva", "bern", "luxembourg", "monaco", "cet", "cest", "central european time"] },
  "Europe/Athens":    { country: "Greece", aliases: ["athens", "greece", "thessaloniki", "helsinki", "finland", "kyiv", "kiev", "ukraine", "kharkiv", "odessa", "bucharest", "romania", "sofia", "bulgaria", "riga", "latvia", "tallinn", "estonia", "vilnius", "lithuania", "eet", "eest", "eastern european"] },
  "Europe/Moscow":    { country: "Russia", aliases: ["moscow", "russia", "saint petersburg", "st petersburg", "novosibirsk", "ekaterinburg", "nizhny novgorod", "msk"] },
  "Europe/Istanbul":  { country: "Turkey", aliases: ["istanbul", "turkey", "ankara", "izmir", "bursa", "trt"] },
  "Europe/Kiev":      { country: "Ukraine", aliases: ["kyiv", "kiev", "ukraine", "kharkiv", "odessa", "eet", "eest"] },
  "Europe/Bucharest": { country: "Romania", aliases: ["bucharest", "romania", "cluj", "timisoara", "eet", "eest"] },
  "Europe/Warsaw":    { country: "Poland", aliases: ["warsaw", "poland", "krakow", "gdansk", "wroclaw", "poznan", "lodz", "cet", "cest"] },
  "Europe/Berlin":    { country: "Germany", aliases: ["berlin", "germany", "munich", "frankfurt", "hamburg", "cologne", "stuttgart", "dusseldorf", "dortmund", "cet", "cest"] },
  "Europe/Rome":      { country: "Italy", aliases: ["rome", "italy", "milan", "naples", "turin", "florence", "venice", "bologna", "cet", "cest"] },
  "Europe/Madrid":    { country: "Spain", aliases: ["madrid", "spain", "barcelona", "seville", "valencia", "bilbao", "zaragoza", "cet", "cest"] },
  "Europe/Amsterdam": { country: "Netherlands", aliases: ["amsterdam", "netherlands", "rotterdam", "the hague", "utrecht", "cet", "cest"] },
  "Europe/Stockholm": { country: "Sweden", aliases: ["stockholm", "sweden", "gothenburg", "malmo", "cet", "cest"] },
  "Europe/Helsinki":  { country: "Finland", aliases: ["helsinki", "finland", "tampere", "turku", "eet", "eest"] },
  "Europe/Vienna":    { country: "Austria", aliases: ["vienna", "austria", "graz", "linz", "salzburg", "cet", "cest"] },
  "Europe/Zurich":    { country: "Switzerland", aliases: ["zurich", "switzerland", "bern", "geneva", "basel", "cet", "cest"] },
  "Europe/Prague":    { country: "Czech Republic", aliases: ["prague", "czech", "brno", "ostrava", "cet", "cest"] },
  "Europe/Budapest":  { country: "Hungary", aliases: ["budapest", "hungary", "debrecen", "cet", "cest"] },
  "Europe/Belgrade":  { country: "Serbia", aliases: ["belgrade", "serbia", "novi sad", "zagreb", "croatia", "ljubljana", "slovenia", "sarajevo", "bosnia", "skopje", "cet", "cest"] },
  "Europe/Sofia":     { country: "Bulgaria", aliases: ["sofia", "bulgaria", "plovdiv", "eet", "eest"] },
  "Europe/Lisbon":    { country: "Portugal", aliases: ["lisbon", "portugal", "porto", "wet", "west"] },
  "Europe/Dublin":    { country: "Ireland", aliases: ["dublin", "ireland", "cork", "galway", "gmt", "ist"] },
  "Europe/Oslo":       { country: "Norway", aliases: ["oslo", "norway", "bergen", "trondheim", "cet", "cest"] },
  "Europe/Copenhagen": { country: "Denmark", aliases: ["copenhagen", "denmark", "aarhus", "cet", "cest"] },
  "Europe/Riga":       { country: "Latvia", aliases: ["riga", "latvia", "eet", "eest"] },
  "Europe/Tallinn":   { country: "Estonia", aliases: ["tallinn", "estonia", "eet", "eest"] },
  "Europe/Vilnius":   { country: "Lithuania", aliases: ["vilnius", "lithuania", "kaunas", "eet", "eest"] },

  // Middle East
  "Asia/Dubai":       { country: "UAE", aliases: ["dubai", "abu dhabi", "united arab emirates", "uae", "sharjah", "ajman", "muscat", "oman", "gst"] },
  "Asia/Riyadh":      { country: "Saudi Arabia", aliases: ["riyadh", "saudi arabia", "jeddah", "mecca", "medina", "doha", "qatar", "kuwait", "bahrain", "ast"] },
  "Asia/Tehran":      { country: "Iran", aliases: ["tehran", "iran", "persia", "irst", "irdt", "isfahan", "mashhad", "shiraz", "tabriz"] },
  "Asia/Baghdad":     { country: "Iraq", aliases: ["baghdad", "iraq", "basra", "erbil", "mosul", "ast"] },
  "Asia/Beirut":      { country: "Lebanon", aliases: ["beirut", "lebanon", "tripoli", "eet", "eest"] },
  "Asia/Jerusalem":   { country: "Israel", aliases: ["jerusalem", "israel", "tel aviv", "haifa", "ist", "idt"] },
  "Asia/Amman":       { country: "Jordan", aliases: ["amman", "jordan", "zarqa", "eet", "eest"] },
  "Asia/Damascus":    { country: "Syria", aliases: ["damascus", "syria", "aleppo", "eet", "eest"] },

  // South Asia
  "Asia/Kolkata":     { country: "India", aliases: ["india", "ist", "delhi", "new delhi", "mumbai", "bombay", "bangalore", "bengaluru", "chennai", "madras", "hyderabad", "pune", "ahmedabad", "surat", "jaipur", "lucknow", "kanpur", "kolkata", "calcutta", "nagpur", "patna", "bhopal", "indore", "agra", "visakhapatnam", "vadodara", "ludhiana", "coimbatore", "kochi", "cochin", "guwahati", "chandigarh", "noida", "gurgaon"] },
  "Asia/Karachi":     { country: "Pakistan", aliases: ["karachi", "pakistan", "islamabad", "lahore", "faisalabad", "rawalpindi", "multan", "hyderabad", "pkt"] },
  "Asia/Dhaka":       { country: "Bangladesh", aliases: ["dhaka", "bangladesh", "chittagong", "sylhet", "rajshahi", "bst", "bdt"] },
  "Asia/Kathmandu":   { country: "Nepal", aliases: ["kathmandu", "nepal", "pokhara", "lalitpur", "npt"] },
  "Asia/Colombo":     { country: "Sri Lanka", aliases: ["colombo", "sri lanka", "ceylon", "kandy", "galle", "slst", "ist"] },
  "Asia/Kabul":       { country: "Afghanistan", aliases: ["kabul", "afghanistan", "kandahar", "aft"] },
  "Asia/Tashkent":    { country: "Uzbekistan", aliases: ["tashkent", "uzbekistan", "samarkand", "namangan", "uzt"] },
  "Asia/Almaty":      { country: "Kazakhstan", aliases: ["almaty", "kazakhstan", "astana", "nur-sultan", "shymkent", "almt"] },
  "Asia/Tbilisi":     { country: "Georgia", aliases: ["tbilisi", "georgia", "kutaisi", "get"] },
  "Asia/Yerevan":     { country: "Armenia", aliases: ["yerevan", "armenia", "gyumri", "amt"] },
  "Asia/Baku":        { country: "Azerbaijan", aliases: ["baku", "azerbaijan", "ganja", "azt"] },

  // Southeast Asia
  "Asia/Bangkok":      { country: "Thailand", aliases: ["bangkok", "thailand", "pattaya", "chiang mai", "phuket", "laos", "vientiane", "cambodia", "phnom penh", "ict", "tha", "indochina"] },
  "Asia/Ho_Chi_Minh":  { country: "Vietnam", aliases: ["ho chi minh", "hcmc", "saigon", "vietnam", "hanoi", "da nang", "ict"] },
  "Asia/Yangon":       { country: "Myanmar", aliases: ["yangon", "myanmar", "burma", "rangoon", "mandalay", "naypyidaw", "mmt"] },
  "Asia/Phnom_Penh":   { country: "Cambodia", aliases: ["phnom penh", "cambodia", "siem reap", "ict"] },
  "Asia/Vientiane":    { country: "Laos", aliases: ["vientiane", "laos", "ict"] },
  "Asia/Jakarta":      { country: "Indonesia", aliases: ["jakarta", "indonesia", "java", "sumatra", "surabaya", "bandung", "yogyakarta", "semarang", "medan", "palembang", "wib", "west indonesia", "western indonesia"] },
  "Asia/Makassar":     { country: "Indonesia", aliases: ["makassar", "bali", "lombok", "denpasar", "sulawesi", "kalimantan", "borneo", "wita", "central indonesia"] },
  "Asia/Jayapura":     { country: "Indonesia", aliases: ["jayapura", "papua", "west papua", "sorong", "manokwari", "wit", "east indonesia", "eastern indonesia"] },
  "Asia/Singapore":    { country: "Singapore", aliases: ["singapore", "sgt", "sst"] },
  "Asia/Kuala_Lumpur": { country: "Malaysia", aliases: ["kuala lumpur", "kl", "malaysia", "penang", "johor bahru", "ipoh", "petaling jaya", "myt"] },
  "Asia/Manila":       { country: "Philippines", aliases: ["manila", "philippines", "cebu", "davao", "quezon city", "makati", "pht", "pst"] },
  "Asia/Brunei":       { country: "Brunei", aliases: ["bandar seri begawan", "brunei", "bnt"] },
  "Asia/Dili":         { country: "East Timor", aliases: ["dili", "east timor", "timor leste", "tlt"] },

  // East Asia
  "Asia/Shanghai":    { country: "China", aliases: ["shanghai", "china", "beijing", "guangzhou", "shenzhen", "chongqing", "wuhan", "chengdu", "xian", "xi'an", "tianjin", "hangzhou", "nanjing", "shenyang", "harbin", "qingdao", "zhengzhou", "kunming", "cst", "ct"] },
  "Asia/Hong_Kong":   { country: "Hong Kong", aliases: ["hong kong", "hk", "kowloon", "hkt"] },
  "Asia/Taipei":      { country: "Taiwan", aliases: ["taipei", "taiwan", "kaohsiung", "taichung", "tainan", "cst", "roc"] },
  "Asia/Tokyo":       { country: "Japan", aliases: ["tokyo", "japan", "osaka", "kyoto", "yokohama", "nagoya", "sapporo", "fukuoka", "kobe", "hiroshima", "sendai", "kawasaki", "sakai", "jst"] },
  "Asia/Seoul":       { country: "South Korea", aliases: ["seoul", "south korea", "korea", "busan", "incheon", "daegu", "gwangju", "daejeon", "ulsan", "kst"] },
  "Asia/Ulaanbaatar": { country: "Mongolia", aliases: ["ulaanbaatar", "mongolia", "ulanbator", "ulat"] },

  // Africa
  "Africa/Cairo":           { country: "Egypt", aliases: ["cairo", "egypt", "alexandria", "giza", "eet"] },
  "Africa/Lagos":           { country: "Nigeria", aliases: ["lagos", "nigeria", "abuja", "kano", "ibadan", "port harcourt", "wat", "west africa", "accra", "ghana", "dakar", "senegal", "abidjan", "ivory coast", "cote d'ivoire", "cotonou", "benin", "douala", "cameroon"] },
  "Africa/Nairobi":         { country: "Kenya", aliases: ["nairobi", "kenya", "eat", "east africa", "addis ababa", "ethiopia", "dar es salaam", "tanzania", "kampala", "uganda", "kigali", "rwanda", "mogadishu", "somalia", "asmara", "eritrea", "djibouti"] },
  "Africa/Johannesburg":    { country: "South Africa", aliases: ["johannesburg", "south africa", "cape town", "pretoria", "durban", "port elizabeth", "sast"] },
  "Africa/Casablanca":      { country: "Morocco", aliases: ["casablanca", "morocco", "rabat", "marrakech", "fes", "tangier", "wet", "wst"] },
  "Africa/Addis_Ababa":     { country: "Ethiopia", aliases: ["addis ababa", "ethiopia", "eat"] },
  "Africa/Khartoum":        { country: "Sudan", aliases: ["khartoum", "sudan", "omdurman", "cat"] },
  "Africa/Algiers":         { country: "Algeria", aliases: ["algiers", "algeria", "oran", "constantine", "cet"] },
  "Africa/Tunis":           { country: "Tunisia", aliases: ["tunis", "tunisia", "sfax", "cet"] },
  "Africa/Tripoli":         { country: "Libya", aliases: ["tripoli", "libya", "benghazi", "eet"] },
  "Africa/Accra":           { country: "Ghana", aliases: ["accra", "ghana", "kumasi", "gmt"] },
  "Africa/Dar_es_Salaam":   { country: "Tanzania", aliases: ["dar es salaam", "tanzania", "dodoma", "mwanza", "eat"] },
  "Africa/Kampala":         { country: "Uganda", aliases: ["kampala", "uganda", "gulu", "eat"] },
  "Africa/Maputo":          { country: "Mozambique", aliases: ["maputo", "mozambique", "beira", "cat"] },
  "Africa/Harare":          { country: "Zimbabwe", aliases: ["harare", "zimbabwe", "bulawayo", "cat"] },
  "Africa/Lusaka":          { country: "Zambia", aliases: ["lusaka", "zambia", "ndola", "cat"] },
  "Africa/Luanda":          { country: "Angola", aliases: ["luanda", "angola", "wat"] },

  // Oceania
  "Australia/Sydney":     { country: "Australia", aliases: ["sydney", "australia", "melbourne", "victoria", "nsw", "new south wales", "canberra", "act", "tasmania", "hobart", "aest", "aedt"] },
  "Australia/Brisbane":   { country: "Australia", aliases: ["brisbane", "queensland", "qld", "gold coast", "sunshine coast", "australia", "aest"] },
  "Australia/Adelaide":   { country: "Australia", aliases: ["adelaide", "south australia", "sa", "australia", "acst", "acdt"] },
  "Australia/Darwin":     { country: "Australia", aliases: ["darwin", "northern territory", "nt", "australia", "acst"] },
  "Australia/Perth":      { country: "Australia", aliases: ["perth", "western australia", "wa", "australia", "awst"] },
  "Australia/Hobart":     { country: "Australia", aliases: ["hobart", "tasmania", "australia", "aest", "aedt"] },
  "Pacific/Auckland":     { country: "New Zealand", aliases: ["auckland", "new zealand", "nz", "wellington", "christchurch", "hamilton", "nzst", "nzdt"] },
  "Pacific/Fiji":         { country: "Fiji", aliases: ["fiji", "suva", "nadi", "fjt"] },
  "Pacific/Guam":         { country: "Guam", aliases: ["guam", "agana", "chamorro", "chst"] },
  "Pacific/Port_Moresby": { country: "Papua New Guinea", aliases: ["port moresby", "papua new guinea", "png", "pgt"] },
};

// ── Popular timezones shown when picker query is empty ────────────────────────

const POPULAR_IANA = [
  "UTC",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Anchorage", "Pacific/Honolulu", "America/Toronto", "America/Mexico_City",
  "America/Sao_Paulo", "America/Argentina/Buenos_Aires",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow", "Europe/Istanbul",
  "Africa/Cairo", "Africa/Lagos", "Africa/Nairobi", "Africa/Johannesburg",
  "Asia/Riyadh", "Asia/Dubai", "Asia/Tehran", "Asia/Karachi",
  "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok", "Asia/Ho_Chi_Minh",
  "Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura",
  "Asia/Singapore", "Asia/Kuala_Lumpur", "Asia/Manila",
  "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Tokyo", "Asia/Seoul",
  "Australia/Perth", "Australia/Darwin", "Australia/Adelaide",
  "Australia/Brisbane", "Australia/Sydney", "Pacific/Auckland",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseOffsetStr(s: string): number {
  const m = s.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  return (m[1] === "+" ? 1 : -1) * (parseInt(m[2]) * 60 + parseInt(m[3] ?? "0"));
}

function buildEntry(iana: string, now: Date): TZEntry {
  const parts = iana.split("/");
  const city = parts[parts.length - 1].replace(/_/g, " ");
  const region = parts[0];
  const enrich = ENRICHMENT[iana];
  let abbr = iana;
  let utcOffset = "UTC+0";
  let offsetMins = 0;
  try {
    abbr =
      new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "short" })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value ?? iana;
    const raw =
      new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "shortOffset" })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
    utcOffset = raw.replace("GMT", "UTC");
    offsetMins = parseOffsetStr(raw);
  } catch {
    // unsupported in this environment — keep defaults
  }
  return {
    iana, city, region,
    country: enrich?.country ?? "",
    aliases: enrich?.aliases ?? [],
    abbr, utcOffset, offsetMins,
  };
}

function buildTZIndex(now: Date): TZEntry[] {
  let ianaList: string[];
  try {
    ianaList = (Intl as unknown as { supportedValuesOf(k: string): string[] })
      .supportedValuesOf("timeZone");
  } catch {
    ianaList = POPULAR_IANA;
  }
  return ianaList
    .map((iana) => buildEntry(iana, now))
    .sort((a, b) => a.offsetMins - b.offsetMins || a.iana.localeCompare(b.iana));
}

function filterTZ(q: string, index: TZEntry[]): TZEntry[] {
  const lq = q.toLowerCase().trim();
  if (!lq) {
    const pop = new Set(POPULAR_IANA);
    return index.filter((t) => pop.has(t.iana));
  }
  const exact: TZEntry[] = [];
  const partial: TZEntry[] = [];
  for (const tz of index) {
    const isExactAbbr = tz.abbr.toLowerCase() === lq;
    const hit =
      isExactAbbr ||
      tz.city.toLowerCase().includes(lq) ||
      tz.country.toLowerCase().includes(lq) ||
      tz.iana.toLowerCase().replace(/_/g, " ").includes(lq) ||
      tz.region.toLowerCase().includes(lq) ||
      tz.abbr.toLowerCase().includes(lq) ||
      tz.utcOffset.toLowerCase().includes(lq) ||
      tz.aliases.some((a) => a.includes(lq));
    if (hit) (isExactAbbr ? exact : partial).push(tz);
    if (exact.length + partial.length >= 100) break;
  }
  return [...exact, ...partial].slice(0, 40);
}

function getTZMeta(iana: string, date: Date) {
  const abbr =
    new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "short" })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  const utcOffset = (
    new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "shortOffset" })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName")?.value ?? ""
  ).replace("GMT", "UTC");
  return { abbr, utcOffset };
}

function getTZOffsetMins(iana: string, dateStr: string): number {
  const ref = new Date(dateStr + "T12:00:00Z");
  const s =
    new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "shortOffset" })
      .formatToParts(ref)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  return parseOffsetStr(s);
}

function buildRefDate(iana: string, dateStr: string, mins: number): Date {
  const offsetMins = getTZOffsetMins(iana, dateStr);
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(
    Date.UTC(y, mo - 1, d, Math.floor(mins / 60), mins % 60) - offsetMins * 60000,
  );
}

function fmtTime(iana: string, date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: iana, hour: "numeric", minute: "2-digit", hour12: true,
  }).format(date);
}

function fmtDate(iana: string, date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: iana, weekday: "short", month: "short", day: "numeric",
  }).format(date);
}

function getISODate(iana: string, date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: iana, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

function getNowStrings() {
  const n = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return {
    dateStr: `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`,
    timeStr: `${pad(n.getHours())}:${pad(n.getMinutes())}`,
  };
}

// ── TZPicker ──────────────────────────────────────────────────────────────────

interface TZPickerProps {
  selected: TZEntry | null;
  onSelect: (tz: TZEntry) => void;
  label: string;
  index: TZEntry[];
  now: Date;
}

function TZPicker({ selected, onSelect, label, index, now }: TZPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => filterTZ(query, index), [query, index]);

  const selMeta = useMemo(
    () => (selected ? getTZMeta(selected.iana, now) : null),
    [selected, now],
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-0">
      <div className={labelCls}>{label}</div>
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 30);
        }}
        className={cn(
          "w-full text-left px-3 py-2.5 border bg-surface-muted transition-colors",
          open
            ? "border-foreground-muted"
            : "border-border hover:border-foreground-muted/50",
        )}
      >
        {selected ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="font-mono text-sm text-foreground font-medium truncate block">
                {selected.city}
                {selected.country && (
                  <span className="text-foreground-muted font-normal ml-1.5">
                    {selected.country}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5">
                {selMeta?.abbr ?? selected.abbr}
              </span>
              <span className="font-mono text-[10px] text-foreground-muted">
                {selMeta?.utcOffset ?? selected.utcOffset}
              </span>
            </div>
          </div>
        ) : (
          <span className="font-mono text-sm text-foreground-muted/50">
            Select a timezone…
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-0.5 border border-foreground-muted/30 bg-surface shadow-xl">
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="City, country, abbreviation (India, WIB, IST, Jakarta, UTC+5:30…)"
              className="w-full bg-surface border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-foreground-muted text-foreground placeholder:text-foreground-muted/50"
            />
          </div>
          {!query && (
            <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-foreground-muted/50 bg-surface-muted border-b border-border">
              Popular timezones
            </div>
          )}
          <div className="overflow-y-auto max-h-72">
            {results.length === 0 ? (
              <div className="px-3 py-4 text-sm font-mono text-foreground-muted text-center">
                No results
              </div>
            ) : (
              results.map((tz) => (
                <button
                  key={tz.iana}
                  onClick={() => {
                    onSelect(tz);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-surface-muted border-b border-border/30 last:border-0",
                    selected?.iana === tz.iana && "bg-primary/5",
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-sm text-foreground">{tz.city}</span>
                      {tz.country && (
                        <span className="font-mono text-[10px] text-foreground-muted">
                          {tz.country}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[9px] text-foreground-muted/40">{tz.iana}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono text-[10px] bg-primary/10 text-primary px-1 py-0.5">
                      {tz.abbr}
                    </span>
                    <span className="font-mono text-[10px] text-foreground-muted">
                      {tz.utcOffset}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Hour Grid ─────────────────────────────────────────────────────────────────

const CELL_W = 52;
const LABEL_W = 144;

interface HourGridProps {
  fromTZ: TZEntry;
  toTZ: TZEntry;
  dateStr: string;
  selectedHour: number;
  onSelectHour: (h: number) => void;
  now: Date;
}

function HourGrid({ fromTZ, toTZ, dateStr, selectedHour, onSelectHour, now }: HourGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const utcTimes = useMemo<Date[]>(() => {
    const offsetMins = getTZOffsetMins(fromTZ.iana, dateStr);
    const [y, mo, d] = dateStr.split("-").map(Number);
    return Array.from({ length: 24 }, (_, h) =>
      new Date(Date.UTC(y, mo - 1, d, h, 0) - offsetMins * 60000),
    );
  }, [fromTZ.iana, dateStr]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = selectedHour * CELL_W - el.clientWidth / 2 + CELL_W / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [selectedHour]);

  const fromMeta = useMemo(() => getTZMeta(fromTZ.iana, now), [fromTZ.iana, now]);
  const toMeta = useMemo(() => getTZMeta(toTZ.iana, now), [toTZ.iana, now]);

  function renderCell(
    d: Date,
    h: number,
    ianaZone: string,
    prefix: string,
    prevIso: string,
  ) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaZone, hour: "numeric", hour12: true,
    }).formatToParts(d);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "12");
    const period = (
      parts.find((p) => p.type === "dayPeriod")?.value ?? "AM"
    ).toLowerCase().slice(0, 2);
    const iso = getISODate(ianaZone, d);
    const isNewDay = h === 0 || iso !== prevIso;
    const isSelected = h === selectedHour;
    const dateLabel = isNewDay
      ? new Intl.DateTimeFormat("en-US", {
          month: "short", day: "numeric", weekday: "short",
        }).format(new Date(iso + "T12:00:00Z"))
      : null;

    return (
      <div
        key={`${prefix}-${h}`}
        onClick={() => onSelectHour(h)}
        className={cn(
          "flex flex-col items-center cursor-pointer select-none transition-colors",
          prefix === "from" && "border-b border-border",
          h > 0 && "border-l border-border",
          isSelected ? "bg-primary/10" : "hover:bg-surface-muted",
        )}
        style={{ height: 78 }}
      >
        <div
          className={cn(
            "w-full text-center font-mono text-[7px] uppercase tracking-wide leading-none pt-1.5 pb-0.5 px-0.5 truncate",
            isNewDay ? "text-foreground-muted/60" : "text-transparent pointer-events-none",
          )}
        >
          {dateLabel ?? "·"}
        </div>
        <div
          className={cn(
            "font-mono text-base font-semibold tabular-nums leading-tight",
            isSelected ? "text-primary" : "text-foreground",
          )}
        >
          {hour}
        </div>
        <div
          className={cn(
            "font-mono text-[9px] pb-1.5 leading-none",
            isSelected ? "text-primary/80" : "text-foreground-muted",
          )}
        >
          {period}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border flex overflow-hidden">
      {/* Fixed left label column */}
      <div className="shrink-0 bg-surface border-r border-border z-10" style={{ width: LABEL_W }}>
        <div className="flex flex-col justify-center px-3 py-2 border-b border-border h-[78px]">
          <div className="font-mono text-xs font-semibold text-foreground truncate">
            {fromTZ.city}
          </div>
          <div className="font-mono text-[9px] text-foreground-muted truncate">
            {fromTZ.country || fromTZ.region}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="font-mono text-[9px] bg-primary/10 text-primary px-1 py-0.5">
              {fromMeta.abbr}
            </span>
            <span className="font-mono text-[9px] text-foreground-muted">{fromMeta.utcOffset}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center px-3 py-2 h-[78px]">
          <div className="font-mono text-xs font-semibold text-foreground truncate">{toTZ.city}</div>
          <div className="font-mono text-[9px] text-foreground-muted truncate">
            {toTZ.country || toTZ.region}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="font-mono text-[9px] bg-primary/10 text-primary px-1 py-0.5">
              {toMeta.abbr}
            </span>
            <span className="font-mono text-[9px] text-foreground-muted">{toMeta.utcOffset}</span>
          </div>
        </div>
      </div>

      {/* Scrollable hour columns */}
      <div ref={scrollRef} className="overflow-x-auto flex-1 overflow-y-hidden">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(24, ${CELL_W}px)`,
            width: `${24 * CELL_W}px`,
          }}
        >
          {utcTimes.map((d, h) =>
            renderCell(
              d, h, fromTZ.iana, "from",
              h > 0 ? getISODate(fromTZ.iana, utcTimes[h - 1]) : dateStr,
            ),
          )}
          {utcTimes.map((d, h) =>
            renderCell(
              d, h, toTZ.iana, "to",
              h > 0
                ? getISODate(toTZ.iana, utcTimes[h - 1])
                : getISODate(toTZ.iana, utcTimes[0]),
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TimezoneConverter() {
  const [tz1, setTz1] = useState<TZEntry | null>(null);
  const [tz2, setTz2] = useState<TZEntry | null>(null);
  const { dateStr: initDate, timeStr: initTime } = getNowStrings();
  const [dateStr, setDateStr] = useState(initDate);
  const [timeStr, setTimeStr] = useState(initTime);
  const [now, setNow] = useState(() => new Date());

  const [tzIndex] = useState<TZEntry[]>(() => buildTZIndex(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const selectedHour = parseInt(timeStr.split(":")[0] ?? "0");

  const refDate = useMemo(() => {
    if (!tz1) return new Date();
    const [h, m] = timeStr.split(":").map(Number);
    return buildRefDate(tz1.iana, dateStr, h * 60 + (m || 0));
  }, [tz1, dateStr, timeStr]);

  const converted = useMemo(() => {
    if (!tz1 || !tz2) return null;
    const toISO = getISODate(tz2.iana, refDate);
    const dayDiff = Math.round(
      (new Date(toISO).getTime() - new Date(dateStr).getTime()) / 86400000,
    );
    return { time: fmtTime(tz2.iana, refDate), date: fmtDate(tz2.iana, refDate), dayDiff };
  }, [tz1, tz2, refDate, dateStr]);

  const tz1Meta = useMemo(() => (tz1 ? getTZMeta(tz1.iana, now) : null), [tz1, now]);
  const tz2Meta = useMemo(() => (tz2 ? getTZMeta(tz2.iana, now) : null), [tz2, now]);

  function swap() {
    setTz1(tz2);
    setTz2(tz1);
  }

  function useNow() {
    const { dateStr: d, timeStr: t } = getNowStrings();
    setDateStr(d);
    setTimeStr(t);
  }

  return (
    <div className="space-y-5">
      {/* ── 1. UTC clock ── */}
      <div className="border border-border p-3 bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Current UTC Time
        </span>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-mono text-2xl font-semibold tabular-nums text-foreground leading-none">
            {fmtTime("UTC", now)}
          </span>
          <span className="font-mono text-[9px] bg-primary/10 text-primary px-1.5 py-0.5">UTC</span>
          <span className="font-mono text-sm text-foreground-muted">{fmtDate("UTC", now)}</span>
        </div>
      </div>

      {/* ── 2. Timezone pickers ── */}
      <div className="flex flex-col sm:flex-row items-end gap-2">
        <TZPicker selected={tz1} onSelect={setTz1} label="Timezone 1" index={tzIndex} now={now} />
        <button
          onClick={swap}
          title="Swap"
          className={cn(secondaryBtnCls, "px-3 py-2.5 text-sm shrink-0")}
        >
          ⇌
        </button>
        <TZPicker selected={tz2} onSelect={setTz2} label="Timezone 2" index={tzIndex} now={now} />
      </div>

      {/* ── 3. Current time cards (shown once at least one zone is selected) ── */}
      {(tz1 || tz2) && (
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { tz: tz1, meta: tz1Meta, role: "tz1" },
              { tz: tz2, meta: tz2Meta, role: "tz2" },
            ] as const
          ).map(({ tz, meta, role }) => (
            <div key={role} className="border border-border p-3 min-h-[72px]">
              {tz ? (
                <div className="space-y-0.5">
                  <div className="font-mono text-[9px] text-foreground-muted/50 truncate">
                    {tz.country ? `${tz.city}, ${tz.country}` : tz.iana}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xl font-semibold tabular-nums text-foreground leading-none">
                      {fmtTime(tz.iana, now)}
                    </span>
                    <span className="font-mono text-[9px] bg-primary/10 text-primary px-1.5 py-0.5">
                      {meta?.abbr ?? tz.abbr}
                    </span>
                    <span className="font-mono text-[9px] text-foreground-muted">
                      {meta?.utcOffset ?? tz.utcOffset}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-foreground-muted">
                    {fmtDate(tz.iana, now)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="font-mono text-xs text-foreground-muted/30">
                    Select a timezone
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── 4. Time picker + conversion ── */}
      {tz1 && tz2 && (
        <div className="border border-border grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="p-3 space-y-2">
            <div className={labelCls}>Set time in {tz1.city}</div>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className={inputCls}
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className={cn(inputCls, "flex-1")}
              />
              <button onClick={useNow} className={cn(secondaryBtnCls, "py-2.5 shrink-0")}>
                Now
              </button>
            </div>
          </div>
          <div className="p-3 flex flex-col justify-center">
            <div className={labelCls}>In {tz2.city}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-2xl text-foreground font-semibold tabular-nums">
                {converted?.time}
              </span>
              {converted && converted.dayDiff !== 0 && (
                <span
                  className={cn(
                    "font-mono text-[10px] px-1.5 py-0.5",
                    converted.dayDiff > 0
                      ? "bg-primary/10 text-primary"
                      : "bg-foreground-muted/10 text-foreground-muted",
                  )}
                >
                  {converted.dayDiff > 0 ? "+" : ""}
                  {converted.dayDiff} day{Math.abs(converted.dayDiff) !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="font-mono text-xs text-foreground-muted mt-0.5">
              {converted?.date}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. 24-hour grid ── */}
      {tz1 && tz2 && (
        <HourGrid
          fromTZ={tz1}
          toTZ={tz2}
          dateStr={dateStr}
          selectedHour={selectedHour}
          onSelectHour={(h) => setTimeStr(`${String(h).padStart(2, "0")}:00`)}
          now={now}
        />
      )}
    </div>
  );
}
