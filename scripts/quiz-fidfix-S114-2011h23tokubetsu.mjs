#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S114 (2011h23tokubetsu).
//
// Provenance A — s7x 保真核験 (双 pass, Rule D):
//   pass 1 agentType general-purpose                 → CLEAN 21 / DISCREPANT 1 (q097), 4 件
//   pass 2 agentType pr-review-toolkit:code-reviewer → 同 1 問・**(id,field) 4/4 一致**
//     (差は q097 図キャプションの severity のみ: pass1 cosmetic / pass2 semantic)
//   正解肢上の差分 0 / UNREADABLE 0。
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S114_2011h23tokubetsu{,_pass2}.json
//   主 context 裁決: page-39 / page-40 を実読して 4 件すべて確認 (S114 §1)。
//
// Provenance B — 決定的 junk スキャン (主 context, 全 100 問 × stem+choices):
//   カテゴリ見出し混入 / ASCII 引用符 / 語中空白 / 重複字 を機械抽出し、源ページ
//   (page-03 / page-16 / page-24 / page-29 / page-34) を実読して裁決した分。
//   **s7x 監査が CLEAN と判定した問にも残っていた** = 保真監査 (源との逐字一致) と
//   junk スキャン (dataset 内部の異物) は別ゲートであることの実例。
//
// THE STRUCTURAL ONE — q097 (page-39/40), 中問C の共有前文が痩せていた:
//   源は 3 文構成の状況設定 (D さんの所属=スーパマーケット N 町店の広報スタッフ /
//   E さんとの協力関係 / N 町店紹介ページのアクセス数増加という懸賞アンケートの目的)。
//   dataset は冒頭 2 文を丸ごと落とし、第 1 文の修飾句「本社の Web サイト担当の」だけを
//   第 3 文へ移設していた。**日本語として自然で内容も真** ゆえ key-guard/reviewer/Rule A
//   のどれにも信号が出ない (S113 2011h23a-q073 と同じ「保真専用ゲートだけが捕捉する」型)。
//   併せて 図1 のボタン行 (応募する / キャンセル) が脱落しており、注記に「（ ）はボタン」
//   と書いてあるのに図中にボタンが 1 つも無い不整合が生じていた。**選択肢 ア は
//   “応募する”ボタンの配置を問うており、参照先が表示テキストから消えている**
//   (正解肢 ウ = ラジオボタンの成否は動かないので answer_affecting ではない)。
//   さらに「アドバイスと指示を受けた」の「と指示」脱落 + 〔作成に関する主な指示〕
//   ブロック全欠。この指示ブロックは q100 (ank01.html / 相対パス) の前提。
//
// LAYERING: q097 の中問C 前文は stem_jp_clean にのみ存在する (raw は設問一文のみ) →
//   clean 単独修正。q003/q091 は clean あり・raw にも同語句 → both。
//   q042/q067/q068/q084 は clean 無し → raw が表示層。
//
// TRANSLATION LAYER: q003/q042/q067/q068/q084/q091/q093/q094/q100 の是正は
//   引用符字形・語中空白・見出し異物・重複字といった **JP 側だけの異物**で、zh/en には
//   波及していない (全フィールドを実読確認済: zh「16 位 CPU」「手掌认证」「X 公司」等は
//   既に正しい)。よって tr 修正は **q097 のみ**、それも新規復元文の翻訳が必要なため
//   fidfix-repair workflow に委ねる (本スクリプトでは触らない)。
//
// NOT fixed here (裁決理由つき):
//   - 〈 〉 と源 ＜ ＞ の字形差: corpus 本文が 〈写真 1〉 等で一貫しており表記正規化。
//   - q044 stem「是正や新しい要件」の読点 1 個脱落: 両 pass とも句読点表記揺れとして
//     CLEAN 判定 (pass2 が参考記載)。語義・係り受け・正解に影響なし。
//   - q059 の 「社員」 vs 源 “社員”: corpus 一律の引用符正規化 (backlog)。
//   - 語中空白の残り (q026/q030/q035/q052/q054/q060/q071/q090/q095/q099 等):
//     corpus 全体に分布する正規化差で、本 exam 局所の問題ではない (S113 と同じ backlog 裁定)。
//     本スクリプトが直すのは **語中空白のうち熟語を割っているもの** (q084「採 用」) と
//     **ルビ由来のもの** (q068「掌 認証」) だけ。
//
// Run: node scripts/quiz-fidfix-S114-2011h23tokubetsu.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2011h23tokubetsu";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

// kind: "stem" (layer raw|clean|both) / "choice_jp" (key) / "tr_stem" (lang) / "tr_choice" (key, lang)
const FIXES = [
  // ================= A. s7x 保真核験 (双 pass 一致 4 件) =================
  // ---- q097 (page-39) 中問C 共有前文。clean のみが表示層 (raw は設問一文だけ)。
  {
    id: q(97), kind: "stem", layer: "clean",
    from: "D さんは，図 1 のような懸賞ページ案を作成し，本社の Web サイト担当の E さんに相談した。",
    to:
      "スーパマーケット N 町店の広報スタッフである D さんは，本社の Web サイト担当の E さんと協力して N 町店紹介のページを作成している。" +
      "このたび，N 町店紹介のページのアクセス数増加を目的として，Web サイトで懸賞付きアンケートを実施することになった。" +
      "D さんは，図 1 のような懸賞ページ案を作成し，E さんに相談した。",
    why: "semantic (双 pass 一致): 源の状況設定 2 文が丸ごと脱落 + 修飾句「本社の Web サイト担当の」の第3文への移設。源は 3 文構成",
  },
  {
    id: q(97), kind: "stem", layer: "clean",
    from: "〔図 1 懸賞ページ案の主な内容〕",
    to: "図 1　懸賞ページ案",
    why: "semantic (pass2) / cosmetic (pass1): 源の図キャプションは「図1 懸賞ページ案」。〔〕化 +「の主な内容」は源に無く『抜粋である』という含意を持ち込む。corpus の図キャプション規約は裸行 (同 exam q093「図1 関数の処理の流れ図」)",
  },
  {
    id: q(97), kind: "stem", layer: "clean",
    from: "　・連絡先メールアドレス [ ]\n・注記：",
    to: "　・連絡先メールアドレス [ ]\n・（応募する）　（キャンセル）\n・注記：",
    why: "semantic (双 pass 一致): 図1 枠内最下段のボタン行が脱落。注記が「（ ）はボタン」と説明するのに図中にボタンが 0 個という不整合で、選択肢アの参照先 “応募する”ボタン が表示テキストから消えていた",
  },
  {
    id: q(97), kind: "stem", layer: "clean",
    from: "次のようなアドバイスを受けた。\n\n〔デザインに関する主なアドバイス〕",
    to: "次のようなアドバイスと指示を受けた。\n\n〔デザインに関する主なアドバイス〕",
    why: "semantic (双 pass 一致): 源は「アドバイスと指示を受けた」。「と指示」は直後の〔作成に関する主な指示〕を予告する語",
  },
  {
    id: q(97), kind: "stem", layer: "clean",
    from: "(3) 入力の誤りを防ぐため，データ形式に応じた入力フォームを利用する。\n\nD さんは，E さんから受けた",
    to:
      "(3) 入力の誤りを防ぐため，データ形式に応じた入力フォームを利用する。\n\n" +
      "〔作成に関する主な指示〕\n" +
      "(1) 懸賞ページは HTML 形式の ank01.html というファイル名で作成し，Web サーバの指定されたディレクトリに転送する。\n" +
      "(2) ファイルを指定する場合は，相対パスで記述する。\n" +
      "(3) 使用する写真のファイルサイズは，1 枚当たり 200k バイト以下とする。\n\n" +
      "D さんは，E さんから受けた",
    why: "semantic (pass2 明示): 「と指示」の復元と対になる〔作成に関する主な指示〕(1)〜(3) が全欠。q100 (ank01.html / 相対パス) の前提でもある",
  },

  // ================= B. 決定的 junk スキャン (源実読で裁決) =================
  // ---- q003 (page-03) 源は “社員の英語力を向上する”。ASCII 引用符 → 全角。
  {
    id: q(3), kind: "stem", layer: "both",
    from: '"社員の英語力を向上する"',
    to: "“社員の英語力を向上する”",
    why: "cosmetic: 源は全角 “…”。ASCII 半角引用符は OCR 由来 (JSON 直列化の危険もある)",
  },

  // ---- q042 (page-16) 選択肢エ 末尾の孤立アポストロフィ。
  {
    id: q(42), kind: "choice_jp", key: "エ",
    from: "本調査に先立って予備調査を実施する。          '",
    to: "本調査に先立って予備調査を実施する。",
    why: "cosmetic: 源に無い末尾 junk (空白 + アポストロフィ)",
  },

  // ---- q067 (page-24) 選択肢ウ 引用符崩壊 + 「ビピット」重複字。
  {
    id: q(67), kind: "choice_jp", key: "ウ",
    from: '“16 ビット CPU", "32 ビット CPU「,“64 ビピット CPU”',
    to: "“16 ビット CPU”，“32 ビット CPU”，“64 ビット CPU”",
    why: "semantic: 源は “16 ビット CPU”，“32 ビット CPU”，“64 ビット CPU”。閉じ引用符が \" と 「 に崩れ、64 側は「ビピット」と重複字。表示上ほぼ読めない状態だった",
  },

  // ---- q068 (page-24) ウ 末尾の孤立鉤括弧 / エ ルビ由来の語中空白。
  {
    id: q(68), kind: "choice_jp", key: "ウ",
    from: "声紋認証    「",
    to: "声紋認証",
    why: "cosmetic: 源に無い末尾 junk (空白 + 開き鉤括弧)",
  },
  {
    id: q(68), kind: "choice_jp", key: "エ",
    from: "掌 認証",
    to: "掌認証",
    why: "cosmetic: 源は「掌認証」。空白は 掌 に付されたルビ (てのひら) の版面由来で、語中に空白を作る性質のもの",
  },

  // ---- q084 (page-29) “PDCA" の閉じ引用符崩壊 + 「採 用」語中空白。
  {
    id: q(84), kind: "stem", layer: "raw",
    from: '“PDCA" のアプローチを採 用している',
    to: "“PDCA” のアプローチを採用している",
    why: "cosmetic: 源は “PDCA” + 「採用」。閉じ引用符が ASCII \" に崩れ、熟語「採用」が改行由来の空白で割れていた",
  },

  // ---- q091 (page-34) ア/イ の「XX社」重複字 + エ 末尾のカテゴリ見出し混入。
  {
    id: q(91), kind: "choice_jp", key: "ア",
    from: "XX社が顧客情報を早く扱えるように, 開発の一括請負契約を X社と早急に結ぶ。",
    to: "X 社が顧客情報を早く扱えるように, 開発の一括請負契約を X 社と早急に結ぶ。",
    why: "semantic: 源は「X 社」。先頭が「XX社」と X 重複 (社名の誤読を誘発する)",
  },
  {
    id: q(91), kind: "choice_jp", key: "イ",
    from: "開発の正式契約前に XX社へ渡す。",
    to: "開発の正式契約前に X 社へ渡す。",
    why: "semantic: 同上 (X 重複)",
  },
  {
    id: q(91), kind: "choice_jp", key: "エ",
    from: "ライセンス契約を Y 社と結ぶ。〔マネジメント〕",
    to: "ライセンス契約を Y 社と結ぶ。",
    why: "cosmetic: 次問 (問92) のカテゴリ見出し〔マネジメント〕が選択肢末尾に流れ込んでいた。**corpus 全 2900 問で選択肢への見出し混入は本件と 2009h21h-q094.エ の 2 件のみ**",
  },

  // ---- q093 / q094 / q100 stem 冒頭のカテゴリ見出し前置。
  // corpus 実測: stem 冒頭に〔テクノロジ〕等が残るのは 2900 問中 25 問 (0.86%) =
  // 規約は「前置しない」。本 exam の 3 件を是正し、他 exam の 20 件は横断 backlog へ。
  {
    id: q(93), kind: "stem", layer: "clean",
    from: "〔テクノロジ〕\n関数の処理の流れを図1に示す。",
    to: "関数の処理の流れを図1に示す。",
    why: "cosmetic: 分野見出しは設問本文ではない (corpus 規約は非前置、2900 問中 25 問のみ残存)",
  },
  {
    id: q(94), kind: "stem", layer: "clean",
    from: "〔マネジメント〕\n関数のテストを行うために、",
    to: "関数のテストを行うために、",
    why: "cosmetic: 同上",
  },
  {
    id: q(100), kind: "stem", layer: "clean",
    from: "〔テクノロジ〕\nDさんは，Eさんから，",
    to: "Dさんは，Eさんから，",
    why: "cosmetic: 同上",
  },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

const replaceOnce = (s, f, where) => {
  const n = s.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${where}: expected exactly 1 occurrence of «${f.from}», found ${n}`);
  return s.replace(f.from, f.to);
};

const counts = { raw: 0, clean: 0, choice: 0, tr: 0 };
for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const t = trDoc.questions[f.id];

  if (f.kind === "stem") {
    if (f.layer === "raw" || f.layer === "both") {
      rec.stem_jp = replaceOnce(rec.stem_jp, f, "raw");
      counts.raw++;
      console.log(`  ✓ ${f.id} [raw]      ${f.why}`);
    }
    if (f.layer === "clean" || f.layer === "both") {
      if (!t?.stem_jp_clean) throw new Error(`${f.id}: no stem_jp_clean`);
      t.stem_jp_clean = replaceOnce(t.stem_jp_clean, f, "clean");
      counts.clean++;
      console.log(`  ✓ ${f.id} [clean]    ${f.why}`);
    }
  } else if (f.kind === "choice_jp") {
    rec.choices_jp[f.key] = replaceOnce(rec.choices_jp[f.key], f, `choice_jp.${f.key}`);
    counts.choice++;
    console.log(`  ✓ ${f.id} [choice ${f.key}] ${f.why}`);
  } else if (f.kind === "tr_stem") {
    if (!t?.stem?.[f.lang]) throw new Error(`${f.id}: no tr stem ${f.lang}`);
    t.stem[f.lang] = replaceOnce(t.stem[f.lang], f, `tr_stem.${f.lang}`);
    counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.lang}]    ${f.why}`);
  } else if (f.kind === "tr_choice") {
    if (!t?.choices?.[f.key]?.[f.lang]) throw new Error(`${f.id}: no tr choice ${f.key}.${f.lang}`);
    t.choices[f.key][f.lang] = replaceOnce(t.choices[f.key][f.lang], f, `tr_choice.${f.key}.${f.lang}`);
    counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.key}.${f.lang}] ${f.why}`);
  }
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S114-2011h23tokubetsu: raw ${counts.raw} / clean ${counts.clean} / choice ${counts.choice} / tr ${counts.tr}`);
console.log(`  next: node scripts/build-quiz-corpus.mjs; then fidfix-repair for q097 zh/en`);
