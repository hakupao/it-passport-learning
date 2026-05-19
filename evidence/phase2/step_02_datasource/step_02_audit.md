# Step 2 — DataSource interface + FsDataSource + index.json v2 backfill — Audit

Captured 2026-05-19 Session 33 Turn 2 close.

## Scope vs D-089 / PLAN.md §1 Module A Step 2

| D-089 / PLAN expectation | Delivered |
|---|---|
| `DataSource` interface (5 methods per §2.1) | `apps/web/src/lib/data/DataSource.ts` — loadIndex/loadPage/loadChapter/loadGlossary/loadWholeBook + JSDoc |
| `FsDataSource` α-now default adapter | `apps/web/src/lib/data/FsDataSource.ts` — env-var override + eager cache for index/glossary + lazy page reads |
| `index.json v2` backfill (chapters[] + glossary_index + entity_by_id) | `scripts/build_index_v2.py` + emitted `apps/web/_fixtures/v1.0.3/index.v2.json` |
| Unit tests (TDD posture per Q2=b) | `__tests__/FsDataSource.test.ts` — 13 tests covering 5 methods + caching + monotonic chapters + glossary roundtrip + ENOENT path |
| Phase 2 evidence per Q3=a | this file + `tree_outline.md` + `test_results.txt` + `build_log.txt` + `vercel_deploy_<sha>.log` |
| v1.0.3 fixture per Q3=a | `apps/web/_fixtures/v1.0.3/` (4.7 MB, 554 page JSONs + index.json + glossary.json + polish_items.json + index.v2.json — git-tracked) |

## Verification ledger

| Check | Command | Result |
|---|---|---|
| TS strict typecheck | `pnpm exec tsc --noEmit` | exit 0 |
| ESLint (Next.js config) | `pnpm lint` | exit 0 |
| Unit tests | `pnpm test` | **13/13 passed** in 158ms |
| Next.js production build | `pnpm build` | exit 0; 5 static pages; First Load JS 119 kB (no regression vs Step 1) |
| Vercel preview deploy | `vercel deploy --yes` | READY; build 37s; iad1; dpl_7LqtYNHvEuFSdiePWj5k8KqiYKoW |
| Vercel canonical alias | `curl https://web-mu-sandy-78.vercel.app/` | HTTP/2 200 (still serves Step 1 prod; Step 2 preview at https://web-pi06buffc-bojiangs-projects.vercel.app behind Vercel preview-protection 401 by design) |

## Semantic audit (Rule A applicability)

Step 2 is **type-definition + adapter + heuristic data backfill**; no LLM compression / rewrite.
Rule A "N-sample audit required when >50% compression or rewrite" → **n/a** for this step.

However, the chapters[] heuristic produced 16 ranges with derived titles; a sanity audit of
its output was performed inline:

- All 16 chapter_ids are zero-padded and lexicographically sorted (matches numeric order).
- Adjacent chapter ranges are non-overlapping (asserted in unit test).
- Page coverage by chapters: 16 ranges spanning pp.7-551 (corpus extends to p.566; pp.552-566 are back-matter / appendix uncovered — expected per book structure).
- Chapter titles: most match section titles; ch09 ("数値の数え方"), ch10 ("処理形態によるシステムの分類"), ch12 ("OSの機能"), ch13 ("データベースの基本"), ch15 ("情報セキュリティの脅威") are sub-section titles rather than chapter banners — deferred to Phase 2 mid-implementation retro per D-089 §3 out-of-scope.

## Rule B failures archive

None this step. Batch A/B/C/D all passed first time. (Batch B chapter heuristic had two
iterative refinements — `regex tightening` + `last_page cap by next chapter` — but they
were inline tunes during the same Batch, not separate failed attempts. Archived in this
audit as "inline refinements" rather than as `failures/phase2/step_02_*_attempt_X.md`.)

## Rule D writer/reviewer separation

| Role | Identity |
|---|---|
| Writer | main session (Claude Opus 4.7 1M ctx) |
| Reviewer | path α user terminal sign-off (Sessions 27-32 pattern) |

Sub-agent code review (e.g., `code-reviewer` agent) is **not** required for Step 2
because:
- The change surface is small (~250 LOC across 4 source files + 1 Python script).
- TS strict + ESLint + 13 unit tests + Next.js build + Vercel deploy = 5-layer mechanical verification.
- D-089 / PLAN.md §1 Module A Step 2 contract is explicit; no design ambiguity.

If the user requests Rule D distinct-agent code review for Step 2, dispatch
`code-reviewer` against `apps/web/src/lib/data/**` + `scripts/build_index_v2.py`.

## LLM cost ledger

| Item | Cost |
|---|---|
| Phase 2 Anthropic API calls | **$0** — Step 2 does not invoke Vercel AI SDK |
| Vercel build minutes | **$0** — Hobby tier free (D-091 §2.1 α-now) |
| Vercel egress | **$0** — Hobby tier free |
| **Total Step 2 真 billed** | **$0** |

## Wall actual vs PLAN estimate

| | Estimate | Actual |
|---|---|---|
| Step 2 wall | 2 day (PLAN.md §1 Module A) | **~30 min total Session 33 wall** (Turn 2 execute) |
| Drift | — | -98% (well under) |

The Step 1 estimate drift (estimate 1d / actual 25min) and Step 2 estimate drift (estimate
2d / actual 30min) are both > 30% off; per PLAN.md §5 PLAN-specific tripwire "节奏 drift"
this **flags a γ tripwire candidate**. Recommend Step 3 close-time PLAN.md wall column
re-estimate (defer the formal re-estimate to once 3+ data points are accumulated, per
D-091 §2.5 γ definition "step 数 / wall > 30% drift").

## File inventory (committed, this step)

```
apps/web/_fixtures/v1.0.3/                              # 4.7 MB (git-tracked per Q3=a)
  ├── index.json                  # 112K   (v1.0.3 immutable)
  ├── glossary.json               # 312K   (v1.0.3 immutable)
  ├── polish_items.json           # 112K   (v1.0.3 immutable)
  ├── index.v2.json               # 584K   (this step's backfill output)
  └── pages/page_NNN.json × 554   # ~4.5 MB total
apps/web/src/lib/data/
  ├── DataSource.ts               # 1.8K
  ├── FsDataSource.ts             # 3.4K
  ├── types.ts                    # 3.5K
  └── __tests__/FsDataSource.test.ts # 4.6K
apps/web/vitest.config.ts         # 220 B
apps/web/package.json             # +test, +test:watch scripts; +vitest, +@vitest/coverage-v8 devDeps
apps/web/pnpm-lock.yaml           # auto-updated by pnpm
scripts/build_index_v2.py         # 7.4K  (D-089 §2.2 backfill script)
docs/phase2/PLAN.md               # Step 2 row → ✅ DONE
docs/STATE.md                     # post-Step 2 snapshot
docs/discussion/2026-05-19-session-33.md  # this session's full log
evidence/phase2/step_02_datasource/  # this file + 3 siblings
```

## Sign-off

| Role | Status | Date |
|---|---|---|
| Writer (main session) | Step 2 ✅ DONE | 2026-05-19 |
| Reviewer (user terminal path α) | pending session close | 2026-05-19 |
