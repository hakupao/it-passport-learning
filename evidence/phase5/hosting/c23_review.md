# C23 Rule D レビュー (S157) — quiz 表示の生記法 (`<br>` / `**`)

- 対象: HEAD e440a332 に対する未コミット差分 (QuizRichText.tsx / QuizRichText.ssr.test.ts / translations/2009h21a.json / stage_07_ui/baseline.jsonl / 新規 scripts/c23-quiz-bold.ts, evidence/phase5/hosting/c23_bold.json)
- レビュアー: oh-my-claudecode:code-reviewer (writer とは別 lane, Rule D)
- 総合判定: **PASS (COMMENT)** — C23 の範囲 (題文) は正しく直っている。範囲外の残件 1 件 (解説の生 `**`) を MEDIUM として起票推奨。

## 検証したこと (再現手順つき)

| # | 検査 | 結果 |
|---|---|---|
| 1 | `cd apps/web && npx vitest run src/components/quiz src/components/practice` | 11 files / 117 tests 全 pass |
| 2 | `npx tsc --noEmit --incremental false -p apps/web` | エラー 0 |
| 3 | `npx eslint` QuizRichText.tsx / ssr test | エラー・警告 0 (scripts/ は eslint 対象外 = 既存方針) |
| 4 | baseline.jsonl を `git show HEAD:` と qid+locale キーで行ごと・項目ごとに比較 | 8700 行・キー集合同一。変化は `stemJp` 48 行 + `stemTr` 32 行のみ、16 題 (2009h21a-q097〜q100, 2012h24a-q080, 2013h25a-q093〜q096, 2014h26a-q089〜q092, 2016h28h-q001, 2016h28h-q030, 2019r01a-q070)。それ以外の項目 (choices / expl / points / figure / suspect) は 0 件変化。**主張と一致** |
| 5 | translations/2009h21a.json の差分 | 変化は q097〜q100 の 4 題のみ。旧値から `**` を全部除いた JSON が新値と完全一致 (=`**` 除去以外の変更なし)。メタ項目も同一。12 行 +/12 行 - |
| 6 | 全データ走査 (questions.json 全項目 / translations 29 件 / explanations 全件の全文字列) | 下記「データ走査」 |

## データ走査

### `<br>`
- 合計 73 箇所 = questions.json stem_jp 7 箇所 (3 題: 2016h28h-q001 / 2017h29a-q035 / 2019r01a-q070) + translations stem_jp_clean・zh・en 各 22 箇所 (12 題)。項目数で数えると 3 + 12×3 = 39 (主張の「3 / 12 each」は項目数、「73」は出現数で整合)。
- 表記揺れ: 全部 `<br>` のみ (`<br/>`, `<BR>`, `<br />` は 0)。CellText の `/<br\s*\/?>/i` はこれらも拾う。
- 位置: 73 箇所すべて `| … |` 行内 (表外 0)。前後に空白がある例も 0 (`x<br>x` 73/73) なので `white-space: pre-wrap` の td で行頭・行末の空白が見える問題も起きない。
- choices (questions.json / translations) と explanations には `<br` が 0 → ChoiceBody の table/pairs 経路・ExplanationPane で生表示される箇所は **なし**。
- textbook: units JSON に 0。`<br />` があるのは figures/*.svg (画像として配信) と `.planning/` manifest (非公開) のみ → quiz 変更とは無関係。

### `**`
- 題文・選択肢 (questions.json / translations): 変更後 **0**。
- explanations: 616 箇所。うち 610 は `key_guard.note_jp` / `key_guard.round1.note_jp` で、`lib/staticData/forbidden.ts` によりビルドから除外 (非表示)。
- **残り 6 箇所 = 2009h21a-q096 の distractors.イ (jp/zh/en 各 2)**: 「商品回転率が 10 回**以上**」/「10 次**以上**」/「10 times or **more**」。正答はア なのでイは × 行の `<details>` 本文に出る。ExplanationPane は `marked()` (用語ハイライトのみ、Markdown 非対応) で描くので **生の `**` が見える**。→ 下記 MEDIUM-1。

### その他のタグ風文字列 (参考、問題なし)
- `<img src=" a ￥s01.jpeg " … >` (2011h23tokubetsu-q100 / questions.json 1 題): HTML を題材にした設問の本文そのもの。React text なのでエスケープ表示で正しい。
- en の `<Decision 1>`, `<Photo 1>` 等、解説の `<p>`, `<table>`, `<script>`, `<chapter>`, `<u>` (key_guard、非表示) 等: いずれも説明対象としての文字列。React が escape するので XSS なし・表示も意図どおり。

## 指摘

### MEDIUM-1 解説の生 `**` が 1 題残っている (範囲外・既存)
- File: data/ip/quiz/explanations/2009h21a.json — `2009h21a-q096.distractors.イ.{jp,zh,en}`、描画は apps/web/src/components/practice/ExplanationPane.tsx (`marked(text)`、vBody)
- Confidence: HIGH (データと描画経路を確認。fidelity baseline にも 2009h21a-q096 の explDistractors index 1 が載っている)
- Issue: C23 と同じ症状 (quiz 表示の生記法) だが C23 の棚卸しは stem だけだったため漏れた。ここの `**` は「以上 ↔ 以下」の読み違えを強調する意味がある。
- Fix: 別行 (C23 追補 or C24) で explanations sidecar の該当 6 箇所を処理。強調の意味を残すなら `**以上**` →「以上」の鉤括弧化ではなく、すでに「」内なので単純除去で十分 (「商品回転率が 10 回以上」)。en は `**more**` → `more`。あわせて SSR テストの全件走査を explanations (correct / distractors / points、表示 3 言語) にも広げる。

### LOW-1 全件走査テストが stem だけ
- File: apps/web/src/components/quiz/__tests__/QuizRichText.ssr.test.ts (新規 2 本目の it)
- Confidence: HIGH
- Issue: choices (ChoiceBody 経路) と explanations を見ていない。現データでは choices に `<br>` / `**` は 0 なので現時点の偽陰性はないが、MEDIUM-1 はこの穴で見逃された種類。
- Fix: ChoiceBody も同様に全件描画して `&lt;br&gt;` / `**` を検査、explanations は practice 側テストで同様に。

### LOW-2 テスト内の副作用式が読みにくい
- File: 同上 `(trCache.get(q.exam_id) ?? (clean(q.id), trCache.get(q.exam_id)!))`
- Confidence: HIGH
- Issue: `clean()` がキャッシュを埋める副作用にカンマ演算子で依存。動作は正しい (テスト pass) が意図が読み取りにくい。
- Fix: `function trFor(examId)` のような小さな loader を切り出す。

### LOW-3 gitignore 層 (.phase1 / .phase1.5) との差
- File: scripts/c23-quiz-bold.ts, evidence/phase5/hosting/c23_bold.json (`differs (left)`)
- Confidence: MEDIUM
- Issue: 将来 sidecar を .phase1 から再生成すると `**` caption が戻る可能性。ただし新テスト (全 stem 走査) が落ちるので無音回帰にはならない。preambleChars は practiceIndex.ts で表示 stem の LCP からビルド時計算なので fold 位置のずれは起きない (4 題とも同一の除去なので共有前文も一致を保つ)。
- Fix: 不要 (テストで担保)。気になるなら c23_bold.json に「再生成時は再適用」と一行。

### LOW-4 PLAN の C23 行が「候補 (未着手)」のまま
- File: docs/phase5/PLAN_stage7_phase3_cleanup.md:33
- Confidence: HIGH
- Fix: コミット時に状態を更新 (D-027 state sync)。

### LOW-5 (情報) CellText の正規表現範囲
- File: apps/web/src/components/quiz/QuizRichText.tsx:16-25
- Confidence: HIGH
- `<br clear="all">` や `< br>` は拾わないが、データに 0 件なので問題なし。`BR` は非 global (lastIndex 状態なし)、split 用は毎回 `new RegExp(…, "gi")` で正しい。split の結果は文字列 → React text 子要素なので innerHTML 経路なし (XSS なし)。key=index は静的リストなので可。

## (d) a11y / layout
- `<br>` は phrasing content で `<th>` / `<td>` の中に置くのは HTML 上正しい。th の `scope="col"` は不変。スクリーンリーダーはセル内容を続けて読むだけで、セル境界・表構造には影響しない。
- td/th は `white-space: pre-wrap` (richText.module.css:29-35) だが `<br>` 前後に空白がないので余分な空白は出ない。改行で行高が増えるだけで、表は `tableWrap` で横スクロールのまま。
- parseStemBlocks で全 stem (4 層) を解析した結果、`<br>` を含むセルは th 9 / td 44。th も同じ CellText を通るので両方とも改行表示になる (新テストの全件走査で th 側も `&lt;br&gt;` 0 を担保)。

## (b) `**` を消すか太字対応するか
- 題文の 4 題は **除去が妥当**。理由: (1) jp 原本 (questions.json stem_jp) の図キャプションに `**` はない — 訳層・clean 層の生成時に付いた装飾で、原典忠実性 (D-136 系) から見ても除去が正、(2) quiz の題文で `**` を使うのはこの 1 組だけで、太字レンダラを足すと `parseStemBlocks` の純関数・全件 fidelity baseline の契約を広げる割に得るものがない、(3) 擬似言語や `*` を含む本文で誤爆の危険。
- 解説側も `**` 利用は q096 イ 1 箇所のみ (key_guard は非表示) なので、同じく除去で統一するのが一貫する (MEDIUM-1)。textbook は独自の inline.ts で `**` を処理しており別系統。

## Positive
- 描画は React text のみで dangerouslySetInnerHTML なし、データ不変 (表示層だけで `<br>` を解釈)。
- `**` 除去スクリプトに「各項目ちょうど 2 行 + 他に `**` なし」の事前条件チェックがあり、plan/apply 2 段・記録 JSON 付き。
- 全 stem × 4 層を描画して検査する回帰テストを追加 (再生成による回帰も捕捉)。
- baseline 再取得の範囲が主張どおりに最小 (16 題の stem のみ)。

## 判定
**PASS** (HIGH 信頼度の CRITICAL / HIGH なし)。MEDIUM-1 は C23 の差分ではなく既存データの漏れなので、本変更をブロックせず別行で処理を推奨。
