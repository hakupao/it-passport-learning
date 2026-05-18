# docs/

Project documentation, decisions, and session history. **Authoritative state lives in `STATE.md`** — always read it first.

---

## Read order (cold start)

1. **[`STATE.md`](STATE.md)** — live state snapshot. Where things stand right now, what's locked, what's open, where to resume.
2. Most recent **[`discussion/YYYY-MM-DD-session-NN.md`](discussion/)** — what happened in the latest working session.
3. **[`decisions/`](decisions/)** — only the ADRs relevant to your current question.

---

## Contents

| Path | Role |
|---|---|
| [`STATE.md`](STATE.md) | **Live state truth source** (D-028). Top row rewritten end of every session per D-027 §5. |
| [`decisions/`](decisions/) | Standalone Architecture Decision Records (ADRs) per D-029. **22 ADRs** at last count (D-005 / D-008 / D-013 / D-021 / D-022 / D-023 / D-024 / D-029 / D-058 / D-061 / D-063 / D-065 / D-069 / D-071 / D-073 / D-077 / D-078 / D-079 / D-080 / D-081 / D-082 + index README). Total D-NNN locked = **82**; minor ones live as one-liners in session logs. |
| [`discussion/`](discussion/) | Append-only session logs (D-019 slow-pace journals). **23 sessions** at last count, named `YYYY-MM-DD-session-NN.md`. |
| [`release-notes/`](release-notes/) | Hand-written release intros for `release.compose_notes()` (D-081 §2.3). One file per published release (`itpassport-r6-v1.0.0-intro.md`, `itpassport-r6-v1.0.2-intro.md`). |
| [`templates/`](templates/) | Templates for evidence, failure archives, retrospectives (D-030 / D-032 / D-033). Copy when starting a new entry. |

---

## Conventions

- **Live state vs historical journal** — `STATE.md` is the live snapshot; `discussion/` is append-only history. If they disagree, `STATE.md` wins per D-028.
- **Decision IDs (`D-NNN`)** — globally monotonic, never reused. Major decisions get a standalone ADR file (D-029); minor decisions are one-line entries in session logs.
- **Open Questions (`OQ-NN`)** — every unresolved item gets an ID (D-027 §2) and lives in `STATE.md` §4 until closed.
- **Decision-on-lock writeback** (D-027 §1) — when a `D-NNN` locks, the lock is written to the current session log + `STATE.md` the same turn.

---

## Phase status (at glance — see `STATE.md` for the truth)

| Phase | Status |
|---|---|
| Phase 1 | ✅ DONE — v1.0.0 + v1.0.2 GitHub Releases published, RETROSPECTIVE.md FINAL with §8/§9 addenda |
| Phase 2 | brainstorm gate open — entry = OQ-05 + RETROSPECTIVE §5.5 carry-forward + post-pub validation discoveries |
| Phase 3+ | not yet designed |

---

## See also

- Root [`README.md`](../README.md) — 3-audience landing
- [`../RETROSPECTIVE.md`](../RETROSPECTIVE.md) — Phase 1 retro (Rule C) with iter-5..8 addenda
- [`../evidence/`](../evidence/) — Rule-A semantic audit evidence per run
- [`../failures/`](../failures/) — Rule-B failed-attempt archive per stage
- [`../validation/`](../validation/) — post-publication deep validation chain (iter-3..8)
