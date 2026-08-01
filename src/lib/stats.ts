export interface GenerationEvent {
  timestamp: number;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  count: number;
}

const STORAGE_KEY = "fakenames_generation_stats";
const MAX_EVENTS = 10000;

export function recordGeneration(events: Array<{ countryCode: string; countryName: string; countryFlag: string }>) {
  if (events.length === 0) return;
  try {
    const stored = loadRawEvents();
    const now = Date.now();
    const newEvents: GenerationEvent[] = events.map((e) => ({
      timestamp: now,
      countryCode: e.countryCode,
      countryName: e.countryName,
      countryFlag: e.countryFlag,
      count: 1,
    }));
    const combined = [...stored, ...newEvents].slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
  } catch {
  }
}

export function loadRawEvents(): GenerationEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GenerationEvent[];
  } catch {
    return [];
  }
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface GenerationStats {
  today: number;
  yesterday: number;
  last7Days: number;
  last30Days: number;
  total: number;
  dailyTrend: Array<{ date: string; count: number }>;
  byCountry: Array<{ code: string; name: string; flag: string; count: number }>;
}

export function computeStats(): GenerationStats {
  const events = loadRawEvents();
  const now = Date.now();
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - 86400000;
  const day7Start = todayStart - 6 * 86400000;
  const day30Start = todayStart - 29 * 86400000;

  let today = 0;
  let yesterday = 0;
  let last7Days = 0;
  let last30Days = 0;
  let total = 0;

  const byDay: Record<string, number> = {};
  const byCountry: Record<string, { code: string; name: string; flag: string; count: number }> = {};

  for (const e of events) {
    const ts = e.timestamp;
    const count = e.count ?? 1;
    total += count;
    if (ts >= todayStart) today += count;
    if (ts >= yesterdayStart && ts < todayStart) yesterday += count;
    if (ts >= day7Start) last7Days += count;
    if (ts >= day30Start) last30Days += count;

    const d = new Date(ts);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    byDay[dayKey] = (byDay[dayKey] ?? 0) + count;

    const ck = e.countryCode || "??";
    if (!byCountry[ck]) byCountry[ck] = { code: ck, name: e.countryName, flag: e.countryFlag, count: 0 };
    byCountry[ck].count += count;
  }

  const dailyTrend: Array<{ date: string; count: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayStart - i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    dailyTrend.push({ date: label, count: byDay[key] ?? 0 });
  }

  const byCountryArr = Object.values(byCountry).sort((a, b) => b.count - a.count);

  return { today, yesterday, last7Days, last30Days, total, dailyTrend, byCountry: byCountryArr };
}
