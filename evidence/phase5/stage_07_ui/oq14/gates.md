# OQ-14 — Gates (S135)

- 対象: 題図・選択肢図の `<img width height>` (manifest `apps/web/src/lib/quiz/figureDims.json`、543 枚、`scripts/build-quiz-figure-dims.mjs` が commit 済 webp から生成) + 解答後スクロールを face 内の図の読込後 (上限 1000 ms) に計測。
- 前 attempt: `failures/phase5/stage_07_ui/oq13_prod_e2e_attempt_2.md` (本番で図の読込が遅く scrollY 0)。

## TDD
- Red (修正前 build、:3150): 新 e2e `practice.spec.ts` 「a slow figure keeps its space… (OQ-14)」 = **FAIL** — 図応答を保留中の図の高さ `Received: 0` (期待 > 100)。OQ-13 の 2 件は PASS (ローカルは図が即時のため再現しない = 本番との差を説明)。
- vitest red: `figureDims` 未実装で import 失敗 (3 file)。

## Green (修正後)
- tsc 0 / eslint 0 / vitest **1110/1110** (99 files) / build (turbopack) 0
- local e2e 全量 **120/120** (:3150、Redis/KV env 空、1.8m、`--retries=0`)。server PID 停止・:3150 解放確認、:3000 未使用。
- 新規 vitest: manifest = 全 webp の sharp 実寸と一致 / corpus の全 figure・choice_figures に entry / SSR で `width`/`height` 出力 (題図・選択肢図)。fidelity baseline 不変。
