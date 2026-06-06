"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { labelCls, inputCls, secondaryBtnCls } from "@/lib/utils/formStyles";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN RATIONALE
//
// Search works in three modes:
//   1. Exact abbreviation (IST, WIB, JST…) → returns matching zones sorted by
//      population weight.  India (pop 100) comes before Israel (55) before
//      Ireland (45) for IST.  Uses hardcoded abbrs[] — never relies on
//      Intl.DateTimeFormat which returns "GMT+5:30" in some browsers.
//   2. City / alt-name match → shows the SEARCHED city name (e.g. typing
//      "Delhi" shows "Delhi · India", not "Mumbai · India").
//   3. Country / partial-abbr / offset text search → score-ranked results.
//
// Data layer: ~110 curated TZPlace entries with explicit abbrs[] and altNames[].
// Runtime: Intl.DateTimeFormat used only for live time display and UTC offset
// computation — NOT for abbreviation lookup.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

interface TZPlace {
  iana: string;
  city: string;          // primary display city
  country: string;
  abbrs: string[];       // ALL abbreviations (std + DST) — used for search AND display fallback
  altNames: string[];    // other city names and search terms
  pop: number;           // 1–100 popularity weight (resolves ambiguous abbreviations)
}

interface TZEntry extends TZPlace {
  abbr: string;          // current displayed abbreviation (Intl with abbrs[0] fallback)
  utcOffset: string;     // "UTC+5:30"
  offsetMins: number;
  displayCity?: string;  // set when matched via altName (e.g. "Delhi" for Asia/Kolkata)
}

// ── Curated timezone database ─────────────────────────────────────────────────
// ~110 major populated zones. Pop weight resolves abbreviation ambiguity.
// IST: India(100) > Colombo(50) > Israel(55) > Ireland(45) → India shown first.

const DB: TZPlace[] = [
  // ─ Universal ─
  { iana:"UTC",                           city:"UTC",               country:"Universal",         abbrs:["UTC","GMT"],           altNames:["Coordinated Universal Time","Greenwich Mean Time","Universal","GMT+0","UTC+0"],                                                         pop:90 },
  // ─ Americas ─
  { iana:"America/New_York",              city:"New York",          country:"United States",     abbrs:["EST","EDT","ET"],      altNames:["Eastern Time","NYC","New York City","Boston","Miami","Atlanta","Washington DC","Philadelphia","Charlotte","Baltimore","Pittsburgh","Cleveland","Orlando","Detroit"],     pop:95 },
  { iana:"America/Chicago",               city:"Chicago",           country:"United States",     abbrs:["CST","CDT","CT"],      altNames:["Central Time","Houston","Dallas","Austin","New Orleans","Nashville","Memphis","Minneapolis","Kansas City"],                              pop:85 },
  { iana:"America/Denver",                city:"Denver",            country:"United States",     abbrs:["MST","MDT","MT"],      altNames:["Mountain Time","Salt Lake City","Albuquerque","Boise"],                                                                                  pop:65 },
  { iana:"America/Los_Angeles",           city:"Los Angeles",       country:"United States",     abbrs:["PST","PDT","PT"],      altNames:["Pacific Time","San Francisco","Seattle","Las Vegas","San Diego","Portland","Sacramento","Silicon Valley"],                               pop:95 },
  { iana:"America/Phoenix",               city:"Phoenix",           country:"United States",     abbrs:["MST"],                 altNames:["Arizona","Tucson"],                                                                                                                      pop:60 },
  { iana:"America/Anchorage",             city:"Anchorage",         country:"United States",     abbrs:["AKST","AKDT"],         altNames:["Alaska"],                                                                                                                               pop:40 },
  { iana:"Pacific/Honolulu",              city:"Honolulu",          country:"United States",     abbrs:["HST"],                 altNames:["Hawaii"],                                                                                                                               pop:55 },
  { iana:"America/Toronto",               city:"Toronto",           country:"Canada",            abbrs:["EST","EDT"],           altNames:["Ottawa","Montreal","Eastern Canada"],                                                                                                    pop:75 },
  { iana:"America/Vancouver",             city:"Vancouver",         country:"Canada",            abbrs:["PST","PDT"],           altNames:["Victoria","Pacific Canada"],                                                                                                            pop:65 },
  { iana:"America/Edmonton",              city:"Calgary",           country:"Canada",            abbrs:["MST","MDT"],           altNames:["Edmonton","Alberta"],                                                                                                                   pop:55 },
  { iana:"America/Winnipeg",              city:"Winnipeg",          country:"Canada",            abbrs:["CST","CDT"],           altNames:["Manitoba"],                                                                                                                             pop:45 },
  { iana:"America/Halifax",               city:"Halifax",           country:"Canada",            abbrs:["AST","ADT"],           altNames:["Nova Scotia","Atlantic Canada"],                                                                                                        pop:40 },
  { iana:"America/St_Johns",              city:"St. John's",        country:"Canada",            abbrs:["NST","NDT"],           altNames:["Newfoundland"],                                                                                                                         pop:35 },
  { iana:"America/Sao_Paulo",             city:"São Paulo",         country:"Brazil",            abbrs:["BRT","BRST"],          altNames:["Sao Paulo","Rio de Janeiro","Brasilia","Brazil"],                                                                                       pop:80 },
  { iana:"America/Argentina/Buenos_Aires",city:"Buenos Aires",      country:"Argentina",         abbrs:["ART"],                 altNames:["Argentina"],                                                                                                                            pop:70 },
  { iana:"America/Bogota",                city:"Bogotá",            country:"Colombia",          abbrs:["COT"],                 altNames:["Bogota","Medellin","Colombia"],                                                                                                         pop:60 },
  { iana:"America/Lima",                  city:"Lima",              country:"Peru",              abbrs:["PET"],                 altNames:["Peru"],                                                                                                                                 pop:55 },
  { iana:"America/Mexico_City",           city:"Mexico City",       country:"Mexico",            abbrs:["CST","CDT"],           altNames:["Guadalajara","Mexico"],                                                                                                                 pop:70 },
  { iana:"America/Caracas",               city:"Caracas",           country:"Venezuela",         abbrs:["VET"],                 altNames:["Venezuela"],                                                                                                                            pop:50 },
  { iana:"America/Santiago",              city:"Santiago",          country:"Chile",             abbrs:["CLT","CLST"],          altNames:["Chile"],                                                                                                                                pop:55 },
  { iana:"America/Manaus",                city:"Manaus",            country:"Brazil",            abbrs:["AMT"],                 altNames:["Amazon Time","Amazonas"],                                                                                                               pop:40 },
  { iana:"America/Havana",                city:"Havana",            country:"Cuba",              abbrs:["CST","CDT"],           altNames:["Cuba"],                                                                                                                                 pop:45 },
  { iana:"America/Santo_Domingo",         city:"Santo Domingo",     country:"Dominican Republic",abbrs:["AST"],                 altNames:["Dominican Republic"],                                                                                                                   pop:45 },
  // ─ Europe ─
  { iana:"Europe/London",                 city:"London",            country:"United Kingdom",    abbrs:["GMT","BST"],           altNames:["UK","England","Britain","Scotland","Wales","Greenwich"],                                                                                 pop:95 },
  { iana:"Europe/Paris",                  city:"Paris",             country:"France",            abbrs:["CET","CEST"],          altNames:["France","Central European Time"],                                                                                                       pop:90 },
  { iana:"Europe/Berlin",                 city:"Berlin",            country:"Germany",           abbrs:["CET","CEST"],          altNames:["Germany","Munich","Frankfurt","Hamburg","Cologne","Stuttgart","Dusseldorf"],                                                            pop:85 },
  { iana:"Europe/Rome",                   city:"Rome",              country:"Italy",             abbrs:["CET","CEST"],          altNames:["Italy","Milan","Naples","Florence","Venice","Turin"],                                                                                   pop:80 },
  { iana:"Europe/Madrid",                 city:"Madrid",            country:"Spain",             abbrs:["CET","CEST"],          altNames:["Spain","Barcelona","Seville","Valencia","Bilbao"],                                                                                      pop:75 },
  { iana:"Europe/Amsterdam",              city:"Amsterdam",         country:"Netherlands",       abbrs:["CET","CEST"],          altNames:["Netherlands","Rotterdam","The Hague","Holland"],                                                                                        pop:70 },
  { iana:"Europe/Brussels",               city:"Brussels",          country:"Belgium",           abbrs:["CET","CEST"],          altNames:["Belgium"],                                                                                                                              pop:65 },
  { iana:"Europe/Vienna",                 city:"Vienna",            country:"Austria",           abbrs:["CET","CEST"],          altNames:["Austria"],                                                                                                                              pop:65 },
  { iana:"Europe/Zurich",                 city:"Zurich",            country:"Switzerland",       abbrs:["CET","CEST"],          altNames:["Switzerland","Geneva","Bern","Basel"],                                                                                                  pop:70 },
  { iana:"Europe/Warsaw",                 city:"Warsaw",            country:"Poland",            abbrs:["CET","CEST"],          altNames:["Poland","Krakow","Gdansk","Wroclaw"],                                                                                                   pop:65 },
  { iana:"Europe/Stockholm",              city:"Stockholm",         country:"Sweden",            abbrs:["CET","CEST"],          altNames:["Sweden","Gothenburg","Malmo"],                                                                                                          pop:65 },
  { iana:"Europe/Oslo",                   city:"Oslo",              country:"Norway",            abbrs:["CET","CEST"],          altNames:["Norway","Bergen","Trondheim"],                                                                                                          pop:60 },
  { iana:"Europe/Copenhagen",             city:"Copenhagen",        country:"Denmark",           abbrs:["CET","CEST"],          altNames:["Denmark","Aarhus"],                                                                                                                     pop:60 },
  { iana:"Europe/Prague",                 city:"Prague",            country:"Czech Republic",    abbrs:["CET","CEST"],          altNames:["Czechia","Brno"],                                                                                                                       pop:60 },
  { iana:"Europe/Budapest",               city:"Budapest",          country:"Hungary",           abbrs:["CET","CEST"],          altNames:["Hungary"],                                                                                                                              pop:55 },
  { iana:"Europe/Helsinki",               city:"Helsinki",          country:"Finland",           abbrs:["EET","EEST"],          altNames:["Finland","Tampere","Turku"],                                                                                                            pop:60 },
  { iana:"Europe/Athens",                 city:"Athens",            country:"Greece",            abbrs:["EET","EEST"],          altNames:["Greece","Thessaloniki"],                                                                                                                pop:60 },
  { iana:"Europe/Bucharest",              city:"Bucharest",         country:"Romania",           abbrs:["EET","EEST"],          altNames:["Romania"],                                                                                                                              pop:55 },
  { iana:"Europe/Kiev",                   city:"Kyiv",              country:"Ukraine",           abbrs:["EET","EEST"],          altNames:["Kiev","Ukraine","Kharkiv","Odessa","Dnipro"],                                                                                           pop:60 },
  { iana:"Europe/Moscow",                 city:"Moscow",            country:"Russia",            abbrs:["MSK"],                 altNames:["Russia","Saint Petersburg","St Petersburg","St. Petersburg"],                                                                            pop:85 },
  { iana:"Europe/Istanbul",               city:"Istanbul",          country:"Turkey",            abbrs:["TRT"],                 altNames:["Turkey","Ankara","Izmir","Bursa"],                                                                                                      pop:80 },
  { iana:"Europe/Dublin",                 city:"Dublin",            country:"Ireland",           abbrs:["GMT","IST"],           altNames:["Ireland","Cork"],                                                                                                                       pop:45 },
  { iana:"Europe/Lisbon",                 city:"Lisbon",            country:"Portugal",          abbrs:["WET","WEST"],          altNames:["Portugal","Porto"],                                                                                                                     pop:55 },
  { iana:"Europe/Sofia",                  city:"Sofia",             country:"Bulgaria",          abbrs:["EET","EEST"],          altNames:["Bulgaria"],                                                                                                                             pop:45 },
  { iana:"Europe/Belgrade",               city:"Belgrade",          country:"Serbia",            abbrs:["CET","CEST"],          altNames:["Serbia"],                                                                                                                               pop:45 },
  { iana:"Europe/Tallinn",                city:"Tallinn",           country:"Estonia",           abbrs:["EET","EEST"],          altNames:["Estonia"],                                                                                                                              pop:35 },
  { iana:"Europe/Riga",                   city:"Riga",              country:"Latvia",            abbrs:["EET","EEST"],          altNames:["Latvia"],                                                                                                                               pop:35 },
  { iana:"Europe/Vilnius",                city:"Vilnius",           country:"Lithuania",         abbrs:["EET","EEST"],          altNames:["Lithuania"],                                                                                                                            pop:35 },
  { iana:"Europe/Minsk",                  city:"Minsk",             country:"Belarus",           abbrs:["FET"],                 altNames:["Belarus"],                                                                                                                              pop:45 },
  { iana:"Atlantic/Reykjavik",            city:"Reykjavik",         country:"Iceland",           abbrs:["GMT"],                 altNames:["Iceland"],                                                                                                                              pop:40 },
  { iana:"Europe/Chisinau",               city:"Chișinău",          country:"Moldova",           abbrs:["EET","EEST"],          altNames:["Moldova","Chisinau"],                                                                                                                   pop:30 },
  // ─ Africa ─
  { iana:"Africa/Cairo",                  city:"Cairo",             country:"Egypt",             abbrs:["EET"],                 altNames:["Egypt","Alexandria","Giza"],                                                                                                            pop:75 },
  { iana:"Africa/Lagos",                  city:"Lagos",             country:"Nigeria",           abbrs:["WAT"],                 altNames:["Nigeria","Abuja","Kano","Ibadan","West Africa"],                                                                                        pop:70 },
  { iana:"Africa/Nairobi",                city:"Nairobi",           country:"Kenya",             abbrs:["EAT"],                 altNames:["Kenya","East Africa"],                                                                                                                  pop:65 },
  { iana:"Africa/Johannesburg",           city:"Johannesburg",      country:"South Africa",      abbrs:["SAST"],                altNames:["South Africa","Cape Town","Pretoria","Durban"],                                                                                         pop:70 },
  { iana:"Africa/Addis_Ababa",            city:"Addis Ababa",       country:"Ethiopia",          abbrs:["EAT"],                 altNames:["Ethiopia"],                                                                                                                             pop:55 },
  { iana:"Africa/Dar_es_Salaam",          city:"Dar es Salaam",     country:"Tanzania",          abbrs:["EAT"],                 altNames:["Tanzania","Dodoma"],                                                                                                                    pop:50 },
  { iana:"Africa/Casablanca",             city:"Casablanca",        country:"Morocco",           abbrs:["WET","WEST"],          altNames:["Morocco","Rabat","Marrakech","Fes"],                                                                                                    pop:60 },
  { iana:"Africa/Khartoum",               city:"Khartoum",          country:"Sudan",             abbrs:["CAT"],                 altNames:["Sudan"],                                                                                                                                pop:50 },
  { iana:"Africa/Accra",                  city:"Accra",             country:"Ghana",             abbrs:["GMT"],                 altNames:["Ghana","Kumasi"],                                                                                                                       pop:50 },
  { iana:"Africa/Kampala",                city:"Kampala",           country:"Uganda",            abbrs:["EAT"],                 altNames:["Uganda"],                                                                                                                               pop:50 },
  // ─ Middle East ─
  { iana:"Asia/Riyadh",                   city:"Riyadh",            country:"Saudi Arabia",      abbrs:["AST"],                 altNames:["Saudi Arabia","Jeddah","Mecca","Medina"],                                                                                               pop:75 },
  { iana:"Asia/Dubai",                    city:"Dubai",             country:"UAE",               abbrs:["GST"],                 altNames:["United Arab Emirates","Abu Dhabi","Sharjah","Gulf Standard Time"],                                                                      pop:80 },
  { iana:"Asia/Tehran",                   city:"Tehran",            country:"Iran",              abbrs:["IRST","IRDT"],         altNames:["Iran"],                                                                                                                                 pop:65 },
  { iana:"Asia/Jerusalem",                city:"Tel Aviv",          country:"Israel",            abbrs:["IST","IDT"],           altNames:["Jerusalem","Haifa","Israel"],                                                                                                           pop:55 },
  { iana:"Asia/Baghdad",                  city:"Baghdad",           country:"Iraq",              abbrs:["AST"],                 altNames:["Iraq"],                                                                                                                                 pop:60 },
  { iana:"Asia/Kuwait",                   city:"Kuwait City",       country:"Kuwait",            abbrs:["AST"],                 altNames:["Kuwait"],                                                                                                                               pop:55 },
  { iana:"Asia/Qatar",                    city:"Doha",              country:"Qatar",             abbrs:["AST"],                 altNames:["Qatar"],                                                                                                                                pop:60 },
  { iana:"Asia/Muscat",                   city:"Muscat",            country:"Oman",              abbrs:["GST"],                 altNames:["Oman"],                                                                                                                                 pop:50 },
  { iana:"Asia/Beirut",                   city:"Beirut",            country:"Lebanon",           abbrs:["EET","EEST"],          altNames:["Lebanon"],                                                                                                                              pop:50 },
  { iana:"Asia/Amman",                    city:"Amman",             country:"Jordan",            abbrs:["EET","EEST"],          altNames:["Jordan"],                                                                                                                               pop:50 },
  { iana:"Asia/Damascus",                 city:"Damascus",          country:"Syria",             abbrs:["EET","EEST"],          altNames:["Syria"],                                                                                                                                pop:50 },
  // ─ Asia ─
  // IST: India pop=100 > Israel pop=55 > Colombo pop=50 > Ireland pop=45 → correct sort for "IST" search
  { iana:"Asia/Kolkata",                  city:"Mumbai",            country:"India",             abbrs:["IST"],                 altNames:["India","Delhi","New Delhi","Bangalore","Bengaluru","Chennai","Hyderabad","Pune","Kolkata","Ahmedabad","Calcutta","Bombay","Madras","Noida","Gurgaon","Kochi","Cochin","India Standard Time"],           pop:100 },
  { iana:"Asia/Karachi",                  city:"Karachi",           country:"Pakistan",          abbrs:["PKT"],                 altNames:["Pakistan","Lahore","Islamabad","Faisalabad","Rawalpindi","Multan"],                                                                      pop:75 },
  { iana:"Asia/Dhaka",                    city:"Dhaka",             country:"Bangladesh",        abbrs:["BST"],                 altNames:["Bangladesh","Chittagong"],                                                                                                              pop:70 },
  { iana:"Asia/Kathmandu",                city:"Kathmandu",         country:"Nepal",             abbrs:["NPT"],                 altNames:["Nepal","Nepal Time"],                                                                                                                   pop:55 },
  { iana:"Asia/Colombo",                  city:"Colombo",           country:"Sri Lanka",         abbrs:["IST"],                 altNames:["Sri Lanka","Ceylon"],                                                                                                                   pop:50 },
  { iana:"Asia/Kabul",                    city:"Kabul",             country:"Afghanistan",       abbrs:["AFT"],                 altNames:["Afghanistan"],                                                                                                                          pop:55 },
  { iana:"Asia/Tashkent",                 city:"Tashkent",          country:"Uzbekistan",        abbrs:["UZT"],                 altNames:["Uzbekistan","Samarkand"],                                                                                                               pop:50 },
  { iana:"Asia/Almaty",                   city:"Almaty",            country:"Kazakhstan",        abbrs:["ALMT"],                altNames:["Kazakhstan","Astana","Nur-Sultan"],                                                                                                     pop:55 },
  { iana:"Asia/Yerevan",                  city:"Yerevan",           country:"Armenia",           abbrs:["AMT","AMST"],          altNames:["Armenia"],                                                                                                                              pop:40 },
  { iana:"Asia/Tbilisi",                  city:"Tbilisi",           country:"Georgia",           abbrs:["GET"],                 altNames:["Georgia (country)"],                                                                                                                    pop:45 },
  { iana:"Asia/Baku",                     city:"Baku",              country:"Azerbaijan",        abbrs:["AZT","AZST"],          altNames:["Azerbaijan"],                                                                                                                           pop:50 },
  { iana:"Asia/Bishkek",                  city:"Bishkek",           country:"Kyrgyzstan",        abbrs:["KGT"],                 altNames:["Kyrgyzstan"],                                                                                                                           pop:40 },
  { iana:"Asia/Bangkok",                  city:"Bangkok",           country:"Thailand",          abbrs:["ICT"],                 altNames:["Thailand","Indochina Time"],                                                                                                            pop:75 },
  { iana:"Asia/Ho_Chi_Minh",              city:"Ho Chi Minh City",  country:"Vietnam",           abbrs:["ICT"],                 altNames:["Saigon","Hanoi","Vietnam","Da Nang","Ho Chi Minh"],                                                                                     pop:70 },
  { iana:"Asia/Phnom_Penh",               city:"Phnom Penh",        country:"Cambodia",          abbrs:["ICT"],                 altNames:["Cambodia","Siem Reap"],                                                                                                                 pop:50 },
  { iana:"Asia/Vientiane",                city:"Vientiane",         country:"Laos",              abbrs:["ICT"],                 altNames:["Laos"],                                                                                                                                 pop:40 },
  { iana:"Asia/Yangon",                   city:"Yangon",            country:"Myanmar",           abbrs:["MMT"],                 altNames:["Burma","Rangoon","Naypyidaw","Myanmar","Mandalay"],                                                                                      pop:55 },
  { iana:"Asia/Jakarta",                  city:"Jakarta",           country:"Indonesia",         abbrs:["WIB"],                 altNames:["Indonesia","West Indonesia","Surabaya","Bandung","Semarang","Medan","Palembang","Yogyakarta"],                                           pop:85 },
  { iana:"Asia/Makassar",                 city:"Makassar",          country:"Indonesia",         abbrs:["WITA"],                altNames:["Bali","Denpasar","Lombok","Central Indonesia"],                                                                                         pop:65 },
  { iana:"Asia/Jayapura",                 city:"Jayapura",          country:"Indonesia",         abbrs:["WIT"],                 altNames:["Papua","East Indonesia"],                                                                                                               pop:40 },
  { iana:"Asia/Singapore",                city:"Singapore",         country:"Singapore",         abbrs:["SGT"],                 altNames:[],                                                                                                                                       pop:85 },
  { iana:"Asia/Kuala_Lumpur",             city:"Kuala Lumpur",      country:"Malaysia",          abbrs:["MYT"],                 altNames:["Malaysia","Penang","Johor Bahru","KL"],                                                                                                 pop:75 },
  { iana:"Asia/Manila",                   city:"Manila",            country:"Philippines",       abbrs:["PHT"],                 altNames:["Philippines","Cebu","Davao","Quezon City"],                                                                                             pop:70 },
  { iana:"Asia/Shanghai",                 city:"Shanghai",          country:"China",             abbrs:["CST"],                 altNames:["China","Beijing","Guangzhou","Shenzhen","Chongqing","Tianjin","Peking","Wuhan","Chengdu","Xian","Harbin","Nanjing","Hangzhou"],           pop:90 },
  { iana:"Asia/Hong_Kong",                city:"Hong Kong",         country:"Hong Kong",         abbrs:["HKT"],                 altNames:[],                                                                                                                                       pop:80 },
  { iana:"Asia/Taipei",                   city:"Taipei",            country:"Taiwan",            abbrs:["CST"],                 altNames:["Taiwan"],                                                                                                                               pop:70 },
  { iana:"Asia/Tokyo",                    city:"Tokyo",             country:"Japan",             abbrs:["JST"],                 altNames:["Japan","Osaka","Kyoto","Yokohama","Nagoya","Sapporo","Fukuoka","Kobe"],                                                                  pop:90 },
  { iana:"Asia/Seoul",                    city:"Seoul",             country:"South Korea",       abbrs:["KST"],                 altNames:["Korea","South Korea","Busan","Incheon","Daegu","Gwangju"],                                                                               pop:85 },
  { iana:"Asia/Pyongyang",                city:"Pyongyang",         country:"North Korea",       abbrs:["KST"],                 altNames:["North Korea","DPRK"],                                                                                                                   pop:25 },
  { iana:"Asia/Ulaanbaatar",              city:"Ulaanbaatar",       country:"Mongolia",          abbrs:["ULAT"],                altNames:["Mongolia"],                                                                                                                             pop:40 },
  { iana:"Asia/Novosibirsk",              city:"Novosibirsk",       country:"Russia",            abbrs:["NOVT"],                altNames:["Siberia"],                                                                                                                              pop:45 },
  { iana:"Asia/Yekaterinburg",            city:"Yekaterinburg",     country:"Russia",            abbrs:["YEKT"],                altNames:["Ekaterinburg","Ural"],                                                                                                                  pop:45 },
  { iana:"Asia/Vladivostok",              city:"Vladivostok",       country:"Russia",            abbrs:["VLAT"],                altNames:["Russian Far East"],                                                                                                                     pop:40 },
  { iana:"Asia/Krasnoyarsk",              city:"Krasnoyarsk",       country:"Russia",            abbrs:["KRAT"],                altNames:[],                                                                                                                                       pop:40 },
  { iana:"Asia/Irkutsk",                  city:"Irkutsk",           country:"Russia",            abbrs:["IRKT"],                altNames:[],                                                                                                                                       pop:40 },
  // ─ Pacific / Oceania ─
  { iana:"Australia/Sydney",              city:"Sydney",            country:"Australia",         abbrs:["AEST","AEDT"],         altNames:["Canberra","New South Wales","NSW","Australia East"],                                                                                    pop:85 },
  { iana:"Australia/Melbourne",           city:"Melbourne",         country:"Australia",         abbrs:["AEST","AEDT"],         altNames:["Victoria"],                                                                                                                             pop:80 },
  { iana:"Australia/Brisbane",            city:"Brisbane",          country:"Australia",         abbrs:["AEST"],                altNames:["Queensland","Gold Coast"],                                                                                                              pop:70 },
  { iana:"Australia/Adelaide",            city:"Adelaide",          country:"Australia",         abbrs:["ACST","ACDT"],         altNames:["South Australia"],                                                                                                                      pop:60 },
  { iana:"Australia/Darwin",              city:"Darwin",            country:"Australia",         abbrs:["ACST"],                altNames:["Northern Territory"],                                                                                                                   pop:45 },
  { iana:"Australia/Perth",               city:"Perth",             country:"Australia",         abbrs:["AWST"],                altNames:["Western Australia"],                                                                                                                    pop:65 },
  { iana:"Pacific/Auckland",              city:"Auckland",          country:"New Zealand",       abbrs:["NZST","NZDT"],         altNames:["New Zealand","Wellington","Christchurch","NZ"],                                                                                         pop:70 },
  { iana:"Pacific/Fiji",                  city:"Suva",              country:"Fiji",              abbrs:["FJT","FJST"],          altNames:["Fiji"],                                                                                                                                 pop:40 },
  { iana:"Pacific/Port_Moresby",          city:"Port Moresby",      country:"Papua New Guinea",  abbrs:["PGT"],                 altNames:["Papua New Guinea","PNG"],                                                                                                               pop:40 },
];

// ── Popular zones shown by default (no query) ──────────────────────────────────

const POPULAR = new Set([
  "UTC",
  "America/New_York","America/Chicago","America/Los_Angeles","America/Sao_Paulo",
  "America/Mexico_City","America/Toronto","America/Vancouver","America/Argentina/Buenos_Aires",
  "Europe/London","Europe/Paris","Europe/Berlin","Europe/Moscow","Europe/Istanbul",
  "Africa/Cairo","Africa/Lagos","Africa/Nairobi","Africa/Johannesburg",
  "Asia/Riyadh","Asia/Dubai","Asia/Tehran","Asia/Karachi","Asia/Kolkata",
  "Asia/Dhaka","Asia/Bangkok","Asia/Ho_Chi_Minh","Asia/Jakarta","Asia/Makassar",
  "Asia/Singapore","Asia/Kuala_Lumpur","Asia/Manila","Asia/Shanghai",
  "Asia/Hong_Kong","Asia/Tokyo","Asia/Seoul",
  "Australia/Sydney","Australia/Perth","Pacific/Auckland",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseOffsetStr(s: string): number {
  const m = s.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  return (m[1] === "+" ? 1 : -1) * (parseInt(m[2]) * 60 + parseInt(m[3] ?? "0"));
}

function computeEntry(place: TZPlace, now: Date): TZEntry {
  let intlAbbr = "";
  let utcOffset = "UTC+0";
  let offsetMins = 0;
  try {
    intlAbbr = new Intl.DateTimeFormat("en-US", { timeZone: place.iana, timeZoneName: "short" })
      .formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
    const raw = new Intl.DateTimeFormat("en-US", { timeZone: place.iana, timeZoneName: "shortOffset" })
      .formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
    utcOffset = raw.replace("GMT", "UTC");
    offsetMins = parseOffsetStr(raw);
  } catch { /* ignore unsupported zones */ }
  // Use Intl abbr only if it's a proper code (not "GMT+5:30" offset string)
  const abbr = (!intlAbbr || intlAbbr.startsWith("GMT") || intlAbbr.startsWith("UTC") || intlAbbr === place.iana)
    ? (place.abbrs[0] ?? "UTC")
    : intlAbbr;
  return { ...place, abbr, utcOffset, offsetMins };
}

function buildIndex(now: Date): TZEntry[] {
  return DB.map((p) => computeEntry(p, now));
}

/** True if altName looks like a city (not an abbreviation like "IST India" or "ET") */
function isCityName(s: string): boolean {
  return s.length > 3 && s !== s.toUpperCase() && !/^(UTC|GMT)[+-]/.test(s);
}

/**
 * Core search — three modes:
 *  1. Exact abbreviation (e.g. "IST") → all matching zones sorted by pop desc.
 *     India(100) before Israel(55) before Colombo(50) before Ireland(45).
 *  2. No query → popular zones in DB order.
 *  3. Text search → score-ranked, with city alias display when altName matched.
 */
function searchTZ(query: string, index: TZEntry[]): TZEntry[] {
  const q = query.trim();

  if (!q) {
    return index.filter((e) => POPULAR.has(e.iana));
  }

  const uq = q.toUpperCase();
  const lq = q.toLowerCase();

  // ── Mode 1: exact abbreviation ─────────────────────────────────────────────
  const abbrMatches = index.filter((e) => e.abbrs.includes(uq));
  if (abbrMatches.length > 0) {
    return [...abbrMatches].sort((a, b) => b.pop - a.pop);
  }

  // ── Mode 2: scored text search ────────────────────────────────────────────
  type Scored = { entry: TZEntry; score: number };
  const results: Scored[] = [];

  for (const entry of index) {
    const cityLow = entry.city.toLowerCase();
    const countryLow = entry.country.toLowerCase();

    // City name
    if (cityLow.startsWith(lq))  { results.push({ entry, score: 700 }); continue; }
    if (cityLow.includes(lq))    { results.push({ entry, score: 500 }); continue; }

    // Alt names — when a city-like alt name matches, substitute it as displayCity
    let bestScore = 0;
    let bestAlt = "";
    for (const alt of entry.altNames) {
      const al = alt.toLowerCase();
      const city = isCityName(alt);
      if (al.startsWith(lq))     { if (400 > bestScore) { bestScore = 400; bestAlt = city ? alt : ""; } }
      else if (al.includes(lq))  { if (300 > bestScore) { bestScore = 300; bestAlt = city ? alt : ""; } }
    }
    if (bestScore > 0) {
      const e: TZEntry = bestAlt ? { ...entry, displayCity: bestAlt } : entry;
      results.push({ entry: e, score: bestScore });
      continue;
    }

    // Country
    if (countryLow.startsWith(lq)) { results.push({ entry, score: 200 }); continue; }
    if (countryLow.includes(lq))   { results.push({ entry, score: 150 }); continue; }

    // Partial abbreviation (startsWith to avoid "ist" hitting WITA/EEST/etc)
    if (entry.abbrs.some((a) => a.toLowerCase().startsWith(lq))) {
      results.push({ entry, score: 100 }); continue;
    }

    // UTC offset string  ("utc+5", "+5:30", "5.5")
    if (entry.utcOffset.toLowerCase().includes(lq)) {
      results.push({ entry, score: 50 });
    }
  }

  return results
    .sort((a, b) => b.score - a.score || b.entry.pop - a.entry.pop)
    .map((r) => r.entry)
    .slice(0, 40);
}

function parseOffsetMinsForDate(iana: string, dateStr: string): number {
  const ref = new Date(dateStr + "T12:00:00Z");
  const raw = new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "shortOffset" })
    .formatToParts(ref).find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  return parseOffsetStr(raw);
}

function buildRefDate(iana: string, dateStr: string, totalMins: number): Date {
  const offsetMins = parseOffsetMinsForDate(iana, dateStr);
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, Math.floor(totalMins / 60), totalMins % 60) - offsetMins * 60000);
}

function getLiveMeta(iana: string, now: Date, abbrs0: string) {
  const intlAbbr = new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "short" })
    .formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
  const raw = new Intl.DateTimeFormat("en-US", { timeZone: iana, timeZoneName: "shortOffset" })
    .formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
  const abbr = (!intlAbbr || intlAbbr.startsWith("GMT") || intlAbbr.startsWith("UTC"))
    ? abbrs0 : intlAbbr;
  return { abbr, utcOffset: raw.replace("GMT", "UTC") };
}

function fmtTime(iana: string, date: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: iana, hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}
function fmtDate(iana: string, date: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: iana, weekday: "short", month: "short", day: "numeric" }).format(date);
}
function getISODate(iana: string, date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: iana, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
function nowStrings() {
  const n = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return { dateStr: `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`, timeStr: `${pad(n.getHours())}:${pad(n.getMinutes())}` };
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

  const results = useMemo(() => searchTZ(query, index), [query, index]);
  const selMeta = useMemo(
    () => selected ? getLiveMeta(selected.iana, now, selected.abbrs[0]) : null,
    [selected, now],
  );
  const displaySelected = selected ? (selected.displayCity ?? selected.city) : null;

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
        {selected && displaySelected ? (
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex items-baseline gap-1.5">
              <span className="font-mono text-sm font-semibold text-foreground">{displaySelected}</span>
              <span className="font-mono text-[10px] text-foreground-muted truncate">{selected.country}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 tracking-wider">
                {selMeta?.abbr ?? selected.abbr}
              </span>
              <span className="font-mono text-[10px] text-foreground-muted">{selMeta?.utcOffset ?? selected.utcOffset}</span>
            </div>
          </div>
        ) : (
          <span className="font-mono text-sm text-foreground-muted/40 select-none">
            Search city, country, or abbreviation…
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-px border border-border bg-surface shadow-2xl">
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="IST · WIB · JST · Delhi · Jakarta · India · UTC+5:30…"
              className="w-full bg-surface-muted border border-border px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-primary/40 text-foreground placeholder:text-foreground-muted/35"
            />
          </div>
          <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-foreground-muted/40 border-b border-border bg-surface-muted">
            {!query ? `Popular · ${index.length} zones available` : `${results.length} result${results.length !== 1 ? "s" : ""}`}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
            {results.length === 0 ? (
              <div className="px-3 py-6 font-mono text-xs text-foreground-muted/50 text-center">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              results.map((tz) => {
                const isSelected = selected?.iana === tz.iana;
                const displayName = tz.displayCity ?? tz.city;
                const liveTime = fmtTime(tz.iana, now);
                return (
                  <button
                    key={tz.iana}
                    onClick={() => { onSelect(tz); setOpen(false); setQuery(""); }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 flex items-center gap-3 border-b border-border/20 last:border-0 transition-colors",
                      isSelected ? "bg-primary/8" : "hover:bg-surface-muted",
                    )}
                  >
                    {/* Left: city + country */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className={cn("font-mono text-sm font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                          {displayName}
                        </span>
                        <span className="font-mono text-[10px] text-foreground-muted">{tz.country}</span>
                      </div>
                    </div>
                    {/* Right: live time · abbr · offset */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] text-foreground-muted tabular-nums">{liveTime}</span>
                      <span className={cn(
                        "font-mono text-[9px] font-semibold px-1.5 py-0.5 tracking-wider min-w-[28px] text-center",
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
    const off = parseOffsetMinsForDate(fromTZ.iana, dateStr);
    const [y, mo, d] = dateStr.split("-").map(Number);
    return Array.from({ length: 24 }, (_, h) => new Date(Date.UTC(y, mo - 1, d, h, 0) - off * 60000));
  }, [fromTZ.iana, dateStr]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: Math.max(0, selectedHour * CELL_W - el.clientWidth / 2 + CELL_W / 2), behavior: "smooth" });
  }, [selectedHour]);

  const fromMeta = useMemo(() => getLiveMeta(fromTZ.iana, now, fromTZ.abbrs[0]), [fromTZ.iana, now, fromTZ.abbrs]);
  const toMeta   = useMemo(() => getLiveMeta(toTZ.iana, now, toTZ.abbrs[0]),     [toTZ.iana, now, toTZ.abbrs]);

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
        <div className={cn("w-full text-center font-mono text-[7px] uppercase tracking-wide leading-none pt-1.5 pb-0.5 px-0.5 truncate", isNewDay ? "text-foreground-muted/50" : "text-transparent")}>
          {dateLabel ?? "·"}
        </div>
        <div className={cn("font-mono text-sm font-bold tabular-nums leading-tight", isSelected ? "text-primary" : "text-foreground")}>{hour}</div>
        <div className={cn("font-mono text-[9px] leading-none pb-2", isSelected ? "text-primary/70" : "text-foreground-muted/60")}>{period}</div>
      </div>
    );
  }

  return (
    <div className="border border-border flex overflow-hidden">
      {/* Label column — use role key, NOT tz.iana (avoids duplicate key when both zones are the same) */}
      <div className="shrink-0 border-r border-border bg-surface z-10" style={{ width: LABEL_W }}>
        {([
          { tz: fromTZ, meta: fromMeta, role: "from" as const },
          { tz: toTZ,   meta: toMeta,   role: "to"   as const },
        ]).map(({ tz, meta, role }) => (
          <div key={role} className={cn("flex flex-col justify-center px-3 py-2 h-[76px]", role === "from" && "border-b border-border")}>
            <div className="font-mono text-[11px] font-semibold text-foreground truncate">{tz.displayCity ?? tz.city}</div>
            <div className="font-mono text-[9px] text-foreground-muted/50 truncate">{tz.country}</div>
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
          {utcTimes.map((d, h) => cell(d, h, fromTZ.iana, "from", h > 0 ? getISODate(fromTZ.iana, utcTimes[h - 1]) : dateStr))}
          {utcTimes.map((d, h) => cell(d, h, toTZ.iana, "to", h > 0 ? getISODate(toTZ.iana, utcTimes[h - 1]) : getISODate(toTZ.iana, utcTimes[0])))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TimezoneConverter() {
  const [tz1, setTz1] = useState<TZEntry | null>(null);
  const [tz2, setTz2] = useState<TZEntry | null>(null);
  const { dateStr: d0, timeStr: t0 } = nowStrings();
  const [dateStr, setDateStr] = useState(d0);
  const [timeStr, setTimeStr] = useState(t0);
  const [now, setNow] = useState(() => new Date());
  const [tzIndex] = useState(() => buildIndex(new Date()));

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

  const tz1Meta = useMemo(() => tz1 ? getLiveMeta(tz1.iana, now, tz1.abbrs[0]) : null, [tz1, now]);
  const tz2Meta = useMemo(() => tz2 ? getLiveMeta(tz2.iana, now, tz2.abbrs[0]) : null, [tz2, now]);

  return (
    <div className="space-y-4">

      {/* ── UTC bar ── */}
      <div className="border border-border px-4 py-3 flex items-center justify-between gap-4 bg-surface-muted">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground-muted/50">Current UTC</span>
          <span className="font-mono text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 tracking-wider">UTC+0</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xl font-bold tabular-nums text-foreground leading-none">{fmtTime("UTC", now)}</span>
          <span className="font-mono text-[11px] text-foreground-muted">{fmtDate("UTC", now)}</span>
        </div>
      </div>

      {/* ── Pickers ── */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <TZPicker selected={tz1} onSelect={setTz1} label="Timezone 1" index={tzIndex} now={now} />
        <button onClick={() => { setTz1(tz2); setTz2(tz1); }} title="Swap" className={cn(secondaryBtnCls, "px-3 py-2.5 mt-5 shrink-0")}>⇌</button>
        <TZPicker selected={tz2} onSelect={setTz2} label="Timezone 2" index={tzIndex} now={now} />
      </div>

      {/* ── Current time info ── */}
      {(tz1 || tz2) && (
        <div className="grid grid-cols-2 gap-3">
          {([
            { tz: tz1, meta: tz1Meta, role: "tz1" },
            { tz: tz2, meta: tz2Meta, role: "tz2" },
          ] as const).map(({ tz, meta, role }) => (
            <div key={role} className="border border-border bg-surface-muted px-2.5 py-1.5 flex items-center gap-2 flex-wrap font-mono text-[11px]">
              {tz ? (
                <>
                  <span className="text-foreground-muted/60 truncate max-w-[100px]">{tz.displayCity ?? tz.city}</span>
                  <span className="text-foreground-muted/30">·</span>
                  <span className="font-semibold tabular-nums text-foreground">{fmtTime(tz.iana, now)}</span>
                  <span className="text-foreground-muted/50 tabular-nums">{fmtDate(tz.iana, now)}</span>
                  <span className="bg-primary/10 text-primary px-1 py-px text-[9px] font-semibold tracking-wider">{meta?.abbr ?? tz.abbr}</span>
                  <span className="text-foreground-muted/50 tabular-nums">{meta?.utcOffset ?? tz.utcOffset}</span>
                </>
              ) : (
                <span className="text-foreground-muted/25">Select a timezone</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Time input + conversion ── */}
      {tz1 && tz2 && (
        <div className="border border-border grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="p-3 space-y-2">
            <div className={labelCls}>Set time · {tz1.displayCity ?? tz1.city}</div>
            <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={inputCls} />
            <div className="flex gap-2">
              <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className={cn(inputCls, "flex-1")} />
              <button
                onClick={() => { const { dateStr: d, timeStr: t } = nowStrings(); setDateStr(d); setTimeStr(t); }}
                className={cn(secondaryBtnCls, "py-2.5 shrink-0")}
              >
                Now
              </button>
            </div>
          </div>
          <div className="p-3 flex flex-col justify-center gap-1">
            <div className={labelCls}>Result · {tz2.displayCity ?? tz2.city}</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-mono text-2xl font-bold tabular-nums text-foreground leading-none">{converted?.time}</span>
              {converted && converted.dayDiff !== 0 && (
                <span className={cn("font-mono text-[10px] px-1.5 py-0.5",
                  converted.dayDiff > 0 ? "bg-primary/10 text-primary" : "bg-foreground-muted/10 text-foreground-muted")}>
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
