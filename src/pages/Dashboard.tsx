import { useState, useEffect } from "react";
import { FlagIcon } from "@/components/FlagIcon";
import { Link } from "wouter";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { countries as dbCountries, totalStats } from "@/data/countries";

// ─── localStorage stats ───────────────────────────────────────────────────────

interface GenerationEvent {
  timestamp: number;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  count: number;
}

interface GenerationStats {
  today: number;
  yesterday: number;
  last7Days: number;
  last30Days: number;
  total: number;
  dailyTrend: Array<{ date: string; count: number }>;
  byCountry: Array<{ code: string; name: string; flag: string; count: number }>;
}

const STORAGE_KEY = "fakenames_generation_stats";

function loadEvents(): GenerationEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GenerationEvent[];
  } catch {
    return [];
  }
}

function clearStats() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

function exportHistoryCSV() {
  const events = loadEvents();
  if (events.length === 0) { alert("No generation history to export."); return; }
  const header = ["Timestamp", "Date", "Time", "Country Code", "Country Name", "Count"];
  const rows = events.map((e) => {
    const d = new Date(e.timestamp);
    return [
      e.timestamp,
      d.toLocaleDateString("en-GB"),
      d.toLocaleTimeString("en-GB"),
      e.countryCode,
      e.countryName,
      e.count ?? 1,
    ];
  });
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fakenames-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function computeStats(): GenerationStats {
  const events = loadEvents();
  const now = Date.now();
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - 86400000;
  const day7Start = todayStart - 6 * 86400000;
  const day30Start = todayStart - 29 * 86400000;

  let today = 0, yesterday = 0, last7Days = 0, last30Days = 0, total = 0;
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
    if (!byCountry[ck]) byCountry[ck] = { code: ck, name: e.countryName || ck, flag: e.countryFlag || "", count: 0 };
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

// ─── Colours ─────────────────────────────────────────────────────────────────

const C = { male: "#3b82f6", female: "#ec4899", last: "#8b5cf6", accent: "#22d3ee" };
const PIE_COLORS = ["#3b82f6","#ec4899","#8b5cf6","#22d3ee","#22c55e","#f97316","#eab308","#ef4444","#a3e635","#fb7185","#818cf8","#34d399"];
const DB_PIE = [
  { name: "Male Names", value: totalStats.totalMale, color: C.male },
  { name: "Female Names", value: totalStats.totalFemale, color: C.female },
  { name: "Last Names", value: totalStats.totalLast, color: C.last },
];
const TT = { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 };

// ─── Components ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "text-white", icon }: {
  label: string; value: string; sub?: string; color?: string; icon?: string;
}) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 px-5 py-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-slate-600">
      <span className="text-4xl mb-3">📊</span>
      <p className="text-sm">No generation data yet.</p>
      <Link href="/" className="mt-2 text-xs text-blue-500 hover:text-blue-400">Start generating names →</Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [stats, setStats] = useState<GenerationStats>(() => computeStats());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "total" | "male" | "female" | "last">("name");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setStats(computeStats()), 5000);
    return () => clearInterval(id);
  }, []);

  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return; }
    clearStats();
    setStats(computeStats());
    setConfirmReset(false);
  }

  const filtered = dbCountries
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : b[sortBy] - a[sortBy]);

  const top10 = stats.byCountry.slice(0, 10);
  const pieCountry = stats.byCountry.slice(0, 12);
  const hasUsage = stats.total > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">📈 Statistics Dashboard</h1>
            <p className="mt-1 text-slate-400 text-sm">Generation analytics &amp; database explorer — auto-refreshes every 5 s</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={exportHistoryCSV}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              ⬇️ Export CSV
            </button>
            <button
              onClick={handleReset}
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
                confirmReset
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              {confirmReset ? "⚠️ Confirm Reset" : "🗑️ Reset Statistics"}
            </button>
            {confirmReset && (
              <button onClick={() => setConfirmReset(false)} className="text-sm text-slate-500 hover:text-slate-300">
                Cancel
              </button>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-xl"
            >
              🎭 Generator
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">📈 Generation Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
          <StatCard label="Total Countries" value={totalStats.countries.toString()} sub="in database" icon="🌍" />
          <StatCard label="DB Names" value={totalStats.totalNames.toLocaleString()} sub="1,350 per country" icon="📚" />
          <StatCard label="Today" value={stats.today.toLocaleString()} color={stats.today > 0 ? "text-green-400" : "text-slate-400"} icon="☀️" />
          <StatCard label="Yesterday" value={stats.yesterday.toLocaleString()} color={stats.yesterday > 0 ? "text-blue-400" : "text-slate-400"} icon="📅" />
          <StatCard label="Last 7 Days" value={stats.last7Days.toLocaleString()} color={stats.last7Days > 0 ? "text-cyan-400" : "text-slate-400"} icon="📆" />
          <StatCard label="Last 30 Days" value={stats.last30Days.toLocaleString()} color={stats.last30Days > 0 ? "text-violet-400" : "text-slate-400"} icon="🗓️" />
          <StatCard label="Total Generated" value={stats.total.toLocaleString()} color={stats.total > 0 ? "text-yellow-400" : "text-slate-400"} icon="🏆" />
        </div>

        {/* Charts */}
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">📉 Charts &amp; Graphs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Daily trend */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-slate-300">Daily Generation Trend — Last 30 Days</h3>
              {!hasUsage && <span className="text-xs text-slate-500 italic">Generate names to see data</span>}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.dailyTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TT} labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#f1f5f9" }} />
                <Line type="monotone" dataKey="count" name="Generated" stroke={C.accent} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 bar */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-slate-300">Top 10 Most-Used Countries</h3>
              {!hasUsage && <span className="text-xs text-slate-500 italic">No data yet</span>}
            </div>
            {hasUsage && top10.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={top10} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey={(d) => d.name} tick={{ fontSize: 11, fill: "#cbd5e1" }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={TT} labelStyle={{ color: "#94a3b8" }} formatter={(v: number) => [v.toLocaleString(), "Generated"]} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} fill={C.male} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </div>

          {/* Pie by country */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-slate-300">Distribution by Country</h3>
              {!hasUsage && <span className="text-xs text-slate-500 italic">No data yet</span>}
            </div>
            {hasUsage && pieCountry.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={pieCountry} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="count">
                      {pieCountry.map((_e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />)}
                    </Pie>
                    <Tooltip contentStyle={TT} formatter={(v: number, _n, p) => [v.toLocaleString(), p.payload.name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[200px] pr-1">
                  {pieCountry.map((d, i) => (
                    <div key={d.code} className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <FlagIcon code={d.code} size="sm" /><span className="text-xs text-slate-300 truncate">{d.name}</span>
                      <span className="text-xs text-slate-500 ml-auto flex-shrink-0">{d.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <EmptyState />}
          </div>

          {/* DB name type pie */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 mb-6">Database Name Type Distribution</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={DB_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {DB_PIE.map((e) => <Cell key={e.name} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={TT} formatter={(v: number) => v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {DB_PIE.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <div>
                      <p className="text-xs text-slate-400">{d.name}</p>
                      <p className="text-sm font-semibold text-white">{d.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DB names per country sample bar */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 mb-6">DB Names Per Country (first 10)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dbCountries.slice(0, 10)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="code" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT} labelFormatter={(l) => dbCountries.find((x) => x.code === l)?.name ?? l} formatter={(v: number, name: string) => [v.toLocaleString(), name]} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Bar dataKey="maleNames" name="Male" fill={C.male} radius={[3, 3, 0, 0]} />
                <Bar dataKey="femaleNames" name="Female" fill={C.female} radius={[3, 3, 0, 0]} />
                <Bar dataKey="lastNames" name="Last" fill={C.last} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">All Countries — Database</h2>
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="name">Sort: Name</option>
                <option value="total">Sort: Total</option>
                <option value="male">Sort: Male</option>
                <option value="female">Sort: Female</option>
                <option value="last">Sort: Last</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800">
                  <th className="text-left px-6 py-3 font-medium">Country</th>
                  <th className="text-right px-4 py-3 font-medium">Code</th>
                  <th className="text-right px-4 py-3 font-medium text-blue-400">Male</th>
                  <th className="text-right px-4 py-3 font-medium text-pink-400">Female</th>
                  <th className="text-right px-4 py-3 font-medium text-violet-400">Last</th>
                  <th className="text-right px-4 py-3 font-medium text-white">DB Total</th>
                  <th className="text-right px-6 py-3 font-medium text-yellow-400">Generated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const usage = stats.byCountry.find((x) => x.code === c.code);
                  return (
                    <tr key={c.code} className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors ${i % 2 === 0 ? "" : "bg-slate-800/10"}`}>
                      <td className="px-6 py-3 font-medium text-slate-200"><span className="mr-2 inline-flex"><FlagIcon code={c.code} size="sm" /></span>{c.name}</td>
                      <td className="px-4 py-3 text-right text-slate-500 font-mono text-xs">{c.code}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-blue-400">{c.maleNames.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-pink-400">{c.femaleNames.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-violet-400">{c.lastNames.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-white">{c.total.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right tabular-nums font-semibold text-yellow-400">
                        {usage ? usage.count.toLocaleString() : <span className="text-slate-600">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t border-slate-700 bg-slate-800/50">
                    <td className="px-6 py-3 text-sm font-semibold text-slate-300">{filtered.length} countries</td>
                    <td />
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-blue-400">{filtered.reduce((s, c) => s + c.maleNames, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-pink-400">{filtered.reduce((s, c) => s + c.femaleNames, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-violet-400">{filtered.reduce((s, c) => s + c.lastNames, 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-white">{filtered.reduce((s, c) => s + c.total, 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right tabular-nums font-bold text-yellow-400">
                      {stats.byCountry.filter((x) => filtered.find((c) => c.code === x.code)).reduce((s, x) => s + x.count, 0).toLocaleString() || "—"}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
          <p>Generated data is entirely fictional. For testing and development purposes only.</p>
          <p className="mt-1">
            © {new Date().getFullYear()} Md Jubaer Rahman. All rights reserved.
            {" · "}Telegram:{" "}
            <a
              href="https://t.me/mjrnayeem"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-400 transition-colors"
            >
              @mjrnayeem
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
