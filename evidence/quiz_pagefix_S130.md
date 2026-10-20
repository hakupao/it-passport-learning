# S130 pagefix — source 頁ポインタ是正 5 件 + 題幹頁規約 + next_page_png

- 入力: `evidence/S129_L2a_pageoffset.md` §2.1 / §5 (確定ずれ 3 件 + 頁またぎ規約判断 2 件)
- 規約 (S130 lead 決定、D-161 委任): **題幹と選択肢が頁をまたぐ問は `page_number` = 題幹頁**。別頁の図は D-145 `figure_page_*` で保持する。
- 判定 JSON (tracked、恒久記録): `evidence/phase5/stage_06_quiz_fidelity/pagefix_S130_decisions.json`
- lane: pagefix-fixer (D-152 data lock 保持)。stem / choices / correct_answer / explanations / 訳は無変更。commit は主 context。

## 1. 判定 (全件 頁 PNG を目視)

| id | 記録 | 是正後 | figure_page | 根拠 (目視) |
|---|---|---|---|---|
| `2015h27a-q087` | 37 | **38** | 36 (維持) | page-37 = 問86 題幹 + 図2 のみ。page-38 中段に問87 題幹と ア 49 / イ 126 / ウ 162 / エ 164 |
| `2016h28h-q049` | 23 | **22** | — | page-22 下段に問49 (プロトタイプ) 題幹 + ア〜エ。page-23 は問50 のみ |
| `2024r06-q058` | 26 | **25** | — | page-25 下段に問58 (マクロ) 題幹 + ア〜エ。page-26 は問59・問60 |
| `2015h27a-q088` | 39 | **38** (規約) | **39 (新設)** | 題幹は page-38 下半、図3 + ア〜エは page-39。bbox {0.05,0.05,0.85,0.52} は page-39 実測なので figure_page ← 旧頁 39 |
| `2012h24a-q088` | 37 | **36** (規約) | 33 (維持) | 題幹 + ワークシートは page-36、ア〜エ (IF 式 4 本) は page-37 上段のみ |

指示と矛盾する観測は 0 件。

## 2. source before / after (apply 出力)

| id | before | after |
|---|---|---|
| 2015h27a-q087 | page-37 / fig page-36 | page-38 / fig page-36 |
| 2016h28h-q049 | page-23 | page-22 |
| 2024r06-q058 | page-26 | page-25 |
| 2015h27a-q088 | page-39 (fig 欠如 = 同頁) | page-38 / fig page-39 |
| 2012h24a-q088 | page-37 / fig page-33 | page-36 / fig page-33 |

- bbox 相: 適用 0 / 据置 5 → `figure_bbox_pct` 変化 0、再裁断なし (`--no-recrop`)、WebP 変化 0。
- 冪等: apply 後の再 dry-run = 適用 0 / 既適用 5。

## 3. script 変更 (最小)

1. `scripts/quiz-pagefix-apply.mjs` — assert-once ガードが「既に `figure_page_*` があれば目標と違う限り中止」で、**既存 figure_page を維持したまま設問頁だけ動かす** MOVE_QUESTION (q087 / 2012h24a-q088) を拒否した (初回 dry-run で throw)。既存 `figure_page_*` が目標と同値の場合のみ通すよう緩和 (+3 行)。figure_page が違う場合は従来どおり throw。`--self-test` 24 assertions ✅。
2. `scripts/quiz-fidelity-prep-any.mjs` — `prev_page_png` の隣に `next_page_png` (page NN+1、存在時のみ) を出力。smoke: `2015h27a` q86/87/88/100 で prev/next が正しく出る (smoke manifest は data/ から scratchpad に退避済)。
3. `scripts/quiz-s7x-fidelity.workflow.mjs` — 入力に `next_page_png` の bullet、第 4 条に「選択肢 (または題幹の一部) が crop にも source にも見えなければ `next_page_png` (無ければ `page-(NN+1).png`) も Read」を追加。**0b 隔離条項の許可リストにも `page-(NN+1).png` を追加** (しないと第 4 条の新指示と衝突する)。

## 4. 派生層

- `data/ip/quiz/questions.json` (tracked) は `source` を射影しない (S118 §4 と同じ。keys = id, exam_id, topic_id, category, source_label, stem_jp, choices_jp, correct_answer, has_figure, figure, figure_type, terms)。
- `node scripts/build-quiz-corpus.mjs` を再実行 → sha1 `8c4e4748…` **逐字不変**。同期不要。
- 書き換わったのは gitignore 層のみ: `data/ip/exams/question_bank.json` + `by_year/{2012h24a,2015h27a,2016h28h,2024r06}.json`。**tracked の判定 JSON が恒久記録** (再構築時は同 JSON を apply すれば再現)。

## 5. ゲート

| コマンド | 結果 |
|---|---|
| `node scripts/quiz-pagefix-apply.mjs --self-test` | ✅ 24 assertions |
| `node scripts/quiz-keys-crosscheck.mjs` | ✅ questions=2900 exams=29 layerB=ran / all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 (A)(B) GREEN |
| `node scripts/quiz-chumon-groups-build.mjs --check` | ✅ 生成結果と一致 (既存 warn `2015h27a-mqTech2: registry に対応する組が無い` は HEAD の script でも同じく出る、頁ポインタと無関係) |
| `node scripts/build-quiz-corpus.mjs` | ✅ questions.json 逐字不変 |
| `node apps/web/node_modules/vitest/vitest.mjs run --root scripts --globals quiz-fidelity-machdiff` | ✅ 42 passed |
| `pnpm … -C apps/web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm … -C apps/web lint` | ✅ 0 errors / 1 warning (既存: `RetroGlossary.tsx:31 tTerm` unused) |
| `pnpm … -C apps/web test` | ✅ 38 passed / 1 skipped files、562 passed / 2 skipped |
| `pnpm … -C apps/web build` | ✅ exit 0 |

(`node --check` は workflow script の top-level `return` で不可 — workflow 形式の仕様で、変更前から同じ。prep-any / pagefix-apply は ✅)

## 6. 変更ファイル (`git status --short`)

```
 M scripts/quiz-fidelity-prep-any.mjs
 M scripts/quiz-pagefix-apply.mjs
 M scripts/quiz-s7x-fidelity.workflow.mjs
?? evidence/phase5/stage_06_quiz_fidelity/pagefix_S130_decisions.json
?? evidence/quiz_pagefix_S130.md
?? docs/discussion/2026-10-20-session-130.md   (主 context のもの、本 lane は未変更)
```

gitignore 層 (未 track): `data/ip/exams/question_bank.json`、`data/ip/exams/by_year/{2012h24a,2015h27a,2016h28h,2024r06}.json`。

## 7. 申し送り

- `2015h27a-q087` は旧記録では agent に設問が見えなかった (L2a §5-1)。この exam に既存の fidelity 結果があれば q087 の再確認が要る (本 lane は未確認)。
- 規約により今後の頁またぎ問は `page_number` = 題幹頁。選択肢が次頁の場合は manifest の `next_page_png` で agent に届く。

## 8. Rule D 後の追補 (reviewer PASS-with-notes、MINOR 対応)

- `quiz-pagefix-apply.mjs` の緩和ガードを純関数 `export function assertFigurePageOnce(before, target, id)` に抽出し、主ループはこれを呼ぶ。self-test に 2 件追加 (既存 figure_page == 目標 → 通す / 異なる → throw) → `--self-test` **26 assertions ✅**。`--dry-run --decisions pagefix_S130_decisions.json` = 適用 0 / 既適用 5、`quiz-keys-crosscheck` = all invariants hold (A1–A7, B1–B7)。
