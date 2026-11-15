# C19b レビュー (Rule D 独立レビュー, S158)

対象: HEAD 8bd834a0 に対する未コミット変更 — zh_terms.json の ASCII 括弧の見出し語 18 件を全角 （ ） に変更 (scripts/c19b-apply.ts, 記録 evidence/phase5/hosting/c19b_apply.json)。
レビュアーは writer とは別 agent。tracked file は変更していない (書いたのは本ファイルだけ)。gitignored の merged.json は merge dry-run で再生成した (writer の script と同じ挙動)。

## 判定: PASS (HIGH 0 / MEDIUM 0 / LOW 5)

## 1. 網羅性
- 18 件の旧文字列 (ASCII 括弧) を tracked file 全体で検索 (evidence/docs/failures は除外)。残っているのは以下だけで、どれも変更すべきでない:
  - `data/ip/quiz/explanations/2015h27a.json` q021 と `2021r03.json` q026 の `key_guard.note_jp`: S130 T2 の是正記録が旧値を引用しているだけ (履歴の注記で、画面には出ない)。
  - `scripts/quiz-fidfix-S130-t2.mjs`: 履歴の fix script (旧値が before)。
  - `scripts/textbook-v2-zh-terms.test.mjs:88,191`: 合成 fixture (`x-01-01-u01` など)。実データの assertion (l.41) は全角に更新済み。
  - `scripts/lib/textbook-v2.mjs:725`: コメントの例。
- apps/web/messages、scripts/fixtures/lang-allow.json、他の fixtures、e2e、quiz の en 層: 該当なし。
- gitignored も検索: 残っているのは `.planning/v2/*/manifest.json` の `.v1.*` と `index_unit.title_zh` (v1 snapshot)、`v1-original.json`、loc part の r0/r1 (patch の base)、journal の rule 文字列、`zh_terms.unit.json` (prep が生成、下記 L3)、quiz の `.phase1/.phase1.5/.phase2` の input/batch/過去の snapshot。どれも出力の正ではない。`manifest.v1_terms` には 0 件。
- 文字列の完全一致に依存する箇所:
  - ExplanationPane の needles `[term, card.gloss]` は完全一致 → gloss と quiz の zh が両方全角になった。旧 ASCII 形を含む quiz 本文は 0 件なので、ハイライトが減ることはない。
  - glossary 検索 (`searchNorm`) と sensei termMatch は NFKC なので、全角と半角は同一視される → 影響なし。
  - glossary の id は JP 見出し語の hash → 影響なし。
  - textbook reader は term_zh を表示するだけ。

## 2. 変更内容の正しさ
- 変更された各 JSON について HEAD と葉ごとに diff を取り、新しい値の全角 head を ASCII に戻すと HEAD の値と完全に一致することを確認 (全件 ok):
  - units: 98 葉 = 57 fields + derived 41
  - quiz: 26 葉
  - zh_terms: 18
  - fixture: 18
- ja/en の field は変わっていない。
- per_unit は `MBO`: strategy-01-01-u06 = `MBO（目标管理）`、strategy-03-09-u04 = `管理层收购（MBO）` (もとから全角、未変更) で正しい。
- `manifest.v1_terms` の term_zh は 10 unit すべてで units の term_zh と一致。fixture `v2-units.v1terms.json` も 10 unit で units と一致。
- merge dry-run を 10 unit 全部で実行 (journal.*.jsonl をすべて渡した)。merged と units の差は c19b_apply.json の baseline_diff と完全に一致:
  - 差 0: u02 / u05 / s-01-01-u06 / s-02-04-u02 / t-14-37-u01 / t-23-63-u12
  - 既存の差 (どれも exit 1): s-04-13-u01 と t-17-48-u01 は `title_zh`、t-17-45-u02 は `challenge_questions[1..3]`、t-23-61-u13 は `challenge_questions[0..3]`
  - exit コードは記録上 before / after とも同じ。
- patch: t-17-45-u02 で既存の 3 件を retire し、composite に置き換え (C17 pattern)。merge 結果が一致するので置き換えは妥当。

## 3. Quiz
- sidecar と HEAD の差は計画の 26 fields だけ。
- translations 12 stem はすべて `.phase1/tr_*` も同じ値になっている (phase1 = fixed)。
- explanations 14 fields は `.phase2/expl_tr_*` と sidecar が一致。
- baseline.jsonl: 8700 行。変わったのは 17 行で、すべて locale=zh。17 qid = 12 と 14 の和集合。変わった field の集合 (stemTr / explCorrect / points) は、qid ごとに計画の field と完全に一致。

## 4. 実行結果
- `npx vitest run src/lib/textbook src/components/practice src/lib/glossary`: 27 files / 327 tests pass
- `node --test scripts/textbook-v2-zh-terms.test.mjs`: 13/13 pass
- `lang-leak-scan.ts --gate`: PASS
- `textbook-v2-zh-terms.mjs --check-units`: warning 2 件 (technology-13-34-u04 尺度、technology-16-44-u01 応答時間)。HEAD の units / zh_terms.json / unit_index.json を `git archive` で scratchpad に出し、`--data-root` で同じ check を回すと同じ 2 件が出る → 既存と確認 (worktree は使っていない)。

## 5. scripts/c19b-apply.ts
- L1 (LOW) 非原子的な apply: manifest (gitignored) を書いてから B3 CLI 登録 (l.195→197)、zh_terms / fixture / translations / .phase1 を書いてから quiz merge の再現 check (l.275-294) という順序。途中で throw すると、gitignored の manifest / .phase1 / .phase2 は git で戻せない。今回の実行は成功しており、結果は上で検証済み。再利用するなら、事前に gitignored の対象を backup してから書くべき。
- L2 (LOW) `parenOnly` (l.49) は「括弧の幅だけの差」を受け入れ、差が 18 head の内側かどうかは見ていない。今回の差がすべて head の内側であることは本レビューの逆変換 check で確認済み。
- L3 (LOW) `.planning/v2/*/zh_terms.unit.json` (prep が生成、localiser / reviewer が読む) には旧 ASCII 形が残っている。今後 prep を再実行すれば再生成されるが、prep を通さずに既存の planning dir で workflow を再開すると、旧表記が localiser に渡る。
- L4 (LOW) 既存の危険で、C19b の範囲外: `technology-17-48-u01` の merge は `title_zh` = `开源软件(OSS)与许可证` を出す (manifest.index_unit.title_zh 由来)。units は全角 `开源软件（OSS）与许可证` で、これは baseline_diff として記録済み。将来この unit を再生成 (--write) するときに ASCII の head が戻る。
- L5 (LOW) l.231 `JSON.stringify(fixture).split("").length && …` は意味のない式 (常に truthy)。動作には影響しない。
- 走査範囲: quiz は stem/choices と correct/distractors/points だけを見る。他の zh field は見ないが、全文の grep で取りこぼしがないことを確認済み。

## まとめ
完全一致の family は units・fixture・manifest.v1_terms・zh_terms・quiz の sidecar/.phase1/.phase2・baseline で一貫している。ja/en は不変。merge は記録された baseline を再現し、gate も test も通る。コミットしてよい。
