// D-213: 本番の軽量確認。各単元 × ja/zh/en を 1 回ずつ GET (HTML のみ、JS/画像は取らない)。
//   node prod-smoke.mjs <units comma> [--target workers|prod|<https://…>]   (env SMOKE_TARGET でも可)
// 判定: HTTP 200 (転送は追わない = 30x は失敗、Rule D LOW-3) / 単元の title が HTML に含まれる / 生記法 (**, [[jp:) と "undefined" が本文に無い /
//       本文が空でない / <link rel="canonical"> = https://itlearn.bojiangz.com/<locale>/textbook/<unit> (どの対象でも同じ値。
//       静的版は末尾 / なし、S154 H5 Rule D LOW-2。workers.dev や任意の origin でも canonical は本番の host を指す)。
// 対象の既定 = 今 live の本番 = prod (S154 H7 で itlearn.bojiangz.com を Worker に切替済)。
// 2026-11-12 D-228: Vercel project を削除 (D-226 の戻し道は無い) → vercel 対象と、canonical を見ない Vercel 例外を削除。
// 単体で完結させる (README の手順で scratchpad に複製して使うため、相対 import をしない)。
import fs from 'node:fs';
import { parseArgs } from 'node:util';
const TARGETS = {
  workers: 'https://itlearn.bojiang.workers.dev',
  prod: 'https://itlearn.bojiangz.com',
};
const DEFAULT_TARGET = 'prod';
const CANONICAL_ORIGIN = 'https://itlearn.bojiangz.com';
const R = process.env.SMOKE_REPO ?? '/Volumes/DevSSD/Project/IT-Passport-Learning/';
const usage = () => {
  console.error(`usage: node prod-smoke.mjs <units comma> [--target ${Object.keys(TARGETS).join('|')}|<origin>]`);
  process.exit(2);
};

// --target x / --target=x、位置は units の前後どちらでも。未知の -- flag は exit 2 (S154 H6 Rule D LOW-2)
let parsed;
try { parsed = parseArgs({ options: { target: { type: 'string' } }, allowPositionals: true, strict: true }); } catch { usage(); }
const args = parsed.positionals;
const target = parsed.values.target ?? process.env.SMOKE_TARGET ?? DEFAULT_TARGET;
const BASE = (Object.hasOwn(TARGETS, target) ? TARGETS[target] : (/^https?:\/\/[^/]+$/.test(target) ? target : null));
if (args.length !== 1 || !BASE) usage();
console.log(`target ${BASE} (canonical checked)`);

const loc = { ja: 'jp', zh: 'zh', en: 'en' }; let bad = 0, n = 0;
const dec = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const canonicalOf = h => {
  const tag = (h.match(/<link\b[^>]*\brel="canonical"[^>]*>/) || [''])[0];
  return (tag.match(/\bhref="([^"]*)"/) || [])[1];
};
for (const U of args[0].split(',')) {
  const u = JSON.parse(fs.readFileSync(R + `data/ip/textbook/units/${U}.json`, 'utf8'));
  for (const [l, k] of Object.entries(loc)) {
    n++; const r = await fetch(`${BASE}/${l}/textbook/${U}`, { redirect: 'manual' }); const h = dec(await r.text());
    const main = (h.match(/<main[\s\S]*?<\/main>/) || [''])[0].replace(/<[^>]+>/g, ' ');
    const title = u[`title_${k}`]; const errs = [];
    if (r.status !== 200) errs.push('status ' + r.status);
    if (!title || !h.includes(title)) errs.push('title missing');
    if (/\*\*|\[\[jp:|undefined/.test(main)) errs.push('raw markup');
    if (!main.trim()) errs.push('empty main');
    const want = `${CANONICAL_ORIGIN}/${l}/textbook/${U}`, got = canonicalOf(h);
    if (got !== want) errs.push(`canonical ${got ?? 'missing'}`);
    console.log(errs.length ? '✗' : '✓', U, l, r.status, errs.join(', ')); if (errs.length) bad++;
  }
}
console.log(`smoke ${n - bad}/${n}`); process.exit(bad ? 1 : 0);
