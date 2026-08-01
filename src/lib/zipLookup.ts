// ── ZIP Code Lookup ───────────────────────────────────────────────────────────
// Uses the free Zippopotam.us API (no key required, CORS-enabled).

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Area codes by US state ────────────────────────────────────────────────────
const US_AREA_CODES: Record<string, string[]> = {
  AL: ["205","251","256","334"], AK: ["907"], AZ: ["480","520","602","623","928"],
  AR: ["479","501","870"], CA: ["213","310","323","415","424","510","619","626","650","714","760","805","818","858","909","916","949"],
  CO: ["303","719","720","970"], CT: ["203","860"], DE: ["302"],
  FL: ["239","305","321","352","407","561","727","772","786","813","850","863","904","941","954"],
  GA: ["229","404","470","478","678","706","770","912"], HI: ["808"],
  ID: ["208"], IL: ["217","312","331","618","630","708","773","815","847"],
  IN: ["260","317","574","765","812"], IA: ["319","515","563","712"],
  KS: ["316","620","785","913"], KY: ["270","502","606","859"],
  LA: ["225","318","337","504","985"], ME: ["207"],
  MD: ["240","301","410","443"], MA: ["339","413","508","617","781","978"],
  MI: ["231","248","313","517","616","734","810","906","989"],
  MN: ["218","320","507","612","651","763","952"], MS: ["228","601","662"],
  MO: ["314","417","573","636","816"], MT: ["406"], NE: ["308","402"],
  NV: ["702","725","775"], NH: ["603"], NJ: ["201","609","732","856","862","908","973"],
  NM: ["505","575"], NY: ["212","315","332","347","516","518","585","607","631","646","716","718","845","914","917","929"],
  NC: ["252","336","704","828","910","919","980"], ND: ["701"],
  OH: ["216","234","330","419","440","513","567","614","740","937"],
  OK: ["405","539","580","918"], OR: ["503","541","971"],
  PA: ["215","267","412","484","570","610","717","724","814"],
  RI: ["401"], SC: ["803","843","864"], SD: ["605"],
  TN: ["423","615","731","865","901","931"], TX: ["210","214","281","346","361","409","469","512","682","713","737","806","817","832","903","915","936","956","972"],
  UT: ["385","435","801"], VT: ["802"], VA: ["276","434","540","571","703","757","804"],
  WA: ["206","253","360","425","509"], WV: ["304","681"],
  WI: ["262","414","608","715","920"], WY: ["307"], DC: ["202"],
  PR: ["787","939"], GU: ["671"], VI: ["340"],
};

// ── UK STD codes (without leading 0), keyed by postcode area ─────────────────
// Length 2 → 8-digit local; Length 3 → 7-digit local; Length 4 → 6-digit local; Length 5 → 5-digit local
const UK_STD: Record<string, string> = {
  // London area (020)
  E:"20", EC:"20", N:"20", NW:"20", SE:"20", SW:"20", W:"20", WC:"20",
  BR:"20", CR:"20", EN:"20", HA:"20", IG:"20", KT:"20", SM:"20", TW:"20", UB:"20",
  // England major cities
  B:"121", DY:"121", WS:"121", WV:"902",
  M:"161", WN:"1942", SK:"161", OL:"161",
  L:"151", CH:"1244",
  LS:"113", BD:"1274", HD:"1484", HX:"1422", WF:"1924",
  S:"114", DN:"1302", NG:"115",
  BS:"117", BA:"1225",
  NE:"191", SR:"191", DH:"191", DL:"1325",
  CV:"24", LE:"116", NN:"1604",
  SO:"23", PO:"23",
  BN:"1273", TN:"1892", CT:"1227", ME:"1622", DA:"1322",
  OX:"1865", RG:"118", GU:"1483", SL:"1753", RH:"1737",
  CB:"1223", PE:"1733", IP:"1473", NR:"1603",
  AL:"1727", HP:"1442", SG:"1438", LU:"1582", WD:"1923", RM:"1708",
  MK:"1908", CM:"1245", CO:"1206", SS:"1702",
  EX:"1392", PL:"1752", TQ:"1803", TR:"1872",
  BH:"1202", DT:"1305", SP:"1722", SN:"1793", TA:"1823",
  GL:"1452", WR:"1905", HR:"1432",
  ST:"1782", DE:"1332", SY:"1743", TF:"1952",
  LN:"1522", YO:"1904", HU:"1482", HG:"1423",
  TS:"1642", CA:"1228", LA:"1524", PR:"1772", BB:"1254", FY:"1253",
  BL:"1204", WA:"1925",
  // Wales
  CF:"29", NP:"1633", SA:"1792", LD:"1597", LL:"1492",
  // Scotland
  EH:"131", G:"141", ML:"1698", PA:"141",
  AB:"1224", DD:"1382", KY:"1592", KA:"1563", FK:"1324", PH:"1738",
  IV:"1463", DG:"1387", TD:"1896",
  KW:"1856", ZE:"1595", HS:"1851",
};

// ── UK postcode area → county / region ───────────────────────────────────────
interface UKAreaInfo { county: string; region: string; city: string }
const UK_AREA_INFO: Record<string, UKAreaInfo> = {
  AB: { city:"Aberdeen",              county:"Aberdeenshire",          region:"Scotland" },
  AL: { city:"St Albans",             county:"Hertfordshire",           region:"England"  },
  B:  { city:"Birmingham",            county:"West Midlands",           region:"England"  },
  BA: { city:"Bath",                  county:"Somerset",                region:"England"  },
  BB: { city:"Blackburn",             county:"Lancashire",              region:"England"  },
  BD: { city:"Bradford",              county:"West Yorkshire",          region:"England"  },
  BH: { city:"Bournemouth",           county:"Dorset",                  region:"England"  },
  BL: { city:"Bolton",                county:"Greater Manchester",      region:"England"  },
  BN: { city:"Brighton",              county:"East Sussex",             region:"England"  },
  BR: { city:"Bromley",               county:"Greater London",          region:"England"  },
  BS: { city:"Bristol",               county:"Bristol",                 region:"England"  },
  BT: { city:"Belfast",               county:"County Antrim",           region:"Northern Ireland" },
  CA: { city:"Carlisle",              county:"Cumbria",                 region:"England"  },
  CB: { city:"Cambridge",             county:"Cambridgeshire",          region:"England"  },
  CF: { city:"Cardiff",               county:"Cardiff",                 region:"Wales"    },
  CH: { city:"Chester",               county:"Cheshire",                region:"England"  },
  CM: { city:"Chelmsford",            county:"Essex",                   region:"England"  },
  CO: { city:"Colchester",            county:"Essex",                   region:"England"  },
  CR: { city:"Croydon",               county:"Greater London",          region:"England"  },
  CT: { city:"Canterbury",            county:"Kent",                    region:"England"  },
  CV: { city:"Coventry",              county:"West Midlands",           region:"England"  },
  CW: { city:"Crewe",                 county:"Cheshire",                region:"England"  },
  DA: { city:"Dartford",              county:"Kent",                    region:"England"  },
  DD: { city:"Dundee",                county:"Dundee City",             region:"Scotland" },
  DE: { city:"Derby",                 county:"Derbyshire",              region:"England"  },
  DG: { city:"Dumfries",              county:"Dumfries and Galloway",   region:"Scotland" },
  DH: { city:"Durham",                county:"County Durham",           region:"England"  },
  DL: { city:"Darlington",            county:"County Durham",           region:"England"  },
  DN: { city:"Doncaster",             county:"South Yorkshire",         region:"England"  },
  DT: { city:"Dorchester",            county:"Dorset",                  region:"England"  },
  DY: { city:"Dudley",                county:"West Midlands",           region:"England"  },
  E:  { city:"London",                county:"Greater London",          region:"England"  },
  EC: { city:"London",                county:"Greater London",          region:"England"  },
  EH: { city:"Edinburgh",             county:"City of Edinburgh",       region:"Scotland" },
  EN: { city:"Enfield",               county:"Greater London",          region:"England"  },
  EX: { city:"Exeter",                county:"Devon",                   region:"England"  },
  FK: { city:"Falkirk",               county:"Falkirk",                 region:"Scotland" },
  FY: { city:"Blackpool",             county:"Lancashire",              region:"England"  },
  G:  { city:"Glasgow",               county:"Glasgow City",            region:"Scotland" },
  GL: { city:"Gloucester",            county:"Gloucestershire",         region:"England"  },
  GU: { city:"Guildford",             county:"Surrey",                  region:"England"  },
  HA: { city:"Harrow",                county:"Greater London",          region:"England"  },
  HD: { city:"Huddersfield",          county:"West Yorkshire",          region:"England"  },
  HG: { city:"Harrogate",             county:"North Yorkshire",         region:"England"  },
  HP: { city:"Hemel Hempstead",       county:"Hertfordshire",           region:"England"  },
  HR: { city:"Hereford",              county:"Herefordshire",           region:"England"  },
  HS: { city:"Stornoway",             county:"Western Isles",           region:"Scotland" },
  HU: { city:"Hull",                  county:"East Riding of Yorkshire",region:"England"  },
  HX: { city:"Halifax",               county:"West Yorkshire",          region:"England"  },
  IG: { city:"Ilford",                county:"Greater London",          region:"England"  },
  IP: { city:"Ipswich",               county:"Suffolk",                 region:"England"  },
  IV: { city:"Inverness",             county:"Highland",                region:"Scotland" },
  KA: { city:"Kilmarnock",            county:"East Ayrshire",           region:"Scotland" },
  KT: { city:"Kingston upon Thames",  county:"Greater London",          region:"England"  },
  KW: { city:"Kirkwall",              county:"Orkney Islands",          region:"Scotland" },
  KY: { city:"Kirkcaldy",             county:"Fife",                    region:"Scotland" },
  L:  { city:"Liverpool",             county:"Merseyside",              region:"England"  },
  LA: { city:"Lancaster",             county:"Lancashire",              region:"England"  },
  LD: { city:"Llandrindod Wells",     county:"Powys",                   region:"Wales"    },
  LE: { city:"Leicester",             county:"Leicestershire",          region:"England"  },
  LL: { city:"Llandudno",             county:"Conwy",                   region:"Wales"    },
  LN: { city:"Lincoln",               county:"Lincolnshire",            region:"England"  },
  LS: { city:"Leeds",                 county:"West Yorkshire",          region:"England"  },
  LU: { city:"Luton",                 county:"Bedfordshire",            region:"England"  },
  M:  { city:"Manchester",            county:"Greater Manchester",      region:"England"  },
  ME: { city:"Maidstone",             county:"Kent",                    region:"England"  },
  MK: { city:"Milton Keynes",         county:"Buckinghamshire",         region:"England"  },
  ML: { city:"Motherwell",            county:"North Lanarkshire",       region:"Scotland" },
  N:  { city:"London",                county:"Greater London",          region:"England"  },
  NE: { city:"Newcastle upon Tyne",   county:"Tyne and Wear",           region:"England"  },
  NG: { city:"Nottingham",            county:"Nottinghamshire",         region:"England"  },
  NN: { city:"Northampton",           county:"Northamptonshire",        region:"England"  },
  NP: { city:"Newport",               county:"Monmouthshire",           region:"Wales"    },
  NR: { city:"Norwich",               county:"Norfolk",                 region:"England"  },
  NW: { city:"London",                county:"Greater London",          region:"England"  },
  OL: { city:"Oldham",                county:"Greater Manchester",      region:"England"  },
  OX: { city:"Oxford",                county:"Oxfordshire",             region:"England"  },
  PA: { city:"Paisley",               county:"Renfrewshire",            region:"Scotland" },
  PE: { city:"Peterborough",          county:"Cambridgeshire",          region:"England"  },
  PH: { city:"Perth",                 county:"Perth and Kinross",       region:"Scotland" },
  PL: { city:"Plymouth",              county:"Devon",                   region:"England"  },
  PO: { city:"Portsmouth",            county:"Hampshire",               region:"England"  },
  PR: { city:"Preston",               county:"Lancashire",              region:"England"  },
  RG: { city:"Reading",               county:"Berkshire",               region:"England"  },
  RH: { city:"Redhill",               county:"Surrey",                  region:"England"  },
  RM: { city:"Romford",               county:"Essex",                   region:"England"  },
  S:  { city:"Sheffield",             county:"South Yorkshire",         region:"England"  },
  SA: { city:"Swansea",               county:"Swansea",                 region:"Wales"    },
  SE: { city:"London",                county:"Greater London",          region:"England"  },
  SG: { city:"Stevenage",             county:"Hertfordshire",           region:"England"  },
  SK: { city:"Stockport",             county:"Greater Manchester",      region:"England"  },
  SL: { city:"Slough",                county:"Berkshire",               region:"England"  },
  SM: { city:"Sutton",                county:"Greater London",          region:"England"  },
  SN: { city:"Swindon",               county:"Wiltshire",               region:"England"  },
  SO: { city:"Southampton",           county:"Hampshire",               region:"England"  },
  SP: { city:"Salisbury",             county:"Wiltshire",               region:"England"  },
  SR: { city:"Sunderland",            county:"Tyne and Wear",           region:"England"  },
  SS: { city:"Southend-on-Sea",       county:"Essex",                   region:"England"  },
  ST: { city:"Stoke-on-Trent",        county:"Staffordshire",           region:"England"  },
  SW: { city:"London",                county:"Greater London",          region:"England"  },
  SY: { city:"Shrewsbury",            county:"Shropshire",              region:"England"  },
  TA: { city:"Taunton",               county:"Somerset",                region:"England"  },
  TD: { city:"Galashiels",            county:"Scottish Borders",        region:"Scotland" },
  TF: { city:"Telford",               county:"Shropshire",              region:"England"  },
  TN: { city:"Tonbridge",             county:"Kent",                    region:"England"  },
  TQ: { city:"Torquay",               county:"Devon",                   region:"England"  },
  TR: { city:"Truro",                 county:"Cornwall",                region:"England"  },
  TS: { city:"Middlesbrough",         county:"North Yorkshire",         region:"England"  },
  TW: { city:"Twickenham",            county:"Greater London",          region:"England"  },
  UB: { city:"Southall",              county:"Greater London",          region:"England"  },
  W:  { city:"London",                county:"Greater London",          region:"England"  },
  WA: { city:"Warrington",            county:"Cheshire",                region:"England"  },
  WC: { city:"London",                county:"Greater London",          region:"England"  },
  WD: { city:"Watford",               county:"Hertfordshire",           region:"England"  },
  WF: { city:"Wakefield",             county:"West Yorkshire",          region:"England"  },
  WN: { city:"Wigan",                 county:"Greater Manchester",      region:"England"  },
  WR: { city:"Worcester",             county:"Worcestershire",          region:"England"  },
  WS: { city:"Walsall",               county:"West Midlands",           region:"England"  },
  WV: { city:"Wolverhampton",         county:"West Midlands",           region:"England"  },
  YO: { city:"York",                  county:"North Yorkshire",         region:"England"  },
  ZE: { city:"Lerwick",               county:"Shetland Islands",        region:"Scotland" },
};

// ── International calling codes ───────────────────────────────────────────────
const CALLING_CODES: Record<string, string> = {
  US: "+1", CA: "+1", GB: "+44", DE: "+49", FR: "+33", IT: "+39",
  ES: "+34", NL: "+31", PL: "+48", PT: "+351", SE: "+46", NO: "+47",
  DK: "+45", FI: "+358", AT: "+43", CH: "+41", BE: "+32", CZ: "+420",
  SK: "+421", HU: "+36", RO: "+40", BG: "+359", HR: "+385", SI: "+386",
  LT: "+370", LV: "+371", EE: "+372", IE: "+353", AU: "+61", GR: "+30",
  RS: "+381", NZ: "+64", MX: "+52", BR: "+55", ZA: "+27", JP: "+81",
  SG: "+65", IN: "+91", CN: "+86",
};

// ── Street name pools per locale ──────────────────────────────────────────────
const STREET_POOLS: Record<string, { prefix: string[]; suffix: string[] }> = {
  US: {
    prefix: ["Main","Oak","Maple","Cedar","Pine","Elm","Washington","Lincoln","Park","Lake","Hill","Church","Sunset","Riverside","Broadway","Madison","Jefferson","Adams","Harrison","Monroe","Willow","Birch","Cherry","Spruce","Poplar","Ash","Walnut","Chestnut","Laurel","Holly"],
    suffix: ["St","Ave","Blvd","Dr","Rd","Ln","Way","Ct","Pl","Terrace","Circle","Loop"],
  },
  GB: {
    prefix: ["High","Church","Victoria","King","Queen","Park","Station","Manor","Green","Mill","School","Bridge","Market","Castle","North","South","East","West","Oxford","Bath","York","London","Windsor","Abbey","Regent","Wellington","Nelson","Whitehall","Kensington","Clarence"],
    suffix: ["Street","Road","Lane","Avenue","Close","Drive","Gardens","Way","Place","Crescent","Row","Mews","Terrace","Square","Walk","Rise","View","Hill","Court","Grove"],
  },
  DE: {
    prefix: ["Haupt","Kirch","Schul","Bahnhof","Garten","Wald","Berg","Bach","Tal","Feld","Wiesen","Mühlen","Birken","Linden","Eichen","Buchen","Ahorn","Kastanien","Rosen","Blumen"],
    suffix: ["straße","gasse","allee","weg","platz","ring","damm","pfad"],
  },
  FR: {
    prefix: ["Grande Rue","Rue de la Paix","Avenue Montaigne","Boulevard Haussmann","Rue du Faubourg","Rue des Fleurs","Allée des Roses","Chemin du Moulin","Impasse du Château","Passage des Arts","Rue Victor Hugo","Avenue de la République","Boulevard du Général"],
    suffix: [],
  },
  IT: {
    prefix: ["Via Roma","Via Garibaldi","Corso Vittorio","Via Mazzini","Piazza Navona","Via del Corso","Via Veneto","Viale Delle Rose","Via Dante","Via Nazionale","Corso Italia","Via Cavour","Piazza della Repubblica"],
    suffix: [],
  },
  ES: {
    prefix: ["Calle Mayor","Gran Vía","Paseo de la Castellana","Calle de Alcalá","Avenida de América","Calle del Sol","Paseo de Gracia","Rambla de Catalunya","Calle Nueva","Calle Real","Avenida Principal","Calle de la Paz"],
    suffix: [],
  },
  NL: {
    prefix: ["Kerk","Hoofd","Markt","Molenweg","Linden","Eiken","Beek","Bos","Veld","Dijk","Wijk","Brug","School"],
    suffix: ["straat","laan","weg","plein","gracht","kade","steeg","pad"],
  },
  PL: {
    prefix: ["ul. Główna","ul. Kościelna","ul. Szkolna","ul. Parkowa","ul. Leśna","ul. Polna","ul. Słoneczna","ul. Lipowa","ul. Dębowa","ul. Wierzbowa","al. Krakowska","al. Warszawska","ul. Mickiewicza"],
    suffix: [],
  },
  DEFAULT: {
    prefix: ["Central","North","South","East","West","Grand","New","Old","Upper","Lower","Royal","National","Municipal"],
    suffix: ["Street","Avenue","Road","Lane","Boulevard","Drive","Way","Place"],
  },
};

function getLocale(countryCode: string): string {
  if (["US","CA","AU","NZ"].includes(countryCode)) return "US";
  if (["GB","IE"].includes(countryCode)) return "GB";
  if (["DE","AT","CH"].includes(countryCode)) return "DE";
  if (["FR","BE","LU"].includes(countryCode)) return "FR";
  if (["IT"].includes(countryCode)) return "IT";
  if (["ES"].includes(countryCode)) return "ES";
  if (["NL"].includes(countryCode)) return "NL";
  if (["PL"].includes(countryCode)) return "PL";
  return "DEFAULT";
}

function generateStreetAddress(countryCode: string, city: string): string {
  const locale = getLocale(countryCode);
  const pool = STREET_POOLS[locale] ?? STREET_POOLS.DEFAULT;
  const num = rnd(1, 999);

  if (locale === "DE") {
    const name = pick(pool.prefix);
    const suffix = pick(pool.suffix);
    return `${name}${suffix} ${num}`;
  }
  if (["FR","IT","ES","PL"].includes(locale) && pool.suffix.length === 0) {
    return `${pick(pool.prefix)} ${num}`;
  }
  if (pool.suffix.length > 0) {
    return `${num} ${pick(pool.prefix)} ${pick(pool.suffix)}`;
  }
  return `${num} ${pick(pool.prefix)}`;
}

// ── UK postcode utilities ─────────────────────────────────────────────────────

/** Normalise a raw UK postcode input and extract the outward code for API lookup.
 *  UK postcodes: outward (AN, ANN, AAN, AANN, ANA, AANA) + space + inward (NAA).
 *  The inward code is always exactly 3 chars (digit + 2 letters).
 *  We extract outward = everything except the last 3 non-space chars. */
function parseUKPostcode(raw: string): { outward: string; inward: string; normalised: string; valid: boolean } {
  const cleaned = raw.toUpperCase().replace(/\s+/g, "");
  // UK postcode regex (covers all valid UK formats)
  const re = /^(GIR\s?0AA|([A-Z]{1,2}\d[A-Z\d]?)\s?(\d[A-Z]{2}))$/;
  const compact = cleaned.replace(/\s/g, "");
  if (compact.length < 5 || compact.length > 7) return { outward: "", inward: "", normalised: "", valid: false };
  const inward = compact.slice(-3);
  const outward = compact.slice(0, compact.length - 3);
  // Basic sanity: outward 2-4 chars, inward digit+2letters
  const validInward = /^\d[A-Z]{2}$/.test(inward);
  const validOutward = /^[A-Z]{1,2}\d[A-Z\d]?$/.test(outward);
  const valid = validInward && validOutward;
  return { outward, inward, normalised: `${outward} ${inward}`, valid };
}

/** Extract the postcode area (1-2 leading letters) from an outward code. */
function getUKPostcodeArea(outward: string): string {
  const m = outward.match(/^([A-Z]{1,2})/);
  return m ? m[1] : "";
}

// ── Mobile number generation ──────────────────────────────────────────────────
// Generates realistic local mobile numbers for every supported country.
// Never generates landline numbers.

/** Pad a number to a fixed digit length with leading zeros */
function pad(n: number, len: number): string {
  return String(n).padStart(len, "0");
}

/** Random digits string of exact length */
function randDigits(len: number): string {
  return Array.from({ length: len }, () => rnd(0, 9)).join("");
}

function generateMobilePhone(countryCode: string, stateCode = ""): string {
  switch (countryCode) {

    // ── NANP: US & Canada ──────────────────────────────────────────────────
    // Mobile and landline share area codes in NANP; use the regional area code
    // with a valid exchange (200-999, skip 555 test range and emergency codes).
    case "US":
    case "CA": {
      const areaCodes = US_AREA_CODES[stateCode] ?? ["800"];
      const area = pick(areaCodes);
      let exchange: number;
      do { exchange = rnd(200, 999); } while (exchange === 555 || exchange === 911);
      const line = pad(rnd(0, 9999), 4);
      return `(${area}) ${exchange}-${line}`;
    }

    // ── United Kingdom ─────────────────────────────────────────────────────
    // Mobile numbers: 07XX XXXXXX (074-079 are all active mobile ranges)
    case "GB": {
      // 074x = EE/BT, 075x = Three/O2, 076x = Vodafone, 077x = EE/O2
      // 078x = O2/Vodafone, 079x = O2/Vodafone/EE
      const second = pick(["4","5","6","7","8","9"]);
      const third = String(rnd(0, 9));
      const fourth = String(rnd(0, 9));
      const rest = randDigits(6);
      return `07${second}${third}${fourth} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Germany ────────────────────────────────────────────────────────────
    // Mobile: 015x, 016x, 017x (11 digits total with leading 0)
    case "DE": {
      const prefixes = [
        "1511","1512","1515","1516","1517","1518","1519",
        "160","162","163",
        "170","171","172","173","174","175","176","177","178","179",
      ];
      const pfx = pick(prefixes);
      const totalLen = 11; // 0 + prefix + rest
      const rest = randDigits(totalLen - 1 - pfx.length);
      const full = `0${pfx}${rest}`;
      // Format: 0XXX XXXXXXX
      return `${full.slice(0,4)} ${full.slice(4)}`;
    }

    // ── France ─────────────────────────────────────────────────────────────
    // Mobile: 06XX XX XX XX or 07XX XX XX XX
    case "FR": {
      const series = pick(["6","7"]);
      const d = randDigits(8);
      return `0${series}${d[0]}${d[1]} ${d[2]}${d[3]} ${d[4]}${d[5]} ${d[6]}${d[7]}`;
    }

    // ── Italy ──────────────────────────────────────────────────────────────
    // Mobile: 3XX XXXXXXX (no leading 0)
    case "IT": {
      const prefixes = ["320","328","329","333","334","335","336","337","338","339",
                        "340","345","346","347","348","349","360","366","368","370",
                        "380","388","389","391","392","393","396","397","398","399"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Spain ──────────────────────────────────────────────────────────────
    // Mobile: 6XX XXX XXX or 7XX XXX XXX
    case "ES": {
      const series = pick(["6","7"]);
      const d = randDigits(8);
      return `${series}${d[0]}${d[1]} ${d[2]}${d[3]}${d[4]} ${d[5]}${d[6]}${d[7]}`;
    }

    // ── Netherlands ────────────────────────────────────────────────────────
    // Mobile: 06-XXXXXXXX
    case "NL": {
      return `06-${randDigits(8)}`;
    }

    // ── Poland ─────────────────────────────────────────────────────────────
    // Mobile prefixes (first 2 digits): 50,51,53,57,60,66,69,72,73,78,79,88
    case "PL": {
      const prefixes = ["50","51","53","57","60","66","69","72","73","78","79","88"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx}${rest[0]} ${rest[1]}${rest[2]}${rest[3]} ${rest[4]}${rest[5]}${rest[6]}`;
    }

    // ── Portugal ───────────────────────────────────────────────────────────
    // Mobile: 9X XXXXXXX (91 TMN, 93 Vodafone, 96 NOS, 92 Nowo)
    case "PT": {
      const prefixes = ["91","92","93","95","96"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx}${rest[0]} ${rest[1]}${rest[2]}${rest[3]} ${rest[4]}${rest[5]}${rest[6]}`;
    }

    // ── Sweden ─────────────────────────────────────────────────────────────
    // Mobile: 07X-XXX XX XX (070, 072, 073, 076, 079)
    case "SE": {
      const prefixes = ["070","072","073","076","079"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx}-${rest[0]}${rest[1]}${rest[2]} ${rest[3]}${rest[4]} ${rest[5]}${rest[6]}`;
    }

    // ── Norway ─────────────────────────────────────────────────────────────
    // Mobile: 4XX XX XXX or 9XX XX XXX (8 digits total)
    case "NO": {
      const series = pick(["4","9"]);
      const rest = randDigits(7);
      return `${series}${rest[0]}${rest[1]} ${rest[2]}${rest[3]} ${rest[4]}${rest[5]}${rest[6]}`;
    }

    // ── Denmark ────────────────────────────────────────────────────────────
    // Mobile (8 digits): starts with 2X, 3X, 4X, 5X, 6X(0-1), 71, 72, 81, 91-93
    case "DK": {
      const prefixes = [
        "20","21","22","23","24","25","26","27","28","29",
        "30","31","40","41","42","50","51","52","60","61",
        "71","72","81","91","92","93",
      ];
      const pfx = pick(prefixes);
      const rest = randDigits(6);
      return `${pfx} ${rest[0]}${rest[1]} ${rest[2]}${rest[3]} ${rest[4]}${rest[5]}`;
    }

    // ── Finland ────────────────────────────────────────────────────────────
    // Mobile: 04X XXXXXXX or 050 XXXXXXX
    case "FI": {
      const prefixes = ["040","041","042","043","044","045","046","047","050"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Austria ────────────────────────────────────────────────────────────
    // Mobile: 06XX XXXXXXX (0650 A1, 0660 Drei, 0664 Magenta, 0676 A1, 0699 Drei)
    case "AT": {
      const prefixes = ["0650","0660","0664","0676","0699","0680","0681","0688","0699"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Switzerland ────────────────────────────────────────────────────────
    // Mobile: 07X XXX XX XX (075 Salt, 076 Sunrise, 077 Swisscom, 078 Sunrise, 079 Swisscom)
    case "CH": {
      const prefixes = ["075","076","077","078","079"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx} ${rest[0]}${rest[1]}${rest[2]} ${rest[3]}${rest[4]} ${rest[5]}${rest[6]}`;
    }

    // ── Belgium ────────────────────────────────────────────────────────────
    // Mobile: 04XX XX XX XX (0456 Base, 0460 Orange, 0470-0479 Proximus, 0486-0497 Orange/Base)
    case "BE": {
      const prefixes = ["0456","0460","0461","0465","0470","0472","0474","0476",
                        "0477","0478","0479","0486","0488","0495","0496","0497","0498"];
      const pfx = pick(prefixes);
      const rest = randDigits(6);
      return `${pfx} ${rest[0]}${rest[1]} ${rest[2]}${rest[3]} ${rest[4]}${rest[5]}`;
    }

    // ── Czech Republic ─────────────────────────────────────────────────────
    // Mobile: 6XX XXX XXX or 7XX XXX XXX
    case "CZ": {
      const series = pick(["6","7"]);
      const rest = randDigits(8);
      return `${series}${rest[0]}${rest[1]} ${rest[2]}${rest[3]}${rest[4]} ${rest[5]}${rest[6]}${rest[7]}`;
    }

    // ── Slovakia ───────────────────────────────────────────────────────────
    // Mobile: 09XX XXX XXX (0901-0910 Orange/Telekom, 0940-0950 O2)
    case "SK": {
      const prefixes = ["0901","0902","0903","0904","0905","0906","0907","0908",
                        "0940","0944","0948","0949","0950","0951"];
      const pfx = pick(prefixes);
      const rest = randDigits(6);
      return `${pfx} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Hungary ────────────────────────────────────────────────────────────
    // Mobile: 06-XX-XXX-XXXX (20 Telenor, 30 T-Mobile, 31 T-Mobile, 70 Vodafone)
    case "HU": {
      const prefixes = ["20","30","31","70"];
      const pfx = pick(prefixes);
      const mid = randDigits(3);
      const last = randDigits(4);
      return `06-${pfx}-${mid}-${last}`;
    }

    // ── Romania ────────────────────────────────────────────────────────────
    // Mobile: 07XX XXX XXX (070-079)
    case "RO": {
      const d = rnd(0, 9);
      const rest = randDigits(7);
      return `07${d}${rest[0]} ${rest[1]}${rest[2]}${rest[3]} ${rest[4]}${rest[5]}${rest[6]}`;
    }

    // ── Bulgaria ───────────────────────────────────────────────────────────
    // Mobile: 08X XXX XXXX (087 A1, 088 Telenor, 089 Vivacom)
    case "BG": {
      const prefixes = ["087","088","089"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Croatia ────────────────────────────────────────────────────────────
    // Mobile: 09X XXXXXXX (091-099)
    case "HR": {
      const d = rnd(1, 9);
      const rest = randDigits(7);
      return `09${d} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Slovenia ───────────────────────────────────────────────────────────
    // Mobile: 0XX XXX XXX (031, 040, 041, 051, 064, 068, 070, 071)
    case "SI": {
      const prefixes = ["031","040","041","051","064","068","070","071"];
      const pfx = pick(prefixes);
      const rest = randDigits(6);
      return `${pfx} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Lithuania ──────────────────────────────────────────────────────────
    // Mobile: 06X XXX XXX (060-069)
    case "LT": {
      const d = rnd(0, 9);
      const rest = randDigits(6);
      return `06${d} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Latvia ─────────────────────────────────────────────────────────────
    // Mobile: 2X XXX XXX (20-29)
    case "LV": {
      const d = rnd(0, 9);
      const rest = randDigits(6);
      return `2${d} ${rest[0]}${rest[1]}${rest[2]} ${rest[3]}${rest[4]}${rest[5]}`;
    }

    // ── Estonia ────────────────────────────────────────────────────────────
    // Mobile: 5XXX XXXX (8 digits starting with 5)
    case "EE": {
      const rest = randDigits(7);
      return `5${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Ireland ────────────────────────────────────────────────────────────
    // Mobile: 08X XXX XXXX (083 Three, 085 Meteor, 086 Vodafone, 087 Eir, 089 48)
    case "IE": {
      const prefixes = ["083","085","086","087","089"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Australia ──────────────────────────────────────────────────────────
    // Mobile: 04XX XXX XXX (all mobile in Australia start with 04)
    case "AU": {
      const d1 = rnd(0, 9);
      const d2 = rnd(0, 9);
      const rest = randDigits(6);
      return `04${d1}${d2} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── New Zealand ────────────────────────────────────────────────────────
    // Mobile: 02X XXX XXXX (020, 021, 022, 027, 028, 029)
    case "NZ": {
      const prefixes = ["020","021","022","027","028","029"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Japan ──────────────────────────────────────────────────────────────
    // Mobile: 070-XXXX-XXXX, 080-XXXX-XXXX, 090-XXXX-XXXX
    case "JP": {
      const prefixes = ["070","080","090"];
      const pfx = pick(prefixes);
      const mid = randDigits(4);
      const last = randDigits(4);
      return `${pfx}-${mid}-${last}`;
    }

    // ── India ──────────────────────────────────────────────────────────────
    // Mobile: 10 digits, starts with 7, 8, or 9
    case "IN": {
      const series = pick(["7","8","9"]);
      const rest = randDigits(9);
      return `${series}${rest.slice(0,4)} ${rest.slice(4)}`;
    }

    // ── Mexico ─────────────────────────────────────────────────────────────
    // Mobile: 10 digits (55 for CDMX, random otherwise), formatted XX XXXX XXXX
    case "MX": {
      const areaPrefixes = ["55","33","81","222","664","614","442"];
      const pfx = pick(areaPrefixes);
      const rest = randDigits(10 - pfx.length);
      const full = pfx + rest;
      return `${full.slice(0,2)} ${full.slice(2,6)} ${full.slice(6)}`;
    }

    // ── Brazil ─────────────────────────────────────────────────────────────
    // Mobile: (DDD) 9XXXX-XXXX — 9th digit is always 9 for mobile in Brazil
    case "BR": {
      const areaCodes = ["11","21","31","41","51","61","71","81","91","85","48","62","63","65","67","68","69","77","79","82","83","84","86","87","88","89","92","93","94","95","96","97","98","99"];
      const ddd = pick(areaCodes);
      const rest = randDigits(8);
      return `(${ddd}) 9${rest.slice(0,4)}-${rest.slice(4)}`;
    }

    // ── South Africa ───────────────────────────────────────────────────────
    // Mobile: 06X/07X/08X XXXXXXX (060-065 Cell C, 071-079 Vodacom, 081-083 MTN)
    case "ZA": {
      const prefixes = ["060","061","062","063","064","065","071","072","073","074",
                        "076","078","079","081","082","083"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Greece ─────────────────────────────────────────────────────────────
    // Mobile: 69X XXXXXXX
    case "GR": {
      const d = rnd(0, 9);
      const rest = randDigits(7);
      return `69${d} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Serbia ─────────────────────────────────────────────────────────────
    // Mobile: 06X XXXXXXX (060-069)
    case "RS": {
      const d = rnd(0, 9);
      const rest = randDigits(7);
      return `06${d} ${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── Singapore ──────────────────────────────────────────────────────────
    // Mobile: 8XXX XXXX or 9XXX XXXX
    case "SG": {
      const series = pick(["8","9"]);
      const rest = randDigits(7);
      return `${series}${rest.slice(0,3)} ${rest.slice(3)}`;
    }

    // ── China ──────────────────────────────────────────────────────────────
    // Mobile: 1XX XXXX XXXX (13x, 14x, 15x, 17x, 18x, 19x)
    case "CN": {
      const prefixes = ["130","131","132","133","134","135","136","137","138","139",
                        "145","147","150","151","152","153","155","156","157","158","159",
                        "170","171","172","173","175","176","177","178","180","181","182",
                        "183","184","185","186","187","188","189","190","191","199"];
      const pfx = pick(prefixes);
      const rest = randDigits(8);
      return `${pfx} ${rest.slice(0,4)} ${rest.slice(4)}`;
    }

    // ── Ukraine ────────────────────────────────────────────────────────────
    // Mobile: 0XX XXX XX XX (050, 063, 066, 067, 068, 073, 091-099)
    case "UA": {
      const prefixes = ["050","063","066","067","068","073","091","093","094","095","096","097","098","099"];
      const pfx = pick(prefixes);
      const rest = randDigits(7);
      return `${pfx} ${rest[0]}${rest[1]}${rest[2]} ${rest[3]}${rest[4]} ${rest[5]}${rest[6]}`;
    }

    // ── Fallback ───────────────────────────────────────────────────────────
    default: {
      const calling = CALLING_CODES[countryCode] ?? "+1";
      const rest = randDigits(9);
      return `${calling} ${rest.slice(0,3)} ${rest.slice(3,6)} ${rest.slice(6)}`;
    }
  }
}

function mapsUrl(street: string, city: string, state: string, zip: string, country: string): string {
  const q = encodeURIComponent(`${street}, ${city}, ${state} ${zip}, ${country}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

// ── Result types ──────────────────────────────────────────────────────────────

export interface ZipAddress {
  street: string;
  city: string;
  state: string;
  county?: string;
  zip: string;
  country: string;
  phone: string;
  mapsUrl: string;
}

export interface ZipLookupResult {
  postCode: string;
  country: string;
  countryCode: string;
  city: string;
  state: string;
  stateCode: string;
  county?: string;
  latitude: string;
  longitude: string;
  areaCodes: string[];
  addresses: ZipAddress[];
}

// ── Main lookup function ──────────────────────────────────────────────────────

export async function lookupZip(
  zip: string,
  countryCode: string = "US"
): Promise<ZipLookupResult> {
  const code = countryCode.toLowerCase();

  // ── UK special handling ──────────────────────────────────────────────────
  if (countryCode === "GB") {
    const parsed = parseUKPostcode(zip);
    if (!parsed.valid) {
      throw new Error(
        `"${zip}" doesn't look like a valid UK postcode. Try formats like SW1A 1AA, M1 1AE, or EH1 1BB.`
      );
    }
    const outward = parsed.outward;
    const normalised = parsed.normalised;
    const area = getUKPostcodeArea(outward);

    const res = await fetch(`https://api.zippopotam.us/gb/${outward}`);
    if (!res.ok) {
      throw new Error(
        res.status === 404
          ? `Postcode "${normalised}" not found. Try a well-known UK postcode like SW1A 1AA or M1 1AE.`
          : `Lookup failed (HTTP ${res.status}). Check your connection and try again.`
      );
    }

    const data = await res.json();
    const place = data.places?.[0];
    if (!place) throw new Error("No location data returned for this postcode.");

    const apiCity    = place["place name"] ?? "";
    const apiRegion  = place["state"] ?? "";       // e.g. "England"

    // Enrich with local knowledge
    const areaInfo   = UK_AREA_INFO[area] ?? UK_AREA_INFO[area.charAt(0)];
    const city       = areaInfo?.city ?? apiCity;
    const county     = areaInfo?.county ?? "";
    const region     = areaInfo?.region ?? apiRegion;
    const lat        = place["latitude"]  ?? "";
    const lon        = place["longitude"] ?? "";

    // UK mobile prefixes (displayed as area codes for info panel)
    const areaCodes  = ["074","075","076","077","078","079"];

    const addresses: ZipAddress[] = Array.from({ length: 5 }, () => {
      const street = generateStreetAddress("GB", city);
      return {
        street,
        city,
        state: region,
        county,
        zip: normalised,
        country: "United Kingdom",
        phone: generateMobilePhone("GB"),
        mapsUrl: mapsUrl(street, city, county || region, normalised, "United Kingdom"),
      };
    });

    return {
      postCode:    normalised,
      country:     "United Kingdom",
      countryCode: "GB",
      city,
      state:       region,
      stateCode:   region === "Scotland" ? "SCT" : region === "Wales" ? "WLS" : region === "Northern Ireland" ? "NIR" : "ENG",
      county,
      latitude:    lat,
      longitude:   lon,
      areaCodes,
      addresses,
    };
  }

  // ── Standard lookup for all other countries ──────────────────────────────
  const res = await fetch(`https://api.zippopotam.us/${code}/${zip.trim()}`);
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? `ZIP code "${zip}" not found for ${countryCode}. Try a different code or country.`
        : `Lookup failed (HTTP ${res.status}). Check your connection and try again.`
    );
  }

  const data = await res.json();
  const place = data.places?.[0];
  if (!place) throw new Error("No location data returned for this ZIP code.");

  const city      = place["place name"] ?? "";
  const state     = place["state"] ?? "";
  const stateCode = place["state abbreviation"] ?? countryCode;
  const lat       = place["latitude"] ?? "";
  const lon       = place["longitude"] ?? "";

  let areaCodes: string[] = [];
  if (countryCode === "US") {
    areaCodes = US_AREA_CODES[stateCode] ?? ["800"];
  } else if (countryCode === "CA") {
    areaCodes = US_AREA_CODES[stateCode] ?? ["800"];
  } else {
    areaCodes = [CALLING_CODES[countryCode]?.replace("+", "") ?? "1"];
  }

  const addresses: ZipAddress[] = Array.from({ length: 5 }, () => {
    const street = generateStreetAddress(countryCode, city);
    return {
      street,
      city,
      state,
      zip,
      country: data.country ?? countryCode,
      phone: generateMobilePhone(countryCode, stateCode),
      mapsUrl: mapsUrl(street, city, state, zip, data.country ?? countryCode),
    };
  });

  return {
    postCode:    zip,
    country:     data.country ?? countryCode,
    countryCode: countryCode.toUpperCase(),
    city,
    state,
    stateCode,
    latitude:    lat,
    longitude:   lon,
    areaCodes,
    addresses,
  };
}

// Country options supported by the Zippopotam.us API
export const SUPPORTED_COUNTRIES = [
  { code: "US", name: "🇺🇸 United States" },
  { code: "CA", name: "🇨🇦 Canada" },
  { code: "GB", name: "🇬🇧 United Kingdom" },
  { code: "DE", name: "🇩🇪 Germany" },
  { code: "FR", name: "🇫🇷 France" },
  { code: "IT", name: "🇮🇹 Italy" },
  { code: "ES", name: "🇪🇸 Spain" },
  { code: "NL", name: "🇳🇱 Netherlands" },
  { code: "PL", name: "🇵🇱 Poland" },
  { code: "PT", name: "🇵🇹 Portugal" },
  { code: "SE", name: "🇸🇪 Sweden" },
  { code: "NO", name: "🇳🇴 Norway" },
  { code: "DK", name: "🇩🇰 Denmark" },
  { code: "FI", name: "🇫🇮 Finland" },
  { code: "AT", name: "🇦🇹 Austria" },
  { code: "CH", name: "🇨🇭 Switzerland" },
  { code: "BE", name: "🇧🇪 Belgium" },
  { code: "CZ", name: "🇨🇿 Czech Republic" },
  { code: "SK", name: "🇸🇰 Slovakia" },
  { code: "HU", name: "🇭🇺 Hungary" },
  { code: "RO", name: "🇷🇴 Romania" },
  { code: "HR", name: "🇭🇷 Croatia" },
  { code: "SI", name: "🇸🇮 Slovenia" },
  { code: "IE", name: "🇮🇪 Ireland" },
  { code: "AU", name: "🇦🇺 Australia" },
  { code: "NZ", name: "🇳🇿 New Zealand" },
  { code: "JP", name: "🇯🇵 Japan" },
  { code: "IN", name: "🇮🇳 India" },
  { code: "MX", name: "🇲🇽 Mexico" },
  { code: "BR", name: "🇧🇷 Brazil" },
  { code: "ZA", name: "🇿🇦 South Africa" },
];
