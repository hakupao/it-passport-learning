# Step 6.11.E — Release Publication v1.0.0 Evidence

> Run: `dry_run_2026-05-12T13-23-19`
> Cert: `itpassport_r6`
> Step: 6.11.E.2 (release publish) + E.3 (verify) + E.4 (evidence)
> Session: 22 (2026-05-17)
> Tag: `itpassport-r6-v1.0.0`
> Release URL: https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.0
> Published: 2026-05-16T15:30:08Z

---

## 0. Outcome

**Phase 1 v1.0.0 published as a public GitHub Release.** First
trilingual edition (jp + zh + en) of the IT Passport (ITパスポート)
study material, produced by the `cert-extractor` pipeline over 579
source pages.

| field | value |
|---|---|
| Release tag | `itpassport-r6-v1.0.0` |
| Release name | `itpassport_r6 — Trilingual Edition v1.0.0` |
| Target SHA | `820235cea3ecf48225027c40c16555c7372bdb1d` (Session 21 close = origin/main HEAD pre-Session-22) |
| Asset count | **6** |
| Asset payload | **2.11 MB** total |
| Published at | `2026-05-16T15:30:08Z` |
| URL | https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.0 |

---

## 1. Step 6.11.E.2 — `release.publish()` invocation

### 1.1 Implementation

Invoked via the `release-publish` Python API (per D-081 §2.4 + Session
14 C.3 deliverable). The `cert_extractor.release.publish()` orchestrator
performs the locked 8-step contract:

1. Validate `output/` directory (4 top-level files + `pages/`).
2. Compute tag name (`tag_name(cert_id, version)` per D-081 §2.1):
   `itpassport_r6 + v1.0.0` → `itpassport-r6-v1.0.0`.
3. Zip the `output/` directory.
4. Stage the 4 top-level files alongside the zip.
5. Compute `SHA256SUMS.txt` over zip + top-level files.
6. Compose `RELEASE_NOTES.md` from intro + index_json + polish_items + cost + git context.
7. `gh release create <tag> --target <sha> --notes-file RELEASE_NOTES.md <assets…>`.
8. `gh release view <tag>` to capture the public URL.

Invocation script: `evidence/.../run_release_publish.py` (committed
this session). Adapts the on-disk shapes of `index.json` /
`polish_items.json` / `cost.json` to the flat keys `compose_notes`
expects (page_count, entity_count, trilingual_leaf_count,
glossary_term_count, mistral_usd_billed, anthropic_usd_billed,
anthropic_usd_shadow + flattened polish list with `category` alias).

### 1.2 Dry-run smoke check (pre-confirm)

Ran `run_release_publish.py --dry-run` first to stage all 6 assets
under `data/.../release/itpassport-r6-v1.0.0/` and produce the
canonical `RELEASE_NOTES.md` without invoking `gh`. Verified:

- 6 assets stage correctly (zip + 4 top-level + SHA256SUMS)
- `RELEASE_NOTES.md` populated with non-zero metric values:
  pages=554 / entities=2224 / trilingual leaves=6059 / glossary
  terms=908 / Stage 6 verdict=PASS=24-WARN=14-FAIL=2 / Mistral
  $0.579 billed / Anthropic $0 billed (shadow $657.35)
- SHA256SUMS.txt referenced 5 file hashes correctly

### 1.3 Confirmed publish (user Q12-A authorization)

Ran `run_release_publish.py --confirm` after explicit user "A" =
go-publish authorization on the dry-run output. Result:

```
[release-publish] DONE
  tag          = itpassport-r6-v1.0.0
  release_url  = https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.0
  asset_count  = 6
  total_bytes  = 2,209,864 (2.11 MB)
```

Log: `_logs/release_publish_v1.0.0.log` (gitignored under `/data/`
per D-050).

---

## 2. Step 6.11.E.3 — Release page verification

### 2.1 `gh release view` snapshot

```
Tag: itpassport-r6-v1.0.0
Name: itpassport_r6 — Trilingual Edition v1.0.0
Published: 2026-05-16T15:30:08Z
URL: https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.0
Assets (6):
  glossary.json                       317,914 bytes  (downloads: 0)
  index.json                          114,123 bytes  (downloads: 0)
  itpassport-r6-output-v1.0.0.zip   1,663,138 bytes  (downloads: 0)
  polish_items.json                   113,584 bytes  (downloads: 0)
  README.md                                690 bytes  (downloads: 0)
  SHA256SUMS.txt                           415 bytes  (downloads: 0)
```

All 6 expected assets present + sizes match the on-disk staged
versions byte-for-byte.

### 2.2 What a consumer gets

Per `output/README.md` content displayed on the Release page:

```
# itpassport_r6 — trilingual learning bundle
> Run: `dry_run_2026-05-12T13-23-19` · exported 2026-05-16T14:20:38.067137+00:00
- 554 page(s), 2224 entities, 6059 trilingual leaves
- Stage 6 verdict: **FAIL** (PASS=24 / WARN=14 / FAIL=2)
- 273 polish items deferred — see `polish_items.json`
```

Consumer download flow:

1. Download `itpassport-r6-output-v1.0.0.zip` (1.66 MB).
2. Verify integrity: `sha256sum -c SHA256SUMS.txt`.
3. Unzip → `output/` with the canonical layout:
   - `output/README.md` (entry point doc)
   - `output/index.json` (554-page catalog)
   - `output/glossary.json` (908 trilingual term entries)
   - `output/polish_items.json` (273 known polish items, all WARN/INFO)
   - `output/pages/page_NNN.{json,md}` (1108 per-page files)
4. Programmatic consumers start from `index.json`.

---

## 3. Provenance for v1.0.0

| field | value |
|---|---|
| commit | `820235cea3ecf48225027c40c16555c7372bdb1d` |
| branch | `main` |
| run_id | `dry_run_2026-05-12T13-23-19` |
| pipeline stages run | 0 → 7 ✅ (Stage 8 not in scope; reserved for future feedback/iteration) |
| ADRs locked at release | D-001 ~ D-081 (81 decisions) |
| ADRs cited in RELEASE_NOTES | D-008 / D-069 / D-072 / D-076 / D-077 / D-078 / D-079 / D-080 / D-081 |
| Open questions | 3 (OQ-01, OQ-02, OQ-05 — all Phase 1 out-of-scope) |
| Test suite at release | **492/492** pass (Python 3.14, post 10 mid-flight detector patches across Sessions 20-21) |
| Cumulative cost | Mistral **$0.5790 billed** / Anthropic **$0 billed** (shadow $657.35) / wall ~9h net Claude |

---

## 4. The 2 documented edge-case FAILs ship with v1.0.0

Both surfaced + user-authorized per Q9-B (Session 20) + carried
through Stage 7's Gate A re-run + final post-hand-edit aggregate:

### 4.1 page_292 D7 `numeric_inconsistent`

- jp: `バージョン 2.0 令和2年6月28日 株式会社テクテク`
- zh: `版本2.0 令和2年6月28日 株式会社TekuTeku`
- en: `Version 2.0 6/28/2020 TekuTeku Co., Ltd.` (hand-edited in
  Session 21 to numeric date format for jp ⊆ en subset relation;
  D7 still emits a residual WARN-equivalent FAIL because the
  detector lacks cross-language date-format equivalence semantics)
- Translation is semantically faithful (令和2年6月28日 = June 28,
  2020). D7 detector edge case; Phase 1 v2 candidate.

### 4.2 page_479 L `translation_hallucination`

- jp: `1Gbps`
- zh: `1Gbps（每秒1吉比特）` (with explanatory gloss)
- en: `1 Gbps (Gigabit per second)` (with explanatory gloss)
- LLM Phase-2 reviewer flagged the gloss as a "hallucination" (not in
  jp source). But the gloss is intentional learning content per
  project mission (trilingual technical content for non-native
  learners). Same pattern accepted on Stage A page_153 (JAN gloss,
  Q1 "不是问题可以接受"). Phase 1 v2 reviewer prompt refinement
  candidate.

Neither FAIL affects the safety axis (`safety_failed=False`). Both
are documented in this release's `polish_items.json` for downstream
consumers + Phase 1 v2 planning.

---

## 5. Step 6.11.E.4 — closure declaration

| Requirement | Status |
|---|---|
| Step 6.11.E.2 release publish | ✅ done |
| Step 6.11.E.3 Release page verified | ✅ 6 assets confirmed |
| Step 6.11.E.4 evidence file | ✅ this file |
| STATE.md sync | ⏳ this turn |
| Session 22 log | ⏳ this turn |
| `run_release_publish.py` invocation script | ✅ committed under `evidence/` |
| `release/itpassport-r6-v1.0.0/` staged artifacts | gitignored under `/data/` per D-050; immortalized on GitHub Release |

**Phase 1 implementation complete.** Only Step 6.12 `RETROSPECTIVE.md`
(Rule C) remains for full Phase 1 closure.

---

## 6. Cumulative cost ledger (final, post v1.0.0 publish)

| Stage | cost shadow | calls |
|---|---:|---:|
| 1 Mistral OCR | **$0.579 billed** | 579 |
| 2 Opus classify | $112.16 | 669 |
| 3 Opus vision re-OCR | $13.07 | 56 |
| 4 Opus structure | $110.40 | 568 |
| 4.5 Opus glossary single-call | $2.55 | 1 |
| 5 Opus translate (8 attempts + 71 hand-edits) | $388.26 | 1875 |
| 6 Opus audit (5 dispatches + 6 hand-edits) | $30.92 | ~150 |
| 7 Export (3 dispatches, no LLM) | $0 | 0 |
| E Release publish (gh CLI, no LLM) | $0 | 0 |
| **TOTAL** | **$657.36 shadow** | **3898** |

- Anthropic billed: **$0** (max-plan OAuth via D-069)
- Mistral billed: **$0.579** (Stage 1 OCR only)
- Wall clock: ~9h net Claude time across Sessions 15-22

---

## 7. Step 6.12 RETROSPECTIVE.md — next executable

Phase 1 closure per Rule C requires a `RETROSPECTIVE.md` covering:

- 保留下来的做法 (practices to keep)
- 必须补上的缺口 (gaps to fill, prioritized for Phase 1 v2)
- 关键决策复盘 (key decision retrospectives)

Sources to draw from:
- All 81 ADRs (D-001 ~ D-081)
- All session logs (`docs/discussion/2026-05-*.md`)
- All evidence files (`evidence/itpassport_r6/runs/dry_run_2026-05-*/`)
- All Phase 1 v2 follow-up candidate lists (Session 20 §8 +
  Session 21 §5)

User authorization required to draft RETROSPECTIVE.md (typically a
30-60 min deliberate review; not a quick artifact).
