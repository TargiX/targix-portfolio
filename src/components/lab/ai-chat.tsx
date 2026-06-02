"use client";

import { useEffect, useRef, useState } from "react";
import { cloudAvailable, streamCloud } from "@/lib/llm/cloud";
import { ChatError, type ChatMessage } from "@/lib/llm/types";

const EXAMPLES = [
  "What's Ilya's stack?",
  "Explain how this chat streams tokens.",
  "Write a haiku about glass cubes.",
];

type CloudState = "checking" | "online" | "offline";
type UiChatMessage = ChatMessage & { id: string };

const toChatMessages = (messages: UiChatMessage[]): ChatMessage[] =>
  messages.map(({ role, content }) => ({ role, content }));

export function AiChat() {
  const [cloud, setCloud] = useState<CloudState>("checking");
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    cloudAvailable().then((ok) => alive && setCloud(ok ? "online" : "offline"));
    return () => {
      alive = false;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const errorText = (code: string, retry?: number) => {
    switch (code) {
      case "cloud_offline":
        return "cloud model isn't configured on this deploy (no API key).";
      case "rate_limited":
        return `slow down a sec${retry ? ` — try again in ${retry}s` : ""}.`;
      case "upstream_error":
        return "the model provider hiccuped. try again.";
      default:
        return "something went wrong. try again.";
    }
  };

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy || cloud !== "online") return;

    setError(null);
    const idBase = crypto.randomUUID();
    const next: UiChatMessage[] = [...messages, { id: `${idBase}:user`, role: "user", content }];
    // optimistic: user message + empty assistant slot we stream into
    setMessages([...next, { id: `${idBase}:assistant`, role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await streamCloud(
        toChatMessages(next),
        (token) => {
          setMessages((prev) => {
            const copy = prev.slice();
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") copy[copy.length - 1] = { ...last, content: last.content + token };
            return copy;
          });
        },
        ctrl.signal,
      );
    } catch (err) {
      const code = err instanceof ChatError ? err.code : "unknown";
      if (code === "aborted") {
        // keep whatever streamed so far
      } else {
        if (code === "cloud_offline") setCloud("offline");
        setError(errorText(code, err instanceof ChatError ? err.retryAfterSeconds : undefined));
        // drop the empty assistant slot if nothing streamed
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return last?.role === "assistant" && last.content === "" ? prev.slice(0, -1) : prev;
        });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg-2/40">
      {/* chrome */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 font-mono text-[11px] lowercase tracking-[0.06em]">
        <span className="flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-fg">
          <span
            className={`size-1.5 rounded-full ${
              cloud === "online" ? "bg-[var(--accent)]" : cloud === "offline" ? "bg-fg-dim" : "bg-fg-muted"
            }`}
          />
          cloud · openrouter
        </span>
        <span className="rounded-full border border-dashed border-line px-2 py-0.5 text-fg-dim">
          local · webllm — soon
        </span>
        <span className="ml-auto text-fg-dim">
          {cloud === "checking" ? "…" : cloud === "online" ? "streaming" : "offline"}
        </span>
      </div>

      {/* transcript */}
      <div ref={scrollRef} className="h-[320px] space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-start justify-center gap-3">
            <p className="max-w-[44ch] text-sm text-fg-muted">
              A provider-agnostic chat. Right now it streams from a free OpenRouter model through a
              server proxy — local in-browser inference is the next drop.
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  disabled={cloud !== "online"}
                  onClick={() => send(ex)}
                  className="rounded-full border border-line px-3 py-1 text-[11px] text-fg-muted transition-colors hover:border-[var(--accent)] hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[var(--accent)]/15 text-fg"
                  : "border border-line bg-bg text-fg-muted"
              }`}
            >
              {m.content || (busy && i === messages.length - 1 ? <Cursor /> : null)}
            </div>
          </div>
        ))}
      </div>

      {/* error */}
      {error && (
        <div className="border-t border-line px-4 py-2 font-mono text-[11px] text-[oklch(0.7_0.17_25)]">
          {error}
        </div>
      )}

      {/* composer */}
      <div className="flex items-end gap-2 border-t border-line px-3 py-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder={cloud === "offline" ? "cloud model offline on this deploy" : "ask anything…"}
          disabled={cloud !== "online"}
          className="max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-[var(--accent)]/60 disabled:opacity-50"
        />
        {busy ? (
          <button
            type="button"
            onClick={stop}
            className="rounded-lg border border-line px-3 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            stop
          </button>
        ) : (
          <button
            type="button"
            onClick={() => send(input)}
            disabled={cloud !== "online" || !input.trim()}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[oklch(0.18_0.02_250)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            send
          </button>
        )}
      </div>
    </div>
  );
}

function Cursor() {
  return <span className="inline-block h-4 w-1.5 animate-pulse bg-fg-muted align-middle" />;
}

export default AiChat;
