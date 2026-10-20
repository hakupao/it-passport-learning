#!/usr/bin/env node
// Stage 6 / Quiz — S128 A4 (D-141 / D-144): 未登録 15 組 + 部分登録 2 組の中問前文埋め込みの **前処理 + apply 模擬**。
//
// 前処理 (表示層 translations の stem_jp_clean / stem.zh / stem.en):
//   STRIP  2013h25a-q097 … 末尾の〔要望事項〕節 (行頭の最後の出現〜末尾) を除去 (完全前文に〔要望事項〕が含まれるため)
//          2013h25a-q099 … 先頭の〔要望事項〕節 (先頭〜最初の空行) を除去
//          2015h27a-q089 … 設問文の後ろに置かれた前文 + 図1 表 (OCR 誤りあり) を除去 → apply が検証済み前文を先頭に前置する
//   COPY   2012h24a-q098 の前文 (lightweight-D144s3 の COPY 表と同じ cut) → 2012h24a-q100 に前置
// 模擬: evidence/.../chumon_preamble_S128_a4_batch{1,2}.json を quiz-chumon-preamble-apply.mjs と同じ判定で前処理後の stem に当て、
//   設問ごとに prepend / skip を報告し、句読点・空白を除いた probe で二重埋め込み (結果 stem に probe が 2 回以上) を検査する。
// apply 用ファイル: data/ip/quiz/.phase2/a4_apply_*.json に組を分けて書き出す (2014h26h-mqA は B2 apply 後まで別ファイルに隔離)。
//
// Run: node scripts/quiz-chumon-a4-prep-S128.mjs            … dry-run (translations は書かない)
//      node scripts/quiz-chumon-a4-prep-S128.mjs --write    … 前処理を translations に書き込む (data lock 取得後のみ)
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const TR = path.join(ROOT, "data/ip/quiz/translations");
const EV = path.join(ROOT, "evidence/phase5/stage_06_quiz_fidelity");
const STAGE = path.join(ROOT, "data/ip/quiz/.phase2");
const bank = new Map(rj(path.join(ROOT, "data/ip/exams/question_bank.json")).questions.map((q) => [q.id, q]));
const LANGS = ["jp", "zh", "en"];
const nsp = (s) => s.replace(/\s+/g, "");
// 句読点・括弧・引用符・空白を落とした緩い正規形 (，/、/, や “/" の揺れで probe が外れて二重埋め込みになるのを検出する)
const loose = (s) => s.replace(/[\s，、,。．.・:：;；「」『』“”"'‘’（）()［］\[\]〔〕【】]/g, "");
const B2_BLOCKED = new Set(["2014h26h-mqA"]);

const docs = new Map();
const doc = (exam) => { if (!docs.has(exam)) docs.set(exam, rj(path.join(TR, `${exam}.json`))); return docs.get(exam); };
const get = (t, l) => (l === "jp" ? t.stem_jp_clean : t.stem[l]);
const set = (t, l, v) => { if (l === "jp") t.stem_jp_clean = v; else t.stem[l] = v; };
const lastLineStart = (text, m) => { let f = -1; for (let i = text.indexOf(m); i >= 0; i = text.indexOf(m, i + 1)) if (i === 0 || text[i - 1] === "\n") f = i; return f; };
const log = [];

// ── STRIP ──
const SECTION = { jp: "〔要望事項〕", zh: "〔需求事项〕", en: "[Requirements]" };
const STRIP = [
  { id: "2013h25a-q097", how: "tail-section" },
  { id: "2013h25a-q099", how: "head-section" },
  { id: "2015h27a-q089", how: "tail-from", marker: { jp: "ラーメンチェーン店の本部で働いている", zh: "在一家拉面连锁店总部工作的", en: "Mr. A, who works at the head office of a ramen" } },
];
for (const s of STRIP) {
  const t = doc(s.id.split("-q")[0]).questions[s.id];
  for (const l of LANGS) {
    const text = get(t, l);
    let out;
    if (s.how === "tail-section") {
      const i = lastLineStart(text, SECTION[l]); if (i <= 0) throw new Error(`${s.id} ${l}: 末尾の section が無い`);
      out = text.slice(0, i).trimEnd();
    } else if (s.how === "head-section") {
      if (!text.startsWith(SECTION[l])) throw new Error(`${s.id} ${l}: 先頭が section でない`);
      const i = text.indexOf("\n\n"); if (i < 0) throw new Error(`${s.id} ${l}: section 後の空行が無い`);
      out = text.slice(i).trimStart();
    } else {
      const i = text.indexOf(s.marker[l]); if (i <= 0) throw new Error(`${s.id} ${l}: marker が無い / 先頭にある`);
      out = text.slice(0, i).trimEnd();
    }
    if (out.length < 40) throw new Error(`${s.id} ${l}: 除去後が短すぎる (${out.length})`);
    log.push(`  ✂ ${s.id} ${l}: ${s.how} ${text.length} → ${out.length} 字 | 残: ${out.slice(0, 30).replace(/\n/g, "⏎")}…${out.slice(-20).replace(/\n/g, "⏎")}`);
    set(t, l, out);
  }
}

// ── COPY: 2012h24a-q098 → q100 (lightweight-D144s3 の COPY 表と同じ cut) ──
{
  const d = doc("2012h24a"), src = d.questions["2012h24a-q098"], t = d.questions["2012h24a-q100"];
  const CUT = { jp: "次に示す〔個人情報の適正管理に関する規程〕", zh: "对于下面所示〔关于个人信息妥善管理的规程〕", en: "For each clause of the following [Regulations" };
  if (!t.stem_jp_clean) { t.stem_jp_clean = bank.get("2012h24a-q100").stem_jp; log.push("  2012h24a-q100: clean 新設 (raw を種に)"); }
  const pre = {};
  for (const l of LANGS) { const s = get(src, l); const i = s.indexOf(CUT[l]); if (i < 0) throw new Error(`q098 ${l}: cut marker 無し`); pre[l] = s.slice(0, i).trimEnd(); }
  if (nsp(t.stem_jp_clean).includes(nsp(pre.jp).slice(0, 40))) log.push("  = 2012h24a-q100: 既に前文あり");
  else for (const l of LANGS) { set(t, l, `${pre[l]}\n\n${get(t, l).trimStart()}`); log.push(`  ⧉ 2012h24a-q100 ${l}: q098 の前文 ${pre[l].length} 字を前置`); }
}

// ── apply 模擬 (quiz-chumon-preamble-apply.mjs と同じ判定・同じ結合) ──
const CAT = /^(〔(ストラテジ|マネジメント|テクノロジ|战略|管理|技术)〕|\[(Strategy|Management|Technology)\]|問\s*\d+|问\s*\d+|Q\d+)/;
const stage = { now: [], b2: [] };
let prepend = 0, skip = 0, dup = 0, catHead = 0;
for (const b of ["batch1", "batch2"]) {
  const r = rj(path.join(EV, `chumon_preamble_S128_a4_${b}.json`)).result;
  for (const g of r.results) {
    if (g.verification?.verdict !== "PASS") throw new Error(`${g.key}: verdict ${g.verification?.verdict}`);
    (B2_BLOCKED.has(g.key) ? stage.b2 : stage.now).push(g);
    const d = doc(g.exam_id), probe = nsp(g.draft.preamble_jp).slice(0, 40);
    for (const id of g.member_ids) {
      const t = d.questions[id];
      const jp0 = t.stem_jp_clean || bank.get(id)?.stem_jp; if (!jp0) throw new Error(`${id}: stem 無し`);
      const hit = nsp(jp0).includes(probe);
      const after = {};
      for (const l of LANGS) {
        const cur = l === "jp" ? jp0 : t.stem[l];
        after[l] = hit ? cur : `${g.draft[`preamble_${l}`].trimEnd()}\n\n${cur.trimStart()}`;
        const lp = loose(g.draft[`preamble_${l}`]).slice(0, 40);
        const n = loose(after[l]).split(lp).length - 1;
        if (n !== 1) { dup++; log.push(`  ✗ ${id} ${l}: loose probe 出現 ${n} 回`); }
        if (!hit && CAT.test(cur.trimStart())) { catHead++; log.push(`  ! ${id} ${l}: 前置先の先頭が分野見出し/問番号 → normalize 対象`); }
      }
      if (hit) skip++; else prepend++;
      log.push(`  ${hit ? "=" : "+"} ${id} (${g.key}${B2_BLOCKED.has(g.key) ? ", B2 待ち" : ""}): ${hit ? "skip (既に前文あり)" : `prepend jp ${g.draft.preamble_jp.length} / zh ${g.draft.preamble_zh.length} / en ${g.draft.preamble_en.length}`}${t.stem_jp_clean ? "" : " [clean 新設]"}`);
    }
  }
}
for (const [k, gs] of Object.entries(stage)) {
  const f = path.join(STAGE, `a4_apply_${k === "now" ? "main" : "after_B2"}.json`);
  writeFileSync(f, JSON.stringify({ result: { n: gs.length, results: gs } }, null, 2) + "\n");
  log.push(`  → ${path.relative(ROOT, f)}: ${gs.length} 組 (${gs.map((g) => g.key).join(", ")})`);
}

console.log(log.join("\n"));
console.log(`${WRITE ? "✓" : "(dry-run)"} a4-prep: strip ${STRIP.length} 問×3 語 / copy 1 問 / 模擬 prepend ${prepend} skip ${skip} / 二重・欠落 ${dup} / 分野見出し残 ${catHead}`);
if (WRITE) {
  for (const [exam, d] of docs) if (["2012h24a", "2013h25a", "2015h27a"].includes(exam)) writeFileSync(path.join(TR, `${exam}.json`), JSON.stringify(d, null, 2) + "\n");
  console.log("  next: node scripts/quiz-chumon-preamble-apply.mjs data/ip/quiz/.phase2/a4_apply_main.json");
}
