// Production smoke test: loads the built site in headless Chromium, runs the
// hero-canvas checks from scripts/checks/, and asserts the page structure the
// checks can't see (landmarks, nav, ribbon). Run after `pnpm build` with a
// server listening on BASE_URL (default http://127.0.0.1:3010).
//
//   pnpm build && pnpm start &   →   node scripts/smoke.mjs
//
// In CI the workflow does exactly that; locally any running instance works.

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3010";
const SITE_URL = "https://ilyamoskovkin.com";

const CHECKS = [
  "scripts/checks/hero-canvas-budget.js",
  "scripts/checks/hero-canvas-edges.js",
];

const failures = [];
const consoleErrors = [];

/** Case slugs derived the same way the app derives them (frontmatter slug ?? filename). */
async function getCaseSlugs() {
  const dir = path.join(process.cwd(), "content/work");
  const entries = await readdir(dir);
  const slugs = await Promise.all(
    entries
      .filter((f) => f.endsWith(".mdx"))
      .map(async (filename) => {
        const { data } = matter(await readFile(path.join(dir, filename), "utf8"));
        return (typeof data.slug === "string" && data.slug) || filename.replace(/\.mdx$/, "");
      }),
  );
  return slugs.sort();
}

function check(name, ok, detail = "") {
  if (ok) {
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Decode the five XML named entities plus numeric character references, single pass. */
function decodeXmlEntities(text) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
  return text.replace(/&(amp|lt|gt|quot|apos|#x?[0-9a-fA-F]+);/g, (entity, code) => {
    if (code in named) return named[code];
    const point = code.startsWith("#x")
      ? parseInt(code.slice(2), 16)
      : parseInt(code.slice(1), 10);
    return Number.isInteger(point) && point >= 0 && point <= 0x10_ffff
      ? String.fromCodePoint(point)
      : entity;
  });
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

  // ---- case study pages ----
  const slugs = await getCaseSlugs();
  console.log("case studies:");
  for (const slug of slugs) {
    const pageErrors = [];
    const casePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    casePage.on("console", (msg) => {
      if (msg.type() === "error") pageErrors.push(msg.text());
    });
    casePage.on("pageerror", (err) => pageErrors.push(String(err)));
    try {
      const response = await casePage.goto(`${BASE_URL}/work/${slug}`, {
        waitUntil: "load",
        timeout: 30_000,
      });
      check(
        `/work/${slug} returns 200`,
        response?.status() === 200,
        `status=${response?.status()}`,
      );
      check(
        `/work/${slug} renders an h1`,
        (await casePage.locator("h1").first().textContent().catch(() => ""))?.trim() !== "",
      );
      check(`/work/${slug} has no console errors`, pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
    } finally {
      await casePage.close();
    }

    const caseLlms = await fetch(`${BASE_URL}/work/${slug}/llms.txt`);
    const caseLlmsBody = await caseLlms.text();
    check(
      `/work/${slug}/llms.txt returns 200 with canonical URL`,
      caseLlms.status === 200 && caseLlmsBody.includes(`https://ilyamoskovkin.com/work/${slug}`),
      `status=${caseLlms.status}`,
    );
  }

  // ---- SEO / machine routes ----
  console.log("seo routes:");
  const sitemap = await fetch(`${BASE_URL}/sitemap.xml`);
  const sitemapBody = await sitemap.text();
  check(
    "/sitemap.xml returns urlset",
    sitemap.status === 200 && sitemapBody.includes("<urlset"),
    `status=${sitemap.status}`,
  );
  const sitemapUrls = [...sitemapBody.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) =>
    decodeXmlEntities(m[1]),
  );
  const missingFromSitemap = slugs.filter(
    (slug) => !sitemapUrls.includes(`${SITE_URL}/work/${slug}`),
  );
  check(
    "sitemap lists every case study",
    missingFromSitemap.length === 0,
    `missing: ${missingFromSitemap.join(", ")}`,
  );

  const robots = await fetch(`${BASE_URL}/robots.txt`);
  const robotsBody = await robots.text();
  const sitemapDirective = robotsBody.match(/^sitemap:\s*(\S+)\s*$/im)?.[1];
  check(
    "/robots.txt references the sitemap",
    robots.status === 200 && sitemapDirective === `${SITE_URL}/sitemap.xml`,
    `status=${robots.status}, sitemap=${sitemapDirective ?? "none"}`,
  );

  const llms = await fetch(`${BASE_URL}/llms.txt`);
  const llmsBody = await llms.text();
  check(
    "/llms.txt returns an index",
    llms.status === 200 && llmsBody.includes("## Case study index"),
    `status=${llms.status}`,
  );
  const llmsUrls = [
    ...llmsBody.matchAll(/https:\/\/ilyamoskovkin\.com\/work\/[^\s)]+/g),
  ].map((m) => m[0].replace(/[.,;]+$/, ""));
  const missingFromLlms = slugs.filter(
    (slug) => !llmsUrls.includes(`${SITE_URL}/work/${slug}`),
  );
  check(
    "llms.txt lists every case study",
    missingFromLlms.length === 0,
    `missing: ${missingFromLlms.join(", ")}`,
  );

  const missingPage = await browser.newPage();
  const missingResponse = await missingPage.goto(`${BASE_URL}/work/definitely-not-a-case`, {
    waitUntil: "load",
    timeout: 30_000,
  });
  check(
    "unknown case slug returns 404",
    missingResponse?.status() === 404,
    `status=${missingResponse?.status()}`,
  );
  await missingPage.close();
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`\nsmoke: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\nsmoke: all checks passed");
