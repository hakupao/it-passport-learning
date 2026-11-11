# L1 既存の言語検査の棚卸し (Track L, PLAN_hosting_migration §3)

- 日付: 2026-11-11 (S154)。読み取りのみで、検査やデータは変えていない。
- 探した範囲: `scripts/*.mjs`、`scripts/lib/`、`apps/web/src/lib/**`、`apps/web/src/**/__tests__/`、`docs/decisions/`、`docs/discussion/` (D-198 の lock 文)。
- 探した語:
  - 仮名・漢字の文字クラス: `u3040` / `u30A0` / `Script=Hiragana|Katakana|Han` / `ぁ-` / `ァ-`
  - 語: `validateV2`、`zh_terms`、`D-198`、`kana`、`messages/(ja|zh|en)`、`zh.json` / `en.json`、`Object.keys`
- 「常設」は commit ごと・CI・vitest で毎回走るもの。「一回限り」は LLM 監査や走査を 1 度回して是正したもの (再実行はできるが、ゲートではない)。

## 一覧

| # | 検査 | 場所 | 常設 / 一回限り | 何を検出するか | 何を検出できないか |
|---|---|---|---|---|---|
| 1 | validateV2 `missing` | `apps/web/src/lib/textbook/validateV2.ts` (prose / list triple、`unit_summary_*`) | 常設 (vitest `v2-corpus.test.ts`「validateV2: 0 issues each」、生成時の `textbook-v2-validate.mjs`) | 単元の `X_jp/_zh/_en` のどれかが空・欠落。list の長さの不一致。analogy / hook は「3 つとも非空か 3 つとも空」 | 文字種を見ない。中身が他言語でも、空でなければ通る |
| 2 | validateV2 `markup` | 同上 `markupOk` | 常設 | `[[jp:…]]` の書式崩れ。`_jp` 欄に `[[jp:` が入ったもの (D-195 §5) | `[[jp:…]]` の**外**にある裸の仮名・漢字 (zh / en)。ja 欄の簡体字・英文 |
| 3 | validateV2 `jp-origin` (D-202) と jpOriginWarnings | 同上 `hasJpOrigin`。WARN は `textbook-v2-validate.mjs` が表示 | 常設 (WARN は止めない) | 各語の `one_zh` / `one_en` に `[[jp:見出し語]]` がある。考点で初めて出る見出し語に注記がある | 注記が**余計に**付いたもの、注記なしで日本語が混ざったもの。検査は「あるべき注記があるか」だけ |
| 4 | validateV2 `compat` | 同上 `compat()` | 常設 | v1 互換欄 (definition / explanation / memory_hook / overview.intro / summary.*) が新欄から派生した値と一致する | 派生元の欄そのものの言語 (元が混入していれば、互換欄も同じ混入のまま一致する) |
| 5 | validateV2 `banned` / `framing` | 同上 `BANNED_PHRASES` / `EXAM_FRAMING` / `POINT_FRAMING`、言語ごとの正規表現 | 常設 | 言語ごとの禁止表現 (文体)。言語ごとの規則を当てるので、他言語の文には当たらない | 言語の取り違え (zh 欄の日本語文は zh の禁止表現に当たらないので素通り) |
| 6 | parity | `scripts/textbook-v2-parity.mjs`、`scripts/lib/textbook-v2.mjs` `parityCounts`。vitest `v2-corpus.test.ts`「parity」 | 常設 | 3 言語の構造の件数 (goals / key points / 総表 / 考点 / 図ラベル …) が揃う。訳の抜けは件数が減って見える | 件数が揃っていて中身が他言語のもの、ja と同一の文字列 |
| 7 | zh_terms WARN (B6) | `scripts/lib/textbook-v2.mjs` `zhTermWarnings`、`scripts/textbook-v2-zh-terms.mjs --check-units`、表 `data/ip/textbook/zh_terms.json` | 常設 (WARN、止めない。`--check-units` は exit 1) | jp 文が表の用語を含むとき、同じ欄の zh 文に表の訳語があるか (訳語の統一) | 仮名・簡体字の混入そのもの。表に無い語。en 層 (zh だけが対象) |
| 8 | quiz Layer A (A1〜A7) | `scripts/quiz-keys-crosscheck.mjs` (`pnpm check:quiz:ci`)。vitest `quizCorpusInvariants.test.ts` | 常設 | 構造: 全問にエントリがある、選択肢の字母集合、A5 D-142 の zh 禁止語 (主机托管 等)、A6 図選択肢の訳が 图L / Figure L | 訳文の文字種、空文字列 (キーがあれば通る)、ja と同一の訳 |
| 9 | 訳層照合 2,900 題 (A2b / T1〜T3) | `scripts/quiz-tr-fidelity.workflow.mjs` (manifest は `quiz-tr-prep-S127.mjs`、対象表は `quiz-tr-targets-S130.mjs`) | 一回限り (opus、S127〜S130 で全 2,900 題) | stem・全選択肢の zh / en を jp と突き合わせる: 数字・固有名・略語・付加・訳抜け・誤答肢の「是正」・OCR 推測・意味のずれ | 句読点・全角半角・表記は報告対象外と指示している。文字種の混入は観点に無い (意味が同じなら日本語が残っていても報告しない)。解説 sidecar は対象外。再実行しないので、照合後の変更は見ていない |
| 10 | 解説監査 934 題 | `scripts/quiz-expl-audit.workflow.mjs` (prep `quiz-expl-audit-prep-S130.mjs`) | 一回限り (opus、2,900 題中 934 題) | 解説の正しさと `translation_faithful` (zh / en が jp に忠実か、本土の zh で日式借词でないか、用語が揃っているか) | 残り約 1,966 題。文字種を機械的に数えない (LLM の目視のみ) |
| 11 | 訳層の数字・英字の不対応 (0b) | `scripts/quiz-backlog-scan-A1.mjs` | 一回限り (S127 の決定的走査、読み取りのみ) | 表示 jp と zh / en の数字集合・ASCII 略語・1 字ラベルの不対応 | 仮名・漢字の混入、空、同一 |
| 12 | jp の OCR 欠陥走査 | `scripts/quiz-ocr-garble-scan.mjs` (S100)、`scripts/quiz-choice-defect-scan.mjs` (S118)、`scripts/quiz-punct-sweep-S130.mjs` | 一回限り | jp 表示層の OCR 崩れ (同形字、半角ピリオド、語中の空白、読点の字形) | zh / en 層は対象外。ja 欄の簡体字・英文混入も観点に無い |
| 13 | D-198 (写しの基準) | `scripts/lib/textbook-v2.mjs` copy guard (`TERMLIKE_RE`、`code: "copy"`)、D-208 の qid 単位照合 | 常設 (validate) | 教科書の文が過去問の題文・選択肢を写していないか (正規化した 20 字・12 字の連続一致、具体例の流用)。言語の検査ではない | 言語の混入 (観点が違う)。「en 層の D-198 Dice 基準」は S149 時点で未決 (ユーザー判断待ち) の論点で、en の言語検査は存在しない |
| 14a | 教科書の訳審査 (LLM、生成の各批) | `scripts/textbook-v2.workflow.mjs`。訳者への指示は 229 行付近、訳審査の観点「標記」は 252 行付近。批ごとの Rule A (verifier opus) | 生成時に毎回 (LLM、不合格なら補丁)。観点 2「現地化」も zh の日式借词を見る | `**語**` の対応。`[[jp:…]]` が試験の日本語表記を正しく示すか。D-202 の併記規則。指摘例 (S142 b14 u02): 「zh ショルダーハック [[jp:]]」= zh に裸の日本語があり、注記に直した | 機械的な全数検査ではない (目視)。単元を生成した後の補丁 (B3) や一括是正 (C2 / C17) は、その批の審査の後に入る |
| 14b | C2 / C17 裸の JP ラベルの整理 | `evidence/phase5/stage_07_ui/phase3/cleanup/C2.md`・`C17.md` (+ `C17_judged.json`) | 一回限り (S153・S154) | C2: compat 欄で keyword 直後の注記を括弧書きに。C17: glossary に出る欄 (one / detail / hook、zh + en) の「括弧の外の `[[jp:…]]`」209 件を WRAP 15 / KEEP 191 / UNSURE 3 に判定し、16 件を直した | 注記 (`[[jp:`) の**付いた**日本語の置き場所だけを見る。注記の**無い**仮名・漢字は対象外。points 等の glossary に出ない欄も対象外 |
| 14 | UI 文言 `messages/{ja,zh,en}.json` | `apps/web/src/global.d.ts` (`IntlMessages` の型を ja.json から作る) | 常設 (型検査) | `t()` のキーが ja.json にある | zh.json / en.json のキー欠落・余分 (型は ja だけを見る)、値の言語。SSR テストは個別のキーを読むだけ。messages のキーの揃いや言語を確かめる専用の検査は**見つからなかった** |

## 補足

- **データの言語名**: データは `jp` (`_jp`、`{jp, zh, en}`)。`ja` は UI 文言のファイル名だけ。
- **注記の有無**: quiz の sidecar (translations / explanations) には `[[jp:…]]` が 1 件も無い。日本語の原語は「浪费（ムダ）」のような括弧書きで、印が無い。教科書だけが `[[jp:…]]` を持つ (本文に 10,113 個)。
- **互換欄の性質**: v1 互換欄では `compatText` が `[[jp:X]]` を「（X）」/「 (X)」に展開する。そのため互換欄には印の無い日本語が必ず残る (#4 の性質)。

## L2 が埋める穴

既存の検査が見ているもの:

- 構造と件数 (#1・#6・#8)
- 意味の忠実さ (#9・#10、LLM・一回限り)
- 用語の統一 (#7)
- 書式と注記 (#2・#3、および #14a の LLM 目視)

zh / en 欄の裸の日本語は、教科書では #14a の訳審査が目で見ている。ただし**欄の中身がその言語の文字種か**を全対象・全欄について機械的に数える検査は無い。L2 (`scripts/lang-leak-scan.ts`) が足すもの:

1. **zh 欄の仮名** (R-zh-kana): 単元・quiz 訳・解説・UI のすべて。`[[jp:…]]` の内側と単独の選択肢記号 ア〜エ は除外し、除外した分も数える。
   - #2・#3 は注記の書式と有無しか見ない。
   - #9・#10 は文字種を観点にしていない。
   - #14a は教科書だけで、補丁の後は見ていない。
   - #14b は注記の付いたものだけを扱う。
2. **en 欄の漢字・仮名** (R-en-cjk): 同上。en 層には zh_terms (#7) にあたる検査も無い。
3. **ja 欄の簡体字** (R-ja-simp): どの検査も ja 欄に中国語が混ざる場合を想定していない。#12 は OCR 崩れだけを見る。
4. **ja 欄の英文の連なり** (R-ja-latin-run): 訳し戻しの漏れの候補。低信頼。
5. **空欄** (R-empty): UI 文言と quiz 訳に空の検査が無い (#8 はキーの有無だけ、#14 は ja のキーだけ)。単元は #1 で守られているので、L2 では再確認になる。
6. **ja と同一の訳** (R-same): 全対象で検査が無い (#6・#8 は件数と構造だけ)。
7. **文字種では見えない混入** (ja と zh がどちらも漢字だけの文): L2 でも見えない。L3 の無作為抽出の通読 (当たり以外から 60 欄) が受け持つ。
