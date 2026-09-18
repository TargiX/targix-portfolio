// Production smoke test: loads the built site in headless Chromium, runs the
// hero-canvas checks from scripts/checks/, and asserts the page structure the
// checks can't see (landmarks, nav, ribbon). Run after `pnpm build` with a
// server listening on BASE_URL (default http://127.0.0.1:3010).
//
//   pnpm build && pnpm start &   →   node scripts/smoke.mjs
//
// In CI the workflow does exactly that; locally any running instance works.

import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3010";

const CHECKS = [
  "scripts/checks/hero-canvas-budget.js",
  "scripts/checks/hero-canvas-edges.js",
];

const failures = [];
const consoleErrors = [];

function check(name, ok, detail = "") {
  if (ok) {
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto(BASE_URL, { waitUntil: "load", timeout: 30_000 });

  // The hero canvas mounts post-hydration via next/dynamic — wait for it,
  // then for actual painted pixels (the checks sample the drawing buffer).
  await page.waitForSelector("header canvas", { timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const source = document.querySelector("header canvas");
      if (!source) return false;
      const probe = document.createElement("canvas");
      probe.width = source.width;
      probe.height = source.height;
      const ctx = probe.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(source, 0, 0);
      const data = ctx.getImageData(0, 0, probe.width, probe.height).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true;
      }
      return false;
    },
    { timeout: 15_000, polling: 250 },
  );

  console.log("structure:");
  check(
    "main landmark wraps page content",
    await page.evaluate(() => {
      const main = document.querySelector("main#main");
      return !!main && main.contains(document.querySelector("#work"));
    }),
  );
  check(
    "skip-to-content link targets #main",
    await page.evaluate(
      () => document.querySelector('a[href="#main"]') !== null,
    ),
  );
  check(
    "nav links to /lab",
    await page.evaluate(
      () => document.querySelector('nav a[href="/lab"]') !== null,
    ),
  );
  check(
    "more-work ribbon shows 5 projects",
    (await page.locator(".ribbon-track .ribbon-item").count()) === 5,
  );
  check(
    "no horizontal overflow at 1440px",
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  );

  console.log("hero canvas checks:");
  for (const file of CHECKS) {
    const source = await readFile(file, "utf8");
    try {
      const result = await page.evaluate(source);
      check(file.split("/").pop(), true, JSON.stringify(result));
    } catch (error) {
      check(file.split("/").pop(), false, String(error).split("\n")[0]);
    }
  }

  check(
    "no console errors",
    consoleErrors.length === 0,
    consoleErrors.slice(0, 3).join(" | "),
  );
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`\nsmoke: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\nsmoke: all checks passed");
