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

function formatUKPhone(outward: string): string {
  const area = getUKPostcodeArea(outward);
  // Try 2-letter area first (e.g. SW, NW, EC), then 1-letter
  const std = UK_STD[area] ?? UK_STD[area.charAt(0)] ?? "1632"; // 01632 = Ofcom drama/fictitious
  const localLen = 10 - std.length;
  // Generate local number digits
  const firstDigit = rnd(1, 9);
  const restDigits = Array.from({ length: localLen - 1 }, () => rnd(0, 9)).join("");
  const local = `${firstDigit}${restDigits}`;
  // Format: "0{std} {groups}"
  let formatted: string;
  if (std.length === 2) {
    // e.g. 020 XXXX XXXX
    formatted = `0${std} ${local.slice(0, 4)} ${local.slice(4)}`;
  } else if (std.length === 3) {
    // e.g. 0161 XXX XXXX
    formatted = `0${std} ${local.slice(0, 3)} ${local.slice(3)}`;
  } else if (std.length === 4) {
    // e.g. 01274 XXX XXX
    formatted = `0${std} ${local.slice(0, 3)} ${local.slice(3)}`;
  } else {
    // 5-digit STD: e.g. 01392 XXXXX
    formatted = `0${std} ${local}`;
  }
  return formatted;
}

function formatPhone(countryCode: string, stateCode: string): string {
  const calling = CALLING_CODES[countryCode] ?? "+1";

  if (countryCode === "US" || countryCode === "CA") {
    const areaCodes = US_AREA_CODES[stateCode] ?? ["800"];
    const area = pick(areaCodes);
    const line1 = String(rnd(200, 999));
    const line2 = String(rnd(1000, 9999));
    return `(${area}) ${line1}-${line2}`;
  }

  // Generic international format
  const local = Array.from({ length: rnd(7, 9) }, () => rnd(0, 9)).join("");
  const groups = local.match(/.{1,3}/g) ?? [local];
  return `${calling} ${groups.join(" ")}`;
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

    // Build UK area codes list (formatted STD codes)
    const std        = UK_STD[area] ?? UK_STD[area.charAt(0)] ?? "1632";
    const areaCodes  = [`0${std}`];

    const addresses: ZipAddress[] = Array.from({ length: 5 }, () => {
      const street = generateStreetAddress("GB", city);
      return {
        street,
        city,
        state: region,
        county,
        zip: normalised,
        country: "United Kingdom",
        phone: formatUKPhone(outward),
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
      phone: formatPhone(countryCode, stateCode),
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
