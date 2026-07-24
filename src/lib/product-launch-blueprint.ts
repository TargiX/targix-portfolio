export const LAUNCH_BLUEPRINT_STEPS = [
  "product",
  "audience",
  "complexity",
  "integrations",
  "polish",
] as const;

export type LaunchBlueprintStep = (typeof LAUNCH_BLUEPRINT_STEPS)[number];

export type LaunchBlueprintAnswers = Record<LaunchBlueprintStep, string>;

export type LaunchBlueprint = {
  active: LaunchBlueprintStep;
  answers: LaunchBlueprintAnswers;
};

export type LaunchBlueprintCaseStudy = {
  slug: "broker-online-exchange" | "signalops" | "phosphene" | "roomboard";
  title: string;
  reason: string;
};

export type LaunchBlueprintSearchParams = Record<string, string | string[] | undefined>;

const LAUNCH_BLUEPRINT_PARAM_NAMES = [...LAUNCH_BLUEPRINT_STEPS, "step"] as const;

const LAUNCH_BLUEPRINT_CHOICES: Record<LaunchBlueprintStep, readonly string[]> = {
  product: ["saas", "internal", "ai", "market"],
  audience: ["founder", "operator", "consumer", "enterprise"],
  complexity: ["onboarding", "branching", "uploads", "dashboard"],
  integrations: ["crm", "linear", "analytics", "auth"],
  polish: ["prototype", "product", "investor", "production"],
};

export const LAUNCH_BLUEPRINT_DEFAULTS: LaunchBlueprint = {
  active: "product",
  answers: {
    product: "ai",
    audience: "operator",
    complexity: "branching",
    integrations: "linear",
    polish: "investor",
  },
};

const CASE_STUDY_BY_PRODUCT: Record<string, LaunchBlueprintCaseStudy> = {
  saas: {
    slug: "broker-online-exchange",
    title: "Broker Online Exchange",
    reason: "a real B2B platform with onboarding, workflow depth, and delivery trade-offs",
  },
  internal: {
    slug: "signalops",
    title: "SignalOps",
    reason: "a real operator cockpit built around dense controls, incident context, and decisions",
  },
  ai: {
    slug: "phosphene",
    title: "Phosphene",
    reason: "a real AI workflow that makes generation states and human review legible",
  },
  market: {
    slug: "roomboard",
    title: "Roomboard",
    reason: "a real collaborative product where trust, feedback, and conversion need to stay clear",
  },
};

function readSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function isLaunchBlueprintStep(value: string | undefined): value is LaunchBlueprintStep {
  return value !== undefined && LAUNCH_BLUEPRINT_STEPS.includes(value as LaunchBlueprintStep);
}

function isChoiceForStep(step: LaunchBlueprintStep, value: string | undefined): value is string {
  return value !== undefined && LAUNCH_BLUEPRINT_CHOICES[step].includes(value);
}

export function decodeLaunchBlueprint(searchParams: LaunchBlueprintSearchParams): LaunchBlueprint {
  const answers = {} as LaunchBlueprintAnswers;

  for (const step of LAUNCH_BLUEPRINT_STEPS) {
    const candidate = readSingleValue(searchParams[step]);
    answers[step] = isChoiceForStep(step, candidate)
      ? candidate
      : LAUNCH_BLUEPRINT_DEFAULTS.answers[step];
  }

  const activeCandidate = readSingleValue(searchParams.step);

  return {
    active: isLaunchBlueprintStep(activeCandidate) ? activeCandidate : LAUNCH_BLUEPRINT_DEFAULTS.active,
    answers,
  };
}

export function isDefaultLaunchBlueprint(blueprint: LaunchBlueprint) {
  return (
    blueprint.active === LAUNCH_BLUEPRINT_DEFAULTS.active &&
    LAUNCH_BLUEPRINT_STEPS.every(
      (step) => blueprint.answers[step] === LAUNCH_BLUEPRINT_DEFAULTS.answers[step],
    )
  );
}

export function getLaunchBlueprintCaseStudy(
  answers: LaunchBlueprintAnswers,
): LaunchBlueprintCaseStudy {
  return CASE_STUDY_BY_PRODUCT[answers.product] ?? CASE_STUDY_BY_PRODUCT.ai;
}

export function getLaunchBlueprintPath(blueprint: LaunchBlueprint) {
  if (isDefaultLaunchBlueprint(blueprint)) {
    return "/lab/product-launch";
  }

  const query = new URLSearchParams();

  for (const step of LAUNCH_BLUEPRINT_STEPS) {
    query.set(step, blueprint.answers[step]);
  }

  query.set("step", blueprint.active);

  return `/lab/product-launch?${query.toString()}`;
}

export function getLaunchBlueprintTrackingSearch(searchParams: URLSearchParams | string) {
  const query = new URLSearchParams(searchParams);

  for (const name of LAUNCH_BLUEPRINT_PARAM_NAMES) {
    query.delete(name);
  }

  return query.toString();
}

export function getLaunchBlueprintHistoryPath(
  blueprint: LaunchBlueprint,
  existingSearchParams: URLSearchParams | string,
  hash = "",
) {
  const query = new URLSearchParams(getLaunchBlueprintTrackingSearch(existingSearchParams));

  if (!isDefaultLaunchBlueprint(blueprint)) {
    for (const step of LAUNCH_BLUEPRINT_STEPS) {
      query.set(step, blueprint.answers[step]);
    }

    query.set("step", blueprint.active);
  }

  return `/lab/product-launch${query.size ? `?${query.toString()}` : ""}${hash}`;
}
