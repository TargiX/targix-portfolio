import "server-only";

import { cache } from "react";

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
type Calendar = { total: number; weeks: Day[][] };

const LEVEL_ENUM: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

// ── Source 1: official GitHub GraphQL (used when GITHUB_TOKEN is set) ──
async function fetchViaGraphQL(username: string): Promise<Calendar | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays { date contributionCount contributionLevel }
            }
          }
        }
      }
    }`;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
    next: { revalidate: 60 * 60 * 6, tags: ["github-contributions"] },
  });

  if (!res.ok) return null;
  const json = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) return null;

  const weeks: Day[][] = cal.weeks.map((w: { contributionDays: Array<{ date: string; contributionCount: number; contributionLevel: string }> }) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVEL_ENUM[d.contributionLevel] ?? 0,
    })),
  );
  return { total: cal.totalContributions, weeks };
}

// ── Source 2: public API (zero-config fallback) ──
async function fetchViaPublicApi(username: string): Promise<Calendar | null> {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
    { next: { revalidate: 60 * 60 * 6, tags: ["github-contributions"] } },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as {
    total: Record<string, number>;
    contributions: Array<{ date: string; count: number; level: number }>;
  };

  const days = json.contributions ?? [];
  if (days.length === 0) return null;

  // Group the flat day array into week-columns (Sun → Sat).
  const weeks: Day[][] = [];
  let current: Day[] = [];
  for (const d of days) {
    const dow = new Date(d.date + "T00:00:00Z").getUTCDay(); // 0 = Sun
    if (dow === 0 && current.length) {
      weeks.push(current);
      current = [];
    }
    current.push({
      date: d.date,
      count: d.count,
      level: Math.max(0, Math.min(4, d.level)) as 0 | 1 | 2 | 3 | 4,
    });
  }
  if (current.length) weeks.push(current);

  const total = Object.values(json.total ?? {}).reduce((a, b) => a + b, 0);
  return { total, weeks };
}

const getCalendar = cache(async (username: string): Promise<Calendar | null> => {
  try {
    const viaGql = await fetchViaGraphQL(username);
    if (viaGql) return viaGql;
  } catch {
    /* fall through to public API */
  }
  try {
    return await fetchViaPublicApi(username);
  } catch {
    return null;
  }
});

const LEVEL_FILL = [
  "var(--line-soft)",
  "color-mix(in oklab, var(--accent) 28%, var(--bg-2))",
  "color-mix(in oklab, var(--accent) 52%, var(--bg-2))",
  "color-mix(in oklab, var(--accent) 76%, var(--bg-2))",
  "var(--accent)",
] as const;

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GitHubContributions({ username }: { username: string }) {
  const cal = await getCalendar(username);

  if (!cal || cal.weeks.length === 0) {
    return (
      <div className="text-[11px] text-fg-dim">
        contribution graph unavailable right now ·{" "}
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="border-b border-line text-fg hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          view on github ↗
        </a>
      </div>
    );
  }

  const weeks = cal.weeks;
  const gridW = weeks.length * STEP;
  const gridH = 7 * STEP;
  const topPad = 16; // room for month labels

  // Month label positions: first week-column whose first day starts a new month.
  const monthLabels: { x: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week[0];
    if (!first) return;
    const m = new Date(first.date + "T00:00:00Z").getUTCMonth();
    if (m !== lastMonth) {
      monthLabels.push({ x: wi * STEP, label: MONTHS[m] });
      lastMonth = m;
    }
  });

  return (
    <figure className="rounded-md border border-line-soft bg-bg-2/40 p-4">
      <figcaption className="mb-3 flex items-center justify-between text-[10px] lowercase tracking-[0.08em] text-fg-dim">
        <span>
          <span className="text-fg-muted">{cal.total.toLocaleString()}</span> contributions · last
          year
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-[var(--accent)] opacity-80" />
          {process.env.GITHUB_TOKEN ? "github graphql" : "public api"} · cached 6h
        </span>
      </figcaption>

      <div className="overflow-x-auto">
        <svg
          width={gridW}
          height={gridH + topPad}
          viewBox={`0 0 ${gridW} ${gridH + topPad}`}
          role="img"
          aria-label={`${cal.total} GitHub contributions in the last year`}
          className="block"
        >
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={m.x}
              y={10}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fill="var(--fg-dim)"
            >
              {m.label}
            </text>
          ))}
          {weeks.map((week, wi) =>
            week.map((day) => {
              const dow = new Date(day.date + "T00:00:00Z").getUTCDay();
              return (
                <rect
                  key={day.date}
                  x={wi * STEP}
                  y={topPad + dow * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={LEVEL_FILL[day.level]}
                >
                  <title>{`${day.count} contribution${day.count === 1 ? "" : "s"} · ${day.date}`}</title>
                </rect>
              );
            }),
          )}
        </svg>
      </div>

      {/* legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[9px] lowercase tracking-[0.06em] text-fg-dim">
        <span>less</span>
        {LEVEL_FILL.map((fill, i) => (
          <span
            key={i}
            className="inline-block size-2.5 rounded-[2px]"
            style={{ background: fill }}
          />
        ))}
        <span>more</span>
      </div>
    </figure>
  );
}
