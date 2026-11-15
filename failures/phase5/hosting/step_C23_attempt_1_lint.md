# C23 — attempt 1: `check:release` FAIL (lint) (S158)

- **入力**: C23 の Rule D LOW-1/LOW-2 対応で `QuizRichText.ssr.test.ts` の全量走査を選択肢・解説まで広げた直後の `pnpm check:release` (+ local e2e)。
- **産物**: なし (build の lint 段で停止、`out/` 未生成、e2e は :3150 が 000 で走らず)。
- **技術判定**: FAIL — `next build` の lint で `@typescript-eslint/no-explicit-any` ×4 (sidecar 読込み関数の `Record<string, any>`)。vitest / tsc は通っていた。試験を書き換えた後に lint を回していなかった。
- **業務判定**: 影響なし (data・描画の変更は検査済、試験コードの型だけ)。
- **次の attempt の入力**: `any` を型 `Entry` / `L3` に置換 → `pnpm lint` 0・tsc 0・quiz 試験 13 緑を確かめてから `check:release` + e2e を再実行。
- **教訓**: 試験ファイルの変更後も lint を回す (build の lint は試験ファイルも見る)。
