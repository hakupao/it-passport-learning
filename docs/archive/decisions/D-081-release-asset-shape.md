# D-081 — GitHub Release asset shape: cert-scoped semver tag + zip + 4-file exposure + dual-section notes

| Field | Value |
|---|---|
| ID | D-081 |
| Title | First Phase-1 Release shape — tag `itpassport-r6-v<major>.<minor>.<patch>`, single zip + 4 individual top-level files + SHA256SUMS, dual-section release notes (hand-written intro + auto-generated technical) |
| Status | **Locked** (2026-05-11, Session 13) |
| Phase / Stage | Phase 1, Step 6.11 (Stage C 全本 → Release tag) |
| Supersedes | — |
| Amends | — (D-046 is a parent; D-081 implements its asset/tag shape) |
| Implements | D-046 (output via GitHub Release tag, not git history) |
| Depends on | D-046 (channel), D-073 (Stage C → Release trigger), D-078 (output bundle layout — `output/` directory shape), D-079 (Stage C cadence — gate ⑤ ⇒ Stage 7 ⇒ Release) |
| ADR convention | per D-029 |

---

## 1. Context

D-046 (locked Session 02) defined the **channel** for Phase 1 terminal output: "终产物 (`output/` JSON + JSONL + Markdown + SQLite) **gitignore** + 阶段性 release / milestone 走 **GitHub Release + git tag**". The **shape** of the Release itself — tag name, asset layout, release notes format — was not specified.

For Step 6.11 (Stage C 579-page → first Release), three shape decisions need to lock:

1. **Tag scheme** — global semver, cert-scoped semver, or date-stamped
2. **Asset bundle** — single zip, individual files, or hybrid
3. **Release notes** — hand-written, auto-generated, or both

Verified via Context7 (2026-05-11): `gh release create <tag>` accepts arbitrary tag names; `--generate-notes` available for auto-generation from PRs (not applicable here — first release, no PR history); `--target <sha>` pins to a specific commit. Asset upload supports `file#display-label` syntax. Per GitHub Releases public limits (per docs.github.com, web), single Release supports up to ~200 assets practically; file size limit 2 GB per asset. Our planned 6-asset layout is well within limits.

User authorized "我想听听你的建议" → "全部 ok" → Claude proposes + locks per D-019 + D-027.

---

## 2. Decision

### 2.1 Tag scheme — `itpassport-r6-v<major>.<minor>.<patch>`

First Release: **`itpassport-r6-v1.0.0`**.

Format: `<cert_id>-v<major>.<minor>.<patch>` where:

- `<cert_id>` matches `cert_extractor.config.CERT_ID` (currently `itpassport_r6` → tag uses dash form `itpassport-r6` per git ref conventions; **underscore-to-dash is intentional** for tag readability and shell-safety)
- `<major>` increments for breaking schema changes (e.g. envelope schema v1 → v2)
- `<minor>` increments for feature/content additions (e.g. new chapter coverage, new entity types)
- `<patch>` increments for polish-only releases (e.g. Stage 5 prompt v2 polish, glossary fixes, no schema change)

**Underscore-to-dash mapping** is captured in `cert_extractor.release.tag_name(cert_id, version) -> str` helper (to be implemented Step 6.11.x); this is the **only** place the mapping is performed, and reverse lookup is supported.

### 2.2 Asset bundle — 1 zip + 4 individual files + 1 manifest

```
itpassport-r6-v1.0.0 (Release page)
├── itpassport-r6-output-v1.0.0.zip       (full output/ bundle; pages/ + 4 top-level)
├── README.md                              (individually exposed; renders in Release UI)
├── index.json                             (individually exposed; Phase 3 web app direct fetch)
├── glossary.json                          (individually exposed; valuable standalone)
├── polish_items.json                      (individually exposed; honest disclosure)
└── SHA256SUMS.txt                         (integrity manifest; sha256sum -c verifiable)
```

**6 total assets per Release.**

**Rationale**:

- **Zip** is canonical archival form; downloadable, hashable, single-file install for Phase 3 build pipelines
- **README.md exposed**: GitHub Release UI auto-renders Markdown sitting alongside the Release; users browsing the tag see project context immediately without downloading the zip
- **index.json exposed**: Phase 3 web app can `fetch()` it directly via Release asset URL (stable + cached by GitHub CDN) — no proxy or local cache needed for the index lookup
- **glossary.json exposed**: term reference; standalone value (e.g. for embedding in a flashcard app); curl-friendly
- **polish_items.json exposed**: D-078 §2.4 + D-080 honesty contract — visible disclosure of known polish items, not hidden inside the zip
- **SHA256SUMS.txt**: integrity verification (`sha256sum -c SHA256SUMS.txt` validates every asset); covers zip + 4 files

**Asset size estimates (extrapolated from 40-page dry-run)**:

| Asset | 40-page | 579-page (×14.5) |
|---|---|---|
| `*.zip` (gzip ≈ 50% on JSON/MD) | ~600 KB | ~9 MB |
| `README.md` | ~3 KB | ~3 KB (size-stable) |
| `index.json` | 8.5 KB | ~120 KB |
| `glossary.json` | 18.7 KB | ~270 KB (1.5× term growth conservative) |
| `polish_items.json` | 44.6 KB | ~250 KB (post-D-080 reduces) |
| `SHA256SUMS.txt` | ~500 B | ~500 B |

All assets well under the 2 GB per-asset limit.

### 2.3 Release notes — dual-section (hand-written intro + auto-generated technical)

Release body template:

```markdown
# IT パスポート (令和 6 年度) — Trilingual Edition v1.0.0

## What this is

(≈ 150-250 words, hand-written, covers:)
- Project background — IT パスポート certification, JP-original教材
- Why trilingual (JP / ZH / EN + kana_helper) — non-native technical learner motivation per project README
- What's in this Release — pages, entities, glossary
- Who this is for — Phase 1 first-party consumer, Phase 2/3 future tools
- Quick start — how to consume (link to README.md asset)

## Build provenance

(Auto-generated by `cert_extractor.release.compose_notes()` from `index.json` + `polish_items.json` + cost.json + git context. Template:)

- **run_id**: `<timestamp>` (e.g. `2026-05-12T03-00-00`)
- **commit**: `<short SHA>` (e.g. `abc1234`) — full tree at tag
- **pipeline stages**: 0-7 ✅
- **pages**: <N> / **entities**: <M> / **trilingual leaves**: <K>
- **glossary terms**: <G>
- **Stage 6 verdict**: <PASS|WARN> — PASS=<a>, WARN=<b>, FAIL=<c>, safety_failed=<bool>
- **Stage 7 dual gate**: A=<PASS|FAIL>, B=<PASS|FAIL>
- **Cost ledger**: Mistral $<m> billed, Anthropic $<a> billed (shadow $<s>)
- **Decisions locked at release**: D-001 through D-<NN>
- **ADRs**: linked tree of `docs/decisions/` for the tagged commit

## Known polish items

(Auto-generated from `polish_items.json`. Compact table:)

| Category | Severity | Count | Status |
|---|---|---|---|
| D6 choice_marker_inconsistent | WARN | <n> | Handled in Stage 7 normalizer |
| D7 numeric_inconsistent (style) | WARN | <n> | Stage 5 prompt v2 candidate |
| L3 translation_unfaithful (LLM) | WARN | <n> | Stage 5 prompt v2 candidate |
| D11 kana_helper_missing | INFO | <n> | Resolved by D-080 (this release) |
| D13 glossary_self_consistency | INFO | <n> | Resolved by D-080 (this release) |

Full per-page detail: see `polish_items.json` asset.

## How to consume

(Hand-written; Phase 3 onboarding guide):
- Download `itpassport-r6-output-v1.0.0.zip`
- Verify: `sha256sum -c SHA256SUMS.txt`
- Structure: see `output/README.md`
- Programmatic: start from `index.json`

## Provenance and reproducibility

- Commit: `<SHA>`
- Build environment: Python <ver>, see `uv.lock` in tree
- Reproducible: `uv run cert-extractor run --cert-id itpassport_r6 --run-id <timestamp> --from-commit <SHA>` (idempotent per D-008)
- ADRs covering this release: D-046, D-073, D-077, D-078, D-079, D-080, D-081
```

`cert_extractor.release.compose_notes()` lives at `packages/extractor/src/cert_extractor/release/notes.py` and is invoked by the release-shipping CLI (Step 6.11.x).

### 2.4 Release-shipping CLI subcommand

```bash
uv run cert-extractor release-publish \
    --cert-id itpassport_r6 \
    --run-id <timestamp> \
    --version v1.0.0 \
    --output-dir data/itpassport_r6/runs/<timestamp>/output \
    --intro-md docs/release-notes/itpassport-r6-v1.0.0-intro.md \
    --target <SHA> \
    --confirm
```

Steps performed:

1. Validate `output/` directory (post Stage-7 dual-gate; refuse if absent or incomplete)
2. Compute tag name via `tag_name(cert_id, version)` → `itpassport-r6-v1.0.0`
3. Zip `output/` → `itpassport-r6-output-v1.0.0.zip`
4. Compute SHA256 for zip + 4 top-level files → `SHA256SUMS.txt`
5. Compose release notes (intro from `--intro-md`, technical auto-generated)
6. Invoke `gh release create <tag> --target <SHA> --title "<title>" --notes-file <composed-md> <asset>...` (per Context7-verified gh CLI signature)
7. Verify release exists via `gh release view <tag>` (confirm 6 assets present)
8. Write `evidence/.../step_06_11_release.md` with release URL + asset checksums + timestamp

`--confirm` required; without it, prints dry-run output and exits.

### 2.5 Hand-written intro location

`docs/release-notes/itpassport-r6-v1.0.0-intro.md` (committed; first cert's first Release intro).

Future Releases create `<tag>-intro.md` under same directory. ~150-250 words. Hand-edited per Release. Template provided at Step 6.11.x.

---

## 3. Rejected alternatives

| Alternative | Reason rejected |
|---|---|
| **Tag = `v1.0.0` (global semver)** | (1) Tool (cert-extractor framework) and content (itpassport_r6 outputs) need orthogonal version cadences. (2) Future cert (e.g. amazon-ccp) Release would collide with global `v2.0.0`. (3) Phase 5 generalization assumes 1 framework, many certs — needs cert-scoped tags from day 1. |
| **Tag = `itpassport-r6-2026-05-NN` (date-stamped)** | Date-stamped tags lack patch semantics. A polish-only re-release the next day would need `itpassport-r6-2026-05-NN-2` (ugly) or `itpassport-r6-2026-05-NN.patch1` (non-standard). Semver patch (`v1.0.1`) is the cleaner channel. |
| **Tag = `itpassport_r6-v1.0.0` (underscore form)** | Underscores in git tags are valid but less conventional; some tooling (e.g. shell globbing, URL paths) treats them awkwardly. Dash form is canonical per git/GitHub Release tag examples. |
| **Single-zip-only** | Browsing the Release UI requires downloading the zip for any content view; defeats Release page's at-a-glance value. README + index + glossary + polish_items have value standalone. |
| **All-individual-files** | At 579 pages, output is ~1160 files. Far exceeds 200-asset practical limit (and even if technically supported, UI/browse usability collapses). Not viable. |
| **Pure tarball (`.tar.gz`)** | Windows users without WSL or 7-zip cannot extract natively. Zip is the universal floor; tarball is optional addition (deferred — not needed for v1). |
| **Pure auto-generated notes (`gh release --generate-notes`)** | `--generate-notes` derives notes from PRs between previous tag and this one; for the first Release there's no previous tag, so output is empty/useless. Also misses the human story (project context, why trilingual). |
| **Pure hand-written notes** | Totals (page count, leaf count, polish counts, cost) are tedious to hand-keep accurate; humans miscount; auto-generation is reliable. |
| **Auto-generated as separate asset (e.g. `BUILD_PROVENANCE.md`) instead of in body** | Release body is the canonical landing surface; relegating provenance to a separate asset hides it. Embed inline. |
| **Sign the release with GPG** | Phase 1 v1 scope; signing pipeline deferred to a future ADR if needed (Phase 5 generalization candidate). |

---

## 4. Consequences

### 4.1 Positive

- Tag scheme scales to many certs without naming collision (Phase 5-ready)
- Semver patch lane available for polish-only re-releases (e.g. `itpassport-r6-v1.0.1` for Stage 5 prompt v2)
- Asset layout balances archival completeness (zip) with browse usability (top-level files)
- Notes balance human story (intro) with reproducibility (auto provenance)
- Integrity verifiable end-to-end via SHA256SUMS

### 4.2 Negative / trade-offs

- Underscore-to-dash cert_id mapping is a small extra step (centralized in one helper)
- Hand-written intro is per-Release labor (~30 min); acceptable for major releases, may auto-template for patch releases later
- Auto-generated section parses `index.json` + `polish_items.json` + cost.json — small couplings; tests must cover schema-version mismatches

### 4.3 Risks

- **`gh` CLI must be installed and authed** on the release-publish machine; CI/Actions-based publish is a Phase 5 candidate. **Mitigation**: `release-publish` subcommand validates `gh auth status` before any work.
- **Asset name collisions** across cert/version are prevented by including both in filename (`itpassport-r6-output-v1.0.0.zip`); enforced by `tag_name + asset_name` helper.
- **Tag delete / re-publish** for fixing notes-only edits: GitHub Release supports edit-after-publish; tag re-push is **forbidden** per general git practice. ADR follow-up if needed.

---

## 5. Acceptance criteria

D-081 considered satisfied when Step 6.11 closes with:

1. Tag `itpassport-r6-v1.0.0` exists on GitHub repo `hakupao/it-passport-learning` (Public)
2. Release page shows 6 assets: zip + README.md + index.json + glossary.json + polish_items.json + SHA256SUMS.txt
3. README.md renders inline on the Release page
4. SHA256SUMS.txt verifies via `sha256sum -c` against the 5 other assets
5. Release notes body contains hand-written intro section + auto-generated provenance section + polish items table
6. `cert_extractor.release.tag_name()` helper has unit tests covering underscore-to-dash mapping + reverse lookup
7. `release-publish` CLI subcommand has integration test (mock `gh` invocation) covering all 8 steps in §2.4
8. Test suite: ≥ 445 pass (435 post-D-080 base + ~10 new for release module)
9. Evidence: `evidence/itpassport_r6/runs/<timestamp>/step_06_11_release.md` with release URL + checksum verification + timestamp

---

## 6. References

- D-008 — pipeline (`output/` is Stage 7 product)
- D-029 — major decisions get standalone ADR (this is one)
- D-046 — channel: GitHub Release + git tag (this ADR implements its shape)
- D-050 — `data/` gitignored; output is local-only until released
- D-073 — Stage C → Release trigger
- D-078 — `output/` directory layout (this ADR's zip wraps that layout)
- D-079 — Stage C gate ⑤ ⇒ Stage 7 ⇒ Release
- D-080 — Stage 4.5 polish; affects polish_items.json count surfaced in notes
- D-019 — slow-pace 3a (Q3 posed → user "你来定" → Claude proposes Context7-verified + lock)
- D-027 — decision-on-lock writeback (this ADR + session-13 log + STATE.md updated same turn)
- Context7 / GitHub CLI gh_release_create reference (Library ID `/websites/cli_github_manual_gh_release_create`, 2026-05-11): tag arg accepts arbitrary names; `--generate-notes`, `--target`, `file#label` asset syntax verified
- Session 13 log: `docs/discussion/2026-05-11-session-13.md`

---

## 7. Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Open-question poser | Claude main session (Opus 4.7 1M ctx) | 2026-05-11 (Session 13 open) | Q3 posed per D-019 |
| User answerer | user | 2026-05-11 | "我想听听你的建议" |
| Proposer | Claude main session | 2026-05-11 | Q3 proposal = cert-scoped semver + zip + 4-file + dual notes |
| Doc verifier | Claude main session | 2026-05-11 | Context7 `/websites/cli_github_manual_gh_release_create` consulted; `gh release create <tag>` accepts arbitrary names confirmed |
| User refiner | user | 2026-05-11 | "全部 ok" |
| Locker | Claude main session | 2026-05-11 | D-081 locked, this ADR |
| Implementer | TBD (Step 6.11.x) | TBD | `cert_extractor.release` module + `release-publish` CLI + intro template |
| User final sign-off | user | TBD | post `itpassport-r6-v1.0.0` published on GitHub |
