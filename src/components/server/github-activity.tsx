import "server-only";

import { cache } from "react";

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    commits?: Array<{ message: string; sha: string }>;
    ref?: string;
    ref_type?: string;
    action?: string;
    pull_request?: { title: string; number: number; html_url: string };
    issue?: { title: string; number: number; html_url: string };
  };
};

const fetchEvents = cache(async (username: string): Promise<GitHubEvent[] | null> => {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(`https://api.github.com/users/${username}/events/public`, {
      headers,
      // Re-fetch hourly. Next caches between requests via the data cache.
      next: { revalidate: 60 * 60, tags: ["github-events"] },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GitHubEvent[];
    return data.slice(0, 6);
  } catch {
    return null;
  }
});

function relative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / (86400 * 7))}w`;
}

function summarize(e: GitHubEvent): { verb: string; detail: string } | null {
  switch (e.type) {
    case "PushEvent": {
      const commits = e.payload.commits ?? [];
      const last = commits[commits.length - 1]?.message?.split("\n")[0] ?? "";
      return { verb: "pushed", detail: last || `${commits.length} commit(s)` };
    }
    case "PullRequestEvent": {
      const pr = e.payload.pull_request;
      if (!pr) return null;
      return { verb: `${e.payload.action ?? "updated"} PR`, detail: pr.title };
    }
    case "IssuesEvent": {
      const issue = e.payload.issue;
      if (!issue) return null;
      return { verb: `${e.payload.action ?? "updated"} issue`, detail: issue.title };
    }
    case "CreateEvent": {
      const kind = e.payload.ref_type ?? "ref";
      return { verb: `created ${kind}`, detail: e.payload.ref ?? "" };
    }
    case "WatchEvent":
      return { verb: "starred", detail: "" };
    case "ForkEvent":
      return { verb: "forked", detail: "" };
    case "PublicEvent":
      return { verb: "went public", detail: "" };
    default:
      return null;
  }
}

export async function GitHubActivity({ username }: { username: string }) {
  const events = await fetchEvents(username);

  if (!events) {
    return (
      <div className="text-[11px] text-fg-dim">
        could not reach github.{" "}
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="border-b border-line text-fg hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          go straight to the source ↗
        </a>
      </div>
    );
  }

  const summarized = events
    .map((e) => ({ event: e, summary: summarize(e) }))
    .filter((x): x is { event: GitHubEvent; summary: NonNullable<ReturnType<typeof summarize>> } => !!x.summary);

  if (summarized.length === 0) {
    return (
      <div className="text-[11px] text-fg-dim">
        no recent public activity. either i&apos;m on holiday or pushing to private repos.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line-soft bg-bg-2/40 p-4">
      <div className="mb-3 flex items-center justify-between text-[10px] lowercase tracking-[0.08em] text-fg-dim">
        <span>recent activity · {username}</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-[var(--accent)] opacity-80" />
          live · cached 1h
        </span>
      </div>
      <ul className="space-y-2.5">
        {summarized.map(({ event, summary }) => (
          <li
            key={event.id}
            className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-line-soft pb-2 last:border-b-0 last:pb-0"
          >
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 text-[11px] text-fg-muted">
                <span className="text-fg-dim">{summary.verb}</span>
                <a
                  href={`https://github.com/${event.repo.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate font-mono text-fg hover:text-[var(--accent)]"
                >
                  {event.repo.name}
                </a>
              </div>
              {summary.detail && (
                <div className="mt-0.5 truncate font-mono text-[11px] text-fg-muted">
                  {summary.detail}
                </div>
              )}
            </div>
            <span className="font-mono text-[10px] text-fg-dim">{relative(event.created_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
