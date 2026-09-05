#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explfix3 S116: Rule A / trsweep 由来の是正に裁決注記を付す (監査証跡)。
// `key_guard.note_jp` は内部専用 (学習者には出ない) なので、腐敗前の字を含めて履歴を残す。
// Run: node scripts/quiz-phase2-explfix3-S116.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GR = path.join(ROOT, "data/ip/quiz/.phase2/generate_result_2009h21a.json");
const MARK = "【S116 Rule A 裁決】";

const NOTES = {
  "2009h21a-q064":
    "誤答肢ウの「由来」説明が成立していなかったため書き直した。旧文は「8進数 55 の上位桁 5 を 16 の重みで数えた場合に生じる誤り」と述べていたが、5×16+5 = 85 = 0x55 であって 4D にはならず、**存在しない機構を説明していた** (捏造)。数値事実 (4D = 77(10) = 115(8) ≠ 45(10)) だけを述べる形に是正 (jp/zh/en 3 言語)。key ア 不変。" +
    "なお Rule A critic は同時に「note_jp が stem 末尾の『ーー』を除去済と書くが標本の stem にそんな記号は無い = 捏造」とも指摘したが、これは**偽陽性**である: raw の stem_jp には実際に『ーー』があり (question_bank 実測)、stem_jp_clean で除去済。ruleA-prep は critic に**表示 (clean) stem** を渡す仕様 (`displayStem()`) なので、腐敗前の字が標本に現れないだけだった。",
  "2009h21a-q096":
    "誤答肢イの説明が自己矛盾していたため書き直した。旧文は「商品こを含めた場合に 2 品目」と述べながら同じ文で「こは 70% 超・回転率 10 回超なので対象外」と自ら否定しており、しかも こ を足しても該当は え 1 品目のままで 2 にはならない。正しい誤り筋は「10 回**以下**」を「10 回**以上**」と読み違える型 (累計 70% 以内の え 9.2 / う 12.0 / あ 14.4 のうち 10 回以上は う・あ の 2 品目) なので、そちらに差し替え (jp/zh/en 3 言語)。key ア 不変。",
  "2009h21a-q078":
    "正解解説末尾の「文中の『硬故障性』は『耐故障性』の誤植」という注記が**陳腐化**していたため除去した (jp/zh/en 3 言語)。choices_jp.ア は fidfix-S116b で既に「耐故障性」に是正済で、学習者の画面に「硬故障性」は存在しない。現行本文に無い誤植を告げると、正解肢の文言が壊れているかのように誤認させる。RAID の核心語に関する注記だけに混乱コストが高い。key ア 不変。",
  "2009h21a-q085":
    "誤答肢エ末尾の「この選択肢の文末には原典のページノイズが混入している」という注記が**陳腐化**していたため除去した (jp/zh/en 3 言語)。choices_jp.エ は S116 で既に「被認証者のディジタル署名を安全に送付する。」に是正済でノンブル等のノイズは無く、表示本文と矛盾する記述になっていた。key ウ 不変。",
  "2009h21a-q071":
    "trsweep (JP↔訳文の項目単位照合) が保真不成立と判定した唯一の問。監査指摘は 3 点 — ウ の zh が JP「不幸の手紙型メール」を「幸运信」(**幸運**) と意味反転させていた / 同じ括弧書きが en から完全脱落 / points[1] en が JP「書き込み型」に無い read の側面を追加 / イ en が「仕組み」(機構) の明示を落としていた。" +
    "**全面再訳への差し替えは採らなかった。** 生成された再訳案は指摘 3 点を確かに解消していたが、2 段の独立核験がいずれも terminology_correct=false を出し、2 段目は「**disk 版より悪化した箇所が 4 件ある**」と具体に指摘した (『同报投递』← disk『群发同一内容』/ 読点挿入で連体修飾が切断され『的』が二重積層 / 語釈なしの裸 opt-in / 字母のカッコ囲み)。" +
    "そこで **disk 版に監査指摘 3 点だけを当てる**方式に切り替えた。再訳案とその 2 段の核験結果は Rule B に従い `failures/quiz_phase2_S116_2009h21a_trsweep/` に保管。key ア 不変。" +
    "教訓: **個別指摘を機械置換で潰す方式は、同一クラスの別事例を構造的に取りこぼす** (2 段目の核験が『迷惑邮件』を潰しても同クラスの『同报』が残ったと指摘)。指摘は「クラス」として全文を再走査すべき。",
};

const gr = JSON.parse(readFileSync(GR, "utf-8"));
let n = 0;
for (const [id, body] of Object.entries(NOTES)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec?.key_guard) throw new Error(`${id}: key_guard が無い`);
  const cur = String(rec.key_guard.note_jp ?? "");
  if (cur.includes(MARK)) { console.log(`  = ${id}: 既に注記済 → skip`); continue; }
  rec.key_guard.note_jp = `${cur}\n${MARK}${body}`.trim();
  n++;
  console.log(`  ✓ ${id}: 裁決注記を追記`);
}
if (n) writeFileSync(GR, JSON.stringify(gr, null, 2) + "\n");
console.log(`✓ quiz-phase2-explfix3-S116: ${n} 問に注記 (定義 ${Object.keys(NOTES).length} 件)`);
