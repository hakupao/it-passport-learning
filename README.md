# IT Passport Learning — Trilingual Content Factory

> A pipeline that turns a single Japanese certification exam textbook into trilingual (JP / ZH / EN) learning content. **Phase 1 is the cert-extractor: a pluggable, OCR-driven, glossary-constrained translation pipeline.**

[![Status: design phase](https://img.shields.io/badge/status-design%20phase-lightgrey)](docs/STATE.md)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-pending-lightgrey)](#license)

> 🇨🇳 中文版本: [README.zh-CN.md](README.zh-CN.md)

---

## ⚠️ Status

**Design phase. No runnable code yet.** Two design sessions ([01](docs/discussion/2026-05-06-session-01.md) / [02](docs/discussion/2026-05-06-session-02.md)) have produced **53 locked decisions (D-001 ~ D-053)** covering project scope, architecture, repo layout, build tooling, testing, Git policy, and runtime data layout. Implementation begins after the design phase closes.

For the always-current snapshot, read **[`docs/STATE.md`](docs/STATE.md)** first.

---

## Why this exists

Non-native learners of Japanese-language technical exams are often blocked not by *concepts* (CPU, TCP/IP, ROI, …) but by **kana / kanji recognition**. Once a learner sees `アクセシビリティ → accessibility → 可访问性` once, the term sticks. This project turns one IT Passport (ITパスポート) textbook into a structured, trilingual, term-locked dataset that anyone in the same situation can reuse.

The book targeted in Phase 1 is bibliographic input only — its raw content is **not** redistributed (see [License](#license)).

---

## Phase 1 in one diagram

```
EPUB (scanned images)
   │
   ▼
[ Source Reader (pluggable) ]
   │
   ▼
[ OCR — Mistral OCR (primary) / Claude Vision (hard pages) ]
   │
   ▼
[ Page Classify → Hard-page Re-OCR → Structure ]
   │
   ▼
[ Glossary lock (terms_glossary.json) ]
   │
   ▼
[ Trilingual Translation (Claude, glossary-constrained) ]
   │
   ▼
[ Audit (sampled, per Rule A) ]
   │
   ▼
output/
  ├── itpassport.json
  ├── itpassport.jsonl
  ├── itpassport.db
  └── markdown/
```

Pluggable on **four axes**: Source Reader / OCR Engine / Translator / Exporter (see `docs/decisions/D-021-four-axis-pluggable.md`).

---

## Roadmap

| Phase | Goal | Status |
|-------|------|--------|
| **1** | `cert-extractor` Python pipeline (this repo's core) | 🚧 Design |
| 2 | Personal study tool (CLI / Anki / Obsidian — TBD) | ⏳ Future |
| 3 | Web app (Next.js or Astro — TBD) | ⏳ Future |
| 4 | AI study assistant (RAG over the trilingual dataset) | ⏳ Future |
| 5 | Generalize to any certification textbook | ⏳ Future |

---

## Repository layout (locked — see D-034 ~ D-053)

```
.
├── pyproject.toml              # uv workspace root (hatchling backend)
├── uv.lock                     # committed (reproducibility)
├── packages/
│   └── extractor/              # the cert-extractor package
│       ├── pyproject.toml
│       ├── src/cert_extractor/
│       └── tests/
│           ├── _fixtures/      # MANIFEST + mini_sample.epub
│           ├── unit/
│           ├── integration/
│           └── e2e/
├── pipelines/                  # YAML pipeline configs
├── docs/                       # design docs, decisions, session logs
│   ├── STATE.md                # ← live state (start here)
│   ├── discussion/             # session-by-session journal
│   ├── decisions/              # ADRs for major decisions
│   └── templates/              # evidence / failure / retro templates
├── apps/                       # reserved for Phase 3+
├── evidence/                   # rule A audit evidence (committed; created at impl. time)
├── failures/                   # rule B failure archive (committed; created at impl. time)
└── data/                       # runtime pipeline products — gitignored
    └── <cert_id>/runs/<run_id>/
        ├── raw/ ocr/ classified/ cleaned/
        ├── structured/ glossary/ translated/
        └── output/             # released via GitHub Release + git tag
```

---

## Documentation map

| If you want… | Read this |
|---|---|
| Project status right now | **`docs/STATE.md`** |
| Why a decision was made | search `D-NNN` in `docs/discussion/`, or read the ADR in `docs/decisions/` |
| Discussion history | `docs/discussion/` (one file per session) |
| Operating principles | `docs/discussion/README.md` (D-027) |
| ADR conventions | `docs/decisions/README.md` (D-029) |
| Evidence / failure / retro templates | `docs/templates/` (D-030 / D-032 / D-033) |

---

## Engineering discipline (Tier 3)

This project follows four hard rules from the maintainer's `~/.claude/CLAUDE.md`:

| Rule | What it requires |
|------|------------------|
| **A — Semantic audit** | Any pipeline step with > 50 % compression or rewrite must be sample-audited (N samples, recorded under `evidence/`). |
| **B — Failure archival** | Every failed attempt is preserved under `failures/<stage>/<attempt-id>.md`, never deleted. |
| **C — Retrospective** | Each Phase ends with a `RETROSPECTIVE.md`. |
| **D — Writer/reviewer separation** | Writer agent and reviewer agent are different `subagent_type`s. No same-context self-review. |

---

## Reading guide for new contributors / new Claude sessions

1. **30 seconds:** `docs/STATE.md`
2. **5 minutes:** `docs/discussion/2026-05-06-session-01.md` (project genesis + Phase 1 architecture)
3. **5 minutes:** `docs/discussion/2026-05-06-session-02.md` (repo layout + tooling decisions)
4. **As needed:** ADRs in `docs/decisions/`

The repo also contains a project-level **`CLAUDE.md`** at the root — instructions specific to Claude Code working sessions in this repo.

---

## License

License is **deferred** until Phase 1 has runnable code (anticipated: MIT).

The targeted textbook *itself* is © its publisher and author — only **bibliographic references** appear in this repository. **No raw textbook content** is committed to git history (see `.gitignore` + D-045 in `docs/discussion/2026-05-06-session-02.md`).

---

## Author

Maintained by the project owner — feedback / questions welcome via GitHub Issues once code lands.
