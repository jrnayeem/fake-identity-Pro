import { countries, CountryData } from "@/data/names";

export { countries };
export type { CountryData };

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export interface GeneratedIdentity {
  country: CountryData;
  gender: "male" | "female";
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  age: number;
}

function generateUsername(firstName: string, lastName: string): string {
  const fn = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const ln = lastName.toLowerCase().replace(/[^a-z]/g, "");
  const year = Math.floor(Math.random() * 35) + 1970;
  const patterns = [
    () => `${fn}.${ln}`,
    () => `${fn}${ln}`,
    () => `${fn[0]}${ln}`,
    () => `${fn}${ln.slice(0, 3)}`,
    () => `${fn}.${ln}${year.toString().slice(-2)}`,
    () => `${fn}${Math.floor(Math.random() * 999) + 1}`,
    () => `${fn[0]}${fn.slice(-1)}${ln}`,
    () => `${fn}_${ln}`,
    () => `${fn}${ln}${Math.floor(Math.random() * 99) + 1}`,
    () => `${ln}.${fn}`,
    () => `${ln}${fn[0]}`,
    () => `${fn.slice(0, 4)}${ln.slice(0, 4)}`,
  ];
  const result = pick(patterns)();
  return result.length > 20 ? result.slice(0, 20) : result;
}

function generateEmail(firstName: string, lastName: string, domain: string): string {

  const fn = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const ln = lastName.toLowerCase().replace(/[^a-z]/g, "");

  const patterns = [

    // Existing patterns
    () => `${fn}.${ln}@${domain}`,
    () => `${fn}${ln}@${domain}`,
    () => `${fn[0]}${ln}@${domain}`,
    () => `${fn}.${ln[0]}@${domain}`,
    () => `${fn}@${domain}`,

    // Existing 2-digit number pattern
    () => `${fn}.${ln}${Math.floor(Math.random() * 99) + 1}@${domain}`,

    () => `${fn[0]}.${ln}@${domain}`,
    () => `${fn}_${ln}@${domain}`,

    // Existing 3-digit number pattern
    () => `${fn}${Math.floor(Math.random() * 999) + 1}@${domain}`,

    () => `${ln}.${fn}@${domain}`,

    // Additional 2-digit number patterns
    () => `${fn}${ln}${Math.floor(Math.random() * 90) + 10}@${domain}`,
    () => `${fn[0]}${ln}${Math.floor(Math.random() * 90) + 10}@${domain}`,
    () => `${fn}${Math.floor(Math.random() * 90) + 10}@${domain}`,
    () => `${ln}.${fn}${Math.floor(Math.random() * 90) + 10}@${domain}`,

    // Additional 3-digit number patterns
    () => `${fn}.${ln}${Math.floor(Math.random() * 900) + 100}@${domain}`,
    () => `${fn}${ln}${Math.floor(Math.random() * 900) + 100}@${domain}`,
    () => `${fn[0]}${ln}${Math.floor(Math.random() * 900) + 100}@${domain}`,
    () => `${fn}${Math.floor(Math.random() * 900) + 100}@${domain}`,
    () => `${ln}.${fn}${Math.floor(Math.random() * 900) + 100}@${domain}`,

  ];

  return pick(patterns)();

}

function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "@#$%&*";
  const length = Math.floor(Math.random() * 9) + 8;
  const chars = upper + lower + digits + special;
  let password = "";
  password += pick(upper.split(""));
  password += pick(lower.split(""));
  password += pick(digits.split(""));
  password += pick(special.split(""));
  for (let i = 4; i < length; i++) password += pick(chars.split(""));
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

function generateDateOfBirth(): { dob: string; age: number } {
  const now = new Date();
  const age = Math.floor(Math.random() * (40 - 18 + 1)) + 18;
  const birthYear = now.getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
  const birthDay = Math.floor(Math.random() * daysInMonth) + 1;
  const dob = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
  return { dob, age };
}

// ── Global name index (built once at module load) ─────────────────────────────
const _nameIndex = (() => {
  const male = new Map<string, string>();
  const female = new Map<string, string>();
  const last = new Map<string, string>();
  for (const c of countries) {
    for (const n of c.maleNames)   male.set(n.toLowerCase(), n);
    for (const n of c.femaleNames) female.set(n.toLowerCase(), n);
    for (const n of c.lastNames)   last.set(n.toLowerCase(), n);
  }
  return { male, female, last };
})();

// ── Sorted arrays for O(log n) prefix scoring ─────────────────────────────────
const _sortedFirstNames: string[] = (() => {
  const all = new Set<string>();
  for (const k of _nameIndex.male.keys())   all.add(k);
  for (const k of _nameIndex.female.keys()) all.add(k);
  return [...all].sort();
})();
const _sortedLastNames: string[] = [..._nameIndex.last.keys()].sort();

/**
 * Returns the length of the longest common prefix between `token` and any
 * entry in the sorted pool (binary search, O(log n)).
 */
function longestPrefixScore(token: string, sortedPool: string[]): number {
  const lower = token.toLowerCase();
  let lo = 0, hi = sortedPool.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sortedPool[mid] < lower) lo = mid + 1;
    else hi = mid;
  }
  let best = 0;
  for (const idx of [lo - 1, lo, lo + 1, lo + 2]) {
    if (idx < 0 || idx >= sortedPool.length) continue;
    const name = sortedPool[idx];
    let i = 0;
    while (i < lower.length && i < name.length && lower[i] === name[i]) i++;
    if (i > best) best = i;
  }
  return best;
}

// ── Email Extractor helpers ───────────────────────────────────────────────────

const TLD_TO_COUNTRY: Record<string, string> = {
  de: "DE", fr: "FR", gb: "GB", uk: "GB", it: "IT", es: "ES",
  nl: "NL", pl: "PL", pt: "PT", se: "SE", no: "NO", dk: "DK",
  fi: "FI", at: "AT", ch: "CH", be: "BE", cz: "CZ", sk: "SK",
  hu: "HU", ro: "RO", bg: "BG", hr: "HR", si: "SI", lt: "LT",
  lv: "LV", ee: "EE", ie: "IE", us: "US", ca: "CA", au: "AU",
  gr: "GR", rs: "RS",
};

function guessCountryFromDomain(domain: string): CountryData | undefined {
  const tld = domain.split(".").pop()?.toLowerCase() ?? "";
  const code = TLD_TO_COUNTRY[tld];
  return code ? countries.find((c) => c.code === code) : undefined;
}

/** Split "john.smith92", "johnsmith", "JohnSmith", "cooldragon88" → text tokens */
function tokenizeLocalPart(local: string): string[] {
  const bySep = local.split(/[.\-_]/);
  const result: string[] = [];
  for (const seg of bySep) {
    const stripped = seg.replace(/^\d+|\d+$/g, "");
    if (!stripped) continue;
    const camel = stripped.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
    result.push(...camel.filter(Boolean));
  }
  return result.filter((t) => /^[a-zA-Z]{1,}$/.test(t));
}

// ── Unified scoring system ────────────────────────────────────────────────────
//
// Every name lookup returns a numeric confidence score so we can rank
// candidates and always pick the highest-quality match.
//
// Score tiers (higher = more confident):
//   8  exact match in selected country
//   6  exact match anywhere in the global index
//   4  prefix match (4+ chars) in selected country
//   3  prefix match (4+ chars) globally
//   2  prefix match (3 chars) in selected country
//   1  prefix match (3 chars) globally
//   >0 fuzzy: fraction of token chars matched in sorted global list
//   0  no match (caller decides whether to fall back to capitalised raw token)

interface FirstNameResult {
  name: string;
  gender: "male" | "female";
  score: number;
}
interface LastNameResult {
  name: string;
  score: number;
}

function scoreFirstName(token: string, country: CountryData): FirstNameResult {
  const lower = token.toLowerCase();

  // Exact — selected country
  const m1 = country.maleNames.find((n) => n.toLowerCase() === lower);
  if (m1) return { name: m1, gender: "male", score: 8 };
  const f1 = country.femaleNames.find((n) => n.toLowerCase() === lower);
  if (f1) return { name: f1, gender: "female", score: 8 };

  // Exact — global index
  const m2 = _nameIndex.male.get(lower);
  if (m2) return { name: m2, gender: "male", score: 6 };
  const f2 = _nameIndex.female.get(lower);
  if (f2) return { name: f2, gender: "female", score: 6 };

  // Prefix (4+ chars) — selected country
  if (lower.length >= 4) {
    const prefix4 = lower.slice(0, 4);
    const m3 = country.maleNames.find((n) => n.toLowerCase().startsWith(prefix4));
    if (m3) return { name: m3, gender: "male", score: 4 };
    const f3 = country.femaleNames.find((n) => n.toLowerCase().startsWith(prefix4));
    if (f3) return { name: f3, gender: "female", score: 4 };
  }

  // Prefix (4+ chars) — global
  if (lower.length >= 4) {
    const prefix4 = lower.slice(0, 4);
    for (const [k, v] of _nameIndex.male) {
      if (k.startsWith(prefix4)) return { name: v, gender: "male", score: 3 };
    }
    for (const [k, v] of _nameIndex.female) {
      if (k.startsWith(prefix4)) return { name: v, gender: "female", score: 3 };
    }
  }

  // Prefix (3 chars) — selected country
  if (lower.length >= 3) {
    const prefix3 = lower.slice(0, 3);
    const m4 = country.maleNames.find((n) => n.toLowerCase().startsWith(prefix3));
    if (m4) return { name: m4, gender: "male", score: 2 };
    const f4 = country.femaleNames.find((n) => n.toLowerCase().startsWith(prefix3));
    if (f4) return { name: f4, gender: "female", score: 2 };
  }

  // Prefix (3 chars) — global
  if (lower.length >= 3) {
    const prefix3 = lower.slice(0, 3);
    for (const [k, v] of _nameIndex.male) {
      if (k.startsWith(prefix3)) return { name: v, gender: "male", score: 1 };
    }
    for (const [k, v] of _nameIndex.female) {
      if (k.startsWith(prefix3)) return { name: v, gender: "female", score: 1 };
    }
  }

  // Fuzzy — binary search for longest prefix alignment
  const fuzzy = longestPrefixScore(lower, _sortedFirstNames);
  const defaultGender: "male" | "female" = Math.random() > 0.5 ? "male" : "female";
  if (fuzzy >= 2) {
    return { name: capitalize(token), gender: defaultGender, score: fuzzy / lower.length };
  }

  // No match — return capitalised token with score 0 so caller can decide
  return { name: capitalize(token), gender: defaultGender, score: 0 };
}

function scoreLastName(token: string, country: CountryData): LastNameResult {
  const lower = token.toLowerCase();

  // Exact — selected country
  const l1 = country.lastNames.find((n) => n.toLowerCase() === lower);
  if (l1) return { name: l1, score: 8 };

  // Exact — global index
  const l2 = _nameIndex.last.get(lower);
  if (l2) return { name: l2, score: 6 };

  // Prefix (4+ chars) — selected country
  if (lower.length >= 4) {
    const prefix4 = lower.slice(0, 4);
    const l3 = country.lastNames.find((n) => n.toLowerCase().startsWith(prefix4));
    if (l3) return { name: l3, score: 4 };
  }

  // Prefix (4+ chars) — global
  if (lower.length >= 4) {
    const prefix4 = lower.slice(0, 4);
    for (const [k, v] of _nameIndex.last) {
      if (k.startsWith(prefix4)) return { name: v, score: 3 };
    }
  }

  // Prefix (3 chars) — selected country
  if (lower.length >= 3) {
    const prefix3 = lower.slice(0, 3);
    const l4 = country.lastNames.find((n) => n.toLowerCase().startsWith(prefix3));
    if (l4) return { name: l4, score: 2 };
  }

  // Prefix (3 chars) — global
  if (lower.length >= 3) {
    const prefix3 = lower.slice(0, 3);
    for (const [k, v] of _nameIndex.last) {
      if (k.startsWith(prefix3)) return { name: v, score: 1 };
    }
  }

  // Fuzzy
  const fuzzy = longestPrefixScore(lower, _sortedLastNames);
  if (fuzzy >= 2) return { name: capitalize(token), score: fuzzy / lower.length };

  return { name: capitalize(token), score: 0 };
}

/**
 * Expand a single-character initial to the best-matching full first name.
 * e.g. "j" when paired with last name "smith" → prefer "John" over "James"
 * (returns highest-score name starting with that letter in the selected country).
 */
function expandInitial(
  letter: string,
  country: CountryData
): FirstNameResult {
  const l = letter.toLowerCase();
  const m = country.maleNames.find((n) => n.toLowerCase().startsWith(l));
  if (m) return { name: m, gender: "male", score: 2 };
  const f = country.femaleNames.find((n) => n.toLowerCase().startsWith(l));
  if (f) return { name: f, gender: "female", score: 2 };
  // Global fallback
  for (const [k, v] of _nameIndex.male) {
    if (k.startsWith(l)) return { name: v, gender: "male", score: 1 };
  }
  for (const [k, v] of _nameIndex.female) {
    if (k.startsWith(l)) return { name: v, gender: "female", score: 1 };
  }
  return { name: capitalize(letter), gender: "male", score: 0 };
}

/**
 * Expand a single-character initial to the best-matching full last name.
 * e.g. "r" when paired with first name "darius" → prefer a surname starting
 * with "R" from the selected country's database over just capitalizing "r".
 */
function expandLastNameInitial(
  letter: string,
  country: CountryData
): LastNameResult {
  const l = letter.toLowerCase();
  const m = country.lastNames.find((n) => n.toLowerCase().startsWith(l));
  if (m) return { name: m, score: 2 };
  // Global fallback
  for (const [k, v] of _nameIndex.last) {
    if (k.startsWith(l)) return { name: v, score: 1 };
  }
  return { name: capitalize(letter), score: 0 };
}

// ── Candidate accumulator ─────────────────────────────────────────────────────

interface Candidate {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  score: number;
}

/**
 * Try (a as first name, b as last name) AND (a as last name, b as first name).
 * Push both into the candidates array with their combined scores.
 * Skip combinations where a token is a single char (handled as initial elsewhere).
 */
function tryPair(
  a: string,
  b: string,
  country: CountryData,
  candidates: Candidate[]
) {
  // Handle initials (single char tokens)
  const aIsInitial = a.length === 1;
  const bIsInitial = b.length === 1;

  // Ordering 1: a = first name, b = last name
  {
    const first = aIsInitial ? expandInitial(a, country) : scoreFirstName(a, country);
    const last  = bIsInitial ? expandLastNameInitial(b, country) : scoreLastName(b, country);
    candidates.push({
      firstName: first.name,
      lastName:  last.name,
      gender:    first.gender,
      score:     first.score + last.score,
    });
  }

  // Ordering 2: b = first name, a = last name (only when neither is an initial)
  if (!aIsInitial && !bIsInitial) {
    const first = scoreFirstName(b, country);
    const last  = scoreLastName(a, country);
    candidates.push({
      firstName: first.name,
      lastName:  last.name,
      gender:    first.gender,
      score:     first.score + last.score,
    });
  }
}

/**
 * Core extraction logic: given a list of tokens extracted from the email local
 * part, find the best first-name + last-name pair from the selected country's
 * database by trying all orderings and cut-points.
 */
function resolveNameFromTokens(
  tokens: string[],
  country: CountryData
): { firstName: string; lastName: string; gender: "male" | "female" } {
  const candidates: Candidate[] = [];

  if (tokens.length >= 2) {
    // Try the first two tokens in both orderings
    tryPair(tokens[0], tokens[1], country, candidates);

    // If there are more tokens, try other two-token combinations too
    for (let i = 0; i < tokens.length - 1; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        if (i === 0 && j === 1) continue; // already done
        tryPair(tokens[i], tokens[j], country, candidates);
      }
    }

  } else if (tokens.length === 1) {
    const token = tokens[0];

    // Check if the whole token is a standalone first name
    const asFirstName = scoreFirstName(token, country);
    if (asFirstName.score >= 6) {
      // Strong first-name match — pair with a random last name from the country
      candidates.push({
        firstName: asFirstName.name,
        lastName:  pick(country.lastNames),
        gender:    asFirstName.gender,
        score:     asFirstName.score,
      });
    }

    // Try all split points of the concatenated token, both orderings
    const lower = token.toLowerCase();
    const len   = lower.length;
    for (let i = 3; i <= len - 3; i++) {
      const fp = lower.slice(0, i);
      const lp = lower.slice(i);
      tryPair(fp, lp, country, candidates);
    }
  }

  if (candidates.length === 0) {
    // Absolute fallback: random from country
    const gender: "male" | "female" = Math.random() > 0.5 ? "male" : "female";
    return {
      firstName: pick(gender === "male" ? country.maleNames : country.femaleNames),
      lastName:  pick(country.lastNames),
      gender,
    };
  }

  // Pick the candidate with the highest combined score
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  return { firstName: best.firstName, lastName: best.lastName, gender: best.gender };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function extractIdentityFromEmail(email: string, countryCode?: string): GeneratedIdentity {
  const atIdx   = email.indexOf("@");
  const localPart = atIdx >= 0 ? email.slice(0, atIdx) : email;
  const domain    = atIdx >= 0 ? email.slice(atIdx + 1) : "gmail.com";

  const tokens = tokenizeLocalPart(localPart);

  const country =
    (countryCode ? countries.find((c) => c.code === countryCode) : undefined) ??
    guessCountryFromDomain(domain) ??
    pick(countries);

  const { firstName, lastName, gender } = resolveNameFromTokens(tokens, country);

  const fullName = `${firstName} ${lastName}`;
  const username = generateUsername(firstName, lastName);
  const password = generatePassword();
  const { dob, age } = generateDateOfBirth();

  return {
    country,
    gender,
    firstName,
    lastName,
    fullName,
    username,
    email,
    password,
    dateOfBirth: dob,
    age,
  };
}

export function generateIdentity(
  countryCode?: string,
  gender?: "male" | "female",
  emailDomain?: string
): GeneratedIdentity {
  const country = countryCode
    ? countries.find((c) => c.code === countryCode) ?? pick(countries)
    : pick(countries);

  const resolvedGender: "male" | "female" = gender ?? (Math.random() > 0.5 ? "male" : "female");
  const firstName = resolvedGender === "male" ? pick(country.maleNames) : pick(country.femaleNames);
  const lastName  = pick(country.lastNames);
  const fullName  = `${firstName} ${lastName}`;
  const username  = generateUsername(firstName, lastName);
  const domain    = emailDomain || pick(country.emailDomains);
  const email     = generateEmail(firstName, lastName, domain);
  const password  = generatePassword();
  const { dob, age } = generateDateOfBirth();

  return {
    country,
    gender: resolvedGender,
    firstName,
    lastName,
    fullName,
    username,
    email,
    password,
    dateOfBirth: dob,
    age,
  };
}

export function generateBulk(
  count: number,
  countryCode?: string,
  gender?: "male" | "female",
  emailDomain?: string
): GeneratedIdentity[] {
  return Array.from({ length: count }, () => generateIdentity(countryCode, gender, emailDomain));
}
