export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

/** error codes surfaced to the chat UI so it can show the right message */
export type ChatErrorCode =
  | "cloud_offline"
  | "rate_limited"
  | "upstream_error"
  | "bad_request"
  | "aborted"
  | "unknown";

export class ChatError extends Error {
  code: ChatErrorCode;
  retryAfterSeconds?: number;
  constructor(code: ChatErrorCode, retryAfterSeconds?: number) {
    super(code);
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
