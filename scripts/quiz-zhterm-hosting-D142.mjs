#!/usr/bin/env node
// Stage 6 / Quiz — S117 (D-142): hosting / housing の zh 訳語を corpus 横断で固定する。
//
// ══ 何が壊れていたか ══
// 大陸 IDC 業界の慣用では
//   主机托管 (= 服务器托管) = 利用者所有のサーバを事業者の機房に置く = **ハウジング (colocation)**
//   主机租用 (= 服务器租用) = 事業者所有のサーバを借りる            = **ホスティング**
// ところが Phase 1/2 の訳文の多数派は「ホスティング → 主机托管」で、軸が反転したまま出荷されていた。
// さらに S112 が 3 exam だけ「主机租用」に是正し、2013h25h では housing を「服务器托管」と訳したため、
// corpus には 3 系統が併存していた (S112〜S116 で 6 exam 連続 Rule A medium)。
// 同じ zh 語「主机托管」が 2012h24a-q100 では housing、2023r05-q047 では hosting を指す、
// という**同語異義**も実在した (本 script の対象一覧を参照)。
//
// ══ D-142 で固定した見出し語 ══
//   ホスティング → 主机租用（hosting）
//   ハウジング   → 机房托管（housing/colocation）
//   禁止語: 主机托管 / 服务器托管 (どちらの概念にも使わない。前者は大陸で colocation の意、後者も同義)
//   註: 「第三方托管（escrow）」「托管服务（escrow）」は別概念で対象外 (2017h29a-q004 / 2026r08-q028)。
//
// ══ 対象 ══
//   data/ip/quiz/translations/*.json  (zh フィールド)
//   data/ip/quiz/explanations/*.json  (zh フィールド。key_guard.note_jp は JP なので対象外)
//   data/ip/textbook/units/strategy-06-20-u03.json (教科書 unit、zh フィールド)
// jp/en は不変。置換は決定的で、before/after は evidence に全件 dump する (Rule D の reviewer 入力)。
//
// Run:  node scripts/quiz-zhterm-hosting-D142.mjs            (apply)
//       node scripts/quiz-zhterm-hosting-D142.mjs --dry-run  (report only)

import { readFileSync, writeFileSync, appendFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const EVID = path.join(ROOT, "evidence/quiz_zhterm_hosting_D142_S117.md");

// 2012h24a-q100 の stem は「ISP のハウジングサービス」= housing。bare 主机托管 の中で唯一 housing の意。
const HOUSING_SENSE_BARE = new Set(["2012h24a-q100"]);

// 順序に意味がある: 括弧付き gloss を先に処理し、残った bare 語を最後に処理する。
function fixZh(s, id) {
  let t = s;
  // 1) gloss 付き hosting
  t = t.replace(/主机托管(服务)?（hosting/g, "主机租用$1（hosting");
  t = t.replace(/(?<![主机房服务器])托管（hosting）/g, "主机租用（hosting）"); // 2019h31h-q052「托管（hosting）」
  // 2) gloss 付き housing の別表記
  t = t.replace(/服务器托管（housing/g, "机房托管（housing");
  t = t.replace(/housing（服务器托管）/g, "housing（机房托管）");
  // 3) bare 主机托管 — 2012h24a-q100 のみ housing、他はすべて hosting の意 (S117 で全 13 箇所を文脈確認)
  if (HOUSING_SENSE_BARE.has(id)) t = t.replace(/主机托管/g, "机房托管");
  else t = t.replace(/主机托管/g, "主机租用");
  t = t.replace(/服务器托管/g, "机房托管"); // bare 服务器托管 は常に housing の意 (S117 reviewer 指摘 #1: 禁止語 2 語に対し規則を対称に)
  return t;
}

const changes = []; // {file, id, path, before, after}
function walk(o, p, id, file, inheritZh = false) {
  if (o && typeof o === "object") {
    for (const k of Object.keys(o)) {
      const v = o[k];
      const isZh = inheritZh || k === "zh" || k.endsWith("_zh"); // 配列 (key_points_zh 等) は親の zh 判定を継承
      if (typeof v === "string") {
        if (!isZh) continue;
        const nv = fixZh(v, id);
        if (nv !== v) {
          changes.push({ file, id, path: p + "." + k, before: v, after: nv });
          o[k] = nv;
        }
      } else walk(v, p + "." + k, id, file, Array.isArray(v) && isZh);
    }
  }
}

function processQuizDir(dir) {
  const d = path.join(ROOT, "data/ip/quiz", dir);
  for (const f of readdirSync(d).filter((x) => x.endsWith(".json"))) {
    const fp = path.join(d, f);
    const doc = JSON.parse(readFileSync(fp, "utf-8"));
    const n0 = changes.length;
    for (const [id, q] of Object.entries(doc.questions)) walk(q, "", id, `${dir}/${f}`);
    if (changes.length > n0 && !DRY) writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");
  }
}
processQuizDir("translations");
processQuizDir("explanations");

// merge 入力層 (gitignored)。S115 の教訓「除去先は sidecar ではなく merge の入力」— sidecar だけ直すと
// 再 merge で旧語が復活するため、.phase1/tr_<id>.json と .phase2/expl_tr_<id>.json も同時に是正する。
// (--dry-run でも件数は報告する)
// 対象 id は sidecar の変更有無に依らず、入力ファイル全件を走査して決める (再実行しても冪等)。
const inputChanges0 = changes.length;
const TERM_RE = /主机托管|服务器托管|(?<![主机房服务器])托管（hosting）/;
// 対象: tr_<id> (phase1 merge 入力) / expl_tr_<id> (phase2 merge 入力) / input_<exam> (prep 出力 = generate の文脈。
// 再 prep せずに generate を回すと旧 zh 選択肢がモデルに渡り解説が旧語で再生成される — S117 reviewer 指摘)。
// ruleA_samples_* / sidecar_batch_* は Rule B の凍結監査記録なので触らない。
const INPUT_PREFIXES = ["tr_", "expl_tr_", "input_"];
for (const dir of ["data/ip/quiz/.phase1", "data/ip/quiz/.phase2"]) {
  const d = path.join(ROOT, dir);
  if (!existsSync(d)) { console.warn(`  ⚠ merge 入力 dir が無い: ${dir}`); continue; }
  for (const f of readdirSync(d)) {
    const prefix = INPUT_PREFIXES.find((p) => f.startsWith(p));
    if (!prefix || !f.endsWith(".json")) continue;
    const fp = path.join(d, f);
    const raw = readFileSync(fp, "utf-8");
    if (!TERM_RE.test(raw)) continue;
    // input_<exam>.json は複数問を含む → id は exam 名 (2012h24a-q100 の housing 特例は per-question 判定が必要)
    const id = f.slice(prefix.length, -".json".length);
    if (prefix === "input_") {
      const doc = JSON.parse(raw);
      const n0 = changes.length;
      const items = Array.isArray(doc) ? doc : (doc.questions ?? doc.items ?? doc.samples ?? []);
      for (const it of items) walk(it, "", it.id ?? id, `${dir}/${f}`);
      if (changes.length > n0 && !DRY) writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");
      continue;
    }
    const doc = JSON.parse(raw);
    const n0 = changes.length;
    walk(doc, "", id, `${dir}/${f}`);
    if (changes.length > n0 && !DRY) writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");
  }
}
const inputChanges = changes.length - inputChanges0;

// textbook unit (id は unit_id、bare 主机托管 は全て hosting の意)
{
  const fp = path.join(ROOT, "data/ip/textbook/units/strategy-06-20-u03.json");
  const doc = JSON.parse(readFileSync(fp, "utf-8"));
  const n0 = changes.length;
  walk(doc, "", "strategy-06-20-u03", "textbook/units/strategy-06-20-u03.json");
  if (changes.length > n0 && !DRY) writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");
}

// 禁止語の残存チェック — 出荷層 (translations / explanations / textbook units) + merge 入力層 (tr_/expl_tr_/input_)。
// dry-run でも実行する (disk の現状に対する検査。apply 前なら「これから消える分」が出る)。
const leftovers = [];
const BAN = /主机托管|服务器托管/;
const scanDir = (dir, filter) => {
  const d = path.join(ROOT, dir);
  if (!existsSync(d)) return;
  for (const f of readdirSync(d).filter((x) => x.endsWith(".json") && filter(x))) {
    if (BAN.test(readFileSync(path.join(d, f), "utf-8"))) leftovers.push(`${dir}/${f}`);
  }
};
scanDir("data/ip/quiz/translations", () => true);
scanDir("data/ip/quiz/explanations", () => true);
scanDir("data/ip/textbook/units", () => true);
scanDir("data/ip/quiz/.phase1", (f) => INPUT_PREFIXES.some((p) => f.startsWith(p)));
scanDir("data/ip/quiz/.phase2", (f) => INPUT_PREFIXES.some((p) => f.startsWith(p)));

// evidence dump
const byId = new Map();
for (const c of changes) byId.set(c.id, (byId.get(c.id) || 0) + 1);
const md = [
  `# D-142 hosting/housing zh 訳語 横断正規化 — 全件 before/after (S117)`,
  ``,
  `- 実行: \`node scripts/quiz-zhterm-hosting-D142.mjs\`${DRY ? " --dry-run" : ""}`,
  `- 変更フィールド数: **${changes.length}** / 対象 ID 数: **${byId.size}**`,
  `- 見出し語: ホスティング → 主机租用（hosting） / ハウジング → 机房托管（housing/colocation）`,
  `- jp / en フィールドは不変。key_guard.note_jp は対象外。`,
  `- うち merge 入力層 (.phase1/tr_ + .phase2/expl_tr_、gitignored) の変更: **${inputChanges}** フィールド (再 merge で復活させないため同時是正)`,
  ``,
  `| id | 件数 |`, `|---|---|`,
  ...[...byId.entries()].sort().map(([id, n]) => `| ${id} | ${n} |`),
  ``,
  `## 全件`,
  ``,
  ...changes.flatMap((c) => [
    `### ${c.id} \`${c.path}\` (${c.file})`,
    ``,
    `- before: ${c.before.replace(/\n/g, " ⏎ ")}`,
    `- after : ${c.after.replace(/\n/g, " ⏎ ")}`,
    ``,
  ]),
];
if (!DRY && changes.length) {
  // 追記モード (S117 Rule B: 再実行で先行 run の原記録を上書きした事故の再発防止)
  mkdirSync(path.dirname(EVID), { recursive: true });
  const body = md.join("\n") + "\n";
  if (existsSync(EVID)) appendFileSync(EVID, `\n\n---\n\n## 追記 run (${new Date().toISOString()})\n\n` + body.split("\n").slice(1).join("\n"));
  else writeFileSync(EVID, body);
}

console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-zhterm-hosting-D142: ${changes.length} fields / ${byId.size} ids (うち merge 入力層 ${inputChanges})`);
for (const [id, n] of [...byId.entries()].sort()) console.log(`  ${id.padEnd(20)} ${n}`);
if (leftovers.length) {
  console.error(`${DRY ? "(dry-run) " : "✗ "}禁止語 (主机托管/服务器托管) が残存 (${leftovers.length} files): ${leftovers.slice(0, 12).join(", ")}${leftovers.length > 12 ? " …" : ""}`);
  if (!DRY) process.exit(1);
}
if (!DRY) console.log(`  evidence: ${path.relative(ROOT, EVID)}`);
