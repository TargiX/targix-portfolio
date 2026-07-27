export type ReviewMoment = "launch" | "incident" | "handoff";
export type DecisionOwner = "product" | "engineering" | "client";
export type ProofFocus = "behavior" | "risk" | "delivery";

export type ReviewRelayInput = {
  moment: ReviewMoment;
  owner: DecisionOwner;
  proof: ProofFocus;
  ready: boolean;
};

export const REVIEW_RELAY_DEFAULTS: ReviewRelayInput = {
  moment: "launch",
  owner: "product",
  proof: "behavior",
  ready: false,
};

const MOMENTS = new Set<ReviewMoment>(["launch", "incident", "handoff"]);
const OWNERS = new Set<DecisionOwner>(["product", "engineering", "client"]);
const PROOF_FOCUSES = new Set<ProofFocus>(["behavior", "risk", "delivery"]);

export function decodeReviewRelay(
  params: Record<string, string | string[] | undefined>,
): ReviewRelayInput {
  return {
    moment: isMoment(params.moment) ? params.moment : REVIEW_RELAY_DEFAULTS.moment,
    owner: isOwner(params.owner) ? params.owner : REVIEW_RELAY_DEFAULTS.owner,
    proof: isProofFocus(params.proof) ? params.proof : REVIEW_RELAY_DEFAULTS.proof,
    ready: params.ready === "1",
  };
}

export function getReviewRelayPath(input: ReviewRelayInput) {
  const params = new URLSearchParams();

  if (input.moment !== REVIEW_RELAY_DEFAULTS.moment) params.set("moment", input.moment);
  if (input.owner !== REVIEW_RELAY_DEFAULTS.owner) params.set("owner", input.owner);
  if (input.proof !== REVIEW_RELAY_DEFAULTS.proof) params.set("proof", input.proof);
  if (input.ready) params.set("ready", "1");

  const query = params.toString();
  return `/lab/review-relay${query ? `?${query}` : ""}`;
}

export function getReviewRelayHistoryPath(input: ReviewRelayInput, search: string, hash: string) {
  const params = new URLSearchParams(search);
  params.delete("moment");
  params.delete("owner");
  params.delete("proof");
  params.delete("ready");

  const relaySearch = new URLSearchParams(getReviewRelayPath(input).split("?")[1] ?? "");
  relaySearch.forEach((value, key) => params.set(key, value));

  const query = params.toString();
  return `/lab/review-relay${query ? `?${query}` : ""}${hash}`;
}

function isMoment(value: string | string[] | undefined): value is ReviewMoment {
  return typeof value === "string" && MOMENTS.has(value as ReviewMoment);
}

function isOwner(value: string | string[] | undefined): value is DecisionOwner {
  return typeof value === "string" && OWNERS.has(value as DecisionOwner);
}

function isProofFocus(value: string | string[] | undefined): value is ProofFocus {
  return typeof value === "string" && PROOF_FOCUSES.has(value as ProofFocus);
}
