#!/usr/bin/env node
// Stage 6 / Quiz — S117 ⑨: 保真核験 workflow の `source_transcript` (agent の源書き起こし) と displayed テキストを
// **主 context 側で決定的に diff** し、agent が discrepancies に計上し忘れた箇所 (S117 で 2 例) を機械的に拾う。
// 正規化: NFKC → 空白除去 → 句読点/引用符/波ダッシュ/スラッシュの統一。
// 表: 選択肢の「[表] a: X, b: Y」はキー→値の束縛で比較 (a/b 入替を差分と見る)、題幹の markdown 表は行×セルの順序付き比較。
// agent が transcript を | 列 | 形式で書いても同じ構造に落ちる。verdict=UNREADABLE は比較しない。
// Run: node scripts/quiz-fidelity-machdiff.mjs <fidelity_input.json> <workflow_result.json | tasks/<id>.output>
//   出力: AGENT_MISSED (正規化後に差があるのに agent が当該箇所の差分を報告していない) を列挙。exit 1 = 要対応。
// 既知の盲点 (Rule D MINOR-1): 空白の有無は正規化で消えるため「余り が」「導入 期」型の空白腐敗は検出しない (判定基準でも表記揺れ扱い)。
// 把関としての exit: AGENT_MISSED>0 / audits が input の samples を全数カバーしていない / UNREADABLE 以外で transcript 欠落
//   / VERDICT_CONFLICT>0 (S119 U0: verdict=CLEAN なのに discrepancies 非空 = S118 §44 q079 型の自己矛盾) → exit 1。

import { readFileSync } from "node:fs";
const [inputPath, resultPath] = process.argv.slice(2);
if (!inputPath || !resultPath) { console.error("usage: quiz-fidelity-machdiff.mjs <input.json> <result.json>"); process.exit(2); }
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const input = rj(inputPath); let res = rj(resultPath); if (res.result) res = res.result;
const samples = new Map(input.samples.map((s) => [s.id, s]));

const normStr = (s) => (s ?? "")
  .replace(/[①-⑳]/g, (c) => `(${c.charCodeAt(0) - 0x2460 + 1})`) // NFKC より前でないと死コードになる (Rule D MINOR-2)
  .normalize("NFKC")
  .replace(/[\s　]+/g, "")
  .replace(/[，、,]/g, ",").replace(/[。．]/g, ".")
  .replace(/[“”„"「」『』〝〟']/g, "\"")
  .replace(/[〜～~]/g, "~").replace(/[／/]/g, "/").replace(/[－—–ー]/g, "-") // 長音/ダッシュ族は同一視。漢数字「一」は写像しないので 一↔ー の同形字はここで検出できる (Rule D MINOR-3)
  .replace(/[（(]/g, "(").replace(/[）)]/g, ")").replace(/[：:]/g, ":").replace(/[・･]/g, "・");
const norm = (s) => normStr(s);
const isKV = (s) => /^\s*\[表\]/.test(s ?? "");           // 選択肢の「[表] a: X, b: Y」型 (キーに値が束縛される。順序を落とすと a/b 入替を見逃す → MAJOR-1)
const isMdTable = (s) => /(^|\n)\s*\|.*\|\s*(\n|$)/.test(s ?? "");
// [表] a: X, b: Y → {a:"X", b:"Y"} (agent が | a | b | 形式で書いた場合も同じ構造に落とす)
const kvParse = (s) => {
  let body = (s ?? "").replace(/^\s*\[表\]\s*/, "");
  if (/\|/.test(body)) { // | a: X | b: Y | or | X | Y | (キー無しなら列順で a,b,c…)
    const cells = body.split("|").map((c) => c.trim()).filter(Boolean);
    const m = {}; cells.forEach((c, i) => { const mm = c.match(/^([^:：]+)[:：](.*)$/); if (mm) m[normStr(mm[1])] = normStr(mm[2]); else m[String.fromCharCode(97 + i)] = normStr(c); }); return m;
  }
  const m = {}; for (const part of body.split(/[，,、]/)) { const mm = part.match(/^\s*([^:：]+)[:：](.*)$/); if (mm) m[normStr(mm[1])] = normStr(mm[2]); else if (part.trim()) m[`_${Object.keys(m).length}`] = normStr(part); } return m;
};
// markdown 表 → 行ごとのセル配列 (区切り行 |---| は捨てる)。散文行は 1 セル行として保持 → 順序・行対応を保った比較
const mdParse = (s) => (s ?? "").split(/\n/).map((l) => l.trim()).filter(Boolean).filter((l) => !/^\|?\s*:?-{2,}/.test(l.replace(/\|/g, "").trim()) || !/-{2,}/.test(l))
  .filter((l) => !/^\|[\s:|-]+\|$/.test(l)).map((l) => /\|/.test(l) ? l.split("|").map((c) => normStr(c)).filter(Boolean) : [normStr(l)]);
const rowsEqual = (A, B) => A.length === B.length && A.every((r, i) => r.length === B[i].length && r.every((c, j) => c === B[i][j]));
const firstRowDiff = (A, B) => { for (let i = 0; i < Math.max(A.length, B.length); i++) { const a = A[i] ?? [], b = B[i] ?? []; if (a.length !== b.length || a.some((c, j) => c !== b[j])) return `row ${i}: disp ${JSON.stringify(a)} src ${JSON.stringify(b)}`; } return ""; };

let missed = 0, same = 0, noTranscript = 0, unreadable = 0, conflict = 0;
for (const a of res.audits ?? []) {
  const smp = samples.get(a.id); if (!smp) continue;
  // S118 §44 q079 型: verdict=CLEAN なのに discrepancies を挙げている自己矛盾。
  // 主 context / fixer は verdict で分岐するため、この矛盾は差分の取りこぼしに直結する (→ exit 1)。
  if (a.verdict === "CLEAN" && (a.discrepancies ?? []).length > 0) {
    conflict++; console.log(`✗ VERDICT_CONFLICT ${a.id}: CLEAN with ${a.discrepancies.length} discrepancies`);
  }
  if (a.verdict === "UNREADABLE") { unreadable++; continue; }
  const tr = a.source_transcript; if (!tr || (!tr.stem && !Object.keys(tr.choices ?? {}).length)) { noTranscript++; continue; }
  const reported = new Set((a.discrepancies ?? []).map((d) => d.field));
  const fields = [["stem", smp.displayed_stem_jp, tr.stem], ...Object.keys(smp.displayed_choices_jp ?? {}).map((L) => [`choice.${L}`, smp.displayed_choices_jp[L], tr.choices?.[L]])];
  for (const [field, disp, src] of fields) {
    if (src === undefined) { console.log(`? ${a.id} ${field}: transcript missing`); continue; }
    // agent が報告した差分 (current_text→source_text) を displayed に当ててから transcript と比べる。
    // 残差があれば「同じ field 内で agent が計上し忘れた箇所」(S117 2017h29h-q027「などは」型) として検出できる。
    let patched = disp;
    for (const d of (a.discrepancies ?? []).filter((d) => d.field === field)) {
      if (d.current_text && patched.includes(d.current_text)) patched = patched.replace(d.current_text, d.source_text ?? "");
    }
    let differs, detail;
    if (isKV(disp) || isKV(src)) {                    // 選択肢 [表] a:/b: 型 — キー→値の束縛を比較 (順序入替は差分)
      const D = kvParse(patched), S = kvParse(src); const keys = new Set([...Object.keys(D), ...Object.keys(S)]);
      const bad = [...keys].filter((k) => D[k] !== S[k]); differs = bad.length > 0; detail = bad.map((k) => `${k}: disp「${D[k] ?? "∅"}」 src「${S[k] ?? "∅"}」`).join(" ; ");
    } else if (isMdTable(disp) || isMdTable(src)) {   // 題幹の markdown 表 — 行×セルで順序を保って比較
      const D = mdParse(patched), S = mdParse(src); differs = !rowsEqual(D, S); detail = differs ? firstRowDiff(D, S) : "";
      // 表の外の散文で agent の差分が正規化済みで当たらなかった場合の救済: 正規化文字列でも一致すれば同一扱い
      if (differs && normStr(patched) === normStr(src)) differs = false;
    } else {
      const nd = norm(patched), ns = norm(src); differs = nd !== ns;
      if (differs) { let i = 0; while (i < nd.length && nd[i] === ns[i]) i++; detail = `@${i} disp(after agent fixes)「${nd.slice(Math.max(0, i - 12), i + 18)}」 src「${ns.slice(Math.max(0, i - 12), i + 18)}」`; }
    }
    if (!differs) { same++; continue; }
    missed++; console.log(`✗ AGENT_MISSED ${a.id} ${field} verdict=${a.verdict}: ${detail}`);
  }
}
const audited = new Set((res.audits ?? []).map((a) => a.id)); const notAudited = [...samples.keys()].filter((id) => !audited.has(id));
if (!Array.isArray(res.audits)) { console.log("✗ result has no audits[]"); process.exit(1); }
if (notAudited.length) console.log(`✗ COVERAGE: ${notAudited.length}/${samples.size} samples have no audit: ${notAudited.join(", ")}`);
if (noTranscript) console.log(`✗ ${noTranscript} non-UNREADABLE audit(s) lack source_transcript`);
console.log(`machdiff: fields same=${same} | AGENT_MISSED=${missed} | VERDICT_CONFLICT=${conflict} | audits w/o transcript=${noTranscript} | UNREADABLE skipped=${unreadable} | coverage ${audited.size}/${samples.size}`);
process.exit(missed || notAudited.length || noTranscript || conflict ? 1 : 0);
