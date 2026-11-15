// S158 D-182 real-key check against the LOCAL static stand-in (:3150, real CSP from out/_headers).
// Reads the test key from ~/.config/itp-sensei/anthropic_key; scrubs it from every printed line.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { createRequire } from "node:module";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const KEY = fs.readFileSync(path.join(os.homedir(), ".config/itp-sensei/anthropic_key"), "utf8").trim();
const out = (s) => console.log(String(s).split(KEY).join("[KEY]"));
const STOP = JSON.parse(fs.readFileSync("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/messages/ja.json","utf8")).Sensei.stop;
const BASE = "http://127.0.0.1:3150";
const browser = await chromium.launch();
const results = [];
for (const c of [
  { name: "free /ja/sensei", url: "/ja/sensei", q: "ファイアウォールとIDSとIPSの違いを教えてください", free: true },
  { name: "term panel", url: null, q: "この内容を説明してください", free: false },
]) {
  const ctx = await browser.newContext({ locale: "ja-JP" });
  await ctx.addInitScript((v) => {
    localStorage.setItem("itp:sensei:key:v1", v);
    window.__csp = []; document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(`${e.effectiveDirective} ${e.blockedURI}`));
  }, JSON.stringify({ provider: "anthropic", apiKey: KEY, savedAt: new Date().toISOString() }));
  const page = await ctx.newPage();
  const errs = []; page.on("console", (m) => { if (m.type() === "error" || /Content Security Policy|unsafe-eval/i.test(m.text())) errs.push(m.text()); });
  let posts = 0, status = []; page.on("response", (r) => { if (r.url().startsWith("https://api.anthropic.com/")) { posts++; status.push(r.status()); } });
  let url = c.url;
  if (!url) {
    const m = fs.readFileSync("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/out/ja/glossary.html", "utf8").match(/href="(\/ja\/glossary\/t[0-9a-f]{16})"/); url = m[1]; }
  await page.goto(BASE + url); await page.waitForLoadState("networkidle");
  const t0 = Date.now();
  if (c.free) { await page.getByLabel("AI 先生への自由な質問", { exact: true }).fill(c.q); await page.getByTestId("sensei-free-send").click(); }
  else { await page.getByTestId("ask-sensei").click(); const p = page.getByRole("dialog"); await p.getByLabel("AI 先生への質問", { exact: true }).fill(c.q); await p.getByRole("button", { name: "送信", exact: true }).click(); }
  const log = page.getByRole("dialog").getByTestId("sensei-log");
  let ok = true;
  try {
    await page.waitForResponse((r) => r.url().startsWith("https://api.anthropic.com/"), { timeout: 30000 });
    await page.getByRole("dialog").getByRole("button", { name: STOP, exact: true }).waitFor({ state: "detached", timeout: 120000 });
    await page.waitForTimeout(500);
  } catch (e) { ok = false; }
  const text = (await log.innerText().catch(() => "")).trim();
  const csp = await page.evaluate(() => window.__csp);
  results.push({ case: c.name, url, ok, ms: Date.now() - t0, anthropicResponses: posts, status, replyChars: text.length, replyHead: text.slice(0, 120).replace(/\s+/g, " "), replyTail: text.slice(-80).replace(/\s+/g, " "), csp, consoleErrors: errs.slice(0, 5) });
  await ctx.close();
}
await browser.close();
out(JSON.stringify(results, null, 1));
