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
//
// S128 L1a (⑨ #6 / #25 / 0b) — field ごとの判定順:
//   1. **patch 無しで比較**。一致すれば same (真の一致)。agent 計上済でも patch は当てない
//      → 是正後の再 machdiff で current_text が是正後テキストの接頭辞になる replay artifact (2021r03-q011 / 2022r04-q100 /
//      2023r05-q092) は原理的に出ない。
//   2. 不一致で agent が当該 field を計上していれば patch を当てて比較。一致 → REPORTED (agent 計上で説明済、fixer 待ち)。
//      same とは別に数える (U4/U5 の「空虚な一致」= 計上 field が same に紛れていた問題を可視化)。
//      current_text が field 全文なら whole-field として内数で示す (patch 後の一致は agent の source_text と transcript の自己整合でしかない)。
//      current_text が字面で当たらない (空白の有無など) ときは正規化空間で当てる (2023r05-q092 事前)。
//   3. 題幹の markdown 表は「表の行の順序付き比較 + 表以外の散文の連結比較」(問文の配置差 = 2015h27a-q009 / 2026r08-q074 は一致扱い)。
//   4. 既知の偽陽性型 (KNOWN_FP 規則、下の FP_RULES) を外して一致すれば KNOWN_FP (exit に影響しない、行は出す)。
//   5. 截断の許容 (⑨ #25): 計上 field で current_text が field 全文なのに source_text が transcript の一部 (截断引用、2025r07-q005 型)
//      → REPORTED_TRUNCATED_QUOTE (計上済なので fixer が全文を再読する)。「…」省略記法の引用は両端の「…」を外して当てる。
//      未計上 field で norm(transcript) が norm(displayed) の真の接頭辞かつ文末で終わる = transcript の截断 (2022r04-q006) → TRANSCRIPT_PREFIX。
//      いずれも exit に影響しないが行は出す。逆向き (displayed の頭に余計な語 = 見出し混入 2022r04-q001 型) と
//      displayed が短い (末尾欠落) は AGENT_MISSED のまま。是正後の q012 型 (source_text が題幹 1 文目だけ) は 1 で same になる。
//   6. 0b: 表示に ASCII `"` があり transcript は “” / 「」 (normStr が同一視するため 1〜5 では見えない) → QUOTE_ASCII (別判定、exit に影響しない)。
//      D-151 で “” に揃えた表示は ASCII を含まないので立たない。transcript 側の ASCII `"` も立てない。

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
// 表示層の一行化「a：X　b：Y」(全角空白区切り、2019h31h-q052/q072/q082) もキー位置で区切って同じ構造に落とす。
const kvParse = (s) => {
  let body = (s ?? "").replace(/^\s*\[表\]\s*/, "");
  if (/\|/.test(body)) { // | a: X | b: Y | or | X | Y | (キー無しなら列順で a,b,c…)
    const cells = body.split("|").map((c) => c.trim()).filter(Boolean);
    const m = {}; cells.forEach((c, i) => { const mm = c.match(/^([^:：]+)[:：](.*)$/); if (mm) m[normStr(mm[1])] = normStr(mm[2]); else m[String.fromCharCode(97 + i)] = normStr(c); }); return m;
  }
  const m = {}; for (const part of body.split(/[，,、]|[\s　]+(?=[^\s　,，、:：]{1,16}[:：])/)) { const mm = part.match(/^\s*([^:：]+)[:：](.*)$/); if (mm) m[normStr(mm[1])] = normStr(mm[2]); else if (part.trim()) m[`_${Object.keys(m).length}`] = normStr(part); } return m;
};
// markdown 表 → 行ごとのセル配列 (区切り行 |---| は捨てる)。散文行は 1 セル行として保持 → 順序・行対応を保った比較
const mdParse = (s) => (s ?? "").split(/\n/).map((l) => l.trim()).filter(Boolean).filter((l) => !/^\|?\s*:?-{2,}/.test(l.replace(/\|/g, "").trim()) || !/-{2,}/.test(l))
  .filter((l) => !/^\|[\s:|-]+\|$/.test(l)).map((l) => /\|/.test(l) ? l.split("|").map((c) => normStr(c)).filter(Boolean) : [normStr(l)]);
const rowsEqual = (A, B) => A.length === B.length && A.every((r, i) => r.length === B[i].length && r.every((c, j) => c === B[i][j]));
const firstRowDiff = (A, B) => { for (let i = 0; i < Math.max(A.length, B.length); i++) { const a = A[i] ?? [], b = B[i] ?? []; if (a.length !== b.length || a.some((c, j) => c !== b[j])) return `row ${i}: disp ${JSON.stringify(a)} src ${JSON.stringify(b)}`; } return ""; };
// 表ブロック除外の散文連結比較 (⑨ #6 d): 表の行だけを順序付きで比べ、散文は行を連結して比べる → 表の前後どちらに問文があっても同じ
const mdTableRowsOf = (s) => (s ?? "").split(/\n/).map((l) => l.trim()).filter((l) => /\|/.test(l) && !/^\|[\s:|-]+\|$/.test(l)).map((l) => l.split("|").map((c) => normStr(c)).filter(Boolean));
const mdProseOf = (s) => normStr((s ?? "").split(/\n/).filter((l) => !/\|/.test(l)).join(""));

/** 2 テキストを比較: { differs, detail, layout } (layout = 散文の配置差だけで一致)。 */
const compare = (disp, src) => {
  if (isKV(disp) || isKV(src)) {                    // 選択肢 [表] a:/b: 型 — キー→値の束縛を比較 (順序入替は差分)
    const D = kvParse(disp), S = kvParse(src); const keys = new Set([...Object.keys(D), ...Object.keys(S)]);
    const bad = [...keys].filter((k) => D[k] !== S[k]); return { differs: bad.length > 0, detail: bad.map((k) => `${k}: disp「${D[k] ?? "∅"}」 src「${S[k] ?? "∅"}」`).join(" ; ") };
  }
  if (isMdTable(disp) || isMdTable(src)) {          // 題幹の markdown 表 — 行×セルで順序を保って比較
    const D = mdParse(disp), S = mdParse(src);
    if (rowsEqual(D, S)) return { differs: false };
    // 表の外の散文で agent の差分が正規化済みで当たらなかった場合の救済: 正規化文字列でも一致すれば同一扱い
    if (normStr(disp) === normStr(src)) return { differs: false };
    if (rowsEqual(mdTableRowsOf(disp), mdTableRowsOf(src)) && mdProseOf(disp) === mdProseOf(src)) return { differs: false, layout: true };
    return { differs: true, detail: firstRowDiff(D, S) };
  }
  const nd = norm(disp), ns = norm(src); if (nd === ns) return { differs: false };
  let i = 0; while (i < nd.length && nd[i] === ns[i]) i++;
  return { differs: true, detail: `@${i} disp「${nd.slice(Math.max(0, i - 12), i + 18)}」 src「${ns.slice(Math.max(0, i - 12), i + 18)}」` };
};

// 既知の偽陽性型 (⑨ #6 c)。disp / src から外す断片。各規則は evidence の裁定に紐づける。新規追加は裁定 (unit evidence の節) を必ず書く。
const FP_RULES = [
  // 描画補助: 表見出しの下線 (実線=主キー / 破線=外部キー) を markdown で描けないための注記 (2026r08-q072、U11 §3b)
  { name: "描画補助:キー注記", disp: /[（(](?:主キー|外部キー)[）)]/g },
  // 描画補助: 空欄セルの明示 (2023r05-q033、U8 §3)
  { name: "描画補助:空欄セル", disp: /[（(]空欄のセル[）)]/g },
  // agent の記法: 肢が図であることを示す「[図]」接頭辞 (U3a q005 / 2022r04-q032、U7 §3)
  { name: "agent記法:[図]", src: /^\s*\[図\]\s*/ },
  // 選択肢の組合せ表を agent が題幹 transcript に「[表] … ア: … / イ: …」で書いた (表示層は選択肢側に保持、2019h31h-q053、U3b §3)
  { name: "体裁:肢の表を題幹に転記", src: /\n\s*\[表\][^\n]*ア\s*[:：][^\n]*イ\s*[:：][^\n]*/g },
];
const applyFp = (disp, src) => {
  let d = disp ?? "", s = src ?? ""; const hit = [];
  for (const r of FP_RULES) {
    const d2 = r.disp ? d.replace(r.disp, "") : d, s2 = r.src ? s.replace(r.src, "") : s;
    if (d2 !== d || s2 !== s) hit.push(r.name); d = d2; s = s2;
  }
  return { d, s, hit };
};
// agent の差分 (current_text→source_text) を displayed に当てる。字面で当たらなければ正規化空間で当てる (戻り値は正規化済)。
// 「…」省略記法 (S118 既登記): agent が current_text / source_text の前後を「…」で省いた引用は、両端の「…」を外して当てる。
const unEllipsis = (s) => (s ?? "").replace(/^\s*(?:…|\.{3})+/, "").replace(/(?:…|\.{3})+\s*$/, "");
const applyPatches = (disp, ds) => {
  let raw = disp, normed = null, applied = 0, whole = false;
  for (const d0 of ds) {
    if (!d0.current_text) continue;
    const d = { current_text: unEllipsis(d0.current_text), source_text: unEllipsis(d0.source_text) };
    if (!d.current_text) continue;
    if (norm(d.current_text) === norm(disp)) whole = true;
    if (normed === null && raw.includes(d.current_text)) { raw = raw.replace(d.current_text, d.source_text); applied++; continue; }
    const cur = normed ?? norm(raw), nc = norm(d.current_text);
    if (nc && cur.includes(nc)) { normed = cur.replace(nc, norm(d.source_text)); applied++; }
  }
  return { text: normed ?? raw, normalized: normed !== null, applied, whole };
};
// ⑨ #25: current_text が field 全文なのに source_text が transcript の一部 (截断引用) — patch では残差の位置を特定できない
const truncatedQuote = (disp, src, ds) => ds.some((d) => {
  const nc = norm(unEllipsis(d.current_text)), nsrc = norm(unEllipsis(d.source_text)), nS = norm(src);
  return nc === norm(disp) && nsrc.length > 0 && nsrc.length < nS.length && nS.includes(nsrc);
});
const endsSentence = (ns) => /[.?!)"]$/.test(ns);

let missed = 0, same = 0, noTranscript = 0, unreadable = 0, conflict = 0;
let reported = 0, reportedWhole = 0, sameReported = 0, layout = 0, knownFp = 0, trPrefix = 0, repTrunc = 0, quoteAscii = 0;
for (const a of res.audits ?? []) {
  const smp = samples.get(a.id); if (!smp) continue;
  // S118 §44 q079 型: verdict=CLEAN なのに discrepancies を挙げている自己矛盾。
  // 主 context / fixer は verdict で分岐するため、この矛盾は差分の取りこぼしに直結する (→ exit 1)。
  if (a.verdict === "CLEAN" && (a.discrepancies ?? []).length > 0) {
    conflict++; console.log(`✗ VERDICT_CONFLICT ${a.id}: CLEAN with ${a.discrepancies.length} discrepancies`);
  }
  if (a.verdict === "UNREADABLE") { unreadable++; continue; }
  const tr = a.source_transcript; if (!tr || (!tr.stem && !Object.keys(tr.choices ?? {}).length)) { noTranscript++; continue; }
  const fields = [["stem", smp.displayed_stem_jp, tr.stem], ...Object.keys(smp.displayed_choices_jp ?? {}).map((L) => [`choice.${L}`, smp.displayed_choices_jp[L], tr.choices?.[L]])];
  for (const [field, disp0, src0] of fields) {
    if (src0 === undefined) { console.log(`? ${a.id} ${field}: transcript missing`); continue; }
    const disp = disp0 ?? "";
    const ds = (a.discrepancies ?? []).filter((d) => d.field === field);
    // 0b: 表示の ASCII " (transcript は “” / 「」)。patch を当てた後の表示で見る (agent が計上して直す ASCII は除く)
    const quoteCheck = (shown) => {
      if (/"/.test(shown) && !/"/.test(src0) && /[“”「」]/.test(src0)) { quoteAscii++; console.log(`! QUOTE_ASCII ${a.id} ${field}: displayed has ASCII " / transcript has “” or 「」`); }
    };
    // 1. patch 無し (replay artifact が出ない)
    let r = compare(disp, src0);
    if (!r.differs) {
      if (r.layout) { layout++; console.log(`~ LAYOUT ${a.id} ${field}: prose order differs around table (concatenated prose + table rows equal)`); }
      else { same++; if (ds.length) sameReported++; } // sameReported = agent は計上したが差が正規化で消える型 (引用符・読点字種など)
      quoteCheck(disp); continue;
    }
    // 2. agent 計上 field は patch を当てて比較
    let shown = disp;
    if (ds.length) {
      const p = applyPatches(disp, ds);
      if (p.applied) {
        const rp = p.normalized ? (p.text === norm(src0) ? { differs: false } : compare(p.text, norm(src0))) : compare(p.text, src0);
        if (!rp.differs) { reported++; if (p.whole) reportedWhole++; if (!p.normalized) quoteCheck(p.text); continue; }
        // 正規化空間の patch は表構造 (改行) を失うので、説明しきれなかったら以降の判定は patch 前の表示で行う
        if (!p.normalized) { shown = p.text; r = rp; }
      }
    }
    // 4. 既知の偽陽性型
    const f = applyFp(shown, src0);
    if (f.hit.length) {
      const rf = compare(f.d, f.s);
      if (!rf.differs) { knownFp++; console.log(`~ KNOWN_FP ${a.id} ${field} [${f.hit.join(", ")}]`); quoteCheck(shown); continue; }
    }
    // ⑨ #25: 截断引用で patch が field を説明しきれない → 計上済 field として fixer の全文再読に回す (exit に影響しない)
    if (ds.length && truncatedQuote(disp, src0, ds)) { repTrunc++; console.log(`~ REPORTED_TRUNCATED_QUOTE ${a.id} ${field}: current_text is the whole field but source_text is only part of the transcript — fixer must re-read the whole field (${r.detail})`); continue; }
    // 5. transcript の截断 (未計上 field で、transcript が文末で終わり displayed がその先へ続く)。逆向き (見出し混入) と displayed が短い場合は MISSED
    const nd = norm(shown), ns = norm(src0);
    if (!ds.length && ns.length > 0 && nd.length > ns.length && nd.startsWith(ns) && endsSentence(ns)) {
      trPrefix++; console.log(`~ TRANSCRIPT_PREFIX ${a.id} ${field}: transcript ends at a sentence boundary; displayed continues「${nd.slice(ns.length, ns.length + 24)}…」(+${nd.length - ns.length})`); quoteCheck(shown); continue;
    }
    missed++; console.log(`✗ AGENT_MISSED ${a.id} ${field} verdict=${a.verdict}: ${r.detail}`);
  }
}
const audited = new Set((res.audits ?? []).map((a) => a.id)); const notAudited = [...samples.keys()].filter((id) => !audited.has(id));
if (!Array.isArray(res.audits)) { console.log("✗ result has no audits[]"); process.exit(1); }
if (notAudited.length) console.log(`✗ COVERAGE: ${notAudited.length}/${samples.size} samples have no audit: ${notAudited.join(", ")}`);
if (noTranscript) console.log(`✗ ${noTranscript} non-UNREADABLE audit(s) lack source_transcript`);
console.log(`machdiff: fields same=${same} | AGENT_MISSED=${missed} | VERDICT_CONFLICT=${conflict} | audits w/o transcript=${noTranscript} | UNREADABLE skipped=${unreadable} | coverage ${audited.size}/${samples.size}`
  + ` | same∩reported=${sameReported} | REPORTED=${reported} (whole-field ${reportedWhole}) | REPORTED_TRUNCATED_QUOTE=${repTrunc} | LAYOUT=${layout} | KNOWN_FP=${knownFp} | TRANSCRIPT_PREFIX=${trPrefix} | QUOTE_ASCII=${quoteAscii}`);
process.exit(missed || notAudited.length || noTranscript || conflict ? 1 : 0);
