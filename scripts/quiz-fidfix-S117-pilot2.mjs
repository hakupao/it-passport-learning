#!/usr/bin/env node
// Stage 6 / Quiz — S117 pilot 是正の波及漏れ (Rule D reviewer `reviewer-pilot-fix` 指摘 P1×3 + P2×1) を是正する。
//   P1 q050 final note: 「ウ(ISWS)は該当する実在の枠組みではない」→ 選択肢は ISMS に是正済で、解説 distractors.ウ と自己矛盾 → 全文書き換え
//   P1 q040 correct.jp/zh/en: 「（本文中の「滞進的」は「漸進的」の表記の乱れ）」等の括弧書きが 3 言語に残存 → 除去 (q035 の caveat 除去と同処理)
//   P1 q026 final note: 「stem_jp は「生産開始時」…1字異なる」→ 前提が偽 → 全文書き換え
//   P2 q070 final note: 「stem_jp_clean は原典と完全一致し腐敗なし」→ round-1 は「何か/どれか」を取り逃していた → 全文書き換え
// いずれも D-143: 書込先は .phase2 (generate_result / expl_jp / expl_tr) のみ、round1 不可触、sidecar は再 merge で追従。
// Run: node scripts/quiz-fidfix-S117-pilot2.mjs && node scripts/quiz-phase2-merge.mjs 2019r01a

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8")), wj = (f, d) => writeFileSync(f, JSON.stringify(d, null, 2) + "\n");
let n = 0;
const strip = (obj, key, frag, where) => { const s = obj[key]; if (!s.includes(frag)) { console.log(`  = ${where}: already clean`); return; } if (s.split(frag).length !== 2) throw new Error(`${where}: fragment not unique`); obj[key] = s.replace(frag, ""); n++; console.log(`  ✓ ${where}: caveat removed`); };

// q040 correct の括弧書き除去
{
  const jf = P2("expl_jp_2019r01a-q040.json"), tf = P2("expl_tr_2019r01a-q040.json");
  const j = rj(jf), t = rj(tf);
  strip(j, "correct_jp", "（本文中の「滞進的」は「漸進的」の表記の乱れ）", "q040 correct_jp");
  strip(t.correct, "zh", "（选项ウ原文中的「滞进的」是「渐进的」的排版讹误）", "q040 correct.zh");
  strip(t.correct, "en", " (in choice ウ, the original Japanese 「滞進的」 is a garbled form of 「漸進的」, meaning incremental)", "q040 correct.en");
  wj(jf, j); wj(tf, t);
}

// final note 全文書き換え (round1 不可触)
const NOTES = {
  "2019r01a-q050": "図はなく、用語知識だけで一意に導出できる。IT サービスマネジメントの代表的フレームワークは ITIL であり、選択肢エと一致する。ア (IEEE)・イ (IETF) は標準化団体、ウ (ISMS) は情報セキュリティマネジメントの枠組みで IT サービスマネジメントの枠組みではないため、正解はエで確定。stored key と一致。stem・選択肢とも源と逐字一致 (S117: 選択肢ウ「ISWS」→「ISMS」を page-21 実読 [双 pass 一致] で是正済、fidfix-S117-pilot。是正前は解説が「ISWS は実在しないダミー」と腐敗値を前提に書かれていたため、解説 distractors.ウ も ISMS の説明に書き直した)。round-1 は「ISWS は該当する実在の枠組みではない」と腐敗テキストをそのまま前提にしていた。",
  "2019r01a-q026": "発注量 a は第2週の生産終了後に発注し第3週の生産開始までに入荷するので、賄う対象は第3週の生産である。与えられた第1週終了後在庫 20 は第1週総所要量 80 の 25% (= 安全在庫 20) と一致し、各週の生産終了後在庫は当該週の安全在庫に保たれる方式が裏づけられる。よって第2週終了後在庫 = 80×25% = 20。第3週の生産開始前に必要な在庫 = 第3週総所要量 40 + 第3週安全在庫 (40×25% = 10) = 50。発注量 a = 50−20 = 30 = ア で stored key と一致。〔条件〕は源と逐字一致 (S117: 「生産終了時→終了後」「生産開始時→開始前」「安全在庫量→安全在庫」「ために→ためには」の 4 箇所を page-12 実読 [双 pass 一致] で是正済、fidfix-S117-pilot。いずれも計算結果 30 に影響なし)。round-1 は「生産開始時/前」の 1 字差だけを認識し、他 3 箇所は見ていなかった。",
  "2019r01a-q070": "暗号化結果「EGE」を復号する。文字番号は E=4, G=6, E=4。手順2の逆処理として位置番号 n を各文字から減算 (26 で法をとる) すると、1文字目 (4−1) mod 26 = 3 → D、2文字目 (6−2) mod 26 = 4 → E、3文字目 (4−3) mod 26 = 1 → B。よって元の文字列は「DEB」= 選択肢イ。順算検証: D,E,B = 3,4,1 に 1,2,3 を加算 → 4,6,4 → 26 で割った余りも 4,6,4 → E,G,E = EGE と一致。stem は源と逐字一致 (S117: 設問末尾「元の文字列は何か」→「元の文字列はどれか」を page-31 実読 [双 pass 一致] で是正済、fidfix-S117-pilot。表・選択肢は元から一致)。round-1 は「stem_jp_clean は原典と完全一致」と記していたが、この 1 語の置換を取り逃していた。",
};
{
  const gf = P2("generate_result_2019r01a.json"); const g = rj(gf);
  for (const [id, note] of Object.entries(NOTES)) { const r = g.results.find((x) => x.id === id); if (!r?.key_guard) throw new Error(id); if (r.key_guard.note_jp === note) { console.log(`  = ${id} note already updated`); continue; } r.key_guard.note_jp = note; n++; console.log(`  ✓ ${id} final note rewritten (round1 untouched)`); }
  wj(gf, g);
}
console.log(`✓ quiz-fidfix-S117-pilot2: ${n} changes`);
