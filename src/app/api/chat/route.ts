import "server-only";

import { z } from "zod";

import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Free OpenRouter models are heavily (and unpredictably) rate-limited, so we
// try a list in order and stream the first one that's actually available.
// OPENROUTER_MODEL, if set, is tried first.
const MODELS = [
  ...(process.env.OPENROUTER_MODEL ? [process.env.OPENROUTER_MODEL] : []),
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-4-31b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
];

const SYSTEM_PROMPT =
  "You are the assistant embedded in the Lab section of Ilya Moskovkin's developer portfolio. " +
  "Ilya is a senior frontend engineer (Vue, React, Node, 8+ years), based in Vietnam and open to remote roles. " +
  "Answer concisely and helpfully. If asked how you work, explain you're a demo wired to a free OpenRouter model " +
  "through a server proxy, with an in-browser WebLLM option planned. Keep replies short and friendly.";

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

export async function GET() {
  return Response.json({ cloud: Boolean(process.env.OPENROUTER_API_KEY) });
}

export async function POST(req: Request) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return Response.json({ error: "cloud_offline" }, { status: 503 });
  }

  const rl = await checkRateLimit({ limit: 20, windowMs: 60_000, namespace: "chat" });
  if (!rl.ok) {
    return Response.json(
      { error: "rate_limited", retryAfterSeconds: rl.retryAfterSeconds },
      { status: 429 },
    );
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const outMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...parsed.messages];

  // try models in order; stream the first available one
  let upstream: Response | null = null;
  let lastStatus = 502;
  for (const model of MODELS) {
    let r: Response;
    try {
      r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL ?? "https://targix.dev",
          "X-Title": "Ilya Moskovkin Portfolio",
        },
        body: JSON.stringify({ model, stream: true, messages: outMessages }),
      });
    } catch {
      lastStatus = 502;
      continue;
    }
    if (r.ok && r.body) {
      upstream = r;
      break;
    }
    lastStatus = r.status;
    await r.body?.cancel().catch(() => {}); // free the connection before retrying
  }

  if (!upstream || !upstream.body) {
    const status = lastStatus === 429 ? 429 : 502;
    return Response.json({ error: lastStatus === 429 ? "rate_limited" : "upstream_error" }, { status });
  }

  // Transform OpenRouter's SSE into a plain UTF-8 token stream.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const token = json?.choices?.[0]?.delta?.content;
              if (typeof token === "string" && token) {
                controller.enqueue(encoder.encode(token));
              }
            } catch {
              // keep-alive comment or partial frame — ignore
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
