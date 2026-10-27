# Stage 7 OQ-13 — 本番 e2e 再発 (原因特定)

- 日期: 2026-10-27 (S134)
- 输入: main `1d9ff59` (Phase 3a 上線) を本番 alias に対し `pnpm exec playwright test --retries=0 --reporter=list` 全量、完全ログ保存 (scratchpad `prod_e2e_3a.log`、失敗時 screenshot `prod_e2e_3a_fail.png`)。
- 产物: 118 passed / **1 failed** = `e2e/practice.spec.ts:379` (OQ-13 1 カラム)。attempt 1 (`oq13_prod_e2e_attempt_1.md`) と同じ test・同じ題 `2023r05-q086`。
- 技术判定: `expectAnswerScroll` の `expect(m.list.bottom).toBeLessThanOrEqual(m.vh)` で Received 1427.48 > 1000。失敗時 screenshot = 解答済 (答題カード ○) なのに scrollY 0、題の大きな図が表示中。**原因**: 題図は `<img loading="lazy">` に width/height が無く (`PracticeQuestion.tsx:358`)、読込前の高さ 0。本番では図の読込が遅く、解答直後のスクロール判定 (`PracticeSession.tsx` 「見出しが既に全部見えていれば動かない」) の時点で見出しが viewport 内に見える → スクロールしない → 図が読み込まれて全体が下へ押し出される。ローカルは図が即時に読めるため再現しない。attempt 1 の「再現せず」もこれで説明がつく。
- 业务判定: 実機の不具合 (test の不安定ではない)。大きな図のある題で、解答後に解説へスクロールしないことがある。データへの影響なし。3a 起因ではない (OQ-13 の S134 上線時から存在)。→ **OQ-14** として登録。
- 下一 attempt 的输入: 題図・選択肢図に固有寸法を与えて読込前から場所を確保する (build 時に `public/quiz-figures/*.webp` の width/height を manifest 化し `<img width height>` + CSS `height:auto`) — CLS も解消。保険として、スクロール判定を図の読込完了 (`img.decode()` / `complete`) 後に行う。e2e は本番の遅い読込を模すため route で図の応答を遅延させて再現テストを作る。
