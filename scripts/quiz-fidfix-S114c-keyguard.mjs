#!/usr/bin/env node
// Stage 6 / Quiz — key_guard.note 起点の選択肢是正、batch S114c (2011h23tokubetsu + 2010h22h).
//
// 発見経路 (S114 §7b、本 session 最大の手続き上の学び):
//   §7 の caveat スキャンは **user-facing なテキスト** (correct/distractors/points × 3 言語)
//   しか見ていなかった。generate_result の **key_guard.note_jp** を追加で走査したところ、
//   「user-facing な caveat には出していないが note では腐敗を報告している」問が
//   **さらに 15 問**あった。→ caveat スキャンは note_jp も対象にしなければならない。
//
//   この 15 問に双 pass 保真核験 (Rule D):
//     tokubetsu q15/42/46/49/50/51/55/65
//       pass1 general-purpose `wf_e9e0d3b6-81f` / pass2 code-reviewer `wf_cd0d2406-361`
//     2010h22h q6/8/12/22/33/40/48
//       pass1 general-purpose `wf_e5c24e6b-cbd` / pass2 code-reviewer `wf_bb3d1961-14e`
//   evidence: evidence/phase5/stage_06_quiz_fidelity/kg_fidelity_S114_*.json
//   両 exam とも q008/q012 (22h) を CLEAN、他を DISCREPANT で一致。
//   区切りカンマ系 (q051/q065) は pass1 のみが報告 (pass2 は表記揺れ扱い) → 下記の裁決参照。
//
// THE CRITICAL ONE — 2011h23tokubetsu-q015 = **答え漏洩** (answer_affecting):
//   源の選択肢 ア〜エ は **4 枚の散布図**そのもので、選択肢本文のテキストは存在しない
//   (図中の文字は軸ラベル「売上高」「気温」のみ)。dataset はそれを説明文に置換した際、
//   括弧内に **「（正の相関）」「（負の相関）」「（無相関）」という分類名を直書き**した。
//   設問文は「**負の相関**となっているものはどれか」なので、
//   **図を一切見ずに、選択肢の字面だけで正解イが確定する**。
//   本問の測定内容 (4 枚の散布図を目視で読み分ける) が完全に無効化されていた。
//   S112 の 2012h24a-q002 答え漏洩と同型。pass2 は 4 肢すべてを answer_affecting と判定。
//   → 分類名を外し、**図形の形状のみを中立に記述**する。源の ウ (水平の帯状に狭く分布) と
//     エ (縦横に広くばらけて分布) の区別も復元する (旧記述は両方「無相関」で識別不能だった)。
//   has_figure=true で図は添付済みのため、テキストは図の補助という位置づけを保つ。
//
// 区切りカンマ (q050 エ / q051 ア・イ・エ / q065 ア・イ) の裁決:
//   pass1 は「区切り記号そのものの脱落」として報告、pass2 は表記揺れ扱い。
//   **是正を採用**する。理由: 同一設問の他肢がカンマを保持しており (q050 ア/イ/ウ、
//   q051 ウ、q065 ウ/エ)、**同じ設問の中で表記が割れている**のは表記揺れではなく
//   抽出時の取りこぼしであること、および「ab」は 2 項目なのか 1 語なのか読者に判別できないこと。
//
// 訳文: q015 のみ zh/en も漏洩していたため 3 言語すべて差し替え。
//   他 14 件は zh/en が既に正しい (実読確認済) ため tr 変更なし。
//
// Run: node scripts/quiz-fidfix-S114c-keyguard.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const TR = (e) => path.join(ROOT, `data/ip/quiz/translations/${e}.json`);
const qid = (exam, n) => `${exam}-q${String(n).padStart(3, "0")}`;
const TK = "2011h23tokubetsu", HH = "2010h22h";

// --- 選択肢全文差し替え (答え漏洩の除去) ---
const REPLACE = [
  { id: qid(TK, 15), key: "ア", jp: "散布図。点群が左下から右上へ向かって上昇するように分布している。",
    zh: "散点图。点群从左下方向右上方呈上升分布。",
    en: "A scatter plot in which the points rise from the lower left toward the upper right." },
  { id: qid(TK, 15), key: "イ", jp: "散布図。点群が左上から右下へ向かって下降するように分布している。",
    zh: "散点图。点群从左上方向右下方呈下降分布。",
    en: "A scatter plot in which the points descend from the upper left toward the lower right." },
  { id: qid(TK, 15), key: "ウ", jp: "散布図。点群が水平の帯状に、縦方向の広がりが小さく分布している。",
    zh: "散点图。点群呈水平带状分布，纵向的分散很小。",
    en: "A scatter plot in which the points form a narrow horizontal band with little vertical spread." },
  { id: qid(TK, 15), key: "エ", jp: "散布図。点群が縦横に広くばらけて分布している。",
    zh: "散点图。点群在纵横方向上广泛分散分布。",
    en: "A scatter plot in which the points are widely scattered both horizontally and vertically." },
];

// --- 部分置換 (jp のみ) ---
const FIXES = [
  // ---- 2011h23tokubetsu
  { id: qid(TK, 42), key: "イ", from: "履善指導", to: "改善指導",
    why: "semantic: 改→履。「履善」は非語 (システム監査の定型語は「改善指導」)" },
  { id: qid(TK, 46), key: "ウ", from: "変更が失敗yることによる", to: "変更が失敗することによる",
    why: "semantic: 仮名「す」がラテン文字「y」に化けていた" },
  { id: qid(TK, 46), key: "エ", from: "問合せに対する迅速回答", to: "問合せに対する迅速な回答",
    why: "semantic (**正解肢**): 連体修飾の「な」が脱落していた" },
  { id: qid(TK, 49), key: "イ", from: "システム設計            「", to: "システム設計",
    why: "cosmetic: 右余白のスキャン汚れを OCR が鉤括弧と誤認した幻字 + 空白列" },
  { id: qid(TK, 50), key: "エ", from: "cd", to: "c, d",
    why: "cosmetic: 区切りカンマの脱落 (同設問のア/イ/ウ はカンマ保持で、設問内で表記が割れていた)" },
  { id: qid(TK, 51), key: "ア", from: "ab", to: "a, b", why: "cosmetic: 区切りカンマの脱落" },
  { id: qid(TK, 51), key: "イ", from: "a c", to: "a, c", why: "cosmetic (**正解肢**): 区切りカンマの脱落" },
  { id: qid(TK, 51), key: "エ", from: "cd", to: "c, d", why: "cosmetic: 区切りカンマの脱落" },
  { id: qid(TK, 55), key: "ア", from: "ネットワークから隅離する", to: "ネットワークから隔離する",
    why: "semantic (**正解肢**): 隔→隅。DMZ の定義語「隔離」が非語に化けていた" },
  { id: qid(TK, 55), key: "イ", from: "プライベート TP アドレス", to: "プライベート IP アドレス",
    why: "semantic: I→T。「TP アドレス」は存在しない用語で NAT の説明が壊れる" },
  { id: qid(TK, 55), key: "ウ", from: "通信経路ト上にある", to: "通信経路上にある",
    why: "semantic: 漢字「上」の一部を「ト」として二重に読み取った重複挿入" },
  { id: qid(TK, 65), key: "ア", from: "ab", to: "a, b", why: "cosmetic (**正解肢**): 区切りカンマの脱落" },
  { id: qid(TK, 65), key: "イ", from: "a b, c", to: "a, b, c", why: "cosmetic: 1 つ目の区切りカンマのみ脱落し、肢内で表記が不統一だった" },

  // ---- 2010h22h
  { id: qid(HH, 6), key: "イ", from: "損答分岐点比率", to: "損益分岐点比率",
    why: "semantic: 益→答。設問文と式では正しく「損益分岐点比率」で、イ だけ用語が非語化していた" },
  { id: qid(HH, 6), key: "ウ", from: "損益分野点比率", to: "損益分岐点比率",
    why: "semantic (**正解肢**): 岐→野。正解肢の中核用語が別語に置換されていた" },
  { id: qid(HH, 22), key: "ウ", from: "更新作業を回避すること", to: "更新作業を回避することができる。",
    why: "semantic: 行折り返しで述部「ができる。」が切り落とされ、ウ だけ体言止めの不完全文になっていた" },
  { id: qid(HH, 33), key: "イ", from: "テスト要員を増やす。                        「", to: "テスト要員を増やす。",
    why: "cosmetic: 右余白のスキャン汚れ由来の幻字「 + 空白列 (q049 と同クラス)" },
  { id: qid(HH, 40), key: "イ", from: "に 4て9 月の各月の売上を", to: "に 4〜9 月の各月の売上を",
    why: "semantic: 範囲記号「〜」が仮名「て」に化け、範囲記法が読めなくなっていた" },
  { id: qid(HH, 40), key: "イ", from: "に10て3 月の各月の売上を", to: "に 10〜3 月の各月の売上を",
    why: "semantic: 同上 (2 箇所目)" },
  { id: qid(HH, 40), key: "ア", from: "ワークシート “上半期 ワークシート “下半期\" のいずれにおいても",
    to: "ワークシート “上半期\" , ワークシート “下半期\" のいずれにおいても",
    why: "cosmetic: 閉じ引用符と並列の読点が脱落し「上半期 ワークシート」が 1 つの名称に読めていた" },
  { id: qid(HH, 48), key: "イ", from: "発生した問題ににって生じた", to: "発生した問題によって生じた",
    why: "semantic (**正解肢**): よ→に。「ににって」は非語で因果を示す「〜によって」が失われる" },
  { id: qid(HH, 48), key: "ウ", from: "発生した問題ににって生じた", to: "発生した問題によって生じた",
    why: "semantic: 同上 (イ と同一の化け方 = 抽出時の系統的欠陥)" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDocs = new Map();
const loadTr = (e) => {
  if (!trDocs.has(e)) trDocs.set(e, JSON.parse(readFileSync(TR(e), "utf-8")));
  return trDocs.get(e);
};

let nJp = 0, nTr = 0;
for (const r of REPLACE) {
  const rec = byId.get(r.id);
  if (!rec) throw new Error(`${r.id}: not in question_bank`);
  if (rec.choices_jp[r.key] === undefined) throw new Error(`${r.id}: no choice ${r.key}`);
  rec.choices_jp[r.key] = r.jp;
  nJp++;
  const exam = r.id.split("-")[0];
  const t = loadTr(exam).questions[r.id];
  if (!t?.choices?.[r.key]) throw new Error(`${r.id}: no tr choice ${r.key}`);
  t.choices[r.key].zh = r.zh;
  t.choices[r.key].en = r.en;
  nTr += 2;
  console.log(`  ✓ ${r.id} [${r.key}] 全文差し替え jp/zh/en (答え漏洩の除去)`);
}

for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const cur = rec.choices_jp[f.key];
  if (cur === undefined) throw new Error(`${f.id}: no choice ${f.key}`);
  const hits = cur.split(f.from).length - 1;
  if (hits !== 1) throw new Error(`${f.id} choice ${f.key}: expected exactly 1 occurrence of «${f.from}», found ${hits}`);
  rec.choices_jp[f.key] = cur.replace(f.from, f.to);
  nJp++;
  console.log(`  ✓ ${f.id} [${f.key}] ${f.why.slice(0, 100)}`);
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
for (const [e, doc] of trDocs) writeFileSync(TR(e), JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S114c-keyguard: jp ${nJp} 件 / tr ${nTr} 件`);
console.log(`  next: node scripts/build-quiz-corpus.mjs`);
