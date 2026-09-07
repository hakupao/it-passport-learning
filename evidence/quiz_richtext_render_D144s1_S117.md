# D-144 段 1 — 題幹/選択肢 構造化テキスト描画の抽検 (規則 A、S117)

**変更**: `apps/web/src/lib/quiz/quizRichText.ts` (純関数: 行頭 `|` 連続行 → table、``` 囲み → code、`[表] a: X, b: Y` / `a:X b:Y` → pairs、
`[表] caption:\n| … |` → table)、`apps/web/src/components/quiz/QuizRichText.tsx` (StemBlocks / ChoiceBody)、`QuizSet.tsx` の stem/choices を差し替え。
**データ変更ゼロ**。Markdown 汎用パーサは不採用 (擬似言語の全角インデント・`[ a ]` 空欄・丸数字が壊れるため)。

## 機械検査 (全量、`quizRichText.test.ts`、19 tests)
- 題幹 2900 問 × 3 言語: ブロック分解の往復で非空白文字の欠落ゼロ / 表は全て矩形・見出し非空 / text ブロックに表行・囲み残存ゼロ
- `[表]` 選択肢 (83 問 × 3 言語): text への取りこぼしゼロ、同一問の 4 肢で形 (pairs のセル数 / table) が一致
- 実測 (Rule D MINOR-4 で訂正): 題幹に表 258 問 (うち区切り行あり 235、無し 23; header-only 表を含む題幹 22)、``` 囲み 9 問 (27 インスタンス)、`[表]` 選択肢 83 問 (jp 332 肢 / zh 6 / en 0)、`[表]` 無しのキー付き選択肢 46 問、訳文が裸の表行 10 問 / 80 肢、`[table]` 表記 2 問 / 6 肢

## 目視抽検 (N=15 + 追補 6、dev サーバ localhost:3117、Playwright で article 単位に撮影 → 主 context が源図と並べて実読)
| 形 | id / 言語 | 結果 |
|---|---|---|
| 散文 + 表 2 枚 (区切り行あり) | 2021r03-q095 ja / zh | PASS: 2 表、セル値・行順・空セル位置とも源図と一致、zh 見出しも表に |
| 角セル空の表 (スプレッドシート) | 2016h28a-q082 ja | PASS: 角セル空・D 列空セルが表として保持 |
| 擬似言語 (全角インデント・[ a ] 空欄) | 2026r08-q085 ja | PASS: 単一 text ブロック、インデント・空欄記法とも原文どおり |
| header-only スキーマ表 ×3 | 2010h22h-q093 ja | PASS: 見出しだけの表 3 枚、後続の散文・〔…〕条件文は text |
| `[表] a: X, b: Y` 選択肢 | 2023r05-q037 ja / en | PASS: a/b がキー付きチップで 4 肢整列 (en は `a: appearance, b: objective` の text のまま = 訳文が [表] 接頭を持たないため) |
| キー無し `[表]` セル列 | 2009h21h-q061 ja | PASS: 3 セル横並び |
| `[表] caption:\n表` 選択肢 | 2009h21a-q060 ja | PASS: 4 肢それぞれ caption 付き 1 行表 |
| 値に「，」「／」を含むキー付き | 2015h27a-q075 ja | PASS: b 値「OS，アプリケーションに…」が 1 セルで保持 |
| 図枠残渣 `\|        \|` | 2019h31h-q096 ja | PASS (v1 で ``` が生表示 → code ブロック追加後 v2 で等幅枠内に木構造) |
| 角セル空 + 3 列 | 2026r08-q044 ja | PASS |
| `[表]` 無しキー付き 3 キー | 2010h22a-q045 ja | PASS: a/b/c チップ |
| `a:以下 b:と等しい` | 2026r08-q085 ja (v2) | PASS: pairs 化 |
| **Rule D 後の追補** | | |
| 省略行 `\| : \| : \|` を含む表 | 2016h28a-q074 en | PASS (v1 では省略行 2 本が区切り行として消えていた → v3 で保持) |
| 見出し行が空の損益表 | 2014h26a-q001 ja | PASS (v1 では「売上高 900,000」が `<th>` に昇格 → v3 で見出し無し表、全角インデントも保持) |
| 訳文の裸の表 | 2009h21a-q060 en | PASS (v1 では縦線テキスト → v3 で caption 付き表) |
| インライン複数見出し表 | 2017h29h-q069 ja | PASS: 表1/表2 の見出しだけの表を横並び (4 肢とも) |
| 全角縦線 + 3 スキーマ | 2018h30h-q081 en | PASS: Customer/Product/Order の 3 表 (ウ/エ は源どおり 2 表) |
| 訳文の無印キー無しセル (jp 形ヒント) | 2009h21h-q061 zh | PASS: jp と同じ 3 セル横並び |

抽検で見つけ是正したもの: (1) ``` 囲み 9 問が生表示 → code ブロック (2) `[表]` 無しのキー付き選択肢 46 問が text → pairs。

## Rule D (pr-review-toolkit:code-reviewer、別 agent) — 初回 **FAIL** → 是正 → 再検証
| 級 | 指摘 | 是正 |
|---|---|---|
| MAJOR-1 | 区切り行正規表現が全行に効き `-` を要求しないため、省略行 `\| : \| : \|` (2016h28a-q074 en、2015h27a-q085 三語) と `\| - \| - \|` データ行が消える。全量往復テストは `:`/`-` を strip していたため構造的に見えなかった | 区切り行は「表ブロック 2 行目」かつ各セル `/^:?-+:?$/` に限定 (`isSeparatorRow` export)。往復テストの strip を `[\s\|\x60]` に縛り、期待値も同規則で生成 |
| MAJOR-2 | 空の見出し行 `\| \| \|` が区切り扱いで消え、データ行が `<th>` に昇格 (2014h26a-q001 / 2020r02o-q033) | 先頭行が全セル空なら header=[] の見出し無し表、`<thead>` を出さない |
| MAJOR-3 | zh/en の表型選択肢 (10 問 / 80 肢) は `[表]` 接頭が無く縦線テキストのまま、pre-wrap で以前より目立つ | 表行があれば接頭に依らず表に。訳文の pairs は jp 形をヒントにセル数一致で採用 (`parseChoiceWithHint`) |
| MAJOR-4 | `[table]`/`[Table]` (2019r01a-q099 / 2024r06-q057 en) が字面で漏れる。形一致テストが jp 限定 | 接頭正規表現を `[表\|表格\|table]` (大小無視) に。text へ落ちる場合も接頭を剥がす。形一致テストを (問, 字母) × 三語に |
| MINOR-1 | セルの全角インデント (「　変動費」) が trim で消える | ASCII 空白だけ trim |
| MINOR-2 | 矩形不変式が pad 後を見る空断言 | `padded` フラグを pad 前に立て、それを断言 |
| MINOR-3 | 普通選択肢 142 肢に pre-wrap で OCR 空白が可視化 | 普通選択肢は従来の `<span>` に戻す (pre-wrap は pairs/table のみ) |
| MINOR-4 | 計数分解 190/68 が不正 (実測 235/23、header-only 22) | 本 evidence を訂正、258 は下界 pin に |
| MINOR-5 | 無印キーが a–d 限定で PDCA 題 (2025r07-q083) が text | 1 文字キー全般に拡張 (略語誤検出を避けるため 1 文字に限定と注記) |
| NIT | a11y (行見出し th scope=row / caption)、`.pairValue` の word-break、`tsx` テスト基盤 (vitest env=node で component 未テスト) | word-break 追加。a11y と jsdom 導入は **段 4 前の宿題**として STATE ⑨ に登録 |
是正後: 27 tests (全量不変式 8 本) / tsc 0 / eslint 0 / vitest 491 / `next build` exit 0 / 追補抽検 6 件 PASS。
**未処置 (登録)**: zh/en の `[表]` 選択肢は訳文側に `[表]` 接頭が無く `a: X, b: Y` 形 → 現状 text 表示 (可読、ただし jp とチップ表現が揃わない)。段 2 以降で訳文にも同じ分類を当てるか要判断。題幹の `- ` 箇条書き 41 問・`**` 強調 4 問は text のまま (原文どおり読める)。
図題では **表を構造化表示した直後に源図も表示**されるため同じ表が 2 回見える (源図が権威、D-135)。図の非表示/折りたたみは ② 段 2 以降で扱う。

## ゲート
tsc 0 / eslint 0 / vitest 491 (新規 27) / `next build` exit 0。Rule D = 上表。
スクリーンショット: `evidence/phase5/stage_06_quiz_richtext/*.png` (12 枚)。
