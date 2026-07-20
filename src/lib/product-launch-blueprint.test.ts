import assert from "node:assert/strict";
import test from "node:test";

import {
  LAUNCH_BLUEPRINT_DEFAULTS,
  decodeLaunchBlueprint,
  getLaunchBlueprintHistoryPath,
  getLaunchBlueprintPath,
  getLaunchBlueprintTrackingSearch,
} from "./product-launch-blueprint.ts";

test("decodes a complete shared launch blueprint", () => {
  const blueprint = decodeLaunchBlueprint({
    product: "market",
    audience: "enterprise",
    complexity: "dashboard",
    integrations: "auth",
    polish: "production",
    step: "polish",
  });

  assert.deepEqual(blueprint, {
    active: "polish",
    answers: {
      product: "market",
      audience: "enterprise",
      complexity: "dashboard",
      integrations: "auth",
      polish: "production",
    },
  });
  assert.equal(
    getLaunchBlueprintPath(blueprint),
    "/lab/product-launch?product=market&audience=enterprise&complexity=dashboard&integrations=auth&polish=production&step=polish",
  );
});

test("returns canonical defaults for absent, malformed, or unknown values", () => {
  assert.deepEqual(decodeLaunchBlueprint({}), LAUNCH_BLUEPRINT_DEFAULTS);
  assert.deepEqual(
    decodeLaunchBlueprint({
      product: "unknown",
      audience: ["enterprise", "operator"],
      complexity: "dashboard",
      integrations: "not-real",
      polish: "production",
      step: "nope",
    }),
    {
      active: "product",
      answers: {
        product: "ai",
        audience: "operator",
        complexity: "dashboard",
        integrations: "linear",
        polish: "production",
      },
    },
  );
  assert.equal(getLaunchBlueprintPath(LAUNCH_BLUEPRINT_DEFAULTS), "/lab/product-launch");
});

test("keeps unrelated query state and the hash while replacing blueprint state", () => {
  const blueprint = decodeLaunchBlueprint({
    product: "market",
    audience: "enterprise",
    complexity: "dashboard",
    integrations: "auth",
    polish: "production",
    step: "polish",
  });

  assert.equal(
    getLaunchBlueprintHistoryPath(
      blueprint,
      "utm_source=portfolio&preview=founder&product=old&step=product",
      "#handoff",
    ),
    "/lab/product-launch?utm_source=portfolio&preview=founder&product=market&audience=enterprise&complexity=dashboard&integrations=auth&polish=production&step=polish#handoff",
  );
  assert.equal(
    getLaunchBlueprintHistoryPath(LAUNCH_BLUEPRINT_DEFAULTS, "utm_source=portfolio", "#handoff"),
    "/lab/product-launch?utm_source=portfolio#handoff",
  );
  assert.equal(
    getLaunchBlueprintTrackingSearch("utm_source=portfolio&product=market&step=polish"),
    "utm_source=portfolio",
  );
});
