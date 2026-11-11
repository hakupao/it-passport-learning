# D-217 第 0 段 (止血) — attempt 1: 緩めた robots.txt が Rule D で FAIL

- 日時: 2026-11-11 Session 154
- 入力: ユーザー方針「可以被爬虫、希望被谷歌索引」→ `*` group の Disallow を `/api/` と 3 言語 × record / settings だけに緩めた版。
- 産物: `apps/web/public/robots.txt` (緩和版)、`apps/web/src/__tests__/robotsTxt.test.ts` (`*` の Disallow を完全一致で固定)。
- 技術判定: tsc 0 / eslint 0 / vitest pass。RFC 9309 の書き方・コメント・ADR との一致は正しい。
- 業務判定: **FAIL** (verifier opus、Rule D 再審)。
  - HIGH-1: `/{locale}/practice?…` が crawl trap。`practice/page.tsx` は `order=rand` で seed 無し、`from=unit` で run 無しのとき、新しい seed / `run=Date.now()` を付けた URL へ転送する。そのリンクは textbook 単元 (`UnitPracticeLink.tsx`)・topic ページ (`TopicPage.tsx`)・today (`WeakTopics.tsx`) の HTML に出る。dev :3117 で 2 回取得 → 転送先が毎回異なることを再現。URL 空間に上限が無く、転送先は `force-dynamic` の全描画。
  - MEDIUM-1: `/{locale}/mock/run?exam=…` (29 回 × 3 言語) が crawl 可能、毎回 100 題を描画。
  - LOW-1: テストが `*` group しか見ず、名前付き group の追加で本文が塞がっても通る。LOW-2: `/practice/mistakes` が索引対象 (個人データは出ない)。
- 原因 (作成側): 「過去問を索引させる」を route 単位 (`/practice` 全体) で考え、query 付き URL が取得ごとに新しい URL を生むことを確認しなかった。第 1 版 (全面 Disallow) では隠れていた。
- 次 attempt の入力: `*` に `Disallow: /{ja,zh,en}/practice?` と `/{ja,zh,en}/mock/run` を足す。テストに完全一致集合の更新・実 path の assert・「group は 2 つだけ」を足す。LOW-2 と sitemap の正規 URL 限定は第 1 段へ (ADR に記載)。
