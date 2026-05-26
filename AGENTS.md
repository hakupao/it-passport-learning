# AGENTS.md — IT Passport Learning project instructions

> Project-specific guidance for any Codex / Codex session working in this repo.
>
> This file does **not** repeat the maintainer's global `~/.Codex/AGENTS.md`. It only contains repo-local rules.

---

## Start here, every session

1. Read **`docs/STATE.md`** first. It is the live state truth source — current phase, locked decisions count, open questions, where to resume.
2. Read the most recent session log under `docs/discussion/YYYY-MM-DD-session-NN.md` § "What's Next".
3. Then proceed.

You will be lost without these. Don't skip them.

---

## What this project is

A trilingual (ja/zh/en) learning web app + AI textbook pipeline for the IT Passport (ITパスポート) certification exam.

- **Web app**: Next.js 15 at `apps/web/` — quiz, glossary, chat, AI tutor
- **Phase 5**: IPA 官方源 → Claude vision 提取 → AI 生成三语教科書
- **Tech stack**: TypeScript only (D-110). No Python.

See `docs/STATE.md` for current state; `docs/phase5/PLAN.md` for the active plan.

---

## Workflow tier

**Tier 3** (multi-day, high-stakes, full traceability). Every step writes evidence:

- `docs/discussion/YYYY-MM-DD-session-NN.md` — session journal (append-only)
- `docs/STATE.md` — live state snapshot (rewritten end of every session)
- `docs/decisions/D-NNN-*.md` — ADRs for major decisions
- `evidence/` — semantic audit (Rule A)
- `failures/` — failure archive (Rule B)
- `RETROSPECTIVE_phaseN.md` — Phase retro (Rule C)

---

## Hard rules

| Rule | One-liner |
|------|---|
| **A** | > 50% compression / rewrite ⇒ N-sample independent audit ⇒ evidence under `evidence/` |
| **B** | Failed attempts archived to `failures/`, never deleted |
| **C** | Phase ends with `RETROSPECTIVE.md` |
| **D** | Writer agent ≠ Reviewer agent (different `subagent_type`s, no self-review) |

---

## Discussion / decision protocol (D-027)

1. **Decision-on-lock writeback** — when a `D-NNN` is agreed, write to current session log **the same turn**.
2. **Open-question registration** — every unresolved item gets an `OQ-NN` ID and is filed immediately.
3. **State sync on change** — when an OQ closes / a D supersedes / phase status changes, update `docs/STATE.md` the **same turn**.
4. **Live state vs historical journal** — session logs are append-only history; `docs/STATE.md` is the live snapshot. Read STATE first.
5. **Pre-close self-check** — before a session ends, declare and demonstrate "all D / OQ / state changes are on disk".

---

## Discussion pace (D-019)

**Slow pace (3a)**. For each new topic, Codex poses 2-4 open questions to the user *before* proposing a solution. The user thinks, replies, and only then Codex proposes. This is non-negotiable for design topics.

When the user explicitly says "you decide" / "你来定" for a sub-question, Codex:

1. Consults authoritative docs (Context7 / official docs / RFC) — do **not** rely on memory alone.
2. Locks one or more `D-NNN` with explicit reasoning.
3. Lists rejected alternatives with reasons.
4. Writes back to session log + STATE.md the same turn.

---

## Phase / stage signaling

| If `docs/STATE.md` says... | Behavior |
|---|---|
| "**设计阶段**" | Do **not** write executable code. Only design docs / discussion / decisions. |
| "**实施阶段**" | Code is allowed under TDD; respect Tier 3 evidence requirements. |

When in doubt, read STATE.md and ask the user.

---

## Decision IDs

- `D-NNN` is globally monotonic across sessions, **never reused**.
- Major decisions (Phase boundary / irreversible / high-stakes / architectural) get a standalone ADR in `docs/decisions/D-NNN-slug.md` (D-029).
- Minor decisions live as one-line entries in the session log only.

---

## Repo layout (D-111, restructured Session 63)

- `apps/web/` = Next.js 15 app (sole pnpm workspace member).
- `scripts/` = Phase 5 extraction scripts (TypeScript).
- `docs/` = STATE.md + active decisions (D-082+) + active session logs (53+) + `archive/` for historical docs.
- `data/` = pipeline data (**gitignored**). Final output via GitHub Release + git tag.
- `evidence/`, `failures/`, `RETROSPECTIVE*.md` are **committed** (Rules A/B/C).

---

## What you should NOT do without explicit user approval

- Push, force-push, or rebase published history.
- Create / modify GitHub releases or issues without confirmation.
- Delete files under `failures/` or `evidence/` (Rules A + B forbid).
- Unilaterally close `OQ-NN` items — the user must agree.

---

## When you are confused

- If `docs/STATE.md` and a session log disagree, **STATE.md wins** (D-028). Then update the session log to match in a follow-up correction commit.
- If a memory tells you something but the file says otherwise, **trust the file**. Memory may be stale.
- If you cannot tell whether a decision is locked, search session logs for `D-NNN` mentions and read the chronologically latest occurrence.
