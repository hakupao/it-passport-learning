#!/usr/bin/env node
// S129 L2a — source page pointer の 1 頁ずれ横断走査 (⑨ #5、U6 §4n bigram 法の全 29 exam 版)。READ-ONLY。
//
// 各問の stem_jp (先頭 60 字) / 選択肢 (連結先頭 80 字) の文字 bigram 集合を、exam 全頁の tesseract 全文 bigram 集合と照合し
// (containment = |key ∩ page| / |key|)、**stem の最良頁** ≠ 記録 `source.page_number` の問を候補に挙げる。
// 選択肢だけが次頁にある (B10 q095 型) のはずれではないので、stem と選択肢を別々に採点する。
//
// 前段の OCR キャッシュ (macOS 専用: sips で 2 倍 → tesseract jpn --psm 4、1 頁 1 txt) は本 script の外で作る:
//   ls data/ip/exams/pages/*/page-*.png | xargs -P 8 -n 1 <ocr1.sh>   (S129 では /private/tmp/claude-501/s129-l2a/ocr1.sh)
//
// Run:
//   node scripts/quiz-pageoffset-scan-S129.mjs --ocr-dir <dir> [--bank <question_bank.json>] [--out <json>] [--override <json>]
//   --override: { "<id>": <page_number>, ... } — 是正済みの既知陽性を是正前の値に戻して再現率を測る (bank は書き換えない)。
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OCR = arg("--ocr-dir");
if (!OCR) throw new Error("--ocr-dir が必要");
const BANK = arg("--bank", path.join(ROOT, "data/ip/exams/question_bank.json"));
const OUT = arg("--out");
const OVR = arg("--override") ? JSON.parse(readFileSync(arg("--override"), "utf-8")) : {};
const MAPS = path.join(ROOT, "data/ip/exams/mappings");

const MARGIN = 0.3; // best − recorded がこれ以上で MISMATCH
const FLOOR = 0.5;  // 記録頁の stem 一致率がこれ未満なら LOW_CONF

const norm = (s) => (s ?? "").normalize("NFKC").replace(/[\s、。，．,.・「」『』()（）〔〕［］\[\]{}:：;；!！?？…ー\-—―‐'"“”‘’/／|｜_＿~〜]/g, "");
const bigrams = (s) => { const o = new Set(); for (let i = 0; i + 1 < s.length; i++) o.add(s.slice(i, i + 2)); return o; };
const contain = (key, page) => { if (!key.size) return null; let n = 0; for (const b of key) if (page.has(b)) n++; return n / key.size; };
const r2 = (x) => (x == null ? null : Math.round(x * 100) / 100);

const bank = JSON.parse(readFileSync(BANK, "utf-8"));
const qs = bank.questions ?? bank;
const byExam = new Map();
for (const q of qs) { const e = q.id.split("-")[0]; if (!byExam.has(e)) byExam.set(e, []); byExam.get(e).push(q); }

const results = [];
const perExam = {};
for (const [exam, list] of [...byExam].sort()) {
  const dir = path.join(OCR, exam);
  if (!existsSync(dir)) { console.error(`! ${exam}: OCR なし — skip`); continue; }
  const pages = new Map(); const heads = new Map();
  for (const f of readdirSync(dir).filter((f) => /^page-\d+\.txt$/.test(f))) {
    const n = parseInt(f.match(/\d+/)[0], 10); const raw = readFileSync(path.join(dir, f), "utf-8");
    pages.set(n, bigrams(norm(raw)));
    heads.set(n, new Set([...raw.normalize("NFKC").matchAll(/[問間]\s*(\d{1,3})/g)].map((m) => +m[1])));
  }
  const vis = existsSync(path.join(MAPS, `${exam}_vision.json`)) ? JSON.parse(readFileSync(path.join(MAPS, `${exam}_vision.json`), "utf-8")).question_pages : {};
  const hed = existsSync(path.join(MAPS, `${exam}_pages.json`)) ? JSON.parse(readFileSync(path.join(MAPS, `${exam}_pages.json`), "utf-8")).question_pages : {};
  const cnt = { total: 0, MISMATCH: 0, LOW_CONF: 0, OK: 0, CHOICES_NEXT: 0, MAP_DISAGREE: 0 };
  for (const q of list) {
    const rec = OVR[q.id] ?? q.source.page_number;
    const sKey = bigrams(norm(q.stem_jp).slice(0, 60));
    const cKey = bigrams(norm(Object.values(q.choices_jp ?? {}).join("")).slice(0, 80));
    const S = {}, C = {};
    for (const [n, b] of pages) { S[n] = contain(sKey, b); C[n] = contain(cKey, b); }
    const argmax = (M) => Object.keys(M).map(Number).reduce((a, n) => ((M[n] ?? -1) > (M[a] ?? -1) ? n : a), rec);
    const sb = argmax(S), cb = argmax(C);
    const sRec = S[rec] ?? 0, sBest = S[sb] ?? 0;
    let verdict = "OK";
    if (sb !== rec && sBest - sRec >= MARGIN && sBest >= FLOOR) verdict = "MISMATCH";
    else if (sRec < FLOOR || (sb !== rec && sBest - sRec > 0.05)) verdict = "LOW_CONF";
    const choicesNext = verdict === "OK" && cb !== rec && (C[cb] ?? 0) - (C[rec] ?? 0) >= MARGIN;
    // fidelity manifest が agent に渡すのは source=rec / prev=rec−1 の 2 頁。stem の最良頁がその窓の外なら agent に設問が見えない。
    const impact = verdict !== "MISMATCH" ? null
      : sb === rec - 1 && (C[rec] ?? 0) >= (C[cb] ?? 0) - 0.05 ? "SPLIT_STEM_PREV" // stem は前頁・選択肢は記録頁 (窓内に両方ある)
      : sb === rec - 1 ? "STEM_PREV" : "STEM_OUTSIDE_WINDOW";
    const qn = q.question_number;
    const mapDis = (vis[qn] != null && vis[qn] !== rec) || (hed[qn] != null && hed[qn] !== rec);
    cnt.total++; cnt[verdict]++; if (choicesNext) cnt.CHOICES_NEXT++; if (mapDis) cnt.MAP_DISAGREE++;
    if (verdict !== "OK" || choicesNext || mapDis) {
      results.push({
        id: q.id, exam, qn, verdict, impact, choices_next: choicesNext, map_disagree: mapDis,
        recorded: rec, overridden: q.id in OVR, stem_best: sb, choices_best: cb,
        stem: { rec: r2(sRec), best: r2(sBest), prev: r2(S[rec - 1]), next: r2(S[rec + 1]) },
        choices: { rec: r2(C[rec]), best: r2(C[cb]), prev: r2(C[rec - 1]), next: r2(C[rec + 1]) },
        stem_bigrams: sKey.size, choice_bigrams: cKey.size,
        heading_on_rec: heads.get(rec)?.has(qn) ?? false, heading_on_best: heads.get(sb)?.has(qn) ?? false,
        vision_page: vis[qn] ?? null, heading_map_page: hed[qn] ?? null,
        has_figure: q.has_figure, figure_page_number: q.source.figure_page_number ?? null, group_id: q.group_id ?? null,
      });
    }
  }
  perExam[exam] = cnt;
}

const summary = { bank: path.relative(ROOT, BANK) || BANK, override_count: Object.keys(OVR).length, thresholds: { MARGIN, FLOOR }, per_exam: perExam };
console.log(JSON.stringify(summary.per_exam));
for (const r of results.filter((r) => r.verdict === "MISMATCH")) console.log(`MISMATCH ${r.impact} ${r.id} rec=${r.recorded} best=${r.stem_best} stem ${r.stem.rec}→${r.stem.best} head(best)=${r.heading_on_best}`);
if (OUT) writeFileSync(OUT, JSON.stringify({ summary, candidates: results }, null, 2) + "\n");
