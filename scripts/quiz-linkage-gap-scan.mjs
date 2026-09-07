#!/usr/bin/env node
// Stage 6 / Quiz — D-144 段 3 (S117): 中問 linkage-gap の決定的スキャン。
// 表示層 stem (stem_jp_clean ?? stem_jp) が参照する共有資料 (〔…〕見出し / 図N / 表N) が、その設問自身の中に無く
// (見出し行が無い / 図・選択肢図が無い / 表ブロックが無い) かつ図も付いていない設問を列挙する。
// 各候補について、同 exam の近傍設問 (±6) の clean stem に同じ見出し行があるか (= 軽量: 複製で埋まる) と、
// 近傍設問に図が付いているか / groups.json (D-120) に同ページの共有図があるか (= 図を挂ける候補) をヒントとして出す。
// Run: node scripts/quiz-linkage-gap-scan.mjs [--json <out>]
import { readFileSync, writeFileSync, existsSync } from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const Q = rj(path.join(ROOT, "data/ip/quiz/questions.json")).questions; const byEx = {}; const bank = new Map(rj(path.join(ROOT, "data/ip/exams/question_bank.json")).questions.map((q) => [q.id, q]));
const groupsFile = path.join(ROOT, "data/ip/exams/groups.json"); const groups = existsSync(groupsFile) ? (rj(groupsFile).groups ?? rj(groupsFile)) : [];
const disp = (q) => { const T = (byEx[q.exam_id] ??= rj(path.join(ROOT, "data/ip/quiz/translations", `${q.exam_id}.json`)).questions)[q.id]; return T?.stem_jp_clean || q.stem_jp; };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// 見出しの照合は空白を無視 (「〔A さんが書き出したメモ〕」と「〔Aさんが書き出したメモ〕」は同一見出し)
const nsp = (x) => x.replace(/[\s　]+/g, "");
// 「見出し行」= その行が見出しそのもの (末尾の : ： を許す)。設問文が見出しで**始まる**だけ (2011h23a-q098「〔インタビュー調査の注意点〕に従った…」) は節を持たない (Rule D H-1)
// 見出しが「行そのもの」か「行頭にあり直後が空白/コロン/改行」(インライン節 `〔問題〕 営業所で…`) なら節あり。直後が助詞 (〔…〕に従った / 〔…〕の(3)) なら参照 (節なし)。
const hasHeaderLine = (s, hdr) => { const h = nsp(hdr).replace(/^[〔\[［]/, "〔").replace(/[〕\]］]$/, "〕"); return s.split("\n").some((l0) => { const l = l0.replace(/^[\s　]+/, "").replace(/^[\[［]/, "〔").replace(/^(〔[^〕\]］]*)[\]］]/, "$1〕"); const t = nsp(l); if (!t.startsWith(h)) return false; const rest = l.slice(l.indexOf("〕") + 1); return rest.trim() === "" || /^[\s　:：]/.test(rest); }); };
const hasCaption = (s, ref) => new RegExp("(^|\\n)\\s*" + ref + "([\\s　:：]|$)", "m").test(s);
const rows = [];
for (const q of Q) {
  const s = disp(q); const refs = new Set(); let m;
  // 〔…〕 と ASCII/全角の [ … ] 両方を見出し参照として拾う (2012h24a-q099 は [会員登録をする Web ページの仕組み] と半角括弧で参照)
  // 無番号の 図/表 は「次の図」「図に示す」「図のように」「表に示す」等の定型だけ拾う (貸借対照表の「表の」等の誤検出を避ける)
  const re = /[〔\[［]([^〕\]］\n]{1,30})[〕\]］]|(図\s*\d+|表\s*\d+)|((?:次の|下の|上の)図|図に示す|図のよう|(?:次の|下の|上の)表|表に示す)/g;
  while ((m = re.exec(s))) {
    if (m[1]) { const inner = m[1].trim(); // 空欄・1 文字・数式・図ラベル (〔図〕〔凡例〕〔注〕〔流れ図〕〔 a 〕〔性能=1〕) は節見出しではない
      if (inner.length < 3 || /^[A-Za-zａ-ｚＡ-Ｚ0-9０-９\s　]*$/.test(inner) || /[=＝≧≦<>+＋]/.test(inner) || /^[\d,\s　.]+$/.test(inner) || /^(図|表|凡例|注|注記|流れ図|図\d+|表\d+|プログラム|手順|条件|前提)$/.test(inner)) continue;
      refs.add(`〔${inner}〕`); }
    else if (m[2]) refs.add(m[2].replace(/\s/g, ""));
    else refs.add(m[3].includes("図") ? "図" : "表");
  }
  const hasFig = Boolean(q.figure || q.choice_figures); const missing = [];
  for (const r of refs) {
    if (r.startsWith("〔")) { if (!hasHeaderLine(s, r)) missing.push(r); }
    else if (r === "図") { if (!hasFig && !/\n\|/.test(s)) missing.push("図(無番号)"); } // 表ブロックがあれば図はテキスト化済 (S116 sharedfig)
    else if (r === "表") { if (!hasFig && !/\n\|/.test(s)) missing.push("表(無番号)"); }
    else if (r.startsWith("表")) { if (!/\n\|/.test(s) && !hasCaption(s, r) && !hasFig) missing.push(r); }
    else if (!hasFig && !hasCaption(s, r)) missing.push(r);
  }
  if (!missing.length) continue;
  const n = parseInt(q.id.slice(-3), 10); const sib = Q.filter((x) => x.exam_id === q.exam_id && Math.abs(parseInt(x.id.slice(-3), 10) - n) <= 6 && x.id !== q.id);
  const hints = [];
  for (const r of missing) {
    if (r.startsWith("〔")) { const src = sib.find((x) => hasHeaderLine(disp(x), r)); if (src) hints.push(`${r} ← ${src.id} clean に見出し行あり (軽量)`); else hints.push(`${r} ← 近傍に無し (源ページ抽出)`); }
    else { const withFig = sib.filter((x) => x.figure).map((x) => x.id); const pg = bank.get(q.id)?.source?.page_number; const g = groups.find((g) => (g.member_qids ?? []).includes(q.id)); hints.push(`${r} ← 近傍の図付き: [${withFig.join(",")}] / page ${pg} / groups.json: ${g ? g.group_id + (g.shared_figure?.path ? " 共有図あり" : "") : "無"}`); }
  }
  rows.push({ id: q.id, missing, has_figure: hasFig, page: bank.get(q.id)?.source?.page_number, hints });
}
const byExam = rows.reduce((m, r) => { const e = r.id.split("-q")[0]; m[e] = (m[e] || 0) + 1; return m; }, {});
console.log(`linkage-gap candidates: ${rows.length} 問 / ${Object.keys(byExam).length} exam`, JSON.stringify(byExam));
for (const r of rows) console.log(`- ${r.id} (p${r.page}${r.has_figure ? ", fig" : ""}): ${r.missing.join(" ")}\n    ${r.hints.join("\n    ")}`);
const oi = process.argv.indexOf("--json"); if (oi > 0) { writeFileSync(process.argv[oi + 1], JSON.stringify(rows, null, 2) + "\n"); console.log(`→ ${process.argv[oi + 1]}`); }
