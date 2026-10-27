# OQ-14 — Gates (S135)

- 対象: 題図・選択肢図の `<img width height>` (manifest `apps/web/src/lib/quiz/figureDims.json`、543 枚、`scripts/build-quiz-figure-dims.mjs` が commit 済 webp から生成) + 解答後スクロールを face 内の図の読込後 (上限 1000 ms) に計測。
- 前 attempt: `failures/phase5/stage_07_ui/oq13_prod_e2e_attempt_2.md` (本番で図の読込が遅く scrollY 0)。

## TDD
- Red (修正前 build、:3150): 新 e2e `practice.spec.ts` 「a slow figure keeps its space… (OQ-14)」 = **FAIL** — 図応答を保留中の図の高さ `Received: 0` (期待 > 100)。OQ-13 の 2 件は PASS (ローカルは図が即時のため再現しない = 本番との差を説明)。
- vitest red: `figureDims` 未実装で import 失敗 (3 file)。

## Green (修正後)
- tsc 0 / eslint 0 / vitest **1110/1110** (99 files) / build (turbopack) 0
- local e2e 全量 **120/120** (:3150、Redis/KV env 空、1.8m、`--retries=0`)。server PID 停止・:3150 解放確認。:3000 にはユーザー自身の listener (本 session は未接触)。
- 新規 vitest: manifest = 全 webp の sharp 実寸と一致 / corpus の全 figure・choice_figures に entry / SSR で `width`/`height` 出力 (題図・選択肢図)。fidelity baseline 不変。

## Rule D (oh-my-claudecode:code-reviewer, opus) — APPROVE-with-notes、CRITICAL/MAJOR 0
- MINOR-1 (stale 判定が pos 比較のみ → startOver / 前後移動で戻った題に遅れてスクロール) → **修正**: `navSeq` ref (題・まとめへの移動ごとに +1) + 題 id 一致 + 解答済の 3 条件。
- MINOR-2 (画面外の lazy 選択肢図は読まれず毎回 1 s 待つ) → **修正**: 待つのは viewport 下端より上に始まる図のみ。
- MINOR-3 (e2e (b) は width/height だけでも green、待機層の単独回帰保護なし) → **受容**: (b) は寸法 + 待機の組合せ覆蓋。根本対策は寸法 (a で red→green 証明済)、待機は兜底。
- NIT ×2 (JSON の unknown cast / 残る error listener) → 受容 (drift test が型を担保、挙動影響なし)。
- 修正後 Gates: tsc 0 / eslint 0 / vitest 1110 / build 0 / local e2e **120/120** (:3150、PID 停止・解放確認)。

## 本番
- main `eecaa34` push → 本番 HTML で `2023r05-q086` 題図 `width="900" height="809"` を確認 (デプロイ反映)。
- 本番 e2e 全量 (`--retries=0`) = **120/120** (4.4m)。S134 で失敗した `practice.spec.ts` OQ-13 1 カラム test を含め PASS。
