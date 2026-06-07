// Render cv/Ilya_Moskovkin_CV.html → public/Ilya_Moskovkin_CV.pdf
// Usage: node cv/build.mjs
// Uses the headless Chromium that Playwright already downloaded (no extra deps).

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const input = join(here, "Ilya_Moskovkin_CV.html");
const output = join(root, "public", "Ilya_Moskovkin_CV.pdf");

function findChrome() {
  const cache = join(homedir(), "Library", "Caches", "ms-playwright");
  if (!existsSync(cache)) return null;
  // newest build dir first
  const dirs = readdirSync(cache)
    .filter((d) => d.startsWith("chromium_headless_shell-") || d.startsWith("chromium-"))
    .sort()
    .reverse();
  const candidates = [
    (d) => join(cache, d, "chrome-headless-shell-mac-arm64", "chrome-headless-shell"),
    (d) => join(cache, d, "chrome-headless-shell-mac-x64", "chrome-headless-shell"),
    (d) => join(cache, d, "chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
    (d) => join(cache, d, "chrome-mac-x64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
  ];
  for (const d of dirs) {
    for (const c of candidates) {
      const p = c(d);
      if (existsSync(p)) return p;
    }
  }
  return null;
}

const chrome = findChrome();
if (!chrome) {
  console.error("Could not find a Playwright Chromium. Run `npx playwright install chromium` first.");
  process.exit(1);
}

execFileSync(
  chrome,
  [
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${output}`,
    `file://${input}`,
  ],
  { stdio: "inherit" },
);

console.log(`✓ Wrote ${output}`);
