// No "use client" — safe to import in server components

export interface UnitDef {
  label: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

export interface UnitConfig {
  name: string;
  units: UnitDef[];
  defaultSymbol: string;
}

function lin(label: string, symbol: string, factor: number): UnitDef {
  return {
    label,
    symbol,
    toBase: (v) => v * factor,
    fromBase: (v) => v / factor,
  };
}

// ── Length ─────────────────────────────────────────────────────────────────────

const LENGTH: UnitConfig = {
  name: "Length",
  defaultSymbol: "m",
  units: [
    lin("Picometer",          "pm",   1e-12),
    lin("Nanometer",          "nm",   1e-9),
    lin("Micrometer",         "μm",   1e-6),
    lin("Millimeter",         "mm",   0.001),
    lin("Centimeter",         "cm",   0.01),
    lin("Decimeter",          "dm",   0.1),
    lin("Meter",              "m",    1),
    lin("Kilometer",          "km",   1000),
    lin("Inch",               "in",   0.0254),
    lin("Foot",               "ft",   0.3048),
    lin("Yard",               "yd",   0.9144),
    lin("Mile",               "mi",   1609.344),
    lin("Nautical Mile",      "nmi",  1852),
    lin("League",             "lea",  4828.032),
    lin("Light-year",         "ly",   9.4607304725808e15),
    lin("Astronomical Unit",  "AU",   1.495978707e11),
    lin("Parsec",             "pc",   3.085677581e16),
  ],
};

// ── Weight / Mass ──────────────────────────────────────────────────────────────

const WEIGHT: UnitConfig = {
  name: "Weight / Mass",
  defaultSymbol: "kg",
  units: [
    lin("Microgram",          "μg",  1e-9),
    lin("Milligram",          "mg",  1e-6),
    lin("Gram",               "g",   0.001),
    lin("Kilogram",           "kg",  1),
    lin("Metric Ton",         "t",   1000),
    lin("Ounce",              "oz",  0.028349523125),
    lin("Pound",              "lb",  0.45359237),
    lin("Stone",              "st",  6.35029318),
    lin("Short Ton",          "ton", 907.18474),
    lin("Long Ton",           "LT",  1016.0469088),
    lin("Carat",              "ct",  0.0002),
    lin("Atomic Mass Unit",   "u",   1.66053906660e-27),
  ],
};

// ── Temperature ────────────────────────────────────────────────────────────────

const TEMPERATURE: UnitConfig = {
  name: "Temperature",
  defaultSymbol: "°C",
  units: [
    { label: "Celsius",    symbol: "°C",  toBase: (v) => v,                          fromBase: (v) => v },
    { label: "Fahrenheit", symbol: "°F",  toBase: (v) => (v - 32) * 5 / 9,          fromBase: (v) => v * 9 / 5 + 32 },
    { label: "Kelvin",     symbol: "K",   toBase: (v) => v - 273.15,                 fromBase: (v) => v + 273.15 },
    { label: "Rankine",    symbol: "°R",  toBase: (v) => (v - 491.67) * 5 / 9,      fromBase: (v) => (v + 273.15) * 9 / 5 },
    { label: "Delisle",    symbol: "°De", toBase: (v) => 100 - v * 2 / 3,           fromBase: (v) => (100 - v) * 3 / 2 },
    { label: "Newton",     symbol: "°N",  toBase: (v) => v * 100 / 33,              fromBase: (v) => v * 33 / 100 },
    { label: "Réaumur",    symbol: "°Ré", toBase: (v) => v * 5 / 4,                 fromBase: (v) => v * 4 / 5 },
    { label: "Rømer",      symbol: "°Rø", toBase: (v) => (v - 7.5) * 40 / 21,      fromBase: (v) => v * 21 / 40 + 7.5 },
  ],
};

// ── Speed ──────────────────────────────────────────────────────────────────────

const SPEED: UnitConfig = {
  name: "Speed",
  defaultSymbol: "km/h",
  units: [
    lin("Meter / second",       "m/s",    1),
    lin("Kilometer / hour",     "km/h",   1 / 3.6),
    lin("Mile / hour",          "mph",    0.44704),
    lin("Knot",                 "kn",     0.514444),
    lin("Foot / second",        "ft/s",   0.3048),
    lin("Centimeter / second",  "cm/s",   0.01),
    lin("Mach (sea level)",     "mach",   340.29),
    lin("Speed of light",       "c",      299792458),
    lin("Furlong / fortnight",  "fur/fn", 0.000166309),
  ],
};

// ── Time ───────────────────────────────────────────────────────────────────────

const TIME: UnitConfig = {
  name: "Time",
  defaultSymbol: "s",
  units: [
    lin("Nanosecond",   "ns",  1e-9),
    lin("Microsecond",  "μs",  1e-6),
    lin("Millisecond",  "ms",  0.001),
    lin("Second",       "s",   1),
    lin("Minute",       "min", 60),
    lin("Hour",         "hr",  3600),
    lin("Day",          "day", 86400),
    lin("Week",         "wk",  604800),
    lin("Month (avg)",  "mo",  2629800),
    lin("Year (365d)",  "yr",  31536000),
    lin("Decade",       "dec", 315360000),
    lin("Century",      "cen", 3153600000),
    lin("Millennium",   "mil", 31536000000),
  ],
};

// ── Area ───────────────────────────────────────────────────────────────────────

const AREA: UnitConfig = {
  name: "Area",
  defaultSymbol: "m²",
  units: [
    lin("Square Millimeter", "mm²", 1e-6),
    lin("Square Centimeter", "cm²", 1e-4),
    lin("Square Meter",      "m²",  1),
    lin("Square Kilometer",  "km²", 1e6),
    lin("Square Inch",       "in²", 6.4516e-4),
    lin("Square Foot",       "ft²", 0.09290304),
    lin("Square Yard",       "yd²", 0.83612736),
    lin("Square Mile",       "mi²", 2589988.110336),
    lin("Acre",              "ac",  4046.8564224),
    lin("Hectare",           "ha",  10000),
    lin("Are",               "a",   100),
    lin("Square Rod",        "rd²", 25.29285264),
    lin("Township",          "twp", 93239571.972),
  ],
};

// ── Volume ─────────────────────────────────────────────────────────────────────

const VOLUME: UnitConfig = {
  name: "Volume",
  defaultSymbol: "L",
  units: [
    lin("Milliliter",       "mL",       0.001),
    lin("Centiliter",       "cL",       0.01),
    lin("Deciliter",        "dL",       0.1),
    lin("Liter",            "L",        1),
    lin("Cubic Centimeter", "cm³",      0.001),
    lin("Cubic Meter",      "m³",       1000),
    lin("Cubic Inch",       "in³",      0.016387064),
    lin("Cubic Foot",       "ft³",      28.316846592),
    lin("Cubic Yard",       "yd³",      764.554857984),
    lin("Teaspoon (US)",    "tsp",      0.00492892),
    lin("Tablespoon (US)",  "tbsp",     0.01478677),
    lin("Fluid oz (US)",    "fl oz",    0.02957353),
    lin("Cup (US)",         "cup",      0.236588),
    lin("Pint (US)",        "pt",       0.473176),
    lin("Quart (US)",       "qt",       0.946353),
    lin("Gallon (US)",      "gal",      3.785412),
    lin("Fluid oz (UK)",    "fl oz UK", 0.0284131),
    lin("Pint (UK)",        "pt UK",    0.568261),
    lin("Gallon (UK)",      "gal UK",   4.54609),
  ],
};

// ── Pressure ───────────────────────────────────────────────────────────────────

const PRESSURE: UnitConfig = {
  name: "Pressure",
  defaultSymbol: "Pa",
  units: [
    lin("Pascal",             "Pa",    1),
    lin("Hectopascal",        "hPa",   100),
    lin("Kilopascal",         "kPa",   1000),
    lin("Megapascal",         "MPa",   1e6),
    lin("Gigapascal",         "GPa",   1e9),
    lin("Bar",                "bar",   100000),
    lin("Millibar",           "mbar",  100),
    lin("PSI",                "psi",   6894.757293),
    lin("Atmosphere (std)",   "atm",   101325),
    lin("Technical Atm",      "at",    98066.5),
    lin("Torr / mmHg",        "mmHg",  133.3224),
    lin("Inch of Mercury",    "inHg",  3386.389),
    lin("Inch of Water",      "inH₂O", 249.0889),
    lin("cm of Water",        "cmH₂O", 98.0665),
  ],
};

// ── Energy ─────────────────────────────────────────────────────────────────────

const ENERGY: UnitConfig = {
  name: "Energy",
  defaultSymbol: "J",
  units: [
    lin("Joule",              "J",      1),
    lin("Kilojoule",          "kJ",     1000),
    lin("Megajoule",          "MJ",     1e6),
    lin("Gigajoule",          "GJ",     1e9),
    lin("Calorie (small)",    "cal",    4.184),
    lin("Kilocalorie",        "kcal",   4184),
    lin("Watt-hour",          "Wh",     3600),
    lin("Kilowatt-hour",      "kWh",    3600000),
    lin("Megawatt-hour",      "MWh",    3.6e9),
    lin("BTU",                "BTU",    1055.05585),
    lin("Therm (US)",         "thm",    105480400),
    lin("Foot-pound",         "ft·lb",  1.3558179),
    lin("Inch-pound",         "in·lb",  0.112985),
    lin("Erg",                "erg",    1e-7),
    lin("Electronvolt",       "eV",     1.602176634e-19),
  ],
};

// ── Data Storage ───────────────────────────────────────────────────────────────

const DATA: UnitConfig = {
  name: "Data Storage",
  defaultSymbol: "MB",
  units: [
    lin("Bit",       "b",    1),
    lin("Nibble",    "nib",  4),
    lin("Byte",      "B",    8),
    lin("Kilobit",   "kb",   1000),
    lin("Kibibit",   "Kib",  1024),
    lin("Kilobyte",  "KB",   8000),
    lin("Kibibyte",  "KiB",  8192),
    lin("Megabit",   "Mb",   1e6),
    lin("Mebibit",   "Mib",  1048576),
    lin("Megabyte",  "MB",   8e6),
    lin("Mebibyte",  "MiB",  8388608),
    lin("Gigabit",   "Gb",   1e9),
    lin("Gibibit",   "Gib",  1073741824),
    lin("Gigabyte",  "GB",   8e9),
    lin("Gibibyte",  "GiB",  8589934592),
    lin("Terabit",   "Tb",   1e12),
    lin("Terabyte",  "TB",   8e12),
    lin("Tebibyte",  "TiB",  8796093022208),
    lin("Petabyte",  "PB",   8e15),
    lin("Exabyte",   "EB",   8e18),
  ],
};

// ── Angle ──────────────────────────────────────────────────────────────────────

const ANGLE: UnitConfig = {
  name: "Angle",
  defaultSymbol: "°",
  units: [
    lin("Degree",      "°",    1),
    lin("Radian",      "rad",  180 / Math.PI),
    lin("Gradian",     "grad", 0.9),
    lin("Milliradian", "mrad", 0.18 / Math.PI),
    lin("Arcminute",   "′",    1 / 60),
    lin("Arcsecond",   "″",    1 / 3600),
    lin("Turn",        "turn", 360),
    lin("Quadrant",    "quad", 90),
    lin("Sextant",     "sxt",  60),
  ],
};

// ── Force ──────────────────────────────────────────────────────────────────────

const FORCE: UnitConfig = {
  name: "Force",
  defaultSymbol: "N",
  units: [
    lin("Newton",           "N",    1),
    lin("Kilonewton",       "kN",   1000),
    lin("Meganewton",       "MN",   1e6),
    lin("Dyne",             "dyn",  1e-5),
    lin("Pound-force",      "lbf",  4.4482216152605),
    lin("Ounce-force",      "ozf",  0.2780138509537),
    lin("Kip",              "kip",  4448.2216152605),
    lin("Ton-force (US)",   "tonf", 8896.4432305210),
    lin("Kilogram-force",   "kgf",  9.80665),
    lin("Gram-force",       "gf",   0.00980665),
  ],
};

// ── Power ──────────────────────────────────────────────────────────────────────

const POWER: UnitConfig = {
  name: "Power",
  defaultSymbol: "W",
  units: [
    lin("Milliwatt",               "mW",      0.001),
    lin("Watt",                    "W",       1),
    lin("Kilowatt",                "kW",      1000),
    lin("Megawatt",                "MW",      1e6),
    lin("Gigawatt",                "GW",      1e9),
    lin("Horsepower (mech)",       "hp",      745.69987158227),
    lin("Horsepower (metric)",     "PS",      735.49875),
    lin("BTU / hour",              "BTU/h",   0.29307107),
    lin("Calorie / second",        "cal/s",   4.184),
    lin("Foot-pound / second",     "ft·lb/s", 1.3558179),
    lin("Erg / second",            "erg/s",   1e-7),
  ],
};

// ── Fuel Economy ───────────────────────────────────────────────────────────────

const FUEL: UnitConfig = {
  name: "Fuel Economy",
  defaultSymbol: "L/100km",
  units: [
    {
      label: "L / 100 km",            symbol: "L/100km",
      toBase: (v) => v === 0 ? Infinity : 100 / v,
      fromBase: (v) => v === 0 ? Infinity : 100 / v,
    },
    lin("km / liter",                  "km/L",   1),
    {
      label: "Miles per gallon (US)",  symbol: "mpg",
      toBase: (v) => v * 1.609344 / 3.785412,
      fromBase: (v) => v * 3.785412 / 1.609344,
    },
    {
      label: "Miles per gallon (UK)",  symbol: "mpg UK",
      toBase: (v) => v * 1.609344 / 4.54609,
      fromBase: (v) => v * 4.54609 / 1.609344,
    },
    {
      label: "Miles per liter",        symbol: "mi/L",
      toBase: (v) => v * 1.609344,
      fromBase: (v) => v / 1.609344,
    },
  ],
};

// ── Registry ───────────────────────────────────────────────────────────────────

export const UNIT_CONFIGS: Record<string, UnitConfig> = {
  "length-converter":       LENGTH,
  "weight-converter":       WEIGHT,
  "temperature-converter":  TEMPERATURE,
  "speed-converter":        SPEED,
  "time-converter":         TIME,
  "area-converter":         AREA,
  "volume-converter":       VOLUME,
  "pressure-converter":     PRESSURE,
  "energy-converter":       ENERGY,
  "data-converter":         DATA,
  "angle-converter":        ANGLE,
  "force-converter":        FORCE,
  "power-converter":        POWER,
  "fuel-economy-converter": FUEL,
};
