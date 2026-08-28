#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explfix S114 (2011h23tokubetsu + 2010h22h): key_guard resolution.
//
// S110 §5(a) 準拠: merge は FINAL (裁決後) の key_guard を sidecar に publish し、
// round-1 は key_guard_round1 に併記される (suspect の union は不変 = anti-masking)。
// 本 script は generate_result の final key_guard に **裁決注記**を追記し、
// 是正済みの腐敗 flag を解決状態にする。解説本文の陳腐化 caveat は merge 後に
// fidfix-repair で除去する (本 script は key_guard 層のみ)。
//
// Run: node scripts/quiz-phase2-explfix-S114.mjs
//   (then: node scripts/quiz-phase2-merge.mjs <exam> ごと)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TK = "2011h23tokubetsu", HH = "2010h22h";
const q = (e, n) => `${e}-q${String(n).padStart(3, "0")}`;

const RESOLVES = {
  // ---- 2011h23tokubetsu
  [q(TK, 14)]: "【S114 裁決】選択肢ウ「生囲内」→「範囲内」、エ「りリソース」→「リソース」を page-07 実読 (双 pass 一致) で是正済 (fidfix-S114b)。zh/en は元から正しい。",
  [q(TK, 15)]: "【S114 裁決】**答え漏洩を除去**。選択肢は源では 4 枚の散布図そのもので本文テキストが存在しないのに、dataset の説明文が「（正の相関）／（負の相関）／（無相関）」と分類名を直書きしており、設問「負の相関はどれか」に対し図を見ずに正解イが確定していた (双 pass とも answer_affecting)。分類名を外し図形の形状のみの中立記述に差し替え、源のウ (水平の帯状に狭く分布) とエ (縦横に広くばらけて分布) の区別も復元 (fidfix-S114c、jp/zh/en 3 言語)。key イ 不変。",
  [q(TK, 31)]: "【S114 裁決】選択肢エ「集定する」→「策定する」を page-12 実読で是正済 (fidfix-S114b)。",
  [q(TK, 32)]: "【S114 裁決】選択肢ア「名空の商品」→「架空の商品」を page-12 実読で是正済 (fidfix-S114b)。",
  [q(TK, 42)]: "【S114 裁決】選択肢イ「履善指導」→「改善指導」を page-16 実読で是正済 (fidfix-S114c)。",
  [q(TK, 46)]: "【S114 裁決】選択肢ウ「失敗yる」→「失敗する」、エ (正解肢)「迅速回答」→「迅速な回答」を page-17 実読で是正済 (fidfix-S114c)。",
  [q(TK, 47)]: "【S114 裁決】選択肢ウ (正解肢)「顧客問で」→「顧客間で」、エ「TT 資産」→「IT 資産」を page-17 実読で是正済 (fidfix-S114b)。",
  [q(TK, 49)]: "【S114 裁決】選択肢イ末尾の幻字「+ 空白列 (右余白のスキャン汚れの誤認) を strip 済 (fidfix-S114c)。",
  [q(TK, 50)]: "【S114 裁決】選択肢エ「cd」→「c, d」。同設問のア/イ/ウ はカンマ保持で設問内の表記が割れていたため、抽出時の取りこぼしとして是正 (fidfix-S114c)。",
  [q(TK, 51)]: "【S114 裁決】選択肢ア「ab」→「a, b」、イ (正解肢)「a c」→「a, c」、エ「cd」→「c, d」。ウ のみカンマ保持で表記が割れていた (fidfix-S114c)。",
  [q(TK, 55)]: "【S114 裁決】選択肢ア (正解肢)「隅離」→「隔離」、イ「プライベート TP アドレス」→「プライベート IP アドレス」、ウ「経路ト上」→「経路上」を page-20 実読で是正済 (fidfix-S114c)。",
  [q(TK, 65)]: "【S114 裁決】選択肢ア (正解肢)「ab」→「a, b」、イ「a b, c」→「a, b, c」。ウ/エ はカンマ保持で表記が割れていた (fidfix-S114c)。",
  [q(TK, 82)]: "【S114 裁決】選択肢イ (正解肢)「TEEE 802.11n」→「IEEE 802.11n」を page-29 実読で是正済 (fidfix-S114b)。肢ウのみが IEEE と読める状態で正解肢を避ける方向に誘導していた。",
  [q(TK, 85)]: "【S114 裁決】選択肢ア「りアルタイム」→「リアルタイム」、イ (正解肢) 文末の空白列 + ハイフン混入を strip 済 (fidfix-S114b)。後者は caveat が指しておらず保真核験のみが捕捉した。",
  [q(TK, 90)]: "【S114 裁決】中問A 共有前文 (〔RFP の概要〕/〔X 社からの提案〕) の欠落を **D-141 に基づき q090〜q092 の表示 stem に埋め込み済** (jp/zh/en)。CPU 構成・商品数/顧客数の最大値が読めるようになり、レコード単体で解答可能。key ウ 不変。",
  [q(TK, 95)]: "【S114 裁決】中問B 共有前文 (〔関数の仕様〕/〔処理内容〕(1)〜(3)) の欠落を D-141 に基づき q093〜q096 に埋め込み済。単価・上限枚数・1 割引の規則が読める。key イ 不変。",
  [q(TK, 96)]: "【S114 裁決】中問B 共有前文を D-141 に基づき埋め込み済 (合計 20 枚以上で 1 割引の規則が読める)。key ウ 不変。なお生成時の note が言及した groups.json は**実在しない** (corpus にグループ機構は無い) ことを S114 で実測確認済。",
  [q(TK, 98)]: "【S114 裁決】中問C 共有前文 (〔作成に関する主な指示〕(3) 写真 1 枚 200k バイト以下を含む) を D-141 に基づき埋め込み済。解像度の上限判定材料が読める。key イ 不変。",

  // ---- 2010h22h
  [q(HH, 6)]: "【S114 裁決】選択肢イ「損答分岐点比率」・ウ (正解肢)「損益分野点比率」→ いずれも「損益分岐点比率」を page-06 実読で是正済 (fidfix-S114c)。設問文と式は元から正しく、選択肢だけ用語が非語化していた。",
  [q(HH, 8)]: "【S114 裁決】双 pass 保真核験の結果 **CLEAN** (相違は読点/引用符の表記揺れのみ)。是正不要。",
  [q(HH, 12)]: "【S114 裁決】双 pass 保真核験の結果 **CLEAN**。stem の「実施する作業とし て」は行折り返し由来の空白で、corpus 一律の正規化差 (backlog)。",
  [q(HH, 22)]: "【S114 裁決】選択肢ウ末尾の述部「ができる。」の切り落としを page-11 実読で復元済 (fidfix-S114c)。ウ だけ体言止めの不完全文になっていた。",
  [q(HH, 33)]: "【S114 裁決】選択肢イ末尾の幻字「+ 空白列を strip 済 (fidfix-S114c、tokubetsu-q049 と同クラス)。",
  [q(HH, 34)]: "【S114 裁決】選択肢イ「網座する」→「網羅する」を page-16 実読で是正済 (fidfix-S114b)。",
  [q(HH, 40)]: "【S114 裁決】選択肢イの範囲記号「4て9 月」「10て3 月」→「4〜9 月」「10〜3 月」、ア の閉じ引用符と並列読点を page-19 実読で是正済 (fidfix-S114c)。",
  [q(HH, 48)]: "【S114 裁決】選択肢イ (正解肢)・ウ の「問題ににって」→「問題によって」を page-21 実読で是正済 (fidfix-S114c)。同一の化け方が 2 肢に再現しており抽出時の系統的欠陥。",
  [q(HH, 51)]: "【S114 裁決】選択肢ア「組み込むせマクロ」→「組み込むマクロ」、**ウ (正解肢)「どのようなものか必要であるか」→「どのようなものが必要であるか」**を page-22 実読で是正済 (fidfix-S114b)。後者は生成時の caveat が指しておらず、保真核験のみが捕捉した。",
  [q(HH, 66)]: "【S114 裁決】選択肢エ「分割すもる」→「分割する」を page-28 実読で是正済 (fidfix-S114b)。",
  [q(HH, 74)]: "【S114 裁決】選択肢ア「解読婦」→「解読鍵」、エ (正解肢)「埋め込ひ」→「埋め込む」を page-30 実読で是正済 (fidfix-S114b)。",
  [q(HH, 81)]: "【S114 裁決】選択肢ア「書き込ひ」→「書き込む」を page-33 実読で是正済 (fidfix-S114b)。",
  [q(HH, 89)]: "【S114 裁決】中問A 共有記述の全欠 + 「問89」の誤接頭 + 「先輩の指導の下で，」脱落を fidfix-S114 で是正し、D-141 に基づき q090〜q092 にも同前文を埋め込み済。key イ 不変。",
  [q(HH, 94)]: "【S114 裁決】(1) DFD 記述の「「社員」と「b 表」の間にもデータの流れがある」= 源図に存在しない矢印の捏造を是正済 (fidfix-S114)。(2) 参照先の〔貸出処理〕〔返却処理〕仕様は D-141 に基づき中問B 共有前文として本問に埋め込み済。key ア 不変。",
  [q(HH, 97)]: "【S114 裁決】中問C 共有前文 (〔S社の状況〕(1)〜(8) /〔方針案の概要〕/ 市場シェア数値) が corpus のどこにも存在せず q097〜q100 の 4 問すべてが単体で解答不能だった。D-141 に基づき 4 問すべてに埋め込み済 (jp/zh/en)。分野見出し〔ストラテジ〕の前置も除去。key ア 不変。",
  [q(HH, 98)]: "【S114 裁決】中問C 共有前文を D-141 に基づき埋め込み済。〔S社の状況〕(3)(8) が読めるため強みの判別が可能になった。key ウ 不変。",
  [q(HH, 99)]: "【S114 裁決】stem「方針シナリオ 1 に従って」→ 源「方針案 1 に沿って」に是正 (fidfix-S114) し、中問C 共有前文を D-141 に基づき埋め込み済 (方針案1 の内容が読める)。肢イ (正解肢) の「きめの細かいサービス」も復元。key イ 不変。",
  [q(HH, 100)]: "【S114 裁決】中問C 共有前文 (市場シェア Q社25%/R社16%/S社12%/T社10% を含む) を D-141 に基づき埋め込み済。買収後 22% = 2 位 という判定材料が読める。肢ア/ウ/エ (エ=正解肢) の語句も源に復元済 (fidfix-S114)。key エ 不変。",
};

let total = 0;
for (const E of [TK, HH]) {
  const p = path.join(ROOT, `data/ip/quiz/.phase2/generate_result_${E}.json`);
  const gr = JSON.parse(readFileSync(p, "utf-8"));
  let n = 0;
  for (const r of gr.results ?? []) {
    const note = RESOLVES[r.id];
    if (!note) continue;
    if (!r.key_guard) throw new Error(`${r.id}: no key_guard`);
    if (String(r.key_guard.note_jp ?? "").includes("【S114 裁決】")) continue;
    r.key_guard.note_jp = `${r.key_guard.note_jp ?? ""}\n${note}`.trim();
    r.key_guard.stem_corruption_suspected = false;
    n++;
  }
  writeFileSync(p, JSON.stringify(gr, null, 2) + "\n");
  console.log(`  ✓ ${E}: ${n} 問に裁決注記を追記し stem_corruption_suspected を解決`);
  total += n;
}
const missing = Object.keys(RESOLVES).length - total;
console.log(`✓ quiz-phase2-explfix-S114: ${total} 問 (RESOLVES 定義 ${Object.keys(RESOLVES).length} 件、未適用 ${missing})`);
