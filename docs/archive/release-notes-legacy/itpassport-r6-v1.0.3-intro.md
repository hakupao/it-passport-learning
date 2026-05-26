This is the **v1.0.3 patch release** of the IT パスポート (Japan Information-Technology Engineers Examination — "IT Passport") trilingual study material for **Reiwa 6 (FY 2024)**. v1.0.3 ships the same scope as v1.0.2 **plus a single targeted backfill**: 487 `Term` entities now carry the `kana_helper` field that was previously only present on the locked glossary.

### What changed since v1.0.2

A single, surgical, additive change driven by **D-084** (sub-ADR of D-083 §2.4, Phase 2 prep). The pipeline's Stage 5 translation never propagated `kana_helper` from `glossary[surface_jp].kana_helper` down to per-page `Term.kana_helper`; consumers wanting the kana-pronunciation hint (the project's core mission per **D-012**, the original motivation for trilingual rendering) had to join the glossary themselves. v1.0.3 backfills that link in-place:

- **487** `Term` entities backfilled (out of 1475 total `Term` entities across 554 pages)
- **196** of 554 pages updated; 358 pages unchanged
- **2** `Term` entities already carried `kana_helper` from earlier iter-3..8 hand-edits — left untouched
- **986** `Term` entities had no matching `kana_helper` in the glossary (the term either was not in the glossary, or its glossary entry had `kana_helper=null`) — left as `null` per design
- Glossary itself: **unchanged** (the source of the join, not the target)
- All other fields on `Term` entities: **unchanged byte-for-byte**

### Why a separate v1.0.3 instead of folding into Phase 2

Phase 2 is "**带 AI 答疑的备考工具**" (a personal IT Passport study tool with AI tutoring, per D-083 §2.1). Phase 2 consumes `output/` as a read-only data source; it does NOT modify `cert-extractor`. Two alternatives were rejected during the Session 25 §5.5 mapping discussion (Q6):

- **App-side join** (Phase 2 reads glossary at runtime, joins `kana_helper` per render) — pushes data-completeness responsibility into every consumer
- **Patch `cert-extractor` Stage 5 + full re-run** — violates D-083 §2.2 ("cert-extractor NOT generalized for Phase 2") and would have cost real LLM dollars

A self-contained post-process script that ships as a one-time patch release was the third option (and the one user picked); it keeps `cert-extractor` frozen at Phase 1 state and lets every consumer — Phase 2 and any external user — get the full schema in one fetch.

### Verification

`scripts/backfill_term_kana_helper.py` is **idempotent by construction**: it only writes when current `Term.kana_helper` is `None` AND glossary has a match. Re-running on already-backfilled output is a strict no-op.

- **9 unit tests** (`packages/extractor/tests/unit/test_backfill_term_kana_helper.py`) cover the happy path, null-glossary skip, existing-kana_helper preservation, no-match preservation, idempotency, non-Term entity safety, end-to-end disk round-trip, and dry-run no-write contract — all green.
- **Full unit suite** runs **496/496 passing** post-backfill.
- Spot-checked Term entities across 5+ pages (e.g. p031 `ビジョン → reading: bijon / zh_concept: 愿景`).

### What you get

Same shape as v1.0.0 / v1.0.2 — `index.json` entry point, a per-page directory of trilingual entities, the locked glossary, a polish-items audit sidecar, README, and `SHA256SUMS.txt`. The Stage 6 audit verdict, Stage 7 dual-gate state, and the cost ledger in `RELEASE_NOTES.md` below are inherited from the v1.0.0 build run (no re-run; no new LLM cost).

### Migration from v1.0.0 / v1.0.2

Schema is unchanged — `Term.kana_helper` has always existed in the schema (per D-012 + `cert_extractor.schema.entities`). v1.0.3 only populates previously-`null` values where the glossary already had the data. **If you consumed v1.0.0 or v1.0.2, replace with v1.0.3 directly; existing field accessors continue to work**, and the `Term.kana_helper` field — previously always `null` for ~99 % of terms — is now populated for ~33 % of `Term` entities.

### Cost

**$0 billed**. The backfill is pure data-join Python; no LLM was invoked. All previous v1.0.0 + v1.0.2 cost (Mistral $0.579 OCR + Anthropic $0 billed via max-plan OAuth) is unchanged.
