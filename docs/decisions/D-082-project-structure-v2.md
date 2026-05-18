# D-082 — Project structure v2: multi-audience landing + soft archive (supplement to D-034~D-053)

| Field | Value |
|---|---|
| ID | D-082 |
| Title | Post-Phase-1 project structure v2 — rewrite root README for 3-audience landing, move source EPUB to `.source/`, add nav READMEs at every committed subdir, soft-archive validation initial-audit tree |
| Status | **Locked** (2026-05-18, post-Phase-1 v1.0.2 publish) |
| Phase / Stage | Phase 1 closed; this is a post-Phase-1 housekeeping ADR before Phase 2 brainstorm |
| Supersedes | — (none) |
| Amends | — (D-034 ~ D-053 remain in force unchanged) |
| Implements | — |
| Depends on | D-029 (standalone ADR convention) |
| ADR convention | per D-029 |

---

## 1. Context

After Phase 1 v1.0.2 published (2026-05-18, commit chain `2db596f → 9318e20 → c8c2c00 → 70b6ab1`), user observed the repo "looks too messy, no main vs side, structure unclear, you can't tell what this project is".

Concrete defects identified:

1. Root `README.md` still says **"Status: design phase. No runnable code yet"** and quotes "53 locked decisions D-001~D-053", but Phase 1 is in fact ✅ DONE with 81 locked decisions and 2 GitHub Releases (v1.0.0 + v1.0.2) published.
2. `IT-Passport.epub` (244 MB, copyrighted source textbook) sits at repo root, making the working tree visually a "content repo" rather than the tool repo it actually is.
3. `validation/` has **1031 tracked files** — 70 % of the repo's tracked file count. Main line (`packages/extractor/`) is visually drowned.
4. `evidence/itpassport_r6/runs/` has **3 runs** but only 1 is canonical (`dry_run_2026-05-12T13-23-19/` = v1.0.0 + v1.0.2 production); the other 2 are exploratory. No README signals this.
5. No committed subdir has a `README.md` announcing its purpose — readers must infer from filenames.
6. No multi-audience entry point: learners (download release), devs (use cert-extractor), future-me (Phase 2 entry) all see the same flat tree.

Per D-019 (slow-pace design), user was polled with 4 questions:

1. Scope → **"全重构: 跳 D-082+ ADR 重定顶层布局"**
2. Audience → **"三者都要, 顶层多入口分交"**
3. ADR posture → **"谨守锁, 只动未锁部分"**
4. EPUB → **"移到 .source/ 且保持 gitignore"**

Combined: maximally aggressive restructure within the bounds of what D-034~D-053 do not lock, with a new ADR (this one) recording the v2 layout.

---

## 2. Decision

### 2.1 What D-082 changes

**A. Root `README.md` + `README.zh-CN.md` rewrite**
Replace stale "design phase" framing with a 3-audience "Choose your path" landing:

- 🎓 **Learners** → download v1.0.2 from GitHub Releases (one-paragraph quickstart)
- 💻 **Developers** → use `cert-extractor` for other certifications → `packages/extractor/README.md`
- 🔬 **Researchers / future-me** → Phase 1 retrospective + validation chain → `docs/STATE.md` + `RETROSPECTIVE.md`

The status badge changes from `design phase` to `Phase 1 ✅ DONE — v1.0.2 published`.

**B. `IT-Passport.epub` → `.source/IT-Passport.epub`**
A new `.source/` directory hosts gitignored input artifacts. Defense-in-depth: `.source/` added to `.gitignore` even though `/*.epub` already covers EPUB files at root. `.source/README.md` (1-line) documents the convention.

`.env.local` stays at repo root — it follows python-dotenv CWD-loader convention, and moving it would break any future re-run of the pipeline without code changes.

**C. Nav `README.md` at every committed subdir**
Add a single-page navigation README to each top-level subdir that already exists:

- `packages/extractor/README.md` — what cert-extractor is + how to reuse for other certs
- `docs/README.md` — what's under `docs/` and read order
- `evidence/README.md` — Rule-A archive map + which run is canonical
- `failures/README.md` — Rule-B archive map per stage
- `validation/README.md` — post-publication validation timeline + iter table
- `validation/deep_validation_2026-05-17/README.md` — per-iter status + entry pointers
- `validation/deep_validation_2026-05-17/initial_validation/README.md` — V1/V2/V3 audit framework (see §2.1 D)

**D. `validation/deep_validation_2026-05-17/` internal reorg**
Group the initial three-track audit (which preceded the iter-3..8 fix/convergence chain) into a single subdir:

```
validation/deep_validation_2026-05-17/
├── README.md                          [NEW]
├── initial_validation/                [NEW grouping — pre-iter-3 dimensional audit]
│   ├── README.md                      [NEW]
│   ├── VALIDATION_REPORT.md           [moved from .../  ]
│   ├── methodology/                   [moved]
│   ├── sampling/                      [moved]
│   ├── v1_ocr/ + v1_ocr_summary.json  [moved]
│   ├── v2_translation/ + summary      [moved]
│   ├── v3a_pageclass/ + summary       [moved]
│   ├── v3b_entitytype/ + summary      [moved]
│   ├── v3c_section_path/              [moved]
│   └── iter_2/                        [moved — transitional pre-iter-3 round]
├── iter_3/ … iter_8/                  [KEEP top-level — fix/convergence chain]
├── scripts/                           [KEEP — shared fix scripts]
└── logs/                              [RENAMED from _logs/]
```

`git mv` preserves content + git blame; no functional break since these are static evidence artifacts.

### 2.2 What D-082 explicitly does NOT touch

Honoring user choice "谨守 D-034~D-053 锁":

- `pyproject.toml` at root (D-036 hatchling, D-037 python >=3.11, D-038 workspace)
- `packages/extractor/` name + location (D-038/039)
- `packages/extractor/tests/{unit,integration,e2e}/` (D-040/042)
- `packages/extractor/tests/_fixtures/` underscore prefix (D-043)
- `/data/<cert_id>/runs/<run_id>/<stage>/` shape (D-050/051/052/053) — whole `/data/` gitignored
- `evidence/`, `failures/`, `RETROSPECTIVE.md` committed (Rules A/B/C)
- `output/` ships via GitHub Release + git tag (D-046)
- `uv.lock` committed
- `CLAUDE.md` + `AGENTS.md` at root (D-049)
- `README.md` + `README.zh-CN.md` exist at root (D-048) — content rewritten, files unchanged
- `apps/` reserved for Phase 3+ (D-038)

### 2.3 Commit slicing

This ADR will land via 4 atomic commits:

| Commit | Scope |
|---|---|
| C1 | D-082 ADR + 6 nav READMEs + STATE.md sync |
| C2 | EPUB → `.source/` + `.gitignore` add `.source/` |
| C3 | `validation/` reorg (`initial_validation/` grouping + `logs/` rename) + `initial_validation/README.md` |
| C4 | Root `README.md` + `README.zh-CN.md` rewrite |

---

## 3. Rejected alternatives

| Option | Rejected reason |
|---|---|
| **No restructure, just rewrite README** | User explicitly chose "全重构" — README alone leaves the EPUB-at-root + validation-tree-clutter problems |
| **Hard-archive: physically delete old iters** | Violates Rule B (failures/) by analogy + violates user "soft-archive" intent. Soft `initial_validation/` grouping preserves git blame + 0 information loss |
| **Move `.env.local` to `.source/` too** | Breaks python-dotenv CWD-loader convention used in CLI tools; would require code edits in `packages/extractor/` that the user said not to touch |
| **Rename `packages/extractor/` to a clearer name** | D-038/039 lock this; renaming would require a supersede ADR which the user explicitly chose against ("谨守锁") |
| **Add `apps/` content prematurely** | D-038 reserves `apps/` for Phase 3+; Phase 1.5 is closed but Phase 2 hasn't designed apps yet |
| **Issue 9 separate ADRs (one per nav README)** | Over-bureaucratic; D-082 is the single covering decision per D-027/D-029 (architecture-level) |

---

## 4. Consequences

- **Discoverability**: First-time visitor lands on `README.md` → immediately routed by role (learner / dev / researcher).
- **Top-level cleanliness**: Root drops from 12 user-facing files to 11 (EPUB removed). Visually a tool repo, not a content dump.
- **Validation tree**: Top of `deep_validation_2026-05-17/` drops from 21 entries to ~11 (iter_3..8 + scripts + logs + initial_validation/ + README + a few summary files). Reader can read iter chain top-down without dimensional-audit noise.
- **Git history**: `git mv` produces rename diffs (small, blameable). Each moved file's history is preserved.
- **Backward links**: 5 session logs reference `IT-Passport.epub` at root — they remain truthful at write time and intentionally not updated (sessions are append-only history).
- **Cost**: 0 LLM. Pure file ops + Edit.

---

## 5. Implementation evidence

| Artifact | Path |
|---|---|
| This ADR | `docs/decisions/D-082-project-structure-v2.md` |
| Commit chain | C1: nav READMEs + ADR + STATE; C2: EPUB move; C3: validation reorg; C4: README rewrite |
| STATE.md sync | Top row updated with D-082 lock, locked-decision count 81 → 82 |
| Commit messages | Each commit message references D-082 §2.1 letter |

---

## 6. Status

🔒 **Locked 2026-05-18, post-v1.0.2 publish**, immediately before Phase 2 brainstorm.

Subsequent Phase 2 ADRs may further evolve the repo structure (e.g., when `apps/` gets its first occupant) but should reference D-082 as their predecessor for the post-Phase-1 layout baseline.
