# Step 2 — DataSource interface + FsDataSource adapter + index.json v2 backfill

Tree outline captured 2026-05-19 Session 33 Turn 2 (post-Batch C, pre-deploy).

## New / modified source files

```
apps/web/
├── package.json                 # +vitest scripts (test, test:watch) + devDeps (vitest@4.1.6, @vitest/coverage-v8)
├── vitest.config.ts             # new (node env, src/**/*.test.ts glob, 20s timeout)
├── src/lib/data/
│   ├── DataSource.ts            # new — D-089 §2.1 contract (5 methods)
│   ├── FsDataSource.ts          # new — α-now default impl reading v1.0.3 fixture
│   ├── types.ts                 # new — Phase 1 JSON shapes mirrored TS strict
│   │                              (Trilingual, Entity, Page, GlossaryEntry,
│   │                               IndexV1, IndexV2 + ChapterRef, GlossaryIndex)
│   └── __tests__/
│       └── FsDataSource.test.ts # new — 13 tests (5 method groups + config)
└── _fixtures/v1.0.3/            # new — Q3=a fixture (4.7 MB git-tracked)
    ├── index.json               # v1.0.3 immutable v1 manifest (112K)
    ├── index.v2.json            # v2 backfill output (584K)
    ├── glossary.json            # v1.0.3 glossary (908 entries, 312K)
    ├── polish_items.json        # Phase 1 polish data (112K)
    └── pages/
        └── page_NNN.json × 554  # all v1.0.3 page JSONs

scripts/
└── build_index_v2.py            # new — D-089 §2.2 v2 backfill script (non-invasive)
```

## v2 manifest content (per D-089 §2.2)

`apps/web/_fixtures/v1.0.3/index.v2.json` = 584,288 bytes, contains:

| Top-level field | Source | Size |
|---|---|---|
| schema_version | v2 (bumped from v1) | — |
| cert_id / run_id / exported_at | carried from index.json v1 | — |
| totals (pages=554, entities=2224, leaves=6059) | carried from v1 | — |
| stage6_summary | carried from v1 | — |
| pages[] | carried from v1 (554 page refs) | — |
| **chapters[]** ← v2 add | derived heuristic | 16 chapter records |
| **glossary_index** ← v2 add | derived from glossary.entries | 908 surface_jp↔id pairs (×2 directions) |
| **entity_by_id** ← v2 add | derived from pages/*.json | 2455 entity records keyed by `page_NNN_entity_M` |
| **v2_built_at** ← v2 meta | runtime timestamp | ISO8601 |
| **v2_source_index** ← v2 meta | "index.json" | — |

## chapters[] heuristic output

Heuristic: per-page dominant chapter via entity.section_number prefix `^(\d{2})-`;
chapter title = first `type=section` title encountered; last_page capped by next
chapter's first_page-1 to remove back-matter pollution.

| chapter_id | first_page | last_page | title_jp (first section) |
|---|---|---|---|
| ch00 | 7 | 24 | 本書の目的はただ１つ |
| ch01 | 28 | 57 | 株式会社と経営理念 |
| ch02 | 70 | 99 | 3つの知的財産権 |
| ch03 | 110 | 128 | 経営戦略とSWOT分析 |
| ch04 | 138 | 179 | 技術開発戦略の立案・技術開発計画 |
| ch05 | 186 | 225 | 情報システム戦略 |
| ch06 | 232 | 257 | システム開発技術 |
| ch07 | 266 | 281 | プロジェクトマネジメントと3つの制約 |
| ch08 | 288 | 313 | サービスマネジメントとITIL |
| ch09 | 318 | 363 | 数値の数え方 |
| ch10 | 371 | 387 | 処理形態によるシステムの分類 |
| ch11 | 392 | 419 | コンピュータの種類 |
| ch12 | 420 | 441 | OSの機能 |
| ch13 | 450 | 465 | データベースの基本 |
| ch14 | 474 | 499 | LANとWAN |
| ch15 | 508 | 551 | 情報セキュリティの脅威 |

All chapter ids are zero-padded and monotonic; adjacent ranges do not overlap
(asserted in `FsDataSource.test.ts` "16 zero-padded chapter ids" suite).

Title refinement (some titles are sub-section titles, e.g. ch09 "数値の数え方")
is deferred to Phase 2 mid-implementation retro per D-089 §3.
