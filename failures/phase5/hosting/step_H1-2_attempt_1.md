# H1-2 公開データの切り出し — attempt 1: Rule D FAIL (解説の言語切替)

- 日時: 2026-11-11 Session 154、branch `hosting-cf` (未 commit)
- 入力: PLAN §2 H1-2。試験回 × 言語の過去問 JSON、25 題ごとの解説塊 (言語別)、索引・today・用語カード・単元・AI 先生用語。
- 産物: `apps/web/src/lib/staticData/{shards,build,allowList,client}.ts`、`apps/web/src/app/data/**` の force-static route 7 種、493 ファイル (raw 54 MB / gzip 17.5 MB)、テスト +34 (vitest 1329)。
- 技術判定: tsc / lint / vitest / build すべて 0、IPA nft gate 0、内部欄・IPA 原本文の流出なし (独立 walker で 493 ファイル)、Rule A 10 題 × 3 言語 = 30 ページ全一致 (seed 20261111)。
- 業務判定: **FAIL** (verifier opus)。
  - HIGH-1: 解説塊が「JP + そのページの言語」しか持たない。`ExplanationPane` の 日/中/EN 切替 (D-186、UI 言語と独立) で他の言語を押すと `localized(jp, zh, "", "en")` が JP に戻り、`lang="en"` のまま日本語が出る。writer のテストは (locale, locale) と (locale, "ja") しか比較しておらず見逃した。
  - MEDIUM-1 (既存): 現行ページが loader の QuizQuestion 全体 (`key_guard.note_jp` 等) を client props に渡している → H1-4 の事前生成前に投影経由へ。
  - MEDIUM-2: `fetchQuestions` は不正 id 1 件で全体が reject (`examOfId("abc")` → `ab`、`q999` → 存在しない塊)。
  - LOW-1〜4: 解説の期待値が削除法でない / today・cards・sensei は同源比較 / `SENSEI_MAX_IDS` の二重定義 / id を path に使う前の検査なし。
- 原因 (作成側): 「client は JP + active locale しか読まない」という前提を、解説の言語切替 UI を確かめずに置いた。
- 次 attempt の入力: 解説塊を 3 言語同梱に (言語に依らない塊 → ファイル数も減る)、題文・選択肢の訳表示切替も同じ前提が成り立つか確認、3×3 (ページ言語 × 表示言語) の描画比較テスト、`fetchQuestions` 内で QUESTION_ID_RE + index による id 絞り込み (+ テスト)、定数の共有、解説期待値を削除法に。MEDIUM-1 は H1-3 で対応。
