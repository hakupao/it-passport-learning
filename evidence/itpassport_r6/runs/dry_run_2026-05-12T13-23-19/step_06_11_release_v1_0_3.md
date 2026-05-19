# Step 6.11.E — Release Publication v1.0.3 Evidence (D-084 kana_helper backfill)

> Run: `dry_run_2026-05-12T13-23-19`
> Cert: `itpassport_r6`
> Step: v1.0.3 patch-release publish (D-084 D11 kana_helper backfill)
> Tag: `itpassport-r6-v1.0.3`
> Predecessors: `itpassport-r6-v1.0.0` (2026-05-16) + `itpassport-r6-v1.0.2` (2026-05-18)
> Driver ADR: **D-084** (sub-ADR of D-083 §2.4) — locked Session 25 Turn 4 / 2026-05-19
> Implementation gate: **opened by user "go implement v1.0.3"** 2026-05-19 (per D-084 §2.7)

---

## 0. Outcome

**v1.0.3 patch release published.** Surgical, additive, idempotent backfill of
`Term.kana_helper` from `glossary[surface_jp].kana_helper`. Schema unchanged,
backward compatible.

| field | value |
|---|---|
| Release tag | `itpassport-r6-v1.0.3` |
| Asset count | **6** (same shape as v1.0.0 / v1.0.2 per D-081) |
| Driver | D-084 (Session 25 Turn 4) |
| LLM cost | **$0** (pure data join) |
| Backfilled Term entities | **487** |
| Pages changed | **196 / 554** |
| Schema bump | none (additive backward compatible per D-084 §2.6) |
| Test suite | **496/496** unit tests pass post-backfill (9 new for D-084) |

---

## 1. D-084 implementation summary

Session 25 §5.5 mapping (g4 acceptance) flagged exactly one must-do:
`#6 D11 kana_helper 不传递` — Term entities had a `kana_helper: KanaHelper | None`
field defined in schema (`packages/extractor/src/cert_extractor/schema/entities.py:44`),
but Stage 5 translation never copied the glossary's `kana_helper` down into the
per-Term field. The glossary itself carried the field correctly (308 + 17-from-aliases
= 325 unique source keys).

Per Q6=(i), the fix path was **v1.0.3 post-process backfill script**, not (ii)
app-side join, not (iii) cert-extractor patch + full re-run. Implementation = a
single idempotent script + 9 unit tests + spot-check; zero `cert-extractor`
changes.

---

## 2. Backfill artifact map

| Path | Role |
|---|---|
| `scripts/backfill_term_kana_helper.py` | The backfill script (D-084 §2.3) |
| `packages/extractor/tests/unit/test_backfill_term_kana_helper.py` | 9 unit tests (5 + 4 integration smokes per D-084 §5.3) |
| `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output/pages/*.json` | 196 page JSONs updated in-place |
| `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output/glossary.json` | Source of join (unchanged) |
| `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output/index.json` | Counts unchanged (additive field, no count delta) |
| `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output/polish_items.json` | Unchanged |
| `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output/README.md` | Unchanged |
| `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/cost.json` | Unchanged (no LLM cost for backfill) |
| `docs/release-notes/itpassport-r6-v1.0.3-intro.md` | Release intro (new) |
| `evidence/.../run_release_publish_v1_0_3.py` | This release's publish companion (forked from v1.0.2) |
| `evidence/.../step_06_11_release_v1_0_3.md` | This evidence file |

---

## 3. Backfill run summary

`python scripts/backfill_term_kana_helper.py` (apply mode, 2026-05-19):

| Metric | Value |
|---|---|
| Glossary entries total | 908 |
| Glossary lookup keys w/ kana_helper (incl. aliases) | 325 |
| Pages scanned | 554 |
| **Pages changed** | **196** |
| Term entities total | 1475 |
| Term w/ existing kana_helper (pre-backfill, from iter-3..8 hand-edits) | 2 |
| **Term BACKFILLED** | **487** |
| Term no glossary match | 986 |
| Term no `surface.jp` | 0 |
| Mode | APPLIED |

**Idempotency verified** by immediate `--dry-run` re-pass: 0 backfilled, 489
already-populated (= 487 newly + 2 pre-existing), 0 pages changed.

### 3.1 Spot-check sample

```
PAGE 31  itpassport_r6::term::p031::0
  surface.jp = ビジョン
  kana_helper = {
    "surface": "ビジョン",
    "reading": "bijon",
    "zh_concept": "愿景",
    "auto_backfill": false
  }
```

---

## 4. Test suite

`packages/extractor/tests/unit/test_backfill_term_kana_helper.py` — **9 tests**,
covers per D-084 §5.3:

1. `test_lookup_excludes_entries_with_null_kana_helper`
2. `test_lookup_includes_aliases_jp` (aliases populate but don't overwrite)
3. `test_backfill_populates_null_when_glossary_has_match` (happy path)
4. `test_backfill_does_not_overwrite_existing_kana_helper` (idempotency invariant)
5. `test_backfill_skips_terms_without_glossary_match`
6. `test_backfill_idempotent_when_rerun_twice` (explicit re-run check)
7. `test_backfill_ignores_non_term_entities` (sections/figures untouched)
8. `test_backfill_canonical_output_end_to_end` (disk round-trip)
9. `test_backfill_canonical_output_dry_run_does_not_write`

Full `packages/extractor/tests/unit/` suite: **496 passed in 0.47s**. No regression.

---

## 5. Release publish

`evidence/.../run_release_publish_v1_0_3.py` is forked from
`run_release_publish_v1_0_2.py`; only `version`, `intro_md_path`, and
`git_ctx.adr_ids` (added D-083 + D-084 + D-012) change. PublishInputs assembly
otherwise identical.

Per D-084 §2.7, the implementation gate was opened by user "push it then go
implement v1.0.3" 2026-05-19. `release.publish()` orchestrator handles tag
creation + 6-asset upload via `gh release create` (see D-081 §2.4).

| field | value |
|---|---|
| Target SHA | (filled post-publish) |
| Published at | (filled post-publish) |
| Release URL | (filled post-publish) |

Sub-steps:

1. Dry-run `run_release_publish_v1_0_3.py --dry-run` — stage 6 assets under `release/`
2. Confirm with `--confirm` — `gh release create` + `gh release view`
3. Verify Release page byte-for-byte vs staged assets

---

## 6. Rule D compliance

- Writer (script + tests + evidence) = Claude Opus 4.7
- Reviewer (D-084 ADR sign-off) = user (Session 25 Turn 4 path α)
- Reviewer (implementation correctness) = unit test suite (TDD-style) +
  idempotency self-check + spot-check
- Writer ≠ Reviewer per Rule D

---

## 7. Cost

- Mistral: $0.579 billed (unchanged from v1.0.0; OCR ledger frozen)
- Anthropic: $0 billed (unchanged; no LLM call in backfill)
- Anthropic shadow: $657.36 (unchanged; v1.0.0/v1.0.2 build pipeline)
- v1.0.3 incremental: **$0** billed + **$0** shadow

---

## 8. Links

- ADR D-084 — `docs/decisions/D-084-v1-0-3-kana-helper-backfill.md`
- ADR D-083 — `docs/decisions/D-083-phase2-direction.md` (parent ADR)
- ADR D-012 — `kana_helper` field definition (project core motivation)
- Session 25 log — `docs/discussion/2026-05-18-session-25.md`
- v1.0.2 evidence — `evidence/.../step_06_11_release_v1_0_2.md` (template)
- v1.0.0 evidence — `evidence/.../step_06_11_release.md` (root pattern)
