// D-213 / S154 H6 — docs/templates/batch-tools/prod-smoke.mjs run for real against a 127.0.0.1 fixture
// (ephemeral port, never :3000): target selection, the HTML checks, and the canonical check (H5 Rule D LOW-2).
// Units come from a temp SMOKE_REPO, so this checkout's data is not read and no network is used.
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.join(__dirname, "../../../../docs/templates/batch-tools/prod-smoke.mjs");
const UNIT = "strategy-01-01-u01";
const TITLES = { ja: "企業活動", zh: "企业活动", en: "Corporate activities" } as const;
type Loc = keyof typeof TITLES;

let tmp = "";
let server: http.Server | null = null;
afterEach(async () => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = "";
  if (server) await new Promise((r) => server!.close(r));
  server = null;
});

function repo(): string {
  tmp = mkdtempSync(path.join(os.tmpdir(), "prod-smoke-"));
  mkdirSync(path.join(tmp, "data/ip/textbook/units"), { recursive: true });
  writeFileSync(
    path.join(tmp, "data/ip/textbook/units", `${UNIT}.json`),
    JSON.stringify({ title_jp: TITLES.ja, title_zh: TITLES.zh, title_en: TITLES.en }),
  );
  return tmp + "/";
}

type Page = (loc: Loc, url: string) => { status?: number; html: string };
const page =
  (canonical: (loc: Loc) => string | null, body = "本文"): Page =>
  (loc) => {
    const c = canonical(loc);
    return {
      html:
        `<!doctype html><html><head><title>${TITLES[loc]}</title>` +
        (c === null ? "" : `<link rel="canonical" href="${c}"/>`) +
        `</head><body><main><h1>${TITLES[loc]}</h1><p>${body}</p></main></body></html>`,
    };
  };
const good = page((l) => `https://itlearn.bojiangz.com/${l}/textbook/${UNIT}`);

async function serve(p: Page): Promise<string> {
  server = http.createServer((req, res) => {
    const m = req.url!.match(/^\/(ja|zh|en)\/textbook\/([^/?]+)$/);
    if (!m || m[2] !== UNIT) {
      res.writeHead(404).end("nf");
      return;
    }
    const r = p(m[1] as Loc, req.url!);
    res.writeHead(r.status ?? 200, { "content-type": "text/html; charset=utf-8" }).end(r.html);
  });
  await new Promise<void>((r) => server!.listen(0, "127.0.0.1", r));
  return `http://127.0.0.1:${(server!.address() as AddressInfo).port}`;
}

function smoke(args: string[], env: Record<string, string> = {}): Promise<{ code: number; out: string }> {
  return new Promise((resolve) => {
    const childEnv: Record<string, string> = { PATH: process.env.PATH ?? "", SMOKE_REPO: repo(), ...env };
    const c = spawn(process.execPath, [SCRIPT, ...args], { env: childEnv as unknown as NodeJS.ProcessEnv });
    let out = "";
    c.stdout.on("data", (d) => (out += d));
    c.stderr.on("data", (d) => (out += d));
    c.on("close", (code) => resolve({ code: code ?? -1, out }));
  });
}

describe("prod-smoke.mjs", () => {
  it("passes 3/3 on a good static page and checks the canonical on a non-Vercel target", async () => {
    const base = await serve(good);
    const r = await smoke([UNIT, "--target", base]);
    expect(r.out).toContain("(canonical checked)");
    expect(r.out).toContain("smoke 3/3");
    expect(r.code).toBe(0);
  });

  it("takes the target from SMOKE_TARGET too", async () => {
    const base = await serve(good);
    const r = await smoke([UNIT], { SMOKE_TARGET: base });
    expect(r.out).toContain(`target ${base}`);
    expect(r.code).toBe(0);
  });

  it("fails on a trailing-slash, wrong-host, wrong-locale or missing canonical", async () => {
    const bad: Record<Loc, string | null> = {
      ja: `https://itlearn.bojiangz.com/ja/textbook/${UNIT}/`,
      zh: `https://web-mu-sandy-78.vercel.app/zh/textbook/${UNIT}`,
      en: null,
    };
    const base = await serve(page((l) => bad[l]));
    const r = await smoke([UNIT, "--target", base]);
    expect(r.out).toMatch(/✗ \S+ ja 200 canonical https:\/\/itlearn\.bojiangz\.com\/ja\/textbook\/\S+\//);
    expect(r.out).toMatch(/✗ \S+ zh 200 canonical https:\/\/web-mu-sandy-78/);
    expect(r.out).toMatch(/✗ \S+ en 200 canonical missing/);
    expect(r.out).toContain("smoke 0/3");
    expect(r.code).toBe(1);
  });

  it("keeps the original checks: status, title, raw markup", async () => {
    const base = await serve((loc, url) =>
      loc === "ja" ? { status: 500, html: "x" } : loc === "zh" ? { html: "<main>no title</main>" } : good(loc, url),
    );
    const r1 = await smoke([UNIT, "--target", base]);
    expect(r1.out).toMatch(/✗ \S+ ja 500 status 500/);
    expect(r1.out).toMatch(/✗ \S+ zh 200 title missing/);
    expect(r1.out).toContain("smoke 1/3");
    expect(r1.code).toBe(1);
  });

  it("flags raw markup in <main>", async () => {
    const base = await serve(page((l) => `https://itlearn.bojiangz.com/${l}/textbook/${UNIT}`, "**太字** [[jp:x]]"));
    const r = await smoke([UNIT, "--target", base]);
    expect(r.out).toContain("raw markup");
    expect(r.code).toBe(1);
  });

  it("rejects an unknown target name and a missing unit list (exit 2, no request)", async () => {
    expect((await smoke([UNIT, "--target", "staging"])).code).toBe(2);
    expect((await smoke([])).code).toBe(2);
  });
});
