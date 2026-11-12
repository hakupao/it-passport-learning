# H7 §6-8 — 新 local-e2e.sh の初回実走 attempt 1 (2026-11-12、executor opus)

- **入力**: `$S/local-e2e.sh management-10-27-u01 h7chk management-10-27 u01` (scratchpad 複製、commit 69b5daf5 相当)。
- **産物**: gates 全 PASS (tsc 0・eslint 0・vitest 1526・check:release 0)、3 服務起動 (`/ja` 200)、截図検査と Playwright が失敗 (e2e exit 1)。終了後ポートは解放済。log: scratchpad `h7chk-run.log`、`h7chk-e2e.log`。
- **技術判定 FAIL**:
  1. 呼び方の誤り: 試点単元 `management-10-27-u01` を `$1` に渡した。script は試点 3 単元を自動で足すので `textbook-v2.spec.ts:347` がテスト名の重複で落ちた。
  2. 環境: この shell の `PLAYWRIGHT_BROWSERS_PATH=/Volumes/DevSSD/caches/ms-playwright` が存在しない (chromium-1223 は `~/Library/Caches/ms-playwright`)。H5 でも手で上書きしていた。
- **業務判定**: script 自体の欠陥ではない (2 回目で 163 passed / 0 failed / 2 skipped)。ただし 2 は次回の正式実行でも再発する → 環境変数の扱いを決める (README に注記するか script で検査する)。
- **次 attempt の入力**: 非試点単元 `management-08-25-u01 h7chk2 management-08-25 u01` + `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright` → PASS。
