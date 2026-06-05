"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, secondaryBtnCls } from "@/lib/utils/formStyles";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TZEntry {
  iana: string;
  city: string;
  region: string;
  countries: string[];   // all countries that use this zone
  extraCities: string[]; // cities not in the IANA path
  abbr: string;
  utcOffset: string;
  offsetMins: number;
}

// ── Country → IANA zones ───────────────────────────────────────────────────────
// Arrays so a zone can appear under multiple country names without TS duplicate-key errors

const COUNTRY_ZONES: [string, string[]][] = [
  ["Afghanistan",                ["Asia/Kabul"]],
  ["Albania",                    ["Europe/Tirane"]],
  ["Algeria",                    ["Africa/Algiers"]],
  ["Angola",                     ["Africa/Luanda"]],
  ["Argentina",                  ["America/Argentina/Buenos_Aires","America/Argentina/Cordoba","America/Argentina/Salta","America/Argentina/Mendoza","America/Argentina/San_Juan","America/Argentina/Tucuman","America/Argentina/La_Rioja","America/Argentina/Catamarca","America/Argentina/Jujuy","America/Argentina/Rio_Gallegos","America/Argentina/Ushuaia"]],
  ["Armenia",                    ["Asia/Yerevan"]],
  ["Australia",                  ["Australia/Sydney","Australia/Melbourne","Australia/Brisbane","Australia/Adelaide","Australia/Darwin","Australia/Perth","Australia/Hobart","Australia/Lord_Howe","Australia/Broken_Hill"]],
  ["Austria",                    ["Europe/Vienna"]],
  ["Azerbaijan",                 ["Asia/Baku"]],
  ["Bahrain",                    ["Asia/Bahrain"]],
  ["Bangladesh",                 ["Asia/Dhaka"]],
  ["Belarus",                    ["Europe/Minsk"]],
  ["Belgium",                    ["Europe/Brussels"]],
  ["Bolivia",                    ["America/La_Paz"]],
  ["Bosnia",                     ["Europe/Sarajevo"]],
  ["Bosnia and Herzegovina",     ["Europe/Sarajevo"]],
  ["Brazil",                     ["America/Sao_Paulo","America/Manaus","America/Belem","America/Recife","America/Fortaleza","America/Cuiaba","America/Porto_Velho","America/Boa_Vista","America/Santarem","America/Maceio","America/Bahia","America/Noronha","America/Campo_Grande","America/Araguaina"]],
  ["Bulgaria",                   ["Europe/Sofia"]],
  ["Cambodia",                   ["Asia/Phnom_Penh"]],
  ["Cameroon",                   ["Africa/Douala"]],
  ["Canada",                     ["America/Toronto","America/Vancouver","America/Edmonton","America/Winnipeg","America/Halifax","America/St_Johns","America/Regina","America/Yellowknife","America/Whitehorse","America/Iqaluit","America/Moncton","America/Goose_Bay","America/Swift_Current","America/Dawson_Creek"]],
  ["Chile",                      ["America/Santiago","Pacific/Easter","America/Punta_Arenas"]],
  ["China",                      ["Asia/Shanghai","Asia/Urumqi"]],
  ["Colombia",                   ["America/Bogota"]],
  ["Congo",                      ["Africa/Brazzaville","Africa/Kinshasa","Africa/Lubumbashi"]],
  ["Democratic Republic of Congo",["Africa/Kinshasa","Africa/Lubumbashi"]],
  ["DR Congo",                   ["Africa/Kinshasa","Africa/Lubumbashi"]],
  ["Costa Rica",                 ["America/Costa_Rica"]],
  ["Croatia",                    ["Europe/Zagreb"]],
  ["Cuba",                       ["America/Havana"]],
  ["Czech Republic",             ["Europe/Prague"]],
  ["Czechia",                    ["Europe/Prague"]],
  ["Denmark",                    ["Europe/Copenhagen"]],
  ["Dominican Republic",         ["America/Santo_Domingo"]],
  ["Ecuador",                    ["America/Guayaquil"]],
  ["Egypt",                      ["Africa/Cairo"]],
  ["El Salvador",                ["America/El_Salvador"]],
  ["Estonia",                    ["Europe/Tallinn"]],
  ["Ethiopia",                   ["Africa/Addis_Ababa"]],
  ["Finland",                    ["Europe/Helsinki"]],
  ["France",                     ["Europe/Paris"]],
  ["Georgia",                    ["Asia/Tbilisi"]],
  ["Germany",                    ["Europe/Berlin"]],
  ["Ghana",                      ["Africa/Accra"]],
  ["Greece",                     ["Europe/Athens"]],
  ["Guatemala",                  ["America/Guatemala"]],
  ["Haiti",                      ["America/Port-au-Prince"]],
  ["Honduras",                   ["America/Tegucigalpa"]],
  ["Hong Kong",                  ["Asia/Hong_Kong"]],
  ["Hungary",                    ["Europe/Budapest"]],
  ["Iceland",                    ["Atlantic/Reykjavik"]],
  ["India",                      ["Asia/Kolkata"]],
  ["Indonesia",                  ["Asia/Jakarta","Asia/Makassar","Asia/Jayapura","Asia/Pontianak"]],
  ["Iran",                       ["Asia/Tehran"]],
  ["Iraq",                       ["Asia/Baghdad"]],
  ["Ireland",                    ["Europe/Dublin"]],
  ["Israel",                     ["Asia/Jerusalem"]],
  ["Italy",                      ["Europe/Rome"]],
  ["Ivory Coast",                ["Africa/Abidjan"]],
  ["Côte d'Ivoire",              ["Africa/Abidjan"]],
  ["Jamaica",                    ["America/Jamaica"]],
  ["Japan",                      ["Asia/Tokyo"]],
  ["Jordan",                     ["Asia/Amman"]],
  ["Kazakhstan",                 ["Asia/Almaty","Asia/Aqtau","Asia/Atyrau","Asia/Oral","Asia/Aqtobe","Asia/Qostanay","Asia/Qyzylorda"]],
  ["Kenya",                      ["Africa/Nairobi"]],
  ["Kuwait",                     ["Asia/Kuwait"]],
  ["Kyrgyzstan",                 ["Asia/Bishkek"]],
  ["Laos",                       ["Asia/Vientiane"]],
  ["Latvia",                     ["Europe/Riga"]],
  ["Lebanon",                    ["Asia/Beirut"]],
  ["Libya",                      ["Africa/Tripoli"]],
  ["Lithuania",                  ["Europe/Vilnius"]],
  ["Luxembourg",                 ["Europe/Luxembourg"]],
  ["Malaysia",                   ["Asia/Kuala_Lumpur","Asia/Kuching"]],
  ["Mexico",                     ["America/Mexico_City","America/Tijuana","America/Hermosillo","America/Chihuahua","America/Monterrey","America/Merida","America/Cancun","America/Mazatlan","America/Bahia_Banderas"]],
  ["Moldova",                    ["Europe/Chisinau"]],
  ["Mongolia",                   ["Asia/Ulaanbaatar","Asia/Hovd","Asia/Choibalsan"]],
  ["Morocco",                    ["Africa/Casablanca"]],
  ["Mozambique",                 ["Africa/Maputo"]],
  ["Myanmar",                    ["Asia/Yangon"]],
  ["Burma",                      ["Asia/Yangon"]],
  ["Nepal",                      ["Asia/Kathmandu"]],
  ["Netherlands",                ["Europe/Amsterdam"]],
  ["New Zealand",                ["Pacific/Auckland","Pacific/Chatham"]],
  ["Nicaragua",                  ["America/Managua"]],
  ["Nigeria",                    ["Africa/Lagos"]],
  ["North Korea",                ["Asia/Pyongyang"]],
  ["Norway",                     ["Europe/Oslo"]],
  ["Oman",                       ["Asia/Muscat"]],
  ["Pakistan",                   ["Asia/Karachi"]],
  ["Panama",                     ["America/Panama"]],
  ["Papua New Guinea",           ["Pacific/Port_Moresby"]],
  ["Paraguay",                   ["America/Asuncion"]],
  ["Peru",                       ["America/Lima"]],
  ["Philippines",                ["Asia/Manila"]],
  ["Poland",                     ["Europe/Warsaw"]],
  ["Portugal",                   ["Europe/Lisbon","Atlantic/Azores","Atlantic/Madeira"]],
  ["Qatar",                      ["Asia/Qatar"]],
  ["Romania",                    ["Europe/Bucharest"]],
  ["Russia",                     ["Europe/Moscow","Europe/Kaliningrad","Europe/Samara","Europe/Volgograd","Europe/Saratov","Asia/Yekaterinburg","Asia/Omsk","Asia/Novosibirsk","Asia/Krasnoyarsk","Asia/Irkutsk","Asia/Yakutsk","Asia/Vladivostok","Asia/Magadan","Asia/Sakhalin","Asia/Kamchatka","Asia/Anadyr","Asia/Barnaul","Asia/Tomsk","Asia/Chita","Asia/Srednekolymsk"]],
  ["Saudi Arabia",               ["Asia/Riyadh"]],
  ["Senegal",                    ["Africa/Dakar"]],
  ["Serbia",                     ["Europe/Belgrade"]],
  ["Singapore",                  ["Asia/Singapore"]],
  ["Slovakia",                   ["Europe/Bratislava"]],
  ["Slovenia",                   ["Europe/Ljubljana"]],
  ["Somalia",                    ["Africa/Mogadishu"]],
  ["South Africa",               ["Africa/Johannesburg"]],
  ["South Korea",                ["Asia/Seoul"]],
  ["Korea",                      ["Asia/Seoul"]],
  ["Spain",                      ["Europe/Madrid","Atlantic/Canary"]],
  ["Sri Lanka",                  ["Asia/Colombo"]],
  ["Ceylon",                     ["Asia/Colombo"]],
  ["Sudan",                      ["Africa/Khartoum"]],
  ["Sweden",                     ["Europe/Stockholm"]],
  ["Switzerland",                ["Europe/Zurich"]],
  ["Syria",                      ["Asia/Damascus"]],
  ["Taiwan",                     ["Asia/Taipei"]],
  ["Tanzania",                   ["Africa/Dar_es_Salaam"]],
  ["Thailand",                   ["Asia/Bangkok"]],
  ["Tunisia",                    ["Africa/Tunis"]],
  ["Turkey",                     ["Europe/Istanbul"]],
  ["Uganda",                     ["Africa/Kampala"]],
  ["Ukraine",                    ["Europe/Kiev"]],
  ["United Arab Emirates",       ["Asia/Dubai"]],
  ["UAE",                        ["Asia/Dubai"]],
  ["United Kingdom",             ["Europe/London"]],
  ["UK",                         ["Europe/London"]],
  ["England",                    ["Europe/London"]],
  ["Britain",                    ["Europe/London"]],
  ["Scotland",                   ["Europe/London"]],
  ["Wales",                      ["Europe/London"]],
  ["United States",              ["America/New_York","America/Chicago","America/Denver","America/Los_Angeles","America/Anchorage","Pacific/Honolulu","America/Phoenix","America/Detroit","America/Indiana/Indianapolis","America/Kentucky/Louisville"]],
  ["USA",                        ["America/New_York","America/Chicago","America/Denver","America/Los_Angeles","America/Anchorage","Pacific/Honolulu","America/Phoenix"]],
  ["Uruguay",                    ["America/Montevideo"]],
  ["Uzbekistan",                 ["Asia/Tashkent","Asia/Samarkand"]],
  ["Venezuela",                  ["America/Caracas"]],
  ["Vietnam",                    ["Asia/Ho_Chi_Minh"]],
  ["Yemen",                      ["Asia/Aden"]],
  ["Zambia",                     ["Africa/Lusaka"]],
  ["Zimbabwe",                   ["Africa/Harare"]],
];

// ── City aliases: cities whose name differs from the IANA zone's city component ─

const CITY_ZONE: Record<string, string> = {
  // India — one zone (Asia/Kolkata) for the entire country
  "Delhi": "Asia/Kolkata", "New Delhi": "Asia/Kolkata", "Mumbai": "Asia/Kolkata",
  "Bombay": "Asia/Kolkata", "Bangalore": "Asia/Kolkata", "Bengaluru": "Asia/Kolkata",
  "Chennai": "Asia/Kolkata", "Madras": "Asia/Kolkata", "Hyderabad": "Asia/Kolkata",
  "Pune": "Asia/Kolkata", "Ahmedabad": "Asia/Kolkata", "Surat": "Asia/Kolkata",
  "Jaipur": "Asia/Kolkata", "Lucknow": "Asia/Kolkata", "Kanpur": "Asia/Kolkata",
  "Nagpur": "Asia/Kolkata", "Noida": "Asia/Kolkata", "Gurgaon": "Asia/Kolkata",
  "Kochi": "Asia/Kolkata", "Cochin": "Asia/Kolkata", "Coimbatore": "Asia/Kolkata",
  "Patna": "Asia/Kolkata", "Indore": "Asia/Kolkata", "Bhopal": "Asia/Kolkata",
  "Vadodara": "Asia/Kolkata", "Chandigarh": "Asia/Kolkata", "Agra": "Asia/Kolkata",
  "Visakhapatnam": "Asia/Kolkata", "Calcutta": "Asia/Kolkata",
  // Indonesia
  "Bali": "Asia/Makassar", "Denpasar": "Asia/Makassar", "Lombok": "Asia/Makassar",
  "Surabaya": "Asia/Jakarta", "Bandung": "Asia/Jakarta", "Semarang": "Asia/Jakarta",
  "Yogyakarta": "Asia/Jakarta", "Palembang": "Asia/Jakarta", "Medan": "Asia/Jakarta",
  // China
  "Beijing": "Asia/Shanghai", "Peking": "Asia/Shanghai", "Guangzhou": "Asia/Shanghai",
  "Shenzhen": "Asia/Shanghai", "Chongqing": "Asia/Shanghai", "Wuhan": "Asia/Shanghai",
  "Chengdu": "Asia/Shanghai", "Xi'an": "Asia/Shanghai", "Xian": "Asia/Shanghai",
  "Tianjin": "Asia/Shanghai", "Hangzhou": "Asia/Shanghai", "Nanjing": "Asia/Shanghai",
  "Shenyang": "Asia/Shanghai", "Harbin": "Asia/Shanghai", "Qingdao": "Asia/Shanghai",
  "Zhengzhou": "Asia/Shanghai", "Kunming": "Asia/Shanghai",
  // Japan
  "Osaka": "Asia/Tokyo", "Kyoto": "Asia/Tokyo", "Yokohama": "Asia/Tokyo",
  "Nagoya": "Asia/Tokyo", "Sapporo": "Asia/Tokyo", "Fukuoka": "Asia/Tokyo",
  "Kobe": "Asia/Tokyo", "Hiroshima": "Asia/Tokyo", "Sendai": "Asia/Tokyo",
  // South Korea
  "Busan": "Asia/Seoul", "Incheon": "Asia/Seoul", "Daegu": "Asia/Seoul",
  "Gwangju": "Asia/Seoul", "Ulsan": "Asia/Seoul",
  // Russia (cities not named as IANA zones)
  "Saint Petersburg": "Europe/Moscow", "St Petersburg": "Europe/Moscow",
  "St. Petersburg": "Europe/Moscow",
  // Middle East
  "Mecca": "Asia/Riyadh", "Medina": "Asia/Riyadh", "Jeddah": "Asia/Riyadh",
  "Doha": "Asia/Qatar", "Kuwait City": "Asia/Kuwait",
  "Abu Dhabi": "Asia/Dubai", "Sharjah": "Asia/Dubai", "Ajman": "Asia/Dubai",
  "Tel Aviv": "Asia/Jerusalem", "Haifa": "Asia/Jerusalem",
  "Islamabad": "Asia/Karachi", "Lahore": "Asia/Karachi", "Faisalabad": "Asia/Karachi",
  "Rawalpindi": "Asia/Karachi", "Multan": "Asia/Karachi",
  "Chittagong": "Asia/Dhaka",
  "Mandalay": "Asia/Yangon", "Naypyidaw": "Asia/Yangon", "Rangoon": "Asia/Yangon",
  "Phnom Penh": "Asia/Phnom_Penh", "Siem Reap": "Asia/Phnom_Penh",
  "Vientiane": "Asia/Vientiane",
  "Hanoi": "Asia/Ho_Chi_Minh", "Da Nang": "Asia/Ho_Chi_Minh",
  "Saigon": "Asia/Ho_Chi_Minh", "Ho Chi Minh City": "Asia/Ho_Chi_Minh",
  "Penang": "Asia/Kuala_Lumpur", "Johor Bahru": "Asia/Kuala_Lumpur",
  "Kuching": "Asia/Kuching",
  "Cebu": "Asia/Manila", "Davao": "Asia/Manila", "Quezon City": "Asia/Manila",
  // Africa
  "Cape Town": "Africa/Johannesburg", "Durban": "Africa/Johannesburg",
  "Pretoria": "Africa/Johannesburg",
  "Alexandria": "Africa/Cairo", "Giza": "Africa/Cairo",
  "Rabat": "Africa/Casablanca", "Marrakech": "Africa/Casablanca",
  "Fes": "Africa/Casablanca",
  "Abuja": "Africa/Lagos", "Kano": "Africa/Lagos", "Ibadan": "Africa/Lagos",
  "Accra": "Africa/Accra", "Kumasi": "Africa/Accra",
  "Addis Ababa": "Africa/Addis_Ababa",
  "Dar es Salaam": "Africa/Dar_es_Salaam", "Dodoma": "Africa/Dar_es_Salaam",
  "Kampala": "Africa/Kampala",
  "Khartoum": "Africa/Khartoum",
  "Nairobi": "Africa/Nairobi",
  "Mogadishu": "Africa/Mogadishu",
  // Australia
  "Canberra": "Australia/Sydney", "Melbourne": "Australia/Melbourne",
  "Gold Coast": "Australia/Brisbane", "Sunshine Coast": "Australia/Brisbane",
  // New Zealand
  "Wellington": "Pacific/Auckland", "Christchurch": "Pacific/Auckland",
  // Americas — USA
  "New York": "America/New_York", "NYC": "America/New_York", "New York City": "America/New_York",
  "Boston": "America/New_York", "Miami": "America/New_York", "Orlando": "America/New_York",
  "Atlanta": "America/New_York", "Washington DC": "America/New_York",
  "Washington": "America/New_York", "Philadelphia": "America/New_York",
  "Charlotte": "America/New_York", "Baltimore": "America/New_York",
  "Pittsburgh": "America/New_York", "Cleveland": "America/New_York",
  "Houston": "America/Chicago", "Dallas": "America/Chicago", "Austin": "America/Chicago",
  "Chicago": "America/Chicago", "Minneapolis": "America/Chicago",
  "Kansas City": "America/Chicago", "New Orleans": "America/Chicago",
  "Nashville": "America/Chicago", "Memphis": "America/Chicago",
  "Denver": "America/Denver", "Salt Lake City": "America/Denver",
  "Albuquerque": "America/Denver",
  "Los Angeles": "America/Los_Angeles", "San Francisco": "America/Los_Angeles",
  "San Diego": "America/Los_Angeles", "Seattle": "America/Los_Angeles",
  "Portland": "America/Los_Angeles", "Las Vegas": "America/Los_Angeles",
  "Sacramento": "America/Los_Angeles", "Silicon Valley": "America/Los_Angeles",
  "Phoenix": "America/Phoenix", "Tucson": "America/Phoenix",
  "Honolulu": "Pacific/Honolulu",
  // Americas — Canada
  "Toronto": "America/Toronto", "Ottawa": "America/Toronto", "Montreal": "America/Toronto",
  "Vancouver": "America/Vancouver", "Victoria": "America/Vancouver",
  "Calgary": "America/Edmonton", "Edmonton": "America/Edmonton",
  "Winnipeg": "America/Winnipeg", "Regina": "America/Regina",
  "Halifax": "America/Halifax",
  // Americas — Latin
  "Mexico City": "America/Mexico_City", "Guadalajara": "America/Mexico_City",
  "Monterrey": "America/Monterrey",
  "Sao Paulo": "America/Sao_Paulo", "São Paulo": "America/Sao_Paulo",
  "Rio de Janeiro": "America/Sao_Paulo", "Brasilia": "America/Sao_Paulo",
  "Buenos Aires": "America/Argentina/Buenos_Aires",
  "Bogota": "America/Bogota", "Bogotá": "America/Bogota", "Medellin": "America/Bogota",
  // Europe — cities not named in IANA paths
  "Munich": "Europe/Berlin", "Frankfurt": "Europe/Berlin", "Hamburg": "Europe/Berlin",
  "Cologne": "Europe/Berlin", "Stuttgart": "Europe/Berlin", "Dusseldorf": "Europe/Berlin",
  "Milan": "Europe/Rome", "Naples": "Europe/Rome", "Florence": "Europe/Rome",
  "Venice": "Europe/Rome", "Turin": "Europe/Rome",
  "Barcelona": "Europe/Madrid", "Seville": "Europe/Madrid", "Valencia": "Europe/Madrid",
  "Bilbao": "Europe/Madrid",
  "Rotterdam": "Europe/Amsterdam",
  "Kyiv": "Europe/Kiev", "Kiev": "Europe/Kiev", "Kharkiv": "Europe/Kiev",
  "Odessa": "Europe/Kiev", "Dnipro": "Europe/Kiev",
  "Krakow": "Europe/Warsaw", "Gdansk": "Europe/Warsaw", "Wroclaw": "Europe/Warsaw",
  "Brno": "Europe/Prague", "Ostrava": "Europe/Prague",
  "Gothenburg": "Europe/Stockholm", "Malmo": "Europe/Stockholm",
  "Bergen": "Europe/Oslo", "Trondheim": "Europe/Oslo",
  "Aarhus": "Europe/Copenhagen",
  "Tampere": "Europe/Helsinki", "Turku": "Europe/Helsinki",
  "Thessaloniki": "Europe/Athens",
  "Geneva": "Europe/Zurich", "Bern": "Europe/Zurich", "Basel": "Europe/Zurich",
  "Porto": "Europe/Lisbon",
  "Ankara": "Europe/Istanbul", "Izmir": "Europe/Istanbul", "Bursa": "Europe/Istanbul",
  "Reykjavik": "Atlantic/Reykjavik",
  "Dublin": "Europe/Dublin", "Cork": "Europe/Dublin",
  "Brussels": "Europe/Brussels",
  "Minsk": "Europe/Minsk",
  "Chisinau": "Europe/Chisinau",
  "Ljubljana": "Europe/Ljubljana",
  "Bratislava": "Europe/Bratislava",
  "Sarajevo": "Europe/Sarajevo",
  "Skopje": "Europe/Skopje",
};

// ── Build inverted lookup maps (module-level, computed once) ──────────────────

const _ianaToCntries: Record<string, string[]> = {};
for (const [country, zones] of COUNTRY_ZONES) {
  for (const zone of zones) {
    if (!_ianaToCntries[zone]) _ianaToCntries[zone] = [];
    if (!_ianaToCntries[zone].includes(country)) _ianaToCntries[zone].push(country);
  }
}

const _ianaToExtras: Record<string, string[]> = {};
for (const [city, zone] of Object.entries(CITY_ZONE)) {
  if (!_ianaToExtras[zone]) _ianaToExtras[zone] = [];
  _ianaToExtras[zone].push(city);
}

// ── Popular timezones (shown when query is empty) ─────────────────────────────

const POPULAR_IANA = [
  "UTC",
  "America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "America/Anchorage","Pacific/Honolulu","America/Toronto","America/Mexico_City",
  "America/Sao_Paulo","America/Argentina/Buenos_Aires",
  "Europe/London","Europe/Paris","Europe/Berlin","Europe/Moscow","Europe/Istanbul",
  "Africa/Cairo","Africa/Lagos","Africa/Nairobi","Africa/Johannesburg",
  "Asia/Riyadh","Asia/Dubai","Asia/Tehran","Asia/Karachi",
  "Asia/Kolkata","Asia/Dhaka","Asia/Bangkok","Asia/Ho_Chi_Minh",
  "Asia/Jakarta","Asia/Makassar","Asia/Jayapura",
  "Asia/Singapore","Asia/Kuala_Lumpur","Asia/Manila",
  "Asia/Shanghai","Asia/Hong_Kong","Asia/Tokyo","Asia/Seoul",
  "Australia/Perth","Australia/Darwin","Australia/Adelaide",
  "Australia/Brisbane","Australia/Sydney","Pacific/Auckland",
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
  let abbr = iana;
  let utcOffset = "UTC+0";
  let offsetMins = 0;
  try {
    abbr = new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "short" })
      .formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? iana;
    const raw = new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "shortOffset" })
      .formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
    utcOffset = raw.replace("GMT", "UTC");
    offsetMins = parseOffsetStr(raw);
  } catch { /* unsupported */ }
  return {
    iana, city, region,
    countries: _ianaToCntries[iana] ?? [],
    extraCities: _ianaToExtras[iana] ?? [],
    abbr, utcOffset, offsetMins,
  };
}

function buildTZIndex(now: Date): TZEntry[] {
  let ianaList: string[];
  try {
    ianaList = (Intl as unknown as { supportedValuesOf(k: string): string[] })
      .supportedValuesOf("timeZone");
  } catch { ianaList = POPULAR_IANA; }
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
    const isExact = tz.abbr.toLowerCase() === lq;
    const hit =
      isExact ||
      tz.city.toLowerCase().includes(lq) ||
      tz.iana.toLowerCase().replace(/_/g, " ").includes(lq) ||
      tz.abbr.toLowerCase().includes(lq) ||
      tz.utcOffset.toLowerCase().includes(lq) ||
      tz.countries.some((c) => c.toLowerCase().includes(lq)) ||
      tz.extraCities.some((c) => c.toLowerCase().includes(lq));
    if (hit) (isExact ? exact : partial).push(tz);
    if (exact.length + partial.length >= 120) break;
  }
  return [...exact, ...partial].slice(0, 50);
}

function getTZOffsetMins(iana: string, dateStr: string): number {
  const ref = new Date(dateStr + "T12:00:00Z");
  const s = new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "shortOffset" })
    .formatToParts(ref).find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  return parseOffsetStr(s);
}

function buildRefDate(iana: string, dateStr: string, mins: number): Date {
  const offsetMins = getTZOffsetMins(iana, dateStr);
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, Math.floor(mins / 60), mins % 60) - offsetMins * 60000);
}

function getLiveMeta(iana: string, now: Date) {
  const abbr = new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "short" })
    .formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
  const raw = new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "shortOffset" })
    .formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
  return { abbr, utcOffset: raw.replace("GMT", "UTC") };
}

function fmtTime(iana: string, date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: iana, hour: "numeric", minute: "2-digit", hour12: true,
  }).format(date);
}
function fmtDate(iana: string, date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: iana, weekday: "short", month: "short", day: "numeric",
  }).format(date);
}
function getISODate(iana: string, date: Date) {
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
  const selMeta = useMemo(() => selected ? getLiveMeta(selected.iana, now) : null, [selected, now]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) { setOpen(false); setQuery(""); }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-0">
      <div className={labelCls}>{label}</div>

      {/* Trigger */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 20); }}
        className={cn(
          "w-full text-left px-3 py-2.5 border transition-colors bg-surface-muted",
          open ? "border-primary/50" : "border-border hover:border-foreground-muted/40",
        )}
      >
        {selected ? (
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex items-baseline gap-1.5">
              <span className="font-mono text-sm font-semibold text-foreground">{selected.city}</span>
              {selected.countries[0] && (
                <span className="font-mono text-[10px] text-foreground-muted truncate">
                  {selected.countries[0]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="font-mono text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 tracking-wider">
                {selMeta?.abbr ?? selected.abbr}
              </span>
              <span className="font-mono text-[10px] text-foreground-muted">{selMeta?.utcOffset ?? selected.utcOffset}</span>
            </div>
          </div>
        ) : (
          <span className="font-mono text-sm text-foreground-muted/40 select-none">
            Select timezone — city, country, or abbreviation
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-px border border-border bg-surface shadow-2xl">
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="India · IST · Jakarta · WIB · UTC+5:30 · Tokyo · JST…"
              className="w-full bg-surface-muted border border-border px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-primary/40 text-foreground placeholder:text-foreground-muted/35"
            />
          </div>

          {/* Section header */}
          {!query && (
            <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-foreground-muted/40 border-b border-border bg-surface-muted">
              Popular timezones · type to search all {index.length} zones
            </div>
          )}
          {query && results.length > 0 && (
            <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-foreground-muted/40 border-b border-border bg-surface-muted">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </div>
          )}

          {/* Results */}
          <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
            {results.length === 0 ? (
              <div className="px-3 py-6 font-mono text-xs text-foreground-muted/50 text-center">
                No timezones found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              results.map((tz) => {
                const liveTime = fmtTime(tz.iana, now);
                const isSelected = selected?.iana === tz.iana;
                return (
                  <button
                    key={tz.iana}
                    onClick={() => { onSelect(tz); setOpen(false); setQuery(""); }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 flex items-center gap-3 border-b border-border/25 last:border-0 transition-colors",
                      isSelected ? "bg-primary/8" : "hover:bg-surface-muted",
                    )}
                  >
                    {/* Left: city + country + IANA */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className={cn("font-mono text-sm font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                          {tz.city}
                        </span>
                        {tz.countries[0] && (
                          <span className="font-mono text-[10px] text-foreground-muted truncate">
                            {tz.countries.slice(0, 2).join(" · ")}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[9px] text-foreground-muted/35 mt-0.5">{tz.iana}</div>
                    </div>
                    {/* Right: live time + abbr + offset */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] text-foreground-muted tabular-nums">{liveTime}</span>
                      <span className={cn(
                        "font-mono text-[9px] font-semibold px-1.5 py-0.5 tracking-wider",
                        isSelected ? "bg-primary/15 text-primary" : "bg-surface-muted text-foreground-muted",
                      )}>
                        {tz.abbr}
                      </span>
                      <span className="font-mono text-[10px] text-foreground-muted/60 tabular-nums w-[68px] text-right">
                        {tz.utcOffset}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Hour Grid ─────────────────────────────────────────────────────────────────

const CELL_W = 52;
const LABEL_W = 148;

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

  const utcTimes = useMemo(() => {
    const offsetMins = getTZOffsetMins(fromTZ.iana, dateStr);
    const [y, mo, d] = dateStr.split("-").map(Number);
    return Array.from({ length: 24 }, (_, h) =>
      new Date(Date.UTC(y, mo - 1, d, h, 0) - offsetMins * 60000),
    );
  }, [fromTZ.iana, dateStr]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: Math.max(0, selectedHour * CELL_W - el.clientWidth / 2 + CELL_W / 2), behavior: "smooth" });
  }, [selectedHour]);

  const fromMeta = useMemo(() => getLiveMeta(fromTZ.iana, now), [fromTZ.iana, now]);
  const toMeta = useMemo(() => getLiveMeta(toTZ.iana, now), [toTZ.iana, now]);

  function cell(d: Date, h: number, iana: string, row: "from" | "to", prevIso: string) {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: iana, hour: "numeric", hour12: true }).formatToParts(d);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "12");
    const period = (parts.find((p) => p.type === "dayPeriod")?.value ?? "AM").toLowerCase().slice(0, 2);
    const iso = getISODate(iana, d);
    const isNewDay = h === 0 || iso !== prevIso;
    const isSelected = h === selectedHour;
    const dateLabel = isNewDay
      ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", weekday: "short" }).format(new Date(iso + "T12:00:00Z"))
      : null;
    return (
      <div
        key={`${row}-${h}`}
        onClick={() => onSelectHour(h)}
        style={{ height: 76 }}
        className={cn(
          "flex flex-col items-center cursor-pointer select-none transition-colors",
          row === "from" && "border-b border-border",
          h > 0 && "border-l border-border",
          isSelected ? "bg-primary/10" : "hover:bg-surface-muted",
        )}
      >
        <div className={cn(
          "w-full text-center font-mono text-[7px] uppercase tracking-wide leading-none pt-1.5 pb-0.5 px-0.5 truncate",
          isNewDay ? "text-foreground-muted/50" : "text-transparent",
        )}>
          {dateLabel ?? "·"}
        </div>
        <div className={cn("font-mono text-sm font-bold tabular-nums leading-tight", isSelected ? "text-primary" : "text-foreground")}>
          {hour}
        </div>
        <div className={cn("font-mono text-[9px] leading-none pb-2", isSelected ? "text-primary/70" : "text-foreground-muted/60")}>
          {period}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border flex overflow-hidden">
      {/* Fixed label column */}
      <div className="shrink-0 border-r border-border bg-surface z-10" style={{ width: LABEL_W }}>
        {[{ tz: fromTZ, meta: fromMeta, border: true }, { tz: toTZ, meta: toMeta, border: false }].map(({ tz, meta, border }) => (
          <div key={tz.iana} className={cn("flex flex-col justify-center px-3 py-2 h-[76px]", border && "border-b border-border")}>
            <div className="font-mono text-[11px] font-semibold text-foreground truncate">{tz.city}</div>
            <div className="font-mono text-[9px] text-foreground-muted/50 truncate">
              {tz.countries[0] || tz.region}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="font-mono text-[9px] font-semibold bg-primary/10 text-primary px-1 py-0.5 tracking-wider">{meta.abbr}</span>
              <span className="font-mono text-[9px] text-foreground-muted/60">{meta.utcOffset}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Scrollable grid */}
      <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden flex-1">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(24, ${CELL_W}px)`, width: `${24 * CELL_W}px` }}>
          {utcTimes.map((d, h) =>
            cell(d, h, fromTZ.iana, "from", h > 0 ? getISODate(fromTZ.iana, utcTimes[h - 1]) : dateStr),
          )}
          {utcTimes.map((d, h) =>
            cell(d, h, toTZ.iana, "to", h > 0 ? getISODate(toTZ.iana, utcTimes[h - 1]) : getISODate(toTZ.iana, utcTimes[0])),
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
  const { dateStr: d0, timeStr: t0 } = getNowStrings();
  const [dateStr, setDateStr] = useState(d0);
  const [timeStr, setTimeStr] = useState(t0);
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
    const dayDiff = Math.round((new Date(toISO).getTime() - new Date(dateStr).getTime()) / 86400000);
    return { time: fmtTime(tz2.iana, refDate), date: fmtDate(tz2.iana, refDate), dayDiff };
  }, [tz1, tz2, refDate, dateStr]);

  const tz1Meta = useMemo(() => tz1 ? getLiveMeta(tz1.iana, now) : null, [tz1, now]);
  const tz2Meta = useMemo(() => tz2 ? getLiveMeta(tz2.iana, now) : null, [tz2, now]);

  return (
    <div className="space-y-4">

      {/* ── UTC reference bar ── */}
      <div className="border border-border px-4 py-3 flex items-center justify-between gap-4 bg-surface-muted">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground-muted/50">
            Current UTC
          </span>
          <span className="font-mono text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 tracking-wider">
            UTC+0
          </span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xl font-bold tabular-nums text-foreground leading-none">
            {fmtTime("UTC", now)}
          </span>
          <span className="font-mono text-[11px] text-foreground-muted">{fmtDate("UTC", now)}</span>
        </div>
      </div>

      {/* ── Timezone pickers ── */}
      <div className="flex flex-col sm:flex-row items-end gap-2">
        <TZPicker selected={tz1} onSelect={setTz1} label="Timezone 1" index={tzIndex} now={now} />
        <button
          onClick={() => { setTz1(tz2); setTz2(tz1); }}
          title="Swap"
          className={cn(secondaryBtnCls, "px-3 py-2.5 shrink-0")}
        >
          ⇌
        </button>
        <TZPicker selected={tz2} onSelect={setTz2} label="Timezone 2" index={tzIndex} now={now} />
      </div>

      {/* ── Current time cards ── */}
      {(tz1 || tz2) && (
        <div className="grid grid-cols-2 gap-3">
          {([
            { tz: tz1, meta: tz1Meta, role: "tz1" },
            { tz: tz2, meta: tz2Meta, role: "tz2" },
          ] as const).map(({ tz, meta, role }) => (
            <div key={role} className="border border-border p-3">
              {tz ? (
                <>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-foreground-muted/45 mb-1.5 truncate">
                    {tz.countries[0] ? `${tz.city} · ${tz.countries[0]}` : tz.iana}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xl font-bold tabular-nums text-foreground leading-none">
                      {fmtTime(tz.iana, now)}
                    </span>
                    <span className="font-mono text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 tracking-wider">
                      {meta?.abbr ?? tz.abbr}
                    </span>
                    <span className="font-mono text-[10px] text-foreground-muted tabular-nums">
                      {meta?.utcOffset ?? tz.utcOffset}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-foreground-muted/60 mt-1">
                    {fmtDate(tz.iana, now)}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[60px]">
                  <span className="font-mono text-[11px] text-foreground-muted/25">Select a timezone</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Time picker + conversion ── */}
      {tz1 && tz2 && (
        <div className="border border-border grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="p-3 space-y-2">
            <div className={labelCls}>Set time · {tz1.city}</div>
            <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={inputCls} />
            <div className="flex gap-2">
              <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className={cn(inputCls, "flex-1")} />
              <button onClick={() => { const { dateStr: d, timeStr: t } = getNowStrings(); setDateStr(d); setTimeStr(t); }} className={cn(secondaryBtnCls, "py-2.5 shrink-0")}>
                Now
              </button>
            </div>
          </div>
          <div className="p-3 flex flex-col justify-center gap-1">
            <div className={labelCls}>Result · {tz2.city}</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-mono text-2xl font-bold tabular-nums text-foreground leading-none">
                {converted?.time}
              </span>
              {converted && converted.dayDiff !== 0 && (
                <span className={cn(
                  "font-mono text-[10px] px-1.5 py-0.5",
                  converted.dayDiff > 0 ? "bg-primary/10 text-primary" : "bg-foreground-muted/10 text-foreground-muted",
                )}>
                  {converted.dayDiff > 0 ? "+" : ""}{converted.dayDiff}&nbsp;day{Math.abs(converted.dayDiff) !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="font-mono text-[10px] text-foreground-muted">{converted?.date}</div>
          </div>
        </div>
      )}

      {/* ── 24-hour grid ── */}
      {tz1 && tz2 && (
        <HourGrid
          fromTZ={tz1} toTZ={tz2} dateStr={dateStr}
          selectedHour={selectedHour}
          onSelectHour={(h) => setTimeStr(`${String(h).padStart(2, "0")}:00`)}
          now={now}
        />
      )}
    </div>
  );
}
