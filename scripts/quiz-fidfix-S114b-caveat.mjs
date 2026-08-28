#!/usr/bin/env node
// Stage 6 / Quiz — caveat 起点の選択肢 OCR 是正、batch S114b (2011h23tokubetsu + 2010h22h).
//
// 発見経路 (S112b の教訓を運用に載せた成果):
//   generate 完了後の **体系 caveat スキャン** で、解説本文に
//   「なお、この選択肢の原文には OCR 由来の誤字がある。正しくは〜」型の注記が
//   11 問 21 箇所残っていることを検出した。これは生成器が**設問テキストの腐敗に
//   気づきながら、テキストを直せないので解説に注記した**状態であり、
//   注記を消すだけでは腐敗が残り、テキストを直すだけでは注記が陳腐化する。
//
// そこで注記が指す 11 問を **s7x 保真核験の workflow にそのまま掛けた** (双 pass, Rule D):
//   2011h23tokubetsu q14/31/32/47/82/85
//     pass1 general-purpose `wf_0492b7e6-742` / pass2 code-reviewer `wf_919db6e5-ac6`
//     → 両 pass とも 6/6 DISCREPANT、**(id,field) 9/9 一致**
//   2010h22h q34/51/66/74/81
//     pass1 code-reviewer `wf_fa588554-faa` / pass2 general-purpose `wf_129c264f-32f`
//     → 両 pass とも 5/5 DISCREPANT、**(id,field) 7/7 一致**
//   evidence: evidence/phase5/stage_06_quiz_fidelity/caveat_fidelity_S114_*.json
//
// **この経路でしか見つからなかったもの** (= caveat が指していなかった 2 件):
//   - 2010h22h-q051 ウ **(正解肢)**「どのようなもの**か**必要であるか」→ 源「もの**が**必要」。
//     「か」が二重に現れる非文で、格関係が壊れていた。生成器の caveat は q051 ア
//     (組み込むせマクロ) だけを指しており、正解肢のこの助詞崩れは**見落としていた**。
//   - 2011h23tokubetsu-q085 イ **(正解肢)** 文末に源に無い空白 + ハイフン「-」の混入。
//   → **caveat を入口にして保真核験を掛け直す**運用は、caveat 自体より広く捕まえる。
//
// 特徴: 16 件すべて「腐敗版が日本語として成立しない非語」(生囲内 / 集定 / 名空 / 顧客問 /
//   TT 資産 / TEEE / 網座 / 組み込むせ / 分割すもる / 解読婦 / 埋め込ひ / 書き込ひ …)。
//   S109 が対象にした「腐敗版も真に見える」型とは逆の系統で、**決定的検出器の射程**だが
//   S101 decoder の辞書に無い字形ペアだったため素通りしていた。
//   **正解肢の上に 5 件** (q047 ウ / q082 イ / q085 イ / q051 ウ / q074 エ)。
//
// 層: いずれも choices_jp (表示層は raw/clean を問わず choices_jp 一本)。
// 訳文: zh/en は **16 件すべて既に正しい** (実読確認済。翻訳者が腐敗を暗黙に補正していた)
//   ため tr 変更は 0。→ 連帯修復 workflow は不要。
// 解説: 本スクリプトの後に explfix で陳腐化した caveat を除去する。
//
// Run: node scripts/quiz-fidfix-S114b-caveat.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const qid = (exam, n) => `${exam}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // ================= 2011h23tokubetsu =================
  { id: qid("2011h23tokubetsu", 14), key: "ウ", from: "リソースの生囲内で", to: "リソースの範囲内で",
    why: "semantic: 範→生 の字形誤読。「生囲」は非語で「リソースの範囲内」という限定条件が壊れる" },
  { id: qid("2011h23tokubetsu", 14), key: "エ", from: "制約の厳しいりリソース", to: "制約の厳しいリソース",
    why: "cosmetic: 片仮名「リ」の直前に平仮名「り」が 1 文字混入" },
  { id: qid("2011h23tokubetsu", 31), key: "エ", from: "生産日程計画を集定する", to: "生産日程計画を策定する",
    why: "semantic: 竹冠の「策」が「集」に誤読。「集定」は非語" },
  { id: qid("2011h23tokubetsu", 32), key: "ア", from: "名空の商品", to: "架空の商品",
    why: "semantic: 架→名 の誤読。「名空」は非語で、実在しない商品を出品する詐欺という肢の趣旨が読めない" },
  { id: qid("2011h23tokubetsu", 47), key: "ウ", from: "サービスの提供者と顧客問で", to: "サービスの提供者と顧客間で",
    why: "semantic (**正解肢**): 門構えの中が 日→口 (間→問)。SLA の核心である『提供者と顧客の「間」で合意』が壊れていた" },
  { id: qid("2011h23tokubetsu", 47), key: "エ", from: "サービスや TT 資産の", to: "サービスや IT 資産の",
    why: "semantic: セリフ体 I を T と誤読。同ページの肢ア/イ は正しく IT と表示されており本肢のみの局所誤り" },
  { id: qid("2011h23tokubetsu", 82), key: "イ", from: "TEEE 802.11n", to: "IEEE 802.11n",
    why: "semantic (**正解肢**): I→T の誤読。肢ウ「IEEE 802.3」だけが IEEE と読めるため、正解肢を避ける方向に誘導していた" },
  { id: qid("2011h23tokubetsu", 85), key: "ア", from: "音声をりアルタイムに", to: "音声をリアルタイムに",
    why: "cosmetic: 片仮名「リ」→平仮名「り」の字種取り違え" },
  { id: qid("2011h23tokubetsu", 85), key: "イ", from: "時刻を同期させる。                                -", to: "時刻を同期させる。",
    why: "cosmetic (**正解肢**): 句点の後に源に無い空白列 + ハイフンが混入 (源の右余白にあるのはスキャン由来の点 1 個のみ)。**caveat は指していなかった、保真核験だけが捕捉**" },

  // ================= 2010h22h =================
  { id: qid("2010h22h", 34), key: "イ", from: "分岐条件などを網座する", to: "分岐条件などを網羅する",
    why: "semantic: 羅→座 の誤読。「網座」は非語で、ホワイトボックステストの定義 (カバレッジ) を担う語が失われる" },
  { id: qid("2010h22h", 51), key: "ア", from: "組み込むせマクロ", to: "組み込むマクロ",
    why: "semantic: 源に無い仮名「せ」の挿入" },
  { id: qid("2010h22h", 51), key: "ウ", from: "どのようなものか必要であるか", to: "どのようなものが必要であるか",
    why: "semantic (**正解肢**): 主格助詞 が→か。「か」が二重に現れる非文で格関係が壊れる。**caveat は q051 ア しか指しておらず、保真核験だけが捕捉**" },
  { id: qid("2010h22h", 66), key: "エ", from: "ブロックに分割すもることによって", to: "ブロックに分割することによって",
    why: "semantic: 源に無い仮名「も」の混入。「すもる」は非語" },
  { id: qid("2010h22h", 74), key: "ア", from: "解読婦がなければ", to: "解読鍵がなければ",
    why: "semantic: 鍵→婦 の誤読。「解読婦」は非語で暗号鍵の語義が消える" },
  { id: qid("2010h22h", 74), key: "エ", from: "などを埋め込ひことができる", to: "などを埋め込むことができる",
    why: "semantic (**正解肢**): む→ひ。活用として成立しない" },
  { id: qid("2010h22h", 81), key: "ア", from: "データを書き込ひことができ", to: "データを書き込むことができ",
    why: "semantic: む→ひ。活用として成立しない" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));

let n = 0;
for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const cur = rec.choices_jp[f.key];
  if (cur === undefined) throw new Error(`${f.id}: no choice ${f.key}`);
  const hits = cur.split(f.from).length - 1;
  if (hits !== 1) throw new Error(`${f.id} choice ${f.key}: expected exactly 1 occurrence of «${f.from}», found ${hits}`);
  rec.choices_jp[f.key] = cur.replace(f.from, f.to);
  n++;
  console.log(`  ✓ ${f.id} [${f.key}] ${f.why.slice(0, 100)}`);
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S114b-caveat: choice ${n} 件 (tr 変更 0 — zh/en は全件既に正しい)`);
console.log(`  next: node scripts/build-quiz-corpus.mjs; then explfix で陳腐化した caveat を除去`);
