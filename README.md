# IT Passport — Trilingual Learning Content + `cert-extractor`

[![Phase 1](https://img.shields.io/badge/Phase%201-%E2%9C%85%20DONE-brightgreen)](docs/STATE.md)
[![Latest release](https://img.shields.io/badge/release-v1.0.2-blue)](https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.2)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://www.python.org/)
[![Audit](https://img.shields.io/badge/full--corpus-100%25-success)](RETROSPECTIVE.md#9-post-publication-validation-addendum)
[![License](https://img.shields.io/badge/license-pending-lightgrey)](#license)

> A single Japanese **IT パスポート** (Reiwa 6) certification textbook → a structured, trilingual (**JP / ZH / EN**) study dataset.
> Pipeline: **`cert-extractor`** (Mistral OCR → Claude structure → Claude translation → dual-gate audit → GitHub Release).
>
> 🇨🇳 [中文版 README](README.zh-CN.md)

---

## Choose your path

### 🎓 I'm here to **learn** the IT Passport exam

Go straight to **[Releases](https://github.com/hakupao/it-passport-learning/releases)** and grab the latest trilingual bundle.

| What | Where |
|---|---|
| **Latest content** | [`itpassport-r6-v1.0.2`](https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.2) — 554 pages, 2 224 entities, 6 059 trilingual leaves, 908-term glossary, ~736 post-pub corrections |
| Original | [`itpassport-r6-v1.0.0`](https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.0) — kept immutable |
| How to read | `index.json` → `pages/page_NNN.json` (or `.md`) → `glossary.json` — see `output/README.md` inside the zip |

Every term carries a `{jp, zh, en}` triple. Every katakana-only IT term carries a `kana_helper = {surface, reading, zh_concept}` so non-native readers map kana → concept in one glance. That's the whole reason this exists.

### 💻 I'm a **developer** and want to use `cert-extractor`

`cert-extractor` is cert-agnostic by design (D-010) — the same pipeline is meant to onboard any cert.

- Tour: **[`packages/extractor/README.md`](packages/extractor/README.md)**
- Architecture: 4 pluggable axes (source / OCR / translator / exporter) per [D-021](docs/decisions/)
- Stages: 8 (unpack → OCR → classify → re-OCR → structure → glossary → translate → audit → export) per [D-008](docs/decisions/)

```bash
# clone, install, run tests
git clone https://github.com/hakupao/it-passport-learning
cd it-passport-learning
uv sync
uv run pytest packages/extractor/tests/
```

To onboard a new certification: drop the source EPUB/PDF into `.source/`, write `pipelines/<cert_id>.yaml`, and run the same `cert-extractor` CLI. Runtime data lands at `data/<cert_id>/runs/<run_id>/<stage>/`.

### 🔬 I'm a **researcher** / **future me** stepping into Phase 2

| First read | Why |
|---|---|
| **[`docs/STATE.md`](docs/STATE.md)** | Live state — what's locked, what's open, where to resume |
| [`RETROSPECTIVE.md`](RETROSPECTIVE.md) | Phase 1 retro, including §8 (iter-5+6) + §9 (iter-7+8) post-publication validation addenda |
| [`docs/decisions/`](docs/decisions/) | 82 locked ADRs (D-001 … D-082) — the project's institutional memory |
| [`validation/`](validation/) | The ~80-agent / 9-subagent-type / 100%-coverage post-publication validation chain that took v1.0.0 → v1.0.2 |

Phase 2 brainstorm is the next user-triggered session — entry point listed in `STATE.md` §5 "下一会话".

---

## What this project is (the long version)

Non-native learners of Japanese-language technical exams are blocked by **kana / kanji recognition**, not by concepts. CPU, TCP/IP, ROI are already known. `アクセシビリティ → accessibility → 可访问性`, seen once, sticks.

So Phase 1 built **a pipeline (`cert-extractor`)** and **shipped a trilingual dataset** from one IT パスポート Reiwa 6 textbook. Every chapter, term, table, and practice question carries `{jp, zh, en}` renderings with kana-helper annotations.

The source textbook is acknowledged as input only — its raw content is **not** redistributed (see [License](#license)).

---

## Phase status

| Phase | Status | Notes |
|---|---|---|
| **Phase 1 — Trilingual content factory** | ✅ DONE | `cert-extractor` shipped + v1.0.0 + v1.0.2 published. RETROSPECTIVE.md FINAL with §8/§9 addenda. |
| **Phase 2 — Personal study tool** | brainstorm gate open | Entry = OQ-05 + RETROSPECTIVE §5.5 carry-forward + 15 systemic patterns from iter-5..8 |
| Phase 3 — Web app / question bank | not yet designed | — |
| Phase 4 — AI study assistant | not yet designed | — |
| Phase 5 — `cert-extractor` as general framework | not yet designed | — |

---

## Repository tour

```
.
├── README.md / README.zh-CN.md      this file (D-082 v2 landing)
├── CLAUDE.md / AGENTS.md            session-tool context (D-049)
├── RETROSPECTIVE.md                 Phase 1 retro + §8/§9 addenda (Rule C)
├── pyproject.toml / uv.lock         uv workspace root (D-036/037/038)
├── .source/                         🟦 gitignored input artifacts (D-082) — EPUB lives here
├── packages/extractor/              🟢 the cert-extractor package — see its README
├── apps/                            reserved for Phase 3+ (D-038)
├── docs/                            📚 STATE / decisions (ADRs) / discussion / release-notes / templates
├── evidence/                        Rule-A audit evidence per run
├── failures/                        Rule-B failed-attempt archive
├── validation/                      post-publication deep validation chain (iter-3..8)
└── data/                            🟦 gitignored runtime data (D-050)
```

Each tracked subdir has its own `README.md` describing what lives there.

---

## Build provenance (Phase 1 numbers)

| Metric | Value |
|---|---|
| Pipeline run | `dry_run_2026-05-12T13-23-19` (canonical for both v1.0.0 + v1.0.2) |
| Source corpus | IT パスポート Reiwa 6 — 579 source pages → 554 emitted |
| Output | 2 224 entities / 6 059 trilingual leaves / 908-term glossary |
| Test suite | 492 unit + integration |
| Cost | **Mistral $0.58 billed** / Anthropic $0 billed (max-plan OAuth per D-069) |
| Post-pub corrections (iter-3..8) | ~736 JSON edits + 46 MD regens, 38 fix IDs, **$0 LLM billed** |
| Rule-D subagent diversity | **9** types (code-reviewer / analyst / verifier / critic / scientist / tracer / executor / architect / qa-tester) |

---

## License

- **Code, pipeline, ADRs, release artifacts** — License: pending (will be a permissive OSS license; consult repo owner before redistribution).
- **Source textbook** — Not redistributed. Title and author intentionally omitted from artifacts (per the project's privacy convention 2026-05-17). You must legally acquire the EPUB separately and place it at `.source/IT-Passport.epub` if you want to re-run the pipeline.
- **Generated trilingual content** — Released under the GitHub Release; same redistribution caveats apply (derived from copyrighted source, intended for personal-study use and as a methodology demonstration).

---

## Getting in touch / contributing

This is a personal Tier-3 R&D project. Issues + PRs welcome but expect a slow-pace D-019 review cadence. Read [`docs/STATE.md`](docs/STATE.md) and the most recent session log before opening anything substantive.
