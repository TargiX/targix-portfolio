import assert from "node:assert/strict";
import test from "node:test";

import {
  decodeReviewRelay,
  getReviewRelayHistoryPath,
  getReviewRelayPath,
  REVIEW_RELAY_DEFAULTS,
} from "./review-relay.ts";

test("decodes a complete review relay shared link", () => {
  const relay = decodeReviewRelay({
    moment: "incident",
    owner: "engineering",
    proof: "risk",
    ready: "1",
  });

  assert.deepEqual(relay, {
    moment: "incident",
    owner: "engineering",
    proof: "risk",
    ready: true,
  });
  assert.equal(
    getReviewRelayPath(relay),
    "/lab/review-relay?moment=incident&owner=engineering&proof=risk&ready=1",
  );
});

test("normalizes malformed relay values to the safe starting state", () => {
  assert.deepEqual(decodeReviewRelay({}), REVIEW_RELAY_DEFAULTS);
  assert.deepEqual(
    decodeReviewRelay({
      moment: "invalid",
      owner: ["engineering", "client"],
      proof: "delivery",
      ready: "yes",
    }),
    { ...REVIEW_RELAY_DEFAULTS, proof: "delivery" },
  );
  assert.equal(getReviewRelayPath(REVIEW_RELAY_DEFAULTS), "/lab/review-relay");
});

test("keeps unrelated query state and hash while replacing relay state", () => {
  assert.equal(
    getReviewRelayHistoryPath(
      { moment: "handoff", owner: "client", proof: "delivery", ready: true },
      "utm_source=portfolio&owner=product&ready=1",
      "#relay",
    ),
    "/lab/review-relay?utm_source=portfolio&moment=handoff&owner=client&proof=delivery&ready=1#relay",
  );
  assert.equal(
    getReviewRelayHistoryPath(REVIEW_RELAY_DEFAULTS, "utm_source=portfolio", "#relay"),
    "/lab/review-relay?utm_source=portfolio#relay",
  );
});
