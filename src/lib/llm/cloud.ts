import { ChatError, type ChatMessage } from "./types";

/** Is the cloud (OpenRouter) backend configured on the server? */
export async function cloudAvailable(): Promise<boolean> {
  try {
    const res = await fetch("/api/chat", { method: "GET" });
    if (!res.ok) return false;
    const data = (await res.json()) as { cloud?: boolean };
    return Boolean(data.cloud);
  } catch {
    return false;
  }
}

/**
 * Stream a completion from the server proxy (OpenRouter). The route emits a
 * plain UTF-8 token stream, so the client just reads body chunks — no SSE
 * parsing here.
 */
export async function streamCloud(
  messages: ChatMessage[],
  onToken: (t: string) => void,
  signal: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch {
    if (signal.aborted) throw new ChatError("aborted");
    throw new ChatError("unknown");
  }

  if (!res.ok) {
    if (res.status === 503) throw new ChatError("cloud_offline");
    if (res.status === 429) {
      const data = (await res.json().catch(() => ({}))) as { retryAfterSeconds?: number };
      throw new ChatError("rate_limited", data.retryAfterSeconds);
    }
    if (res.status === 400) throw new ChatError("bad_request");
    throw new ChatError("upstream_error");
  }

  if (!res.body) throw new ChatError("upstream_error");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) onToken(chunk);
    }
  } catch {
    if (signal.aborted) throw new ChatError("aborted");
    throw new ChatError("upstream_error");
  }
}
